import os
import sys
import time
from dotenv import load_dotenv

# Add ai-service root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from pipeline.scorer import score_all_answers
from models.qa import QAPair

def main():
    print("--- Testing Parallel Scoring Execution Time ---")
    
    # Create 5 identical mock QA pairs to simulate a real interview
    qa_pairs = [
        QAPair(
            question_number=i+1,
            question="Can you tell me about a time you had a conflict with a coworker?",
            answer="I once disagreed with a designer about the layout. I proposed an A/B test. We ran it, and my version won, so we went with that.",
            follow_ups=["How did the designer react?"],
            follow_up_answers=["They were fine with the data-driven approach."],
            topic="behavioral"
        )
        for i in range(5)
    ]
    
    job_role = "Software Engineer"
    interview_round = "Behavioral"
    experience_level = "5"
    company = "Google"

    start_time = time.time()
    
    # Run the scorer
    results = score_all_answers(qa_pairs, job_role, interview_round, experience_level, company)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print("\n--- Test Results ---")
    print(f"Total QA Pairs: {len(qa_pairs)}")
    print(f"Total Successful Results: {len(results)}")
    print(f"Total Execution Time: {total_time:.2f} seconds")
    
    # In a sequential world, 5 pairs * ~4s per LLM call = ~20s
    # In a parallel world, it should be the speed of the slowest call = ~4-6s
    if total_time < 12.0:
        print("✅ SUCCESS: The scoring was demonstrably executed in parallel.")
    else:
        print("⚠️ WARNING: The execution time suggests it might still be running sequentially.")

if __name__ == "__main__":
    main()
