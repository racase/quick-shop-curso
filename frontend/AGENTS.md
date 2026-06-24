# Frontend - Convenciones y guia de desarrollo

## Stack

| Componente       | Tecnologia       | Version  |
|------------------|------------------|----------|
| Framework        | React            | 18       |
| Bundler          | Vite             | 5.x      |
| Estilos          | Tailwind CSS     | 3.x      |
| Enrutamiento     | React Router     | 6.x      |
| Gestor paquetes  | pnpm             | 11.x     |
| Runtime Node     | Node.js          | 22+      |

## pnpm 11 y allowBuilds (CRITICO)

En pnpm 11 las aprobaciones de build scripts se guardan en pnpm-workspace.yaml bajo la clave allowBuilds, no en el lockfile. El Dockerfile debe copiar pnpm-workspace.yaml antes de ejecutar pnpm install o fallara con ERR_PNPM_IGNORED_BUILDS.

Configuracion minima de pnpm-workspace.yaml:

```yaml
allowBuilds:
  - esbuild
  - '@tailwindcss/oxide'
  - lightningcss

onlyBuiltDependencies:
  - esbuild
  - '@tailwindcss/oxide'
  - lightningcss
```

Orden correcto en el Dockerfile: copiar pnpm-workspace.yaml antes de pnpm install:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Vite: configuracion de PostCSS

Configurar PostCSS directamente en vite.config.js con el plugin oficial de Tailwind. No instalar postcss ni autoprefixer como dependencias separadas: causan errores de regex en Windows.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
})
```

## Estructura de carpetas

```
src/
  components/
    layout/
      Header.jsx        # Barra de navegacion global con enlaces segun rol
      Layout.jsx        # Wrapper con Header + <Outlet />
    ui/                 # Componentes reutilizables: Button, Input, Spinner, etc.
  contexts/
    AuthContext.jsx     # Estado de autenticacion global
  pages/
    auth/
      LoginPage.jsx
      RegisterPage.jsx
    catalog/
      ProductListPage.jsx
      ProductDetailPage.jsx
    cart/
      CartPage.jsx
    orders/
      OrderHistoryPage.jsx
      OrderDetailPage.jsx
    admin/
      ProductManagementPage.jsx
      OrderManagementPage.jsx
      UserListPage.jsx
    NotFoundPage.jsx
  routes/
    AppRouter.jsx       # Configuracion de React Router
    ProtectedRoute.jsx  # Redirige a /login si no autenticado
    AdminRoute.jsx      # Redirige a / si no es admin
  services/
    api.js              # Cliente HTTP base con token adjunto
    authService.js
    productService.js
    cartService.js
    orderService.js
```

## React Router

Usar React Router v6. Las rutas protegidas se envuelven con los componentes de guardia:

```jsx
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
```

Estructura de rutas de ejemplo:

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'cart',
        element: <ProtectedRoute><CartPage /></ProtectedRoute>,
      },
      {
        path: 'orders',
        element: <ProtectedRoute><OrderHistoryPage /></ProtectedRoute>,
      },
      {
        path: 'admin',
        element: <AdminRoute><AdminLayout /></AdminRoute>,
        children: [
          { path: 'products', element: <ProductManagementPage /> },
          { path: 'orders', element: <OrderManagementPage /> },
          { path: 'users', element: <UserListPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
```

## AuthContext

El contexto de autenticacion almacena el usuario y el token en memoria de React. No usar localStorage para el JWT.

```jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    setToken(data.access_token)
    const me = await authService.getMe(data.access_token)
    setUser(me)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

## Capa de servicios API

El cliente HTTP base (services/api.js) adjunta el token y maneja errores de forma uniforme:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function apiFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || response.statusText)
  }

  if (response.status === 204) return null
  return response.json()
}
```

## UI/UX y Sistema de Diseño

Toda decision visual debe partir de **`@frontend/DESIGN.md`** (Shopifi-Inspired Design System). Antes de crear o modificar cualquier componente, leer el fichero. Las reglas siguientes son un resumen de lo critico:

### Dos tracks de canvas — nunca mezclarlos

| Track | Canvas | Uso en QuickShop |
|---|---|---|
| Cinematico (oscuro) | `#000000` (`canvas-night`) | Hero de landing, portada del catalogo, footer global |
| Transaccional (claro) | `#ffffff` / `#fbfbf5` | Login, registro, carrito, pedidos, admin, detalle de producto |

### Colores clave

```
canvas-night:        #000000   (fondo oscuro)
canvas-light:        #ffffff   (fondo claro)
canvas-cream:        #fbfbf5   (fondo crema transaccional)
ink:                 #000000   (texto sobre claro)
on-primary:          #ffffff   (texto sobre oscuro)
aloe-10:             #c1fbd4   (acento verde — solo track claro)
pistachio-10:        #d4f9e0   (banda verde suave — solo track claro)
shade-30 … shade-70: escalera de grises para texto secundario y estados
```

### Tipografia — dos familias, sin mezclar roles

