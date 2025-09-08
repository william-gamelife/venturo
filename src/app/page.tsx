'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'

interface User {
  id: string
  username: string
  display_name: string
  title: string
  role: 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'GENERAL_USER'
  created_at: string
}

export default function HomePage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      console.log('📥 載入用戶列表...')
      
      // 直接從 authManager 載入用戶，不檢查 isReady
      const userList = await authManager.getUsers()
      console.log('🔍 獲取的用戶列表:', userList)
      
      if (userList.length > 0) {
        setUsers(userList)
        console.log(`✅ 載入了 ${userList.length} 個用戶`)
      } else {
        // 如果沒有用戶，顯示提示
        console.log('ℹ️ 沒有找到用戶')
        setUsers([])
      }
    } catch (error) {
      console.error('❌ 載入用戶失敗:', error)
      // 使用預設用戶作為 fallback
      const fallbackUsers = [
        {
          id: 'fallback-1',
          username: 'demo',
          display_name: 'Demo',
          title: 'Demo User',
          role: 'GENERAL_USER' as const,
          created_at: new Date().toISOString()
        }
      ]
      setUsers(fallbackUsers)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedUser) {
      setError('請選擇用戶')
      return
    }

    const result = await authManager.login(selectedUser.username)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.message || '登入失敗，請重試')
    }
  }

  const handleQuickLogin = async (username: string) => {
    setError('')
    
    const result = await authManager.login(username)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.message || '登入失敗，請重試')
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '超級管理員'
      case 'BUSINESS_ADMIN':
        return '業務管理員'
      default:
        return '一般使用者'
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>VENTURO</h1>
          <p>智能生活管理平台</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>選擇用戶</label>
            {isLoading ? (
              <div className="loading">載入中...</div>
            ) : users.length === 0 ? (
              <div className="no-users">
                <p>🚀 歡迎使用 VENTURO！</p>
                <p>輸入您想要的用戶名即可開始使用</p>
                <input 
                  type="text" 
                  placeholder="輸入用戶名 (例如: admin, user, 您的名字)"
                  className="username-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const username = (e.target as HTMLInputElement).value.trim()
                      if (username) {
                        handleQuickLogin(username)
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <select 
                value={selectedUser?.id || ''} 
                onChange={(e) => {
                  const user = users.find(u => u.id === e.target.value)
                  setSelectedUser(user || null)
                  setError('')
                }}
                className="user-select"
              >
                <option value="">請選擇用戶</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.display_name} ({getRoleText(user.role)})
                  </option>
                ))}
              </select>
            )}
          </div>


          {error && (
            <div className="error-message">{error}</div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={!selectedUser || isLoading}
          >
            登入系統
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-backgroundGradient, linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 100%));
          padding: 20px;
        }

        .login-card {
          background: var(--color-card, rgba(255, 255, 255, 0.95));
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: var(--color-shadow, 0 10px 30px rgba(0, 0, 0, 0.08));
          border: 1px solid var(--color-border, rgba(201, 169, 97, 0.2));
          padding: 48px;
          width: 100%;
          max-width: 420px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text, #3a3833);
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--color-primary, #c9a961), var(--color-primaryLight, #e4c661));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-header p {
          font-size: 16px;
          color: var(--color-textLight, #6d685f);
          font-weight: 500;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text, #3a3833);
          margin-bottom: 4px;
        }

        .user-select,
        .username-input {
          padding: 16px;
          border: 2px solid var(--color-border, rgba(201, 169, 97, 0.3));
          border-radius: 12px;
          font-size: 16px;
          background: var(--color-card, white);
          transition: all 0.3s ease;
          width: 100%;
          font-weight: 500;
        }

        .user-select:focus,
        .username-input:focus {
          outline: none;
          border-color: var(--color-primary, #c9a961);
          box-shadow: 0 0 0 4px var(--color-border, rgba(201, 169, 97, 0.15));
          transform: translateY(-1px);
        }

        .user-select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .no-users {
          text-align: center;
          padding: 28px;
          background: var(--color-border, rgba(201, 169, 97, 0.08));
          border-radius: 16px;
          border: 2px dashed var(--color-border, rgba(201, 169, 97, 0.2));
        }

        .no-users p {
          margin: 12px 0;
          color: var(--color-text, #3a3833);
        }

        .no-users p:first-child {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .login-button {
          padding: 16px 32px;
          background: linear-gradient(135deg, var(--color-primary, #c9a961), var(--color-primaryLight, #e4c661));
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 12px;
          box-shadow: 0 4px 20px rgba(201, 169, 97, 0.3);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(201, 169, 97, 0.4);
        }

        .login-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          background: linear-gradient(135deg, #fee, #fdd);
          color: #c00;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          text-align: center;
          border: 2px solid #fcc;
          font-weight: 600;
        }

        .loading {
          padding: 20px;
          text-align: center;
          color: var(--color-textLight, #6d685f);
          font-size: 16px;
          background: var(--color-border, rgba(201, 169, 97, 0.05));
          border-radius: 12px;
          border: 2px solid var(--color-border, rgba(201, 169, 97, 0.1));
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
