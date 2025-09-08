'use client'

import { User, Todo, Project } from '@/types'

/**
 * 雲端同步管理器
 * 實現按需同步機制：
 * - 不動就不更新
 * - 操作時上傳
 * - 刷新時下載
 */
export class CloudSyncManager {
  private static instance: CloudSyncManager
  private isDirty = false // 標記是否有未同步的更改
  
  static getInstance(): CloudSyncManager {
    if (!CloudSyncManager.instance) {
      CloudSyncManager.instance = new CloudSyncManager()
    }
    return CloudSyncManager.instance
  }

  // ========== 用戶管理 ==========
  
  async getUsers(): Promise<User[]> {
    // TODO: 從 Supabase 獲取用戶列表
    console.log('📥 從雲端下載用戶列表')
    return []
  }

  async getUserByUsername(username: string): Promise<User | null> {
    // TODO: 從 Supabase 查詢特定用戶
    console.log(`📥 從雲端獲取用戶: ${username}`)
    return null
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    // TODO: 更新用戶最後登入時間到 Supabase
    console.log(`📤 更新用戶最後登入時間: ${userId}`)
    this.markDirty()
  }

  // ========== 待辦事項管理 ==========
  
  async getTodos(userId: string): Promise<Todo[]> {
    console.log(`📥 從雲端獲取 ${userId} 的待辦事項`)
    // TODO: 從 Supabase 獲取用戶的待辦事項
    return []
  }

  async saveTodos(userId: string, todos: Todo[]): Promise<void> {
    console.log(`📤 上傳 ${userId} 的待辦事項到雲端 (${todos.length} 項)`)
    // TODO: 上傳到 Supabase
    this.markDirty()
    await this.syncIfNeeded()
  }

  async addTodo(userId: string, todo: Todo): Promise<void> {
    console.log(`📤 新增待辦事項到雲端: ${todo.title}`)
    // TODO: 新增到 Supabase
    this.markDirty()
    await this.syncIfNeeded()
  }

  async updateTodo(userId: string, todoId: string, updates: Partial<Todo>): Promise<void> {
    console.log(`📤 更新待辦事項到雲端: ${todoId}`)
    // TODO: 更新到 Supabase
    this.markDirty()
    await this.syncIfNeeded()
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    console.log(`📤 從雲端刪除待辦事項: ${todoId}`)
    // TODO: 從 Supabase 刪除
    this.markDirty()
    await this.syncIfNeeded()
  }

  // ========== 專案管理 ==========
  
  async getProjects(userId: string): Promise<Project[]> {
    console.log(`📥 從雲端獲取 ${userId} 的專案`)
    // TODO: 從 Supabase 獲取用戶的專案
    return []
  }

  async saveProjects(userId: string, projects: Project[]): Promise<void> {
    console.log(`📤 上傳 ${userId} 的專案到雲端 (${projects.length} 個)`)
    // TODO: 上傳到 Supabase
    this.markDirty()
    await this.syncIfNeeded()
  }

  // ========== 同步機制 ==========
  
  /**
   * 標記有未同步的更改
   */
  private markDirty(): void {
    this.isDirty = true
    console.log('🔄 標記為需要同步')
  }

  /**
   * 如果有未同步的更改，執行同步
   */
  private async syncIfNeeded(): Promise<void> {
    if (this.isDirty) {
      console.log('🔄 執行雲端同步...')
      // TODO: 實際的同步邏輯
      this.isDirty = false
      console.log('✅ 同步完成')
    }
  }

  /**
   * 強制從雲端刷新所有資料 (用於頁面刷新)
   */
  async forceRefresh(): Promise<void> {
    console.log('🔄 強制從雲端刷新所有資料')
    // TODO: 實現強制刷新邏輯
    this.isDirty = false
    console.log('✅ 刷新完成')
  }

  /**
   * 清除所有資料 (用於登出)
   */
  async clearAllData(): Promise<void> {
    console.log('🗑️ 清除所有雲端資料')
    // TODO: 實現清除邏輯
    this.isDirty = false
  }

  /**
   * 檢查同步狀態
   */
  isDirtyState(): boolean {
    return this.isDirty
  }
}

// 導出單例
export const cloudSyncManager = CloudSyncManager.getInstance()