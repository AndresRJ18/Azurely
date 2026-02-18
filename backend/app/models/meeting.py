from pydantic import BaseModel
from typing import Optional

class ActionItem(BaseModel):
    task: str
    assignee: Optional[str] = None   # puede no mencionarse en la reunión
    deadline: Optional[str] = None   # idem

class MeetingSummary(BaseModel):
    summary: str                      # resumen ejecutivo 3-5 oraciones
    key_points: list[str]             # puntos clave de la reunión
    action_items: list[ActionItem]    # tareas identificadas
    transcription: str                # texto completo del audio
    language_detected: str            # idioma usado en el análisis
    duration_estimate: Optional[str] = None