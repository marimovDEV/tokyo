"use client"

import { useEffect, useState } from "react"

export default function ErrorTestPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addResult('Page loaded, starting tests...')
    
    // Test 1: Basic JavaScript execution
    addResult('✅ Basic JavaScript execution works')
    
    // Test 2: Fetch API with error handling
    addResult('🔄 Starting API test...')
    
    fetch('http://localhost:8000/api/site-settings/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => {
        addResult(`✅ Fetch API works - Status: ${response.status}`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        addResult(`✅ API response received - Phone: ${data.phone}`)
        addResult(`✅ API response received - Email: ${data.email}`)
        addResult(`✅ API response received - Address: ${data.address}`)
        addResult(`✅ API response received - Working Hours: ${data.working_hours}`)
        setLoading(false)
      })
      .catch(error => {
        addResult(`❌ API Error: ${error.message}`)
        addResult(`❌ Error type: ${error.constructor.name}`)
        addResult(`❌ Error stack: ${error.stack}`)
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Error Test Page</h1>
      <p className="mb-4">This page tests API connection with detailed error reporting.</p>
      
      {loading && (
        <div className="bg-blue-100 p-4 rounded mb-4">
          <p>🔄 Testing API connection...</p>
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Test Results:</h2>
        <div className="space-y-1">
          {results.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
