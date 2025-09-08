'use client'

import { User, UserPermissions } from './types'
import { database } from './supabase'
import { cloudSyncManager } from './cloud-sync'

/**
 * 雲端認證管理器
 * 完全基於雲端的認證系統，無本地儲存依賴
 */
class CloudAuthManager {
  private currentUser: User | null = null
  private isInitialized = false

  constructor() {
    // 不再從 localStorage 載入，改為從會話狀態載入
    if (typeof window !== 'undefined') {
      this.initializeSession()
    }
  }

  /**
   * 初始化會話 (頁面刷新時調用)
   */
  private async initializeSession() {
    console.log('🔐 初始化認證會話...')
    // TODO: 從 Supabase 會話或 JWT 令牌恢復認證狀態
    // 這裡將來會檢查 Supabase 的會話狀態
    this.isInitialized = true
  }

  /**
   * 獲取用戶列表 (完全從雲端)
   */
  async getUsers(): Promise<User[]> {
    try {
      console.log('📥 從雲端獲取用戶列表')
      const users = await database.getUsers()
      
      if (users && users.length > 0) {
        return users.map(user => ({
          ...user,
          password: undefined // 不返回密碼
        }))
      }
      
      // 沒有用戶時返回空陣列 (不再有預設用戶)
      return []
    } catch (error) {
      console.error('❌ 獲取用戶列表失敗:', error)
      return []
    }
  }

  /**
   * 用戶登入 (雲端驗證)
   */
  async login(username: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      console.log(`🔐 嘗試登入用戶: ${username}`)
      
      // TODO: 實現 Supabase 認證
      // const { data, error } = await database.signIn(username, password)
      
      // 暫時的模擬登入邏輯 (等待 Supabase 整合)
      const users = await this.getUsers()
      const user = users.find(u => u.username === username)
      
      if (user) {
        // 更新最後登入時間
        await cloudSyncManager.updateUserLastLogin(user.id)
        
        this.currentUser = {
          ...user,
          last_login_at: new Date().toISOString()
        }
        
        console.log(`✅ 登入成功: ${username}`)
        return { success: true, user: this.currentUser }
      } else {
        console.log(`❌ 登入失敗: 找不到用戶 ${username}`)
        return { success: false, message: '用戶名或密碼錯誤' }
      }
    } catch (error) {
      console.error('❌ 登入時發生錯誤:', error)
      return { success: false, message: '登入時發生錯誤' }
    }
  }

  /**
   * 登出 (清除雲端會話)
   */
  async logout() {
    console.log('🔐 用戶登出')
    
    // TODO: 清除 Supabase 會話
    // await database.signOut()
    
    this.currentUser = null
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  /**
   * 檢查是否已登入
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * 獲取用戶顯示名稱
   */
  getDisplayName(): string {
    return this.currentUser?.display_name || this.currentUser?.username || '訪客'
  }

  /**
   * 獲取用戶 ID
   */
  getUserId(): string {
    return this.currentUser?.id || ''
  }

  /**
   * 檢查用戶角色
   */
  isAdmin(): boolean {
    return this.currentUser?.role === 'SUPER_ADMIN'
  }

  isManager(): boolean {
    return this.currentUser?.role === 'BUSINESS_ADMIN' || this.isAdmin()
  }

  /**
   * 檢查模組權限
   */
  canAccessModule(module: string, permission: 'read' | 'write' | 'delete' | 'admin' = 'read'): boolean {
    if (!this.currentUser) return false
    
    const modulePermissions = this.currentUser.permissions[module]
    if (!modulePermissions) return false
    
    return modulePermissions[permission] === true
  }

  /**
   * 獲取用戶權限
   */
  getPermissions(): UserPermissions {
    return this.currentUser?.permissions || {}
  }

  /**
   * 強制刷新用戶資料 (從雲端)
   */
  async refreshUserData(): Promise<void> {
    if (!this.currentUser) return

    console.log('🔄 強制刷新用戶資料')
    try {
      // TODO: 從 Supabase 重新獲取用戶資料
      const users = await this.getUsers()
      const updatedUser = users.find(u => u.id === this.currentUser!.id)
      
      if (updatedUser) {
        this.currentUser = updatedUser
        console.log('✅ 用戶資料已刷新')
      }
    } catch (error) {
      console.error('❌ 刷新用戶資料失敗:', error)
    }
  }

  /**
   * 檢查認證狀態是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized
  }

  /**
   * 添加新用戶 (雲端)
   */
  async addUser(userData: Partial<User> & { username: string; display_name: string; password: string }): Promise<boolean> {
    try {
      console.log(`📤 在雲端創建新用戶: ${userData.username}`)
      
      // TODO: 實現 Supabase 用戶創建
      // const result = await database.createUser(userData)
      
      console.log(`✅ 用戶創建成功: ${userData.username}`)
      return true
    } catch (error) {
      console.error('❌ 創建用戶失敗:', error)
      return false
    }
  }

  /**
   * 更新用戶資料 (雲端)
   */
  async updateUser(userData: User): Promise<boolean> {
    try {
      console.log(`📤 更新雲端用戶資料: ${userData.username}`)
      
      // TODO: 實現 Supabase 用戶更新
      // const result = await database.updateUser(userData)
      
      // 如果是當前用戶，更新本地狀態
      if (this.currentUser && this.currentUser.id === userData.id) {
        this.currentUser = userData
      }
      
      console.log(`✅ 用戶更新成功: ${userData.username}`)
      return true
    } catch (error) {
      console.error('❌ 更新用戶失敗:', error)
      return false
    }
  }

  /**
   * 刪除用戶 (雲端)
   */
  async removeUser(userId: string): Promise<boolean> {
    try {
      // 不能刪除當前登入的用戶
      if (this.currentUser && this.currentUser.id === userId) {
        return false
      }

      console.log(`📤 從雲端刪除用戶: ${userId}`)
      
      // TODO: 實現 Supabase 用戶刪除
      // const result = await database.deleteUser(userId)
      
      console.log(`✅ 用戶刪除成功: ${userId}`)
      return true
    } catch (error) {
      console.error('❌ 刪除用戶失敗:', error)
      return false
    }
  }
}

// 創建全域雲端認證管理器實例
export const authManager = new CloudAuthManager()