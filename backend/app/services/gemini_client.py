from app.config import settings
import httpx


async def chat_completion(source_text: str, question: str) -> str:
    system_prompt = (
        "You are a helpful assistant. Answer ONLY based on the provided source text. "
        "If the answer isn't in the source, say 'I don't have enough information to answer that.'"
    )
    user_prompt = f"Source text:\n\n{source_text}\n\nQuestion: {question}"

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
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def generate_summary(source_text: str) -> str:
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
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def generate_image_prompt(source_text: str) -> str:
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
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
