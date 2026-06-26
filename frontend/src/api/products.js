const API_URL = import.meta.env.VITE_API_URL

export async function getProducts(skip = 0, limit = 100) {
  const res = await fetch(`${API_URL}/api/v1/products/?skip=${skip}&limit=${limit}`)
  if (!res.ok) throw new Error('Error al cargar productos')
  return res.json()
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/api/v1/products/${id}`)
  if (!res.ok) throw new Error('Producto no encontrado')
  return res.json()
}

export async function createProduct(token, data) {
  const res = await fetch(`${API_URL}/api/v1/products/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Error al crear producto' }
  }
  return res.json()
}

export async function updateProduct(token, id, data) {
  const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Error al actualizar producto' }
  }
  return res.json()
}

export async function deactivateProduct(token, id) {
  const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, detail: err.detail || 'Error al desactivar producto' }
  }
  return res.json()
}
