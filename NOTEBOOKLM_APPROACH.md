# NotebookLM Portal Integration — Complete Approach

## Assignment Requirement

> "NotebookLM ko kis tarah configure kar sakte hain apne portal mein? Kya kya cheezein banwa sakte hain using NotebookLM — with or without API? Any command you give to your agent — generate video workflow etc."

This document covers **both approaches** (with API and without API), with working code examples, and explains our final implementation.

---

## 1. With API — Official Google NotebookLM API

### Status: NO Official Public API Exists

Google NotebookLM has **no official REST API, no OAuth developer API, no Google Cloud endpoint, and no API key system**. The URL `https://developers.google.com/notebooklm` returns 404.

NotebookLM is a **consumer product** accessed only through the web UI at `https://notebooklm.google.com`. There is no documented way to programmatically create notebooks, add sources, or generate artifacts through an official API.

### What Would Be Needed (If API Existed)

```
Hypothetical API flow:
1. Authenticate via Google Cloud OAuth
2. POST /notebooks — Create notebook
3. POST /notebooks/{id}/sources — Add source (URL, text, PDF)
4. POST /notebooks/{id}/artifacts/audio — Generate audio overview
5. POST /notebooks/{id}/artifacts/video — Generate video overview
6. GET /notebooks/{id}/artifacts/{artifact_id}/download — Download result
```

### Enterprise Option (Paid)

Google offers NotebookLM through **Google Workspace** with Gemini Enterprise or Education Premium licenses, but even this is UI-only — no API for programmatic access.

---

## 2. Without API — Unofficial Automation Tools

Since no official API exists, the community has built tools that **reverse-engineer Google's internal RPC protocol** to control NotebookLM programmatically.

### 2A. `notebooklm-py` — The Primary Library

**GitHub:** `https://github.com/teng-lin/notebooklm-py` (17,300+ stars)
**PyPI:** `notebooklm-py` (v0.7.3)
**License:** MIT

#### Installation

```bash
pip install "notebooklm-py[browser]"
playwright install chromium
notebooklm login    # Opens browser for Google sign-in
```

#### CLI Commands

```bash
# Create notebook & add sources
notebooklm create "Solar Energy Research"
notebooklm source add "https://example.com/article"
notebooklm source add "./research-paper.pdf"
notebooklm source add-research "renewable energy 2024"

# Chat with notebook
notebooklm ask "What are the key findings?"

# Generate Audio Overview (Podcast)
notebooklm generate audio "make it engaging" --wait
notebooklm download audio ./podcast.mp3

# Generate Video Overview
notebooklm generate video --style whiteboard --wait
notebooklm generate cinematic-video "documentary style" --wait
notebooklm download video ./overview.mp4

# Generate Quiz
notebooklm generate quiz --difficulty hard
notebooklm download quiz --format markdown ./quiz.md

# Generate Flashcards
notebooklm generate flashcards --quantity more
notebooklm download flashcards --format json ./cards.json

# Generate Mind Map
notebooklm generate mind-map --kind interactive
notebooklm download mind-map ./mindmap.json

# Generate Slide Deck
notebooklm generate slide-deck
notebooklm download slide-deck ./slides.pptx

# Generate Infographic
notebooklm generate infographic --orientation portrait
notebooklm download infographic ./infographic.png

# Generate Data Table
notebooklm generate data-table "compare key concepts"
notebooklm download data-table ./data.csv

# Generate Report
notebooklm generate report --template "study guide"
notebooklm download report ./report.md
```

#### Python API

```python
import asyncio
from notebooklm import NotebookLMClient, MindMapKind

async def main():
    async with NotebookLMClient.from_storage() as client:
        # Create notebook
        nb = await client.notebooks.create("Research Notes")

        # Add sources
        await client.sources.add_url(nb.id, "https://example.com", wait=True)
        await client.sources.add_file(nb.id, "./paper.pdf", wait=True)

        # Chat
        result = await client.chat.ask(nb.id, "Summarize this paper")
        print(result.answer)

        # Generate audio overview
        status = await client.artifacts.generate_audio(
            nb.id, instructions="make it fun and engaging"
        )
        await client.artifacts.wait_for_completion(nb.id, status.task_id)
        await client.artifacts.download_audio(nb.id, "podcast.mp3")

        # Generate video
        status = await client.artifacts.generate_video(
            nb.id, style="whiteboard"
        )
        await client.artifacts.wait_for_completion(nb.id, status.task_id)
        await client.artifacts.download_video(nb.id, "video.mp4")

        # Generate quiz from sources
        status = await client.artifacts.generate_quiz(nb.id, difficulty="hard")
        await client.artifacts.wait_for_completion(nb.id, status.task_id)
        await client.artifacts.download_quiz(nb.id, "quiz.json", output_format="json")

        # Generate mind map
        await client.mind_maps.generate(nb.id, kind=MindMapKind.INTERACTIVE)
        await client.artifacts.download_mind_map(nb.id, "mindmap.json")

asyncio.run(main())
```

#### All Artifact Types

| Type | Code | Formats | Options |
|------|------|---------|---------|
| Audio Overview | 1 | MP3, MP4 | Deep-dive, brief, critique, debate; 50+ languages |
| Video Overview | 3 | MP4 | Classic, whiteboard, kawaii, anime, watercolor, retro, heritage, paper craft |
| Cinematic Video | 3 | MP4 | AI-generated footage (requires AI Ultra sub) |
| Slide Deck | 8 | PDF, PPTX | Detailed or presenter format, individual slide revision |
| Quiz | 4 | JSON, MD, HTML | Configurable difficulty and quantity |
| Flashcards | 4 | JSON, MD, HTML | Configurable difficulty and quantity |
| Mind Map | 5 | JSON | Interactive or note-backed |
| Infographic | 7 | PNG | 3 orientations, 3 detail levels |
| Report | 2 | Markdown | Briefing doc, study guide, blog post, custom |
| Data Table | 9 | CSV | Custom structure via natural language |

