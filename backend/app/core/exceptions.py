from fastapi import HTTPException, status

class AudioTooLargeError(HTTPException):
    def __init__(self, size_mb: float):
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file too large: {size_mb:.1f}MB. Max allowed: 25MB"
        )

class UnsupportedAudioFormatError(HTTPException):
    def __init__(self, fmt: str):
        super().__init__(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported audio format: {fmt}. Accepted: mp3, wav, m4a, ogg"
        )

class TranscriptionError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Azure Speech transcription failed: {detail}"
        )

class AnalysisError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Azure OpenAI analysis failed: {detail}"
        )