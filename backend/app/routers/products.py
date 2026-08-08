from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo import ReturnDocument

from app.auth.deps import get_current_admin
from app.db import get_db
from app.schemas.catalog import ProductIn
from app.utils import (
    denormalize_product_fields,
    oid,
    serialize_doc,
    serialize_list,
    slugify,
    utcnow,
)

router = APIRouter(tags=["products"])


def build_product_doc(body: ProductIn) -> dict:
    data = body.model_dump()
    data["slug"] = body.slug or slugify(body.name)
    data["categoryId"] = body.categoryId
    data["brandId"] = body.brandId
    data["images"] = [img.model_dump() for img in body.images]
    data["variants"] = [v.model_dump() for v in body.variants]
    data["specifications"] = [s.model_dump() for s in body.specifications]
    data = denormalize_product_fields(data)
    return data


@router.get("/api/products")
async def list_products(
    q: str | None = None,
    category: str | None = None,
    brand: str | None = None,
    color: str | None = None,
    material: str | None = None,
    finish: str | None = None,
    minPrice: float | None = None,
    maxPrice: float | None = None,
    availability: str | None = None,
    sort: str = "newest",
    featured: bool | None = None,
    newArrival: bool | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
):
    db = get_db()
    query: dict = {"status": "active"}

    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"shortDescription": {"$regex": q, "$options": "i"}},
            {"sku": {"$regex": q, "$options": "i"}},
        ]
    if category:
        cat_query: dict = {"slug": category}
        cat_oid = oid(category)
        if cat_oid:
            cat_query = {"$or": [{"slug": category}, {"_id": cat_oid}]}
        cat = await db.categories.find_one(cat_query)
        query["categoryId"] = str(cat["_id"]) if cat else category
    if brand:
        brand_query: dict = {"slug": brand}
        brand_oid = oid(brand)
        if brand_oid:
            brand_query = {"$or": [{"slug": brand}, {"_id": brand_oid}]}
        br = await db.brands.find_one(brand_query)
        query["brandId"] = str(br["_id"]) if br else brand
    if color:
        query["colors"] = color
    if material:
        query["materials"] = material
    if finish:
        query["finishes"] = finish
    if minPrice is not None or maxPrice is not None:
        price_q: dict = {}
        if minPrice is not None:
            price_q["$gte"] = minPrice
        if maxPrice is not None:
            price_q["$lte"] = maxPrice
        query["sellingPrice"] = price_q
    if availability == "in_stock":
        query["inStock"] = True
    elif availability == "out_of_stock":
        query["inStock"] = False
    if featured is not None:
        query["isFeatured"] = featured
    if newArrival is not None:
        query["isNewArrival"] = newArrival

    sort_map = {
        "newest": [("createdAt", -1)],
        "popular": [("viewCount", -1)],
        "price_asc": [("sellingPrice", 1)],
        "price_desc": [("sellingPrice", -1)],
    }
    sort_spec = sort_map.get(sort, sort_map["newest"])

    total = await db.products.count_documents(query)
    cursor = db.products.find(query).sort(sort_spec).skip((page - 1) * limit).limit(limit)
    items = await cursor.to_list(limit)

    colors = await db.products.distinct("colors", {"status": "active"})
    materials = await db.products.distinct("materials", {"status": "active"})
    finishes = await db.products.distinct("finishes", {"status": "active"})

    return {
        "items": serialize_list(items),
        "total": total,
        "page": page,
        "limit": limit,
        "facets": {
            "colors": [c for c in colors if c],
            "materials": [m for m in materials if m],
            "finishes": [f for f in finishes if f],
        },
    }


@router.get("/api/products/{slug}/similar")
async def similar_products(slug: str, limit: int = 8):
    db = get_db()
    product = await db.products.find_one({"slug": slug})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    query = {
        "_id": {"$ne": product["_id"]},
        "status": "active",
        "categoryId": product.get("categoryId"),
    }
    docs = await db.products.find(query).limit(limit).to_list(limit)
    return serialize_list(docs)


@router.get("/api/products/{slug}")
async def get_product(slug: str):
    db = get_db()
    doc = await db.products.find_one({"slug": slug, "status": "active"})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.products.update_one({"_id": doc["_id"]}, {"$inc": {"viewCount": 1}})
    doc["viewCount"] = int(doc.get("viewCount", 0)) + 1

    category = None
    brand = None
    if doc.get("categoryId") and oid(doc["categoryId"]):
        category = await db.categories.find_one({"_id": oid(doc["categoryId"])})
    if doc.get("brandId") and oid(doc["brandId"]):
        brand = await db.brands.find_one({"_id": oid(doc["brandId"])})

    result = serialize_doc(doc)
    result["category"] = serialize_doc(category)
    result["brand"] = serialize_doc(brand)
    return result


@router.get("/api/admin/products")
async def admin_list_products(
    q: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    _: dict = Depends(get_current_admin),
):
    db = get_db()
    query: dict = {}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"sku": {"$regex": q, "$options": "i"}},
        ]
    total = await db.products.count_documents(query)
    items = await db.products.find(query).sort("createdAt", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return {"items": serialize_list(items), "total": total, "page": page, "limit": limit}


@router.get("/api/admin/products/{product_id}")
async def admin_get_product(product_id: str, _: dict = Depends(get_current_admin)):
    _id = oid(product_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    doc = await get_db().products.find_one({"_id": _id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(doc)


@router.post("/api/admin/products", status_code=status.HTTP_201_CREATED)
async def create_product(body: ProductIn, _: dict = Depends(get_current_admin)):
    db = get_db()
    data = build_product_doc(body)
    if await db.products.find_one({"slug": data["slug"]}):
        raise HTTPException(status_code=400, detail="Slug already exists")
    if await db.products.find_one({"sku": data["sku"]}):
        raise HTTPException(status_code=400, detail="SKU already exists")
    data["viewCount"] = 0
    data["createdAt"] = utcnow()
    data["updatedAt"] = utcnow()
    result = await db.products.insert_one(data)
    data["_id"] = result.inserted_id
    return serialize_doc(data)


@router.put("/api/admin/products/{product_id}")
async def update_product(product_id: str, body: ProductIn, _: dict = Depends(get_current_admin)):
    _id = oid(product_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    db = get_db()
    data = build_product_doc(body)
    if await db.products.find_one({"slug": data["slug"], "_id": {"$ne": _id}}):
        raise HTTPException(status_code=400, detail="Slug already exists")
    if await db.products.find_one({"sku": data["sku"], "_id": {"$ne": _id}}):
        raise HTTPException(status_code=400, detail="SKU already exists")
    data["updatedAt"] = utcnow()
    result = await db.products.find_one_and_update(
        {"_id": _id}, {"$set": data}, return_document=ReturnDocument.AFTER
    )
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(result)


@router.delete("/api/admin/products/{product_id}")
async def delete_product(product_id: str, _: dict = Depends(get_current_admin)):
    _id = oid(product_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    result = await get_db().products.delete_one({"_id": _id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Deleted"}
