const API_URL = import.meta.env.VITE_API_URL

export async function createOrder(token) {
  const res = await fetch(`${API_URL}/api/v1/orders/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Error al crear el pedido' }
  }
  return res.json()
}

export async function getOrders(token) {
  const res = await fetch(`${API_URL}/api/v1/orders/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Error al cargar los pedidos')
  return res.json()
}

export async function getOrderDetail(token, id) {
  const res = await fetch(`${API_URL}/api/v1/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Pedido no encontrado')
  return res.json()
}

export async function cancelOrder(token, id) {
  const res = await fetch(`${API_URL}/api/v1/orders/${id}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'No se pudo cancelar el pedido' }
  }
  return res.json()
}

export async function updateOrderStatus(token, id, estado) {
  const res = await fetch(`${API_URL}/api/v1/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ estado }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'No se pudo actualizar el estado' }
  }
  return res.json()
}
