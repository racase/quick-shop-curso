import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className='flex-1 bg-canvas-night text-on-primary flex flex-col items-center justify-center px-6 py-32'>
      <span className='font-body text-xs font-[400] tracking-[0.72px] uppercase text-shade-40 mb-6'>
        Error
      </span>
      <h1 className='font-display text-[96px] md:text-[120px] font-[330] leading-none tracking-[2.4px] text-on-primary mb-6'>
        404
      </h1>
      <p className='font-body text-lg font-[420] text-shade-40 mb-12 text-center max-w-sm'>
        This page doesn't exist or has been moved.
      </p>
      <Link
        to='/'
        className='border border-on-primary/40 text-on-primary px-8 py-3 rounded-pill font-body text-sm hover:border-on-primary transition-colors'
      >
        Back to catalog
      </Link>
    </div>
  )
}
