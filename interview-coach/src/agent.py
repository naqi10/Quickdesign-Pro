"""
LangGraph state machine for the interview coach.

Nodes (in conversation order):
    greet            → welcome + ask for target role
    ask_question     → pick next question, "speak" it
    evaluate_answer  → score the candidate's reply, give feedback
    decide_next      → router: continue questioning or wrap up
    wrap_up          → final summary + close

State is held in `InterviewState`. The graph is interrupted between turns —
the caller (FastAPI WebSocket handler) drives it forward as user messages
arrive.
"""

from __future__ import annotations

import json
import os
from typing import Literal, TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import HumanMessage

from .prompts import (
    GREETER_PROMPT,
    QUESTIONER_PROMPT,
    EVALUATOR_PROMPT,
    WRAP_UP_PROMPT,
)


# ─── State shape ────────────────────────────────────────────────────────────

class AnswerRecord(TypedDict):
    question: str
    answer: str
    overall: int
    strengths: list[str]
    improvements: list[str]
    feedback: str


class InterviewState(TypedDict, total=False):
    role: str                       # target role e.g. "Software Engineer"
    asked: list[str]                # questions already posed
    answers: list[AnswerRecord]     # full evaluation history
    last_question: str              # what we most recently asked
    last_user_text: str             # what the user just said/typed
    phase: Literal[
        "awaiting_role",            # greeted, expecting a role from user
        "awaiting_answer",          # asked a question, expecting an answer
        "wrapped",                  # session complete
    ]
    speak: str                      # OUTPUT — text to surface to the user this turn


# ─── LLM factory ────────────────────────────────────────────────────────────

def _llm():
    """Build the chat LLM from env. Lazy so missing keys fail at call time, not import time.

    Supports: openai, anthropic, google, cerebras, groq, deepseek.
    Cerebras/Groq/DeepSeek are OpenAI-compatible endpoints — ChatOpenAI with
    an overridden base_url speaks to them just like to api.openai.com.
    """
    provider = os.getenv("LLM_PROVIDER", "openai").lower()

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=os.getenv("LLM_MODEL", "claude-haiku-4-5-20251001"),
            api_key=os.environ["ANTHROPIC_API_KEY"],
            temperature=0.4,
            max_tokens=600,
        )

    if provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=os.getenv("LLM_MODEL", "gemini-2.0-flash-lite"),
            google_api_key=os.environ["GOOGLE_API_KEY"],
            temperature=0.4,
            max_output_tokens=600,
        )

    # OpenAI-compatible providers — same SDK, different base_url + model
    OAI_COMPAT = {
        "openai":   {"base": None,                                "model": "gpt-4o-mini",            "key_env": "OPENAI_API_KEY"},
        "cerebras": {"base": "https://api.cerebras.ai/v1",        "model": "gpt-oss-120b",            "key_env": "CEREBRAS_API_KEY"},
        "groq":     {"base": "https://api.groq.com/openai/v1",    "model": "llama-3.3-70b-versatile", "key_env": "GROQ_API_KEY"},
        "deepseek": {"base": "https://api.deepseek.com",          "model": "deepseek-chat",          "key_env": "DEEPSEEK_API_KEY"},
    }
    cfg = OAI_COMPAT.get(provider) or OAI_COMPAT["openai"]

    from langchain_openai import ChatOpenAI
    kwargs = {
        "model": os.getenv("LLM_MODEL", cfg["model"]),
        "api_key": os.environ[cfg["key_env"]],
        "temperature": 0.4,
        "max_tokens": 600,
    }
    if cfg["base"]:
        kwargs["base_url"] = cfg["base"]
    return ChatOpenAI(**kwargs)


def _ask_llm(prompt: str) -> str:
    """Ask the LLM with a single user message.

    Why HumanMessage-only: Gemini rejects requests that have only system
    instructions (`contents is not specified`). Our prompts are self-contained
    so they work fine as a user message. This also keeps the code portable
    across OpenAI / Anthropic / Google without conditional logic.
    """
    return _llm().invoke([HumanMessage(content=prompt)]).content.strip()  # type: ignore[return-value]


# ─── Nodes ──────────────────────────────────────────────────────────────────

def greet_node(state: InterviewState) -> InterviewState:
    speak = _ask_llm(GREETER_PROMPT)
    return {
        "asked": [],
        "answers": [],
        "phase": "awaiting_role",
        "speak": speak,
    }


def ask_question_node(state: InterviewState) -> InterviewState:
    role = state.get("role") or state.get("last_user_text", "Software Engineer")
    asked = state.get("asked", [])
    asked_block = "\n".join(f"- {q}" for q in asked) or "(none yet)"
    question = _ask_llm(QUESTIONER_PROMPT.format(role=role, asked=asked_block))

    # If the evaluator just ran, fold its feedback into this turn's speak so
    # the user hears "<feedback> ... next question" rather than losing it.
    prior = state.get("answers", [])
    feedback = prior[-1]["feedback"] if prior else ""
    speak = f"{feedback} {question}".strip() if feedback else question

    return {
        "role": role,
        "asked": [*asked, question],
        "last_question": question,
        "phase": "awaiting_answer",
        "speak": speak,
    }


