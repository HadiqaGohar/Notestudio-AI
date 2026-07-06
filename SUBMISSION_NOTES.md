# NoteStudio AI — Submission Notes

## What It Does

NoteStudio AI is a lightweight NotebookLM clone that transforms source text into multiple AI-generated formats using **only free tools and APIs**. Users paste any text (notes, articles, transcripts) and can:

1. **Chat/Q&A** — Ask questions grounded in the source text. Responses are strictly based on the provided material, not general knowledge.
2. **Audio Overview** — Generate a narrated podcast-style audio summary (60–90 seconds).
3. **Image Generation** — Create an illustrative image representing the content.
4. **Video Generation** — Produce a slideshow video combining AI-generated images with narrated audio.

## Tech Stack

### Frontend
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** for styling
- Deployed on **Vercel**

### Backend
- **Python FastAPI** with async endpoints
- **edge-tts** — Free text-to-speech (Microsoft Edge TTS, no API key needed)
- **moviepy + ffmpeg** — Video assembly from images + audio
- **Pillow** — Image manipulation for video frames
- **httpx** — Async HTTP client for API calls

### AI Services (All Free)
- **Gemini 4 31B** via OpenRouter (free tier) — Powers chat responses, narration scripts, and image prompts
- **Pollinations.ai** — Free image generation (no API key required)
- **OpenRouter fallback** — Free Recraft V4 model for image generation if Pollinations fails
- **edge-tts** — Free Microsoft Edge TTS voices

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://notestudio-ai.vercel.app |
| Backend | https://hadiqagohar-notestudio-ai-backend.hf.space |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat` | Chat Q&A (body: `source_text`, `question`) |
| `POST` | `/api/audio` | Generate audio overview (body: `source_text`) |
| `POST` | `/api/image` | Generate image (body: `source_text`) |
| `POST` | `/api/video` | Generate video (body: `source_text`) |

## Environment Variables

### Backend (set as Hugging Face Space secrets)
| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for free Gemini model access |

### Frontend (set in Vercel dashboard)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g., `https://hadiqagohar-notestudio-ai-backend.hf.space`) |

## Known Limitations

1. **Rate Limits** — The free tier of OpenRouter has rate limits (~20 requests/minute). Heavy usage may trigger 429 errors. The backend handles these gracefully with clear error messages.

2. **Video Generation Time** — Video generation can take 1–3 minutes as it orchestrates multiple AI services (script → TTS → image prompts → image generation → video assembly). The frontend shows a loading spinner during this process.

3. **Image Quality** — Pollinations.ai provides free image generation which may occasionally be slower or less consistent than paid alternatives. The OpenRouter fallback (Recraft V4) provides an additional safety net.

4. **Cold Starts** — Hugging Face Spaces on the free tier may have cold start delays of 20–60 seconds after periods of inactivity.

5. **Source Text Length** — The frontend enforces a 50,000 character limit. Longer texts are truncated to stay within LLM context windows.

6. **Single Narrator Audio** — Audio generation uses a single voice (`en-US-GuyNeural`). Multi-speaker or multi-language voices are not currently supported.
