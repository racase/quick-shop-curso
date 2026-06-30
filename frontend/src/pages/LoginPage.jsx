import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as apiLogin, getMe } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access_token } = await apiLogin(email, password)
      const userData = await getMe(access_token)
      login(access_token, userData)
      navigate('/')
    } catch (err) {
      setError(err.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-canvas-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <p
            className="font-body text-shade-50 uppercase text-xs tracking-[0.06em] mb-3"
          >
            Acceso
          </p>
          <h1
            className="font-display text-ink text-[40px] leading-none"
            style={{ fontWeight: 330 }}
          >
            Bienvenido de nuevo
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-canvas-light rounded-lg p-8 space-y-5"
          style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12)' }}
        >
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-[500] text-shade-60 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-hairline-light rounded-md px-3 py-2.5 text-sm text-ink bg-canvas-light focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-[500] text-shade-60 mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-hairline-light rounded-md px-3 py-2.5 text-sm text-ink bg-canvas-light focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-pill bg-ink text-on-dark py-3 text-sm font-[420] hover:bg-shade-70 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-sm text-center text-shade-50">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-ink underline underline-offset-2 hover:text-shade-60">
              Regístrate
            </Link>
          </p>
        </form>

      </div>
    </div>
  )
}
