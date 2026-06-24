import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className='text-center mt-24'>
      <h1 className='text-6xl font-bold text-gray-300'>404</h1>
      <p className='text-xl text-gray-600 mt-4'>Page not found</p>
      <Link to='/' className='mt-6 inline-block text-indigo-600 hover:underline'>
        Back to catalog
      </Link>
    </div>
  )
}
