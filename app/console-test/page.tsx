"use client"

import { useEffect } from "react"

export default function ConsoleTestPage() {
  useEffect(() => {
    console.log('Console test page loaded!')
    console.log('Testing basic JavaScript execution...')
    
    // Test basic fetch
    fetch('http://localhost:8000/api/site-settings/')
      .then(response => {
        console.log('Response status:', response.status)
        return response.json()
      })
      .then(data => {
        console.log('Response data:', data)
        console.log('Phone:', data.phone)
        console.log('Email:', data.email)
      })
      .catch(error => {
        console.error('Fetch error:', error)
      })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Console Test Page</h1>
      <p>Check the browser console for logs!</p>
      <p>This page tests basic JavaScript execution and API calls.</p>
    </div>
  )
}
