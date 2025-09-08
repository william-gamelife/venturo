'use client'

import { User, UserPermissions } from './types'
import { BaseAPI } from './base-api'

/**
 * GAME-T 統一認證管理器 v2.0
 * 
 * 特點:
 * - 清晰的認證流程，無補丁邏輯
 * - 標準化的資料處理
 * - 統一的錯誤處理
 * - 內建的權限管理
 */

// 標準權限配置
const DEFAULT_PERMISSIONS = {
  SUPER_ADMIN: {
    users: { read: true, write: true, delete: true, admin: true },
    todos: { read: true, write: true, delete: true, admin: true, packaging: true },
    projects: { read: true, write: true, delete: true, admin: true },
    calendar: { read: true, write: true, delete: true, admin: true },
    finance: { read: true, write: true, delete: true, admin: true },
    timebox: { read: true, write: true, delete: true, admin: true },
    'life-simulator': { read: true, write: true, delete: true, admin: true },
    'pixel-life': { read: true, write: true, delete: true, admin: true },
    'travel-pdf': { read: true, write: true, delete: true, admin: true },
    themes: { read: true, write: true, delete: true, admin: true },
    sync: { read: true, write: true, delete: true, admin: true },
    settings: { read: true, write: true, delete: true, admin: true }
  },
  BUSINESS_ADMIN: {
    users: { read: false, write: false, delete: false, admin: false },
    todos: { read: true, write: true, delete: true, admin: false, packaging: true },
    projects: { read: true, write: true, delete: true, admin: false },
    calendar: { read: true, write: true, delete: false, admin: false },
    finance: { read: true, write: true, delete: false, admin: false },
    timebox: { read: true, write: true, delete: false, admin: false },
    'life-simulator': { read: true, write: false, delete: false, admin: false },
    'pixel-life': { read: true, write: false, delete: false, admin: false },
    'travel-pdf': { read: false, write: false, delete: false, admin: false },
    themes: { read: true, write: false, delete: false, admin: false },
    sync: { read: false, write: false, delete: false, admin: false },
    settings: { read: false, write: false, delete: false, admin: false }
  },
  GENERAL_USER: {
    users: { read: false, write: false, delete: false, admin: false },
    todos: { read: true, write: true, delete: false, admin: false, packaging: false },
    projects: { read: false, write: false, delete: false, admin: false },
    calendar: { read: true, write: true, delete: false, admin: false },
    finance: { read: false, write: false, delete: false, admin: false },
    timebox: { read: true, write: true, delete: false, admin: false },
    'life-simulator': { read: true, write: false, delete: false, admin: false },
    'pixel-life': { read: true, write: false, delete: false, admin: false },
    'travel-pdf': { read: false, write: false, delete: false, admin: false },
    themes: { read: true, write: false, delete: false, admin: false },
    sync: { read: false, write: false, delete: false, admin: false },
    settings: { read: false, write: false, delete: false, admin: false }
  }
} as const

class AuthManagerV2 {
  private currentUser: User | null = null
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  /**
   * 初始化認證系統
   */
  private async initialize() {
    try {
      console.log('🔐 初始化認證系統 v2.0...')
      
      // 檢查現有 session
      const sessionData = this.getStoredSession()
      if (sessionData) {
        await this.restoreSession(sessionData.userId)
      }
      
      this.isInitialized = true
      console.log('✅ 認證系統初始化完成')
    } catch (error) {
      console.error('❌ 認證系統初始化失敗:', error)
      this.isInitialized = true // 仍然標記為已初始化，避免無限重試
    }
  }

  /**
   * 從 sessionStorage 獲取會話資料
   */
  private getStoredSession(): { userId: string; loginTime: string } | null {
    if (typeof window === 'undefined') return null
    
    try {
      const sessionStr = sessionStorage.getItem('gamelife_session')
      return sessionStr ? JSON.parse(sessionStr) : null
    } catch {
      return null
    }
  }

