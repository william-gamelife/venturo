/**
 * 文件同步管理器
 * 支援靜態 HTML 版本的 iCloud 檔案同步
 */

export class FileSyncManager {
  private syncEnabled: boolean = false
  private syncDirectory: string = 'gamelife-data'
  
  constructor() {
    this.checkSyncSupport()
  }

  /**
   * 檢查是否支援檔案同步
   */
  private checkSyncSupport(): void {
    // 檢查 File System Access API 支援
    this.syncEnabled = 'showDirectoryPicker' in window
  }

  /**
   * 選擇同步目錄 (用戶手動選擇 iCloud Drive 資料夾)
   */
  async selectSyncDirectory(): Promise<boolean> {
    if (!this.syncEnabled) {
      alert('您的瀏覽器不支援檔案同步功能，請使用 Chrome 或 Edge')
      return false
    }

    try {
      // @ts-ignore - File System Access API
      const directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      })
      
      // 儲存目錄控制代碼
      localStorage.setItem('gamelife_sync_directory', JSON.stringify({
        name: directoryHandle.name,
        kind: directoryHandle.kind
      }))
      
      // 儲存實際的控制代碼 (使用 IndexedDB)
      await this.storeDirHandle(directoryHandle)
      
      return true
    } catch (error) {
      console.error('選擇同步目錄失敗:', error)
      return false
    }
  }

  /**
   * 儲存目錄控制代碼到 IndexedDB
   */
  private async storeDirHandle(directoryHandle: any): Promise<void> {
    const request = indexedDB.open('gamelife-sync', 1)
    
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['directories'], 'readwrite')
        const store = transaction.objectStore('directories')
        
        store.put(directoryHandle, 'main-directory')
        transaction.oncomplete = () => resolve()
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        db.createObjectStore('directories')
      }
    })
  }

  /**
   * 取得目錄控制代碼
   */
  private async getDirHandle(): Promise<any> {
    const request = indexedDB.open('gamelife-sync', 1)
    
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['directories'], 'readonly')
        const store = transaction.objectStore('directories')
        const getRequest = store.get('main-directory')
        
        getRequest.onsuccess = () => resolve(getRequest.result)
        getRequest.onerror = () => reject(getRequest.error)
      }
    })
  }

  /**
   * 同步資料到檔案
   */
  async syncToFile(filename: string, data: any): Promise<boolean> {
    if (!this.syncEnabled) return false
    
    try {
      const directoryHandle = await this.getDirHandle()
      if (!directoryHandle) return false
      
      // 創建/獲取檔案
      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true })
      const writable = await fileHandle.createWritable()
      
      // 寫入資料
      await writable.write(JSON.stringify(data, null, 2))
      await writable.close()
      
      return true
    } catch (error) {
      console.error(`同步檔案 ${filename} 失敗:`, error)
      return false
    }
  }

  /**
   * 從檔案讀取資料
   */
  async readFromFile(filename: string): Promise<any | null> {
    if (!this.syncEnabled) return null
    
    try {
      const directoryHandle = await this.getDirHandle()
      if (!directoryHandle) return null
      
      const fileHandle = await directoryHandle.getFileHandle(filename)
      const file = await fileHandle.getFile()
      const content = await file.text()
      
      return JSON.parse(content)
    } catch (error) {
      // 檔案不存在或讀取失敗
      return null
    }
  }

  /**
   * 檢查同步狀態
   */
  async getSyncStatus(): Promise<{
    enabled: boolean
    directory?: string
    lastSync?: string
  }> {
    const syncInfo = localStorage.getItem('gamelife_sync_directory')
    
    return {
      enabled: this.syncEnabled,
      directory: syncInfo ? JSON.parse(syncInfo).name : undefined,
      lastSync: localStorage.getItem('gamelife_last_sync') || undefined
    }
  }

  /**
   * 自動同步 (定期檢查檔案變更)
   */
  startAutoSync(interval: number = 30000): () => void {
    if (!this.syncEnabled) return () => {}
    
    const syncInterval = setInterval(async () => {
      // 這裡可以實作自動檢查和同步邏輯
      console.log('執行自動同步檢查...')
    }, interval)
    
    return () => clearInterval(syncInterval)
  }
}

/**
 * 混合資料管理器 - 結合 localStorage 和檔案同步
 */
export class HybridDataManager {
  private fileSyncManager: FileSyncManager
  private syncEnabled: boolean = false
  
  constructor() {
    this.fileSyncManager = new FileSyncManager()
    this.initializeSync()
  }

  private async initializeSync(): Promise<void> {
    const status = await this.fileSyncManager.getSyncStatus()
    this.syncEnabled = status.enabled && !!status.directory
  }

  /**
   * 設置檔案同步
   */
  async setupFileSync(): Promise<boolean> {
    const success = await this.fileSyncManager.selectSyncDirectory()
    if (success) {
      this.syncEnabled = true
      alert('✅ 檔案同步已啟用！\n資料將自動儲存到您選擇的 iCloud Drive 資料夾')
    }
    return success
  }

  /**
   * 儲存資料 (同時儲存到 localStorage 和檔案)
   */
  async saveData(type: string, userId: string, data: any): Promise<void> {
    // 總是儲存到 localStorage
    const key = `gamelife_${type}_${userId}`
    localStorage.setItem(key, JSON.stringify(data))
    
    // 如果啟用檔案同步，也儲存到檔案
    if (this.syncEnabled) {
      const filename = `${type}_${userId}.json`
      const success = await this.fileSyncManager.syncToFile(filename, {
        timestamp: new Date().toISOString(),
        type,
        userId,
        data
      })
      
      if (success) {
        localStorage.setItem('gamelife_last_sync', new Date().toISOString())
      }
    }
  }

  /**
   * 讀取資料 (優先從檔案讀取，fallback 到 localStorage)
   */
  async loadData<T>(type: string, userId: string, defaultValue: T): Promise<T> {
    // 如果啟用檔案同步，優先從檔案讀取
    if (this.syncEnabled) {
      const filename = `${type}_${userId}.json`
      const fileData = await this.fileSyncManager.readFromFile(filename)
      
      if (fileData && fileData.data) {
        // 同時更新 localStorage
        const key = `gamelife_${type}_${userId}`
        localStorage.setItem(key, JSON.stringify(fileData.data))
        return fileData.data
      }
    }
    
    // Fallback 到 localStorage
    const key = `gamelife_${type}_${userId}`
    const localData = localStorage.getItem(key)
    return localData ? JSON.parse(localData) : defaultValue
  }

  /**
   * 同步所有資料
   */
  async syncAllData(userId: string): Promise<void> {
    if (!this.syncEnabled) return
    
    const dataTypes = ['todos', 'projects', 'timebox', 'settings']
    
    for (const type of dataTypes) {
      const key = `gamelife_${type}_${userId}`
      const data = localStorage.getItem(key)
      
      if (data) {
        const filename = `${type}_${userId}.json`
        await this.fileSyncManager.syncToFile(filename, {
          timestamp: new Date().toISOString(),
          type,
          userId,
          data: JSON.parse(data)
        })
      }
    }
    
    localStorage.setItem('gamelife_last_sync', new Date().toISOString())
  }

  /**
   * 檢查同步狀態
   */
  async getSyncStatus() {
    return await this.fileSyncManager.getSyncStatus()
  }
}

export const hybridDataManager = new HybridDataManager()