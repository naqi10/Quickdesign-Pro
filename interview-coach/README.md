# Interview Coach (Python LangGraph backend)

Stateful interview-practice agent for the Resume Generator app.
The **brain** lives here in Python (LangGraph). The **face** (voice orb,
6-voice picker, push-to-talk, transcript) lives in the Next.js workspace
at `/coach`.

```
┌──────────────────────────────┐    HTTP    ┌──────────────────────────┐
│  Next.js  /coach             │  ───────►  │  Python FastAPI          │
│  • VoiceOrb (canvas)         │            │  • LangGraph state machine│
│  • mic → /api/coach/stt      │  ◄───────  │  • In-memory checkpointer │
│  • text → /api/coach/turn    │            │  • LLM via OpenAI/Anthropic│
│  • TTS → /api/coach/tts      │            └──────────────────────────┘
└──────────────────────────────┘
```

The Python service has NO frontend. Direct browser hits return JSON.

## What it does

1. Greets the user, asks the target role
2. Asks up to `MAX_QUESTIONS` (default 5) tailored questions
3. Evaluates each answer on clarity, specificity, relevance, impact
4. Closes with strengths, improvements, and an average score

LangGraph nodes: `greet → ask_question → evaluate_answer → (loop or wrap_up)`.

## Run it (Docker, recommended)

```bash
cp .env.example .env
# Edit .env: set OPENAI_API_KEY or ANTHROPIC_API_KEY
docker compose up --build
```

Service is at `http://localhost:8000`. Health check: `curl http://localhost:8000/health`.

## Run it (local Python, alternative)

```bash
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env
uvicorn src.main:app --reload --port 8000
```

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET`  | `/health` | — | `{ok: true}` |
| `POST` | `/sessions` | — | `{session_id, text}` (greeter) |
| `POST` | `/sessions/{sid}/turn` | `{text}` | `{text, phase, summary?}` |
| `DELETE` | `/sessions/{sid}` | — | `{ok}` |

Phases: `awaiting_role`, `awaiting_answer`, `wrapped`.

## Connecting it to the Next.js app

In the Next.js project's `.env`:

```
COACH_URL="http://localhost:8000"
```

The Next.js routes (`app/api/coach/...`) proxy to this URL. STT and TTS use
the **user's own OpenAI key** (added at `/settings`) — no extra config needed
beyond that.

## Configuration

| Env var | Default | What |
|---|---|---|
| `LLM_PROVIDER` | `openai` | `openai` or `anthropic` |
| `LLM_MODEL` | `gpt-4o-mini` | Any chat model the provider supports |
| `OPENAI_API_KEY` | — | Required if `LLM_PROVIDER=openai` |
| `ANTHROPIC_API_KEY` | — | Required if `LLM_PROVIDER=anthropic` |
| `MAX_QUESTIONS` | `5` | How many questions per session |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS for the Next.js dev origin |

## What's planned next

- Tier 2 voice loop refinement (already partly wired via Next.js TTS/STT)
- Persistent state (swap MemorySaver → Postgres checkpointer)
- Per-user resume context (fetch from the Next.js DB → tailor questions)
- Streaming responses
