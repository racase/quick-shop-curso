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

  return (
    <div className='max-w-lg mx-auto'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>My Profile</h1>
      <div className='mb-6 text-sm text-gray-600'>
        <p><span className='font-medium'>Email:</span> {user?.email}</p>
        <p><span className='font-medium'>Role:</span> {user?.role}</p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Full name</label>
          <input
            name='full_name'
            value={form.full_name}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            New password (leave blank to keep current)
          </label>
          <input
            type='password'
            name='password'
            value={form.password}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>
        {message && <p className='text-green-600 text-sm'>{message}</p>}
        {error && <p className='text-red-600 text-sm'>{error}</p>}
        <button
          type='submit'
          disabled={loading}
          className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50'
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
