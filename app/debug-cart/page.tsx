"use client"

import { useState, useEffect } from "react"

export default function DebugCartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [localStorageData, setLocalStorageData] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  // Load cart from localStorage on component mount
  useEffect(() => {
    addDebugInfo("Component mounted, checking localStorage...")
    try {
      const savedCart = localStorage.getItem("restaurant-cart")
      addDebugInfo(`localStorage data: ${savedCart || 'null'}`)
      setLocalStorageData(savedCart || 'null')
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        addDebugInfo(`Parsed cart: ${JSON.stringify(parsedCart)}`)
        setCart(parsedCart)
      } else {
        addDebugInfo("No cart data found in localStorage")
        setCart([])
      }
    } catch (error) {
      addDebugInfo(`Error loading cart: ${error}`)
    }
  }, [])

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      addDebugInfo(`Saving cart to localStorage: ${JSON.stringify(cart)}`)
      try {
        localStorage.setItem("restaurant-cart", JSON.stringify(cart))
        addDebugInfo("Cart saved successfully")
      } catch (error) {
        addDebugInfo(`Error saving cart: ${error}`)
      }
    }
  }, [cart])

  const addTestItem = () => {
    addDebugInfo("Adding test item...")
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
      addDebugInfo(`Previous cart: ${JSON.stringify(prev)}`)
      const existingItem = prev.find(item => item.id === testItem.id)
      if (existingItem) {
        const newCart = prev.map(item => 
          item.id === testItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        addDebugInfo(`Updated existing item, new cart: ${JSON.stringify(newCart)}`)
        return newCart
      }
      const newCart = [...prev, testItem]
      addDebugInfo(`Added new item, new cart: ${JSON.stringify(newCart)}`)
      return newCart
    })
  }

  const clearCart = () => {
    addDebugInfo("Clearing cart...")
    setCart([])
    try {
      localStorage.removeItem("restaurant-cart")
      addDebugInfo("Cart cleared from localStorage")
    } catch (error) {
      addDebugInfo(`Error clearing cart: ${error}`)
    }
  }

  const checkLocalStorage = () => {
    addDebugInfo("Checking localStorage...")
    try {
      const data = localStorage.getItem("restaurant-cart")
      setLocalStorageData(data || 'null')
      addDebugInfo(`Current localStorage data: ${data || 'null'}`)
    } catch (error) {
      addDebugInfo(`Error checking localStorage: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cart Debug Page</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={addTestItem}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Test Item
        </button>
        
        <button 
          onClick={clearCart}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
        >
          Clear Cart
        </button>
        
        <button 
          onClick={checkLocalStorage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Check localStorage
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Current Cart State ({cart.length} items):</h3>
          <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(cart, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">localStorage Data:</h3>
          <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-40">
            {localStorageData}
          </pre>
        </div>
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Debug Log:</h3>
        <div className="bg-white p-2 rounded border max-h-60 overflow-auto">
          {debugInfo.map((info, index) => (
            <div key={index} className="text-sm font-mono mb-1">
              {info}
            </div>
          ))}
        </div>
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
