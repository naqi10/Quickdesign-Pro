"""
FastAPI HTTP service for the LangGraph interview coach.

Endpoints (consumed by the Next.js /coach page):
    GET    /health                    → liveness probe
    POST   /sessions                  → start a session, returns {session_id, text}
    POST   /sessions/{sid}/turn       → submit user text, returns {text, phase, summary?}
    DELETE /sessions/{sid}            → end a session (best-effort cleanup)

This service has NO frontend — it's a backend brain. The Next.js app owns
the UI (voice picker, animated ball, STT/TTS, push-to-talk).
"""

from __future__ import annotations

import logging
import os
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load .env before importing the agent (LLM is built at first call).
load_dotenv()

from .agent import start_session, submit_user_text, GRAPH  # noqa: E402

log = logging.getLogger("coach")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s :: %(message)s")

app = FastAPI(title="Interview Coach API", version="0.1.0")

# Allow the Next.js dev server (localhost:3000) and the deployed origin.
# Adjust ALLOWED_ORIGINS in env for prod (comma-separated).
_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ─── Request / response models ──────────────────────────────────────────────

class CreateSessionResp(BaseModel):
    session_id: str
    text: str


class TurnReq(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)


class TurnResp(BaseModel):
    text: str
    phase: str
    summary: dict | None = None


# ─── Routes ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict:
    return {"ok": True, "service": "interview-coach"}


@app.post("/sessions", response_model=CreateSessionResp)
async def create_session() -> CreateSessionResp:
    sid = str(uuid4())
    try:
        state = start_session(sid)
    except Exception as e:
        log.exception("create_session failed")
        raise HTTPException(status_code=500, detail=_user_error(e))
    return CreateSessionResp(session_id=sid, text=state.get("speak", "Hello!"))


@app.post("/sessions/{sid}/turn", response_model=TurnResp)
async def turn(sid: str, body: TurnReq) -> TurnResp:
    try:
        state = submit_user_text(sid, body.text)
    except Exception as e:
        log.exception("turn failed")
        raise HTTPException(status_code=500, detail=_user_error(e))

    phase = state.get("phase", "awaiting_answer")
    resp = TurnResp(text=state.get("speak", ""), phase=phase)
    if phase == "wrapped":
        resp.summary = _summary(state)
    return resp


@app.delete("/sessions/{sid}")
async def end_session(sid: str) -> dict:
    # LangGraph's MemorySaver keeps state per thread_id; we can't easily
    # delete in the current API but exposing the route lets the client
    # signal end-of-session. Real cleanup → swap MemorySaver for a Postgres
    # checkpointer later and add deletion.
    return {"ok": True}


# ─── Helpers ────────────────────────────────────────────────────────────────

def _summary(state: dict) -> dict:
    answers = state.get("answers", [])
    total = len(answers)
    avg = round(sum(a["overall"] for a in answers) / total, 1) if total else 0
    return {
        "role": state.get("role"),
        "questions_answered": total,
        "average_score": avg,
        "answers": answers,
    }


def _user_error(e: Exception) -> str:
    msg = str(e)
    err_type = type(e).__name__
    low = msg.lower()

    # Specific, helpful messages for the common failures
    if "openai_api_key" in low or "anthropic_api_key" in low:
        return "Missing LLM API key. Set OPENAI_API_KEY (or ANTHROPIC_API_KEY) in interview-coach/.env and restart."
    if "incorrect api key" in low or "invalid_api_key" in low or "401" in low:
        return "Invalid LLM API key. Double-check the key in interview-coach/.env."
    if "model_not_found" in low or "does not have access" in low or "you do not have access" in low:
        return "Your account doesn't have access to this model. Try a different LLM_MODEL in .env."
    if "resourceexhausted" in low or "generate_content_free_tier" in low or "generativelanguage" in low:
        return ("Gemini quota exhausted (limit: 0 for this model on your project). "
                "Switch LLM_PROVIDER in interview-coach/.env to 'cerebras' or 'groq' (free), "
                "or add billing to your Google Cloud project.")
    if "insufficient_quota" in low or "402" in low:
        return "Your OpenAI account has no billing/credit. Add a payment method or use a different key."
    if "exceeded your current quota" in low:
        return "LLM quota exceeded. Switch provider in interview-coach/.env or wait/upgrade."
    if "429" in low or "rate limit" in low:
        return "LLM rate-limited the coach. Try again in a few seconds."
    if "connect" in low and ("name" in low or "refused" in low or "timeout" in low):
        return "Coach can't reach the LLM provider. Network issue or wrong base URL."

    # Fallback: surface the actual exception so we can debug. Truncated.
    truncated = msg[:220] + ("…" if len(msg) > 220 else "")
    return f"{err_type}: {truncated}" if truncated else f"{err_type} (no message)"


# Silence unused-import lint for GRAPH (kept exported in case we add admin endpoints)
_ = GRAPH
