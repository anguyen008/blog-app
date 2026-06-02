from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables"""

    database_host: str = "XXX"
    database_port: str = "XXX"
    database_user: str = "XXX"
    database_password: str = "XXX"
    database_name: str = "XXX"

    # JWT secret key for signing tokens
    secret_key: str = Field(default="XXX", alias="JWT_SECRET_KEY")

    algorithm: str = Field(default="XXX", alias="JWT_ALGORITHM")

    # JWT token expiration time in minutes
    access_token_expire_minutes: int = Field(
        default=30, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        populate_by_name=True,  # Allow both field name and alias
    )


settings = Settings()
