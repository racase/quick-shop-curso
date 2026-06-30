import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct, getProductReviews, createReview, updateReview, deleteReview } from '../api/products'
import StarRating from '../components/StarRating'
import { CartContext } from '../context/CartContext'
import { useAuth } from '../hooks/useAuth'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, token } = useAuth()
  const cartCtx = useContext(CartContext)

  const [userReview, setUserReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productData, reviewsData] = await Promise.all([
          getProduct(id),
          getProductReviews(id)
        ])
        setProduct(productData)
        setReviews(reviewsData)
        
        if (user && user.rol === 'cliente') {
          const existingReview = reviewsData.valoraciones.find(r => r.usuario_id === user.id)
          setUserReview(existingReview || null)
        }
      } catch (e) {
        setError('No se pudo cargar el producto')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user])

  async function handleAddToCart() {
    if (!cartCtx) return
    try {
      await cartCtx.addToCart(product.id, 1)
    } catch (e) {
      alert(e.detail || 'No se pudo agregar al carrito')
    }
  }

  async function handleSubmitReview() {
    if (reviewRating < 1 || reviewRating > 5) return
    setSubmitting(true)
    try {
      if (userReview) {
        await updateReview(token, product.id, { puntuacion: reviewRating })
      } else {
        await createReview(token, product.id, { puntuacion: reviewRating })
      }
      const updatedReviews = await getProductReviews(id)
      setReviews(updatedReviews)
      const existingReview = updatedReviews.valoraciones.find(r => r.usuario_id === user.id)
      setUserReview(existingReview || null)
      setShowReviewForm(false)
    } catch (e) {
      alert(e.detail || 'Error al guardar valoración')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteReview() {
    if (!confirm('¿Estás seguro de eliminar tu valoración?')) return
    setSubmitting(true)
    try {
      await deleteReview(token, product.id)
      const updatedReviews = await getProductReviews(id)
      setReviews(updatedReviews)
      setUserReview(null)
      setShowReviewForm(false)
    } catch (e) {
      alert(e.detail || 'Error al eliminar valoración')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-canvas-light px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-shade-50 text-sm text-center py-16">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-canvas-light px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-500 text-sm text-center py-16">{error || 'Producto no encontrado'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-canvas-light px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square overflow-hidden bg-shade-30/20 rounded-lg">
            <img
              src={product.imagen_url || 'https://placehold.co/600x600?text=Sin+imagen'}
              alt={product.nombre}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-ink text-2xl" style={{ fontWeight: 500 }}>
              {product.nombre}
            </h1>
            
            <div className="flex items-center gap-2">
              <StarRating rating={reviews?.media_puntuacion || 0} totalReviews={reviews?.total_valoraciones || 0} />
            </div>
            
            <p className="font-body text-ink font-[550] text-3xl">
              {Number(product.precio).toFixed(2)} €
            </p>
            
            {product.descripcion && (
              <p className="text-shade-50 text-sm leading-relaxed">
                {product.descripcion}
              </p>
            )}
            
            <div className="mt-4">
              {product.stock === 0 ? (
                <span className="rounded-pill px-4 py-2 text-sm bg-shade-30 text-shade-60">
                  Sin stock
                </span>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="rounded-pill bg-ink text-on-dark px-6 py-2 text-sm hover:bg-shade-70 transition-colors"
                >
                  Agregar al carrito
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-hairline-light pt-8">
          <h2 className="font-display text-ink text-xl mb-6" style={{ fontWeight: 500 }}>
            Valoraciones
          </h2>
          
          {user && user.rol === 'cliente' && (
            <div className="mb-6">
              {userReview ? (
                <div className="flex items-center gap-4">
                  <span className="text-shade-50 text-sm">Tu valoración:</span>
                  <StarRating rating={userReview.puntuacion} />
                  <button
                    onClick={() => {
                      setShowReviewForm(true)
                      setReviewRating(userReview.puntuacion)
                    }}
                    className="text-sm text-ink underline hover:text-shade-70"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={submitting}
                    className="text-sm text-red-500 underline hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="rounded-pill bg-ink text-on-dark px-4 py-2 text-sm hover:bg-shade-70 transition-colors"
                >
                  Escribir valoración
                </button>
              )}
            </div>
          )}
          
          {showReviewForm && (
            <div className="mb-6 p-4 bg-shade-30/10 rounded-lg">
              <p className="text-shade-50 text-sm mb-3">Selecciona tu puntuación:</p>
              <StarRating
                rating={reviewRating}
                interactive={true}
                onRate={setReviewRating}
                size="lg"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || reviewRating < 1}
                  className="rounded-pill bg-ink text-on-dark px-4 py-2 text-sm hover:bg-shade-70 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false)
                    setReviewRating(0)
                  }}
                  className="rounded-pill border border-hairline-light px-4 py-2 text-sm hover:bg-shade-30/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          {reviews && reviews.valoraciones.length > 0 ? (
            <div className="space-y-4">
              {reviews.valoraciones.map((review) => (
                <div key={review.id} className="border-b border-hairline-light pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.puntuacion} size="sm" />
                    <span className="text-shade-50 text-xs">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-shade-50 text-sm">No hay valoraciones aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
