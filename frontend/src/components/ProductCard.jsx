export default function ProductCard({ product, onAddToCart }) {
  const outOfStock = product.stock === 0

  return (
    <div
      className="bg-canvas-light rounded-lg border border-hairline-light overflow-hidden flex flex-col"
      style={{ boxShadow: '0 8px 8px rgba(0,0,0,0.05), 0 4px 4px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)' }}
    >
      <div className="aspect-[4/3] overflow-hidden bg-shade-30/20">
        <img
          src={product.imagen_url || 'https://placehold.co/400x300?text=Sin+imagen'}
          alt={product.nombre}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <h3
            className="font-display text-ink text-base leading-tight line-clamp-2 mb-1"
            style={{ fontWeight: 500 }}
          >
            {product.nombre}
          </h3>
          {product.descripcion && (
            <p className="text-shade-50 text-sm leading-snug line-clamp-2">
              {product.descripcion}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-body text-ink font-[550] text-base">
            {Number(product.precio).toFixed(2)} €
          </span>
          {outOfStock ? (
            <span
              className="rounded-pill px-3 py-1.5 text-xs bg-shade-30 text-shade-60"
              style={{ letterSpacing: '0.04em' }}
            >
              Sin stock
            </span>
          ) : (
            <button
              onClick={() => onAddToCart && onAddToCart(product)}
              className="rounded-pill bg-ink text-on-dark px-4 py-1.5 text-sm hover:bg-shade-70 transition-colors"
            >
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
