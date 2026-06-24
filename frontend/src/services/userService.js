import { apiFetch } from './api'

export const userService = {
  getMe: (token) => apiFetch('/users/me', {}, token),

  updateMe: (data, token) =>
    apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) }, token),

  listUsers: (page = 1, size = 20, token) =>
    apiFetch(`/users?page=${page}&size=${size}`, {}, token),

  getUserById: (id, token) => apiFetch(`/users/${id}`, {}, token),
}
