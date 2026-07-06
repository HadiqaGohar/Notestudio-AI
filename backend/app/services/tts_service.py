import edge_tts
import os
from app.config import settings


async def text_to_speech(text: str, output_path: str) -> str:
    communicate = edge_tts.Communicate(text, settings.tts_voice)
    await communicate.save(output_path)
    return output_path
