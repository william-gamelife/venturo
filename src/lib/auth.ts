'use client'

import { User, UserPermissions } from './types'
import { BaseAPI } from './base-api'
import { localAuth } from './local-auth'

/**
 * 認證管理器 - 完全本地化版本
 * 使用 localAuth 作為底層認證系統
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

class AuthManager {
  /**
   * 角色登入
   */
  async loginWithCharacter(character: any): Promise<{ success: boolean; message?: string; user?: User }> {
    const result = localAuth.loginWithRole(character)
    
    if (result.success && result.user) {
      const role = result.user.role || 'GENERAL_USER'
      const permissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || DEFAULT_PERMISSIONS.GENERAL_USER
      
      const user: User = {
        id: result.user.id,
        username: result.user.username,
        display_name: result.user.display_name,
        role: role as User['role'],
        permissions,
        title: result.user.description || '',
        created_at: result.user.createdAt,
        last_login_at: result.user.lastLogin
      }
      
      return { success: true, user }
    }
    
    return { success: false, message: result.error }
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser(): User | null {
    const user = localAuth.getCurrentUser()
    
    if (!user) return null
    
    const role = user.role || 'GENERAL_USER'
    const permissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || DEFAULT_PERMISSIONS.GENERAL_USER
    
    return {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      role: role as User['role'],
      permissions,
      title: user.description || '',
      created_at: user.createdAt,
      last_login_at: user.lastLogin
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    localAuth.logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  /**
   * 檢查是否已登入
   */
  isAuthenticated(): boolean {
    return localAuth.isAuthenticated()
  }

  /**
   * 獲取用戶顯示名稱
   */
  getDisplayName(): string {
    const user = this.getCurrentUser()
    return user?.display_name || user?.username || '訪客'
  }

  /**
   * 獲取用戶 ID
   */
  getUserId(): string {
    const user = this.getCurrentUser()
    return user?.id || ''
  }

  /**
   * 檢查用戶角色
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'SUPER_ADMIN'
  }

  isManager(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'BUSINESS_ADMIN' || this.isAdmin()
  }

  /**
   * 檢查模組權限
   */
  canAccessModule(module: string, permission: 'read' | 'write' | 'delete' | 'admin' = 'read'): boolean {
    const user = this.getCurrentUser()
    if (!user) return false
    
    const modulePermissions = user.permissions[module]
    if (!modulePermissions) return false
    
    return modulePermissions[permission] === true
  }

  /**
   * 獲取用戶權限
   */
  getPermissions(): UserPermissions {
    const user = this.getCurrentUser()
    return user?.permissions || {}
  }

  /**
   * 獲取用戶列表
   */
  async getUsers(): Promise<User[]> {
    const allUsers = localAuth.getAllUsers()
    
    return allUsers.map(user => {
      const role = user.role || 'GENERAL_USER'
      const permissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || DEFAULT_PERMISSIONS.GENERAL_USER
      
      return {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: role as User['role'],
        permissions,
        title: user.description || '',
        created_at: user.createdAt,
        last_login_at: user.lastLogin
      }
    })
  }

  /**
   * 檢查認證系統是否已初始化
   */
  isReady(): boolean {
    return true // 本地系統總是準備好的
  }
}

// 創建全域認證管理器實例
export const authManager = new AuthManager()
