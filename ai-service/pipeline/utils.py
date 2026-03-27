import time
import random
import functools
from openai import APIError

def retry_llm_call(max_retries=3, initial_wait=2, backoff=2):
    """
    A simple retry decorator with exponential backoff to handle native 
    LLM API timeouts without requiring external dependencies like tenacity.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            wait_time = initial_wait
            while True:
                try:
                    return func(*args, **kwargs)
                except (APIError, Exception) as e:
                    retries += 1
                    if retries > max_retries:
                        print(f"[Retry] ❌ Failed after {max_retries} attempts: {e}")
                        raise
                    print(f"[Retry] ⚠️ LLM call failed ({e}). Retrying in {wait_time}s (Attempt {retries}/{max_retries})...")
                    time.sleep(wait_time)
                    # Dynamic backoff with exponential scaling and Jitter to prevent thundering herd
                    wait_time = min(10, wait_time * backoff) + random.uniform(0.1, 1.5)
        return wrapper
    return decorator
