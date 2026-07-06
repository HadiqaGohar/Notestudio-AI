import os
import asyncio
from app.config import settings
from app.services import gemini_client, tts_service, image_service
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips


async def generate_video(source_text: str, output_path: str) -> str:
    outline_prompt = (
        "Break the following text into 3-5 key points. "
        "Return them as a numbered list, one per line.\n\n"
        f"Text:\n\n{source_text}"
    )

    outline_text = await gemini_client.generate_summary(source_text)
    points = [p.strip() for p in outline_text.split("\n") if p.strip()][:5]

    if not points:
        points = [source_text[:200]]

    slides = []
    for i, point in enumerate(points):
        img_path = os.path.join(settings.temp_dir, f"slide_{i}.png")
        audio_path = os.path.join(settings.temp_dir, f"slide_{i}.mp3")

        await image_service.generate_image(point, img_path)
        await tts_service.text_to_speech(point, audio_path)

        slides.append((img_path, audio_path))

    clips = []
    for img_path, audio_path in slides:
        audio_clip = AudioFileClip(audio_path)
        img_clip = ImageClip(img_path).set_duration(audio_clip.duration)
        img_clip = img_clip.set_audio(audio_clip)
        clips.append(img_clip)

    final = concatenate_videoclips(clips, method="compose")
    final.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac")
    final.close()

    return output_path
