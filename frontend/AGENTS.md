# frontend/AGENTS.md - Instrucciones de frontend

## Stack y herramientas

- React 18
- Vite
- Tailwind CSS v4 (configurado via `@theme {}` en `index.css`, sin `tailwind.config.js`)
- React Router v6
- pnpm 11 (requiere Node.js >= 22.13)
- fetch nativo o axios para llamadas a la API

## Estructura del proyecto

```
frontend/
├── src/
│   ├── api/               # Un fichero por modulo (auth.js, products.js, cart.js, orders.js, users.js)
│   ├── components/        # Componentes reutilizables (Header, ProductCard, CartItem, OrderRow, etc.)
│   ├── pages/             # Una pagina por ruta
│   ├── context/
│   │   ├── AuthContext.jsx    # Estado de autenticacion, token en memoria
│   │   └── CartContext.jsx    # Estado del carrito
│   ├── hooks/             # Hooks personalizados (useAuth, useCart)
│   ├── App.jsx            # Definicion de rutas con React Router
│   └── main.jsx           # Punto de entrada
├── package.json
├── pnpm-workspace.yaml    # Obligatorio: contiene allowBuilds
├── pnpm-lock.yaml
├── vite.config.js
├── tailwind.config.js
├── .dockerignore
└── Dockerfile
```

## Sistema de diseño

Todas las decisiones de UI/UX siguen las especificaciones de `@DESIGN.md`. Leer ese fichero antes de crear o modificar cualquier componente.

### Dos pistas de diseño

El sistema define dos pistas complementarias que **nunca deben mezclarse en el mismo band/seccion**:

| Pista | Canvas | Tipografia | Botones | Uso en QuickShop |
|-------|--------|-----------|---------|-----------------|
| Cinematica (dark) | `canvas-night` #000000 | Neue Haas Grotesk Display, weight 330 | `button-outline-on-dark` (pill, borde blanco) | Header global, hero section del catalogo |
| Transaccional (light) | `canvas-light` #fff / `canvas-cream` #fbfbf5 | Inter Variable | `button-primary-pill` (pill negro solido) | Auth, admin, product grid, carrito, pedidos |

### Asignacion de pista por pagina

| Pagina / Seccion | Pista |
|-----------------|-------|
| Header (global) | Cinematica |
| CatalogPage — banda hero | Cinematica |
| CatalogPage — grid de productos | Transaccional |
| LoginPage | Transaccional (fondo canvas-cream) |
| RegisterPage | Transaccional (fondo canvas-cream) |
| AdminProductsPage | Transaccional |
| CartPage | Transaccional |
| OrdersPage / OrderDetailPage | Transaccional |
| AdminOrdersPage | Transaccional |

### Reglas criticas de UI

- **Botones siempre pill** — usar `rounded-pill` en todos los botones. Nunca `rounded`, `rounded-lg`, ni `rounded-md` en botones.
- **Display fonts a weight 330** — aplicar via `style={{ fontWeight: 330 }}` (Tailwind no tiene clase para ese valor). La clase `font-display` activa la familia (NHGD / fallback Helvetica).
- **`font-feature-settings: "ss03"`** — aplicado globalmente en `index.css`. No repetir en componentes.
- **Aloe (`bg-aloe`) y pistachio (`bg-pistachio`)** — solo en pista transaccional. Nunca en fondos oscuros.
- **Elevaciones** — usar `style={{ boxShadow: ... }}` para los valores exactos del sistema:
  - Level 3 (cards light): `0 8px 8px rgba(0,0,0,0.05), 0 4px 4px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)`
  - Level 4 (modales): `0 25px 50px -12px rgba(0,0,0,0.25)`

### Tokens Tailwind disponibles (definidos en `src/index.css` via `@theme {}`)

| Token DESIGN.md | Clase Tailwind generada |
|-----------------|------------------------|
| `colors.canvas-night` | `bg-canvas-night`, `text-canvas-night` |
| `colors.canvas-light` | `bg-canvas-light` |
| `colors.canvas-cream` | `bg-canvas-cream` |
| `colors.ink` | `text-ink`, `bg-ink` |
| `colors.on-dark` | `text-on-dark` |
| `colors.aloe-10` | `bg-aloe`, `text-aloe` |
| `colors.pistachio-10` | `bg-pistachio` |
| `colors.hairline-light` | `border-hairline-light` |
| `colors.shade-30..70` | `text-shade-40`, `bg-shade-30`, etc. |
| `rounded.pill` | `rounded-pill` |
| `rounded.lg` (12px) | `rounded-lg` |
| `rounded.md` (8px) | `rounded-md` |
| `typography.display-*` | `font-display` + `style={{ fontWeight: 330 }}` |
| `typography.body-*` | `font-body` (aplicado por defecto en `body`) |

