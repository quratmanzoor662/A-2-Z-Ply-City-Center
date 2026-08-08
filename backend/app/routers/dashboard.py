from fastapi import APIRouter, Depends

from app.auth.deps import get_current_admin
from app.db import get_db
from app.utils import serialize_list

router = APIRouter(prefix="/api/admin", tags=["dashboard"])


@router.get("/dashboard")
async def dashboard(_: dict = Depends(get_current_admin)):
    db = get_db()
    total_products = await db.products.count_documents({})
    total_categories = await db.categories.count_documents({})
    total_brands = await db.brands.count_documents({})
    total_enquiries = await db.enquiries.count_documents({})
    pending_enquiries = await db.enquiries.count_documents({"status": "pending"})

    recent = await db.products.find({}).sort("createdAt", -1).limit(5).to_list(5)
    low_stock = await db.products.find(
        {"$or": [{"variants.stock": {"$lte": 5}}, {"inStock": False}]}
    ).limit(8).to_list(8)
    most_viewed = await db.products.find({}).sort("viewCount", -1).limit(8).to_list(8)

    return {
        "totalProducts": total_products,
        "totalCategories": total_categories,
        "totalBrands": total_brands,
        "totalEnquiries": total_enquiries,
        "pendingEnquiries": pending_enquiries,
        "recentProducts": serialize_list(recent),
        "lowStockProducts": serialize_list(low_stock),
        "mostViewedProducts": serialize_list(most_viewed),
    }
