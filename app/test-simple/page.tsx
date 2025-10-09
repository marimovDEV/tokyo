"use client"

import { useState } from "react"

export default function TestSimplePage() {
  const [result, setResult] = useState<string>("")

  const testApi = async () => {
    try {
      setResult("Testing API...")
      const response = await fetch('http://localhost:8000/api/categories/')
      const data = await response.json()
      setResult(`Success! Found ${data.count} categories`)
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple API Test</h1>
      <button 
        onClick={testApi}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test API
      </button>
      <div className="bg-gray-100 p-4 rounded">
        <p>{result}</p>
      </div>
    </div>
  )
}
