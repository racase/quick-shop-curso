import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister, login as apiLogin, getMe } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

function validatePassword(password) {
  if (password.length < 8) return 'Mínimo 8 caracteres'
  if (!/[A-Z]/.test(password)) return 'Debe contener al menos una mayúscula'
  if (!/[a-z]/.test(password)) return 'Debe contener al menos una minúscula'
  if (!/\d/.test(password)) return 'Debe contener al menos un número'
  return ''
}

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handlePasswordChange(e) {
    const val = e.target.value
    setPassword(val)
    setPasswordError(validatePassword(val))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError = validatePassword(password)
    if (validationError) {
      setPasswordError(validationError)
      return
    }
    setError('')
    setLoading(true)
    try {
      await apiRegister(email, password)
      const { access_token } = await apiLogin(email, password)
      const userData = await getMe(access_token)
      login(access_token, userData)
      navigate('/')
    } catch (err) {
      setError(err.detail || 'Error al registrarse')
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
            Registro
          </p>
          <h1
            className="font-display text-ink text-[40px] leading-none"
            style={{ fontWeight: 330 }}
          >
            Crea tu cuenta
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
              onChange={handlePasswordChange}
              className={`w-full border rounded-md px-3 py-2.5 text-sm text-ink bg-canvas-light focus:outline-none focus:ring-2 transition-colors ${
                passwordError
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-hairline-light focus:ring-ink/20 focus:border-ink'
              }`}
            />
            {passwordError && (
              <p className="text-xs text-red-600 mt-1.5">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!passwordError}
            className="w-full rounded-pill bg-ink text-on-dark py-3 text-sm font-[420] hover:bg-shade-70 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <p className="text-sm text-center text-shade-50">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-ink underline underline-offset-2 hover:text-shade-60">
              Inicia sesión
            </Link>
          </p>
        </form>

      </div>
    </div>
  )
}
