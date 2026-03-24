# pipeline/qa_extractor.py

import json
import os
from openai import OpenAI, APIError
from pipeline.utils import retry_llm_call

from models.transcript import Transcript, SpeakerTurn
from models.qa import QAPair

# NVIDIA NIM uses OpenAI-compatible API
nvidia_client = None
NVIDIA_MODEL = "qwen/qwen2.5-7b-instruct"


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


# ── Rule-based Q&A grouping (fast, no LLM) ───────────────────────

def _rule_based_extract(turns: list[SpeakerTurn]) -> list[dict]:
    """
    Group consecutive speaker turns into Q&A pairs using AssemblyAI speaker labels.
    The transcriber already labels speakers as 'INTERVIEWER' or 'CANDIDATE'.
    This is instantaneous — zero LLM calls required.
    """
    if not turns:
        return []

    qa_pairs = []
    current_question = []
    current_answer = []
    question_number = 0
    in_question = False

    for turn in turns:
        is_interviewer = (turn.speaker.upper() == "INTERVIEWER")
        text = turn.text.strip()
        if not text:
            continue

        if is_interviewer:
            # If we already have a complete Q&A pair, save it
            if current_question and current_answer:
                question_number += 1
                qa_pairs.append({
                    "question_number": question_number,
                    "question": " ".join(current_question).strip(),
                    "answer": " ".join(current_answer).strip(),
                    "follow_ups": [],
                    "follow_up_answers": [],
                    "topic": "other"
                })
                current_question = []
                current_answer = []
            current_question.append(text)
            in_question = True
        else:
            # Candidate speaking
            if in_question:
                current_answer.append(text)

    # Don't forget the last pair
    if current_question and current_answer:
        question_number += 1
        qa_pairs.append({
            "question_number": question_number,
            "question": " ".join(current_question).strip(),
            "answer": " ".join(current_answer).strip(),
            "follow_ups": [],
            "follow_up_answers": [],
            "topic": "other"
        })

    # Filter out very short exchanges that are likely greetings/filler
    meaningful = [p for p in qa_pairs if len(p["answer"].split()) > 5]
    print(f"[QA Extractor] Rule-based extraction found {len(meaningful)} meaningful QA pairs")
    return meaningful


# ── Main entry point ──────────────────────────────────────────────

def extract_qa_pairs(transcript: Transcript) -> list[QAPair]:
    """
    Extract structured QA pairs from a diarized transcript.
    Uses rule-based speaker-turn grouping — zero LLM calls, instant.
    """
    print(f"[QA Extractor] Extracting QA pairs from {len(transcript.turns)} turns...")

    raw_pairs = _rule_based_extract(transcript.turns)

    if not raw_pairs:
        print("[QA Extractor] ⚠️ No QA pairs found via rule-based extraction.")
        return []

    result = [QAPair(**p) for p in raw_pairs]
    print(f"[QA Extractor] ✅ Extracted {len(result)} QA pairs (instant, no LLM)")
    return result
