/**
 * 同步服務
 * 處理離線支援、資料同步、樂觀更新
 */

import type { ApiResponse } from '@/types'

interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  endpoint: string
  data?: any
  timestamp: number
  retries: number
}

/**
 * 同步服務類別
 */
export class SyncService {
  private syncQueue: Map<string, SyncQueueItem>
  private isOnline: boolean
  private syncInterval: NodeJS.Timeout | null = null
  
  constructor() {
    this.syncQueue = new Map()
    this.isOnline = typeof window !== 'undefined' ? navigator.onLine : true
    
    if (typeof window !== 'undefined') {
      this.initializeEventListeners()
      this.loadQueueFromStorage()
      this.startSyncWorker()
    }
  }
  
  /**
   * 初始化事件監聽
   */
  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('🟢 網路已連線，開始同步...')
      this.isOnline = true
      this.processQueue()
    })
    
    window.addEventListener('offline', () => {
      console.log('🔴 網路已斷線，切換到離線模式')
      this.isOnline = false
    })
  }
  
  /**
   * 從 localStorage 載入隊列
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem('venturo_sync_queue')
      if (stored) {
        const items: SyncQueueItem[] = JSON.parse(stored)
        items.forEach(item => {
          this.syncQueue.set(item.id, item)
        })
        console.log(`📥 載入 ${items.length} 個待同步項目`)
      }
    } catch (error) {
      console.error('載入同步隊列失敗:', error)
    }
  }
  
  /**
   * 保存隊列到 localStorage
   */
  private saveQueueToStorage(): void {
    try {
      const items = Array.from(this.syncQueue.values())
      localStorage.setItem('venturo_sync_queue', JSON.stringify(items))
    } catch (error) {
      console.error('保存同步隊列失敗:', error)
    }
  }
  
  /**
   * 開始同步工作器
   */
  private startSyncWorker(): void {
    // 每 30 秒檢查並同步
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.size > 0) {
        this.processQueue()
      }
    }, 30000)
  }
  
  /**
   * 停止同步工作器
   */
  stopSyncWorker(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
  
  /**
   * 添加到同步隊列
   */
  addToQueue(item: Omit<SyncQueueItem, 'timestamp' | 'retries'>): void {
    const queueItem: SyncQueueItem = {
      ...item,
      timestamp: Date.now(),
      retries: 0
    }
    
    this.syncQueue.set(item.id, queueItem)
    this.saveQueueToStorage()
    
    // 如果在線，立即嘗試同步
    if (this.isOnline) {
      this.processQueueItem(queueItem)
    }
  }
  
  /**
   * 處理隊列
   */
  async processQueue(): Promise<void> {
    const items = Array.from(this.syncQueue.values())
      .sort((a, b) => a.timestamp - b.timestamp) // 按時間順序處理
    
    console.log(`🔄 開始處理 ${items.length} 個同步項目`)
    
    for (const item of items) {
      await this.processQueueItem(item)
    }
  }
  
  /**
   * 處理單個隊列項目
   */
  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    try {
      const response = await fetch(item.endpoint, {
        method: item.type === 'delete' ? 'DELETE' : item.type === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: item.data ? JSON.stringify(item.data) : undefined
      })
      
      if (response.ok) {
        // 成功，從隊列移除
        this.syncQueue.delete(item.id)
        this.saveQueueToStorage()
        console.log(`✅ 同步成功: ${item.id}`)
      } else {
        // 失敗，增加重試次數
        item.retries++
        if (item.retries >= 3) {
          // 超過重試次數，移除
          this.syncQueue.delete(item.id)
          console.error(`❌ 同步失敗（已重試 3 次）: ${item.id}`)
        }
      }
    } catch (error) {
      console.error(`同步錯誤 ${item.id}:`, error)
      item.retries++
    }
  }
  
  /**
   * 清除隊列
   */
  clearQueue(): void {
    this.syncQueue.clear()
    this.saveQueueToStorage()
  }
  
  /**
   * 取得隊列狀態
   */
  getQueueStatus(): {
    size: number
    items: SyncQueueItem[]
    isOnline: boolean
  } {
    return {
      size: this.syncQueue.size,
      items: Array.from(this.syncQueue.values()),
      isOnline: this.isOnline
    }
  }
  
  /**
   * 離線儲存
   */
  static saveOffline(key: string, data: any): void {
    const offlineKey = `venturo_offline_${key}`
    localStorage.setItem(offlineKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  }
  
  /**
   * 讀取離線資料
   */
  static loadOffline<T>(key: string): T | null {
    const offlineKey = `venturo_offline_${key}`
    const stored = localStorage.getItem(offlineKey)
    
    if (stored) {
      try {
        const { data } = JSON.parse(stored)
        return data
      } catch {
        return null
      }
    }
    
    return null
  }
  
  /**
   * 清除離線資料
   */
  static clearOffline(key?: string): void {
    if (key) {
      localStorage.removeItem(`venturo_offline_${key}`)
    } else {
      // 清除所有離線資料
      const keys = Object.keys(localStorage)
      keys.forEach(k => {
        if (k.startsWith('venturo_offline_')) {
          localStorage.removeItem(k)
        }
      })
    }
  }
}

// 創建全域實例
export const syncService = new SyncService()

// 預設導出
export default syncService
