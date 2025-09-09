/**
 * Supabase 認證系統
 * 直接使用 Supabase Auth，不依賴本地存儲
 */

import { supabase } from './supabase'
import { User, Session } from '@supabase/supabase-js'

export interface VenturoUser {
  id: string
  email: string
  real_name: string
  role: 'SUPER_ADMIN' | 'ADVENTURE_MODE'
  avatar?: string
  created_at: string
  last_login?: string
}

export interface AuthResponse {
  success: boolean
  user?: VenturoUser
  error?: string
}

class SupabaseAuth {
  private currentUser: VenturoUser | null = null

  /**
   * 註冊新用戶
   */
  async register(data: {
    email: string
    password: string
    real_name: string
    avatar?: string
  }): Promise<AuthResponse> {
    try {
      console.log('🔐 開始註冊用戶:', data.email)

      // 1. 使用 Supabase Auth 註冊
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            real_name: data.real_name,
            role: 'ADVENTURE_MODE', // 新用戶預設角色
            avatar: data.avatar || '🎮'
          }
        }
      })

      if (authError) {
        console.error('❌ Supabase 註冊失敗:', authError)
        return {
          success: false,
          error: authError.message
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: '註冊失敗，未返回用戶資料'
        }
      }

      // 2. 創建用戶檔案
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.real_name,
          role: 'user', // 對應資料庫的 user_role enum
          avatar_url: data.avatar || '🎮'
        })

      if (profileError) {
        console.error('❌ 創建用戶檔案失敗:', profileError)
        // 註冊失敗時清理
        await supabase.auth.signOut()
        return {
          success: false,
          error: '創建用戶檔案失敗'
        }
      }

      // 3. 建立當前用戶資料
      this.currentUser = {
        id: authData.user.id,
        email: data.email,
        real_name: data.real_name,
        role: 'ADVENTURE_MODE',
        avatar: data.avatar,
        created_at: new Date().toISOString()
      }

      console.log('✅ 用戶註冊成功:', this.currentUser.email)

      return {
        success: true,
        user: this.currentUser
      }

    } catch (error) {
      console.error('❌ 註冊異常:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '註冊失敗'
      }
    }
  }

  /**
   * 登入用戶
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 用戶登入:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ 登入失敗:', error.message)
        return {
          success: false,
          error: error.message
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: '登入失敗'
        }
      }

      // 獲取用戶檔案
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        console.error('❌ 獲取用戶檔案失敗:', profileError)
        return {
          success: false,
          error: '獲取用戶資料失敗'
        }
      }

      // 建立當前用戶資料
      this.currentUser = {
        id: data.user.id,
        email: profile.email,
        real_name: profile.full_name || '',
        role: profile.role === 'admin' ? 'SUPER_ADMIN' : 'ADVENTURE_MODE',
        avatar: profile.avatar_url,
        created_at: profile.created_at,
        last_login: new Date().toISOString()
      }

      // 更新最後登入時間
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.user.id)

      console.log('✅ 登入成功:', this.currentUser.email)

      return {
        success: true,
        user: this.currentUser
      }

    } catch (error) {
      console.error('❌ 登入異常:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '登入失敗'
      }
    }
  }

  /**
   * 獲取當前用戶
   */
  async getCurrentUser(): Promise<VenturoUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      if (this.currentUser && this.currentUser.id === user.id) {
        return this.currentUser
      }

      // 重新獲取用戶檔案
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) return null

      this.currentUser = {
        id: user.id,
        email: profile.email,
        real_name: profile.full_name || '',
        role: profile.role === 'admin' ? 'SUPER_ADMIN' : 'ADVENTURE_MODE',
        avatar: profile.avatar_url,
        created_at: profile.created_at,
        last_login: profile.updated_at
      }

      return this.currentUser

    } catch (error) {
      console.error('❌ 獲取當前用戶失敗:', error)
      return null
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut()
      this.currentUser = null
      console.log('👋 用戶已登出')
    } catch (error) {
      console.error('❌ 登出失敗:', error)
    }
  }

  /**
   * 檢查是否已登入
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * 監聽認證狀態變化
   */
  onAuthStateChange(callback: (user: VenturoUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 認證狀態變化:', event)
      
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null
        callback(null)
      }
    })
  }
}

// 匯出單例
export const venturoAuth = new SupabaseAuth()
export default venturoAuth
