import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()
  const cartCtx = useContext(CartContext)

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
            <Link to="/cart" className="flex items-center gap-1.5 text-shade-40 hover:text-on-dark text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              Carrito
              {cartCtx && cartCtx.itemCount > 0 && (
                <span className="bg-on-dark text-canvas-night text-[10px] font-[600] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {cartCtx.itemCount}
                </span>
              )}
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
