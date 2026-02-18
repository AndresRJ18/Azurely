import azure.cognitiveservices.speech as speechsdk
from app.core.config import settings
from app.core.exceptions import TranscriptionError
from app.utils.audio import split_audio
from app.utils.cleanup import cleanup_files

def transcribe_audio(wav_path: str, language: str = "es-ES") -> str:
    """
    Transcribe un WAV completo dividiéndolo en chunks si es necesario.
    """
    chunks = split_audio(wav_path)
    full_transcription = []

    for chunk_path in chunks:
        text = _transcribe_chunk(chunk_path, language)
        full_transcription.append(text)

    # limpia chunks intermedios — el wav original lo limpia analyze.py
    if len(chunks) > 1:
        cleanup_files(*chunks)

    result = " ".join(full_transcription)

    if not result.strip():
        raise TranscriptionError("No speech detected in audio file")

    return result

def _transcribe_chunk(wav_path: str, language: str) -> str:
    """Transcribe un chunk individual."""
    speech_config = speechsdk.SpeechConfig(
        subscription=settings.AZURE_SPEECH_KEY,
        region=settings.AZURE_SPEECH_REGION
    )
    speech_config.speech_recognition_language = language
    audio_config = speechsdk.audio.AudioConfig(filename=wav_path)
    recognizer = speechsdk.SpeechRecognizer(
        speech_config=speech_config,
        audio_config=audio_config
    )

    result_text = []
    done = False

    def handle_result(evt):
        if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
            result_text.append(evt.result.text)

    def handle_canceled(evt):
        if evt.result.reason == speechsdk.ResultReason.Canceled:
            details = evt.result.cancellation_details
            raise TranscriptionError(details.error_details)

    def stop(evt):
        nonlocal done
        done = True

    recognizer.recognized.connect(handle_result)
    recognizer.canceled.connect(handle_canceled)
    recognizer.session_stopped.connect(stop)

    recognizer.start_continuous_recognition()

    import time
    timeout = 300
    elapsed = 0
    while not done and elapsed < timeout:
        time.sleep(0.5)
        elapsed += 0.5

    recognizer.stop_continuous_recognition()

    return " ".join(result_text)