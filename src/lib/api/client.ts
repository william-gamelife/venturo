/**
 * API 客戶端基礎類
 * 提供統一的請求方法、快取、錯誤處理
 */

import type { ApiResponse } from '@/types'

export interface RequestOptions extends RequestInit {
  cache?: boolean
  retry?: number
  timeout?: number
}

export class APIClient {
  private baseURL: string
  private cache: Map<string, { data: any; timestamp: number }>
  private cacheTimeout: number = 5 * 60 * 1000 // 5 分鐘
  
  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || '/api'
    this.cache = new Map()
  }
  
  /**
   * 統一的請求方法
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const { cache = false, retry = 1, timeout = 30000, ...fetchOptions } = options
    
    try {
      // 檢查快取
      if (cache && fetchOptions.method === 'GET') {
        const cached = this.getCache(url)
        if (cached) {
          return {
            success: true,
            data: cached
          }
        }
      }
      
      // 設置超時
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      // 發送請求
      let lastError: Error | null = null
      for (let i = 0; i < retry; i++) {
        try {
          const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...fetchOptions.headers,
            }
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          
          // 快取結果
          if (cache && fetchOptions.method === 'GET') {
            this.setCache(url, data)
          }
          
          return {
            success: true,
            data
          }
        } catch (error) {
          lastError = error as Error
          if (i < retry - 1) {
            // 重試前等待
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
          }
        }
      }
      
      throw lastError
      
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '請求失敗'
      }
    }
  }
  
  /**
   * GET 請求
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
      cache: options?.cache !== false // 預設開啟快取
    })
  }
  
  /**
   * POST 請求
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  /**
   * PUT 請求
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  /**
   * DELETE 請求
   */
  async delete<T = void>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE'
    })
  }
  
  /**
   * PATCH 請求
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  /**
   * 獲取快取
   */
  private getCache(key: string): any {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }
  
  /**
   * 設置快取
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  /**
   * 清除快取
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // 清除匹配的快取
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      // 清除所有快取
      this.cache.clear()
    }
  }
  
  /**
   * 設置快取超時時間
   */
  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout
  }
}

// 創建預設實例
export const apiClient = new APIClient()
