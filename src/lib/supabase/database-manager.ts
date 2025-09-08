'use client'

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Supabase 資料庫管理工具
 * 整合您提供的方法 A & B 概念，提供統一的資料庫操作介面
 */
export class DatabaseManager {
  private supabase
  
  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  /**
   * 方法 A: 使用 Supabase RPC 執行自定義函數
   */
  async callFunction<T = any>(functionName: string, params?: Record<string, any>): Promise<{
    data: T | null
    error: any
  }> {
    console.log(`📞 呼叫函數: ${functionName}`, params)
    
    const { data, error } = await this.supabase.rpc(functionName, params)
    
    if (error) {
      console.error(`❌ 函數執行失敗 (${functionName}):`, error)
    } else {
      console.log(`✅ 函數執行成功 (${functionName})`)
    }
    
    return { data, error }
  }

  /**
   * 方法 A: 直接 SQL 查詢（透過 RPC）
   */
  async executeSQL<T = any>(sql: string): Promise<{
    data: T | null
    error: any
  }> {
    console.log(`🔍 執行 SQL:`, sql)
    
    // 注意：這需要在 Supabase 中建立一個執行 SQL 的函數
    return await this.callFunction('execute_sql', { sql_query: sql })
  }

  /**
   * 檢查表格結構
   */
  async checkTableStructure(tableName: string) {
    console.log(`🏗️ 檢查表格結構: ${tableName}`)
    
    // 檢查表格是否存在
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .limit(0)
    
    return { exists: !error, error }
  }

  /**
   * 檢查所有核心表格
   */
  async checkAllTables() {
    const tables = ['profiles', 'todos', 'projects']
    const results: Record<string, any> = {}
    
    console.log('🔍 檢查所有核心表格...')
    
    for (const table of tables) {
      results[table] = await this.checkTableStructure(table)
    }
    
    return results
  }

  /**
   * 用戶管理 - 創建 Profile
   */
  async createUserProfile(userData: {
    id: string
    email: string
    username: string
    role?: string
    settings?: any
  }) {
    console.log('👤 創建用戶 Profile:', userData.username)
    
    // 檢查是否是第一個用戶 (william 自動成為管理員)
    let finalRole = userData.role || 'user'  // 使用小寫的 user
    
    if (userData.username === 'william') {
      // 檢查是否已經有 william 用戶
      const { data: existingWilliam } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('username', 'william')
        .maybeSingle()
      
      if (!existingWilliam) {
        finalRole = 'admin'  // 使用小寫的 admin
        console.log('🔑 William 用戶自動設置為 admin')
      }
    }
    
    const profileData = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      role: finalRole,
      level: 1,
      experience: 0,
      settings: userData.settings || {
        display_name: userData.username,
        world_mode: 'game',
        coins: 100,
        is_active: true
      }
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .insert(profileData)
      .select()

    if (error) {
      console.error('❌ Profile 創建失敗:', error)
    } else {
      console.log('✅ Profile 創建成功')
    }

    return { data, error }
  }

  /**
   * 用戶管理 - 獲取用戶資料
   */
  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  }

  /**
   * 用戶管理 - 更新用戶設定
   */
  async updateUserSettings(userId: string, settings: any) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ settings })
      .eq('id', userId)
      .select()

    return { data, error }
  }

  /**
   * 待辦事項管理 - 獲取用戶的 todos
   */
  async getUserTodos(userId: string) {
    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  /**
   * 待辦事項管理 - 創建 todo
   */
  async createTodo(userId: string, todoData: {
    title: string
    description?: string
  }) {
    const { data, error } = await this.supabase
      .from('todos')
      .insert({
        user_id: userId,
        title: todoData.title,
        description: todoData.description,
        completed: false
      })
      .select()

    return { data, error }
  }

  /**
   * 專案管理 - 獲取用戶的專案
   */
  async getUserProjects(userId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  /**
   * 通用查詢方法
   */
  async query<T = any>(table: string, options: {
    select?: string
    filter?: Record<string, any>
    order?: { column: string, ascending: boolean }
    limit?: number
  } = {}) {
    let query = this.supabase.from(table)

    if (options.select) {
      query = query.select(options.select)
    } else {
      query = query.select('*')
    }

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending })
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    return { data: data as T, error }
  }

  /**
   * 健康檢查
   */
  async healthCheck() {
    console.log('🏥 執行健康檢查...')
    
    const results = {
      connection: false,
      tables: {} as Record<string, boolean>,
      auth: false
    }

    try {
      // 檢查連接
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      results.connection = !error
      
      // 檢查表格
      const tableCheck = await this.checkAllTables()
      results.tables = Object.fromEntries(
        Object.entries(tableCheck).map(([table, result]) => [table, !result.error])
      )
      
      // 檢查認證狀態
      const { data: session } = await this.supabase.auth.getSession()
      results.auth = !!session.session

      console.log('✅ 健康檢查完成:', results)
      
    } catch (error) {
      console.error('❌ 健康檢查失敗:', error)
    }

    return results
  }
}

// 導出單例實例
export const dbManager = new DatabaseManager()