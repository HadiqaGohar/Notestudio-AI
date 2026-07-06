from fastapi import APIRouter
from app.models import VideoRequest

router = APIRouter()


@router.post("/video")
async def generate_video(req: VideoRequest):
    return {"message": "Video feature coming soon"}
