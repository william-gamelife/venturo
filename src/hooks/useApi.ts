// 通用 API Hook
import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: () => Promise<void>
  setData: (data: T | null) => void
}

export function useApi<T>(
  apiFunction: () => Promise<{ data?: T; error?: string }>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { immediate = true, onSuccess, onError } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction()
      
      if (result.error) {
        setError(result.error)
        onError?.(result.error)
      } else if (result.data) {
        setData(result.data)
        onSuccess?.(result.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '發生未知錯誤'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiFunction, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [])

  return { data, loading, error, execute, setData }
}