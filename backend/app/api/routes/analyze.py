from fastapi import APIRouter, UploadFile, File, Form, Depends
from app.api.dependencies import validate_audio_file
from app.utils.audio import save_upload, convert_to_wav
from app.utils.cleanup import cleanup_files
from app.services.speech import transcribe_audio
from app.services.openai_service import analyze_transcription
from app.models.meeting import MeetingSummary
import logging
import time

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze", response_model=MeetingSummary)
async def analyze_meeting(
    language: str = Form(default="es-ES"),
    file: UploadFile = Depends(validate_audio_file)
):
    original_path = None
    wav_path = None
    start_time = time.time()

    try:
        logger.info(f"Audio recibido: {file.filename}")

        original_path = await save_upload(file)
        logger.info(f"Audio guardado en: {original_path}")

        wav_path = convert_to_wav(original_path)
        logger.info(f"Conversión a WAV completada")

        transcription = transcribe_audio(wav_path, language)
        logger.info(f"Transcripción completada: {len(transcription.split())} palabras")

        result = analyze_transcription(transcription, language)
        elapsed = round(time.time() - start_time, 2)
        logger.info(f"Análisis completado en {elapsed}s")

        return result

    finally:
        cleanup_files(original_path, wav_path)



        """
    Pipeline completo:
    1. Valida el audio (dependencies.py)
    2. Guarda en temp
    3. Convierte a WAV 16kHz mono
    4. Transcribe con Azure Speech
    5. Analiza con Azure OpenAI
    6. Limpia archivos temporales
    """