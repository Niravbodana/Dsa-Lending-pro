from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.config import settings
from app.database import Base, engine
from app.middleware.security import SecurityHeadersMiddleware
from app.routers import admin, auth, chat, cms, consent, dashboard, kyc, leads, webhooks

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Neer Loan Solutions API",
    description="Personal Loan Marketplace - Complete Platform",
    version="1.0.0",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

trusted = [h.strip() for h in settings.trusted_hosts.split(",") if h.strip()]
if trusted:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted)

app.add_middleware(SecurityHeadersMiddleware)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Webhook-Signature"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(consent.router, prefix="/api")
app.include_router(cms.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(kyc.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "phase": "complete-a-to-z", "env": settings.env}
