import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/productService'

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', image_url: '' }

export function ProductManagementPage() {
  const { token } = useAuth()
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const load = () => {
    setLoading(true)
    productService.listAllProducts(page, 20, '', token)
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, token])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditing(product.id)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: String(product.stock),
      image_url: product.image_url,
    })
    setFormError('')
    setShowForm(true)
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this product?')) return
    await productService.deleteProduct(id, token)
    load()
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const payload = { ...form, price: form.price, stock: Number(form.stock) }
      if (editing) {
        await productService.updateProduct(editing, payload, token)
      } else {
        await productService.createProduct(payload, token)
      }
      setShowForm(false)
      load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const totalPages = Math.ceil(data.total / data.size)

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Product Management</h1>
        <button
          onClick={openCreate}
          className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700'
        >
          New product
        </button>
      </div>

      {showForm && (
        <div className='mb-8 bg-white border border-gray-200 rounded p-6'>
          <h2 className='text-lg font-semibold mb-4'>{editing ? 'Edit product' : 'New product'}</h2>
          <form onSubmit={handleFormSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className='w-full border border-gray-300 rounded px-3 py-2'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
              <input
                required
                type='number'
                step='0.01'
                min='0.01'
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className='w-full border border-gray-300 rounded px-3 py-2'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Stock</label>
              <input
                required
                type='number'
                min='0'
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className='w-full border border-gray-300 rounded px-3 py-2'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Image URL</label>
              <input
                required
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className='w-full border border-gray-300 rounded px-3 py-2'
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className='w-full border border-gray-300 rounded px-3 py-2'
              />
            </div>
            {formError && <p className='md:col-span-2 text-red-600 text-sm'>{formError}</p>}
            <div className='md:col-span-2 flex gap-3'>
              <button
                type='submit'
                disabled={formLoading}
                className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50'
              >
                {formLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type='button'
                onClick={() => setShowForm(false)}
                className='border border-gray-300 px-4 py-2 rounded hover:bg-gray-50'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className='text-gray-500'>Loading...</p>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-200 rounded'>
              <thead className='bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <tr>
                  <th className='px-4 py-3'>Name</th>
                  <th className='px-4 py-3'>Price</th>
                  <th className='px-4 py-3'>Stock</th>
                  <th className='px-4 py-3'>Active</th>
                  <th className='px-4 py-3'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 text-sm'>
                {data.items.map((p) => (
                  <tr key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                    <td className='px-4 py-3'>{p.name}</td>
                    <td className='px-4 py-3'>${p.price}</td>
                    <td className='px-4 py-3'>{p.stock}</td>
                    <td className='px-4 py-3'>{p.is_active ? 'Yes' : 'No'}</td>
                    <td className='px-4 py-3 flex gap-2'>
                      <button
                        onClick={() => openEdit(p)}
                        className='text-indigo-600 hover:underline'
                      >
                        Edit
                      </button>
                      {p.is_active && (
                        <button
                          onClick={() => handleDeactivate(p.id)}
                          className='text-red-600 hover:underline'
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className='mt-4 flex gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='px-3 py-1 border rounded disabled:opacity-40'
              >
                Prev
              </button>
              <span className='px-3 py-1 text-sm text-gray-600'>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='px-3 py-1 border rounded disabled:opacity-40'
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
