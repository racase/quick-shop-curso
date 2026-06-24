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
    <header className='bg-canvas-night text-on-primary border-b border-hairline-dark'>
      <div className='max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between'>
        <Link
          to='/'
          className='font-display text-xl font-medium tracking-wide text-on-primary hover:text-on-primary/80 transition-colors'
        >
          QuickShop
        </Link>

        <nav className='flex items-center gap-6 font-body text-sm'>
          <Link to='/' className='text-on-primary/60 hover:text-on-primary transition-colors'>
            Catalog
          </Link>

          {user ? (
            <>
              <Link
                to='/profile'
                className='text-on-primary/60 hover:text-on-primary transition-colors'
              >
                {user.full_name}
              </Link>
              {user.role === 'admin' && (
                <>
                  <Link
                    to='/admin/products'
                    className='text-on-primary/60 hover:text-on-primary transition-colors'
                  >
                    Products
                  </Link>
                  <Link
                    to='/admin/users'
                    className='text-on-primary/60 hover:text-on-primary transition-colors'
                  >
                    Users
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className='border border-on-primary/30 text-on-primary px-6 py-2 rounded-pill text-sm hover:border-on-primary/70 transition-colors'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className='text-on-primary/60 hover:text-on-primary transition-colors'
              >
                Login
              </Link>
              <Link
                to='/register'
                className='border border-on-primary/30 text-on-primary px-6 py-2 rounded-pill text-sm hover:border-on-primary/70 transition-colors'
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
