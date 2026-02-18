# Azurely 🎙️

<div align="center">

![Azurely Banner](https://img.shields.io/badge/Azurely-Meeting%20AI%20Summarizer-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)

**Transform your meeting recordings into actionable summaries — powered by Azure AI**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Azure Speech](https://img.shields.io/badge/Azure%20Speech-SDK-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/en-us/products/ai-services/speech-to-text)
[![Azure OpenAI](https://img.shields.io/badge/Azure%20OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Overview

**Azurely** is an AI-powered meeting summarizer that takes audio recordings and returns structured summaries, key points, and action items — all in seconds.

Upload an audio file → get a full transcription + executive summary + action items. Built with **Azure Speech Service** for transcription and **Azure OpenAI** for intelligent analysis.

---

## 🚀 Features

- 🎧 **Multi-format audio support** — MP3, WAV, M4A, OGG, MP4
- 📝 **Full transcription** — powered by Azure Speech SDK with continuous recognition
- 🤖 **AI analysis** — executive summary, key points, and action items via GPT-4o-mini
- ⚡ **Chunk processing** — handles long recordings by splitting into 2-minute segments
- 🌍 **Multilingual** — supports es-ES, es-MX, en-US, en-GB, pt-BR
- 🔒 **Auto cleanup** — temporary files deleted after every request

---

## 🏗️ Architecture

```
Audio Upload (MP3/WAV/M4A)
        ↓
  Format Validation
        ↓
  ffmpeg Conversion
  (→ WAV 16kHz mono)
        ↓
  Audio Chunking
  (2-min segments)
        ↓
  Azure Speech SDK
  (Transcription)
        ↓
  Azure OpenAI
  (GPT-4o-mini Analysis)
        ↓
  JSON Response
  (Summary + Action Items)
```

---

## 📁 Project Structure

```
azurely/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app, CORS, lifespan
│   │   ├── core/
│   │   │   ├── config.py          # pydantic-settings
│   │   │   └── exceptions.py      # custom HTTP exceptions
│   │   ├── models/
│   │   │   ├── meeting.py         # MeetingSummary, ActionItem
│   │   │   └── requests.py        # AnalyzeRequest
│   │   ├── services/
│   │   │   ├── speech.py          # Azure Speech STT
│   │   │   └── openai_service.py  # Azure OpenAI analysis
│   │   ├── utils/
│   │   │   ├── audio.py           # ffmpeg conversion + chunking
│   │   │   └── cleanup.py         # temp file cleanup
│   │   └── api/
│   │       ├── dependencies.py    # file validation
│   │       └── routes/
│   │           ├── health.py      # GET /health
│   │           └── analyze.py     # POST /api/analyze
│   ├── .env.example
│   ├── requirements.txt
│   └── requirements-dev.txt
└── frontend/
    ├── index.html
    └── assets/
        ├── css/styles.css
        └── js/
            ├── api.js
            ├── ui.js
            └── main.js
```

---

## ⚙️ Setup

### Prerequisites

- Python 3.13+
- [ffmpeg](https://ffmpeg.org/download.html) installed and in PATH
- Azure account with:
  - Azure Speech Service resource
  - Azure OpenAI resource with a deployed model

### Installation

```bash
# Clone the repo
git clone https://github.com/AndresRJ18/Azurely.git
cd Azurely/backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
# source venv/bin/activate    # Linux/Mac

# Install dependencies
pip install -r requirements-dev.txt

# Configure environment
cp .env.example .env
# Edit .env with your Azure credentials
```

### Environment Variables

```bash
# .env
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=eastus
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/openai/v1
AZURE_OPENAI_KEY=your_openai_key
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
MAX_AUDIO_SIZE_MB=25
TEMP_DIR=/tmp/azurely
```

### Run

```bash
python -m uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000`
Swagger UI at `http://localhost:8000/docs`

---

## 📡 API Reference

### `GET /health`

Verifica conectividad con Azure Speech y Azure OpenAI.

```json
{
  "status": "ok",
  "service": "Azurely API",
  "azure_speech": "connected",
  "azure_openai": "connected"
}
```

### `POST /api/analyze`

Analiza un archivo de audio y retorna el resumen.

**Request** — `multipart/form-data`

| Field | Type | Required | Default |
|-------|------|----------|---------|
| file | audio file | ✅ | — |
| language | string (BCP-47) | ❌ | `es-ES` |

**Response**

```json
{
  "summary": "Resumen ejecutivo de la reunión...",
  "key_points": [
    "Punto clave 1",
    "Punto clave 2"
  ],
  "action_items": [
    {
      "task": "Enviar el plan de medios",
      "assignee": "Carlos",
      "deadline": "viernes"
    }
  ],
  "transcription": "Transcripción completa del audio...",
  "language_detected": "es-ES",
  "duration_estimate": "5 minutos"
}
```

**Supported languages**

| Code | Language |
|------|----------|
| `es-ES` | Español (España) |
| `es-MX` | Español (México) |
| `en-US` | English (US) |
| `en-GB` | English (UK) |
| `pt-BR` | Português (Brasil) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | FastAPI |
| Speech-to-Text | Azure Speech SDK |
| AI Analysis | Azure OpenAI (GPT-4o-mini) |
| Audio processing | ffmpeg + ffmpeg-python |
| Config management | pydantic-settings |
| Async file I/O | aiofiles |

---

## 👥 Team

Built at a hackathon by a team of 4 Informatics Engineering students.

| Role | Scope |
|------|-------|
| Backend | FastAPI, Azure services, audio pipeline |
| Frontend | UI, file upload, results rendering |
| DevOps | Docker, Azure Container Apps deployment |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❤️ using Azure AI Services</sub>
</div>
