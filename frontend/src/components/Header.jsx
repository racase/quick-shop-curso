import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-indigo-200">
          QuickShop
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-indigo-200">
            Catálogo
          </Link>

          {user ? (
            <>
              {user.rol === 'cliente' && (
                <Link to="/cart" className="hover:text-indigo-200">
                  Carrito
                </Link>
              )}
              {user.rol === 'administrador' && (
                <>
                  <Link to="/admin/products" className="hover:text-indigo-200">
                    Productos
                  </Link>
                  <Link to="/admin/orders" className="hover:text-indigo-200">
                    Pedidos
                  </Link>
                </>
              )}
              <span className="text-indigo-200">{user.email}</span>
              <button
                onClick={logout}
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-50 font-medium"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-200">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-50 font-medium"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
