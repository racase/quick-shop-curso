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
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 space-y-5">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={handlePasswordChange}
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              passwordError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500'
            }`}
          />
          {passwordError && (
            <p className="text-xs text-red-600 mt-1">{passwordError}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !!passwordError}
          className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        <p className="text-sm text-center text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
