from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import close_db, connect_db
from app.routers import (
    auth,
    banners,
    brands,
    categories,
    dashboard,
    enquiries,
    products,
    settings as settings_router,
    uploads,
)
from app.services.cloudinary import configure_cloudinary


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_db()
    configure_cloudinary()
    yield
    await close_db()


def create_app() -> FastAPI:
    config = get_settings()
    app = FastAPI(title="A-2-Z Ply City Center API", version="1.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origin_list,
        # All Vercel production + preview URLs (e.g. *-qurat-s-team.vercel.app)
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(settings_router.router)
    app.include_router(categories.router)
    app.include_router(brands.router)
    app.include_router(banners.router)
    app.include_router(products.router)
    app.include_router(enquiries.router)
    app.include_router(dashboard.router)
    app.include_router(uploads.router)

    @app.get("/api/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
