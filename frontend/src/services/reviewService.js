import { apiFetch } from './api'

export const reviewService = {
  listProductReviews: (productId, page = 1, size = 10) => {
    const params = new URLSearchParams({ page, size })
    return apiFetch(`/products/${productId}/reviews?${params}`)
  },

  getReview: (reviewId, token) =>
    apiFetch(`/reviews/${reviewId}`, {}, token),

  createReview: (productId, data, token) =>
    apiFetch(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateReview: (reviewId, data, token) =>
    apiFetch(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteReview: (reviewId, token) =>
    apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' }, token),

  getProductRating: (productId) =>
    apiFetch(`/products/${productId}/rating`),
}
