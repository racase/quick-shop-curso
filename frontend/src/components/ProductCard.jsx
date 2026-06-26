export default function ProductCard({ product, onAddToCart }) {
  const outOfStock = product.stock === 0

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <img
        src={product.imagen_url || 'https://placehold.co/400x300?text=Sin+imagen'}
        alt={product.nombre}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{product.nombre}</h3>
        {product.descripcion && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.descripcion}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-indigo-600 font-bold">{Number(product.precio).toFixed(2)} €</span>
          <button
            disabled={outOfStock}
            onClick={() => onAddToCart && onAddToCart(product)}
            className={`text-xs px-3 py-1.5 rounded font-medium ${
              outOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {outOfStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
