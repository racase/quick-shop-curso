# frontend/AGENTS.md - Instrucciones de frontend

## Stack y herramientas

- React 18
- Vite
- Tailwind CSS 3
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
