import os
import json
from pipeline.scorer import score_answer
from models.qa import QAPair
from dotenv import load_dotenv

load_dotenv()

def test_scorer_uniqueness():
    # A sample technical question and answer
    qa = QAPair(
        question_number=1,
        question="How do you handle state management in a large React application?",
        answer="I usually use Redux because it's predictable. I define actions and reducers to manage the state. It helps in debugging as well. Sometimes I use Context API for smaller parts.",
        follow_ups=[],
        follow_up_answers=[]
    )
    
    # Mock metadata
    job_role = "Senior Frontend Engineer"
    interview_round = "Technical Round"
    experience_level = "5"
    company = "Google"
    
    print(f"Testing scorer for Q1: {qa.question}")
    
    try:
        analysis = score_answer(qa, job_role, interview_round, experience_level, company)
        
        print("\nOverall Answer Score:", analysis.overall_answer_score)
        print("Summary:", analysis.summary)
        
        print("\nMetrics Analysis:")
        rationales = []
        quotes = []
        
        for m in analysis.metrics:
            if m.is_relevant:
                print(f"- {m.metric_name}: Score {m.score}")
                print(f"  Rationale: {m.rationale}")
                print(f"  Quote: \"{m.evidence_quote}\"")
                
                # Check for "Instead of..." pattern
                if "Instead of" not in m.rationale and "should have" not in m.rationale.lower():
                    print(f"  WARNING: Rationale for {m.metric_name} might be generic!")
                
                # Check for uniqueness
                if m.rationale in rationales:
                    print(f"  ERROR: Duplicate rationale found for {m.metric_name}!")
                if m.evidence_quote in quotes and m.evidence_quote != "":
                    print(f"  WARNING: Duplicate quote found for {m.metric_name}!")
                
                rationales.append(m.rationale)
                quotes.append(m.evidence_quote)
            else:
                print(f"- {m.metric_name}: Not Relevant")
        
        # Verify specific instruction: "Instead of just saying '[vague part]', you should have said '[concrete alternative]'"
        
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    if not os.getenv("NVIDIA_API_KEY"):
        print("NVIDIA_API_KEY NOT FOUND. Skipping actual LLM call.")
    else:
        test_scorer_uniqueness()
