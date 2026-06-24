import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className='bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'>
        <Link to='/' className='text-xl font-bold text-indigo-600'>
          QuickShop
        </Link>
        <nav className='flex items-center gap-4 text-sm'>
          <Link to='/' className='text-gray-600 hover:text-gray-900'>
            Catalog
          </Link>
          {user ? (
            <>
              <Link to='/profile' className='text-gray-600 hover:text-gray-900'>
                {user.full_name}
              </Link>
              {user.role === 'admin' && (
                <>
                  <Link to='/admin/products' className='text-gray-600 hover:text-gray-900'>
                    Products
                  </Link>
                  <Link to='/admin/users' className='text-gray-600 hover:text-gray-900'>
                    Users
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className='text-gray-600 hover:text-gray-900'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to='/login' className='text-gray-600 hover:text-gray-900'>
                Login
              </Link>
              <Link
                to='/register'
                className='bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700'
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
