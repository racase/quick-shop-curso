import { apiFetch } from './api'

export const productService = {
  listProducts: (page = 1, size = 20, search = '') => {
    const params = new URLSearchParams({ page, size })
    if (search) params.set('search', search)
    return apiFetch(`/products?${params}`)
  },

  getProduct: (id) => apiFetch(`/products/${id}`),

  createProduct: (data, token) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }, token),

  updateProduct: (id, data, token) =>
    apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  deleteProduct: (id, token) =>
    apiFetch(`/products/${id}`, { method: 'DELETE' }, token),

  listAllProducts: (page = 1, size = 20, search = '', token) => {
    const params = new URLSearchParams({ page, size })
    if (search) params.set('search', search)
    return apiFetch(`/admin/products?${params}`, {}, token)
  },
}
