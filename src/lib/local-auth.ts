/**
 * 本地認證系統
 * 完全基於 LocalStorage 的認證管理
 */

export interface User {
  id: string
  email: string
  username: string
  display_name: string
  avatar?: string
  role?: string
  description?: string
  createdAt: string
  lastLogin: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

class LocalAuth {
  private readonly AUTH_KEY = 'venturo_current_user'
  private readonly USERS_KEY = 'venturo_users'
  private readonly SESSION_KEY = 'venturo_session'

  /**
   * 取得當前登入的使用者
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem(this.AUTH_KEY)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  /**
   * 使用角色登入（開發模式）
   */
  loginWithRole(roleData: any): AuthResponse {
    try {
      const user: User = {
        id: roleData.id,
        email: `${roleData.id}@venturo.local`,
        username: roleData.id,
        display_name: roleData.nickname || roleData.id,
        avatar: roleData.avatar,
        role: roleData.role,
        description: roleData.description,
        createdAt: roleData.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }

      // 儲存使用者資料
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user))
      localStorage.setItem(this.SESSION_KEY, 'active')

      // 更新使用者列表
      this.updateUsersList(user)

      return {
        success: true,
        user
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登入失敗'
      }
    }
  }

  /**
   * 登出
   */
  logout(): void {
    localStorage.removeItem(this.AUTH_KEY)
    localStorage.removeItem(this.SESSION_KEY)
    localStorage.removeItem('dev_mode')
    localStorage.removeItem('dev_user')
  }

  /**
   * 檢查是否已登入
   */
  isAuthenticated(): boolean {
    return localStorage.getItem(this.SESSION_KEY) === 'active' && 
           this.getCurrentUser() !== null
  }

  /**
   * 更新使用者資料
   */
  updateUser(updates: Partial<User>): AuthResponse {
    const currentUser = this.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: '使用者未登入'
      }
    }

    const updatedUser = {
      ...currentUser,
      ...updates,
      lastLogin: new Date().toISOString()
    }

    localStorage.setItem(this.AUTH_KEY, JSON.stringify(updatedUser))
    this.updateUsersList(updatedUser)

    return {
      success: true,
      user: updatedUser
    }
  }

  /**
   * 取得所有使用者
   */
  getAllUsers(): User[] {
    const usersStr = localStorage.getItem(this.USERS_KEY)
    if (!usersStr) return []
    
    try {
      return JSON.parse(usersStr)
    } catch {
      return []
    }
  }

  /**
   * 更新使用者列表
   */
  private updateUsersList(user: User): void {
    const users = this.getAllUsers()
    const existingIndex = users.findIndex(u => u.id === user.id)
    
    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  /**
   * 清除所有認證資料
   */
  clearAll(): void {
    localStorage.removeItem(this.AUTH_KEY)
    localStorage.removeItem(this.USERS_KEY)
    localStorage.removeItem(this.SESSION_KEY)
    localStorage.removeItem('dev_mode')
    localStorage.removeItem('dev_user')
  }
}

// 匯出單例
export const localAuth = new LocalAuth()

// 相容性介面（取代 supabase.auth）
export const auth = {
  getUser: () => {
    const user = localAuth.getCurrentUser()
    return Promise.resolve({ 
      data: { user }, 
      error: user ? null : new Error('未登入') 
    })
  },
  
  signOut: () => {
    localAuth.logout()
    return Promise.resolve({ error: null })
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // 模擬 auth state change
    const user = localAuth.getCurrentUser()
    if (user) {
      callback('SIGNED_IN', { user })
    }
    
    // 返回假的 unsubscribe
    return {
      data: { subscription: { unsubscribe: () => {} } }
    }
  }
}
