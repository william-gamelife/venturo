'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { venturoAuth } from '@/lib/venturo-auth'
import { VersionIndicator } from '@/components/VersionIndicator'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 登入表單
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    // 檢查是否已經登入
    venturoAuth.getCurrentUser().then(currentUser => {
      if (currentUser) {
        router.push('/dashboard')
      }
    })
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
      // 使用 Supabase 雲端認證
      const result = await venturoAuth.login(loginForm.email, loginForm.password)
      
      if (result.success && result.user) {
        console.log('✅ 雲端登入成功:', result.user.email)
        router.push('/dashboard')
      } else {
        setError(result.error || '登入失敗')
      }
      
    } catch (error) {
      console.error('登入錯誤:', error)
      setError('登入失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
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
            marginBottom: '30px'
          }}>
            歡迎回來！請登入您的帳號
          </p>
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

        {/* 版本資訊 */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'rgba(201, 169, 97, 0.5)'
        }}>
          v1.0.0
        </div>
        
        {/* 雲端認證說明 */}
        <div style={{
          marginTop: '15px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'rgba(109, 104, 95, 0.7)'
        }}>
          全雲端認證系統 | 使用 Supabase 進行身份驗證
        </div>
      </div>
      
      {/* 版本指示器暫時移除以測試基本功能 */}
    </div>
  )
}
