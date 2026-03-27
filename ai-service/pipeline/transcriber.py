import hashlib
import urllib.request
import assemblyai as aai
import os
import json
from models.transcript import SpeakerTurn, Transcript


def _get_content_hash_in_memory(url: str) -> str:
    """Download and hash the audio content in memory without touching disk."""
    print(f"[Cache] Downloading and hashing audio in memory...")
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            sha256_hash = hashlib.sha256()
            while True:
                chunk = response.read(65536)
                if not chunk:
                    break
                sha256_hash.update(chunk)
        digest = sha256_hash.hexdigest()
        print(f"[Cache] Content hash: {digest[:12]}...")
        return digest
    except Exception as e:
        print(f"[Cache] Warning: Failed to stream/hash: {e}.")
        return ""


def transcribe_and_diarize(audio_url: str, session_id: str) -> Transcript:
    """
    Single API call to AssemblyAI.
    Uses persistent content-based caching to save credits.
    """
    # 1. Setup paths
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cache_dir = os.path.join(project_root, "cache")
    os.makedirs(cache_dir, exist_ok=True)

    # 2. Hash in memory with model version for cache invalidation
    content_hash = _get_content_hash_in_memory(audio_url)
    TRANSCRIPTION_MODEL = os.environ.get("TRANSCRIPTION_MODEL", "universal-3-pro")
    
    if content_hash:
        cache_path = os.path.join(cache_dir, f"content_{TRANSCRIPTION_MODEL}_{content_hash}.json")
    else:
        cache_path = os.path.join(cache_dir, f"transcript_{TRANSCRIPTION_MODEL}_{session_id}.json")
    
    if os.path.exists(cache_path):
        print(f"[AssemblyAI] ⚡ Found cached transcript, loading from disk!")
        try:
            with open(cache_path, "r") as f:
                data = json.load(f)
            return Transcript(
                session_id=session_id,
                audio_hash=content_hash,
                turns=[SpeakerTurn(**t) for t in data.get("turns", [])],
                candidate_text_only=data.get("candidate_text_only", "")
            )
        except Exception as e:
            print(f"[AssemblyAI] Failed to load cache: {e}. Re-transcribing...")

    # 3. Transcribe if no cache
    api_key = os.environ.get("ASSEMBLYAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("ASSEMBLYAI_API_KEY not set in environment or is empty")

    aai.settings.api_key = api_key
    print(f"[AssemblyAI] API key configured (ends ...{api_key[-4:]})")

    transcriber = aai.Transcriber()
    
    # Pass the presigned URL directly to AssemblyAI
    print(f"[AssemblyAI] Requesting remote transcription via presigned URL...")
    transcript = transcriber.transcribe(
        audio_url,
        config=aai.TranscriptionConfig(
            speaker_labels=True,
            speakers_expected=2,
            speech_models=["universal-3-pro", "universal-2"],
            language_code="en"
        )
    )

    if transcript.status == aai.TranscriptStatus.error:
        raise RuntimeError(f"AssemblyAI transcription failed: {transcript.error}")

    # Build transcript object
    raw_turns = []
    speaker_time = {}
    for utterance in transcript.utterances:
        spk = utterance.speaker
        duration = (utterance.end - utterance.start) / 1000
        speaker_time[spk] = speaker_time.get(spk, 0) + duration
        raw_turns.append({
            "speaker": spk,
            "start_time": utterance.start / 1000,
            "end_time": utterance.end / 1000,
            "text": utterance.text
        })

    candidate_speaker = max(speaker_time, key=speaker_time.get) if speaker_time else "A"
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

    transcript_obj = Transcript(
        session_id=session_id,
        audio_hash=content_hash,
        turns=labeled_turns,
        candidate_text_only=" ".join(candidate_texts)
    )

    # 4. Save to Cache and Cleanup
    try:
        with open(cache_path, "w") as f:
            json.dump(transcript_obj.dict(), f)
        print(f"[AssemblyAI] Saved transcript to cache: {os.path.basename(cache_path)}")
        
        if content_hash:
            session_link = os.path.join(cache_dir, f"transcript_{session_id}.json")
            with open(session_link, "w") as f:
                json.dump(transcript_obj.dict(), f)
    except Exception as e:
        print(f"[AssemblyAI] Failed to save cache: {e}")

    return transcript_obj
