import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "InteriorFlow SaaS"
    VERSION: str = "2.0.0"
    ENV: str = os.getenv("ENV", "production")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    # Database: defaults to SQLite for zero-config local run, supports PostgreSQL in prod
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'interior.db')}"
    )

    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "interior-flow-production-super-secret-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # CORS
    CORS_ORIGINS: List[str] = [
        "*"
    ]

    # Application URLs & Dynamic Portal
    APP_BASE_URL: str = os.getenv("APP_BASE_URL", "http://localhost:8000")

    # Default Tenant for seamless backwards compatibility & onboarding
    DEFAULT_TENANT_ID: str = "tenant-abc-interiors"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
