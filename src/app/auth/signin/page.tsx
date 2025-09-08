'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [devMode, setDevMode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  // 檢查是否為開發模式
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDevMode(true)
      console.log('🔧 開發模式已啟用')
    }
  }, [])

  // 倒數計時
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 開發模式 - 繞過 Supabase 直接進入
  const handleDevModeLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      console.log('🚀 開發模式 - 繞過認證直接進入...')
      
      // 設定假的 session 資料
      const mockUser = {
        id: 'dev-user-001',
        email: 'dev@venturo.app',
        user_metadata: {
          username: 'dev_user',
          display_name: '開發測試員'
        }
      }

      // 儲存到 localStorage (僅供開發使用)
      if (typeof window !== 'undefined') {
        localStorage.setItem('dev_mode', 'true')
        localStorage.setItem('dev_user', JSON.stringify(mockUser))
        
        console.log('✅ 開發模式登入成功！')
        
        // 延遲一下讓使用者看到成功訊息
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 直接導向儀表板
        router.push('/dashboard')
      }
      
    } catch (err: any) {
      console.error('開發模式登入失敗:', err)
      setError('開發模式登入失敗')
      setIsLoading(false)
    }
  }

  // 測試登入功能 (改良版，避免頻率限制)
  const handleTestLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      // 使用多個備用測試帳號，避免單一帳號被限制
      const testAccounts = [
        { email: 'test1@venturo.app', password: 'test123456' },
        { email: 'test2@venturo.app', password: 'test123456' },
        { email: 'test3@venturo.app', password: 'test123456' },
      ]

      // 隨機選擇一個測試帳號
      const account = testAccounts[Math.floor(Math.random() * testAccounts.length)]
      
      console.log('🚀 嘗試測試登入...')

      // 只嘗試登入，不嘗試註冊（避免觸發頻率限制）
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      })

      if (signInError) {
        // 如果登入失敗，可能是帳號不存在
        if (signInError.message.includes('security purposes')) {
          // 設定倒數計時
          const waitTime = parseInt(signInError.message.match(/\d+/)?.[0] || '60')
          setCountdown(waitTime)
          throw new Error(`請等待 ${waitTime} 秒後再試`)
        }
        
        // 如果是其他錯誤，使用開發模式登入
        console.log('測試帳號登入失敗，切換到開發模式...')
        await handleDevModeLogin()
        return
      }

      console.log('✅ 測試登入成功！')
      router.push('/dashboard')
      
    } catch (err: any) {
      console.error('測試登入失敗:', err)
      setError(err.message || '測試登入失敗')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 如果是開發模式且輸入 "dev"，使用開發模式登入
      if (devMode && formData.username === 'dev' && formData.password === 'dev') {
        await handleDevModeLogin()
        return
      }

      // 正常登入流程
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', formData.username)
        .maybeSingle()
      
      const email = profile?.email || `${formData.username}@example.com`
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password
      })

      if (error) {
        if (error.message.includes('security purposes')) {
          const waitTime = parseInt(error.message.match(/\d+/)?.[0] || '60')
          setCountdown(waitTime)
          throw new Error(`請等待 ${waitTime} 秒後再試`)
        }
        throw error
      }
      
      router.push('/dashboard')
      
    } catch (err: any) {
      console.error('登入失敗:', err)
      setError(err.message || '帳號或密碼錯誤')
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>VENTURO</h1>
          <p>歡迎回到智能生活管理平台</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>帳號名稱</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="請輸入您的帳號名稱"
              className="login-input"
              disabled={isLoading || countdown > 0}
              required
            />
          </div>

          <div className="form-group">
            <label>密碼</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="請輸入密碼"
                className="login-input"
                disabled={isLoading || countdown > 0}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || countdown > 0}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              {countdown > 0 && (
                <div style={{marginTop: '8px', fontSize: '14px'}}>
                  請等待 {countdown} 秒...
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || countdown > 0}
          >
            {isLoading ? '登入中...' : 
             countdown > 0 ? `請等待 ${countdown} 秒` : 
             '登入 VENTURO'}
          </button>

          {/* 開發模式快速登入 */}
          {devMode && (
            <div className="dev-mode-section">
              <div className="dev-mode-divider">
                <span>開發模式</span>
              </div>
              
              {/* 開發模式直接進入（繞過 Supabase） */}
              <button
                type="button"
                className="dev-login-button"
                onClick={handleDevModeLogin}
                disabled={isLoading}
              >
                🔧 開發模式直接進入（繞過認證）
              </button>
              
              {/* 測試帳號登入（需要 Supabase） */}
              <button
                type="button"
                className="test-login-button"
                onClick={handleTestLogin}
                disabled={isLoading || countdown > 0}
              >
                🚀 測試帳號登入（需等待冷卻）
              </button>
              
              <p className="dev-mode-hint">
                提示：使用 dev/dev 或點擊「開發模式直接進入」
              </p>
            </div>
          )}

          <div className="demo-section">
            <p>還沒有帳號？</p>
            <a href="/auth/signup" className="demo-button" style={{textDecoration: 'none', display: 'inline-block'}}>
              🚀 立即註冊
            </a>
          </div>
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

        .login-input {
          padding: 16px;
          border: 2px solid var(--color-border, rgba(201, 169, 97, 0.3));
          border-radius: 12px;
          font-size: 16px;
          background: var(--color-card, white);
          transition: all 0.3s ease;
          width: 100%;
          font-weight: 500;
        }

        .login-input:focus {
          outline: none;
          border-color: var(--color-primary, #c9a961);
          box-shadow: 0 0 0 4px var(--color-border, rgba(201, 169, 97, 0.15));
          transform: translateY(-1px);
        }

        .login-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .password-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
          font-size: 18px;
        }

        .password-toggle:hover:not(:disabled) {
          background: var(--color-border, rgba(201, 169, 97, 0.1));
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .demo-section {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--color-border, rgba(201, 169, 97, 0.2));
        }

        .demo-section p {
          color: var(--color-textLight, #6d685f);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .demo-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(228, 198, 97, 0.1));
          color: var(--color-primary, #c9a961);
          border: 1px solid var(--color-border, rgba(201, 169, 97, 0.3));
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .demo-button:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(201, 169, 97, 0.2), rgba(228, 198, 97, 0.2));
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.2);
        }

        .demo-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        /* 開發模式樣式 */
        .dev-mode-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px dashed rgba(241, 196, 15, 0.3);
        }

        .dev-mode-divider {
          text-align: center;
          margin-bottom: 16px;
          position: relative;
        }

        .dev-mode-divider span {
          background: white;
          padding: 0 12px;
          color: #d68910;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .dev-login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
          margin-bottom: 10px;
        }

        .dev-login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
        }

        .test-login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
        }

        .test-login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
        }

        .test-login-button:disabled,
        .dev-login-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dev-mode-hint {
          text-align: center;
          color: #d68910;
          font-size: 12px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  )
}
