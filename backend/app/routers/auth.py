from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.deps import get_current_admin
from app.auth.security import create_access_token, verify_password
from app.db import get_db
from app.schemas.auth import AdminOut, LoginIn, TokenOut

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])


@router.post("/login", response_model=TokenOut)
async def login(body: LoginIn):
    admin = await get_db().admins.find_one({"email": body.email.lower()})
    if not admin or not verify_password(body.password, admin["passwordHash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(admin["_id"]), {"email": admin["email"]})
    return TokenOut(accessToken=token)


@router.get("/me", response_model=AdminOut)
async def me(admin: dict = Depends(get_current_admin)):
    return AdminOut(id=str(admin["_id"]), email=admin["email"], name=admin.get("name", "Admin"))
