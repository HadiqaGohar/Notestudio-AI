from fastapi import APIRouter
from app.models import ImageRequest

router = APIRouter()


@router.post("/image")
async def generate_image(req: ImageRequest):
    return {"message": "Image feature coming soon"}
