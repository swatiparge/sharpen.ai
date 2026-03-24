
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("NVIDIA_API_KEY")
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=api_key
)

models_to_try = [
    "qwen/qwen-2.5-72b-instruct",
    "qwen/qwen2.5-72b-instruct",
    "qwen-2.5-72b-instruct",
    "qwen2.5-72b-instruct",
    "meta/llama-3.1-405b-instruct" # test one known to work usually
]

for model in models_to_try:
    print(f"\nTesting model: {model}")
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=10
        )
        print(f"✅ Success with {model}: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ Failed with {model}: {e}")

print("\n--- Listing available models (if supported) ---")
try:
    models = client.models.list()
    for m in models:
        if "qwen" in m.id.lower():
            print(f"Found Qwen model: {m.id}")
except Exception as e:
    print(f"Could not list models: {e}")
