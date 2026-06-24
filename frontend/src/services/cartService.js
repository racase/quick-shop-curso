import { apiFetch } from './api'

export const cartService = {
  getCart: (token) => apiFetch('/cart', {}, token),

  addItem: (productId, quantity, token) =>
    apiFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }, token),

  updateItem: (itemId, quantity, token) =>
    apiFetch(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }, token),

  removeItem: (itemId, token) =>
    apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' }, token),

  clearCart: (token) =>
    apiFetch('/cart', { method: 'DELETE' }, token),
}
