import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await authService.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
      })
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-md mx-auto mt-16'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>Create account</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Full name</label>
          <input
            name='full_name'
            required
            value={form.full_name}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
          <input
            type='email'
            name='email'
            required
            value={form.email}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
          <input
            type='password'
            name='password'
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm password</label>
          <input
            type='password'
            name='confirm'
            required
            value={form.confirm}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        {error && <p className='text-red-600 text-sm'>{error}</p>}
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50'
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className='mt-4 text-sm text-gray-600'>
        Already have an account?{' '}
        <Link to='/login' className='text-indigo-600 hover:underline'>
          Sign in
        </Link>
      </p>
    </div>
  )
}