- **Display / headings**: `Neue Haas Grotesk Display` peso 330–500. Fallback: `Helvetica, Arial, sans-serif`.
- **Body / UI / botones**: `Inter Variable` peso 420–550. Fallback: `Inter, Helvetica, Arial, sans-serif`.
- Aplicar `font-feature-settings: "ss03"` globalmente en el elemento raiz.
- Nunca renderizar titulos display con peso ≥ 400; la finura es la firma de marca.

Escala tipografica resumida:

| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| display-xxl | 96px | 330 | Hero hero cinematico |
| display-xl | 70px | 330 | Apertura de sección oscura |
| display-lg | 55px | 330 | Titulo de pagina transaccional |
| display-md | 48px | 330 | Sub-titular en track claro |
| heading-xl | 28px | 500 | Titulo de tarjeta / precio |
| heading-md | 20px | 500 | Sub-encabezado de sección |
| body-md | 16px | 420 | Texto UI por defecto, labels de botón |
| caption | 14px | 500 | Textos auxiliares, pies |

### Botones — siempre forma pill

- `button-primary-pill`: fondo negro, texto blanco, `border-radius: 9999px`, padding `12px 24px`.
- `button-outline-on-dark`: borde blanco 2px, texto blanco, fondo transparente sobre canvas negro.
- `button-outline-on-light`: borde negro 1px, texto negro, fondo blanco.
- `button-aloe-pill`: fondo `#c1fbd4`, texto negro — usado para CTA destacado (carrito, trial).
- **Nunca usar `rounded-md` o `rounded-lg` en botones**; la forma pill es no negociable.

### Bordes redondeados

| Token | Valor | Uso |
|---|---|---|
| xs | 4px | Inputs |
| md | 8px | Campos de formulario, frames de video |
| lg | 12px | Tarjetas de producto, pricing cards |
| xl | 20px | Frames de foto hero |
| pill | 9999px | Todos los botones, chips, tags |

### Espaciado (base 8px)

`xxs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `xxl` 32 · `huge` 64

- Secciones cinematicas: 64–128px de padding vertical.
- Secciones transaccionales: ~48px entre bandas.
- Padding interno de tarjetas: 32px.

### Componentes de tarjeta

- `card-pricing`: fondo blanco, borde `hairline-light` 1px, `rounded-lg`, sombra escalonada (4 sombras apiladas de 10% negro).
- `card-pricing-featured`: fondo `aloe-10`, misma geometria. Sin borde de color de marca.
- `card-feature-cinematic`: fondo `#0a0a0a`, texto blanco, `rounded-lg`.
- Fotografias: full-bleed sin padding, `rounded-xl`, nunca texto encima de la imagen en el track cinematico.

### Navegacion

- **Nav oscuro** (`nav-bar-dark`): `canvas-night`, texto `on-primary`, dos botones pill a la derecha.
- **Nav claro** (`nav-bar-light`): `canvas-light`, texto `ink`, misma estructura.
- Colapsa a hamburger por debajo de 768px; hereda la polaridad del canvas.

### Do's y Don'ts criticos

**Hacer:**
- Reservar `aloe-10` y `pistachio-10` exclusivamente para el track claro.
- Usar siempre `rounded-pill` (9999px) en botones.
- Renderizar display en peso 330.
- Aplicar `font-feature-settings: "ss03"` globalmente.
- Fotografias full-bleed en paginas cinematicas.

**No hacer:**
- No introducir un tercer color de canvas (grises, beiges, azules no pertenecen al sistema).
- No añadir sombras drop en tarjetas del track oscuro (solo highlight inset superior sutil).
- No usar `rounded-md`/`rounded-lg` en botones.
- No usar `aloe`/`pistachio` como colores de texto.

### Breakpoints responsivos

| Nombre | Ancho | Cambios clave |
|---|---|---|
| Wide | ≥1440px | Hero cinematico full-bleed; pricing 4 columnas |
| Desktop | 1024–1440px | Contenido a max-width; pricing 4 columnas |
| Tablet | 768–1023px | Pricing 2 columnas; foto cinematica recortada |
| Mobile | <768px | Pricing 1 columna; hamburger nav; display-xxl baja a ~56px |

## Tailwind CSS

- Usar clases utilitarias directamente en JSX. No crear archivos CSS adicionales salvo casos excepcionales.
- Aplicar las clases de color y tipografia de DESIGN.md extendiendo `tailwind.config.js` con los tokens del sistema (colores, fuentes, espaciado).
- Breakpoints responsivos alineados con DESIGN.md: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1440px).
- El header y el layout son responsivos.

## Variables de entorno

Las variables en Vite deben tener el prefijo VITE_:

```
VITE_API_URL=http://localhost:8000
```

Acceder en el codigo: `import.meta.env.VITE_API_URL`

## Comandos de desarrollo

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo
pnpm dev

# Build de produccion
pnpm build

# Preview del build de produccion
pnpm preview
```

## .dockerignore (obligatorio)

Es obligatorio tener un .dockerignore en frontend/ para evitar errores de symlinks en Windows y reducir el contexto de build:

```
node_modules
dist
.pnpm-store
*.log
.env
.env.local
```

## Convenciones de Idioma
- **El agente debe comunicarse e interactuar siempre en castellano (español).**
- El código fuente, logs y comentarios deben estar en inglés.

