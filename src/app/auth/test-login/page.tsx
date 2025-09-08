'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function TestLoginPage() {
  const router = useRouter()

  useEffect(() => {
    async function setupTestUser() {
      console.log('🚀 設定測試模式...')
      
      // 使用測試帳號直接登入
      const testEmail = 'test@venturo.app'
      const testPassword = 'test123456'
      
      try {
        // 先嘗試登入
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        })

        if (signInError) {
          console.log('測試帳號不存在，建立新帳號...')
          
          // 如果登入失敗，建立測試帳號
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
              data: {
                username: 'test_user',
                display_name: '測試冒險者',
                real_email: null
              }
            }
          })

          if (signUpError) {
            console.error('建立測試帳號失敗:', signUpError)
            alert('無法建立測試帳號: ' + signUpError.message)
            return
          }

          // 建立成功後登入
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
          })

          if (loginError) {
            console.error('登入失敗:', loginError)
            alert('登入失敗: ' + loginError.message)
            return
          }
        }

        console.log('✅ 測試登入成功！')
        
        // 等待一秒確保 session 建立
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 導向儀表板
        router.push('/dashboard')
        
      } catch (error) {
        console.error('測試登入錯誤:', error)
        alert('發生錯誤，請查看控制台')
      }
    }

    setupTestUser()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        padding: '48px',
        maxWidth: '420px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #c9a961, #e4c661)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px'
        }}>
          VENTURO 測試模式
        </h1>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#6d685f' }}>🚀 正在自動登入測試帳號...</p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            測試帳號: test@venturo.app<br/>
            密碼: test123456
          </p>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'rgba(241, 196, 15, 0.1)',
          border: '1px solid rgba(241, 196, 15, 0.3)',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#d68910'
        }}>
          <strong>開發模式提示：</strong><br/>
          此頁面僅供開發測試使用<br/>
          正式上線前請移除
        </div>
        
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(201, 169, 97, 0.2)'
        }}>
          <a 
            href="/auth/signin" 
            style={{
              color: '#c9a961',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            返回正常登入
          </a>
        </div>
      </div>
    </div>
  )
}
