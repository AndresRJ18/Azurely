import os
import uuid
import ffmpeg
from pathlib import Path
from app.core.config import settings
from app.core.exceptions import UnsupportedAudioFormatError, AudioTooLargeError

SUPPORTED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".mp4"}

# detecta si estamos en Linux (Docker) o Windows (local)
FFMPEG_PATH = "/usr/bin/ffmpeg" if os.name != "nt" else r"C:\Users\andre\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe"
FFPROBE_PATH = "/usr/bin/ffprobe" if os.name != "nt" else FFMPEG_PATH.replace("ffmpeg.exe", "ffprobe.exe")

def validate_audio(filename: str, size_bytes: int) -> None:
    ext = Path(filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise UnsupportedAudioFormatError(ext)
    
    size_mb = size_bytes / (1024 * 1024)
    if size_mb > settings.MAX_AUDIO_SIZE_MB:
        raise AudioTooLargeError(size_mb)

def convert_to_wav(input_path: str) -> str:
    """Convierte cualquier audio a WAV 16kHz mono."""
    output_path = os.path.join(settings.TEMP_DIR, f"{uuid.uuid4()}.wav")
    
    (
        ffmpeg
        .input(input_path)
        .output(output_path, ar=16000, ac=1, format="wav")
        .overwrite_output()
        .run(cmd=FFMPEG_PATH, quiet=True)
    )
    
    return output_path

def split_audio(wav_path: str, chunk_minutes: int = 2) -> list[str]:
    """Divide un WAV en chunks de chunk_minutes minutos."""
    probe = ffmpeg.probe(wav_path, cmd=FFPROBE_PATH)
    duration = float(probe["format"]["duration"])
    chunk_seconds = chunk_minutes * 60

    if duration <= chunk_seconds:
        return [wav_path]

    chunks = []
    start = 0
    index = 0

    while start < duration:
        chunk_path = os.path.join(
            settings.TEMP_DIR,
            f"{uuid.uuid4()}_chunk{index}.wav"
        )
        (
            ffmpeg
            .input(wav_path, ss=start, t=chunk_seconds)
            .output(chunk_path, ar=16000, ac=1, format="wav")
            .overwrite_output()
            .run(cmd=FFMPEG_PATH, quiet=True)
        )
        chunks.append(chunk_path)
        start += chunk_seconds
        index += 1

    return chunks

async def save_upload(file) -> str:
    """Guarda el archivo subido en TEMP_DIR con nombre único."""
    import aiofiles
    
    os.makedirs(settings.TEMP_DIR, exist_ok=True)
    
    ext = Path(file.filename).suffix.lower()
    temp_path = os.path.join(settings.TEMP_DIR, f"{uuid.uuid4()}{ext}")
    
    async with aiofiles.open(temp_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    return temp_path