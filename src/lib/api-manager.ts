/**
 * API 管理器 - 統一管理所有 API 模組
 * 提供集中式的資料存取介面
 */

import { BaseAPI } from './base-api'
import { ProjectAPI } from './api/ProjectAPI'
import { StatusTodoAPI } from './api/StatusTodoAPI'
import { localAuth } from './local-auth'

// API 管理器類別
class VenturoAPI {
  // 核心 API
  base = BaseAPI
  auth = localAuth
  
  // 功能模組
  projects = ProjectAPI
  todos = StatusTodoAPI
  
  /**
   * 取得當前使用者 ID
   */
  getCurrentUserId = (): string | null => {
    const user = this.auth.getCurrentUser()
    return user?.id || null
  }
  
  /**
   * 檢查是否已認證
   */
  isAuthenticated = (): boolean => {
    return this.auth.isAuthenticated()
  }
  
  /**
   * 清除所有快取
   */
  clearAllCache = (): void => {
    BaseAPI.clearCache()
    console.log('✨ 已清除所有快取')
  }
  
  /**
   * 取得儲存空間統計
   */
  getStorageStats = () => {
    const userId = this.getCurrentUserId()
    if (!userId) {
      return {
        used: 0,
        modules: {},
        percentage: 0
      }
    }
    
    // 計算使用的儲存空間
    let totalSize = 0
    const modules: Record<string, number> = {}
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('venturo_') || key?.startsWith('gamelife_')) {
          const value = localStorage.getItem(key) || ''
          const size = new Blob([value]).size
          totalSize += size
          
          // 分類統計
          const match = key.match(/(?:venturo|gamelife)_(\w+)_/)
          if (match) {
            const moduleName = match[1]
            modules[moduleName] = (modules[moduleName] || 0) + size
          }
        }
      }
    } catch (error) {
      console.error('計算儲存空間時發生錯誤:', error)
    }
    
    // 假設 localStorage 最大 10MB
    const maxSize = 10 * 1024 * 1024
    const percentage = (totalSize / maxSize) * 100
    
    return {
      used: totalSize,
      modules,
      percentage: Math.round(percentage * 100) / 100
    }
  }
  
  /**
   * 初始化 API 系統
   */
  init = (): void => {
    try {
      console.log('🚀 Venturo API 系統初始化')
      console.log('📦 模式：完全本地化')
      console.log('💾 儲存：LocalStorage')
      
      // 檢查認證狀態
      if (this.isAuthenticated()) {
        const user = this.auth.getCurrentUser()
        console.log('👤 當前使用者：', user?.display_name)
      } else {
        console.log('🔓 未登入狀態')
      }
      
      // 顯示儲存統計
      const stats = this.getStorageStats()
      console.log(`📊 儲存使用率：${stats.percentage}%`)
    } catch (error) {
      console.error('初始化時發生錯誤:', error)
    }
  }
  
  /**
   * 資料備份
   */
  backup = (): string | null => {
    const userId = this.getCurrentUserId()
    if (!userId) {
      console.error('❌ 無法備份：使用者未登入')
      return null
    }
    
    try {
      const backupData = BaseAPI.exportAllData(userId)
      const blob = new Blob([backupData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // 建立下載連結
      const a = document.createElement('a')
      a.href = url
      a.download = `venturo_backup_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      
      URL.revokeObjectURL(url)
      console.log('✅ 資料備份完成')
      
      return backupData
    } catch (error) {
      console.error('備份失敗:', error)
      return null
    }
  }
  
  /**
   * 資料還原
   */
  restore = (jsonData: string): boolean => {
    const userId = this.getCurrentUserId()
    if (!userId) {
      console.error('❌ 無法還原：使用者未登入')
      return false
    }
    
    try {
      const result = BaseAPI.importData(jsonData, userId)
      if (result.success) {
        console.log('✅ 資料還原成功')
        this.clearAllCache()
        return true
      } else {
        console.error('❌ 資料還原失敗：', result.error)
        return false
      }
    } catch (error) {
      console.error('還原失敗:', error)
      return false
    }
  }
  
  /**
   * 開發工具：顯示所有資料
   */
  debug = (): void => {
    if (process.env.NODE_ENV !== 'development') return
    
    try {
      console.group('🔍 Venturo Debug Info')
      
      // 使用者資訊
      const user = this.auth.getCurrentUser()
      console.log('使用者：', user)
      
      // 儲存統計
      const stats = this.getStorageStats()
      console.log('儲存統計：', stats)
      
      // 所有 LocalStorage 資料
      const venturoData: Record<string, any> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('venturo_') || key?.startsWith('gamelife_')) {
          try {
            venturoData[key] = JSON.parse(localStorage.getItem(key) || '{}')
          } catch {
            venturoData[key] = localStorage.getItem(key)
          }
        }
      }
      console.log('所有資料：', venturoData)
      
      console.groupEnd()
    } catch (error) {
      console.error('Debug 錯誤:', error)
    }
  }
}

// 建立單例
const api = new VenturoAPI()

// 開發模式下掛載到 window
if (typeof window !== 'undefined') {
  (window as any).venturoAPI = api
  
  // 延遲初始化，避免 DOM 未準備好
  if (process.env.NODE_ENV === 'development') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        try {
          api.init()
        } catch (error) {
          console.error('API 初始化失敗:', error)
        }
      })
    } else {
      // DOM 已經載入完成
      setTimeout(() => {
        try {
          api.init()
        } catch (error) {
          console.error('API 初始化失敗:', error)
        }
      }, 0)
    }
  }
}

export default api
export { api as venturoAPI }

// 匯出類型定義
export interface APIManager {
  base: typeof BaseAPI
  auth: typeof localAuth
  projects: typeof ProjectAPI
  todos: typeof StatusTodoAPI
  getCurrentUserId(): string | null
  isAuthenticated(): boolean
  clearAllCache(): void
  getStorageStats(): {
    used: number
    modules: Record<string, number>
    percentage: number
  }
  init(): void
  backup(): string | null
  restore(jsonData: string): boolean
  debug(): void
}
