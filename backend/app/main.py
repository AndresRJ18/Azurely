from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging


from app.core.config import settings
from app.api.routes import health, analyze


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup — crea directorio temp si no existe
    os.makedirs(settings.TEMP_DIR, exist_ok=True)
    yield
    # shutdown — cleanup si es necesario (cleanup.py lo maneja por request)


app = FastAPI(
    title="Azurely API",
    description="Meeting audio analysis using Azure Speech + OpenAI",
    version="0.1.0",
    lifespan=lifespan
)

# CORS abierto para desarrollo — el frontend de tus compañeros puede consumir sin problemas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)