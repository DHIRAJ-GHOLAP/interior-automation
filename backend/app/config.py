import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "InteriorFlow SaaS"
    VERSION: str = "2.0.0"
    ENV: str = os.getenv("ENV", "production")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    # Database: defaults to Neon PostgreSQL, supports SQLite or override via env
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_NIk2dKUDTX7R@ep-flat-credit-b4ehl9tu-pooler.c-6.us-east-2.aws.neon.tech/moreint?sslmode=require&channel_binding=require"
    )

    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "interior-flow-production-super-secret-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # CORS (supports comma-separated string, JSON list, or "*")
    CORS_ORIGINS: Union[List[str], str] = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Application URLs & Dynamic Portal
    APP_BASE_URL: str = os.getenv("APP_BASE_URL", "http://localhost:8000")

    # Default Tenant for seamless backwards compatibility & onboarding
    DEFAULT_TENANT_ID: str = "tenant-abc-interiors"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
