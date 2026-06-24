import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { UserProfilePage } from '../pages/catalog/UserProfilePage'
import { ProductDetailPage } from '../pages/catalog/ProductDetailPage'
import { ProductListPage } from '../pages/catalog/ProductListPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProductManagementPage } from '../pages/admin/ProductManagementPage'
import { UserListPage } from '../pages/admin/UserListPage'
import { AdminRoute } from './AdminRoute'
import { ProtectedRoute } from './ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <AdminRoute>
            <ProductManagementPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <UserListPage />
          </AdminRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
