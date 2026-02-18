from app.core.config import settings
from app.core.exceptions import AudioTooLargeError, UnsupportedAudioFormatError
from fastapi import UploadFile, File
from pathlib import Path

SUPPORTED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".mp4"}

async def validate_audio_file(file: UploadFile = File(...)) -> UploadFile:
    ext = Path(file.filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise UnsupportedAudioFormatError(ext)
    
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_AUDIO_SIZE_MB:
        raise AudioTooLargeError(size_mb)
    
    await file.seek(0)
    return file