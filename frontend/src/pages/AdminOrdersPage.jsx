import { useEffect, useState } from 'react'
import { getOrders, updateOrderStatus } from '../api/orders'
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

const VALID_TRANSITIONS = {
  pendiente: ['confirmado', 'enviado', 'cancelado'],
  confirmado: ['enviado', 'cancelado'],
  enviado: ['cancelado'],
  cancelado: [],
}

export default function AdminOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

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

  async function handleStatusChange(orderId, newStatus) {
    setUpdating(orderId)
    try {
      const updated = await updateOrderStatus(token, orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, estado: updated.estado } : o)))
    } catch (e) {
      alert(e.detail || 'No se pudo actualizar el estado')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="bg-canvas-cream min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-ink text-3xl mb-8" style={{ fontWeight: 330 }}>
          Gestión de pedidos
        </h1>

        {loading && <p className="text-shade-50 text-sm text-center py-16">Cargando pedidos...</p>}
        {error && <p className="text-red-500 text-sm text-center py-16">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-shade-50 text-sm text-center py-16">No hay pedidos en el sistema.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div
            className="bg-canvas-light rounded-lg overflow-hidden"
            style={{ boxShadow: '0 8px 8px rgba(0,0,0,0.05), 0 4px 4px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline-light">
                    <th className="text-left text-xs text-shade-50 font-[500] px-4 py-3">Pedido</th>
                    <th className="text-left text-xs text-shade-50 font-[500] px-4 py-3">Cliente</th>
                    <th className="text-left text-xs text-shade-50 font-[500] px-4 py-3">Fecha</th>
                    <th className="text-left text-xs text-shade-50 font-[500] px-4 py-3">Total</th>
                    <th className="text-left text-xs text-shade-50 font-[500] px-4 py-3">Estado</th>
                    <th className="text-left text-xs text-shade-50 font-[500] px-4 py-3">Cambiar estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-light">
                  {orders.map((order) => {
                    const transitions = VALID_TRANSITIONS[order.estado] || []
                    return (
                      <tr key={order.id} className="hover:bg-shade-30/10 transition-colors">
                        <td className="px-4 py-3 text-ink font-[500]">#{order.id}</td>
                        <td className="px-4 py-3 text-shade-60 max-w-[180px] truncate">
                          {order.email || `Usuario #${order.usuario_id}`}
                        </td>
                        <td className="px-4 py-3 text-shade-60 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-ink font-[600] whitespace-nowrap">
                          {Number(order.total).toFixed(2)} €
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-pill px-2.5 py-1 text-xs font-[500] ${STATUS_COLOR[order.estado] || 'bg-shade-30 text-ink'}`}>
                            {STATUS_LABEL[order.estado] || order.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {transitions.length > 0 ? (
                            <select
                              disabled={updating === order.id}
                              onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value)}
                              defaultValue=""
                              className="border border-hairline-light rounded-md px-2 py-1 text-xs text-ink bg-canvas-light focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
                            >
                              <option value="" disabled>Cambiar...</option>
                              {transitions.map((s) => (
                                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-shade-40 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
