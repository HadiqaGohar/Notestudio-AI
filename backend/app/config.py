from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    llm_model: str = "google/gemma-4-31b-it:free"
    image_model: str = "recraft/recraft-v4:free"
    tts_voice: str = "en-US-GuyNeural"
    cors_origins: list[str] = ["http://localhost:3000"]
    temp_dir: str = "/tmp/notestudio"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
