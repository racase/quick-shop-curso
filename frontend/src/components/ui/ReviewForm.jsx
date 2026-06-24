import { useState } from 'react'
import { StarRating } from './StarRating'

export function ReviewForm({ initialRating = 0, initialComment = '', onSubmit, onCancel, isEditing = false }) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5')
      return
    }

    if (comment.length > 1000) {
      setError('Comment must not exceed 1000 characters')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ rating, comment: comment || null })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='bg-canvas-light rounded-lg border border-hairline-light p-6'>
      <h3 className='font-body text-base font-[550] text-ink mb-4'>
        {isEditing ? 'Edit your review' : 'Write a review'}
      </h3>

      {error && (
        <div className='bg-shade-10 border border-shade-30 text-shade-70 font-body text-sm px-4 py-3 rounded-md mb-4'>
          {error}
        </div>
      )}

      <div className='mb-4'>
        <label className='block font-body text-sm font-[500] text-shade-60 mb-2'>
          Rating
        </label>
        <StarRating value={rating} onChange={setRating} size='lg' />
      </div>

      <div className='mb-4'>
        <label className='block font-body text-sm font-[500] text-shade-60 mb-1.5'>
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
          className='w-full bg-canvas-light border border-hairline-light rounded-md px-3 py-2 font-body text-sm font-[420] text-ink placeholder-shade-40 focus:outline-none focus:border-shade-50 transition-colors resize-none'
          placeholder='Share your experience with this product...'
        />
        <p className='font-body text-xs text-shade-40 mt-1 text-right'>
          {comment.length}/1000
        </p>
      </div>

      <div className='flex items-center gap-3'>
        <button
          type='submit'
          disabled={submitting || rating < 1}
          className='bg-ink text-on-primary font-body text-sm font-[420] px-6 py-2.5 rounded-pill hover:bg-shade-70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
        >
          {submitting ? 'Submitting...' : isEditing ? 'Update review' : 'Submit review'}
        </button>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            className='font-body text-sm font-[420] text-shade-50 hover:text-ink transition-colors px-4 py-2.5'
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
