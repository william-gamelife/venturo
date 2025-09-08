'use client'

import { User, UserPermissions } from './types'
import { database, supabase } from './supabase'

class AuthManager {
  private currentUser: User | null = null
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAuth()
    }
  }

  // 初始化認證系統 (基於 session)
  private async initializeAuth() {
    try {
      console.log('🔐 初始化認證系統...')
      
      // 檢查現有 session
      if (typeof window !== 'undefined') {
        const sessionData = sessionStorage.getItem('gamelife_session')
        if (sessionData) {
          const { userId } = JSON.parse(sessionData)
          
          // 從資料庫獲取用戶資料
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('uuid', userId)
            .single()
            
          if (userData && !error) {
            // 處理舊資料庫中的角色格式
            let normalizedRole = userData.role
            if (userData.role === 'admin') {
              normalizedRole = 'SUPER_ADMIN'
            }
            
            // 如果沒有權限資料，根據角色給予預設權限
            let permissions = userData.permissions
            if (!permissions && normalizedRole === 'SUPER_ADMIN') {
              permissions = {
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
              }
            }
            
            this.currentUser = {
              id: userData.uuid, // 使用 uuid 作為 id
              username: userData.username,
              display_name: userData.display_name,
              role: normalizedRole, // 使用標準化後的角色
              permissions: permissions || {}, // 從資料庫載入或使用預設權限
              title: userData.title || '',
              created_at: userData.created_at,
              last_login_at: userData.last_login_at
            }
            console.log('✅ 從 session 恢復用戶:', userData.username)
          } else {
            // session 無效，清除
            sessionStorage.removeItem('gamelife_session')
          }
        }
      }
      
      this.isInitialized = true
    } catch (error) {
      console.error('❌ 初始化認證失敗:', error)
      this.isInitialized = true
    }
  }

  // 獲取用戶列表 (完全從雲端)
  async getUsers(): Promise<User[]> {
    try {
      console.log('📥 從 Supabase 獲取用戶列表')
      const users = await database.getUsers()
      
      if (users && users.length > 0) {
        return users.map(user => ({
          ...user,
          password: undefined // 不返回密碼
        }))
      }
      
      console.log('⚠️ 沒有找到用戶，返回空列表')
      return []
    } catch (error) {
      console.error('❌ 獲取用戶列表失敗:', error)
      return []
    }
  }

  // 用戶登入 (純資料庫驗證，不使用 Supabase Auth)
  async login(username: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      console.log(`🔐 嘗試登入用戶: ${username}`)
      
      // 直接從資料庫驗證用戶
      const userData = await database.validateUser(username, password)
      
      if (!userData) {
        console.log(`❌ 登入失敗: 用戶名或密碼錯誤`)
        return { success: false, message: '用戶名或密碼錯誤' }
      }
      
      this.currentUser = {
        ...userData,
        last_login_at: new Date().toISOString() // 只在記憶體中記錄，不存到資料庫
      }
      
      // 創建簡單的 session token (存儲在 sessionStorage)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('gamelife_session', JSON.stringify({
          userId: userData.id,
          loginTime: new Date().toISOString()
        }))
      }
      
      console.log(`✅ 登入成功: ${username}`)
      return { success: true, user: this.currentUser }
      
    } catch (error) {
      console.error('❌ 登入時發生錯誤:', error)
      return { success: false, message: '登入時發生錯誤' }
    }
  }

  // 登出 (清除 session)
  async logout() {
    console.log('🔐 用戶登出')
    
    this.currentUser = null
    
    // 清除 session
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('gamelife_session')
      window.location.href = '/login'
    }
  }

  // 檢查是否已登入
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // 獲取當前用戶
  getCurrentUser(): User | null {
    return this.currentUser
  }

  // 獲取用戶顯示名稱
  getDisplayName(): string {
    return this.currentUser?.display_name || this.currentUser?.username || '訪客'
  }

  // 獲取用戶 ID
  getUserId(): string {
    return this.currentUser?.id || ''
  }

  // 檢查用戶角色
  isAdmin(): boolean {
    return this.currentUser?.role === 'SUPER_ADMIN'
  }

  isManager(): boolean {
    return this.currentUser?.role === 'BUSINESS_ADMIN' || this.isAdmin()
  }

  // 檢查模組權限
  canAccessModule(module: string, permission: 'read' | 'write' | 'delete' | 'admin' = 'read'): boolean {
    if (!this.currentUser) return false
    
    const modulePermissions = this.currentUser.permissions[module]
    if (!modulePermissions) return false
    
    return modulePermissions[permission] === true
  }

  // 獲取用戶權限
  getPermissions(): UserPermissions {
    return this.currentUser?.permissions || {}
  }

  // 添加新用戶 (雲端)
  async addUser(userData: Partial<User> & { username: string; display_name: string; password: string }): Promise<boolean> {
    try {
      console.log(`📤 在雲端創建新用戶: ${userData.username}`)
      
      // 檢查用戶名是否已存在
      const existingUsers = await this.getUsers()
      if (existingUsers.find(u => u.username === userData.username)) {
        console.log(`❌ 用戶名已存在: ${userData.username}`)
        return false
      }
      
      // 使用 email 格式創建 Supabase Auth 用戶
      const email = userData.email || `${userData.username}@gamelife.local`
      
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: email,
        password: userData.password
      })
      
      if (authError || !authUser.user) {
        console.error('❌ 創建 Supabase Auth 用戶失敗:', authError)
        return false
      }
      
      // 在 users 表格中創建用戶記錄
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          username: userData.username,
          display_name: userData.display_name,
          email: email,
          role: userData.role || 'GENERAL_USER',
          title: userData.title || '',
          permissions: userData.permissions || this.getDefaultPermissions(userData.role || 'GENERAL_USER'),
          created_at: new Date().toISOString()
        })
      
      if (dbError) {
        console.error('❌ 創建用戶記錄失敗:', dbError)
        return false
      }
      
      console.log(`✅ 用戶創建成功: ${userData.username}`)
      return true
    } catch (error) {
      console.error('❌ 創建用戶失敗:', error)
      return false
    }
  }

  // 更新用戶資料 (雲端)
  async updateUser(userData: User): Promise<boolean> {
    try {
      console.log(`📤 更新雲端用戶資料: ${userData.username}`)
      
      const { error } = await supabase
        .from('users')
        .update({
          display_name: userData.display_name,
          role: userData.role,
          title: userData.title,
          permissions: userData.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)
      
      if (error) {
        console.error('❌ 更新用戶失敗:', error)
        return false
      }
      
      // 如果是當前用戶，更新本地狀態
      if (this.currentUser && this.currentUser.id === userData.id) {
        this.currentUser = { ...this.currentUser, ...userData }
      }
      
      console.log(`✅ 用戶更新成功: ${userData.username}`)
      return true
    } catch (error) {
      console.error('❌ 更新用戶失敗:', error)
      return false
    }
  }

  // 刪除用戶 (雲端)
  async removeUser(userId: string): Promise<boolean> {
    try {
      // 不能刪除當前登入的用戶
      if (this.currentUser && this.currentUser.id === userId) {
        console.log('❌ 不能刪除當前登入的用戶')
        return false
      }

      console.log(`📤 從雲端刪除用戶: ${userId}`)
      
      // 刪除 users 表格記錄
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      
      if (error) {
        console.error('❌ 刪除用戶失敗:', error)
        return false
      }
      
      // TODO: 也刪除 Supabase Auth 用戶 (需要服務端權限)
      // await supabase.auth.admin.deleteUser(userId)
      
      console.log(`✅ 用戶刪除成功: ${userId}`)
      return true
    } catch (error) {
      console.error('❌ 刪除用戶失敗:', error)
      return false
    }
  }

  // 根據角色獲取預設權限
  private getDefaultPermissions(role: string): any {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
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
        }
      case 'BUSINESS_ADMIN':
        return {
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
        }
      default: // GENERAL_USER
        return {
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
    }
  }

  // UUID 現在由 Supabase Auth 管理，不需要手動生成

  // 獲取用戶頭像圖標
  getUserIcon(user?: User): string {
    const targetUser = user || this.currentUser
    if (!targetUser) return 'user'
    
    switch (targetUser.role) {
      case 'SUPER_ADMIN':
        return 'admin'
      case 'BUSINESS_ADMIN':
        return 'manager'
      default:
        return 'user'
    }
  }

  // 檢查認證狀態是否已初始化
  isReady(): boolean {
    return this.isInitialized
  }
}

// 創建全域認證管理器實例
export const authManager = new AuthManager()