'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { dbManager } from '@/lib/supabase/database-manager'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })

  const validateForm = () => {
    // 用戶名驗證
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      setError('用戶名需要 3-20 個字元，只能包含英文、數字和底線')
      return false
    }

    // Email 驗證（如果有填寫）
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('請輸入有效的 Email')
      return false
    }

    // 密碼長度
    if (formData.password.length < 6) {
      setError('密碼至少需要 6 個字元')
      return false
    }

    // 密碼確認
    if (formData.password !== formData.confirmPassword) {
      setError('兩次輸入的密碼不一致')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // 使用真實 email 或生成有效的測試 email
      const authEmail = formData.email || `${formData.username}@example.com`
      
      // 1. 註冊到 Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            display_name: formData.displayName || formData.username,
            real_email: formData.email || null
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('註冊失敗')

      // 2. 建立 Profile（使用 DatabaseManager）
      const profileResult = await dbManager.createUserProfile({
        id: authData.user.id,
        email: authEmail,
        username: formData.username,
        role: 'user',  // 使用小寫的 user
        settings: {
          display_name: formData.displayName || formData.username,
          real_email: formData.email || null,
          world_mode: 'game',
          coins: 100,
          is_active: true
        }
      })
      
      const profileError = profileResult.error

      if (profileError) {
        console.error('Profile 建立失敗:', profileError)
        // 不中斷流程，因為 Auth 已經建立
      }

      // 3. 自動登入
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: formData.password
      })

      if (signInError) {
        // 註冊成功但登入失敗，導向登入頁
        router.push('/auth/signin?registered=true')
      } else {
        // 成功，導向儀表板
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('註冊錯誤:', err)
      if (err.message?.includes('already registered')) {
        setError('此用戶名已被使用')
      } else {
        setError(err.message || '註冊失敗，請稍後再試')
      }
      setLoading(false)
    }
  }

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 50%, #d4c4b0 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative' as const,
  }

  const backButtonStyle = {
    position: 'absolute' as const,
    top: '20px',
    left: '20px',
    display: 'flex',
    alignItems: 'center',
    color: '#6d685f',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  }

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid rgba(201, 169, 97, 0.2)',
  }

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '32px',
  }

  const logoStyle = {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #c9a961, #a08550)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: '800',
    color: 'white',
    margin: '0 auto 20px auto',
    boxShadow: '0 8px 32px rgba(201, 169, 97, 0.3)',
  }

  const inputStyle = {
    padding: '16px',
    border: '2px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '12px',
    fontSize: '16px',
    background: 'white',
    transition: 'all 0.3s ease',
    width: '100%',
    fontWeight: '500',
  }

  const buttonStyle = {
    padding: '18px',
    background: 'linear-gradient(135deg, #c9a961, #a08550)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '8px',
    opacity: loading ? 0.6 : 1,
    width: '100%',
  }

  return (
    <div style={containerStyle}>
      {/* 返回按鈕 */}
      <Link href="/" style={backButtonStyle}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回首頁
      </Link>

      <div style={cardStyle}>
        {/* Logo 和標題 */}
        <div style={headerStyle}>
          <div style={logoStyle}>V</div>
          <h1 style={{fontSize: '28px', fontWeight: '800', color: '#3a3833', margin: '0 0 8px 0'}}>加入 VENTURO</h1>
          <p style={{color: '#6d685f', fontSize: '16px', margin: '0', fontWeight: '500'}}>創建你的冒險者帳號</p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div style={{
            background: 'rgba(231, 76, 60, 0.1)',
            color: '#e74c3c',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* 註冊表單 */}
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {/* 用戶名 */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label style={{fontSize: '16px', fontWeight: '600', color: '#3a3833', marginBottom: '4px'}}>
              用戶名 <span style={{color: '#e74c3c'}}>*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
              placeholder="例如：william_chen"
              required
              maxLength={20}
              style={inputStyle}
              disabled={loading}
            />
            <small style={{color: '#6d685f', fontSize: '12px'}}>
              3-20個字元，用於登入（只能英文、數字、底線）
            </small>
          </div>

          {/* Email (選填) */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label style={{fontSize: '16px', fontWeight: '600', color: '#3a3833', marginBottom: '4px'}}>
              Email <span style={{color: '#6d685f'}}>(選填)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
              style={inputStyle}
              disabled={loading}
            />
            <small style={{color: '#6d685f', fontSize: '12px'}}>
              用於密碼重設和接收通知
            </small>
          </div>

          {/* 密碼 */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label style={{fontSize: '16px', fontWeight: '600', color: '#3a3833', marginBottom: '4px'}}>
              密碼 <span style={{color: '#e74c3c'}}>*</span>
            </label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="至少 6 個字元"
                required
                minLength={6}
                style={inputStyle}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '18px',
                }}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* 確認密碼 */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label style={{fontSize: '16px', fontWeight: '600', color: '#3a3833', marginBottom: '4px'}}>
              確認密碼 <span style={{color: '#e74c3c'}}>*</span>
            </label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="再次輸入密碼"
                required
                style={inputStyle}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '18px',
                }}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* 顯示名稱 */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label style={{fontSize: '16px', fontWeight: '600', color: '#3a3833', marginBottom: '4px'}}>
              顯示名稱 <span style={{color: '#6d685f'}}>(選填)</span>
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              placeholder="例如：威廉"
              style={inputStyle}
              disabled={loading}
            />
            <small style={{color: '#6d685f', fontSize: '12px'}}>
              在系統中顯示的暱稱
            </small>
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? '創建中...' : '創建 VENTURO 帳號'}
          </button>
        </form>

        {/* 登入連結 */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(201, 169, 97, 0.2)',
        }}>
          <p style={{color: '#6d685f', fontSize: '14px', marginBottom: '12px'}}>
            已有帳號？
            <Link href="/auth/signin" style={{color: '#c9a961', textDecoration: 'none', marginLeft: '8px', fontWeight: '600'}}>
              立即登入
            </Link>
          </p>
        </div>

        {/* 註冊提示 */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(201, 169, 97, 0.2)',
        }}>
          <div style={{
            padding: '12px',
            background: 'rgba(241, 196, 15, 0.1)',
            border: '1px solid rgba(241, 196, 15, 0.3)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#d68910'
          }}>
            <strong>第一個註冊的用戶：</strong><br/>
            請使用 <strong>william</strong> 作為用戶名，將自動成為管理員
          </div>
        </div>
      </div>
    </div>
  )
}