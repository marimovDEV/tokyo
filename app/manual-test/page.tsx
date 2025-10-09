"use client"

import { useState, useEffect } from "react"

export default function ManualTestPage() {
  const [result, setResult] = useState<string>("")

  const addItemManually = () => {
    try {
      // Create a test item that matches the API structure
      const testItem = {
        id: 1,
        name: "Bruschetta",
        name_uz: "Brusketta", 
        name_ru: "Брускетта",
        description: "Toasted bread with fresh tomatoes, garlic, and basil",
        description_uz: "Qovurilgan non yangi pomidor, sarimsoq va rayhon bilan",
        description_ru: "Поджаренный хлеб со свежими помидорами, чесноком и базиликом",
        price: 28000,
        image: "/bruschetta.jpg",
        category: 1,
        category_name: "Appetizers",
        category_name_uz: "Ishtaha ochuvchilar",
        category_name_ru: "Закуски",
        available: true,
        prep_time: "10-15",
        rating: 4.7,
        ingredients: ["Baguette bread - 4 slices", "Fresh tomatoes - 200g", "Garlic - 2 cloves"],
        ingredients_uz: ["Baget non - 4 bo'lak", "Yangi pomidor - 200g", "Sarimsoq - 2 dona"],
        ingredients_ru: ["Багет - 4 ломтика", "Свежие помидоры - 200г", "Чеснок - 2 зубчика"],
        created_at: "2025-10-01T13:42:03.402780Z",
        updated_at: "2025-10-01T13:42:03.402786Z",
        quantity: 1
      }

      // Get current cart
      const currentCart = JSON.parse(localStorage.getItem("restaurant-cart") || "[]")
      
      // Check if item already exists
      const existingItemIndex = currentCart.findIndex((item: any) => item.id === testItem.id)
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        currentCart[existingItemIndex].quantity += 1
        setResult("Item quantity updated in cart!")
      } else {
        // Add new item
        currentCart.push(testItem)
        setResult("Item added to cart!")
      }
      
      // Save to localStorage
      localStorage.setItem("restaurant-cart", JSON.stringify(currentCart))
      
      // Verify it was saved
      const savedCart = JSON.parse(localStorage.getItem("restaurant-cart") || "[]")
      setResult(prev => prev + ` Cart now has ${savedCart.length} items.`)
      
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  const checkCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("restaurant-cart") || "[]")
      setResult(`Cart has ${cart.length} items: ${JSON.stringify(cart, null, 2)}`)
    } catch (error) {
      setResult(`Error reading cart: ${error}`)
    }
  }

  const clearCart = () => {
    try {
      localStorage.removeItem("restaurant-cart")
      setResult("Cart cleared!")
    } catch (error) {
      setResult(`Error clearing cart: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manual Cart Test</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={addItemManually}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Bruschetta to Cart
        </button>
        
        <button 
          onClick={checkCart}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Check Cart
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
        <pre className="text-sm whitespace-pre-wrap">{result}</pre>
      </div>

      <div className="mt-4 space-x-4">
        <a 
          href="/cart" 
          className="bg-purple-500 text-white px-4 py-2 rounded inline-block"
        >
          Go to Cart Page
        </a>
        
        <a 
          href="/debug-cart" 
          className="bg-orange-500 text-white px-4 py-2 rounded inline-block"
        >
          Go to Debug Page
        </a>
      </div>
    </div>
  )
}
