import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelOrder, getOrders } from '../api/orders'
import { useAuth } from '../hooks/useAuth'

const STATUS_LABEL = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  cancelado: 'Cancelado',
}

const STATUS_COLOR = {
  pendiente: 'bg-aloe text-ink',
  confirmado: 'bg-pistachio text-ink',
  enviado: 'bg-shade-30 text-ink',
  cancelado: 'bg-shade-30 text-shade-60',
}

export default function OrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadOrders() {
    try {
      const data = await getOrders(token)
      setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    } catch {
      setError('No se pudieron cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [token])

  async function handleCancel(id) {
    try {
      await cancelOrder(token, id)
      await loadOrders()
    } catch (e) {
      alert(e.detail || 'No se pudo cancelar el pedido')
    }
  }

  return (
    <div className="bg-canvas-cream min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-ink text-3xl mb-8" style={{ fontWeight: 330 }}>
          Mis pedidos
        </h1>

        {loading && <p className="text-shade-50 text-sm text-center py-16">Cargando pedidos...</p>}
        {error && <p className="text-red-500 text-sm text-center py-16">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-shade-50 text-sm text-center py-16">Aún no tienes pedidos.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div
            className="bg-canvas-light rounded-lg divide-y divide-hairline-light"
            style={{ boxShadow: '0 8px 8px rgba(0,0,0,0.05), 0 4px 4px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)' }}
          >
            {orders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-sm font-[500]">Pedido #{order.id}</p>
                  <p className="text-shade-50 text-xs mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`rounded-pill px-3 py-1 text-xs font-[500] ${STATUS_COLOR[order.estado] || 'bg-shade-30 text-ink'}`}>
                  {STATUS_LABEL[order.estado] || order.estado}
                </span>
                <span className="text-ink text-sm font-[600] shrink-0 w-20 text-right">
                  {Number(order.total).toFixed(2)} €
                </span>
                <Link
                  to={`/orders/${order.id}`}
                  className="text-shade-50 hover:text-ink text-xs underline underline-offset-2 shrink-0"
                >
                  Ver detalle
                </Link>
                {order.estado === 'pendiente' && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="rounded-pill border border-hairline-light text-shade-60 px-3 py-1 text-xs hover:border-ink hover:text-ink transition-all shrink-0"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
