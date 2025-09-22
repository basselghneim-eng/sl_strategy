from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "change-me-please"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    BACKEND_CORS_ORIGINS: str = "*"
    DATABASE_URL: str = "sqlite:///./app.db"
    class Config: env_file = ".env"

settings = Settings()
