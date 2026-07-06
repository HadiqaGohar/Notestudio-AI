from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import chat, audio, image, video
import os

PORT = int(os.environ.get("PORT", 8000))

app = FastAPI(title="NoteStudio AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUDIO_DIR = os.path.join(settings.temp_dir, "audio")
IMAGES_DIR = os.path.join(settings.temp_dir, "images")
VIDEOS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")
app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")
app.mount("/videos", StaticFiles(directory=VIDEOS_DIR), name="videos")

app.include_router(chat.router, prefix="/api")
app.include_router(audio.router, prefix="/api")
app.include_router(image.router, prefix="/api")
app.include_router(video.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "NoteStudio AI"}
