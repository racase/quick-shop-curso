import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/productService'

export function ProductListPage() {
  const { user } = useAuth()
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    productService.listProducts(page, 20, query)
      .then(setData)
      .finally(() => setLoading(false))
  }, [page, query])

  const totalPages = Math.ceil(data.total / data.size)
  const canAddToCart = user && user.role === 'client'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>Product Catalog</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1) }}
        className='mb-6 flex gap-2'
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search products...'
          className='flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
        <button
          type='submit'
          className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700'
        >
          Search
        </button>
      </form>
      {loading ? (
        <p className='text-gray-500'>Loading...</p>
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {data.items.map((product) => (
              <div key={product.id} className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className='w-full h-48 object-cover'
                  />
                </Link>
                <div className='p-4'>
                  <Link to={`/products/${product.id}`} className='font-medium text-gray-900 hover:text-indigo-600'>
                    {product.name}
                  </Link>
                  <p className='text-indigo-600 font-bold mt-1'>${product.price}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                  <button
                    disabled={!canAddToCart || product.stock === 0}
                    className='mt-3 w-full bg-indigo-600 text-white py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed'
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className='mt-8 flex justify-center gap-2'>
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
