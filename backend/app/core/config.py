from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Azure Speech
    AZURE_SPEECH_KEY: str
    AZURE_SPEECH_REGION: str

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_KEY: str
    AZURE_OPENAI_DEPLOYMENT: str

    # App
    MAX_AUDIO_SIZE_MB: int = 25
    TEMP_DIR: str = "/tmp/azurely"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

# instancia global — se importa desde cualquier módulo
settings = Settings()