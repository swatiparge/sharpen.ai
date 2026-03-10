import assemblyai as aai
import os
aai.settings.api_key = os.environ.get("ASSEMBLYAI_API_KEY", "dummy")
try:
    config = aai.TranscriptionConfig(
        speaker_labels=True,
        speakers_expected=2,
        speech_models=[aai.SpeechModel.nano]
    )
    print("nano works")
except Exception as e:
    print(f"nano error: {e}")

try:
    config2 = aai.TranscriptionConfig(
        speaker_labels=True,
        speakers_expected=2,
        speech_models=[aai.SpeechModel.universal_2]
    )
    print("universal_2 works")
except Exception as e:
    print(f"universal_2 error: {e}")
