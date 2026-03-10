# InterviewOS — AI Stack Reference Guide v2
> For AI coding agents. Read this entire file before writing any code.
> Two APIs. Two keys. Everything covered.

---

## 1. Final Stack Overview

```
Audio File (uploaded by user)
        │
        ▼
┌─────────────────────────┐
│      AssemblyAI API      │  ← API Key 1
│  • Transcription         │
│  • Speaker Diarization   │
│  • Returns labeled turns │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│   NVIDIA NIM API         │  ← API Key 2
│  • QA Pair Extraction    │
│  • Answer Scoring        │
│  • Report Generation     │
│  • Level Gap Summary     │
│  Model: Qwen 3.5 397B    │
└─────────────────────────┘
        │
        ▼
   Structured Report
   (scores, quotes, tips)
```

**No local models. No GPU server. No self-hosting. Just two API keys.**

---

## 2. Environment Variables

```env
# .env — never commit this file

# AssemblyAI — get free key at assemblyai.com
ASSEMBLYAI_API_KEY=your_assemblyai_key_here

# NVIDIA NIM — get free key at build.nvidia.com
NVIDIA_API_KEY=nvapi-your_nvidia_key_here

# App config
MAX_AUDIO_FILE_SIZE_MB=100
SUPPORTED_AUDIO_FORMATS=mp3,wav,m4a,ogg,webm,mp4
```

---

## 3. How to Get API Keys

### AssemblyAI (Transcription + Speaker Diarization)
1. Go to **assemblyai.com**
2. Sign up for free account
3. Dashboard → API Keys → Copy key
4. Free tier: **$50 in credits** (~290 interviews free)
5. After free tier: ~$0.17 per interview (transcription + diarization)

### NVIDIA NIM (Qwen 3.5 — Scoring + Analysis)
1. Go to **build.nvidia.com**
2. Sign up / Login
3. Any model page → click **"Get API Key"**
4. Free tier: **1000 API calls free** on signup
5. After free tier: pay per token (very cheap)

---

## 4. NVIDIA NIM — Model Options

All models below use the **same API code** — just swap the model name string.

| Model ID | Size | Best For | Speed |
|---|---|---|---|
| `qwen/qwen3.5-397b-a17b` | 397B | Best quality scoring, nuanced analysis | Slower |
| `nvidia/llama-3.3-nemotron-super-49b-v1` | 49B | Fast + accurate, good for production | Fast |
| `nvidia/llama-3.1-nemotron-ultra-253b-v1` | 253B | Complex reasoning, highest accuracy | Slowest |
| `qwen/qwen2.5-72b-instruct` | 72B | Good balance of speed and quality | Medium |

**Recommended:** Use `qwen/qwen3.5-397b-a17b` for development and testing.
**Production fallback:** Switch to `nvidia/llama-3.3-nemotron-super-49b-v1` if rate limits hit.

### Nemotron vs Qwen — Which to Use?

```
Qwen 3.5 397B   → Better for language nuance, interview scoring, 
                   understanding context in answers. USE THIS.

Nemotron Ultra  → Better for math, code, multi-step reasoning.
                   Overkill for interview analysis.

Nemotron Super  → Good production fallback when you need speed.
```

---

## 5. Python Dependencies

```txt
# requirements.txt

assemblyai>=0.30.0
openai>=1.30.0          # used to call NVIDIA NIM (OpenAI-compatible)
fastapi>=0.111.0
uvicorn>=0.30.0
python-multipart>=0.0.9
pydantic>=2.7.0
python-dotenv>=1.0.0
httpx>=0.27.0
```

```bash
pip install -r requirements.txt
```

---

## 6. Data Models

```python
# models/interview.py
from pydantic import BaseModel
from enum import Enum
from typing import Optional

class JobRole(str, Enum):
    FRONTEND   = "frontend"
    BACKEND    = "backend"
    FULLSTACK  = "fullstack"
    PM         = "product_manager"
    DESIGNER   = "ux_designer"
    DEVOPS     = "devops"
    DATA       = "data_engineer"
    ML         = "ml_engineer"
    QA         = "qa_engineer"
    OTHER      = "other"

class InterviewRound(str, Enum):
    TECHNICAL     = "technical"
    SYSTEM_DESIGN = "system_design"
    BEHAVIORAL    = "behavioral"
    HR            = "hr"
    MANAGER       = "manager"

class ExperienceLevel(str, Enum):
    JUNIOR = "0-2"
    MID    = "2-5"
    SENIOR = "5-10"
    STAFF  = "10+"

class InterviewSession(BaseModel):
    session_id:       str
    job_role:         JobRole
    interview_round:  InterviewRound
    experience_level: ExperienceLevel
    audio_file_path:  str
    company:          Optional[str] = None
```

