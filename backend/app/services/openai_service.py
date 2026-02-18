from openai import OpenAI
from app.core.config import settings
from app.core.exceptions import AnalysisError
from app.models.meeting import MeetingSummary, ActionItem
import json

SYSTEM_PROMPT = """
Eres un asistente especializado en analizar transcripciones de reuniones.
Responde SIEMPRE en JSON válido con esta estructura exacta, sin texto extra:
{
  "summary": "resumen ejecutivo en 3-5 oraciones",
  "key_points": ["punto clave 1", "punto clave 2"],
  "action_items": [
    {"task": "descripción de la tarea", "assignee": "nombre o null", "deadline": "fecha o null"}
  ],
  "duration_estimate": "estimación en minutos o null"
}
"""

def analyze_transcription(transcription: str, language: str = "es-ES") -> MeetingSummary:
    """
    Envía la transcripción a Azure OpenAI y parsea la respuesta
    al modelo MeetingSummary.
    """
    client = OpenAI(
    base_url="https://azurely-openai.openai.azure.com/openai/v1",
    api_key=settings.AZURE_OPENAI_KEY
)

    try:
        response = client.chat.completions.create(
            model=settings.AZURE_OPENAI_DEPLOYMENT,  # deployment name, no model name
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analiza esta transcripción:\n\n{transcription}"}
            ],
            temperature=0.3,   # bajo para respuestas consistentes y estructuradas
            max_tokens=1500
        )

        raw = response.choices[0].message.content.strip()

        # limpia posibles markdown fences que el modelo a veces agrega
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        data = json.loads(raw)

        return MeetingSummary(
            summary=data["summary"],
            key_points=data["key_points"],
            action_items=[ActionItem(**item) for item in data.get("action_items", [])],
            transcription=transcription,
            language_detected=language,
            duration_estimate=data.get("duration_estimate")
        )

    except json.JSONDecodeError as e:
        raise AnalysisError(f"Could not parse OpenAI response as JSON: {e}")
    except Exception as e:
        raise AnalysisError(str(e))