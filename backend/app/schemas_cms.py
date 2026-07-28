from pydantic import BaseModel, Field


class CmsChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class CmsChatResponse(BaseModel):
    reply: str
    changes: list[str]
    config: dict


class SiteConfigResponse(BaseModel):
    config: dict
    updated_at: str | None = None
