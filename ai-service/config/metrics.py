# config/metrics.py

METRICS = [
    {
        "id": "communication_clarity",
        "name": "Communication Clarity",
        "description": "How clearly and concisely the candidate expresses ideas",
        "good_signals": [
            "Short, direct sentences",
            "Avoids rambling",
            "Uses precise vocabulary",
            "Easy to follow logical flow"
        ],
        "bad_signals": [
            "Excessive filler words (um, uh, like, you know)",
            "Repeats the same point multiple times",
            "Overly complex sentences that obscure meaning"
        ]
    },
    {
        "id": "structural_thinking",
        "name": "Structural Thinking",
        "description": "Whether the candidate organizes their answer with a clear framework",
        "good_signals": [
            "Uses STAR method for behavioral questions",
            "Frames the problem before jumping to solution",
            "Signals structure upfront: 'I'll cover three things...'"
        ],
        "bad_signals": [
            "Jumps immediately to implementation without framing",
            "No clear structure",
            "Tangents that break the flow"
        ]
    },
    {
        "id": "technical_depth",
        "name": "Technical Depth",
        "description": "Correctness and depth of technical knowledge for the role and level",
        "good_signals": [
            "Uses correct technical terminology",
            "Goes beyond surface-level explanation",
            "Mentions edge cases or failure modes"
        ],
        "bad_signals": [
            "Vague or incorrect technical statements",
            "Only surface-level knowledge",
            "Cannot explain WHY something works"
        ],
        "calibration_note": "Calibrate expected depth against experience_level and job_role"
    },
    {
        "id": "tradeoff_awareness",
        "name": "Tradeoff Awareness",
        "description": "Whether the candidate acknowledges that solutions have costs",
        "good_signals": [
            "Explicitly names tradeoffs",
            "Compares at least two approaches before recommending one",
            "Explains WHY they chose one approach over another"
        ],
        "bad_signals": [
            "Presents only one option",
            "No mention of costs or limitations",
            "Overconfident that their solution is simply the best"
        ]
    },
    {
        "id": "quantification_impact",
        "name": "Quantification & Impact",
        "description": "Whether the candidate uses numbers and measurable outcomes",
        "good_signals": [
            "Mentions specific numbers: 'reduced load time by 40%'",
            "Describes scale: 'for a system handling 10M requests/day'",
            "Ties work to business outcomes"
        ],
        "bad_signals": [
            "Vague impact: 'it made things faster'",
            "No numbers anywhere in the answer"
        ]
    },
    {
        "id": "followup_handling",
        "name": "Follow-up Handling",
        "description": "How the candidate responds when the interviewer pushes back or digs deeper",
        "good_signals": [
            "Stays composed under challenge",
            "Acknowledges valid pushback gracefully",
            "Provides deeper detail when asked"
        ],
        "bad_signals": [
            "Immediately caves to any pushback even when correct",
            "Becomes defensive or flustered",
            "Repeats the same answer instead of going deeper"
        ],
        "calibration_note": "Only score if follow_up questions exist in the QA pair. Return null otherwise."
    },
    {
        "id": "seniority_alignment",
        "name": "Seniority Alignment",
        "description": "Whether language, ownership, and scope match the target experience level",
        "good_signals_by_level": {
            "0-2":  ["Shows eagerness to learn", "Honest about limitations", "Understands fundamentals"],
            "2-5":  ["Takes ownership of decisions", "Thinks about team impact", "Proactively identifies problems"],
            "5-10": ["Thinks in systems not features", "Mentions cross-team coordination", "Talks about mentoring"],
            "10+":  ["Strategic thinking", "Defines the problem not just solves it", "Talks about culture and process"]
        },
        "calibration_note": "Score relative to experience_level provided in session input"
    },
    {
        "id": "confidence_signal",
        "name": "Confidence Signal",
        "description": "Whether the candidate communicates with appropriate conviction",
        "good_signals": [
            "Declarative statements: 'I decided to...' not 'I think maybe I...'",
            "Owns their decisions",
            "Admits uncertainty directly without over-apologizing"
        ],
        "bad_signals": [
            "Excessive hedging: 'I think', 'maybe', 'I'm not sure but'",
            "Apologizes for answers unprompted",
            "Qualifies every single statement"
        ]
    },
]
