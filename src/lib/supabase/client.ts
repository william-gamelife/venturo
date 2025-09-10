import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 如果沒有環境變數，創建本地模擬客戶端
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 環境變數未設定，使用本地模擬模式')
  
  export const supabase = {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
          data: [],
          error: null
        }),
        data: [],
        error: null
      }),
      insert: (data: any) => ({
        select: (columns?: string) => ({
          single: async () => ({ data: null, error: null })
        }),
        data: null,
        error: null
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: (columns?: string) => ({
            single: async () => ({ data: null, error: null })
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: null
        })
      })
    }),
    
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async (credentials: any) => ({ 
        data: { user: null, session: null }, 
        error: { message: '本地模式不支援註冊' } 
      }),
      signInWithPassword: async (credentials: any) => ({ 
        data: { user: null, session: null }, 
        error: { message: '本地模式不支援登入' } 
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: any) => ({
        data: { subscription: { unsubscribe: () => {} } }
      })
    }
  }
} else {
  // 使用真實的 Supabase 客戶端
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}