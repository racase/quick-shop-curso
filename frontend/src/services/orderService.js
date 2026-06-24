import { apiFetch } from './api'

export const orderService = {
  createOrder: (token) =>
    apiFetch('/orders', { method: 'POST' }, token),

  listOrders: (page = 1, size = 20, status = '', token) => {
    const params = new URLSearchParams({ page, size })
    if (status) params.set('status', status)
    return apiFetch(`/orders?${params}`, {}, token)
  },

  getOrder: (id, token) =>
    apiFetch(`/orders/${id}`, {}, token),

  updateOrderStatus: (id, status, token) =>
    apiFetch(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token),

  cancelOrder: (id, token) =>
    apiFetch(`/orders/${id}`, { method: 'DELETE' }, token),
}
