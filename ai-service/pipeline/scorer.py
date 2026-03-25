# pipeline/scorer.py

import json
import os
import time
import concurrent.futures
from openai import OpenAI, APIError
from pipeline.utils import retry_llm_call

from config.metrics import METRICS
from models.qa import QAPair
from models.report import MetricScore, AnswerAnalysis

# NVIDIA NIM uses OpenAI-compatible API
nvidia_client = None
NVIDIA_MODEL = "meta/llama-3.1-8b-instruct"


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
Your goal is to provide HIGH-STAKES feedback that helps a candidate land a Tier-1 tech job.

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
1. First, assess if this question-answer pair is a 'High-Value Technical/Behavioral exchange' or just 'Administrative/Introductory boilerplate'.
2. Score this answer on the 8 metrics below. Each score should be calibrated to the {experience_level} year experience level.
3. RELEVANCE RULE: If a metric is COMPLETELY irrelevant to the question asked (e.g., scoring an 'Introduce yourself' prompt for 'Technical Depth' or 'Tradeoff Awareness'), set "is_relevant": false and "score": 0.0.
4. Crucially, your feedback must be CRITICAL and ACTIONABLE. Avoid generic praise.

{metrics_text}

STRICT RESPONSE RULES:
1. is_relevant: true if the metric applies meaningfully, false if it's a stretch or irrelevant (always a boolean).
2. Score: 1.0 to 10.0 if relevant. If is_relevant is false, score MUST be 0.0.
3. 7.0 is "Solid" (Hirable), 8.5+ is "Exceptional" (Top 5% of candidates).
4. evidence_quote: Copy a short EXACT verbatim quote from the candidate's answer that proves your score for THIS SPECIFIC METRIC.
5. rationale: CRITICAL INSTRUCTION - You MUST provide a concrete contrasting example of what they SHOULD have said instead, directly related to their specific answer. 
   - FORMAT: "Instead of just saying '[vague part of their answer]', you should have said '[concrete senior-level alternative]'".
   - DO NOT repeat the same rationale or quote across different metrics. If you use a quote for 'Technical Depth', find a DIFFERENT quote or a different angle for 'Communication Clarity'. Redundancy is a failure.
6. what_went_wrong: Be direct and specific about the exact technical or behavioral misstep for this metric.
7. tips: Provide exactly 2 concise, actionable tips.

Return ONLY a valid JSON object. No markdown. No explanation.

JSON format:
{{
  "question_number": {qa_pair.question_number},
  "overall_answer_score": 7.5,
  "summary": "2-sentence assessment.",
  "metrics": [
    {{
      "metric_id": "communication_clarity",
      "metric_name": "Communication Clarity",
      "is_relevant": true,
      "score": 7.5,
      "label": "Solid",
      "evidence_quote": "exact verbatim quote uniquely proving clarity issue/success",
      "rationale": "Instead of [X], you should have [Y] to improve clarity...",
      "what_went_wrong": "specific clarity issue",
      "tips": ["Tip 1", "Tip 2"]
    }},
    {{ "metric_id": "structural_thinking", "metric_name": "...", "is_relevant": false, "score": 0.0, ... }},
    "... (Repeat for all 8 metrics with UNIQUE quotes and rationales for each)"
  ]
}}
"""


@retry_llm_call(max_retries=1)
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
        temperature=0.0,
        max_tokens=2500
    )

    raw = response.choices[0].message.content
    clean = raw.strip().replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(clean)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse scoring response for Q{qa_pair.question_number}: {e}")

    metric_scores = [MetricScore(**m) for m in data["metrics"]]
    
    # Capture token usage
    usage = getattr(response, 'usage', None)
    prompt_tokens = usage.prompt_tokens if usage else 0
    completion_tokens = usage.completion_tokens if usage else 0

    return AnswerAnalysis(
        qa_pair=qa_pair,
        metrics=metric_scores,
        overall_answer_score=data["overall_answer_score"],
        summary=data["summary"],
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens
    )


def score_all_answers(
    qa_pairs: list[QAPair],
    job_role: str,
    interview_round: str,
    experience_level: str,
    company: str = None
) -> list[AnswerAnalysis]:
    """Score all QA pairs concurrently using ThreadPoolExecutor."""
    if not qa_pairs:
        return []

    results = [None] * len(qa_pairs)

    print(f"[Scorer] Scoring {len(qa_pairs)} answers (max 2 concurrent to avoid NVIDIA rate limits)...")

    def _score_and_store(index: int, qa: QAPair):
        print(f"[Scorer] Starting Q{qa.question_number}...")
        try:
            analysis = score_answer(qa, job_role, interview_round, experience_level, company)
            results[index] = analysis
            print(f"[Scorer] ✅ Q{qa.question_number} finished.")
        except Exception as e:
            print(f"[Scorer] ❌ Failed to score Q{qa.question_number}: {e}")
            # If a strict failure happens after retries, we could inject a dummy or raise
            raise

    # Keep max_workers at 2 for NVIDIA NIM free tier to avoid rate-limiting 504s.
    # All 7 firing at once overwhelms the endpoint; 2 at a time is the sweet spot.
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = []
        for i, qa in enumerate(qa_pairs):
            futures.append(executor.submit(_score_and_store, i, qa))
            time.sleep(0.5)  # small stagger to avoid hitting NVIDIA simultaneously
        concurrent.futures.wait(futures)
        
        # Check for any exceptions that bubbled up
        for future in futures:
            if future.exception() is not None:
                raise future.exception()

    # Filter out any Nones if failure policies change in the future
    valid_results = [r for r in results if r is not None]
    
    print(f"[Scorer] ✅ All {len(valid_results)} answers scored successfully")
    return valid_results
