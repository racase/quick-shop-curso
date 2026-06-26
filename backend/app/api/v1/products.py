from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.schemas.product import ProductCreate, ProductListOut, ProductOut, ProductUpdate
from app.services.product import (
    create_product,
    deactivate_product,
    get_product,
    list_products,
    update_product,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=list[ProductListOut])
async def get_products(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await list_products(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product_detail(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await get_product(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return product


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_new_product(
    payload: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    return await create_product(db, payload)


@router.put("/{product_id}", response_model=ProductOut)
async def update_existing_product(
    product_id: int,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    product = await get_product(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return await update_product(db, product, payload)


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    product = await get_product(db, product_id)
    if product is None or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    await deactivate_product(db, product)
    return {"detail": "Producto desactivado correctamente"}
