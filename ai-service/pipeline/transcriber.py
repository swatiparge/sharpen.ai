# pipeline/transcriber.py

import assemblyai as aai
import os
import json
from models.transcript import SpeakerTurn, Transcript


def transcribe_and_diarize(audio_url: str, session_id: str) -> Transcript:
    """
    Single API call to AssemblyAI.
    Returns transcript with speaker labels already assigned.
    AssemblyAI handles both transcription AND diarization together.

    Speaker labels returned: "A", "B" etc.
    We rename: most-speaking speaker = CANDIDATE, other = INTERVIEWER

    Args:
        audio_url: Public URL or presigned S3 URL to the audio file
        session_id: Unique session identifier

    Returns:
        Transcript with labeled speaker turns
    """
    cache_path = f"/tmp/transcript_cache_{session_id}.json"
    
    # Check if we already transcribed this session
    if os.path.exists(cache_path):
        print(f"[AssemblyAI] ⚡ Found cached transcript for {session_id}, loading from disk to save credits and time!")
        try:
            with open(cache_path, "r") as f:
                data = json.load(f)
            
            # Reconstruct Pydantic objects
            turns = [SpeakerTurn(**t) for t in data.get("turns", [])]
            return Transcript(
                session_id=data.get("session_id", session_id),
                turns=turns,
                candidate_text_only=data.get("candidate_text_only", "")
            )
        except Exception as e:
            print(f"[AssemblyAI] Failed to load cache: {e}. Re-transcribing...")
    api_key = os.environ.get("ASSEMBLYAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("ASSEMBLYAI_API_KEY not set in environment")

    aai.settings.api_key = api_key

    print(f"[AssemblyAI] Starting transcription with speaker diarization...")

    transcriber = aai.Transcriber()

    transcript = transcriber.transcribe(
        audio_url,
        config=aai.TranscriptionConfig(
            speaker_labels=True,     # enables diarization
            speakers_expected=2,    # interviewer + candidate
            speech_models=["universal-3-pro", "universal-2"],
            language_code="en"
        )
    )

    if transcript.status == aai.TranscriptStatus.error:
        raise RuntimeError(f"AssemblyAI transcription failed: {transcript.error}")

    # Build speaker turns from utterances
    raw_turns = []
    speaker_time = {}

    for utterance in transcript.utterances:
        spk = utterance.speaker  # "A" or "B"
        duration = (utterance.end - utterance.start) / 1000  # ms to seconds
        speaker_time[spk] = speaker_time.get(spk, 0) + duration

        raw_turns.append({
            "speaker": spk,
            "start_time": utterance.start / 1000,
            "end_time": utterance.end / 1000,
            "text": utterance.text
        })

    # Most-speaking speaker = CANDIDATE
    # In technical interviews, candidate speaks ~65% of the time
    candidate_speaker = max(speaker_time, key=speaker_time.get) if speaker_time else "A"

    # Rename speakers
    labeled_turns = []
    candidate_texts = []

    for turn in raw_turns:
        label = "CANDIDATE" if turn["speaker"] == candidate_speaker else "INTERVIEWER"
        labeled_turns.append(SpeakerTurn(
            speaker=label,
            start_time=turn["start_time"],
            end_time=turn["end_time"],
            text=turn["text"]
        ))
        if label == "CANDIDATE":
            candidate_texts.append(turn["text"])

    print(f"[AssemblyAI] ✅ Transcription complete: {len(labeled_turns)} utterances, "
          f"{len(set(t['speaker'] for t in raw_turns))} speakers detected")

    transcript_obj = Transcript(
        session_id=session_id,
        turns=labeled_turns,
        candidate_text_only=" ".join(candidate_texts)
    )

    # Save to cache so future retries don't incur credits
    try:
        with open(cache_path, "w") as f:
            json.dump(transcript_obj.dict(), f)
        print(f"[AssemblyAI] Saved transcript locally to {cache_path}")
    except Exception as e:
        print(f"[AssemblyAI] Failed to save cache: {e}")

    return transcript_obj
