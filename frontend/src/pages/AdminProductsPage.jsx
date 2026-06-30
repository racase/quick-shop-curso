import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deactivateProduct, generateProductWithAI } from '../api/products'
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
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

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
    setShowAIPanel(false)
    setAiPrompt('')
    setShowModal(true)
  }

  async function handleGenerate() {
    if (!aiPrompt.trim()) return
    setFormError('')
    setGenerating(true)
    try {
      const data = await generateProductWithAI(token, aiPrompt)
      setForm((f) => ({
        ...f,
        nombre: data.nombre ?? f.nombre,
        descripcion: data.descripcion ?? f.descripcion,
        precio: data.precio != null ? String(data.precio) : f.precio,
        stock: data.stock != null ? data.stock : f.stock,
      }))
    } catch (err) {
      setFormError(err.detail || 'Error al generar con IA')
    } finally {
      setGenerating(false)
    }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-shade-50 text-sm text-center">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-body text-shade-50 uppercase text-xs tracking-[0.06em] mb-1">
            Administración
          </p>
          <h1
            className="font-display text-ink text-3xl leading-tight"
            style={{ fontWeight: 500 }}
          >
            Gestión de productos
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="rounded-pill bg-ink text-on-dark px-6 py-2.5 text-sm hover:bg-shade-70 transition-colors"
        >
          Nuevo producto
        </button>
      </div>

      <div
        className="bg-canvas-light rounded-lg border border-hairline-light overflow-x-auto"
        style={{ boxShadow: '0 8px 8px rgba(0,0,0,0.04), 0 4px 4px rgba(0,0,0,0.04), 0 2px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)' }}
      >
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-hairline-light">
              <th className="px-5 py-3.5 text-left text-xs font-[500] text-shade-50 uppercase tracking-[0.04em]">Nombre</th>
              <th className="px-5 py-3.5 text-right text-xs font-[500] text-shade-50 uppercase tracking-[0.04em]">Precio</th>
              <th className="px-5 py-3.5 text-right text-xs font-[500] text-shade-50 uppercase tracking-[0.04em]">Stock</th>
              <th className="px-5 py-3.5 text-center text-xs font-[500] text-shade-50 uppercase tracking-[0.04em]">Estado</th>
              <th className="px-5 py-3.5 text-center text-xs font-[500] text-shade-50 uppercase tracking-[0.04em]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-light">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-canvas-cream transition-colors">
                <td className="px-5 py-3.5 font-[420] text-ink">{p.nombre}</td>
                <td className="px-5 py-3.5 text-right text-shade-60">{Number(p.precio).toFixed(2)} €</td>
                <td className="px-5 py-3.5 text-right text-shade-60">{p.stock}</td>
                <td className="px-5 py-3.5 text-center">
                  <span
                    className={`inline-block rounded-pill px-3 py-0.5 text-xs font-[500] ${
                      p.is_active
                        ? 'bg-aloe text-ink'
                        : 'bg-shade-30 text-shade-60'
                    }`}
                    style={{ letterSpacing: '0.04em' }}
                  >
                    {p.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-ink text-xs underline underline-offset-2 hover:text-shade-60 transition-colors"
                    >
                      Editar
                    </button>
                    {p.is_active && (
                      <button
                        onClick={() => handleDeactivate(p)}
                        className="text-shade-50 text-xs underline underline-offset-2 hover:text-ink transition-colors"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-canvas-night/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-canvas-light rounded-lg w-full max-w-md p-8"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
          >
            <h2
              className="font-display text-ink text-2xl mb-6"
              style={{ fontWeight: 500 }}
            >
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            {!editing && (
              <div className="mb-5">
                {!showAIPanel ? (
                  <button
                    type="button"
                    onClick={() => setShowAIPanel(true)}
                    className="w-full rounded-pill border border-ink text-ink px-4 py-2 text-sm hover:bg-ink hover:text-on-dark transition-colors"
                  >
                    Crear con IA
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe el producto (ej. zapatilla deportiva de running unisex, gama media)"
                      rows={2}
                      className="w-full border border-hairline-light rounded-md px-3 py-2.5 text-sm text-ink bg-canvas-light focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink transition-colors resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={generating || !aiPrompt.trim()}
                        className="rounded-pill border border-ink text-ink px-4 py-2 text-sm hover:bg-ink hover:text-on-dark disabled:opacity-50 transition-colors"
                      >
                        {generating ? 'Generando...' : 'Generar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAIPanel(false)}
                        className="rounded-pill border border-hairline-light text-shade-50 px-4 py-2 text-sm hover:border-ink hover:text-ink transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
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
                  <label className="block text-xs font-[500] text-shade-60 uppercase tracking-[0.04em] mb-1.5">
                    {label}
                  </label>
                  <input
                    {...props}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-hairline-light rounded-md px-3 py-2.5 text-sm text-ink bg-canvas-light focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink transition-colors"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-pill bg-ink text-on-dark py-2.5 text-sm hover:bg-shade-70 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-pill border border-hairline-light text-shade-60 py-2.5 text-sm hover:border-ink hover:text-ink transition-colors"
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
