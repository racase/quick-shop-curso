import { useState } from 'react'

export function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const starSize = sizeClasses[size] || sizeClasses.md

  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value)
        return (
          <button
            key={star}
            type='button'
            disabled={readonly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <svg
              className={`${starSize} ${isFilled ? 'text-amber-400' : 'text-shade-30'} fill-current`}
              viewBox='0 0 24 24'
            >
              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
