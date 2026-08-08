from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "a2z_ply_city"
    jwt_secret: str = "change-me-to-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cors_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "https://a-2-z-ply-city-center.vercel.app"
    )
    admin_email: str = "admin@a2zply.com"
    admin_password: str = "admin123"

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]
        # Always allow local + production even if env omits one of them
        defaults = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://a-2-z-ply-city-center.vercel.app",
        ]
        merged: list[str] = []
        for origin in origins + defaults:
            if origin and origin not in merged:
                merged.append(origin)
        return merged


@lru_cache
def get_settings() -> Settings:
    return Settings()