```python
# models/transcript.py
from pydantic import BaseModel

class SpeakerTurn(BaseModel):
    speaker:    str    # "INTERVIEWER" or "CANDIDATE"
    start_time: float  # seconds
    end_time:   float
    text:       str

class Transcript(BaseModel):
    session_id:          str
    turns:               list[SpeakerTurn]
    candidate_text_only: str  # all candidate speech joined
```

```python
# models/qa.py
from pydantic import BaseModel
from typing import Optional

class QAPair(BaseModel):
    question_number:  int
    question:         str
    answer:           str
    follow_ups:       list[str] = []
    follow_up_answers: list[str] = []
    topic:            Optional[str] = None
```

```python
# models/report.py
from pydantic import BaseModel
from typing import Optional

class MetricScore(BaseModel):
    metric_id:        str
    metric_name:      str
    score:            float          # 1.0 to 10.0
    label:            str            # Weak / Developing / Solid / Strong / Exceptional
    evidence_quote:   str            # verbatim quote from candidate's answer
    what_went_wrong:  Optional[str]  # specific issue if score < 7
    improved_version: Optional[str]  # rewritten answer showing improvement
    tips:             list[str]      # 2-3 actionable tips

class AnswerAnalysis(BaseModel):
    qa_pair:             QAPair
    metrics:             list[MetricScore]
    overall_answer_score: float
    summary:             str

class InterviewReport(BaseModel):
    session_id:           str
    job_role:             str
    interview_round:      str
    experience_level:     str
    company:              Optional[str]
    overall_score:        float
    metric_averages:      dict[str, float]
    answer_analyses:      list[AnswerAnalysis]
    recurring_weaknesses: list[str]
    strongest_areas:      list[str]
    priority_improvements: list[str]
    level_gap_summary:    str
```

---

## 7. The 10 Scoring Metrics

