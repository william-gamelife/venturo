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

// 資料庫操作幫助函數
export const database = {
  // 獲取用戶數據
  async getUserData(userId: string, module: string) {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('module', module)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return null
    }
    
    return data?.data || null
  },

  // 保存用戶數據
  async saveUserData(userId: string, module: string, data: any) {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        module: module,
        data: data,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Save error:', error)
      return false
    }
    
    return true
  },

  // 獲取用戶列表
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at')
    
    if (error) {
      console.error('Users fetch error:', error)
      return []
    }
    
    // 密碼顯示已關閉
    // if (process.env.NODE_ENV === 'development' && data) {
    //   console.log('🔑 開發模式 - 用戶密碼列表:')
    //   data.forEach(user => {
    //     console.log(`👤 ${user.display_name || user.username}: 密碼 = "${user.password}"`)
    //   })
    // }
    
    return data || []
  },

  // 驗證用戶
  async validateUser(username: string, password: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error || !data) {
      return null
    }
    
    // 自動登入模式或密碼驗證
    if (password === 'auto-login' || data.password === password) {
      // 處理舊資料庫中的角色格式
      let normalizedRole = data.role
      if (data.role === 'admin') {
        normalizedRole = 'SUPER_ADMIN'
      }
      
      // 如果沒有權限資料，根據角色給予預設權限
      let permissions = data.permissions
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
      
      return {
        id: data.uuid, // 使用 uuid 作為 id
        username: data.username,
        display_name: data.display_name,
        role: normalizedRole, // 使用標準化後的角色
        permissions: permissions || {}, // 從資料庫載入或使用預設權限
        title: data.title || '',
        created_at: data.created_at,
        last_login_at: undefined // 表格中沒有此欄位
      }
    }
    
    return null
  }
}

export default supabase