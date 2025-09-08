// 統一的認證檢查工具，支援開發模式
import { supabase } from '@/lib/supabase/client'

export interface AuthUser {
  id: string
  email: string
  username?: string
  display_name?: string
  role?: 'admin' | 'corner' | 'user'
}

export async function checkAuth(): Promise<{ user: AuthUser | null, isDevMode: boolean }> {
  // 1. 檢查開發模式
  if (typeof window !== 'undefined' && localStorage.getItem('dev_mode') === 'true') {
    const devUser = JSON.parse(localStorage.getItem('dev_user') || '{}')
    if (devUser.id) {
      console.log('🔧 開發模式認證')
      return {
        user: {
          id: devUser.id,
          email: devUser.email,
          username: devUser.user_metadata?.username || 'dev_user',
          display_name: devUser.user_metadata?.display_name || '開發測試員',
          role: 'admin' // 開發模式給予管理員權限
        },
        isDevMode: true
      }
    }
  }

  // 2. 正常 Supabase 認證
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, isDevMode: false }
    }

    // 獲取 profile 資料
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    return {
      user: {
        id: user.id,
        email: user.email!,
        username: profile?.username || user.email?.split('@')[0],
        display_name: profile?.settings?.display_name || profile?.username,
        role: profile?.role || 'user'
      },
      isDevMode: false
    }
  } catch (error) {
    console.error('認證檢查失敗:', error)
    return { user: null, isDevMode: false }
  }
}

// 模擬的待辦事項數據（開發模式用）
export function getMockTodos() {
  return [
    {
      id: '1',
      title: '完成專案提案',
      description: '準備下週一的客戶提案簡報',
      status: 'in_progress' as const,
      priority: 'high' as const,
      type: 'project' as const,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      exp_reward: 75,
      tags: ['工作', '重要'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      title: '採購辦公用品',
      description: '購買文具和印表機墨水',
      status: 'pending' as const,
      priority: 'medium' as const,
      type: 'task' as const,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      exp_reward: 10,
      tags: ['行政'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      title: '團隊會議',
      description: '週五下午 3 點的進度檢討會議',
      status: 'pending' as const,
      priority: 'medium' as const,
      type: 'task' as const,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      exp_reward: 15,
      tags: ['會議'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      title: '客戶回覆郵件',
      description: '回覆重要客戶的詢問',
      status: 'completed' as const,
      priority: 'urgent' as const,
      type: 'task' as const,
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      exp_reward: 20,
      tags: ['客戶', '緊急'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      title: '準備月報',
      description: '整理本月業績和下月計劃',
      status: 'pending' as const,
      priority: 'high' as const,
      type: 'project' as const,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      exp_reward: 50,
      tags: ['報告', '月度'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

// 模擬的用戶資料（開發模式用）
export function getMockUserProfile() {
  return {
    id: 'dev-user-001',
    email: 'dev@venturo.app',
    username: 'dev_user',
    role: 'admin' as const,
    level: 5,
    experience: 342,
    experience_lifetime: 1842
  }
}
