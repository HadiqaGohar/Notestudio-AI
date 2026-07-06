from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import chat, audio, image, video
import os

app = FastAPI(title="NoteStudio AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.temp_dir, exist_ok=True)
app.mount("/temp", StaticFiles(directory=settings.temp_dir), name="temp")

app.include_router(chat.router, prefix="/api")
app.include_router(audio.router, prefix="/api")
app.include_router(image.router, prefix="/api")
app.include_router(video.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "NoteStudio AI"}
