/**
 * 快取服務
 * 管理 API 快取、提升效能
 */

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  key: string
}

/**
 * 快取服務類別
 */
export class CacheService {
  private cache: Map<string, CacheEntry>
  private defaultTTL: number = 5 * 60 * 1000 // 預設 5 分鐘
  
  constructor() {
    this.cache = new Map()
    
    if (typeof window !== 'undefined') {
      this.loadFromSessionStorage()
      this.startCleanupWorker()
    }
  }
  
  /**
   * 從 sessionStorage 載入快取
   */
  private loadFromSessionStorage(): void {
    try {
      const stored = sessionStorage.getItem('venturo_cache')
      if (stored) {
        const entries: CacheEntry[] = JSON.parse(stored)
        const now = Date.now()
        
        entries.forEach(entry => {
          if (now - entry.timestamp < entry.ttl) {
            this.cache.set(entry.key, entry)
          }
        })
      }
    } catch (error) {
      console.error('載入快取失敗:', error)
    }
  }
  
  /**
   * 保存到 sessionStorage
   */
  private saveToSessionStorage(): void {
    try {
      const entries = Array.from(this.cache.values())
      sessionStorage.setItem('venturo_cache', JSON.stringify(entries))
    } catch (error) {
      // SessionStorage 可能已滿，清理過期項目
      this.cleanup()
      try {
        const entries = Array.from(this.cache.values())
        sessionStorage.setItem('venturo_cache', JSON.stringify(entries))
      } catch {
        // 還是失敗，清空快取
        this.clear()
      }
    }
  }
  
  /**
   * 開始清理工作器
   */
  private startCleanupWorker(): void {
    // 每分鐘清理過期快取
    setInterval(() => {
      this.cleanup()
    }, 60000)
  }
  
  /**
   * 設置快取
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    
    this.cache.set(key, entry)
    this.saveToSessionStorage()
  }
  
  /**
   * 獲取快取
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      // 已過期
      this.cache.delete(key)
      this.saveToSessionStorage()
      return null
    }
    
    return entry.data as T
  }
  
  /**
   * 檢查快取是否存在且有效
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      // 已過期
      this.cache.delete(key)
      return false
    }
    
    return true
  }
  
  /**
   * 刪除快取
   */
  delete(key: string): void {
    this.cache.delete(key)
    this.saveToSessionStorage()
  }
  
  /**
   * 清除匹配的快取
   */
  deletePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
    
    this.saveToSessionStorage()
  }
  
  /**
   * 清理過期快取
   */
  cleanup(): void {
    const now = Date.now()
    let deleted = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        deleted++
      }
    }
    
    if (deleted > 0) {
      console.log(`🧹 清理了 ${deleted} 個過期快取項目`)
      this.saveToSessionStorage()
    }
  }
  
  /**
   * 清空所有快取
   */
  clear(): void {
    this.cache.clear()
    sessionStorage.removeItem('venturo_cache')
  }
  
  /**
   * 取得快取統計
   */
  getStats(): {
    size: number
    keys: string[]
    totalBytes: number
  } {
    const keys = Array.from(this.cache.keys())
    const totalBytes = JSON.stringify(Array.from(this.cache.values())).length
    
    return {
      size: this.cache.size,
      keys,
      totalBytes
    }
  }
  
  /**
   * 設置預設 TTL
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl
  }
  
  /**
   * 建立快取鍵
   */
  static createKey(...parts: (string | number | boolean)[]): string {
    return parts.filter(p => p !== undefined && p !== null).join(':')
  }
  
  /**
   * 裝飾器：自動快取方法結果
   */
  static cache(ttl?: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value
      
      descriptor.value = async function (...args: any[]) {
        const cacheKey = CacheService.createKey(propertyKey, ...args.map(a => JSON.stringify(a)))
        const cached = cacheService.get(cacheKey)
        
        if (cached) {
          console.log(`📦 快取命中: ${cacheKey}`)
          return cached
        }
        
        const result = await originalMethod.apply(this, args)
        cacheService.set(cacheKey, result, ttl)
        
        return result
      }
      
      return descriptor
    }
  }
}

// 創建全域實例
export const cacheService = new CacheService()

// 預設導出
export default cacheService
