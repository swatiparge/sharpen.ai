"""
sharpen.ai AI Analysis Service
FastAPI server that orchestrates the full audio analysis pipeline.

Pipeline: Audio → AssemblyAI (transcription + diarization) → QA Extraction → Scoring → Report
Two APIs. Two keys. Everything covered.
"""

import os
import traceback
import uuid
import shutil
import hashlib
import json
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline.transcriber import transcribe_and_diarize
from pipeline.qa_extractor import extract_qa_pairs
from pipeline.scorer import score_all_answers
from pipeline.report_builder import build_report
from pipeline.learn_generator import generate_topic_lesson
from models.qa import QAPair

load_dotenv()

app = FastAPI(
    title="sharpen.ai AI Service",
    description="AI pipeline for interview audio analysis using AssemblyAI + NVIDIA NIM (Qwen 3.5)",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Request / Response Models ────────────────────────────────────

class AnalyzeRequest(BaseModel):
    audio_url: str                  # Presigned S3 GET URL for the audio
    interview_id: str
    metadata: dict = {}             # role, level, company, round, etc.


class AnalyzeResponse(BaseModel):
    overall_score: float
    summary: str
    badge: str
    vocal_signals: dict
    metrics: dict
    transcript: list
    top_strengths: list = []
    key_improvement_areas: list = []
    prompt_tokens: int = 0
    completion_tokens: int = 0


class ReconstructionRequest(BaseModel):
    interview_id: str
    qa_pairs: list[QAPair]
    metadata: dict = {}

class GenerateLessonRequest(BaseModel):
    topic: str



def _format_analysis_result(report, analyses, transcript_output: list) -> AnalyzeResponse:
    """Helper to convert a report and analyses into an AnalyzeResponse."""
    
    metrics_dict: dict = {}
    for metric_id, avg_score in report.metric_averages.items():
        all_tips: list[str] = []
        all_examples: list[dict] = []
        
        for analysis in analyses:
            for ms in analysis.metrics:
                if ms.metric_id != metric_id or not ms.is_relevant:
                    continue
                
                if ms.rationale or ms.evidence_quote:
                    label = "STRONG EXAMPLE" if (ms.score or 0) >= 7.0 else "MISSED OPPORTUNITY"
                    comment = ms.rationale if ms.rationale else f"Based on: \"{ms.evidence_quote}\""
                    
                    all_examples.append({
                        "label": label,
                        "text": comment,
                        "question_text": analysis.qa_pair.question,
                        "segment_text": ms.evidence_quote
                    })

                for tip in (ms.tips or []):
                    if tip and tip not in all_tips:
                        all_tips.append(tip)

        if all_tips:
            explanation = " | ".join(all_tips[:4])
        else:
            explanation = f"Analysis based on {len(analyses)} answers."

        metrics_dict[metric_id] = {
            "score": avg_score,
            "explanation": explanation,
            "examples": all_examples[:6],
        }

    return AnalyzeResponse(
        overall_score=report.overall_score,
        summary=report.level_gap_summary,
        badge=_score_to_badge(report.overall_score),
        vocal_signals={},
        metrics=metrics_dict,
        transcript=transcript_output,
        top_strengths=report.top_strengths,
        key_improvement_areas=report.key_improvement_areas,
        prompt_tokens=report.prompt_tokens,
        completion_tokens=report.completion_tokens
    )


class TextAnalyzeRequest(BaseModel):
    text: str
    analysis_type: str = "reconstruction"  # 'reconstruction' or 'simulation'
    metadata: dict = {}


class ReconstructionRequest(BaseModel):
    interview_id: str
    qa_pairs: list[QAPair]
    metadata: dict = {}


# ── Health Check ─────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "sharpen.ai AI Service",
        "version": "2.0.0",
        "providers": {
            "transcription": "AssemblyAI",
            "llm": "NVIDIA NIM (Qwen 3.5)",
        },
    }


