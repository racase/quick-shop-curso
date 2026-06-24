import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/productService'
import { cartService } from '../../services/cartService'
import { reviewService } from '../../services/reviewService'
import { StarRating } from '../../components/ui/StarRating'
import { RatingSummary } from '../../components/ui/RatingSummary'
import { ReviewCard } from '../../components/ui/ReviewCard'
import { ReviewForm } from '../../components/ui/ReviewForm'

export function ProductDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [ratingStats, setRatingStats] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotal, setReviewTotal] = useState(0)
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)

  useEffect(() => {
    productService.getProduct(id)
      .then(setProduct)
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    if (!id) return
    setReviewsLoading(true)
    reviewService.listProductReviews(id, reviewPage, 5)
      .then((data) => {
        setReviews(data.items || [])
        setReviewTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [id, reviewPage])

  useEffect(() => {
    if (!id) return
    reviewService.getProductRating(id)
      .then(setRatingStats)
      .catch(() => {})
  }, [id])

  useEffect(() => {
    if (!user || !token || !id) return
    reviewService.listProductReviews(id, 1, 100)
      .then((data) => {
        const userReview = (data.items || []).find(
          (r) => r.user?.id === user.id
        )
        setHasUserReviewed(!!userReview)
      })
      .catch(() => {})
  }, [user, token, id])

  useEffect(() => {
    if (!user || !token || user.role !== 'client') return
    import('../../services/orderService').then(({ orderService }) => {
      orderService.listOrders(1, 100, token)
        .then((data) => {
          const delivered = (data.items || []).some(
            (o) => o.status === 'delivered' &&
              o.items?.some((item) => item.product_id === id)
          )
          setHasPurchased(delivered)
        })
        .catch(() => {})
    })
  }, [user, token, id])

  const handleAddToCart = async () => {
    setAdding(true)
    setFeedback('')
    try {
      await cartService.addItem(product.id, qty, token)
      setFeedback('Added to cart')
    } catch (err) {
      setFeedback(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleCreateReview = async (data) => {
    await reviewService.createReview(id, data, token)
    setShowReviewForm(false)
    setHasUserReviewed(true)
    const [reviewsData, ratingData] = await Promise.all([
      reviewService.listProductReviews(id, 1, 5),
      reviewService.getProductRating(id),
    ])
    setReviews(reviewsData.items || [])
    setReviewTotal(reviewsData.total || 0)
    setRatingStats(ratingData)
  }

  const handleUpdateReview = async (data) => {
    if (!editingReview) return
    await reviewService.updateReview(editingReview.id, data, token)
    setEditingReview(null)
    const [reviewsData, ratingData] = await Promise.all([
      reviewService.listProductReviews(id, reviewPage, 5),
      reviewService.getProductRating(id),
    ])
    setReviews(reviewsData.items || [])
    setRatingStats(ratingData)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    await reviewService.deleteReview(reviewId, token)
    setHasUserReviewed(false)
    const [reviewsData, ratingData] = await Promise.all([
      reviewService.listProductReviews(id, reviewPage, 5),
      reviewService.getProductRating(id),
    ])
    setReviews(reviewsData.items || [])
    setReviewTotal(reviewsData.total || 0)
    setRatingStats(ratingData)
  }

  if (loading) {
    return (
      <div className='flex-1 bg-canvas-cream flex items-center justify-center py-24'>
        <span className='font-body text-sm text-shade-50'>Loading...</span>
      </div>
    )
  }
  if (!product) return null

  const canAddToCart = user && user.role === 'client' && product.stock > 0
  const canReview = user && user.role === 'client' && hasPurchased && !hasUserReviewed

  return (
    <div className='flex-1 bg-canvas-cream px-6 py-16'>
      <div className='max-w-[1440px] mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start'>
          {/* Image */}
          <div className='rounded-xl overflow-hidden bg-canvas-light shadow-[0_8px_8px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)]'>
            <img
              src={product.image_url}
              alt={product.name}
              className='w-full aspect-square object-cover'
            />
          </div>

          {/* Info */}
          <div className='py-4'>
            <span className='font-body text-xs font-[400] tracking-[0.72px] uppercase text-shade-50 mb-4 block'>
              Product
            </span>
            <h1 className='font-display text-[48px] font-[330] leading-[1.14] text-ink mb-4'>
              {product.name}
            </h1>
            <div className='flex items-center gap-3 mb-2'>
              <p className='font-display text-[28px] font-[500] leading-[1.28] text-ink'>
                ${product.price}
              </p>
              {ratingStats && ratingStats.rating_count > 0 && (
                <div className='flex items-center gap-1.5'>
                  <StarRating value={Math.round(ratingStats.average_rating)} readonly size='sm' />
                  <span className='font-body text-xs text-shade-50'>
                    ({ratingStats.rating_count})
                  </span>
                </div>
              )}
            </div>
            <p className='font-body text-sm font-[500] tracking-[0.28px] text-shade-50 mb-8'>
              {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
            </p>

            <p className='font-body text-base font-[420] leading-[1.5] text-shade-60 mb-10 max-w-[480px]'>
              {product.description}
            </p>

            {product.stock > 0 && (
              <div className='flex items-center gap-4 mb-6'>
                <label className='font-body text-sm font-[500] text-shade-60 tracking-[0.28px]'>
                  Qty
                </label>
                <input
                  type='number'
                  min={1}
                  max={product.stock}
                  value={qty}
                  onChange={(e) => setQty(Math.min(product.stock, Math.max(1, +e.target.value)))}
                  className='w-20 bg-canvas-light border border-hairline-light rounded-md px-3 py-2 font-body text-base font-[420] text-ink text-center focus:outline-none focus:border-shade-50 transition-colors'
                />
              </div>
            )}

            {feedback && (
              <p className='font-body text-sm text-shade-60 mb-4'>{feedback}</p>
            )}

            <button
              disabled={!canAddToCart || adding}
              onClick={handleAddToCart}
              className='w-full bg-ink text-on-primary font-body text-base font-[420] py-3.5 rounded-pill hover:bg-shade-70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
            >
              {adding ? 'Adding...' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </button>

            {!user && (
              <p className='mt-4 font-body text-sm text-shade-50 text-center'>
                Sign in to add items to your cart.
              </p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className='mt-16 pt-12 border-t border-hairline-light'>
          <h2 className='font-display text-[28px] font-[330] text-ink mb-8'>Reviews</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
            <div className='md:col-span-1'>
              <RatingSummary
                averageRating={ratingStats?.average_rating || 0}
                ratingCount={ratingStats?.rating_count || 0}
                ratingDistribution={ratingStats?.rating_distribution}
              />
            </div>

            <div className='md:col-span-2'>
              {canReview && !showReviewForm && !editingReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className='mb-6 bg-ink text-on-primary font-body text-sm font-[420] px-6 py-2.5 rounded-pill hover:bg-shade-70 transition-colors'
                >
                  Write a review
                </button>
              )}

              {showReviewForm && (
                <div className='mb-6'>
                  <ReviewForm
                    onSubmit={handleCreateReview}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              {editingReview && (
                <div className='mb-6'>
                  <ReviewForm
                    initialRating={editingReview.rating}
                    initialComment={editingReview.comment || ''}
                    onSubmit={handleUpdateReview}
                    onCancel={() => setEditingReview(null)}
                    isEditing
                  />
                </div>
              )}

              {reviewsLoading ? (
                <p className='font-body text-sm text-shade-50'>Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className='font-body text-sm text-shade-50'>No reviews yet. Be the first to review!</p>
              ) : (
                <div className='space-y-4'>
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onEdit={user && review.user?.id === user.id ? setEditingReview : null}
                      onDelete={user && (review.user?.id === user.id || user.role === 'admin') ? handleDeleteReview : null}
                    />
                  ))}
                </div>
              )}

              {reviewTotal > 5 && (
                <div className='flex items-center justify-center gap-4 mt-6'>
                  <button
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={reviewPage === 1}
                    className='font-body text-sm text-shade-50 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                  >
                    Previous
                  </button>
                  <span className='font-body text-sm text-shade-50'>
                    Page {reviewPage} of {Math.ceil(reviewTotal / 5)}
                  </span>
                  <button
                    onClick={() => setReviewPage((p) => p + 1)}
                    disabled={reviewPage >= Math.ceil(reviewTotal / 5)}
                    className='font-body text-sm text-shade-50 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
