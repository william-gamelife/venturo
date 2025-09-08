import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

/**
 * iCloud 資料管理器
 * 將用戶資料存儲在 iCloud Drive 中，實現跨設備同步
 */

export class iCloudDataManager {
  private icloudPath: string
  private userDataPath: string

  constructor() {
    // iCloud Drive 路徑
    this.icloudPath = path.join(
      os.homedir(),
      'Library',
      'Mobile Documents', 
      'com~apple~CloudDocs',
      'Dev-Projects',
      'GameLife'
    )
    
    // 用戶資料路徑
    this.userDataPath = path.join(this.icloudPath, 'user-data')
  }

  /**
   * 確保資料夾存在
   */
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.userDataPath, { recursive: true })
    } catch (error) {
      console.warn('無法創建 iCloud 資料夾，切換到本地儲存', error)
      throw error
    }
  }

  /**
   * 讀取資料檔案
   */
  private async readDataFile<T>(filename: string, defaultValue: T): Promise<T> {
    try {
      await this.ensureDataDirectory()
      const filePath = path.join(this.userDataPath, filename)
      const data = await fs.readFile(filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      // 檔案不存在或讀取失敗，返回預設值
      return defaultValue
    }
  }

  /**
   * 寫入資料檔案
   */
  private async writeDataFile<T>(filename: string, data: T): Promise<void> {
    try {
      await this.ensureDataDirectory()
      const filePath = path.join(this.userDataPath, filename)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    } catch (error) {
      console.error('寫入 iCloud 資料失敗:', error)
      throw error
    }
  }

  /**
   * 檢查 iCloud 是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureDataDirectory()
      return true
    } catch {
      return false
    }
  }

  // === 待辦事項 ===
  async getTodos(userId: string): Promise<any[]> {
    return await this.readDataFile(`todos_${userId}.json`, [])
  }

  async saveTodos(userId: string, todos: any[]): Promise<void> {
    await this.writeDataFile(`todos_${userId}.json`, todos)
  }

  // === 專案 ===
  async getProjects(userId: string): Promise<any[]> {
    return await this.readDataFile(`projects_${userId}.json`, [])
  }

  async saveProjects(userId: string, projects: any[]): Promise<void> {
    await this.writeDataFile(`projects_${userId}.json`, projects)
  }

  // === 時間盒 ===
  async getTimeboxData(userId: string): Promise<any> {
    return await this.readDataFile(`timebox_${userId}.json`, {
      sessions: [],
      settings: {}
    })
  }

  async saveTimeboxData(userId: string, data: any): Promise<void> {
    await this.writeDataFile(`timebox_${userId}.json`, data)
  }

  // === 設定 ===
  async getSettings(userId: string): Promise<any> {
    return await this.readDataFile(`settings_${userId}.json`, {})
  }

  async saveSettings(userId: string, settings: any): Promise<void> {
    await this.writeDataFile(`settings_${userId}.json`, settings)
  }

  // === 備份與還原 ===
  async createBackup(userId: string): Promise<void> {
    const backupData = {
      timestamp: new Date().toISOString(),
      todos: await this.getTodos(userId),
      projects: await this.getProjects(userId),
      timebox: await this.getTimeboxData(userId),
      settings: await this.getSettings(userId)
    }

    const backupFilename = `backup_${userId}_${Date.now()}.json`
    await this.writeDataFile(backupFilename, backupData)
  }

  /**
   * 遷移 localStorage 資料到 iCloud
   */
  async migrateFromLocalStorage(userId: string): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // 遷移待辦事項
      const todosKey = `gamelife_todos_${userId}`
      const localTodos = localStorage.getItem(todosKey)
      if (localTodos) {
        await this.saveTodos(userId, JSON.parse(localTodos))
        localStorage.removeItem(todosKey)
      }

      // 遷移專案
      const projectsKey = `gamelife_projects_${userId}`
      const localProjects = localStorage.getItem(projectsKey)
      if (localProjects) {
        await this.saveProjects(userId, JSON.parse(localProjects))
        localStorage.removeItem(projectsKey)
      }

      // 遷移設定
      const settingsKey = `gamelife_sidebar_order_${userId}`
      const localSettings = localStorage.getItem(settingsKey)
      if (localSettings) {
        await this.saveSettings(userId, { sidebarOrder: JSON.parse(localSettings) })
        localStorage.removeItem(settingsKey)
      }

      console.log('✅ localStorage 資料已遷移到 iCloud')
    } catch (error) {
      console.error('❌ 資料遷移失敗:', error)
    }
  }

  /**
   * 獲取 iCloud 同步狀態
   */
  async getSyncStatus(): Promise<{
    available: boolean
    path: string
    lastSync?: string
  }> {
    const available = await this.isAvailable()
    return {
      available,
      path: this.userDataPath,
      lastSync: available ? new Date().toISOString() : undefined
    }
  }
}

// 單例實例
export const icloudDataManager = new iCloudDataManager()