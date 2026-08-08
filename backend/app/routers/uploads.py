from fastapi import APIRouter, Depends, HTTPException

from app.auth.deps import get_current_admin
from app.services.cloudinary import create_upload_signature

router = APIRouter(prefix="/api/admin/uploads", tags=["uploads"])


@router.post("/signature")
async def upload_signature(folder: str = "a2z-ply", _: dict = Depends(get_current_admin)):
    try:
        return create_upload_signature(folder=folder)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
