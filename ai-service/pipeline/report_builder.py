# pipeline/report_builder.py

import os
import json
from openai import OpenAI, APIError
from pipeline.utils import retry_llm_call

from models.report import InterviewReport, AnswerAnalysis

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


def build_report(session: dict, analyses: list[AnswerAnalysis]) -> InterviewReport:
    """Aggregate all answer scores into a full interview report."""

    # Calculate metric averages across all answers
    metric_totals = {}
    metric_counts = {}

    for analysis in analyses:
        for metric in analysis.metrics:
            if metric.is_relevant and metric.score is not None:
                mid = metric.metric_id
                metric_totals[mid] = metric_totals.get(mid, 0) + metric.score
                metric_counts[mid] = metric_counts.get(mid, 0) + 1

    metric_averages = {
        mid: round(metric_totals[mid] / metric_counts[mid], 1)
        for mid in metric_totals
    }

    overall_score = round(sum(metric_averages.values()) / len(metric_averages), 1) if metric_averages else 5.0

    # Rank metrics
    sorted_metrics = sorted(metric_averages.items(), key=lambda x: x[1])
    weakest  = [m[0] for m in sorted_metrics[:3]]
    strongest = [m[0] for m in sorted_metrics[-3:]]

    # Aggregate tokens from all answer analyses
    total_prompt_tokens = sum(a.prompt_tokens for a in analyses)
    total_completion_tokens = sum(a.completion_tokens for a in analyses)

    # Generate structured summary, strengths, and weaknesses via LLM
    structured_data, summary_usage = _generate_structured_summary(
        metric_averages,
        session.get("experience_level", ""),
        session.get("job_role", "")
    )
    
    # Add summary generation tokens
    total_prompt_tokens += summary_usage.get("prompt_tokens", 0)
    total_completion_tokens += summary_usage.get("completion_tokens", 0)

    return InterviewReport(
        session_id=session.get("session_id", ""),
        job_role=session.get("job_role", ""),
        interview_round=session.get("interview_round", ""),
        experience_level=session.get("experience_level", ""),
        company=session.get("company"),
        overall_score=overall_score,
        metric_averages=metric_averages,
        answer_analyses=analyses,
        recurring_weaknesses=weakest,
        strongest_areas=strongest,
        priority_improvements=weakest[:3],
        level_gap_summary=structured_data.get("summary", "Summary could not be generated."),
        top_strengths=structured_data.get("top_strengths", []),
        key_improvement_areas=structured_data.get("key_improvement_areas", []),
        prompt_tokens=total_prompt_tokens,
        completion_tokens=total_completion_tokens
    )


def _generate_structured_summary(
    metric_averages: dict,
    experience_level: str,
    job_role: str
) -> tuple[dict, dict]:
    """Generate a structured summary and return usage data."""
    if not metric_averages:
        return {}, {}

    client = _get_client()

    scores_text = "\n".join([f"- {k}: {v}/10" for k, v in metric_averages.items()])

    prompt = f"""
Based on these interview scores for a {experience_level} year {job_role}:

{scores_text}

Analyze the performance and return ONLY a valid JSON object matching this exact structure:

{{
    "summary": "A 2-3 sentence Level Gap Summary. State what seniority level they are currently performing at, what level they need to reach, and name 2 specific signals they are missing. Be direct. No fluff. Plain sentences only.",
    "top_strengths": [
        {{ "title": "Strength 1 Name", "description": "1 sentence explaining why" }},
        {{ "title": "Strength 2 Name", "description": "1 sentence explaining why" }},
        {{ "title": "Strength 3 Name", "description": "1 sentence explaining why" }}
    ],
    "key_improvement_areas": [
        {{ "title": "Weakness 1 Name", "description": "1 sentence explaining what to improve" }},
        {{ "title": "Weakness 2 Name", "description": "1 sentence explaining what to improve" }}
    ]
}}

Do perfectly formatted JSON. Do not use Markdown formatting code blocks. Simply output JSON.
"""

    try:
        @retry_llm_call(max_retries=3)
        def _call_llm():
            return client.chat.completions.create(
                model=NVIDIA_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,  # Strict determinism
                max_tokens=600
            )

        response = _call_llm()
        usage = getattr(response, 'usage', None)
        usage_dict = {
            "prompt_tokens": usage.prompt_tokens if usage else 0,
            "completion_tokens": usage.completion_tokens if usage else 0
        }
        
        content = response.choices[0].message.content.strip()
        # Clean up potential markdown blocks the LLM might stubbornly include
        content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content), usage_dict
    except Exception as e:
        print(f"[ReportBuilder] ⚠️ Structured summary generation failed: {e}")
        return {}, {}

