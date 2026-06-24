import { StarRating } from './StarRating'

export function RatingSummary({ averageRating, ratingCount, ratingDistribution }) {
  if (ratingCount === 0) {
    return (
      <div className='bg-canvas-light rounded-lg border border-hairline-light p-6'>
        <p className='font-body text-sm text-shade-50'>No reviews yet</p>
      </div>
    )
  }

  const maxCount = Math.max(
    ratingDistribution?.rating_1 || 0,
    ratingDistribution?.rating_2 || 0,
    ratingDistribution?.rating_3 || 0,
    ratingDistribution?.rating_4 || 0,
    ratingDistribution?.rating_5 || 0,
    1
  )

  return (
    <div className='bg-canvas-light rounded-lg border border-hairline-light p-6'>
      <div className='flex items-center gap-4 mb-4'>
        <span className='font-display text-4xl font-[500] text-ink'>
          {averageRating?.toFixed(1) || '0.0'}
        </span>
        <div>
          <StarRating value={Math.round(averageRating || 0)} readonly size='md' />
          <p className='font-body text-xs text-shade-50 mt-1'>
            {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {ratingDistribution && (
        <div className='space-y-1.5'>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[`rating_${star}`] || 0
            const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0
            return (
              <div key={star} className='flex items-center gap-2'>
                <span className='font-body text-xs text-shade-50 w-3 text-right'>{star}</span>
                <svg className='w-3 h-3 text-amber-400 fill-current' viewBox='0 0 24 24'>
                  <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                </svg>
                <div className='flex-1 h-2 bg-shade-10 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-amber-400 rounded-full transition-all duration-300'
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className='font-body text-xs text-shade-40 w-6 text-right'>{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
