
import os
import sys
import json
import shutil
from unittest.mock import MagicMock, patch

# Add the project root to sys.path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from pipeline.transcriber import transcribe_and_diarize
from models.transcript import Transcript, SpeakerTurn

def test_transcription_caching():
    session_id = "test_session_123"
    cache_dir = os.path.join(project_root, "cache")
    cache_path = os.path.join(cache_dir, f"transcript_{session_id}.json")
    
    # Ensure clean state
    if os.path.exists(cache_path):
        os.remove(cache_path)
    
    # Mock data
    mock_transcript_obj = Transcript(
        session_id=session_id,
        turns=[SpeakerTurn(speaker="CANDIDATE", start_time=0, end_time=1, text="Hello test")],
        candidate_text_only="Hello test"
    )

    print("\n--- Test 1: Run without cache ---")
    with patch("assemblyai.Transcriber") as MockTranscriber:
        # Mock urllib.request.urlopen
        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_response = MagicMock()
            mock_response.read.side_effect = [b"audio_data", b""] # return some data then empty
            mock_response.__enter__.return_value = mock_response
            mock_urlopen.return_value = mock_response

            # Configure the assemblyai mock
            mock_aai_transcript = MagicMock()
            mock_aai_transcript.status = "completed"
            mock_aai_transcript.utterances = [
                MagicMock(speaker="A", start=0, end=1000, text="Hello test")
            ]
            MockTranscriber.return_value.transcribe.return_value = mock_aai_transcript
            
            with patch.dict(os.environ, {"ASSEMBLYAI_API_KEY": "dummy"}):
                result = transcribe_and_diarize("http://example.com/audio.mp3", session_id)
                
                assert result.session_id == session_id
                assert len(result.turns) == 1
                assert os.path.exists(cache_path), f"Cache file should be created at {cache_path}"
                print("✅ Test 1 Passed: Transcription called and cache created.")

    print("\n--- Test 2: Run with cache ---")
    with patch("assemblyai.Transcriber") as MockTranscriber:
        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_response = MagicMock()
            mock_response.read.side_effect = [b"audio_data", b""]
            mock_response.__enter__.return_value = mock_response
            mock_urlopen.return_value = mock_response

            with patch.dict(os.environ, {"ASSEMBLYAI_API_KEY": "dummy"}):
                result_cached = transcribe_and_diarize("http://example.com/audio.mp3", session_id)
                
                assert result_cached.session_id == session_id
                assert len(result_cached.turns) == 1
                assert MockTranscriber.call_count == 0, "Transcriber should NOT be called when cache is present"
                print("✅ Test 2 Passed: Loaded from cache, API not called.")

    # Cleanup
    if os.path.exists(cache_path):
        os.remove(cache_path)
    print("\n--- All Caching Tests Passed! ---")

if __name__ == "__main__":
    try:
        test_transcription_caching()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
