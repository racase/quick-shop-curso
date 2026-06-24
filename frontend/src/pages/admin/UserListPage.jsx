import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'

export function UserListPage() {
  const { token } = useAuth()
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    userService.listUsers(page, 20, token)
      .then(setData)
      .finally(() => setLoading(false))
  }, [page, token])

  const totalPages = Math.ceil(data.total / data.size)

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>Users</h1>
      {loading ? (
        <p className='text-gray-500'>Loading...</p>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-200 rounded'>
              <thead className='bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <tr>
                  <th className='px-4 py-3'>Name</th>
                  <th className='px-4 py-3'>Email</th>
                  <th className='px-4 py-3'>Role</th>
                  <th className='px-4 py-3'>Active</th>
                  <th className='px-4 py-3'>Registered</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 text-sm'>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <td className='px-4 py-3'>{u.full_name}</td>
                    <td className='px-4 py-3'>{u.email}</td>
                    <td className='px-4 py-3 capitalize'>{u.role}</td>
                    <td className='px-4 py-3'>{u.is_active ? 'Yes' : 'No'}</td>
                    <td className='px-4 py-3'>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className='mt-4 flex gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='px-3 py-1 border rounded disabled:opacity-40'
              >
                Prev
              </button>
              <span className='px-3 py-1 text-sm text-gray-600'>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='px-3 py-1 border rounded disabled:opacity-40'
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
