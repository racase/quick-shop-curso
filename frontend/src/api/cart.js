const API_URL = import.meta.env.VITE_API_URL

export async function getCart(token) {
  const res = await fetch(`${API_URL}/api/v1/cart/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Error al cargar el carrito')
  return res.json()
}

export async function addItem(token, producto_id, cantidad) {
  const res = await fetch(`${API_URL}/api/v1/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ producto_id, cantidad }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Error al agregar al carrito' }
  }
  return res.json()
}

export async function updateItem(token, producto_id, cantidad) {
  const res = await fetch(`${API_URL}/api/v1/cart/items/${producto_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ cantidad }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Error al actualizar cantidad' }
  }
  return res.json()
}

export async function removeItem(token, producto_id) {
  const res = await fetch(`${API_URL}/api/v1/cart/items/${producto_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Error al eliminar del carrito' }
  }
  return res.json()
}

export async function clearCart(token) {
  const res = await fetch(`${API_URL}/api/v1/cart/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Error al vaciar el carrito' }
  }
  return res.json()
}
