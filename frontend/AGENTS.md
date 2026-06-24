# Guia de agentes — Frontend QuickShop

## Stack y herramientas

- React 18 con JSX
- Vite como bundler y servidor de desarrollo
- Tailwind CSS para estilos
- React Router v6 para navegacion
- pnpm 11 como gestor de dependencias
- fetch nativo para llamadas HTTP (no axios ni react-query)

## pnpm 11 — aviso critico para Docker

En pnpm 11, las aprobaciones de build scripts se guardan en `pnpm-workspace.yaml` bajo la clave `allowBuilds`, y no en el lockfile como en versiones anteriores. Si el Dockerfile no copia `pnpm-workspace.yaml` antes de ejecutar `pnpm install`, el build fallara con `ERR_PNPM_IGNORED_BUILDS`.

Orden correcto de instrucciones COPY en el Dockerfile:

```dockerfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
```

Nunca colocar `COPY . .` antes de `pnpm install` en produccion (invalida la cache de capas).

## Estructura de carpetas

```
frontend/
├── src/
│   ├── api/
│   │   ├── auth.js         # register, login, logout
│   │   ├── users.js        # getMe, updateMe
│   │   ├── products.js     # getProducts, getProduct, (admin) createProduct, etc.
│   │   ├── cart.js         # getCart, addItem, updateItem, removeItem, clearCart
│   │   └── orders.js       # createOrder, getOrders, getOrder, updateOrderStatus
│   ├── components/
│   │   ├── layout/         # Header, Footer, Layout wrapper
│   │   ├── auth/           # ProtectedRoute, AdminRoute
│   │   ├── products/       # ProductCard, ProductGrid, ProductForm
│   │   ├── cart/           # CartItem, CartSummary
│   │   └── orders/         # OrderCard, OrderStatusBadge
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── CatalogPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── OrderDetailPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── admin/
│   │   │   ├── AdminProductsPage.jsx
│   │   │   ├── AdminProductFormPage.jsx
│   │   │   ├── AdminOrdersPage.jsx
│   │   │   └── AdminOrderDetailPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/
│   │   ├── useAuth.js      # Acceso al contexto de autenticacion
│   │   └── useCart.js      # Acceso al contexto del carrito
│   ├── store/
│   │   ├── AuthContext.jsx  # Proveedor de autenticacion y token
│   │   └── CartContext.jsx  # Proveedor del estado del carrito
│   ├── router.jsx          # Definicion de rutas con React Router
│   └── main.jsx            # Punto de entrada; monta providers
├── Dockerfile
├── nginx.conf
├── package.json
├── pnpm-workspace.yaml     # Requerido por pnpm 11 para allowBuilds
├── pnpm-lock.yaml
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

## Autenticacion

### Almacenamiento del token

El JWT no se almacena en localStorage. Se guarda en memoria dentro de `AuthContext`. Al recargar la pagina, el usuario debe volver a autenticarse.

Alternativa aceptable si se necesita persistencia: cookie HttpOnly gestionada por el backend (fuera del alcance de este proyecto).

### AuthContext

Expone:
- `user`: objeto con `{ id, email, full_name, role }` o `null`.
- `token`: string del JWT o `null`.
- `login(email, password)`: llama a `POST /auth/login`, guarda el token y decodifica el payload.
- `logout()`: llama a `POST /auth/logout`, limpia el estado.
- `isAuthenticated`: boolean derivado de `token !== null`.
- `isAdmin`: boolean derivado de `user?.role === 'admin'`.

### Rutas protegidas

- `ProtectedRoute`: redirige a `/login` si el usuario no esta autenticado.
- `AdminRoute`: redirige a `/` si el usuario no tiene rol admin.

## Llamadas a la API

Todas las funciones de `src/api/` siguen el mismo patron:

```javascript
export async function getProducts(params = {}) {
  const url = new URL(`${import.meta.env.VITE_API_URL}/products`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw await res.json();
  return res.json();
}
```

Las funciones que requieren autenticacion reciben el token como parametro o lo leen del contexto via el hook `useAuth`.

## Convenciones de componentes

- Componentes funcionales con hooks; sin clases.
- Un componente por archivo; el nombre del archivo coincide con el nombre del componente.
- Props tipadas con JSDoc cuando no son evidentes por el nombre.
- No usar `useEffect` para derivar estado que se puede calcular directamente.
- Tailwind CSS para todos los estilos; no crear archivos CSS adicionales salvo casos excepcionales.

## Estado del carrito

`CartContext` mantiene el estado local del carrito sincronizado con el backend:
- Al montar (si hay usuario autenticado con rol client), hace `GET /cart`.
- Cada operacion (agregar, modificar, eliminar) llama al endpoint correspondiente y actualiza el estado local con la respuesta.
- El numero de articulos del carrito se muestra en el header.

## Rutas de la aplicacion

| Ruta                          | Componente                 | Acceso          |
|-------------------------------|----------------------------|-----------------|
| /                             | CatalogPage                | Publico         |
| /products/:id                 | ProductDetailPage          | Publico         |
| /login                        | LoginPage                  | Publico         |
| /register                     | RegisterPage               | Publico         |
| /cart                         | CartPage                   | Cliente         |
| /orders                       | OrdersPage                 | Cliente         |
| /orders/:id                   | OrderDetailPage            | Cliente         |
| /profile                      | ProfilePage                | Autenticado     |
| /admin/products               | AdminProductsPage          | Admin           |
| /admin/products/new           | AdminProductFormPage       | Admin           |
| /admin/products/:id/edit      | AdminProductFormPage       | Admin           |
| /admin/orders                 | AdminOrdersPage            | Admin           |
| /admin/orders/:id             | AdminOrderDetailPage       | Admin           |
| *                             | NotFoundPage               | Publico         |

## Dockerfile del frontend

```dockerfile
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# pnpm-workspace.yaml debe copiarse antes de pnpm install (requerido por pnpm 11)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Variables de entorno

| Variable        | Descripcion                          |
|-----------------|--------------------------------------|
| `VITE_API_URL`  | URL base de la API (ej: http://localhost:8000) |

Las variables de entorno de Vite con prefijo `VITE_` se embeben en el bundle en tiempo de build.

## nginx.conf (produccion)

El archivo `nginx.conf` debe incluir la directiva `try_files $uri /index.html` para que React Router maneje las rutas del lado del cliente:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
