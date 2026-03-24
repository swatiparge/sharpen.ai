import json
from pipeline.learn_generator import generate_topic_lesson

try:
    print("Testing generate_topic_lesson...")
    result = generate_topic_lesson("css")
    print("SUCCESS!")
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"FAILED: {e}")
