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
    } catch {
      setError('Incorrect credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex-1 bg-canvas-cream flex items-center justify-center px-4 py-16'>
      <div className='w-full max-w-md bg-canvas-light rounded-lg p-8 shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)]'>
        <span className='font-body text-xs font-[400] tracking-[0.72px] uppercase text-shade-50 mb-3 block'>
          Account
        </span>
        <h1 className='font-display text-[48px] font-[330] leading-[1.14] text-ink mb-8'>
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label className='block font-body text-sm font-[500] text-shade-60 mb-1.5 tracking-[0.28px]'>
              Email
            </label>
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              className='w-full bg-canvas-light border border-hairline-light rounded-md px-3 py-[10px] font-body text-base font-[420] text-ink placeholder-shade-40 focus:outline-none focus:border-shade-50 transition-colors'
            />
          </div>
          <div>
            <label className='block font-body text-sm font-[500] text-shade-60 mb-1.5 tracking-[0.28px]'>
              Password
            </label>
            <input
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full bg-canvas-light border border-hairline-light rounded-md px-3 py-[10px] font-body text-base font-[420] text-ink placeholder-shade-40 focus:outline-none focus:border-shade-50 transition-colors'
            />
          </div>

          {error && (
            <p className='font-body text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md'>
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-ink text-on-primary font-body text-base font-[420] py-3 rounded-pill hover:bg-shade-70 disabled:opacity-50 transition-colors mt-2'
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className='mt-6 font-body text-sm text-shade-50'>
          No account?{' '}
          <Link to='/register' className='text-ink font-[500] underline underline-offset-2 hover:text-shade-70'>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