def evaluate_answer_node(state: InterviewState) -> InterviewState:
    answer = state.get("last_user_text", "").strip()
    question = state.get("last_question", "")
    role = state.get("role", "this role")

    raw = _ask_llm(EVALUATOR_PROMPT.format(role=role, question=question, answer=answer))
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        parsed = json.loads(raw)
        record: AnswerRecord = {
            "question": question,
            "answer": answer,
            "overall": int(parsed.get("overall", 5)),
            "strengths": list(parsed.get("strengths", [])),
            "improvements": list(parsed.get("improvements", [])),
            "feedback": str(parsed.get("feedback", "Thanks for that answer.")),
        }
    except (json.JSONDecodeError, ValueError, TypeError):
        record = {
            "question": question, "answer": answer, "overall": 5,
            "strengths": [], "improvements": [],
            "feedback": "Thanks — let's move on to the next one.",
        }

    return {
        "answers": [*state.get("answers", []), record],
        "speak": record["feedback"],
    }


def wrap_up_node(state: InterviewState) -> InterviewState:
    role = state.get("role", "this role")
    answers = state.get("answers", [])
    num = len(answers)
    avg = round(sum(a["overall"] for a in answers) / num) if num else 0
    strengths = sorted({s for a in answers for s in a["strengths"]})[:5] or ["(none yet)"]
    improvements = sorted({i for a in answers for i in a["improvements"]})[:5] or ["(none yet)"]

    closing = _ask_llm(
        WRAP_UP_PROMPT.format(
            role=role,
            num_questions=num,
            avg_score=avg,
            strengths="\n".join(f"- {s}" for s in strengths),
            improvements="\n".join(f"- {i}" for i in improvements),
        )
    )
    return {"phase": "wrapped", "speak": closing}


# ─── Router ─────────────────────────────────────────────────────────────────

def route_after_evaluate(state: InterviewState) -> str:
    max_qs = int(os.getenv("MAX_QUESTIONS", "5"))
    return "wrap_up" if len(state.get("asked", [])) >= max_qs else "ask_question"


# ─── Graph factory ──────────────────────────────────────────────────────────

_checkpointer = MemorySaver()


def build_graph():
    """
    Graph flow:
        START → greet → (interrupt — wait for role) → ask_question
              → (interrupt — wait for answer) → evaluate_answer
              → conditional → ask_question (loop) or wrap_up → END

    interrupt_after pauses execution after a node so the caller can collect
    the user's reply, then invoke(None) resumes from there.
    """
    g = StateGraph(InterviewState)
    g.add_node("greet", greet_node)
    g.add_node("ask_question", ask_question_node)
    g.add_node("evaluate_answer", evaluate_answer_node)
    g.add_node("wrap_up", wrap_up_node)

    g.add_edge(START, "greet")
    g.add_edge("greet", "ask_question")
    g.add_edge("ask_question", "evaluate_answer")
    g.add_conditional_edges("evaluate_answer", route_after_evaluate, {
        "ask_question": "ask_question",
        "wrap_up": "wrap_up",
    })
    g.add_edge("wrap_up", END)

    return g.compile(
        checkpointer=_checkpointer,
        interrupt_after=["greet", "ask_question"],
    )


# ─── Public driver helpers ──────────────────────────────────────────────────
# Each call returns the new state (with `speak` to surface to the user).

GRAPH = build_graph()


def _config(session_id: str) -> dict:
    return {"configurable": {"thread_id": session_id}}


def start_session(session_id: str) -> InterviewState:
    """Run the greeting node — returns the greeter's message in `speak`.

    LangGraph's __start__ task must write at least one channel; passing an
    empty dict triggers InvalidUpdateError, so we seed `asked: []` (the
    greet node overrides it anyway).
    """
    initial: InterviewState = {"asked": []}
    return GRAPH.invoke(initial, config=_config(session_id))  # type: ignore[arg-type]


def submit_user_text(session_id: str, user_text: str) -> InterviewState:
    """
    Feed a user message into the current session and resume the graph.
    The graph paused after greet OR ask_question (via interrupt_after);
    we stage the user's reply into state and call invoke(None) to continue.
    """
    state: InterviewState = GRAPH.get_state(_config(session_id)).values  # type: ignore[assignment]
    phase = state.get("phase", "awaiting_role")

    if phase == "wrapped":
        return state  # session already finished

    # Stage the user's text so the next node sees it.
    update: InterviewState = {"last_user_text": user_text}
    if phase == "awaiting_role":
        update["role"] = user_text.strip() or state.get("role", "Software Engineer")
    GRAPH.update_state(_config(session_id), update)

    # Resume from the last interrupt. LangGraph runs until the next interrupt or END.
    return GRAPH.invoke(None, config=_config(session_id))  # type: ignore[arg-type]
