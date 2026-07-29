from pydantic import model_validator
from pydantic_settings import BaseSettings

INSECURE_SECRET_KEYS = frozenset(
    {"dev-secret-key", "change-me-in-production", "dev-secret-key-change-in-production"}
)
INSECURE_ADMIN_PASSWORDS = frozenset({"admin123", "password", "admin"})


class Settings(BaseSettings):
    env: str = "development"
    database_url: str = "sqlite:///./dsa_lending.db"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "dev-secret-key"
    admin_password: str = "admin123"
    otp_expiry_seconds: int = 300
    mock_otp: bool = True
    cors_origins: str = "http://localhost:3000"
    webhook_hmac_secret: str = ""
    admin_session_hours: int = 8
    trusted_hosts: str = "localhost,127.0.0.1"
    # Partner API URLs — set in .env to enable real API calls
    partner_hdfc_api_url: str | None = None
    partner_hdfc_api_key: str | None = None
    partner_icici_api_url: str | None = None
    partner_icici_api_key: str | None = None
    partner_bajaj_api_url: str | None = None
    partner_bajaj_api_key: str | None = None
    # Site Builder AI — set OPENAI_API_KEY for full LLM prompt editing
    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"
    cms_llm_model: str = "gpt-4o-mini"
    cms_llm_enabled: bool = True
    unsplash_access_key: str | None = None
    pexels_api_key: str | None = None

    @property
    def is_production(self) -> bool:
        return self.env.lower() == "production"

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if not self.is_production:
            return self
        if self.mock_otp:
            raise ValueError("MOCK_OTP must be false when ENV=production")
        if self.secret_key in INSECURE_SECRET_KEYS or len(self.secret_key) < 32:
            raise ValueError("Set a strong SECRET_KEY (32+ chars) for production")
        if self.admin_password in INSECURE_ADMIN_PASSWORDS or len(self.admin_password) < 12:
            raise ValueError("Set a strong ADMIN_PASSWORD (12+ chars) for production")
        if not self.webhook_hmac_secret or len(self.webhook_hmac_secret) < 16:
            raise ValueError("Set WEBHOOK_HMAC_SECRET for production webhooks")
        return self

    class Config:
        env_file = ".env"


settings = Settings()