```python
# config/metrics.py

METRICS = [
    {
        "id": "communication_clarity",
        "name": "Communication Clarity",
        "description": "How clearly and concisely the candidate expresses ideas",
        "good_signals": [
            "Short, direct sentences",
            "Avoids rambling",
            "Uses precise vocabulary",
            "Easy to follow logical flow"
        ],
        "bad_signals": [
            "Excessive filler words (um, uh, like, you know)",
            "Repeats the same point multiple times",
            "Overly complex sentences that obscure meaning"
        ]
    },
    {
        "id": "structural_thinking",
        "name": "Structural Thinking",
        "description": "Whether the candidate organizes their answer with a clear framework",
        "good_signals": [
            "Uses STAR method for behavioral questions",
            "Frames the problem before jumping to solution",
            "Signals structure upfront: 'I'll cover three things...'"
        ],
        "bad_signals": [
            "Jumps immediately to implementation without framing",
            "No clear structure",
            "Tangents that break the flow"
        ]
    },
    {
        "id": "technical_depth",
        "name": "Technical Depth",
        "description": "Correctness and depth of technical knowledge for the role and level",
        "good_signals": [
            "Uses correct technical terminology",
            "Goes beyond surface-level explanation",
            "Mentions edge cases or failure modes"
        ],
        "bad_signals": [
            "Vague or incorrect technical statements",
            "Only surface-level knowledge",
            "Cannot explain WHY something works"
        ],
        "calibration_note": "Calibrate expected depth against experience_level and job_role"
    },
    {
        "id": "tradeoff_awareness",
        "name": "Tradeoff Awareness",
        "description": "Whether the candidate acknowledges that solutions have costs",
        "good_signals": [
            "Explicitly names tradeoffs",
            "Compares at least two approaches before recommending one",
            "Explains WHY they chose one approach over another"
        ],
        "bad_signals": [
            "Presents only one option",
            "No mention of costs or limitations",
            "Overconfident that their solution is simply the best"
        ]
    },
    {
        "id": "quantification_impact",
        "name": "Quantification & Impact",
        "description": "Whether the candidate uses numbers and measurable outcomes",
        "good_signals": [
            "Mentions specific numbers: 'reduced load time by 40%'",
            "Describes scale: 'for a system handling 10M requests/day'",
            "Ties work to business outcomes"
        ],
        "bad_signals": [
            "Vague impact: 'it made things faster'",
            "No numbers anywhere in the answer"
        ]
    },
    {
        "id": "follow_up_handling",
        "name": "Follow-up Handling",
        "description": "How the candidate responds when the interviewer pushes back or digs deeper",
        "good_signals": [
            "Stays composed under challenge",
            "Acknowledges valid pushback gracefully",
            "Provides deeper detail when asked"
        ],
        "bad_signals": [
            "Immediately caves to any pushback even when correct",
            "Becomes defensive or flustered",
            "Repeats the same answer instead of going deeper"
        ],
        "calibration_note": "Only score if follow_up questions exist in the QA pair. Return null otherwise."
    },
    {
        "id": "seniority_alignment",
        "name": "Seniority Alignment",
        "description": "Whether language, ownership, and scope match the target experience level",
        "good_signals_by_level": {
            "0-2":  ["Shows eagerness to learn", "Honest about limitations", "Understands fundamentals"],
            "2-5":  ["Takes ownership of decisions", "Thinks about team impact", "Proactively identifies problems"],
            "5-10": ["Thinks in systems not features", "Mentions cross-team coordination", "Talks about mentoring"],
            "10+":  ["Strategic thinking", "Defines the problem not just solves it", "Talks about culture and process"]
        },
        "calibration_note": "Score relative to experience_level provided in session input"
    },
    {
        "id": "confidence_signal",
        "name": "Confidence Signal",
        "description": "Whether the candidate communicates with appropriate conviction",
        "good_signals": [
            "Declarative statements: 'I decided to...' not 'I think maybe I...'",
            "Owns their decisions",
            "Admits uncertainty directly without over-apologizing"
        ],
        "bad_signals": [
            "Excessive hedging: 'I think', 'maybe', 'I'm not sure but'",
            "Apologizes for answers unprompted",
            "Qualifies every single statement"
        ]
    },
    {
        "id": "relevance_score",
        "name": "Relevance Score",
        "description": "Whether the candidate actually answered the question that was asked",
        "good_signals": [
            "Answer directly addresses the question",
            "Stays on topic throughout"
        ],
        "bad_signals": [
            "Answers a different question than was asked",
            "Drifts into unrelated territory"
        ]
    },
    {
        "id": "conciseness_ratio",
        "name": "Conciseness Ratio",
        "description": "Signal-to-noise ratio — how much of the answer was useful vs filler",
        "good_signals": [
            "Every sentence adds new information",
            "No unnecessary repetition",
            "Knows when to stop talking"
        ],
        "bad_signals": [
            "Repeats the same point 3 times",
            "Answer is 3x longer than it needs to be",
            "Fills silence with talking rather than thinking"
        ]
    }
]
```

---

## 8. Pipeline Implementation

### Step 1 — Transcription + Speaker Diarization (AssemblyAI)

```python
# pipeline/transcriber.py

import assemblyai as aai
import os
from models.transcript import SpeakerTurn, Transcript

aai.settings.api_key = os.environ["ASSEMBLYAI_API_KEY"]

def transcribe_and_diarize(audio_file_path: str, session_id: str) -> Transcript:
    """
    Single API call to AssemblyAI.
    Returns transcript with speaker labels already assigned.
    AssemblyAI handles both transcription AND diarization together.

    Speaker labels returned: "A", "B" etc.
    We rename: most-speaking speaker = CANDIDATE, other = INTERVIEWER
    """

    transcriber = aai.Transcriber()

    transcript = transcriber.transcribe(
        audio_file_path,
        config=aai.TranscriptionConfig(
            speaker_labels=True,     # enables diarization
            speakers_expected=2,     # interviewer + candidate
            punctuate=True,
            format_text=True
        )
    )

    if transcript.status == aai.TranscriptStatus.error:
        raise Exception(f"AssemblyAI transcription failed: {transcript.error}")

    # Build speaker turns from utterances
    raw_turns = []
    speaker_time = {}

    for utterance in transcript.utterances:
        spk = utterance.speaker  # "A" or "B"
        duration = (utterance.end - utterance.start) / 1000  # ms to seconds
        speaker_time[spk] = speaker_time.get(spk, 0) + duration

        raw_turns.append({
            "speaker": spk,
            "start_time": utterance.start / 1000,
            "end_time": utterance.end / 1000,
            "text": utterance.text
        })

    # Most-speaking speaker = CANDIDATE
    # In technical interviews, candidate speaks ~65% of the time
    candidate_speaker = max(speaker_time, key=speaker_time.get)

    # Rename speakers
    labeled_turns = []
    candidate_texts = []

    for turn in raw_turns:
        label = "CANDIDATE" if turn["speaker"] == candidate_speaker else "INTERVIEWER"
        labeled_turns.append(SpeakerTurn(
            speaker=label,
            start_time=turn["start_time"],
            end_time=turn["end_time"],
            text=turn["text"]
        ))
        if label == "CANDIDATE":
            candidate_texts.append(turn["text"])

    return Transcript(
        session_id=session_id,
        turns=labeled_turns,
        candidate_text_only=" ".join(candidate_texts)
    )
```

