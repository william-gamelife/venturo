/**
 * BaseAPI - 統一的 API 抽象層
 * 完全本地化版本，使用 LocalStorage 作為資料儲存
 * 包含快取機制和錯誤處理
 */

// 基礎資料模型介面
export interface BaseModel {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  syncStatus?: 'local' | 'synced' | 'pending' | 'conflict'
}

// API 回應格式
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 查詢參數
export interface QueryParams {
  search?: string
  filter?: Record<string, any>
  sort?: 'asc' | 'desc'
  sortBy?: string
  page?: number
  limit?: number
}

// 批量操作參數
export interface BulkOperation<T> {
  action: 'delete' | 'update' | 'archive'
  ids: string[]
  data?: Partial<T>
}

/**
 * BaseAPI 類別 - 提供統一的 CRUD 操作
 */
export class BaseAPI {
  // 快取機制
  private static cache = new Map<string, { data: any, timestamp: number }>()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5分鐘快取

  /**
   * 取得快取資料
   */
  private static getCache<T>(key: string): T[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  /**
   * 設定快取
   */
  private static setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 清除快取
   */
  static clearCache(module?: string, userId?: string): void {
    if (module && userId) {
      const key = `gamelife_${module}_${userId}`
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
  /**
   * 載入模組資料
   */
  static async loadData<T>(
    module: string,
    userId: string,
    defaultValue: T[] = []
  ): Promise<T[]> {
    try {
      const key = `gamelife_${module}_${userId}`
      
      // 先檢查快取
      const cached = this.getCache<T>(key)
      if (cached) {
        console.log(`⚡ 從快取載入 ${module}:`, cached.length, '筆')
        return cached
      }
      
      // 從 LocalStorage 載入
      const localData = localStorage.getItem(key)
      
      if (localData) {
        const parsed = JSON.parse(localData)
        this.setCache(key, parsed) // 存入快取
        console.log(`✅ 載入 ${module} 資料:`, parsed.length, '筆')
        return parsed
      }
      
      console.log(`ℹ️ ${module} 無資料，返回預設值`)
      return defaultValue
    } catch (error) {
      console.error(`❌ 載入 ${module} 失敗:`, error)
      return defaultValue
    }
  }

  /**
   * 儲存模組資料
   */
  static async saveData<T>(
    module: string,
    userId: string,
    data: T[]
  ): Promise<ApiResponse<T[]>> {
    try {
      const key = `gamelife_${module}_${userId}`
      const timestamp = new Date().toISOString()
      
      // 為每筆資料加上更新時間
      const dataWithTimestamp = data.map((item: any) => ({
        ...item,
        updatedAt: item.updatedAt || timestamp,
        syncStatus: 'local' as const
      }))
      
      localStorage.setItem(key, JSON.stringify(dataWithTimestamp))
      
      // 清除快取，確保下次載入最新資料
      this.clearCache(module, userId)
      
      // 記錄同步狀態（保留給未來雲端同步用）
      this.markForSync(module, userId)
      
      console.log(`✅ 儲存 ${module} 成功:`, data.length, '筆')
      return {
        success: true,
        data: dataWithTimestamp,
        message: `成功儲存 ${data.length} 筆資料`
      }
    } catch (error) {
      console.error(`❌ 儲存 ${module} 失敗:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '儲存失敗'
      }
    }
  }

  /**
   * 取得單筆資料
   */
  static async getById<T extends BaseModel>(
    module: string,
    userId: string,
    id: string
  ): Promise<T | null> {
    try {
      const data = await this.loadData<T>(module, userId)
      return data.find(item => item.id === id) || null
    } catch (error) {
      console.error(`❌ 取得 ${module} ID: ${id} 失敗:`, error)
      return null
    }
  }

  /**
   * 新增單筆資料
   */
  static async create<T extends BaseModel>(
    module: string,
    userId: string,
    newItem: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<T>> {
    try {
      const data = await this.loadData<T>(module, userId)
      const timestamp = new Date().toISOString()
      
      const item = {
        ...newItem,
        id: this.generateId(),
        userId,
        createdAt: timestamp,
        updatedAt: timestamp,
        syncStatus: 'local' as const
      } as T
      
      data.push(item)
      const result = await this.saveData(module, userId, data)
      
      return {
        success: result.success,
        data: item,
        message: '新增成功'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '新增失敗'
      }
    }
  }

  /**
   * 更新單筆資料
   */
  static async update<T extends BaseModel>(
    module: string,
    userId: string,
    id: string,
    updates: Partial<T>
  ): Promise<ApiResponse<T>> {
    try {
      const data = await this.loadData<T>(module, userId)
      const index = data.findIndex(item => item.id === id)
      
      if (index === -1) {
        return {
          success: false,
          error: '找不到該資料'
        }
      }
      
      const timestamp = new Date().toISOString()
      data[index] = {
        ...data[index],
        ...updates,
        updatedAt: timestamp,
        syncStatus: 'local' as const
      }
      
      await this.saveData(module, userId, data)
      
      return {
        success: true,
        data: data[index],
        message: '更新成功'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新失敗'
      }
    }
  }

  /**
   * 刪除單筆資料
   */
  static async delete<T extends BaseModel>(
    module: string,
    userId: string,
    id: string
  ): Promise<ApiResponse<void>> {
    try {
      const data = await this.loadData<T>(module, userId)
      const filtered = data.filter(item => item.id !== id)
      
      if (data.length === filtered.length) {
        return {
          success: false,
          error: '找不到該資料'
        }
      }
      
      await this.saveData(module, userId, filtered)
      
      return {
        success: true,
        message: '刪除成功'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '刪除失敗'
      }
    }
  }

  /**
   * 批量操作
   */
  static async bulkOperation<T extends BaseModel>(
    module: string,
    userId: string,
    operation: BulkOperation<T>
  ): Promise<ApiResponse<void>> {
    try {
      const data = await this.loadData<T>(module, userId)
      let updatedData = [...data]
      
      switch (operation.action) {
        case 'delete':
          updatedData = data.filter(item => !operation.ids.includes(item.id))
          break
          
        case 'update':
          if (operation.data) {
            const timestamp = new Date().toISOString()
            updatedData = data.map(item => 
              operation.ids.includes(item.id)
                ? { ...item, ...operation.data, updatedAt: timestamp }
                : item
            )
          }
          break
          
        case 'archive':
          const timestamp = new Date().toISOString()
          updatedData = data.map(item => 
            operation.ids.includes(item.id)
              ? { ...item, archived: true, updatedAt: timestamp }
              : item
          )
          break
      }
      
      await this.saveData(module, userId, updatedData)
      
      return {
        success: true,
        message: `批量${operation.action}成功: ${operation.ids.length} 筆`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量操作失敗'
      }
    }
  }

  /**
   * 查詢資料
   */
  static async query<T extends BaseModel>(
    module: string,
    userId: string,
    params: QueryParams = {}
  ): Promise<T[]> {
    try {
      let data = await this.loadData<T>(module, userId)
      
      // 搜尋過濾
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        data = data.filter(item => 
          JSON.stringify(item).toLowerCase().includes(searchLower)
        )
      }
      
      // 自定義過濾
      if (params.filter) {
        data = data.filter(item => {
          return Object.entries(params.filter!).every(([key, value]) => {
            return (item as any)[key] === value
          })
        })
      }
      
      // 排序
      if (params.sortBy) {
        data.sort((a, b) => {
          const aVal = (a as any)[params.sortBy!]
          const bVal = (b as any)[params.sortBy!]
          if (params.sort === 'desc') {
            return bVal > aVal ? 1 : -1
          }
          return aVal > bVal ? 1 : -1
        })
      }
      
      // 分頁
      if (params.page && params.limit) {
        const start = (params.page - 1) * params.limit
        const end = start + params.limit
        data = data.slice(start, end)
      }
      
      return data
    } catch (error) {
      console.error(`❌ 查詢 ${module} 失敗:`, error)
      return []
    }
  }

  /**
   * 標記需要同步
   */
  private static markForSync(module: string, userId: string): void {
    const syncKey = 'gamelife_pending_sync'
    const pending = localStorage.getItem(syncKey)
    const syncList = pending ? JSON.parse(pending) : []
    
    const syncItem = `${module}_${userId}`
    if (!syncList.includes(syncItem)) {
      syncList.push(syncItem)
      localStorage.setItem(syncKey, JSON.stringify(syncList))
    }
  }

  /**
   * 產生唯一 ID
   */
  private static generateId(): string {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substr(2, 9)
    const counter = (this.idCounter = (this.idCounter || 0) + 1)
    return `${timestamp}_${randomStr}_${counter}`
  }
  
  private static idCounter = 0

  /**
   * 取得同步狀態
   */
  static getSyncStatus(): { module: string, userId: string }[] {
    const syncKey = 'gamelife_pending_sync'
    const pending = localStorage.getItem(syncKey)
    if (!pending) return []
    
    const syncList = JSON.parse(pending)
    return syncList.map((item: string) => {
      const [module, userId] = item.split('_')
      return { module, userId }
    })
  }

  /**
   * 清除同步狀態
   */
  static clearSyncStatus(): void {
    localStorage.removeItem('gamelife_pending_sync')
  }

  /**
   * 清除指定用戶的所有資料
   */
  static clearAllData(userId: string): void {
    const modules = ['todos', 'projects', 'timebox', 'settings', 'users', 'groups', 'receipts', 'invoices', 'orders']
    modules.forEach(module => {
      const key = `gamelife_${module}_${userId}`
      localStorage.removeItem(key)
    })
    this.clearCache() // 清除所有快取
    console.log(`🗑️ 已清除用戶 ${userId} 的所有資料`)
  }

  /**
   * 取得資料統計
   */
  static getDataStats(userId: string): Record<string, number> {
    const stats: Record<string, number> = {}
    const modules = ['todos', 'projects', 'timebox', 'settings', 'users', 'groups', 'receipts', 'invoices', 'orders']
    
    modules.forEach(module => {
      const key = `gamelife_${module}_${userId}`
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          stats[module] = Array.isArray(parsed) ? parsed.length : 0
        } catch {
          stats[module] = 0
        }
      } else {
        stats[module] = 0
      }
    })
    
    return stats
  }

  /**
   * 匯出所有資料（備份用）
   */
  static exportAllData(userId: string): string {
    const exportData: Record<string, any> = {
      userId,
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {}
    }
    
    const modules = ['todos', 'projects', 'timebox', 'settings', 'users', 'groups', 'receipts', 'invoices', 'orders']
    
    modules.forEach(module => {
      const key = `gamelife_${module}_${userId}`
      const data = localStorage.getItem(key)
      if (data) {
        try {
          exportData.data[module] = JSON.parse(data)
        } catch {
          exportData.data[module] = []
        }
      }
    })
    
    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 匯入資料（還原用）
   */
  static importData(jsonString: string, userId: string): ApiResponse<void> {
    try {
      const importData = JSON.parse(jsonString)
      
      if (!importData.data) {
        return {
          success: false,
          error: '無效的匯入格式'
        }
      }
      
      Object.entries(importData.data).forEach(([module, data]) => {
        const key = `gamelife_${module}_${userId}`
        localStorage.setItem(key, JSON.stringify(data))
      })
      
      this.clearCache() // 清除快取
      
      return {
        success: true,
        message: '資料匯入成功'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '匯入失敗'
      }
    }
  }
}

// 匯出類型
export type { BaseAPI as API }
