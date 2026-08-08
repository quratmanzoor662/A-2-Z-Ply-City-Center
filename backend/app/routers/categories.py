from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from app.auth.deps import get_current_admin
from app.db import get_db
from app.schemas.catalog import CategoryIn
from app.utils import oid, serialize_doc, serialize_list, slugify, utcnow

router = APIRouter(tags=["categories"])


@router.get("/api/categories")
async def list_categories(activeOnly: bool = True):
    query: dict = {}
    if activeOnly:
        query["active"] = True
    docs = await get_db().categories.find(query).sort("sortOrder", 1).to_list(200)
    return serialize_list(docs)


@router.get("/api/categories/{slug}")
async def get_category(slug: str):
    doc = await get_db().categories.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Category not found")
    return serialize_doc(doc)


@router.get("/api/admin/categories")
async def admin_list_categories(_: dict = Depends(get_current_admin)):
    docs = await get_db().categories.find({}).sort("sortOrder", 1).to_list(500)
    return serialize_list(docs)


@router.post("/api/admin/categories", status_code=status.HTTP_201_CREATED)
async def create_category(body: CategoryIn, _: dict = Depends(get_current_admin)):
    db = get_db()
    slug = body.slug or slugify(body.name)
    if await db.categories.find_one({"slug": slug}):
        raise HTTPException(status_code=400, detail="Slug already exists")
    doc = {
        **body.model_dump(),
        "slug": slug,
        "image": body.image.model_dump() if body.image else None,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
    result = await db.categories.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/api/admin/categories/{category_id}")
async def update_category(category_id: str, body: CategoryIn, _: dict = Depends(get_current_admin)):
    _id = oid(category_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    db = get_db()
    slug = body.slug or slugify(body.name)
    existing = await db.categories.find_one({"slug": slug, "_id": {"$ne": _id}})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    data = {
        **body.model_dump(),
        "slug": slug,
        "image": body.image.model_dump() if body.image else None,
        "updatedAt": utcnow(),
    }
    result = await db.categories.find_one_and_update(
        {"_id": _id}, {"$set": data}, return_document=ReturnDocument.AFTER
    )
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    return serialize_doc(result)


@router.delete("/api/admin/categories/{category_id}")
async def delete_category(category_id: str, _: dict = Depends(get_current_admin)):
    _id = oid(category_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    result = await get_db().categories.delete_one({"_id": _id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Deleted"}
