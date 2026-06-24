import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/productService'
import { cartService } from '../../services/cartService'

export function ProductDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    productService.getProduct(id)
      .then(setProduct)
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAddToCart = async () => {
    setAdding(true)
    setFeedback('')
    try {
      await cartService.addItem(product.id, qty, token)
      setFeedback('Added to cart')
    } catch (err) {
      setFeedback(err.message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className='flex-1 bg-canvas-cream flex items-center justify-center py-24'>
        <span className='font-body text-sm text-shade-50'>Loading…</span>
      </div>
    )
  }
  if (!product) return null

  const canAddToCart = user && user.role === 'client' && product.stock > 0

  return (
    <div className='flex-1 bg-canvas-cream px-6 py-16'>
      <div className='max-w-[1440px] mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start'>
          {/* Image */}
          <div className='rounded-xl overflow-hidden bg-canvas-light shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)]'>
            <img
              src={product.image_url}
              alt={product.name}
              className='w-full aspect-square object-cover'
            />
          </div>

          {/* Info */}
          <div className='py-4'>
            <span className='font-body text-xs font-[400] tracking-[0.72px] uppercase text-shade-50 mb-4 block'>
              Product
            </span>
            <h1 className='font-display text-[48px] font-[330] leading-[1.14] text-ink mb-4'>
              {product.name}
            </h1>
            <p className='font-display text-[28px] font-[500] leading-[1.28] text-ink mb-2'>
              ${product.price}
            </p>
            <p className='font-body text-sm font-[500] tracking-[0.28px] text-shade-50 mb-8'>
              {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
            </p>

            <p className='font-body text-base font-[420] leading-[1.5] text-shade-60 mb-10 max-w-[480px]'>
              {product.description}
            </p>

            {product.stock > 0 && (
              <div className='flex items-center gap-4 mb-6'>
                <label className='font-body text-sm font-[500] text-shade-60 tracking-[0.28px]'>
                  Qty
                </label>
                <input
                  type='number'
                  min={1}
                  max={product.stock}
                  value={qty}
                  onChange={(e) => setQty(Math.min(product.stock, Math.max(1, +e.target.value)))}
                  className='w-20 bg-canvas-light border border-hairline-light rounded-md px-3 py-2 font-body text-base font-[420] text-ink text-center focus:outline-none focus:border-shade-50 transition-colors'
                />
              </div>
            )}

            {feedback && (
              <p className='font-body text-sm text-shade-60 mb-4'>{feedback}</p>
            )}

            <button
              disabled={!canAddToCart || adding}
              onClick={handleAddToCart}
              className='w-full bg-ink text-on-primary font-body text-base font-[420] py-3.5 rounded-pill hover:bg-shade-70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
            >
              {adding ? 'Adding...' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </button>

            {!user && (
              <p className='mt-4 font-body text-sm text-shade-50 text-center'>
                Sign in to add items to your cart.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