---

### Step 2 — QA Pair Extraction (NVIDIA NIM — Qwen 3.5)

```python
# pipeline/qa_extractor.py

import json, os
from openai import OpenAI
from models.transcript import Transcript
from models.qa import QAPair

# NVIDIA NIM uses OpenAI-compatible API
nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"]
)

NVIDIA_MODEL = "qwen/qwen3.5-397b-a17b"

QA_EXTRACTION_PROMPT = """
You are analyzing an interview transcript.
Extract all question-answer pairs from the INTERVIEWER and CANDIDATE.

Rules:
- Only extract actual interview questions — ignore greetings, small talk
- Group follow-up questions on the same topic into one QA pair
- Preserve the candidate's answer EXACTLY as spoken — do not clean or improve it
- Detect the topic of each question (system design / behavioral / technical / hr)
- Return ONLY valid JSON. No explanation. No markdown. No backticks.

JSON format:
[
  {{
    "question_number": 1,
    "question": "full question text",
    "answer": "candidate's full answer verbatim",
    "follow_ups": ["follow up question if any"],
    "follow_up_answers": ["candidate answer to follow up"],
    "topic": "technical | behavioral | system_design | hr | other"
  }}
]

Transcript:
{transcript}
"""

def extract_qa_pairs(transcript: Transcript) -> list[QAPair]:
    """
    Extract structured QA pairs from labeled transcript turns.
    Uses Qwen 3.5 on NVIDIA NIM for semantic understanding.
    """
    # Build transcript string
    transcript_text = "\n".join([
        f"{turn.speaker}: {turn.text}"
        for turn in transcript.turns
    ])

    response = nvidia_client.chat.completions.create(
        model=NVIDIA_MODEL,
        messages=[
            {
                "role": "user",
                "content": QA_EXTRACTION_PROMPT.format(transcript=transcript_text)
            }
        ],
        temperature=0.1,     # low = more deterministic for structured extraction
        max_tokens=4000
    )

    raw = response.choices[0].message.content
    clean = raw.strip().replace("```json", "").replace("```", "").strip()

    try:
        pairs = json.loads(clean)
    except json.JSONDecodeError:
        # Retry once with stricter prompt if JSON parsing fails
        pairs = _retry_extraction(transcript_text)

    return [QAPair(**p) for p in pairs]


def _retry_extraction(transcript_text: str) -> list[dict]:
    """Fallback: stricter prompt if first attempt returns invalid JSON."""
    response = nvidia_client.chat.completions.create(
        model=NVIDIA_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You output only valid JSON arrays. Nothing else. No explanation."
            },
            {
                "role": "user",
                "content": f"Extract QA pairs from this interview transcript as a JSON array:\n\n{transcript_text}"
            }
        ],
        temperature=0.0,
        max_tokens=4000
    )
    raw = response.choices[0].message.content.strip()
    return json.loads(raw)
```

---

### Step 3 — Answer Scoring (NVIDIA NIM — Qwen 3.5)

