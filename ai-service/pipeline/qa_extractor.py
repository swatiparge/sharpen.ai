# pipeline/qa_extractor.py

import json
import os
from openai import OpenAI
from models.transcript import Transcript
from models.qa import QAPair

# NVIDIA NIM uses OpenAI-compatible API
nvidia_client = None
NVIDIA_MODEL = "qwen/qwen2.5-72b-instruct"


def _get_client() -> OpenAI:
    """Lazy-init the NVIDIA NIM client."""
    global nvidia_client
    if nvidia_client is None:
        api_key = os.environ.get("NVIDIA_API_KEY", "")
        if not api_key:
            raise RuntimeError("NVIDIA_API_KEY not set in environment")
        nvidia_client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
        )
    return nvidia_client


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
    client = _get_client()

    # Build transcript string
    transcript_text = "\n".join([
        f"{turn.speaker}: {turn.text}"
        for turn in transcript.turns
    ])

    print(f"[QA Extractor] Extracting QA pairs from {len(transcript.turns)} turns...")

    response = client.chat.completions.create(
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
        print("[QA Extractor] ⚠️ JSON parse failed, retrying with stricter prompt...")
        pairs = _retry_extraction(client, transcript_text)

    result = [QAPair(**p) for p in pairs]
    print(f"[QA Extractor] ✅ Extracted {len(result)} QA pairs")
    return result


def _retry_extraction(client: OpenAI, transcript_text: str) -> list[dict]:
    """Fallback: stricter prompt if first attempt returns invalid JSON."""
    response = client.chat.completions.create(
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
