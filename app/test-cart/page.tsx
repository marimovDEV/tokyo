"use client"

import { useState, useEffect } from "react"

export default function TestCartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [result, setResult] = useState<string>("")

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("restaurant-cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("restaurant-cart", JSON.stringify(cart))
  }, [cart])

  const addTestItem = () => {
    const testItem = {
      id: 1,
      name: "Test Item",
      name_uz: "Test Mahsulot",
      name_ru: "Тестовый товар",
      description: "This is a test item",
      description_uz: "Bu test mahsuloti",
      description_ru: "Это тестовый товар",
      price: 25000,
      image: "/placeholder.svg",
      category: 1,
      available: true,
      quantity: 1
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.id === testItem.id)
      if (existingItem) {
        return prev.map(item => 
          item.id === testItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, testItem]
    })
    
    setResult("Test item added to cart!")
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem("restaurant-cart")
    setResult("Cart cleared!")
  }

  const viewCart = () => {
    setResult(`Cart has ${cart.length} items. Total: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} so'm`)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cart Test Page</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={addTestItem}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Test Item
        </button>
        
        <button 
          onClick={viewCart}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          View Cart
        </button>
        
        <button 
          onClick={clearCart}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">Result:</h3>
        <p>{result}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Current Cart ({cart.length} items):</h3>
        {cart.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <div className="space-y-2">
            {cart.map((item, index) => (
              <div key={index} className="bg-white p-2 rounded border">
                <p><strong>Name:</strong> {item.name_uz}</p>
                <p><strong>Price:</strong> {item.price} so'm</p>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Total:</strong> {item.price * item.quantity} so'm</p>
              </div>
            ))}
            <div className="bg-green-100 p-2 rounded border-2 border-green-300">
              <p><strong>Grand Total:</strong> {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} so'm</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <a 
          href="/cart" 
          className="bg-purple-500 text-white px-4 py-2 rounded inline-block"
        >
          Go to Cart Page
        </a>
      </div>
    </div>
  )
}