  /**
   * 恢復會話
   */
  private async restoreSession(userId: string) {
    try {
      // 從本地資料查找用戶
      const users = await BaseAPI.loadData('users', 'system', [])
      const userData = users.find((user: any) => user.id === userId)
      
      if (userData) {
        this.currentUser = this.normalizeLocalUser(userData)
        console.log('✅ 會話恢復成功:', userData.username)
      } else {
        // 會話無效，清除
        console.log('❌ 會話無效，清除 session')
        this.clearSession()
      }
    } catch (error) {
      console.error('❌ 恢復會話失敗:', error)
      this.clearSession()
    }
  }

  /**
   * 標準化用戶資料
   */
  private normalizeUser(rawUser: any): User {
    const role = rawUser.role || 'GENERAL_USER'
    const permissions = rawUser.permissions || DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || {}
    
    return {
      id: rawUser.uuid,
      username: rawUser.username,
      display_name: rawUser.display_name,
      role: role as User['role'],
      permissions,
      title: rawUser.title || '',
      created_at: rawUser.created_at,
      last_login_at: rawUser.last_login_at
    }
  }

  /**
   * 正規化本地用戶資料
   */
  private normalizeLocalUser(rawUser: any): User {
    const role = rawUser.role || 'GENERAL_USER'
    const permissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || DEFAULT_PERMISSIONS.GENERAL_USER
    
    return {
      id: rawUser.id,
      username: rawUser.username,
      display_name: rawUser.display_name || rawUser.username,
      role: role as User['role'],
      permissions,
      title: rawUser.title || '',
      created_at: rawUser.created_at || new Date().toISOString(),
      last_login_at: new Date().toISOString()
    }
  }