# ── Main Analysis Endpoint (called by Node.js backend) ──────────

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_audio(req: AnalyzeRequest):
    """
    Full analysis pipeline:
    1. AssemblyAI: Transcription + Speaker Diarization
    2. NVIDIA NIM: Extract QA pairs from transcript
    3. NVIDIA NIM: Score each answer on 8 metrics
    4. Aggregate scores into final report
    """
    try:
        session_id = req.interview_id

        print(f"\n{'='*60}")
        print(f"[Pipeline] Starting analysis for interview {session_id}")
        print(f"{'='*60}")

        # ── Step 1: Transcription + Diarization (AssemblyAI) ─────
        print(f"[Pipeline] Step 1/4: Transcribing audio and detecting speakers...")
        transcript = transcribe_and_diarize(req.audio_url, session_id)
        
        # ── Step 1.5: Detailed Analysis Cache Check ─────────────
        # If the same audio is analyzed with the SAME metadata, return cached result.
        audio_hash = transcript.audio_hash
        metadata_str = f"{req.metadata.get('current_role', '')}|{req.metadata.get('target_level', '')}|{req.metadata.get('company', '')}|{req.metadata.get('round', '')}"
        metadata_hash = hashlib.sha256(metadata_str.encode()).hexdigest()[:12]
        
        project_root = os.path.dirname(os.path.abspath(__file__))
        analysis_cache_path = os.path.join(project_root, "cache", f"analysis_{audio_hash}_{metadata_hash}.json")
        
        if os.path.exists(analysis_cache_path):
            print(f"[Pipeline] ⚡ Found cached analysis result, bypassing LLM pipeline!")
            with open(analysis_cache_path, "r") as f:
                return json.load(f)

        print(f"[Pipeline] ✅ Step 1/4: Transcription complete ({len(transcript.turns)} utterances)")

        # ── Step 2: Extract QA pairs (NVIDIA NIM) ────────────────
        print(f"[Pipeline] Step 2/4: Extracting questions and answers...")
        qa_pairs = extract_qa_pairs(transcript)
        print(f"[Pipeline] ✅ Step 2/4: Extracted {len(qa_pairs)} QA pairs")

        # ── Step 3: Score each answer (NVIDIA NIM) ───────────────
        job_role = req.metadata.get("current_role", "")
        interview_round = req.metadata.get("round", "")
        experience_level = req.metadata.get("target_level", "")
        company = req.metadata.get("company", "")

        print(f"[Pipeline] Step 3/4: Analyzing {len(qa_pairs)} answers...")
        analyses = score_all_answers(
            qa_pairs, job_role, interview_round, experience_level, company
        )
        print(f"[Pipeline] ✅ Step 3/4: All answers scored")

        # ── Step 4: Build report ─────────────────────────────────
        print(f"[Pipeline] Step 4/4: Building performance report...")
        session_data = {
            "session_id": session_id,
            "job_role": job_role,
            "interview_round": interview_round,
            "experience_level": experience_level,
            "company": company,
        }
        report = build_report(session_data, analyses)
        print(f"[Pipeline] ✅ Step 4/4: Report complete")

        # ── Build response ──
        transcript_output = [
            {
                "speaker": turn.speaker,
                "text": turn.text,
                "start_ms": int(turn.start_time * 1000),
                "end_ms": int(turn.end_time * 1000),
            }
            for turn in transcript.turns
        ]

        result = _format_analysis_result(report, analyses, transcript_output)
        
        # ── Step 5: Cache the final result ───────────────────────
        try:
            with open(analysis_cache_path, "w") as f:
                json.dump(result.dict(), f)
            print(f"[Pipeline] Saved analysis result to cache: {os.path.basename(analysis_cache_path)}")
        except Exception as e:
            print(f"[Pipeline] Warning: Failed to cache analysis result: {e}")

        print(f"\n{'='*60}")
        print(f"[Pipeline] ✅ Analysis complete for interview {session_id}")
        return result

    except Exception as e:
        print(f"[Pipeline] ❌ Analysis failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── Text-only analysis endpoint (for reconstruction/simulation) ──

@app.post("/analyze-reconstruction")
async def analyze_reconstruction(req: ReconstructionRequest):
    """
    Dedicated endpoint for reconstructed interviews.
    Receives structured QA pairs from the frontend via backend worker.
    """
    try:
        session_id = req.interview_id
        job_role = req.metadata.get("current_role", "")
        experience_level = req.metadata.get("target_level", "")
        company = req.metadata.get("company", "")
        interview_round = req.metadata.get("round", "")

        print(f"\n{'='*60}")
        print(f"[Pipeline] Starting RECONSTRUCTION analysis for interview {session_id}")
        print(f"{'='*60}")

        # Step 1: Score each answer
        analyses = score_all_answers(
            req.qa_pairs, job_role, interview_round, experience_level, company
        )

        # Step 2: Build report
        session_data = {
            "session_id": session_id,
            "job_role": job_role,
            "interview_round": interview_round,
            "experience_level": experience_level,
            "company": company,
        }
        report = build_report(session_data, analyses)

        # Step 3: Format response
        result = _format_analysis_result(report, analyses, []) # Empty transcript for reconstruction
        
        print(f"[Pipeline] ✅ Reconstruction analysis complete for interview {session_id}")
        return result

    except Exception as e:
        print(f"[Pipeline] ❌ Reconstruction analysis failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-text")
async def analyze_text(req: TextAnalyzeRequest):
    """
    Text-only analysis for reconstructed interviews and simulations.
    Skips audio pipeline, goes directly to LLM scoring via NVIDIA NIM.
    """
    try:
        from pipeline.qa_extractor import _get_client
        from models.transcript import Transcript, SpeakerTurn

        # Create a synthetic transcript from Q&A text
        transcript = Transcript(
            session_id="text-analysis",
            turns=[SpeakerTurn(speaker="CANDIDATE", start_time=0, end_time=0, text=req.text)],
            candidate_text_only=req.text,
        )

        qa_pairs = extract_qa_pairs(transcript)

        job_role = req.metadata.get("current_role", "")
        experience_level = req.metadata.get("target_level", "")

        analyses = score_all_answers(qa_pairs, job_role, "", experience_level)

        session_data = {
            "session_id": "text-analysis",
            "job_role": job_role,
            "interview_round": "",
            "experience_level": experience_level,
            "company": "",
        }
        report = build_report(session_data, analyses)

        # Return in format compatible with backend
        metrics_dict = {}
        for metric_id, avg_score in report.metric_averages.items():
            metrics_dict[metric_id] = {
                "score": avg_score,
                "explanation": f"Average score across {len(analyses)} answers",
                "examples": [],
            }

        return {
            "overall_score": report.overall_score,
            "summary": report.level_gap_summary,
            "badge": _score_to_badge(report.overall_score),
            "vocal_signals": {},
            "metrics": metrics_dict,
            "transcript": [],
            "top_strengths": report.top_strengths,
            "key_improvement_areas": report.key_improvement_areas
        }

    except Exception as e:
        print(f"[TextAnalysis] ❌ Failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-lesson")
async def generate_lesson(req: GenerateLessonRequest):
    try:
        print(f"\n{'='*60}")
        print(f"[Learn] Generating lesson for topic: {req.topic}")
        lesson = generate_topic_lesson(req.topic)
        print(f"[Learn] ✅ Lesson generated successfully")
        return lesson
    except Exception as e:
        print(f"[Learn] ❌ Lesson generation failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── Helpers ──────────────────────────────────────────────────────

def _score_to_badge(score: float) -> str:
    """Convert overall score to a human-readable badge."""
    if score >= 9.0:
        return "Exceptional performer"
    elif score >= 7.5:
        return "Strong candidate"
    elif score >= 6.0:
        return "Solid performance"
    elif score >= 4.0:
        return "Developing skills"
    else:
        return "Needs improvement"


# ── Run server ───────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
