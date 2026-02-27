from fastapi import APIRouter
import azure.cognitiveservices.speech as speechsdk
from openai import OpenAI
from app.core.config import settings

router = APIRouter()

@router.get("/")
async def health_check():
    """Verifica que el servidor está vivo y las credenciales Azure responden."""
    
    azure_speech_ok = False
    azure_openai_ok = False

    # verifica Speech — solo instancia el config, no consume cuota
    try:
        speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION
        )
        azure_speech_ok = True
    except Exception:
        pass

    # verifica OpenAI — request mínimo para validar conectividad
    try:
        client = OpenAI(
            base_url=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_KEY
        )
        client.chat.completions.create(
            model=settings.AZURE_OPENAI_DEPLOYMENT,
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=1
        )
        azure_openai_ok = True
    except Exception as e:
        print(f"OpenAI error: {e}")
        pass

    return {
        "status": "ok",
        "service": "Azurely API",
        "azure_speech": "connected" if azure_speech_ok else "error",
        "azure_openai": "connected" if azure_openai_ok else "error"
    }