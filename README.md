# NoteStudio AI

A lightweight AI content studio inspired by Google's NotebookLM, built entirely with free tools.

## Features

- **Chat/Q&A** — Ask questions grounded in source text
- **Audio Overview** — Short narrated/podcast-style audio summary
- **Image Generation** — Illustrative images from content/topic
- **Video** — Slideshow-style video combining images + narration

## Tech Stack

- Frontend: Next.js (App Router, TypeScript, Tailwind CSS)
- Backend: Python FastAPI
- LLM: Gemini via OpenRouter (free tier)
- TTS: edge-tts (free, open-source)
- Image Generation: Pollinations.ai / OpenRouter
- Video Assembly: moviepy + ffmpeg

## Prerequisites

### ffmpeg

**ffmpeg must be installed** for video generation to work. The video builder uses ffmpeg for audio duration detection and video encoding.

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update && sudo apt install ffmpeg
```

#### Windows
Download from https://ffmpeg.org/download.html and add to your PATH.

## Getting Started (Local Development)

1. Clone the repository
2. Set up environment variables:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your OPENROUTER_API_KEY

   # Frontend
   cp frontend/.env.example frontend/.env
   ```
3. Install and run backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
4. Install and run frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Open http://localhost:3000

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Set the **Root Directory** to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://<your-render-backend-url>.onrender.com`
5. Deploy

### Backend (Render)

1. Push to GitHub (or it will auto-deploy from the same repo)
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3.12
   - **Build Command**: `chmod +x ./bin/install_ffmpeg.sh && ./bin/install_ffmpeg.sh && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable:
   - `OPENROUTER_API_KEY` = your key
6. Deploy

Alternatively, use the included `render.yaml` for one-click deployment via the Render dashboard.

## API Endpoints

- `GET /api/health` — Health check
- `POST /api/chat` — Chat with source text
- `POST /api/audio` — Generate audio overview
- `POST /api/image` — Generate illustrative image
- `POST /api/video` — Generate video with images + narration

## Local Development with Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
