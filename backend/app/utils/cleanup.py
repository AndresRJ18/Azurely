import os
import logging

logger = logging.getLogger(__name__)

def delete_file(path: str) -> None:
    """Elimina un archivo temporal, sin lanzar excepción si no existe."""
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except OSError as e:
        # log pero no interrumpe el flujo — cleanup es best effort
        logger.warning(f"Could not delete temp file {path}: {e}")

def cleanup_files(*paths: str) -> None:
    """Elimina múltiples archivos de una vez."""
    for path in paths:
        delete_file(path)