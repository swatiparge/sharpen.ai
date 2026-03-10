"""
InterviewOS AI Analysis Service
FastAPI server that orchestrates the full audio analysis pipeline.

Pipeline: Audio → AssemblyAI (transcription + diarization) → QA Extraction → Scoring → Report
Two APIs. Two keys. Everything covered.
"""

import os
import traceback
import uuid
import shutil
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline.transcriber import transcribe_and_diarize
from pipeline.qa_extractor import extract_qa_pairs
from pipeline.scorer import score_all_answers
from pipeline.report_builder import build_report

load_dotenv()

app = FastAPI(
    title="InterviewOS AI Service",
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
    patterns: list
    roadmap: list


class TextAnalyzeRequest(BaseModel):
    text: str
    analysis_type: str = "reconstruction"
    metadata: dict = {}


# ── Health Check ─────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "InterviewOS AI Service",
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

        # ── Build response (backward-compatible with backend worker) ──
        transcript_output = [
            {
                "speaker": turn.speaker,
                "text": turn.text,
                "start_ms": int(turn.start_time * 1000),
                "end_ms": int(turn.end_time * 1000),
            }
            for turn in transcript.turns
        ]

        # Convert per-answer metric scores to the metric dict format the backend expects
        metrics_dict = {}
        for metric_id, avg_score in report.metric_averages.items():
            metrics_dict[metric_id] = {
                "score": avg_score,
                "explanation": f"Average score across {len(analyses)} answers",
                "examples": [],
            }

        # Build patterns from weaknesses
        patterns = [
            {
                "type": "WEAKNESS",
                "title": weakness,
                "description": f"Recurring weakness identified across answers",
                "severity": "MEDIUM",
                "impact": "May affect interview outcome",
            }
            for weakness in report.recurring_weaknesses
        ]

        # Build roadmap from priority improvements
        roadmap = []
        if report.priority_improvements:
            roadmap.append({
                "week_label": "Week 1-2",
                "theme": "Priority Improvements",
                "tasks": [f"Work on improving {imp}" for imp in report.priority_improvements],
            })

        result = AnalyzeResponse(
            overall_score=report.overall_score,
            summary=report.level_gap_summary,
            badge=_score_to_badge(report.overall_score),
            vocal_signals={},  # No spaCy metrics — LLM handles analysis
            metrics=metrics_dict,
            transcript=transcript_output,
            patterns=patterns,
            roadmap=roadmap,
        )

        print(f"\n{'='*60}")
        print(f"[Pipeline] ✅ Analysis complete for interview {session_id}")
        print(f"   Score: {result.overall_score}/10 | Badge: {result.badge}")
        print(f"   QA Pairs: {len(qa_pairs)} | Metrics: {len(result.metrics)}")
        print(f"{'='*60}\n")

        return result

    except Exception as e:
        print(f"[Pipeline] ❌ Analysis failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── Text-only analysis endpoint (for reconstruction/simulation) ──

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
            "patterns": [
                {"type": "WEAKNESS", "title": w, "description": "Recurring weakness",
                 "severity": "MEDIUM", "impact": "May affect interview outcome"}
                for w in report.recurring_weaknesses
            ],
            "roadmap": [
                {"week_label": "Week 1-2", "theme": "Priority Improvements",
                 "tasks": [f"Work on improving {imp}" for imp in report.priority_improvements]}
            ] if report.priority_improvements else [],
        }

    except Exception as e:
        print(f"[TextAnalysis] ❌ Failed: {e}")
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
