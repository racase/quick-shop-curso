import { StarRating } from './StarRating'

export function ReviewCard({ review, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className='bg-canvas-light rounded-lg border border-hairline-light p-6'>
      <div className='flex items-start justify-between mb-3'>
        <div>
          <p className='font-body text-sm font-[550] text-ink'>
            {review.user?.full_name || 'Anonymous'}
          </p>
          <p className='font-body text-xs text-shade-50 mt-0.5'>
            {formatDate(review.created_at)}
          </p>
        </div>
        <StarRating value={review.rating} readonly size='sm' />
      </div>
      {review.comment && (
        <p className='font-body text-sm font-[420] text-shade-60 leading-relaxed'>
          {review.comment}
        </p>
      )}
      {(onEdit || onDelete) && (
        <div className='flex items-center gap-3 mt-4 pt-4 border-t border-hairline-light'>
          {onEdit && (
            <button
              onClick={() => onEdit(review)}
              className='font-body text-xs font-[500] text-shade-50 hover:text-ink transition-colors'
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className='font-body text-xs font-[500] text-shade-50 hover:text-red-500 transition-colors'
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
