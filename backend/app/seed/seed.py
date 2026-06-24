from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.product import Product
from app.models.user import User, UserRole

USERS = [
    {
        "email": "admin@quickshop.com",
        "password": "Admin1234!",
        "full_name": "Admin QuickShop",
        "role": UserRole.admin,
    },
    {
        "email": "cliente1@quickshop.com",
        "password": "Cliente1234!",
        "full_name": "Cliente Uno",
        "role": UserRole.client,
    },
    {
        "email": "cliente2@quickshop.com",
        "password": "Cliente1234!",
        "full_name": "Cliente Dos",
        "role": UserRole.client,
    },
]

PRODUCTS = [
    ("Laptop Pro 15", "High-performance laptop with 16GB RAM and 512GB SSD", "1299.99", 10),
    ("Wireless Mouse", "Ergonomic wireless mouse with 12-month battery life", "29.99", 50),
    ("Mechanical Keyboard", "TKL mechanical keyboard with Cherry MX switches", "89.99", 30),
    ("USB-C Hub 7-in-1", "Compact hub with HDMI, USB 3.0, SD card reader", "49.99", 40),
    ("4K Monitor 27\"", "27-inch 4K IPS monitor with HDR support", "399.99", 15),
    ("Webcam 1080p", "Full HD webcam with built-in microphone and auto-focus", "69.99", 25),
    ("Noise-Cancelling Headphones", "Over-ear ANC headphones with 30h battery", "149.99", 20),
    ("External SSD 1TB", "Portable NVMe SSD with USB 3.2 Gen 2 speeds", "109.99", 35),
    ("Desk Lamp LED", "Adjustable LED desk lamp with USB charging port", "39.99", 60),
    ("Smartphone Stand", "Adjustable aluminium stand for phones and tablets", "19.99", 80),
    ("Bluetooth Speaker", "Compact waterproof Bluetooth 5.0 speaker", "59.99", 45),
    ("Drawing Tablet", "10-inch graphic tablet with 8192 pressure levels", "199.99", 12),
    ("Action Camera 4K", "Waterproof 4K action camera with image stabilisation", "179.99", 8),
    ("Gaming Chair", "Ergonomic gaming chair with lumbar support", "249.99", 5),
    ("Cable Management Kit", "Velcro cable ties and clips for tidy desk setup", "12.99", 100),
    ("Router Wi-Fi 6", "AX3000 dual-band Wi-Fi 6 router", "129.99", 18),
    ("Smart Power Strip", "Wi-Fi smart power strip with 4 outlets and USB ports", "44.99", 22),
    ("Laptop Sleeve 15\"", "Water-resistant laptop sleeve with accessory pocket", "24.99", 70),
    ("Wrist Rest", "Memory foam wrist rest for keyboard and mouse", "17.99", 90),
    ("Desk Mat XL", "Extra-large non-slip desk mat, 90x40cm", "34.99", 0),
]


async def run_seed(db: AsyncSession) -> None:
    user_count = (await db.execute(select(func.count()).select_from(User))).scalar()
    if user_count == 0:
        for u in USERS:
            db.add(
                User(
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                )
            )
        await db.commit()

    product_count = (await db.execute(select(func.count()).select_from(Product))).scalar()
    if product_count == 0:
        for i, (name, description, price, stock) in enumerate(PRODUCTS, start=1):
            db.add(
                Product(
                    name=name,
                    description=description,
                    price=Decimal(price),
                    stock=stock,
                    image_url=f"https://picsum.photos/seed/quickshop-{i}/400/300",
                )
            )
        await db.commit()
