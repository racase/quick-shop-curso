import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { addItem, clearCart, getCart, removeItem, updateItem } from '../api/cart'
import { AuthContext } from './AuthContext'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { token, user } = useContext(AuthContext)
  const [cart, setCart] = useState({ items: [], total: '0.00' })

  const isClient = user?.rol === 'cliente'

  const fetchCart = useCallback(async () => {
    if (!token || !isClient) {
      setCart({ items: [], total: '0.00' })
      return
    }
    try {
      const data = await getCart(token)
      setCart(data)
    } catch {
      setCart({ items: [], total: '0.00' })
    }
  }, [token, isClient])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  async function addToCart(producto_id, cantidad = 1) {
    await addItem(token, producto_id, cantidad)
    await fetchCart()
  }

  async function updateQuantity(producto_id, cantidad) {
    await updateItem(token, producto_id, cantidad)
    await fetchCart()
  }

  async function removeFromCart(producto_id) {
    await removeItem(token, producto_id)
    await fetchCart()
  }

  async function emptyCart() {
    await clearCart(token)
    await fetchCart()
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.cantidad, 0)

  return (
    <CartContext.Provider value={{ cart, itemCount, fetchCart, addToCart, updateQuantity, removeFromCart, emptyCart }}>
      {children}
    </CartContext.Provider>
  )
}
