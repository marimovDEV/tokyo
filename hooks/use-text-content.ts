import { useState, useEffect, useCallback } from 'react'

export interface TextContent {
  id: string
  content_type: string
  key: string
  title?: string
  subtitle?: string
  description?: string
  content?: string
  button_text?: string
  title_uz?: string
  subtitle_uz?: string
  description_uz?: string
  content_uz?: string
  button_text_uz?: string
  title_ru?: string
  subtitle_ru?: string
  description_ru?: string
  content_ru?: string
  button_text_ru?: string
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export function useTextContent(contentType?: string, key?: string) {
  const [textContent, setTextContent] = useState<TextContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTextContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/text-content/`
      
      const params = new URLSearchParams()
      if (contentType) params.append('content_type', contentType)
      if (key) params.append('key', key)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setTextContent(data.results || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [contentType, key])

  useEffect(() => {
    fetchTextContent()
  }, [fetchTextContent])

  const getText = useCallback((key: string, language: string = 'uz', fallback?: string) => {
    const item = textContent.find(content => content.key === key)
    if (!item) return fallback || key

    switch (language) {
      case 'uz':
        return item.title_uz || item.subtitle_uz || item.description_uz || item.content_uz || item.button_text_uz || item.title || fallback || key
      case 'ru':
        return item.title_ru || item.subtitle_ru || item.description_ru || item.content_ru || item.button_text_ru || item.title || fallback || key
      default:
        return item.title || item.subtitle || item.description || item.content || item.button_text || fallback || key
    }
  }, [textContent])

  const refetch = useCallback(() => {
    fetchTextContent()
  }, [fetchTextContent])

  return { 
    textContent, 
    loading, 
    error, 
    getText,
    refetch 
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/site-settings/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settings, loading, error }
}

export function useRestaurantInfo() {
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRestaurantInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/restaurant-info/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setRestaurantInfo(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRestaurantInfo()
  }, [fetchRestaurantInfo])

  return { restaurantInfo, loading, error }
}
