import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deactivateProduct } from '../api/products'
import { useAuth } from '../hooks/useAuth'

const EMPTY_FORM = { nombre: '', descripcion: '', precio: '', stock: 0, imagen_url: '' }

export default function AdminProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadProducts() {
    try {
      const all = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/products/?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await all.json()
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(product) {
    setEditing(product)
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio,
      stock: product.stock,
      imagen_url: product.imagen_url || '',
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock, 10),
        imagen_url: form.imagen_url || null,
      }
      if (editing) {
        await updateProduct(token, editing.id, payload)
      } else {
        await createProduct(token, payload)
      }
      setShowModal(false)
      loadProducts()
    } catch (err) {
      setFormError(err.detail || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(product) {
    if (!confirm(`¿Desactivar "${product.nombre}"?`)) return
    try {
      await deactivateProduct(token, product.id)
      loadProducts()
    } catch (err) {
      alert(err.detail || 'Error al desactivar')
    }
  }

  if (loading) return <p className="text-center text-gray-500 mt-12">Cargando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de productos</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-medium"
        >
          Nuevo producto
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                <td className="px-4 py-3 text-right text-gray-700">{Number(p.precio).toFixed(2)} €</td>
                <td className="px-4 py-3 text-right text-gray-700">{p.stock}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-indigo-600 hover:underline text-xs font-medium"
                  >
                    Editar
                  </button>
                  {p.is_active && (
                    <button
                      onClick={() => handleDeactivate(p)}
                      className="text-red-500 hover:underline text-xs font-medium"
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {formError}
                </p>
              )}
              {[
                { label: 'Nombre', key: 'nombre', type: 'text', required: true },
                { label: 'Descripción', key: 'descripcion', type: 'text' },
                { label: 'Precio (€)', key: 'precio', type: 'number', required: true, step: '0.01', min: '0.01' },
                { label: 'Stock', key: 'stock', type: 'number', required: true, min: '0' },
                { label: 'URL de imagen', key: 'imagen_url', type: 'url' },
              ].map(({ label, key, ...props }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    {...props}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-50 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
