from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from app.auth.deps import get_current_admin
from app.db import get_db
from app.schemas.catalog import BrandIn
from app.utils import oid, serialize_doc, serialize_list, slugify, utcnow

router = APIRouter(tags=["brands"])


@router.get("/api/brands")
async def list_brands(activeOnly: bool = True):
    query: dict = {}
    if activeOnly:
        query["active"] = True
    docs = await get_db().brands.find(query).sort("name", 1).to_list(200)
    return serialize_list(docs)


@router.get("/api/admin/brands")
async def admin_list_brands(_: dict = Depends(get_current_admin)):
    docs = await get_db().brands.find({}).sort("name", 1).to_list(500)
    return serialize_list(docs)


@router.post("/api/admin/brands", status_code=status.HTTP_201_CREATED)
async def create_brand(body: BrandIn, _: dict = Depends(get_current_admin)):
    db = get_db()
    slug = body.slug or slugify(body.name)
    if await db.brands.find_one({"slug": slug}):
        raise HTTPException(status_code=400, detail="Slug already exists")
    doc = {
        **body.model_dump(),
        "slug": slug,
        "logo": body.logo.model_dump() if body.logo else None,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
    result = await db.brands.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/api/admin/brands/{brand_id}")
async def update_brand(brand_id: str, body: BrandIn, _: dict = Depends(get_current_admin)):
    _id = oid(brand_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    db = get_db()
    slug = body.slug or slugify(body.name)
    existing = await db.brands.find_one({"slug": slug, "_id": {"$ne": _id}})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    data = {
        **body.model_dump(),
        "slug": slug,
        "logo": body.logo.model_dump() if body.logo else None,
        "updatedAt": utcnow(),
    }
    result = await db.brands.find_one_and_update(
        {"_id": _id}, {"$set": data}, return_document=ReturnDocument.AFTER
    )
    if not result:
        raise HTTPException(status_code=404, detail="Brand not found")
    return serialize_doc(result)


@router.delete("/api/admin/brands/{brand_id}")
async def delete_brand(brand_id: str, _: dict = Depends(get_current_admin)):
    _id = oid(brand_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    result = await get_db().brands.delete_one({"_id": _id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Deleted"}
