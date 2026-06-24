import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-md mx-auto mt-16'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>Sign in</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
          <input
            type='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
          <input
            type='password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        {error && <p className='text-red-600 text-sm'>{error}</p>}
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50'
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className='mt-4 text-sm text-gray-600'>
        No account?{' '}
        <Link to='/register' className='text-indigo-600 hover:underline'>
          Register
        </Link>
      </p>
    </div>
  )
}
