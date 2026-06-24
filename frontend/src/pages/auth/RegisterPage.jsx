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

  const inputClass =
    'w-full bg-canvas-light border border-hairline-light rounded-md px-3 py-[10px] font-body text-base font-[420] text-ink placeholder-shade-40 focus:outline-none focus:border-shade-50 transition-colors'
  const labelClass =
    'block font-body text-sm font-[500] text-shade-60 mb-1.5 tracking-[0.28px]'

  return (
    <div className='flex-1 bg-canvas-cream flex items-center justify-center px-4 py-16'>
      <div className='w-full max-w-md bg-canvas-light rounded-lg p-8 shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)]'>
        <span className='font-body text-xs font-[400] tracking-[0.72px] uppercase text-shade-50 mb-3 block'>
          Account
        </span>
        <h1 className='font-display text-[48px] font-[330] leading-[1.14] text-ink mb-8'>
          Create account
        </h1>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label className={labelClass}>Full name</label>
            <input
              name='full_name'
              required
              value={form.full_name}
              onChange={handleChange}
              placeholder='Jane Doe'
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type='email'
              name='email'
              required
              value={form.email}
              onChange={handleChange}
              placeholder='you@example.com'
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type='password'
              name='password'
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm password</label>
            <input
              type='password'
              name='confirm'
              required
              value={form.confirm}
              onChange={handleChange}
              className={inputClass}
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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className='mt-6 font-body text-sm text-shade-50'>
          Already have an account?{' '}
          <Link to='/login' className='text-ink font-[500] underline underline-offset-2 hover:text-shade-70'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
