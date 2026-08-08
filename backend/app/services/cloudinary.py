import time

import cloudinary
import cloudinary.utils

from app.config import get_settings


def configure_cloudinary() -> None:
    settings = get_settings()
    if settings.cloudinary_cloud_name:
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )


def create_upload_signature(folder: str = "a2z-ply") -> dict:
    settings = get_settings()
    if not settings.cloudinary_api_secret or not settings.cloudinary_api_key:
        raise ValueError("Cloudinary is not configured")

    configure_cloudinary()
    timestamp = int(time.time())
    params_to_sign = {"timestamp": timestamp, "folder": folder}
    signature = cloudinary.utils.api_sign_request(params_to_sign, settings.cloudinary_api_secret)
    return {
        "timestamp": timestamp,
        "folder": folder,
        "signature": signature,
        "apiKey": settings.cloudinary_api_key,
        "cloudName": settings.cloudinary_cloud_name,
    }
