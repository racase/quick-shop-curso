import Header from './Header'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas-light">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