## Convenciones de frontend

### Autenticacion y token

- El access token se almacena en memoria (estado de React via Context), nunca en localStorage.
- Al recargar la pagina el usuario pierde la sesion y debe volver a autenticarse.
- Las rutas protegidas redirigen a /login si no hay sesion activa.

### Tailwind CSS y PostCSS en Windows

Configurar PostCSS inline en vite.config.js usando solo el plugin de Tailwind para Vite, sin instalar ni configurar PostCSS ni Autoprefixer como dependencias externas. Esto evita fallos de regex en Windows:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()]
})
```

### Rutas de la aplicacion

| Ruta                  | Pagina                  | Acceso         |
|-----------------------|-------------------------|----------------|
| /login                | LoginPage               | Publico        |
| /register             | RegisterPage            | Publico        |
| /                     | CatalogPage             | Publico        |
| /cart                 | CartPage                | Cliente        |
| /orders               | OrdersPage              | Cliente        |
| /orders/:id           | OrderDetailPage         | Cliente        |
| /admin/products       | AdminProductsPage       | Administrador  |
| /admin/orders         | AdminOrdersPage         | Administrador  |

### Layout

- El header es un componente global que contiene: nombre de la app, enlace al catalogo, icono de carrito con contador de items (solo clientes autenticados), email del usuario autenticado y boton de cerrar sesion.
- Todas las paginas utilizan un layout principal con el header en la parte superior.
- El diseno es responsive (movil y escritorio) usando las utilidades de Tailwind.

### Variables de entorno

Declarar en `.env` y `.env.example`:
```
VITE_API_URL=http://localhost:8000
```

Acceder en el codigo como `import.meta.env.VITE_API_URL`.

## Configuracion critica de pnpm 11

En pnpm 11, las aprobaciones de build scripts se guardan en pnpm-workspace.yaml bajo la clave `allowBuilds`, no en el lockfile. El Dockerfile debe copiar pnpm-workspace.yaml antes de ejecutar pnpm install o fallara con ERR_PNPM_IGNORED_BUILDS.

Contenido minimo de pnpm-workspace.yaml:
```yaml
allowBuilds:
  - esbuild
  - lightningcss
  - tailwindcss
```

## Dockerfile del frontend

```dockerfile
FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev", "--host"]
```

El orden de COPY es critico: pnpm-workspace.yaml debe copiarse antes de pnpm install.

## .dockerignore del frontend

```
node_modules
dist
.env
```

Excluir node_modules es obligatorio para evitar errores de symlinks en Windows al construir la imagen.

## Paginas requeridas

### Publicas (accesibles sin autenticacion)

- **LoginPage:** formulario email + password, boton de acceso, enlace a registro, mensaje de error si las credenciales son incorrectas.
- **RegisterPage:** formulario email + password, boton de registro, enlace a login, validaciones inline.
- **CatalogPage:** cuadricula de ProductCard. Cada tarjeta muestra imagen, nombre, precio y boton "Agregar al carrito". El boton esta deshabilitado si stock es 0.

### Cliente autenticado

- **CartPage:** lista de items con imagen, nombre, precio unitario, selector de cantidad y boton eliminar. Total al pie. Boton "Finalizar compra". Boton "Vaciar carrito".
- **OrdersPage:** lista de pedidos con id, fecha, estado y total. Boton "Cancelar" visible y activo solo para pedidos en estado pendiente.
- **OrderDetailPage:** detalle de items con cantidades, precios unitarios, subtotales y total del pedido.

### Administrador

- **AdminProductsPage:** tabla de productos con nombre, precio, stock y estado. Botones para crear, editar y desactivar. Formulario en modal o pagina separada.
- **AdminOrdersPage:** tabla de todos los pedidos del sistema con email del cliente, fecha y estado. Selector de estado para cambiar el estado de cada pedido.
