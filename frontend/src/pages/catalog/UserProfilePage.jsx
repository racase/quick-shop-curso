import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'

export function UserProfilePage() {
  const { user, token } = useAuth()
  const [form, setForm] = useState({ full_name: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, full_name: user.full_name }))
  }, [user])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)
    try {
      const update = {}
      if (form.full_name !== user.full_name) update.full_name = form.full_name
      if (form.password) update.password = form.password
      await userService.updateMe(update, token)
      setMessage('Profile updated successfully')
      setForm((f) => ({ ...f, password: '' }))
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
    <div className='flex-1 bg-canvas-cream px-4 py-16'>
      <div className='max-w-[560px] mx-auto'>
        <span className='font-body text-xs font-[400] tracking-[0.72px] uppercase text-shade-50 mb-3 block'>
          Account
        </span>
        <h1 className='font-display text-[48px] font-[330] leading-[1.14] text-ink mb-10'>
          My profile
        </h1>

        {/* Read-only info */}
        <div className='bg-canvas-light rounded-lg border border-hairline-light p-6 mb-8 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]'>
          <div className='grid grid-cols-2 gap-y-3'>
            <span className='font-body text-sm font-[500] text-shade-60 tracking-[0.28px]'>Email</span>
            <span className='font-body text-sm font-[420] text-ink'>{user?.email}</span>
            <span className='font-body text-sm font-[500] text-shade-60 tracking-[0.28px]'>Role</span>
            <span className='inline-flex'>
              <span className='bg-aloe-10 text-ink font-body text-xs font-[400] tracking-[0.72px] uppercase px-3 py-0.5 rounded-pill capitalize'>
                {user?.role}
              </span>
            </span>
          </div>
        </div>

        {/* Editable form */}
        <div className='bg-canvas-light rounded-lg border border-hairline-light p-6 shadow-[0_8px_8px_rgba(0,0,0,0.06),0_4px_4px_rgba(0,0,0,0.06),0_2px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]'>
          <h2 className='font-display text-[20px] font-[500] leading-[1.4] text-ink mb-6'>
            Edit details
          </h2>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className={labelClass}>Full name</label>
              <input
                name='full_name'
                value={form.full_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input
                type='password'
                name='password'
                value={form.password}
                onChange={handleChange}
                placeholder='Leave blank to keep current'
                className={inputClass}
              />
            </div>

            {message && (
              <p className='font-body text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md'>
                {message}
              </p>
            )}
            {error && (
              <p className='font-body text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md'>
                {error}
              </p>
            )}

            <button
              type='submit'
              disabled={loading}
              className='bg-ink text-on-primary font-body text-base font-[420] px-8 py-3 rounded-pill hover:bg-shade-70 disabled:opacity-50 transition-colors'
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
