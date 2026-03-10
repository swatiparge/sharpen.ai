# pipeline/scorer.py

import json
import os
from openai import OpenAI
from config.metrics import METRICS
from models.qa import QAPair
from models.report import MetricScore, AnswerAnalysis

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
        f"Good signals: {', '.join(m.get('good_signals', []))}\n"
        f"Bad signals: {', '.join(m.get('bad_signals', []))}"
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
Score this answer on all 8 metrics below.

{metrics_text}

STRICT RULES:
1. Score each metric 1.0 to 10.0 (decimals allowed e.g. 6.5)
2. Score labels: 1-3="Weak", 4-5="Developing", 6-7="Solid", 8-9="Strong", 10="Exceptional"
3. evidence_quote MUST be copied VERBATIM from the candidate's answer above
4. If score < 7: what_went_wrong must be specific to THIS answer, not generic advice
5. If score < 8: improved_version must rewrite THIS specific answer better
6. followup_handling: return null score if no follow_ups exist
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
    """Score a single QA pair against all 8 metrics."""
    client = _get_client()

    prompt = build_scoring_prompt(
        qa_pair, job_role, interview_round, experience_level, company
    )

    response = client.chat.completions.create(
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
    for i, qa in enumerate(qa_pairs):
        print(f"[Scorer] Scoring answer {i+1}/{len(qa_pairs)}: Q{qa.question_number}...")
        analysis = score_answer(qa, job_role, interview_round, experience_level, company)
        results.append(analysis)
    print(f"[Scorer] ✅ All {len(results)} answers scored")
    return results
