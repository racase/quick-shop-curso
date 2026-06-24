import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { orderService } from '../../services/orderService'

const STATUS_COLORS = {
  pending: 'bg-shade-40 text-on-primary',
  confirmed: 'bg-shade-60 text-on-primary',
  shipped: 'bg-shade-60 text-on-primary',
  delivered: 'bg-aloe-10 text-ink',
  cancelled: 'bg-shade-40 text-on-primary',
}

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export function OrderManagementPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState(null)

  const loadOrders = (page = 1) => {
    setLoading(true)
    orderService.listOrders(page, 20, statusFilter, token)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [token, statusFilter])

  const handleStatusChange = async (orderId, newStatus) => {
    setProcessingId(orderId)
    setError('')
    try {
      await orderService.updateOrderStatus(orderId, newStatus, token)
      loadOrders()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className='flex-1 bg-canvas-cream flex items-center justify-center py-24'>
        <span className='font-body text-sm text-shade-50'>Loading...</span>
      </div>
    )
  }

  return (
    <div className='flex-1 bg-canvas-cream px-6 py-16'>
      <div className='max-w-[1200px] mx-auto'>
        <h1 className='font-display text-[55px] font-[330] leading-[1.14] text-ink mb-12'>
          Order management
        </h1>

        {error && (
          <div className='bg-shade-10 border border-shade-30 text-shade-70 font-body text-sm px-4 py-3 rounded-md mb-6'>
            {error}
          </div>
        )}

        <div className='mb-6'>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='bg-canvas-light border border-hairline-light rounded-md px-4 py-2 font-body text-sm text-ink focus:outline-none focus:border-shade-50'
          >
            <option value=''>All statuses</option>
            <option value='pending'>Pending</option>
            <option value='confirmed'>Confirmed</option>
            <option value='shipped'>Shipped</option>
            <option value='delivered'>Delivered</option>
            <option value='cancelled'>Cancelled</option>
          </select>
        </div>

        <div className='bg-canvas-light rounded-lg shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)] overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-hairline-light'>
                <th className='text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50 px-6 py-4'>
                  Order
                </th>
                <th className='text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50 px-6 py-4'>
                  Client
                </th>
                <th className='text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50 px-6 py-4'>
                  Date
                </th>
                <th className='text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50 px-6 py-4'>
                  Total
                </th>
                <th className='text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50 px-6 py-4'>
                  Status
                </th>
                <th className='text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50 px-6 py-4'>
                  Transition
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((order) => {
                const transitions = VALID_TRANSITIONS[order.status] || []
                return (
                  <tr key={order.id} className='border-b border-hairline-light last:border-0 hover:bg-shade-10/50 transition-colors'>
                    <td className='px-6 py-4 font-body text-sm font-[500] text-ink'>
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className='px-6 py-4 font-body text-sm text-shade-60'>
                      {/* The order object from list doesn't include client email in the current response schema */}
                      {order.client_email || '-'}
                    </td>
                    <td className='px-6 py-4 font-body text-sm text-shade-60'>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 font-display text-sm font-[500] text-ink'>
                      ${order.total}
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`font-body text-xs font-[500] px-3 py-1 rounded-pill ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      {transitions.length > 0 ? (
                        <select
                          value=''
                          onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value)}
                          disabled={processingId === order.id}
                          className='bg-canvas-cream border border-hairline-light rounded-md px-3 py-1.5 font-body text-sm text-ink focus:outline-none focus:border-shade-50 disabled:opacity-50'
                        >
                          <option value=''>
                            {processingId === order.id ? 'Updating...' : 'Change status'}
                          </option>
                          {transitions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <span className='font-body text-xs text-shade-50'>-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {orders.total > orders.size && (
          <div className='flex justify-center gap-4 mt-8'>
            {Array.from({ length: Math.ceil(orders.total / orders.size) }, (_, i) => (
              <button
                key={i}
                onClick={() => loadOrders(i + 1)}
                className={`font-body text-sm font-[500] px-4 py-2 rounded-pill transition-colors ${
                  orders.page === i + 1
                    ? 'bg-ink text-on-primary'
                    : 'bg-canvas-light text-ink border border-hairline-light hover:bg-shade-10'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
