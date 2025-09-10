'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { localAuth } from '@/lib/local-auth'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 登入表單
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // 註冊表單
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    real_name: '',
    avatar: '🎮'
  })

  // 可選頭像
  const avatarOptions = ['🎮', '👤', '👨', '👩', '🧑‍💻', '🦸', '🧙', '🎨', '🚀', '🌟', '💫']

  useEffect(() => {
    // 檢查是否已經登入
    const currentUser = localAuth.getCurrentUser()
    if (currentUser) {
      router.push('/dashboard')
    }
  }, [router])

  // 處理登入
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      setError('請填寫完整的登入資訊')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      // 簡化登入邏輯 - 本地模式
      const user = {
        id: 'local_user_' + Date.now(),
        email: loginForm.email,
        name: loginForm.email.split('@')[0] || '使用者'
      }
      
      // 儲存到本地存儲
      localStorage.setItem('venturo_user', JSON.stringify(user))
      
      console.log('✅ 本地登入成功:', user.email)
      router.push('/dashboard')
      
    } catch (error) {
      console.error('登入錯誤:', error)
      setError('登入失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // 處理註冊
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerForm.email || !registerForm.password || !registerForm.real_name) {
      setError('請填寫完整的註冊資訊')
      return
    }

    if (registerForm.password.length < 6) {
      setError('密碼長度至少 6 個字元')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      // 簡化註冊邏輯 - 本地模式
      const user = {
        id: 'local_user_' + Date.now(),
        email: registerForm.email,
        name: registerForm.real_name,
        avatar: registerForm.avatar
      }
      
      // 儲存到本地存儲
      localStorage.setItem('venturo_user', JSON.stringify(user))
      
      console.log('✅ 本地註冊成功:', user.email)
      router.push('/dashboard')
      
    } catch (error) {
      console.error('註冊錯誤:', error)
      setError('註冊失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // 管理員登入（隱藏功能）
  const handleAdminLogin = async () => {
    setLoginForm({
      email: 'admin@venturo.local',
      password: 'admin123'
    })
    setIsLogin(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        maxWidth: '480px',
        width: '100%'
      }}>
        {/* 標題 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #c9a961, #e4c661)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px'
          }}>
            VENTURO
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#6d685f',
            marginBottom: '20px'
          }}>
            {isLogin ? '歡迎回來！' : '開始您的冒險之旅'}
          </p>

          {/* 切換登入/註冊 */}
          <div style={{
            display: 'flex',
            background: 'rgba(201, 169, 97, 0.1)',
            borderRadius: '12px',
            padding: '4px'
          }}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true)
                setError('')
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: isLogin ? '#c9a961' : 'transparent',
                color: isLogin ? 'white' : '#c9a961',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              登入
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false)
                setError('')
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: !isLogin ? '#c9a961' : 'transparent',
                color: !isLogin ? 'white' : '#c9a961',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              註冊
            </button>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {/* 登入表單 */}
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                placeholder="輸入您的 Email"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(201, 169, 97, 0.3)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a961'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201, 169, 97, 0.3)'}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                密碼
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="輸入您的密碼"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(201, 169, 97, 0.3)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a961'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201, 169, 97, 0.3)'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading 
                  ? '#ddd' 
                  : 'linear-gradient(135deg, #c9a961, #e4c661)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? '登入中...' : '登入'}
            </button>
          </form>
        ) : (
          /* 註冊表單 */
          <form onSubmit={handleRegister}>
            {/* 頭像選擇 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                選擇頭像
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px'
              }}>
                {avatarOptions.map(avatar => (
                  <div
                    key={avatar}
                    onClick={() => setRegisterForm({...registerForm, avatar})}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #c9a961, #e4c661)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      cursor: 'pointer',
                      border: registerForm.avatar === avatar
                        ? '3px solid #c9a961'
                        : '3px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {avatar}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                本名 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={registerForm.real_name}
                onChange={(e) => setRegisterForm({...registerForm, real_name: e.target.value})}
                placeholder="請輸入您的真實姓名"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(201, 169, 97, 0.3)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a961'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201, 169, 97, 0.3)'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                placeholder="輸入您的 Email"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(201, 169, 97, 0.3)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a961'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201, 169, 97, 0.3)'}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                密碼
              </label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                placeholder="設定您的密碼（至少 6 位）"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(201, 169, 97, 0.3)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a961'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201, 169, 97, 0.3)'}
              />
            </div>

            {/* 角色說明 */}
            <div style={{
              background: 'rgba(201, 169, 97, 0.1)',
              border: '1px solid rgba(201, 169, 97, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#6d685f'
            }}>
              🎮 註冊後將自動成為「冒險模式」用戶，可使用待辦事項、行程管理等功能
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading 
                  ? '#ddd' 
                  : 'linear-gradient(135deg, #c9a961, #e4c661)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? '註冊中...' : '註冊帳號'}
            </button>
          </form>
        )}

        {/* 管理員隱藏入口 */}
        <div 
          onDoubleClick={handleAdminLogin}
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(201, 169, 97, 0.5)',
            cursor: 'pointer'
          }}
        >
          v1.0.0
        </div>
      </div>
    </div>
  )
}
