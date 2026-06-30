import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderDetail } from '../api/orders'
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

export default function OrderDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrderDetail(token, id)
      .then(setOrder)
      .catch(() => setError('No se pudo cargar el pedido'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="bg-canvas-cream min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/orders" className="text-shade-50 hover:text-ink text-sm underline underline-offset-2 inline-block mb-6">
          ← Volver a mis pedidos
        </Link>

        {loading && <p className="text-shade-50 text-sm text-center py-16">Cargando pedido...</p>}
        {error && <p className="text-red-500 text-sm text-center py-16">{error}</p>}

        {!loading && !error && order && (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="font-display text-ink text-3xl" style={{ fontWeight: 330 }}>
                  Pedido #{order.id}
                </h1>
                <p className="text-shade-50 text-sm mt-1">
                  {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className={`rounded-pill px-3 py-1.5 text-xs font-[500] mt-1 ${STATUS_COLOR[order.estado] || 'bg-shade-30 text-ink'}`}>
                {STATUS_LABEL[order.estado] || order.estado}
              </span>
            </div>

            <div
              className="bg-canvas-light rounded-lg divide-y divide-hairline-light mb-6"
              style={{ boxShadow: '0 8px 8px rgba(0,0,0,0.05), 0 4px 4px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)' }}
            >
              {order.items.map((item) => (
                <div key={item.producto_id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-sm font-[500] truncate">{item.nombre}</p>
                    <p className="text-shade-50 text-xs mt-0.5">{Number(item.precio_unitario).toFixed(2)} € × {item.cantidad}</p>
                  </div>
                  <span className="text-ink text-sm font-[600] shrink-0">
                    {Number(item.subtotal).toFixed(2)} €
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-shade-30/10">
                <span className="text-shade-60 text-sm font-[500]">Total</span>
                <span className="text-ink text-base font-[700]">{Number(order.total).toFixed(2)} €</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
