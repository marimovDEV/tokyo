"use client"

import { useEffect, useState } from "react"
import { useSiteSettings } from "@/hooks/use-api"

export default function DebugHooksPage() {
  const { siteSettings, loading, error } = useSiteSettings()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      loading,
      error: error?.message,
      siteSettings,
      timestamp: new Date().toISOString()
    })
  }, [loading, error, siteSettings])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Hooks</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">useSiteSettings Hook Debug:</h2>
        <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Raw Hook Values:</h2>
        <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
        <p><strong>Error:</strong> {error?.message || 'none'}</p>
        <p><strong>Site Settings:</strong> {siteSettings ? 'exists' : 'null'}</p>
      </div>

      {siteSettings && (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold mb-2">Site Settings Data:</h2>
          <p><strong>Phone:</strong> {siteSettings.phone}</p>
          <p><strong>Email:</strong> {siteSettings.email}</p>
          <p><strong>Address:</strong> {siteSettings.address}</p>
          <p><strong>Working Hours:</strong> {siteSettings.working_hours}</p>
        </div>
      )}
    </div>
  )
}
