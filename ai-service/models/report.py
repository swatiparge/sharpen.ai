# models/report.py
from pydantic import BaseModel
from typing import Optional
from .qa import QAPair

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
