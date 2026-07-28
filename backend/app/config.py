from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./dsa_lending.db"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "dev-secret-key"
    admin_password: str = "admin123"
    otp_expiry_seconds: int = 300
    mock_otp: bool = True
    cors_origins: str = "http://localhost:3000"
    # Partner API URLs — set in .env to enable real API calls
    partner_hdfc_api_url: str | None = None
    partner_hdfc_api_key: str | None = None
    partner_icici_api_url: str | None = None
    partner_icici_api_key: str | None = None
    partner_bajaj_api_url: str | None = None
    partner_bajaj_api_key: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()
