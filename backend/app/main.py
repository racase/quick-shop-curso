import subprocess
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    subprocess.run(["alembic", "upgrade", "head"], check=True)
    from app.db.session import async_session_maker
    from app.seed.seed import run_seed

    async with async_session_maker() as db:
        await run_seed(db)
    yield


app = FastAPI(title="QuickShop API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.auth import router as auth_router
from app.api.v1.cart import router as cart_router
from app.api.v1.orders import router as orders_router
from app.api.v1.products import router as products_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.users import router as users_router

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(products_router, tags=["products"])
app.include_router(cart_router, tags=["cart"])
app.include_router(orders_router, tags=["orders"])
app.include_router(reviews_router, tags=["reviews"])
