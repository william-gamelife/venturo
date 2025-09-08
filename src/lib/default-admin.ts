'use client'

import { createClient } from '@supabase/supabase-js'

/**
 * 預設管理員系統
 * 模式 1：Super Admin 預設模式
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 只在客戶端使用 Anon Key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DefaultAdmin {
  username: string
  email: string
  password: string
  displayName: string
}

export const DEFAULT_ADMIN: DefaultAdmin = {
  username: 'admin',
  email: 'admin@venturo.local',
  password: 'admin123',
  displayName: 'System Administrator'
}

export class DefaultAdminManager {
  /**
   * 注意：這些方法現在都透過 API Routes 執行
   * 客戶端不應直接調用這些方法
   */
  
  /**
   * 檢查是否存在管理員
   */
  static async hasAdmin(): Promise<boolean> {
    try {
      // 這個方法現在應該透過 API 調用
      const response = await fetch('/api/admin/check')
      const result = await response.json()
      return result.hasAdmin || false
    } catch (error) {
      console.error('檢查管理員錯誤:', error)
      return false
    }
  }

  /**
   * 創建預設管理員 - 透過 API
   */
  static async createDefaultAdmin(): Promise<{
    success: boolean
    message?: string
    admin?: any
  }> {
    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      console.error('❌ 創建預設管理員錯誤:', error)
      return { success: false, message: `創建錯誤: ${error}` }
    }
  }

  /**
   * 刪除預設管理員 - 透過 API
   */
  static async removeDefaultAdmin(): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response = await fetch('/api/admin/create', {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('❌ 刪除預設管理員錯誤:', error)
      return { success: false, message: `刪除錯誤: ${error}` }
    }
  }

  /**
   * 測試登入預設管理員 - 透過 API
   */
  static async testLogin(): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response = await fetch('/api/admin/test-login', {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      return { success: false, message: `登入測試錯誤: ${error}` }
    }
  }
}

// 導出便捷方法
export const createDefaultAdmin = DefaultAdminManager.createDefaultAdmin
export const removeDefaultAdmin = DefaultAdminManager.removeDefaultAdmin
export const hasAdmin = DefaultAdminManager.hasAdmin
export const testAdminLogin = DefaultAdminManager.testLogin