---

### 2B. MCP Server — Connecting AI Agents to NotebookLM

**Package:** `notebooklm-skill` (MCP server + Claude Code skill)

#### Install

```bash
pip install notebooklm-skill
# OR
uvx --from notebooklm-skill notebooklm-mcp
```

#### MCP Config (for Claude, Cursor, Gemini CLI)

```json
// .mcp.json
{
  "mcpServers": {
    "notebooklm": {
      "command": "uvx",
      "args": ["--from", "notebooklm-skill", "notebooklm-mcp"]
    }
  }
}
```

#### What AI Agents Can Do (13 MCP Tools)

| Tool | What It Does |
|------|-------------|
| `nlm_create_notebook` | Create notebook with sources |
| `nlm_list` | List all notebooks |
| `nlm_add_source` | Add source to notebook |
| `nlm_ask` | Ask question (returns answer + citations) |
| `nlm_summarize` | Get notebook summary |
| `nlm_generate` | Generate any artifact type |
| `nlm_download` | Download generated artifact |
| `nlm_list_sources` | List sources in notebook |
| `nlm_list_artifacts` | List generated artifacts |
| `nlm_research` | Deep web research |
| `nlm_research_pipeline` | Full research → content pipeline |
| `nlm_trend_research` | Trend analysis → content |
| `nlm_delete` | Delete notebook |

#### Pipeline Workflows (Agent Commands)

| Agent Says | What Happens |
|------------|-------------|
| "Research solar energy and make a podcast" | Create notebook → add sources → generate audio overview |
| "Make a quiz from this PDF" | Add PDF source → generate quiz → download |
| "Create a video workflow for this article" | Add source → generate video → download |
| "Research AI trends and make a presentation" | Deep research → generate slide deck → download PPTX |
| "Digest this RSS feed into a newsletter" | Parse RSS → batch process → generate report |

---

## 3. Why We Built a Clone Instead

| Approach | Problem |
|----------|---------|
| Official API | Does not exist |
| notebooklm-py | Reverse-engineered Google internals — can break anytime, ToS grey area |
| MCP Server | Same dependency on notebooklm-py, same risks |

**Decision:** Since the assignment required **free, reliable, production-safe** tools, we replicated NotebookLM's core outputs independently:

| NotebookLM Feature | Our Implementation | Tool |
|---------------------|---------------------|------|
| Chat (grounded Q&A) | LLM with source grounding | Gemini via OpenRouter |
| Audio Overview | Script generation + TTS | LLM + Edge-TTS |
| Video Overview | Script + TTS + image gen + video assembly | LLM + Edge-TTS + Pollinations + MoviePy |
| Image Generation | AI image from content | Pollinations.ai |

---

## 4. Live Demo

### Frontend (Vercel)
**https://notestudio-ai.vercel.app**

1. Paste any source text
2. **Chat** — Ask questions grounded in the source (anti-hallucination: won't answer from general knowledge)
3. **Audio** — Generate 60-90 second podcast-style overview
4. **Image** — Generate illustrative image
5. **Video** — Generate slideshow video with narration + images

### Backend (Hugging Face Spaces)
**https://hadiqagohar-notestudio-ai-backend.hf.space**

| Endpoint | Method | What It Does |
|----------|--------|-------------|
| `/api/chat` | POST | Grounded Q&A from source text |
| `/api/audio` | POST | Generate audio overview (MP3) |
| `/api/image` | POST | Generate image (PNG) |
| `/api/video` | POST | Generate video (MP4) |

### API Example (cURL)

```bash
# Chat
curl -X POST https://hadiqagohar-notestudio-ai-backend.hf.space/api/chat \
  -H "Content-Type: application/json" \
  -d '{"source_text": "Your notes here...", "question": "Summarize the key points"}'

# Audio Overview
curl -X POST https://hadiqagohar-notestudio-ai-backend.hf.space/api/audio \
  -H "Content-Type: application/json" \
  -d '{"source_text": "Your notes here..."}'

# Video Generation
curl -X POST https://hadiqagohar-notestudio-ai-backend.hf.space/api/video \
  -H "Content-Type: application/json" \
  -d '{"source_text": "Your notes here..."}'
```

---

## 5. Summary for Professor

### What We Researched
- NotebookLM has **no official API** — all programmatic access is through unofficial reverse-engineered tools
- `notebooklm-py` (17K+ stars) can generate audio, video, quiz, flashcards, mind maps, slides, infographics, reports, and data tables via CLI or Python API
- MCP servers allow AI agents (Claude, Cursor, Gemini CLI) to directly command NotebookLM — e.g., "make a video workflow" triggers create → add source → generate → download
- These tools work but are **ToS grey area** and can break anytime

### What We Built
- A **production-safe, free** alternative that replicates NotebookLM's core features (chat, audio, image, video) using independent free APIs
- Deployed on Vercel + Hugging Face Spaces with fallback chain: Gemini → Pollinations.ai → Edge-TTS

### What This Demonstrates
1. **Research:** Deep understanding of how NotebookLM integration works (both official and unofficial paths)
2. **Execution:** Working portal that generates the same outputs (audio/video/chat overview) using free tools
3. **Engineering:** Production deployment with error handling, retry logic, rate limit management, and multi-provider fallbacks
