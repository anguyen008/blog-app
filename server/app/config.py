from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables"""

    database_user: str = Field(default="", alias="POSTGRES_USER")
    database_password: str = Field(default="", alias="POSTGRES_PASSWORD")
    database_host: str = Field(default="", alias="POSTGRES_HOST")
    database_port: str = Field(default="5432", alias="POSTGRES_PORT")
    database_name: str = Field(default="", alias="POSTGRES_DB")

    # JWT secret key for signing tokens
    secret_key: str = Field(default="", alias="JWT_SECRET_KEY")

    algorithm: str = Field(default="", alias="JWT_ALGORITHM")

    # JWT token expiration time in minutes
    access_token_expire_minutes: int = Field(
        default=0, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    refresh_token_expire_days: int = Field(
        default=0, alias="JWT_REFRESH_TOKEN_EXPIRE_DAYS"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        populate_by_name=True,  # Allow both field name and alias
    )


settings = Settings()
