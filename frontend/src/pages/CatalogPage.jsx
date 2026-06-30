import { useContext, useEffect, useState } from 'react'
import { getProducts } from '../api/products'
import ProductCard from '../components/ProductCard'
import { CartContext } from '../context/CartContext'
import { useAuth } from '../hooks/useAuth'

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const cartCtx = useContext(CartContext)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('No se pudo cargar el catálogo'))
      .finally(() => setLoading(false))
  }, [])

  async function handleAddToCart(product) {
    if (!cartCtx) return
    try {
      await cartCtx.addToCart(product.id, 1)
    } catch (e) {
      alert(e.detail || 'No se pudo agregar al carrito')
    }
  }

  return (
    <>
      {/* Banda cinematica (dark track) */}
      <section className="bg-canvas-night text-on-dark px-6 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <p
            className="font-body text-shade-40 uppercase text-xs tracking-[0.06em] mb-5"
          >
            Colección actual
          </p>
          <h1
            className="font-display text-on-dark leading-none mb-6 text-[clamp(40px,7vw,70px)]"
            style={{ fontWeight: 330 }}
          >
            Todo lo que<br />necesitas.
          </h1>
          <p className="font-body text-shade-40 text-base max-w-md leading-relaxed">
            Productos seleccionados con la mejor calidad, entregados directamente a tu puerta.
          </p>
        </div>
      </section>

      {/* Banda transaccional (light track) — grid de productos */}
      <section className="bg-canvas-light px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <p className="text-shade-50 text-sm text-center py-16">Cargando catálogo...</p>
          )}
          {error && (
            <p className="text-red-500 text-sm text-center py-16">{error}</p>
          )}
          {!loading && !error && products.length === 0 && (
            <p className="text-shade-50 text-sm text-center py-16">No hay productos disponibles.</p>
          )}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={user?.rol === 'cliente' ? handleAddToCart : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
