import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { orderService } from '../../services/orderService'

const STATUS_COLORS = {
  pending: 'bg-shade-40 text-on-primary',
  confirmed: 'bg-shade-60 text-on-primary',
  shipped: 'bg-shade-60 text-on-primary',
  delivered: 'bg-aloe-10 text-ink',
  cancelled: 'bg-shade-40 text-on-primary',
}

export function OrderHistoryPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')

  const loadOrders = (page = 1) => {
    setLoading(true)
    orderService.listOrders(page, 20, statusFilter, token)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [token, statusFilter])

  const handleCancel = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId, token)
      loadOrders()
    } catch (err) {
      setError(err.message)
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
      <div className='max-w-[960px] mx-auto'>
        <h1 className='font-display text-[55px] font-[330] leading-[1.14] text-ink mb-12'>
          Your orders
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

        {orders.items.length === 0 ? (
          <div className='text-center py-16'>
            <p className='font-body text-base font-[420] text-shade-50'>
              No orders found.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.items.map((order) => (
              <div
                key={order.id}
                className='flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-canvas-light rounded-lg shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)]'
              >
                <div className='flex-1 min-w-0'>
                  <Link
                    to={`/orders/${order.id}`}
                    className='font-body text-base font-[500] text-ink hover:text-shade-60 transition-colors'
                  >
                    Order #{order.id.slice(0, 8)}
                  </Link>
                  <p className='font-body text-sm font-[420] text-shade-50'>
                    {new Date(order.created_at).toLocaleDateString()} - {order.items.length} items
                  </p>
                </div>
                <span className={`font-body text-xs font-[500] px-3 py-1 rounded-pill ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
                <span className='font-display text-sm font-[500] text-ink'>
                  ${order.total}
                </span>
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className='text-shade-50 hover:text-shade-70 font-body text-sm font-[500] transition-colors'
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

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
