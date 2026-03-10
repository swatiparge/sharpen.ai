# pipeline/report_builder.py

import os
import json
from openai import OpenAI
from models.report import InterviewReport, AnswerAnalysis

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

    overall_score = round(sum(metric_averages.values()) / len(metric_averages), 1) if metric_averages else 5.0

    # Rank metrics
    sorted_metrics = sorted(metric_averages.items(), key=lambda x: x[1])
    weakest  = [m[0] for m in sorted_metrics[:3]]
    strongest = [m[0] for m in sorted_metrics[-3:]]

    # Generate level gap summary via LLM
    level_gap = _generate_level_gap(
        metric_averages,
        session.get("experience_level", ""),
        session.get("job_role", "")
    )

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
        level_gap_summary=level_gap
    )


def _generate_level_gap(
    metric_averages: dict,
    experience_level: str,
    job_role: str
) -> str:
    """Generate a concise level gap summary using the LLM."""
    if not metric_averages:
        return "Insufficient data to generate level gap summary."

    client = _get_client()

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

    try:
        response = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[ReportBuilder] ⚠️ Level gap generation failed: {e}")
        return "Level gap summary could not be generated."
