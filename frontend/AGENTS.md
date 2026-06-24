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

## Tailwind CSS

- Usar clases utilitarias directamente en JSX. No crear archivos CSS adicionales salvo casos excepcionales.
- Breakpoints responsivos: sm (640px), md (768px), lg (1024px), xl (1280px).
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

