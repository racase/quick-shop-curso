import { useState } from 'react'

function Star({ filled, half, onClick, onMouseEnter, onMouseLeave, interactive }) {
  return (
    <span
      className={`cursor-${interactive ? 'pointer' : 'default'} text-lg`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {filled ? (
        <span className="text-yellow-400">&#9733;</span>
      ) : half ? (
        <span className="text-yellow-400">&#9733;</span>
      ) : (
        <span className="text-gray-300">&#9733;</span>
      )}
    </span>
  )
}

export default function StarRating({ rating = 0, totalReviews = 0, interactive = false, onRate, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(rating)

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating

  const handleClick = (value) => {
    if (!interactive) return
    setSelectedRating(value)
    if (onRate) onRate(value)
  }

  const handleMouseEnter = (value) => {
    if (!interactive) return
    setHoverRating(value)
  }

  const handleMouseLeave = () => {
    if (!interactive) return
    setHoverRating(0)
  }

  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-lg'

  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            filled={value <= Math.floor(displayRating)}
            half={value === Math.ceil(displayRating) && displayRating % 1 !== 0}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            interactive={interactive}
          />
        ))}
      </div>
      {totalReviews > 0 && (
        <span className="text-shade-50 text-sm ml-1">
          ({totalReviews})
        </span>
      )}
    </div>
  )
}
