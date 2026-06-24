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
    <div className='flex-1 flex flex-col'>
      {/* ── Admin band header ────────────────────────────────── */}
      <div className='bg-pistachio-10 border-b border-hairline-light px-6 py-8'>
        <div className='max-w-[1440px] mx-auto'>
          <span className='font-body text-xs font-[400] tracking-[0.72px] uppercase text-shade-60 mb-1 block'>
            Admin
          </span>
          <h1 className='font-display text-[28px] font-[500] leading-[1.28] text-ink'>
            Users
          </h1>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className='bg-canvas-cream flex-1 px-6 py-10'>
        <div className='max-w-[1440px] mx-auto'>
          {loading ? (
            <div className='flex justify-center py-16'>
              <span className='font-body text-sm text-shade-50'>Loading…</span>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto rounded-lg border border-hairline-light bg-canvas-light shadow-[0_0_0_1px_rgba(0,0,0,0.04)]'>
                <table className='min-w-full text-sm'>
                  <thead>
                    <tr className='border-b border-hairline-light bg-canvas-cream'>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Name
                      </th>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Email
                      </th>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Role
                      </th>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Active
                      </th>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Registered
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-hairline-light'>
                    {data.items.map((u) => (
                      <tr key={u.id} className='hover:bg-canvas-cream transition-colors'>
                        <td className='px-5 py-4 font-body text-base font-[420] text-ink'>{u.full_name}</td>
                        <td className='px-5 py-4 font-body text-base font-[420] text-shade-60'>{u.email}</td>
                        <td className='px-5 py-4'>
                          <span className={`font-body text-xs font-[400] tracking-[0.72px] uppercase px-3 py-0.5 rounded-pill ${u.role === 'admin' ? 'bg-shade-30 text-ink' : 'bg-aloe-10 text-ink'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className='px-5 py-4'>
                          <span className={`font-body text-xs font-[400] tracking-[0.72px] uppercase px-3 py-0.5 rounded-pill ${u.is_active ? 'bg-aloe-10 text-ink' : 'bg-shade-30 text-shade-60'}`}>
                            {u.is_active ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className='px-5 py-4 font-body text-sm font-[420] text-shade-50'>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className='mt-6 flex items-center gap-3'>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='border border-hairline-light text-ink px-5 py-2 rounded-pill font-body text-sm font-[420] hover:border-shade-40 disabled:opacity-40 transition-colors'
                  >
                    ← Prev
                  </button>
                  <span className='font-body text-sm font-[500] text-shade-50 px-2'>
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className='border border-hairline-light text-ink px-5 py-2 rounded-pill font-body text-sm font-[420] hover:border-shade-40 disabled:opacity-40 transition-colors'
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
