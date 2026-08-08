"""Seed demo catalog data. Run: python -m app.seed"""

import asyncio
import uuid

from app.auth.security import hash_password
from app.config import get_settings
from app.db import close_db, connect_db, get_db
from app.routers.settings import DEFAULT_SETTINGS
from app.utils import denormalize_product_fields, slugify, utcnow

PLACEHOLDER = "https://images.unsplash.com"


def img(path: str, alt: str = "", order: int = 0) -> dict:
    return {"url": f"{PLACEHOLDER}/{path}", "publicId": None, "alt": alt, "sortOrder": order}


async def seed() -> None:
    await connect_db()
    db = get_db()
    settings = get_settings()

    await db.admins.delete_many({})
    await db.settings.delete_many({})
    await db.categories.delete_many({})
    await db.brands.delete_many({})
    await db.banners.delete_many({})
    await db.products.delete_many({})
    await db.enquiries.delete_many({})

    await db.admins.insert_one(
        {
            "email": settings.admin_email.lower(),
            "passwordHash": hash_password(settings.admin_password),
            "name": "Store Admin",
            "createdAt": utcnow(),
        }
    )

    await db.settings.insert_one({**DEFAULT_SETTINGS, "key": "store", "updatedAt": utcnow()})

    category_names = [
        ("Plywood", "Premium commercial and marine plywood sheets"),
        ("Laminates", "Decorative laminates for furniture and interiors"),
        ("Veneers", "Natural wood veneers for refined finishes"),
        ("Bathroom Accessories", "Fittings and accessories for modern bathrooms"),
        ("Door Locks", "Secure locks and handles for every door"),
        ("Hardware", "Hinges, channels, and essential hardware"),
        ("Adhesives", "Bonding solutions for wood and laminates"),
        ("Lighting", "Indoor lighting for showrooms and homes"),
        ("Plumbing", "Reliable plumbing fittings and fixtures"),
        ("Power Tools", "Tools for carpenters and contractors"),
    ]
    categories = []
    for i, (name, desc) in enumerate(category_names):
        doc = {
            "name": name,
            "slug": slugify(name),
            "description": desc,
            "image": img(f"photo-1616486338812-3dadae4b4ace?w=800&q=80", name, 0),
            "sortOrder": i,
            "active": True,
            "createdAt": utcnow(),
            "updatedAt": utcnow(),
        }
        result = await db.categories.insert_one(doc)
        doc["_id"] = result.inserted_id
        categories.append(doc)

    brand_defs = [
        ("Greenply", "Trusted plywood and panel solutions"),
        ("CenturyPly", "Engineered wood for modern interiors"),
        ("Merino", "Laminates with lasting design"),
        ("Hafele", "Premium hardware and fittings"),
    ]
    brands = []
    for name, desc in brand_defs:
        doc = {
            "name": name,
            "slug": slugify(name),
            "description": desc,
            "logo": img("photo-1560184897-ae75f418493e?w=400&q=80", name, 0),
            "active": True,
            "createdAt": utcnow(),
            "updatedAt": utcnow(),
        }
        result = await db.brands.insert_one(doc)
        doc["_id"] = result.inserted_id
        brands.append(doc)

    banners = [
        {
            "title": "A-2-Z Ply City Center",
            "subtitle": "Premium plywood & hardware for dream interiors",
            "buttonText": "Shop Catalog",
            "buttonLink": "/products",
            "desktopImage": img("photo-1615874959471-d35aa6e2f0a7?w=1600&q=80", "Showroom", 0),
            "mobileImage": img("photo-1615874959471-d35aa6e2f0a7?w=900&q=80", "Showroom", 0),
            "sortOrder": 0,
            "active": True,
            "createdAt": utcnow(),
            "updatedAt": utcnow(),
        },
        {
            "title": "New Season Laminates",
            "subtitle": "Explore textures inspired by natural wood",
            "buttonText": "Browse Laminates",
            "buttonLink": "/categories/laminates",
            "desktopImage": img("photo-1618221195710-dd6b41faaea6?w=1600&q=80", "Laminates", 0),
            "mobileImage": img("photo-1618221195710-dd6b41faaea6?w=900&q=80", "Laminates", 0),
            "sortOrder": 1,
            "active": True,
            "createdAt": utcnow(),
            "updatedAt": utcnow(),
        },
    ]
    await db.banners.insert_many(banners)

    ply_cat = next(c for c in categories if c["slug"] == "plywood")
    lam_cat = next(c for c in categories if c["slug"] == "laminates")
    hw_cat = next(c for c in categories if c["slug"] == "hardware")
    greenply = next(b for b in brands if b["slug"] == "greenply")
    merino = next(b for b in brands if b["slug"] == "merino")
    hafele = next(b for b in brands if b["slug"] == "hafele")

    products = [
        {
            "name": "BWP Marine Plywood 18mm",
            "sku": "PLY-BWP-18",
            "categoryId": str(ply_cat["_id"]),
            "brandId": str(greenply["_id"]),
            "shortDescription": "Boiling water proof plywood for kitchens and wet areas.",
            "description": "High-density BWP marine grade plywood with superior bonding. Ideal for kitchen cabinets, bathrooms, and outdoor-adjacent interiors.",
            "status": "active",
            "isFeatured": True,
            "isNewArrival": False,
            "mrp": 3200,
            "sellingPrice": 2799,
            "images": [
                img("photo-1555041469-a586c61ea9bc?w=1000&q=80", "Plywood sheet", 0),
                img("photo-1615874959471-d35aa6e2f0a7?w=1000&q=80", "Interior use", 1),
                img("photo-1616486338812-3dadae4b4ace?w=1000&q=80", "Grain detail", 2),
            ],
            "variants": [
                {
                    "id": str(uuid.uuid4()),
                    "name": "8x4 ft",
                    "color": "Natural",
                    "size": "8x4",
                    "sku": "PLY-BWP-18-84",
                    "mrp": 3200,
                    "sellingPrice": 2799,
                    "stock": 24,
                    "images": [
                        img("photo-1555041469-a586c61ea9bc?w=1000&q=80", "8x4", 0),
                        img("photo-1615874959471-d35aa6e2f0a7?w=1000&q=80", "8x4 alt", 1),
                    ],
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "7x4 ft",
                    "color": "Natural",
                    "size": "7x4",
                    "sku": "PLY-BWP-18-74",
                    "mrp": 2900,
                    "sellingPrice": 2499,
                    "stock": 12,
                    "images": [
                        img("photo-1616486338812-3dadae4b4ace?w=1000&q=80", "7x4", 0),
                    ],
                },
            ],
            "specifications": [
                {"key": "Thickness", "value": "18 mm"},
                {"key": "Material", "value": "Hardwood Core"},
                {"key": "Finish", "value": "Calibrated"},
                {"key": "Warranty", "value": "10 Years"},
            ],
            "features": ["Boiling water proof", "Termite resistant", "Calibrated surface"],
            "materials": ["Hardwood Core"],
            "finishes": ["Calibrated"],
            "viewCount": 42,
        },
        {
            "name": "Suede Finish Decorative Laminate",
            "sku": "LAM-SUEDE-01",
            "categoryId": str(lam_cat["_id"]),
            "brandId": str(merino["_id"]),
            "shortDescription": "Soft-touch laminate sheets in curated colourways.",
            "description": "Decorative laminate with a refined suede feel. Perfect for wardrobes, panels, and furniture fronts.",
            "status": "active",
            "isFeatured": True,
            "isNewArrival": True,
            "mrp": 2800,
            "sellingPrice": 2500,
            "images": [
                img("photo-1618221195710-dd6b41faaea6?w=1000&q=80", "Laminate green", 0),
            ],
            "variants": [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Sage Green",
                    "color": "Sage Green",
                    "size": "8x4",
                    "sku": "LAM-SUEDE-GRN",
                    "mrp": 2800,
                    "sellingPrice": 2500,
                    "stock": 15,
                    "images": [
                        img("photo-1618221195710-dd6b41faaea6?w=1000&q=80", "Sage", 0),
                        img("photo-1618220179428-22790b461013?w=1000&q=80", "Sage 2", 1),
                        img("photo-1616486338812-3dadae4b4ace?w=1000&q=80", "Sage 3", 2),
                    ],
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Walnut Brown",
                    "color": "Walnut Brown",
                    "size": "8x4",
                    "sku": "LAM-SUEDE-BRN",
                    "mrp": 3000,
                    "sellingPrice": 2700,
                    "stock": 12,
                    "images": [
                        img("photo-1615874959471-d35aa6e2f0a7?w=1000&q=80", "Brown", 0),
                        img("photo-1555041469-a586c61ea9bc?w=1000&q=80", "Brown 2", 1),
                        img("photo-1560184897-ae75f418493e?w=1000&q=80", "Brown 3", 2),
                    ],
                },
            ],
            "specifications": [
                {"key": "Thickness", "value": "1 mm"},
                {"key": "Material", "value": "Decorative Laminate"},
                {"key": "Finish", "value": "Suede Matte"},
                {"key": "Brand", "value": "Merino"},
            ],
            "features": ["Soft-touch surface", "Scratch resistant", "Easy clean"],
            "materials": ["Decorative Laminate"],
            "finishes": ["Suede Matte"],
            "viewCount": 88,
        },
        {
            "name": "Soft-Close Drawer Channel Set",
            "sku": "HW-CH-SOFT",
            "categoryId": str(hw_cat["_id"]),
            "brandId": str(hafele["_id"]),
            "shortDescription": "Full-extension soft-close telescopic channels.",
            "description": "Smooth soft-close drawer channels engineered for quiet everyday use in kitchens and wardrobes.",
            "status": "active",
            "isFeatured": False,
            "isNewArrival": True,
            "mrp": 1450,
            "sellingPrice": 1199,
            "images": [
                img("photo-1586023492125-27b2c045efd7?w=1000&q=80", "Hardware", 0),
                img("photo-1560184897-ae75f418493e?w=1000&q=80", "Hardware 2", 1),
            ],
            "variants": [
                {
                    "id": str(uuid.uuid4()),
                    "name": "450 mm",
                    "color": "Zinc",
                    "size": "450mm",
                    "sku": "HW-CH-450",
                    "mrp": 1450,
                    "sellingPrice": 1199,
                    "stock": 40,
                    "images": [img("photo-1586023492125-27b2c045efd7?w=1000&q=80", "450mm", 0)],
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "500 mm",
                    "color": "Zinc",
                    "size": "500mm",
                    "sku": "HW-CH-500",
                    "mrp": 1550,
                    "sellingPrice": 1299,
                    "stock": 3,
                    "images": [img("photo-1560184897-ae75f418493e?w=1000&q=80", "500mm", 0)],
                },
            ],
            "specifications": [
                {"key": "Material", "value": "Steel"},
                {"key": "Finish", "value": "Zinc Plated"},
                {"key": "Load Capacity", "value": "35 kg"},
            ],
            "features": ["Soft close", "Full extension", "Quiet operation"],
            "materials": ["Steel"],
            "finishes": ["Zinc Plated"],
            "viewCount": 21,
        },
    ]

    for product in products:
        product["slug"] = slugify(product["name"])
        product = denormalize_product_fields(product)
        product["createdAt"] = utcnow()
        product["updatedAt"] = utcnow()
        await db.products.insert_one(product)

    print("Seed complete.")
    print(f"Admin login: {settings.admin_email} / {settings.admin_password}")
    await close_db()


if __name__ == "__main__":
    asyncio.run(seed())
