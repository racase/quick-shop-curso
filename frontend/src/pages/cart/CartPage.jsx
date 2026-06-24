import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { cartService } from '../../services/cartService'
import { orderService } from '../../services/orderService'

export function CartPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCart = () => {
    setLoading(true)
    cartService.getCart(token)
      .then(setCart)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadCart() }, [token])

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      const updated = await cartService.updateItem(itemId, quantity, token)
      setCart(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemove = async (itemId) => {
    try {
      const updated = await cartService.removeItem(itemId, token)
      setCart(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleClear = async () => {
    try {
      const updated = await cartService.clearCart(token)
      setCart(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleConfirmOrder = async () => {
    try {
      const order = await orderService.createOrder(token)
      navigate(`/orders/${order.id}`)
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className='flex-1 bg-canvas-cream px-6 py-24'>
        <div className='max-w-[640px] mx-auto text-center'>
          <h1 className='font-display text-[55px] font-[330] leading-[1.14] text-ink mb-6'>
            Your cart
          </h1>
          <p className='font-body text-base font-[420] text-shade-50 mb-8'>
            Your cart is empty. Browse the catalog and add items to get started.
          </p>
          <button
            onClick={() => navigate('/')}
            className='bg-ink text-on-primary font-body text-base font-[420] px-6 py-3.5 rounded-pill hover:bg-shade-70 transition-colors'
          >
            Browse catalog
          </button>
        </div>
      </div>
    )
  }

  const STATUS_STYLES = {
    pending: 'bg-shade-40 text-on-primary',
    confirmed: 'bg-shade-60 text-on-primary',
    shipped: 'bg-shade-60 text-on-primary',
    delivered: 'bg-pistachio-10 text-ink',
    cancelled: 'bg-shade-40 text-on-primary',
  }

  return (
    <div className='flex-1 bg-canvas-cream px-6 py-16'>
      <div className='max-w-[960px] mx-auto'>
        <h1 className='font-display text-[55px] font-[330] leading-[1.14] text-ink mb-12'>
          Your cart
        </h1>

        {error && (
          <div className='bg-shade-10 border border-shade-30 text-shade-70 font-body text-sm px-4 py-3 rounded-md mb-6'>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          {cart.items.map((item) => (
            <div
              key={item.id}
              className='flex items-center gap-4 p-6 bg-canvas-light rounded-lg shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)]'
            >
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className='w-20 h-20 rounded-md object-cover'
              />
              <div className='flex-1 min-w-0'>
                <p className='font-body text-base font-[500] text-ink'>
                  {item.product.name}
                </p>
                <p className='font-body text-sm font-[420] text-shade-50'>
                  ${item.product.price} each
                </p>
              </div>
              <input
                type='number'
                min={1}
                max={item.product.stock}
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.id, Math.min(item.product.stock, Math.max(1, +e.target.value)))}
                className='w-16 bg-canvas-cream border border-hairline-light rounded-md px-2 py-1.5 font-body text-sm text-ink text-center focus:outline-none focus:border-shade-50'
              />
              <p className='font-display text-sm font-[500] text-ink w-20 text-right'>
                ${item.subtotal}
              </p>
              <button
                onClick={() => handleRemove(item.id)}
                className='text-shade-50 hover:text-shade-70 transition-colors'
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className='mt-8 p-6 bg-canvas-light rounded-lg shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)]'>
          <div className='flex justify-between items-center mb-6'>
            <span className='font-body text-base font-[500] text-ink'>
              Total ({cart.item_count} items)
            </span>
            <span className='font-display text-[28px] font-[500] text-ink'>
              ${cart.total}
            </span>
          </div>
          <div className='flex gap-4'>
            <button
              onClick={handleClear}
              className='flex-1 border border-hairline-light text-ink font-body text-base font-[420] px-6 py-3.5 rounded-pill hover:bg-shade-10 transition-colors'
            >
              Clear cart
            </button>
            <button
              onClick={handleConfirmOrder}
              className='flex-1 bg-aloe-10 text-ink font-body text-base font-[420] px-6 py-3.5 rounded-pill hover:bg-pistachio-10 transition-colors'
            >
              Confirm order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
