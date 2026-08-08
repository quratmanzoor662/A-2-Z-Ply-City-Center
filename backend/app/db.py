from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    global client, db
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]
    await ensure_indexes()


async def close_db() -> None:
    global client, db
    if client:
        client.close()
    client = None
    db = None


def get_db() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database is not connected")
    return db


async def ensure_indexes() -> None:
    database = get_db()
    await database.admins.create_index("email", unique=True)
    await database.categories.create_index("slug", unique=True)
    await database.brands.create_index("slug", unique=True)
    await database.products.create_index("slug", unique=True)
    await database.products.create_index("sku")
    await database.products.create_index("categoryId")
    await database.products.create_index("brandId")
    await database.products.create_index("colors")
    await database.products.create_index("materials")
    await database.products.create_index("finishes")
    await database.products.create_index("sellingPrice")
    await database.products.create_index("viewCount")
    await database.products.create_index("createdAt")
    await database.enquiries.create_index("createdAt")
    await database.enquiries.create_index("status")
    await database.banners.create_index("sortOrder")
