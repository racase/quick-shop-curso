import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-canvas-night text-on-dark">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">

        <Link
          to="/"
          className="font-display text-on-dark text-xl shrink-0 hover:opacity-70 transition-opacity"
          style={{ fontWeight: 330, letterSpacing: '0.02em' }}
        >
          QuickShop
        </Link>

        <nav className="flex items-center gap-6 flex-1">
          <Link to="/" className="text-shade-40 hover:text-on-dark text-sm transition-colors">
            Catálogo
          </Link>
          {user?.rol === 'cliente' && (
            <Link to="/cart" className="text-shade-40 hover:text-on-dark text-sm transition-colors">
              Carrito
            </Link>
          )}
          {user?.rol === 'administrador' && (
            <>
              <Link to="/admin/products" className="text-shade-40 hover:text-on-dark text-sm transition-colors">
                Productos
              </Link>
              <Link to="/admin/orders" className="text-shade-40 hover:text-on-dark text-sm transition-colors">
                Pedidos
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <span className="text-shade-40 text-sm hidden sm:block">{user.email}</span>
              <button
                onClick={logout}
                className="rounded-pill border border-white/40 text-on-dark px-5 py-2 text-sm hover:border-white hover:bg-white hover:text-canvas-night transition-all"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-shade-40 hover:text-on-dark text-sm transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-pill border border-white/40 text-on-dark px-5 py-2 text-sm hover:border-white hover:bg-white hover:text-canvas-night transition-all"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
