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
