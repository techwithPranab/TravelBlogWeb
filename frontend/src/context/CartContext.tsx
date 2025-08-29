'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Resource } from '@/types'

interface CartItem {
  resource: Resource
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (resource: Resource, quantity?: number) => void
  removeItem: (resourceId: string) => void
  updateQuantity: (resourceId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (resource: Resource, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.resource._id === resource._id)
      
      if (existingItem) {
        return prev.map(item =>
          item.resource._id === resource._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      return [...prev, { resource, quantity }]
    })
  }

  const removeItem = (resourceId: string) => {
    setItems(prev => prev.filter(item => item.resource._id !== resourceId))
  }

  const updateQuantity = (resourceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(resourceId)
      return
    }

    setItems(prev =>
      prev.map(item =>
        item.resource._id === resourceId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.resource.price || 0) * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
