from pydantic import BaseModel, Field


class CmsChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str = Field(default="default", max_length=64)


class CmsChatResponse(BaseModel):
    reply: str
    changes: list[str]
    config: dict
    suggestions: list[str] = []
    image_options: list[dict[str, str]] = []
    has_draft_changes: bool = False
    published: bool = False


class SiteConfigResponse(BaseModel):
    config: dict
    updated_at: str | None = None
    is_draft: bool = False
