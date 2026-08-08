from fastapi import APIRouter, Depends

from app.auth.deps import get_current_admin
from app.db import get_db
from app.schemas.catalog import SettingsIn
from app.utils import serialize_doc, utcnow

router = APIRouter(tags=["settings"])

DEFAULT_SETTINGS = {
    "storeName": "A-2-Z Ply City Center",
    "tagline": "Premium Plywood & Hardware Solutions",
    "logoUrl": "",
    "whatsappNumber": "919320630345",
    "email": "hello@a2zply.com",
    "phone": "+91 93206 30345",
    "address": "A-2-Z Ply City Center",
    "mapsUrl": "https://maps.app.goo.gl/c5Zgd6MzRepAdHMb6",
    "mapsEmbedUrl": "",
    "openingHours": "Mon–Sat: 9:00 AM – 8:00 PM",
    "facebookUrl": "",
    "instagramUrl": "",
    "youtubeUrl": "",
}


async def get_or_create_settings() -> dict:
    db = get_db()
    doc = await db.settings.find_one({"key": "store"})
    if doc:
        return doc
    payload = {**DEFAULT_SETTINGS, "key": "store", "updatedAt": utcnow()}
    result = await db.settings.insert_one(payload)
    payload["_id"] = result.inserted_id
    return payload


@router.get("/api/settings")
async def public_settings():
    return serialize_doc(await get_or_create_settings())


@router.get("/api/admin/settings")
async def admin_get_settings(_: dict = Depends(get_current_admin)):
    return serialize_doc(await get_or_create_settings())


@router.put("/api/admin/settings")
async def admin_update_settings(body: SettingsIn, _: dict = Depends(get_current_admin)):
    db = get_db()
    data = body.model_dump()
    data["updatedAt"] = utcnow()
    await db.settings.update_one({"key": "store"}, {"$set": data}, upsert=True)
    return serialize_doc(await get_or_create_settings())
