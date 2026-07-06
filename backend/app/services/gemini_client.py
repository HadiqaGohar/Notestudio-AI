from app.config import settings
import httpx


async def chat_completion(source_text: str, question: str) -> str:
    """Call OpenRouter's API with a free Google model, grounded in source text."""
    system_prompt = (
        "You are NoteStudio AI, a research assistant that answers questions "
        "strictly based on the provided source material. Rules:\n"
        "1. ONLY use information found in the source text.\n"
        "2. If the answer cannot be found in the source, say: "
        "\"I couldn't find information about that in the provided source material.\"\n"
        "3. Do NOT use your general knowledge to fill in gaps.\n"
        "4. Keep answers concise and direct.\n"
        "5. When relevant, quote or reference the specific part of the source."
    )
    user_prompt = f"<source_text>\n{source_text}\n</source_text>\n\nQuestion: {question}"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.llm_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.3,
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def generate_summary(source_text: str) -> str:
    """Generate a concise audio narration summary from source text."""
    prompt = (
        "Generate a concise 2-3 paragraph audio summary of the following text. "
        "Make it suitable for narration, with natural pauses and clear structure.\n\n"
        f"Text:\n\n{source_text}"
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.llm_model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.5,
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def generate_image_prompt(source_text: str) -> str:
    """Generate a descriptive image prompt from source text."""
    prompt = (
        "Based on the following text, generate a short, descriptive image prompt "
        "that would make a good illustrative image. Return ONLY the prompt, nothing else.\n\n"
        f"Text:\n\n{source_text}"
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.llm_model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
