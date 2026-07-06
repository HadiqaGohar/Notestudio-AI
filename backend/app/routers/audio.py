from fastapi import APIRouter
from app.models import AudioRequest

router = APIRouter()


@router.post("/audio")
async def audio_overview(req: AudioRequest):
    return {"message": "Audio feature coming soon"}
