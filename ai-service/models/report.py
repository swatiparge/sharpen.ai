# models/report.py
from pydantic import BaseModel
from typing import Optional
from .qa import QAPair

class MetricScore(BaseModel):
    metric_id:        str
    metric_name:      str
    is_relevant:      bool = True            # Whether this metric applies to the specific Q&A
    score:            Optional[float] = 5.0  # default 5.0 if LLM returns null
    label:            Optional[str] = "Developing"
    evidence_quote:   Optional[str] = ""     # safe default if LLM returns null
    rationale:        Optional[str] = ""     # why this specific score was given for this question
    what_went_wrong:  Optional[str] = None
    tips:             list[str] = []         # 2 concise tips

class AnswerAnalysis(BaseModel):
    qa_pair:             QAPair
    metrics:             list[MetricScore]
    overall_answer_score: float
    summary:             str
    prompt_tokens:       int = 0
    completion_tokens:   int = 0

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
    top_strengths:        list[dict] = []  # dict with 'title' and 'description'
    key_improvement_areas: list[dict] = [] # dict with 'title' and 'description'
    prompt_tokens:        int = 0
    completion_tokens:    int = 0
