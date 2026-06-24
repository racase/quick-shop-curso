import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_admin
from app.schemas.product import PaginatedProducts, ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service, review_service

router = APIRouter()


@router.get("/products", response_model=PaginatedProducts)
async def list_products(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    products, total = await product_service.list_active(db, page=page, size=size, search=search)
    return PaginatedProducts(items=products, total=total, page=page, size=size)


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    product = await product_service.get_active_by_id(db, str(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    rating_fields = await review_service.get_product_rating_fields(db, product.id)
    return ProductResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        image_url=product.image_url,
        is_active=product.is_active,
        average_rating=rating_fields["average_rating"],
        rating_count=rating_fields["rating_count"],
    )


@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await product_service.create(db, data)


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.update(db, str(product_id), data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(
    product_id: uuid.UUID,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.deactivate(db, str(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")


@router.get("/admin/products", response_model=PaginatedProducts)
async def list_all_products(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    products, total = await product_service.list_all(db, page=page, size=size, search=search)
    return PaginatedProducts(items=products, total=total, page=page, size=size)
