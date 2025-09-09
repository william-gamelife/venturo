import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 使用單例模式避免多個 GoTrueClient 實例
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // 我們用自己的 sessionStorage 管理會話
        autoRefreshToken: false, // 不需要自動刷新 token
      }
    })
  }
  return supabaseInstance
})()

/**
 * 簡化的資料庫操作工具
 * 移除了複雜的 fallback 和補丁邏輯
 */
export const database = {
  /**
   * 獲取用戶資料（用於模組）
   */
  async getUserData(userId: string, module: string) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('module', module)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error(`❌ 獲取模組資料失敗 [${module}]:`, error)
        return null
      }
      
      return data?.data || null
    } catch (error) {
      console.error(`❌ 獲取模組資料異常 [${module}]:`, error)
      return null
    }
  },

  /**
   * 保存用戶資料（用於模組）
   */
  async saveUserData(userId: string, module: string, data: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          module: module,
          data: data,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`❌ 保存模組資料失敗 [${module}]:`, error)
        return false
      }
      
      return true
    } catch (error) {
      console.error(`❌ 保存模組資料異常 [${module}]:`, error)
      return false
    }
  }
}

export default supabase