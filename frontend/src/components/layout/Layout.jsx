import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex-1 flex flex-col'>
        <Outlet />
      </main>
      <footer className='bg-canvas-night text-on-primary border-t border-hairline-dark'>
        <div className='max-w-[1440px] mx-auto px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <span className='font-display text-xl font-medium tracking-wide'>QuickShop</span>
          <span className='font-body text-sm text-shade-40'>
            © 2024 QuickShop. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  )
}
