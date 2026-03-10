import assemblyai as aai

try:
    config = aai.TranscriptionConfig(
        speaker_labels=True,
        speakers_expected=2,
        speech_models=[aai.SpeechModel("universal-2")]
    )
    print("universal-2 works with aai.SpeechModel instance")
except Exception as e:
    print(f"error 1: {e}")

try:
    config2 = aai.TranscriptionConfig(
        speaker_labels=True,
        speakers_expected=2,
        speech_model=aai.SpeechModel("universal-2")
    )
    print("universal-2 works with single speech_model param")
except Exception as e:
    print(f"error 2: {e}")