```python
# pipeline/scorer.py

import json, os
from openai import OpenAI
from config.metrics import METRICS
from models.qa import QAPair
from models.report import MetricScore, AnswerAnalysis

nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"]
)

NVIDIA_MODEL = "qwen/qwen3.5-397b-a17b"

def build_scoring_prompt(
    qa_pair: QAPair,
    job_role: str,
    interview_round: str,
    experience_level: str,
    company: str = None
) -> str:

    metrics_text = "\n\n".join([
        f"METRIC: {m['name']} (id: {m['id']})\n"
        f"Measures: {m['description']}\n"
        f"Good signals: {', '.join(m['good_signals'])}\n"
        f"Bad signals: {', '.join(m['bad_signals'])}"
        for m in METRICS
    ])

    company_line = f"Target company: {company}. Adjust expectations accordingly." if company else ""

    return f"""
You are an expert interview coach and former technical interviewer at top tech companies.

CONTEXT:
- Job Role: {job_role}
- Interview Round: {interview_round}
- Candidate Experience Level: {experience_level} years
{company_line}

QUESTION ASKED:
{qa_pair.question}

CANDIDATE'S ANSWER:
{qa_pair.answer}

FOLLOW-UP QUESTIONS: {qa_pair.follow_ups}
FOLLOW-UP ANSWERS: {qa_pair.follow_up_answers}

YOUR TASK:
Score this answer on all 10 metrics below.

{metrics_text}

STRICT RULES:
1. Score each metric 1.0 to 10.0 (decimals allowed e.g. 6.5)
2. Score labels: 1-3="Weak", 4-5="Developing", 6-7="Solid", 8-9="Strong", 10="Exceptional"
3. evidence_quote MUST be copied VERBATIM from the candidate's answer above
4. If score < 7: what_went_wrong must be specific to THIS answer, not generic advice
5. If score < 8: improved_version must rewrite THIS specific answer better
6. follow_up_handling: return null score if no follow_ups exist
7. Calibrate technical_depth and seniority_alignment to the experience level
8. Do NOT penalize creative solutions — only factually incorrect ones
9. Return ONLY valid JSON. No explanation. No markdown. No backticks.

JSON format:
{{
  "question_number": {qa_pair.question_number},
  "overall_answer_score": 7.5,
  "summary": "One sentence assessment of this answer",
  "metrics": [
    {{
      "metric_id": "communication_clarity",
      "metric_name": "Communication Clarity",
      "score": 7.5,
      "label": "Solid",
      "evidence_quote": "exact verbatim quote from their answer",
      "what_went_wrong": "specific issue or null",
      "improved_version": "rewritten answer or null",
      "tips": ["tip 1", "tip 2", "tip 3"]
    }}
  ]
}}
"""


def score_answer(
    qa_pair: QAPair,
    job_role: str,
    interview_round: str,
    experience_level: str,
    company: str = None
) -> AnswerAnalysis:
    """Score a single QA pair against all 10 metrics."""

    prompt = build_scoring_prompt(
        qa_pair, job_role, interview_round, experience_level, company
    )

    response = nvidia_client.chat.completions.create(
        model=NVIDIA_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=3000
    )

    raw = response.choices[0].message.content
    clean = raw.strip().replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(clean)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse scoring response for Q{qa_pair.question_number}: {e}")

    metric_scores = [MetricScore(**m) for m in data["metrics"]]

    return AnswerAnalysis(
        qa_pair=qa_pair,
        metrics=metric_scores,
        overall_answer_score=data["overall_answer_score"],
        summary=data["summary"]
    )


def score_all_answers(
    qa_pairs: list[QAPair],
    job_role: str,
    interview_round: str,
    experience_level: str,
    company: str = None
) -> list[AnswerAnalysis]:
    """Score all QA pairs sequentially."""
    results = []
    for qa in qa_pairs:
        analysis = score_answer(qa, job_role, interview_round, experience_level, company)
        results.append(analysis)
    return results
```

---

### Step 4 — Report Builder

