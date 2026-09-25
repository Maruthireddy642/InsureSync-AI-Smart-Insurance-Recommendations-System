import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "InsureSync AI"
    database_url: str = "sqlite:///./insuresync.db"

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "insuresync_docs"

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 120

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    cors_origins_raw: str = "http://localhost:5173"

    @field_validator("database_url", mode="before")
    @classmethod
    def default_database_url(cls, v):
        return v or "sqlite:///./insuresync.db"

    @property
    def cors_origins(self):
        return [o.strip() for o in self.cors_origins_raw.split(",")]


settings = Settings()