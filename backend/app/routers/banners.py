from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from app.auth.deps import get_current_admin
from app.db import get_db
from app.schemas.catalog import BannerIn
from app.utils import oid, serialize_doc, serialize_list, utcnow

router = APIRouter(tags=["banners"])


@router.get("/api/banners")
async def list_banners():
    docs = await get_db().banners.find({"active": True}).sort("sortOrder", 1).to_list(50)
    return serialize_list(docs)


@router.get("/api/admin/banners")
async def admin_list_banners(_: dict = Depends(get_current_admin)):
    docs = await get_db().banners.find({}).sort("sortOrder", 1).to_list(100)
    return serialize_list(docs)


@router.post("/api/admin/banners", status_code=status.HTTP_201_CREATED)
async def create_banner(body: BannerIn, _: dict = Depends(get_current_admin)):
    doc = {
        **body.model_dump(),
        "desktopImage": body.desktopImage.model_dump() if body.desktopImage else None,
        "mobileImage": body.mobileImage.model_dump() if body.mobileImage else None,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
    result = await get_db().banners.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/api/admin/banners/{banner_id}")
async def update_banner(banner_id: str, body: BannerIn, _: dict = Depends(get_current_admin)):
    _id = oid(banner_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    data = {
        **body.model_dump(),
        "desktopImage": body.desktopImage.model_dump() if body.desktopImage else None,
        "mobileImage": body.mobileImage.model_dump() if body.mobileImage else None,
        "updatedAt": utcnow(),
    }
    result = await get_db().banners.find_one_and_update(
        {"_id": _id}, {"$set": data}, return_document=ReturnDocument.AFTER
    )
    if not result:
        raise HTTPException(status_code=404, detail="Banner not found")
    return serialize_doc(result)


@router.delete("/api/admin/banners/{banner_id}")
async def delete_banner(banner_id: str, _: dict = Depends(get_current_admin)):
    _id = oid(banner_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    result = await get_db().banners.delete_one({"_id": _id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Deleted"}
