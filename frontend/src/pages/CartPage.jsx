import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../api/orders'
import { CartContext } from '../context/CartContext'
import { useAuth } from '../hooks/useAuth'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, emptyCart, fetchCart } = useContext(CartContext)
  const { token } = useAuth()
  const navigate = useNavigate()
  const [checkoutError, setCheckoutError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setCheckoutError('')
    setLoading(true)
    try {
      await createOrder(token)
      await fetchCart()
      navigate('/orders')
    } catch (e) {
      setCheckoutError(e.detail || 'No se pudo crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateQuantity(producto_id, newQty) {
    try {
      await updateQuantity(producto_id, newQty)
    } catch (e) {
      alert(e.detail || 'No se pudo actualizar la cantidad')
    }
  }

  async function handleRemove(producto_id) {
    try {
      await removeFromCart(producto_id)
    } catch (e) {
      alert(e.detail || 'No se pudo eliminar el item')
    }
  }

  async function handleClear() {
    try {
      await emptyCart()
    } catch (e) {
      alert(e.detail || 'No se pudo vaciar el carrito')
    }
  }

  const isEmpty = cart.items.length === 0

  return (
    <div className="bg-canvas-cream min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-ink text-3xl mb-8" style={{ fontWeight: 330 }}>
          Tu carrito
        </h1>

        {isEmpty ? (
          <div className="text-center py-24">
            <p className="text-shade-50 text-base mb-6">El carrito está vacío.</p>
            <a
              href="/"
              className="rounded-pill bg-ink text-on-dark px-6 py-2.5 text-sm inline-block hover:bg-shade-70 transition-colors"
            >
              Ver catálogo
            </a>
          </div>
        ) : (
          <>
            <div
              className="bg-canvas-light rounded-lg divide-y divide-hairline-light mb-6"
              style={{ boxShadow: '0 8px 8px rgba(0,0,0,0.05), 0 4px 4px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)' }}
            >
              {cart.items.map((item) => (
                <div key={item.producto_id} className="flex items-center gap-4 p-4">
                  <img
                    src={item.imagen_url || 'https://placehold.co/64x48?text=—'}
                    alt={item.nombre}
                    className="w-16 h-12 object-cover rounded-md bg-shade-30/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-ink text-sm font-[500] truncate">{item.nombre}</p>
                    <p className="text-shade-50 text-xs mt-0.5">{Number(item.precio).toFixed(2)} € / ud.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => item.cantidad > 1 && handleUpdateQuantity(item.producto_id, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                      className="w-7 h-7 rounded-pill border border-hairline-light text-ink text-sm flex items-center justify-center hover:bg-shade-30/30 disabled:opacity-30 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-[500] text-ink">{item.cantidad}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.producto_id, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stock}
                      className="w-7 h-7 rounded-pill border border-hairline-light text-ink text-sm flex items-center justify-center hover:bg-shade-30/30 disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-ink text-sm font-[550] w-16 text-right shrink-0">
                    {Number(item.subtotal).toFixed(2)} €
                  </span>
                  <button
                    onClick={() => handleRemove(item.producto_id)}
                    className="text-shade-50 hover:text-ink transition-colors shrink-0 ml-1"
                    aria-label="Eliminar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-shade-50 text-sm">Total</span>
              <span className="font-body text-ink text-xl font-[600]">{Number(cart.total).toFixed(2)} €</span>
            </div>

            {checkoutError && (
              <p className="text-red-500 text-sm mb-4">{checkoutError}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClear}
                className="rounded-pill border border-hairline-light text-shade-60 px-5 py-2.5 text-sm hover:border-ink hover:text-ink transition-all"
              >
                Vaciar carrito
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="rounded-pill bg-ink text-on-dark px-6 py-2.5 text-sm hover:bg-shade-70 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Procesando...' : 'Finalizar compra'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
