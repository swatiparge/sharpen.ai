
import os
import assemblyai as aai
from dotenv import load_dotenv

# Load .env from the same directory
load_dotenv()

api_key = os.environ.get("ASSEMBLYAI_API_KEY")
print(f"Key found: {api_key[:5]}...{api_key[-5:] if api_key else ''}")

if not api_key:
    print("ERROR: ASSEMBLYAI_API_KEY not found in environment.")
    exit(1)

aai.settings.api_key = api_key

try:
    print("Testing AssemblyAI connection...")
    transcriber = aai.Transcriber()
    # Using a tiny valid audio url just to test auth
    audio_url = "https://github.com/AssemblyAI-Examples/audio-examples/raw/main/24bit_8khz.wav"
    transcript = transcriber.transcribe(audio_url)
    
    if transcript.status == aai.TranscriptStatus.error:
        print(f"Transcript Error: {transcript.error}")
    else:
        print("Auth Success!")
except Exception as e:
    print(f"Exception: {e}")
