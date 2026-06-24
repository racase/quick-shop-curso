import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/productService'

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', image_url: '' }

const inputClass =
  'w-full bg-canvas-light border border-hairline-light rounded-md px-3 py-[10px] font-body text-base font-[420] text-ink placeholder-shade-40 focus:outline-none focus:border-shade-50 transition-colors'
const labelClass =
  'block font-body text-sm font-[500] text-shade-60 mb-1.5 tracking-[0.28px]'

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
    <div className='flex-1 flex flex-col'>
      {/* ── Admin band header ────────────────────────────────── */}
      <div className='bg-pistachio-10 border-b border-hairline-light px-6 py-8'>
        <div className='max-w-[1440px] mx-auto flex items-center justify-between gap-4'>
          <div>
            <span className='font-body text-xs font-[400] tracking-[0.72px] uppercase text-shade-60 mb-1 block'>
              Admin
            </span>
            <h1 className='font-display text-[28px] font-[500] leading-[1.28] text-ink'>
              Product Management
            </h1>
          </div>
          <button
            onClick={openCreate}
            className='bg-ink text-on-primary font-body text-sm font-[420] px-6 py-3 rounded-pill hover:bg-shade-70 transition-colors whitespace-nowrap'
          >
            + New product
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className='bg-canvas-cream flex-1 px-6 py-10'>
        <div className='max-w-[1440px] mx-auto'>

          {/* Form panel */}
          {showForm && (
            <div className='mb-8 bg-canvas-light rounded-lg border border-hairline-light p-8 shadow-[0_8px_8px_rgba(0,0,0,0.06),0_4px_4px_rgba(0,0,0,0.06),0_2px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]'>
              <h2 className='font-display text-[20px] font-[500] leading-[1.4] text-ink mb-6'>
                {editing ? 'Edit product' : 'New product'}
              </h2>
              <form onSubmit={handleFormSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price</label>
                  <input
                    required
                    type='number'
                    step='0.01'
                    min='0.01'
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock</label>
                  <input
                    required
                    type='number'
                    min='0'
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Image URL</label>
                  <input
                    required
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className={labelClass}>Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={inputClass + ' resize-none'}
                  />
                </div>

                {formError && (
                  <p className='md:col-span-2 font-body text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md'>
                    {formError}
                  </p>
                )}

                <div className='md:col-span-2 flex gap-3'>
                  <button
                    type='submit'
                    disabled={formLoading}
                    className='bg-ink text-on-primary font-body text-sm font-[420] px-6 py-3 rounded-pill hover:bg-shade-70 disabled:opacity-50 transition-colors'
                  >
                    {formLoading ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowForm(false)}
                    className='border border-hairline-light text-ink font-body text-sm font-[420] px-6 py-3 rounded-pill hover:border-shade-40 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className='flex justify-center py-16'>
              <span className='font-body text-sm text-shade-50'>Loading…</span>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto rounded-lg border border-hairline-light bg-canvas-light shadow-[0_0_0_1px_rgba(0,0,0,0.04)]'>
                <table className='min-w-full text-sm'>
                  <thead>
                    <tr className='border-b border-hairline-light bg-canvas-cream'>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Name
                      </th>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Price
                      </th>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Stock
                      </th>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Active
                      </th>
                      <th className='px-5 py-3 text-left font-body text-xs font-[500] tracking-[0.72px] uppercase text-shade-50'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-hairline-light'>
                    {data.items.map((p) => (
                      <tr key={p.id} className={`hover:bg-canvas-cream transition-colors ${!p.is_active ? 'opacity-40' : ''}`}>
                        <td className='px-5 py-4 font-body text-base font-[420] text-ink'>{p.name}</td>
                        <td className='px-5 py-4 font-body text-base font-[420] text-ink'>${p.price}</td>
                        <td className='px-5 py-4 font-body text-base font-[420] text-ink'>{p.stock}</td>
                        <td className='px-5 py-4'>
                          <span className={`font-body text-xs font-[400] tracking-[0.72px] uppercase px-3 py-0.5 rounded-pill ${p.is_active ? 'bg-aloe-10 text-ink' : 'bg-shade-30 text-shade-60'}`}>
                            {p.is_active ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className='px-5 py-4 flex gap-3'>
                          <button
                            onClick={() => openEdit(p)}
                            className='font-body text-sm font-[420] text-ink underline underline-offset-2 hover:text-shade-70 transition-colors'
                          >
                            Edit
                          </button>
                          {p.is_active && (
                            <button
                              onClick={() => handleDeactivate(p.id)}
                              className='font-body text-sm font-[420] text-red-600 underline underline-offset-2 hover:text-red-800 transition-colors'
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
                <div className='mt-6 flex items-center gap-3'>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='border border-hairline-light text-ink px-5 py-2 rounded-pill font-body text-sm font-[420] hover:border-shade-40 disabled:opacity-40 transition-colors'
                  >
                    ← Prev
                  </button>
                  <span className='font-body text-sm font-[500] text-shade-50 px-2'>
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className='border border-hairline-light text-ink px-5 py-2 rounded-pill font-body text-sm font-[420] hover:border-shade-40 disabled:opacity-40 transition-colors'
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
