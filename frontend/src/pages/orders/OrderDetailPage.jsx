import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { orderService } from '../../services/orderService'

const STATUS_COLORS = {
  pending: 'bg-shade-40 text-on-primary',
  confirmed: 'bg-shade-60 text-on-primary',
  shipped: 'bg-shade-60 text-on-primary',
  delivered: 'bg-aloe-10 text-ink',
  cancelled: 'bg-shade-40 text-on-primary',
}

export function OrderDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    orderService.getOrder(id, token)
      .then(setOrder)
      .catch((err) => {
        setError(err.message)
        if (err.message === 'Access denied') navigate('/')
      })
      .finally(() => setLoading(false))
  }, [id, token, navigate])

  if (loading) {
    return (
      <div className='flex-1 bg-canvas-cream flex items-center justify-center py-24'>
        <span className='font-body text-sm text-shade-50'>Loading...</span>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className='flex-1 bg-canvas-cream px-6 py-16'>
      <div className='max-w-[960px] mx-auto'>
        <button
          onClick={() => navigate('/orders')}
          className='font-body text-sm font-[500] text-shade-50 hover:text-ink transition-colors mb-8 flex items-center gap-2'
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
          Back to orders
        </button>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10'>
          <div>
            <h1 className='font-display text-[55px] font-[330] leading-[1.14] text-ink'>
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className='font-body text-sm font-[420] text-shade-50 mt-2'>
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <span className={`font-body text-xs font-[500] px-3 py-1 rounded-pill ${STATUS_COLORS[order.status]}`}>
              {order.status}
            </span>
            <span className='font-display text-[28px] font-[500] text-ink'>
              ${order.total}
            </span>
          </div>
        </div>

        {error && (
          <div className='bg-shade-10 border border-shade-30 text-shade-70 font-body text-sm px-4 py-3 rounded-md mb-6'>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className='flex items-center gap-4 p-6 bg-canvas-light rounded-lg shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)]'
            >
              <div className='flex-1 min-w-0'>
                <p className='font-body text-base font-[500] text-ink'>
                  {item.product_name}
                </p>
                <p className='font-body text-sm font-[420] text-shade-50'>
                  ${item.unit_price} x {item.quantity}
                </p>
              </div>
              <span className='font-display text-sm font-[500] text-ink'>
                ${item.subtotal}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
