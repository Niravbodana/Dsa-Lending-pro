from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.ai_assistant import generate_reply

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str | None = None
    page_url: str | None = None
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    suggestions: list[str] = Field(default_factory=list)
    assistant_name: str = "Neer AI"


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in payload.history[-10:]]
    reply, suggestions = generate_reply(payload.message, history)
    session_id = payload.session_id or f"chat-{hash(payload.message) % 10_000_000:07d}"
    return ChatResponse(
        reply=reply,
        session_id=session_id,
        suggestions=suggestions,
    )
