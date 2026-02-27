# imagen base slim — menos peso que la full
FROM python:3.13-slim

# instala ffmpeg como dependencia del sistema
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# directorio de trabajo
WORKDIR /app

# copia requirements primero — aprovecha cache de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copia el resto del código
COPY app/ ./app/

# crea el directorio temp para audios
RUN mkdir -p /tmp/azurely

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
