# models/transcript.py
from pydantic import BaseModel

class SpeakerTurn(BaseModel):
    speaker:    str    # "INTERVIEWER" or "CANDIDATE"
    start_time: float  # seconds
    end_time:   float
    text:       str

class Transcript(BaseModel):
    session_id:          str
    turns:               list[SpeakerTurn]
    candidate_text_only: str  # all candidate speech joined
