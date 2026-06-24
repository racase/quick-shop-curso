import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/productService'

export function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getProduct(id)
      .then(setProduct)
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <p className='text-gray-500'>Loading...</p>
  if (!product) return null

  const canAddToCart = user && user.role === 'client' && product.stock > 0

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <img
          src={product.image_url}
          alt={product.name}
          className='w-full rounded-lg object-cover'
        />
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>{product.name}</h1>
          <p className='text-2xl text-indigo-600 font-bold mt-2'>${product.price}</p>
          <p className='text-sm text-gray-500 mt-1'>
            {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
          </p>
          <p className='text-gray-700 mt-4 leading-relaxed'>{product.description}</p>
          {product.stock > 0 && (
            <div className='mt-6 flex items-center gap-3'>
              <label className='text-sm font-medium text-gray-700'>Quantity</label>
              <input
                type='number'
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.min(product.stock, Math.max(1, +e.target.value)))}
                className='w-20 border border-gray-300 rounded px-2 py-1 text-center'
              />
            </div>
          )}
          <button
            disabled={!canAddToCart}
            className='mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
          {!user && (
            <p className='mt-2 text-sm text-gray-500'>Sign in to add items to your cart.</p>
          )}
        </div>
      </div>
    </div>
  )
}
