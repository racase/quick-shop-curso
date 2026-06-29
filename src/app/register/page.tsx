'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError('La contraseña es obligatoria')
      return false
    }
    if (value.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    setPasswordError('')
    return true
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (value) {
      validatePassword(value)
    } else {
      setPasswordError('')
    }
  }

  const isFormValid = email.trim() && password.trim() && !passwordError

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validatePassword(password)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setPasswordError(data.message || 'Error al registrar')
        return
      }

      router.push('/login')
    } catch {
      setPasswordError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8">
        <h1 className="text-2xl font-bold">Registro</h1>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => validatePassword(password)}
            className="w-full rounded border p-2"
          />
          {passwordError && (
            <p className="mt-1 text-sm text-red-500">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </main>
  )
}
