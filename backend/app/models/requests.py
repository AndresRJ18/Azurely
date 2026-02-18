from pydantic import BaseModel, field_validator
from fastapi import UploadFile

SUPPORTED_FORMATS = {"audio/mpeg", "audio/wav", "audio/x-wav", "audio/m4a", "audio/ogg", "audio/mp4"}
SUPPORTED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".mp4"}

class AnalyzeRequest(BaseModel):
    language: str = "es-ES"  # idioma para Azure Speech, default español

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        # formato BCP-47 requerido por Azure Speech
        supported = {"es-ES", "es-MX", "en-US", "en-GB", "pt-BR"}
        if v not in supported:
            raise ValueError(f"Language {v} not supported. Use: {supported}")
        return v