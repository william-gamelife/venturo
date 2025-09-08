'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email.trim()) {
      setError('請輸入電子郵件')
      setIsLoading(false)
      return
    }
    if (!password.trim()) {
      setError('請輸入密碼')
      setIsLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (email.includes('@') && password.length >= 4) {
        const username = email.split('@')[0]
        const result = await authManager.login(username)
        
        if (result.success) {
          router.push('/dashboard')
        } else {
          setError('登入失敗，請稍後再試')
        }
      } else {
        setError('電子郵件或密碼格式不正確')
      }
    } catch (error) {
      setError('登入過程發生錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setEmail('demo@venturo.com')
    setPassword('demo123')
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement
      form.requestSubmit()
    }, 100)
  }

  // 樣式定義
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 100%)',
      padding: '20px'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(201, 169, 97, 0.2)',
      padding: '48px',
      width: '100%',
      maxWidth: '420px'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#3a3833',
      marginBottom: '8px',
      background: 'linear-gradient(135deg, #c9a961, #e4c661)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6d685f',
      fontWeight: '500'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    label: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#3a3833',
      marginBottom: '4px'
    },
    input: {
      padding: '16px',
      border: '2px solid rgba(201, 169, 97, 0.3)',
      borderRadius: '12px',
      fontSize: '16px',
      background: 'white',
      transition: 'all 0.3s ease',
      width: '100%',
      fontWeight: '500',
      outline: 'none',
      boxSizing: 'border-box' as const
    },
    inputFocus: {
      borderColor: '#c9a961',
      boxShadow: '0 0 0 4px rgba(201, 169, 97, 0.15)',
      transform: 'translateY(-1px)'
    },
    inputDisabled: {
      background: '#f5f5f5',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    passwordContainer: {
      position: 'relative' as const
    },
    passwordInput: {
      paddingRight: '48px'
    },
    passwordToggle: {
      position: 'absolute' as const,
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      fontSize: '18px'
    },
    button: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #c9a961, #e4c661)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 20px rgba(201, 169, 97, 0.3)',
      boxSizing: 'border-box' as const
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    demoSection: {
      textAlign: 'center' as const,
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '1px solid rgba(201, 169, 97, 0.2)'
    },
    demoText: {
      color: '#6d685f',
      fontSize: '14px',
      marginBottom: '12px'
    },
    demoButton: {
      width: '100%',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(228, 198, 97, 0.1))',
      color: '#c9a961',
      border: '1px solid rgba(201, 169, 97, 0.3)',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box' as const
    },
    errorMessage: {
      background: 'linear-gradient(135deg, #fee, #fdd)',
      color: '#c00',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '16px',
      textAlign: 'center' as const,
      border: '2px solid #fcc',
      fontWeight: '600'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>VENTURO</h1>
          <p style={styles.subtitle}>智能生活管理平台</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>電子郵件</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入您的電子郵件"
              style={{
                ...styles.input,
                ...(isLoading ? styles.inputDisabled : {})
              }}
              disabled={isLoading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>密碼</label>
            <div style={styles.passwordContainer}>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                style={{
                  ...styles.input,
                  ...styles.passwordInput,
                  ...(isLoading ? styles.inputDisabled : {})
                }}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                style={{
                  ...styles.passwordToggle,
                  ...(isLoading ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorMessage}>{error}</div>
          )}

          <button 
            type="submit"
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
            disabled={isLoading}
          >
            {isLoading ? '登入中...' : '登入 VENTURO'}
          </button>

          <div style={styles.demoSection}>
            <p style={styles.demoText}>或者使用演示帳號：</p>
            <button 
              type="button"
              style={{
                ...styles.demoButton,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              🚀 快速體驗
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