  /**
   * 創建預設用戶
   */
  private async createDefaultUser(username: string): Promise<User | null> {
    try {
      const newUser = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        username,
        display_name: username,
        role: 'SUPER_ADMIN', // 簡化版本，預設給最高權限
        title: '系統用戶',
        created_at: new Date().toISOString()
      }

      // 儲存到本地
      const users = await BaseAPI.loadData('users', 'system', [])
      users.push(newUser)
      await BaseAPI.saveData('users', 'system', users)

      return this.normalizeLocalUser(newUser)
    } catch (error) {
      console.error('建立預設用戶失敗:', error)
      return null
    }
  }

  /**
   * 用戶登入
   */
  async login(username: string): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      console.log(`🔐 嘗試登入: ${username}`)
      
      // 從本地資料取得用戶資料
      const users = await BaseAPI.loadData('users', 'system', [])
      const userData = users.find((user: any) => user.username === username)
      
      if (!userData) {
        // 如果用戶不存在，自動建立一個預設用戶
        console.log('👤 用戶不存在，建立新用戶')
        const newUser = await this.createDefaultUser(username)
        if (newUser) {
          this.currentUser = newUser
        } else {
          return { success: false, message: '無法建立用戶' }
        }
      } else {
        // 建立用戶會話
        this.currentUser = this.normalizeLocalUser(userData)
      }
      
      // 存儲會話
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('gamelife_session', JSON.stringify({
          userId: this.currentUser.id,
          loginTime: new Date().toISOString()
        }))
      }
      
      console.log(`✅ 登入成功: ${username}`)
      return { success: true, user: this.currentUser }
      
    } catch (error) {
      console.error('❌ 登入錯誤:', error)
      return { success: false, message: '登入時發生錯誤' }
    }
  }

  /**
   * 用戶登出
   */
  async logout(): Promise<void> {
    console.log('🔐 用戶登出')
    
    this.currentUser = null
    this.clearSession()
    
    // 重定向到首頁
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  /**
   * 清除會話
   */
  private clearSession(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('gamelife_session')
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
   * 獲取用戶列表（管理員功能）
   */
  async getUsers(): Promise<User[]> {
    try {
      console.log('📥 從本地存儲獲取用戶列表')
      
      const users = await BaseAPI.loadData('users', 'system', [])
      
      // 如果沒有用戶，創建一些預設用戶
      if (users.length === 0) {
        console.log('👤 沒有用戶，創建預設用戶')
        const defaultUsers = [
          {
            id: 'admin-' + Date.now().toString(36),
            username: 'admin',
            display_name: '管理員',
            role: 'SUPER_ADMIN',
            title: '系統管理員',
            created_at: new Date().toISOString()
          },
          {
            id: 'user-' + Date.now().toString(36),
            username: 'user', 
            display_name: '使用者',
            role: 'GENERAL_USER',
            title: '一般使用者',
            created_at: new Date().toISOString()
          }
        ]
        
        // 儲存預設用戶
        await BaseAPI.saveData('users', 'system', defaultUsers)
        return defaultUsers.map(user => this.normalizeLocalUser(user))
      }
      
      return users.map((user: any) => this.normalizeLocalUser(user))
    } catch (error) {
      console.error('❌ 獲取用戶列表異常:', error)
      return []
    }
  }

  /**
   * 添加新用戶（管理員功能）
   */
  async addUser(userData: Partial<User> & { username: string; display_name: string }): Promise<boolean> {
    try {
      console.log(`📤 創建新用戶: ${userData.username}`)
      
      // 檢查用戶名是否已存在
      const existingUsers = await this.getUsers()
      if (existingUsers.find(u => u.username === userData.username)) {
        console.log(`❌ 用戶名已存在: ${userData.username}`)
        return false
      }
      
      // 使用本地資料管理
      const newUser = {
        id: userData.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
        username: userData.username,
        display_name: userData.display_name,
        role: userData.role || 'GENERAL_USER',
        title: userData.title || '',
        created_at: new Date().toISOString()
      }
      
      const users = await BaseAPI.loadData('users', 'system', [])
      users.push(newUser)
      await BaseAPI.saveData('users', 'system', users)
      
      console.log(`✅ 用戶創建成功: ${userData.username}`)
      return true
    } catch (error) {
      console.error('❌ 創建用戶異常:', error)
      return false
    }
  }

  /**
   * 更新用戶資料（管理員功能）
   */
  async updateUser(userData: User): Promise<boolean> {
    try {
      console.log(`📤 更新用戶資料: ${userData.username}`)
      
      // 使用本地資料管理
      const users = await BaseAPI.loadData('users', 'system', [])
      const userIndex = users.findIndex((user: any) => user.id === userData.id)
      
      if (userIndex === -1) {
        console.error('❌ 更新用戶失敗: 用戶不存在')
        return false
      }
      
      // 更新用戶資料
      users[userIndex] = {
        ...users[userIndex],
        display_name: userData.display_name,
        role: userData.role,
        title: userData.title
      }
      
      await BaseAPI.saveData('users', 'system', users)
      
      // 如果是當前用戶，更新本地狀態
      if (this.currentUser && this.currentUser.id === userData.id) {
        this.currentUser = { ...this.currentUser, ...userData }
      }
      
      console.log(`✅ 用戶更新成功: ${userData.username}`)
      return true
    } catch (error) {
      console.error('❌ 更新用戶異常:', error)
      return false
    }
  }

  /**
   * 刪除用戶（管理員功能）
   */
  async removeUser(userId: string): Promise<boolean> {
    try {
      // 不能刪除當前登入的用戶
      if (this.currentUser && this.currentUser.id === userId) {
        console.log('❌ 不能刪除當前登入的用戶')
        return false
      }

      console.log(`📤 刪除用戶: ${userId}`)
      
      // 使用本地資料管理
      const users = await BaseAPI.loadData('users', 'system', [])
      const filteredUsers = users.filter((user: any) => user.id !== userId)
      
      if (filteredUsers.length === users.length) {
        console.error('❌ 刪除用戶失敗: 用戶不存在')
        return false
      }
      
      await BaseAPI.saveData('users', 'system', filteredUsers)
      
      console.log(`✅ 用戶刪除成功: ${userId}`)
      return true
    } catch (error) {
      console.error('❌ 刪除用戶異常:', error)
      return false
    }
  }

  /**
   * 檢查認證系統是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized
  }
}

// 創建全域認證管理器實例
export const authManager = new AuthManagerV2()