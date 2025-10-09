"use client"

import { useEffect, useState } from "react"

export default function SimpleTestPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true)
        console.log('Testing API connection...')
        
        const response = await fetch('http://localhost:8000/api/site-settings/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('Response data:', result)
        setData(result)
      } catch (err) {
        console.error('API Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    testAPI()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple API Test</h1>
        <p>Testing API connection...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple API Test</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">❌ API Connection Failed</h2>
          <p><strong>Error:</strong> {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple API Test</h1>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <h2 className="font-bold">✅ API Connection Successful!</h2>
        <div className="mt-4">
          <p><strong>Phone:</strong> {data?.phone}</p>
          <p><strong>Email:</strong> {data?.email}</p>
          <p><strong>Address:</strong> {data?.address}</p>
          <p><strong>Working Hours:</strong> {data?.working_hours}</p>
        </div>
      </div>
    </div>
  )
}
