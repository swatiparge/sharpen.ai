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
