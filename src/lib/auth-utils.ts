// 統一的認證檢查工具，完全本地化版本
import { localAuth } from '@/lib/local-auth'

export interface AuthUser {
  id: string
  email: string
  username?: string
  display_name?: string
  role?: 'admin' | 'corner' | 'user' | string
}

export async function checkAuth(): Promise<{ user: AuthUser | null, isDevMode: boolean }> {
  // 使用本地認證系統
  const user = localAuth.getCurrentUser()
  
  if (user) {
    console.log('✅ 本地認證成功')
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        role: user.role || 'user'
      },
      isDevMode: true // 目前都是開發模式
    }
  }

  return { user: null, isDevMode: false }
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
  const user = localAuth.getCurrentUser()
  return {
    id: user?.id || 'dev-user-001',
    email: user?.email || 'dev@venturo.app',
    username: user?.username || 'dev_user',
    role: (user?.role || 'admin') as 'admin' | 'corner' | 'user',
    level: 5,
    experience: 342,
    experience_lifetime: 1842
  }
}
