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
    ("Laptop Pro 15",  "Portatil de alto rendimiento con 16GB RAM y 512GB SSD",            "1299.99", 10,
     "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop"),
    ("Wireless Mouse", "Raton inalambrico ergonomico con bateria de 12 meses",              "29.99",   50,
     "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop"),
    ("Mechanical Keyboard", "Teclado mecanico TKL con switches Cherry MX",                  "89.99",   30,
     "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400&h=300&fit=crop"),
    ("USB-C Hub 7-in-1", "Hub compacto con HDMI, USB 3.0 y lector de tarjetas SD",          "49.99",   40,
     "https://images.unsplash.com/photo-1760376789487-994070337c76?w=400&h=300&fit=crop"),
    ("Monitor 4K 27\"", "Monitor IPS 4K de 27 pulgadas con soporte HDR",                   "399.99",  15,
     "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop"),
    ("Webcam 1080p",    "Webcam Full HD con microfono integrado y autoenfoque",             "69.99",   25,
     "https://images.unsplash.com/photo-1616531770192-6eaea74c2456?w=400&h=300&fit=crop"),
    ("Auriculares ANC", "Auriculares over-ear con cancelacion de ruido y 30h de bateria",   "149.99",  20,
     "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=300&fit=crop"),
    ("SSD Externo 1TB", "SSD NVMe portatil con velocidades USB 3.2 Gen 2",                  "109.99",  35,
     "https://images.unsplash.com/photo-1615512064903-0eb7d620bf45?w=400&h=300&fit=crop"),
    ("Lampara LED Escritorio", "Lampara LED ajustable con puerto de carga USB",             "39.99",   60,
     "https://images.unsplash.com/photo-1766411503488-f90eef1124bb?w=400&h=300&fit=crop"),
    ("Soporte Smartphone", "Soporte ajustable de aluminio para moviles y tablets",          "19.99",   80,
     "https://images.unsplash.com/photo-1653839323575-a8a186296c31?w=400&h=300&fit=crop"),
    ("Altavoz Bluetooth", "Altavoz Bluetooth 5.0 compacto y resistente al agua",            "59.99",   45,
     "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop"),
    ("Tableta Grafica",  "Tableta grafica de 10 pulgadas con 8192 niveles de presion",      "199.99",  12,
     "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=400&h=300&fit=crop"),
    ("Camara Accion 4K", "Camara de accion 4K sumergible con estabilizacion de imagen",     "179.99",  8,
     "https://images.unsplash.com/photo-1685615359827-aa31d97578e7?w=400&h=300&fit=crop"),
    ("Silla Gaming",     "Silla gaming ergonomica con soporte lumbar",                      "249.99",  5,
     "https://images.unsplash.com/photo-1770195483917-b3bb444b7a29?w=400&h=300&fit=crop"),
    ("Kit Gestion Cables", "Bridas de velcro y clips para mantener el escritorio ordenado", "12.99", 100,
     "https://images.unsplash.com/photo-1761507320645-b11a00bfcc34?w=400&h=300&fit=crop"),
    ("Router Wi-Fi 6",  "Router dual-band Wi-Fi 6 AX3000",                                  "129.99",  18,
     "https://images.unsplash.com/photo-1516044734145-07ca8eef8731?w=400&h=300&fit=crop"),
    ("Regleta Inteligente", "Regleta Wi-Fi con 4 tomas y puertos USB",                      "44.99",   22,
     "https://images.unsplash.com/photo-1650501386688-41f6d0251875?w=400&h=300&fit=crop"),
    ("Funda Portatil 15\"", "Funda impermeable para portatil con bolsillo para accesorios", "24.99",   70,
     "https://images.unsplash.com/photo-1689757875266-66446af145dc?w=400&h=300&fit=crop"),
    ("Reposamunecas",   "Reposamunecas de espuma viscoelastica para teclado y raton",       "17.99",   90,
     "https://images.unsplash.com/photo-1575318633968-0383e7d07ca0?w=400&h=300&fit=crop"),
    ("Alfombrilla XL",  "Alfombrilla de escritorio antideslizante extragrande 90x40cm",     "34.99",   0,
     "https://images.unsplash.com/photo-1650566301820-ded93a1bb635?w=400&h=300&fit=crop"),
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
        for name, description, price, stock, image_url in PRODUCTS:
            db.add(
                Product(
                    name=name,
                    description=description,
                    price=Decimal(price),
                    stock=stock,
                    image_url=image_url,
                )
            )
        await db.commit()
