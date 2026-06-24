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
    <div className='flex-1 flex flex-col'>
      {/* ── Cinematic hero ─────────────────────────────────── */}
      <section className='bg-canvas-night text-on-primary px-6 pt-20 pb-24'>
        <div className='max-w-[1440px] mx-auto'>
          <span className='inline-block bg-aloe-10 text-ink font-body text-xs font-[400] tracking-[0.72px] uppercase px-4 py-1 rounded-pill mb-8'>
            Catalog
          </span>
          <h1 className='font-display text-[56px] md:text-[70px] lg:text-[96px] font-[330] leading-none tracking-[1.5px] lg:tracking-[2.4px] mb-6 max-w-[900px]'>
            Discover our<br />products
          </h1>
          <p className='font-body text-lg font-[420] text-on-primary/60 mb-10 max-w-[520px]'>
            A curated selection of quality products, ready to ship.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1) }}
            className='flex gap-3 max-w-[560px]'
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search products…'
              className='flex-1 bg-canvas-night-elevated border border-hairline-dark text-on-primary placeholder-shade-50 px-4 py-3 rounded-md font-body text-base font-[420] focus:outline-none focus:border-shade-50 transition-colors'
            />
            <button
              type='submit'
              className='bg-on-primary text-ink px-6 py-3 rounded-pill font-body text-sm font-[420] hover:bg-shade-30 transition-colors whitespace-nowrap'
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── Product grid — light canvas ─────────────────────── */}
      <section className='bg-canvas-cream flex-1 px-6 py-16'>
        <div className='max-w-[1440px] mx-auto'>
          {loading ? (
            <div className='flex items-center justify-center py-24'>
              <span className='font-body text-sm text-shade-50'>Loading…</span>
            </div>
          ) : data.items.length === 0 ? (
            <div className='text-center py-24'>
              <p className='font-body text-base text-shade-50'>No products found.</p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {data.items.map((product) => (
                  <div
                    key={product.id}
                    className='bg-canvas-light rounded-lg border border-hairline-light overflow-hidden shadow-[0_8px_8px_rgba(0,0,0,0.06),0_4px_4px_rgba(0,0,0,0.06),0_2px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]'
                  >
                    <Link to={`/products/${product.id}`} className='block overflow-hidden'>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className='w-full h-52 object-cover hover:scale-105 transition-transform duration-500'
                      />
                    </Link>
                    <div className='p-6'>
                      <Link
                        to={`/products/${product.id}`}
                        className='font-body text-base font-[550] text-ink hover:text-shade-60 transition-colors block mb-1'
                      >
                        {product.name}
                      </Link>
                      <p className='font-display text-[28px] font-[500] leading-[1.28] text-ink mb-1'>
                        ${product.price}
                      </p>
                      <p className='font-body text-xs font-[500] tracking-[0.28px] text-shade-50 mb-5'>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </p>
                      <button
                        disabled={!canAddToCart || product.stock === 0}
                        className='w-full bg-ink text-on-primary font-body text-sm font-[420] py-2.5 rounded-pill hover:bg-shade-70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className='mt-12 flex items-center justify-center gap-3'>
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
      </section>
    </div>
  )
}