```python
# pipeline/report_builder.py

import os, json
from openai import OpenAI
from models.report import InterviewReport, AnswerAnalysis

nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"]
)

NVIDIA_MODEL = "qwen/qwen3.5-397b-a17b"

def build_report(session: dict, analyses: list[AnswerAnalysis]) -> InterviewReport:
    """Aggregate all answer scores into a full interview report."""

    # Calculate metric averages across all answers
    metric_totals = {}
    metric_counts = {}

    for analysis in analyses:
        for metric in analysis.metrics:
            if metric.score is not None:
                mid = metric.metric_id
                metric_totals[mid] = metric_totals.get(mid, 0) + metric.score
                metric_counts[mid] = metric_counts.get(mid, 0) + 1

    metric_averages = {
        mid: round(metric_totals[mid] / metric_counts[mid], 1)
        for mid in metric_totals
    }

    overall_score = round(sum(metric_averages.values()) / len(metric_averages), 1)

    # Rank metrics
    sorted_metrics = sorted(metric_averages.items(), key=lambda x: x[1])
    weakest  = [m[0] for m in sorted_metrics[:3]]
    strongest = [m[0] for m in sorted_metrics[-3:]]

    # Generate level gap summary via LLM
    level_gap = _generate_level_gap(
        metric_averages,
        session["experience_level"],
        session["job_role"]
    )

    return InterviewReport(
        session_id=session["session_id"],
        job_role=session["job_role"],
        interview_round=session["interview_round"],
        experience_level=session["experience_level"],
        company=session.get("company"),
        overall_score=overall_score,
        metric_averages=metric_averages,
        answer_analyses=analyses,
        recurring_weaknesses=weakest,
        strongest_areas=strongest,
        priority_improvements=weakest[:3],
        level_gap_summary=level_gap
    )


def _generate_level_gap(
    metric_averages: dict,
    experience_level: str,
    job_role: str
) -> str:
    scores_text = "\n".join([f"- {k}: {v}/10" for k, v in metric_averages.items()])

    prompt = f"""
Based on these interview scores for a {experience_level} year {job_role}:

{scores_text}

Write a 2-3 sentence Level Gap Summary that:
1. States what seniority level they are currently performing at
2. States what level they need to reach
3. Names the 2 specific signals they are missing

Be direct and specific. No fluff. No bullet points. Plain sentences only.
"""

    response = nvidia_client.chat.completions.create(
        model=NVIDIA_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=200
    )

    return response.choices[0].message.content.strip()
```

---

## 9. FastAPI Routes

```python
# main.py

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uuid, os, shutil
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="InterviewOS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# MVP: in-memory job store. Replace with Redis or DB before production.
jobs: dict = {}


@app.post("/api/sessions/upload")
async def upload_interview(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    job_role: str = Form(...),
    interview_round: str = Form(...),
    experience_level: str = Form(...),
    company: str = Form(None)
):
    """
    Upload audio + metadata. Starts async pipeline.
    Returns session_id immediately.
    Frontend polls /api/sessions/{session_id}/status for updates.
    """
    session_id = str(uuid.uuid4())

    # Save audio file
    ext = audio_file.filename.split(".")[-1]
    file_path = f"{UPLOAD_DIR}/{session_id}.{ext}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    jobs[session_id] = {
        "session_id":       session_id,
        "job_role":         job_role,
        "interview_round":  interview_round,
        "experience_level": experience_level,
        "company":          company,
        "audio_file_path":  file_path,
        "status":           "queued",
        "progress":         0,
        "current_step":     "Queued for processing",
        "report":           None,
        "error":            None
    }

    background_tasks.add_task(run_pipeline, session_id)
    return {"session_id": session_id, "status": "queued"}


@app.get("/api/sessions/{session_id}/status")
async def get_status(session_id: str):
    """Poll this to track analysis progress. Returns 0-100 progress."""
    if session_id not in jobs:
        return {"error": "Session not found"}, 404
    job = jobs[session_id]
    return {
        "session_id":   session_id,
        "status":       job["status"],       # queued | processing | complete | error
        "progress":     job["progress"],     # 0-100
        "current_step": job["current_step"]
    }


@app.get("/api/sessions/{session_id}/report")
async def get_report(session_id: str):
    """Get full report. Only available when status == 'complete'."""
    if session_id not in jobs:
        return {"error": "Session not found"}, 404
    job = jobs[session_id]
    if job["status"] != "complete":
        return {"error": f"Not ready. Status: {job['status']}"}
    return job["report"]


async def run_pipeline(session_id: str):
    """Background task: full analysis pipeline."""
    from pipeline.transcriber import transcribe_and_diarize
    from pipeline.qa_extractor import extract_qa_pairs
    from pipeline.scorer import score_all_answers
    from pipeline.report_builder import build_report

    job = jobs[session_id]

    try:
        # Step 1 — AssemblyAI: transcribe + diarize
        job["status"]       = "processing"
        job["current_step"] = "Transcribing audio and detecting speakers..."
        job["progress"]     = 15

        transcript = transcribe_and_diarize(
            job["audio_file_path"],
            session_id
        )

        # Step 2 — NVIDIA NIM: extract QA pairs
        job["current_step"] = "Extracting questions and answers..."
        job["progress"]     = 40

        qa_pairs = extract_qa_pairs(transcript)

        # Step 3 — NVIDIA NIM: score each answer
        job["current_step"] = f"Analyzing {len(qa_pairs)} answers..."
        job["progress"]     = 60

        analyses = score_all_answers(
            qa_pairs,
            job["job_role"],
            job["interview_round"],
            job["experience_level"],
            job.get("company")
        )

        # Step 4 — Build report
        job["current_step"] = "Building performance report..."
        job["progress"]     = 85

        report = build_report(job, analyses)

        # Done
        job["report"]       = report.model_dump()
        job["status"]       = "complete"
        job["progress"]     = 100
        job["current_step"] = "Analysis complete"

        # Cleanup audio file after analysis
        if os.path.exists(job["audio_file_path"]):
            os.remove(job["audio_file_path"])

    except Exception as e:
        job["status"]       = "error"
        job["error"]        = str(e)
        job["current_step"] = f"Error: {str(e)}"
```

---

## 10. Project Folder Structure

```
interviewos-backend/
├── main.py                    # FastAPI app, routes, pipeline orchestration
├── requirements.txt
├── .env                       # secrets — never commit
├── .env.example               # commit this with placeholder values
│
├── config/
│   └── metrics.py             # 10 metric definitions with signals
│
├── models/
│   ├── interview.py           # InterviewSession, JobRole, InterviewRound
│   ├── transcript.py          # SpeakerTurn, Transcript
│   ├── qa.py                  # QAPair
│   └── report.py              # MetricScore, AnswerAnalysis, InterviewReport
│
├── pipeline/
│   ├── transcriber.py         # AssemblyAI: transcription + diarization
│   ├── qa_extractor.py        # NVIDIA NIM: extract QA pairs from transcript
│   ├── scorer.py              # NVIDIA NIM: score each answer on 10 metrics
│   └── report_builder.py      # Aggregate scores into final report
│
└── uploads/                   # temporary audio file storage (auto-cleaned)
```

---

## 11. Cost Summary

| Stage | Service | Free Tier | After Free |
|---|---|---|---|
| Transcription + Diarization | AssemblyAI | $50 credits (~290 interviews) | ~$0.17/interview |
| QA Extraction + Scoring | NVIDIA NIM (Qwen 3.5) | 1000 API calls | Pay per token (cheap) |
| **Total per interview** | | **$0** | **~$0.25–0.35** |

At $29/month subscription, even 20 interviews/month costs you ~$5–7. **Margins stay healthy.**

---

## 12. Critical Notes for AI Agent

1. **AssemblyAI returns utterances, not words** — iterate `transcript.utterances`, not `transcript.words`

2. **Speaker label assignment heuristic** — candidate = most-speaking speaker. Works for technical rounds. For short HR rounds, consider adding a manual confirmation step in the UI.

3. **Always wrap NVIDIA NIM responses in try/except** — LLMs occasionally return malformed JSON. The retry pattern in `qa_extractor.py` is the right approach.

4. **Temperature settings are critical:**
   - `0.0–0.1` for JSON extraction (deterministic)
   - `0.2–0.3` for scoring (slight variation OK)
   - `0.3–0.5` for text generation like level gap summary

5. **evidence_quote must be verbatim** — enforce this in the prompt strongly. Users lose trust if quotes are paraphrased.

6. **Never score follow_up_handling if no follow-ups exist** — return `null` for the score. The prompt instructs this but double-check in the scoring response parser.

7. **Delete audio files after pipeline completes** — already implemented in `run_pipeline()`. Privacy-first. Never store raw interview audio long-term.

8. **jobs dict is MVP only** — replace with PostgreSQL or Redis before any real user traffic.

9. **Run pipeline steps sequentially** — each step depends on the previous output. Do not parallelize.

10. **NVIDIA NIM model fallback** — if `qwen3.5-397b-a17b` hits rate limits, swap to `nvidia/llama-3.3-nemotron-super-49b-v1` in the `NVIDIA_MODEL` constant. Same code, just faster and smaller.

---

*InterviewOS AI Stack v2 — AssemblyAI + NVIDIA NIM (Qwen 3.5) — Production Ready*
