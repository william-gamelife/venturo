'use client'

import { useState } from 'react'
import { DefaultAdminManager, DEFAULT_ADMIN } from '@/lib/default-admin'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [adminCreated, setAdminCreated] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const createAdmin = async () => {
    setLoading(true)
    addLog('🚀 開始創建預設管理員...')
    
    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ ' + result.message!)
        if (!result.existing) {
          addLog('📋 管理員登入資訊:')
          addLog(`   用戶名: ${DEFAULT_ADMIN.username}`)
          addLog(`   密碼: ${DEFAULT_ADMIN.password}`)
          addLog(`   Email: ${DEFAULT_ADMIN.email}`)
        }
        setAdminCreated(true)
      } else {
        addLog('❌ ' + result.message!)
      }
    } catch (error: any) {
      addLog(`❌ 錯誤: ${error.message}`)
    }
    
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    addLog('🔐 測試管理員登入...')
    
    try {
      const response = await fetch('/api/admin/test-login', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ ' + result.message!)
        addLog('🎉 現在可以使用預設管理員帳號登入了!')
        addLog(`📊 用戶資料: ${JSON.stringify(result.user, null, 2)}`)
      } else {
        addLog('❌ ' + result.message!)
        if (result.details) {
          addLog(`詳細錯誤: ${JSON.stringify(result.details, null, 2)}`)
        }
      }
    } catch (error: any) {
      addLog(`❌ 錯誤: ${error.message}`)
    }
    
    setLoading(false)
  }

  const removeAdmin = async () => {
    if (!confirm('確定要刪除預設管理員嗎？')) return
    
    setLoading(true)
    addLog('🗑️ 刪除預設管理員...')
    
    try {
      const response = await fetch('/api/admin/create', {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        addLog('✅ ' + result.message!)
        setAdminCreated(false)
      } else {
        addLog('❌ ' + result.message!)
      }
    } catch (error: any) {
      addLog(`❌ 錯誤: ${error.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div style={{ 
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <div style={{
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '24px',
          marginBottom: '32px',
          color: '#2c3e50',
          textAlign: 'center'
        }}>
          🛠️ Venturo 系統設置
        </h1>

        <div style={{
          background: '#e8f5e8',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '32px',
          border: '2px solid #4caf50'
        }}>
          <h2 style={{ fontSize: '18px', color: '#2e7d32', marginBottom: '16px' }}>
            📋 預設管理員資訊
          </h2>
          <div style={{ color: '#2e7d32', lineHeight: '1.6' }}>
            <strong>用戶名：</strong> {DEFAULT_ADMIN.username}<br/>
            <strong>密碼：</strong> {DEFAULT_ADMIN.password}<br/>
            <strong>Email：</strong> {DEFAULT_ADMIN.email}<br/>
            <strong>顯示名稱：</strong> {DEFAULT_ADMIN.displayName}
          </div>
        </div>

        {/* 操作按鈕 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={createAdmin}
              disabled={loading || adminCreated}
              style={{
                padding: '12px 24px',
                background: adminCreated ? '#95a5a6' : '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (loading || adminCreated) ? 'not-allowed' : 'pointer',
                opacity: (loading || adminCreated) ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {adminCreated ? '✅ 管理員已創建' : '🚀 創建預設管理員'}
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading || !adminCreated}
              style={{
                padding: '12px 24px',
                background: !adminCreated ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (loading || !adminCreated) ? 'not-allowed' : 'pointer',
                opacity: (loading || !adminCreated) ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🔐 測試登入
            </button>
            
            <button
              onClick={removeAdmin}
              disabled={loading || !adminCreated}
              style={{
                padding: '12px 24px',
                background: !adminCreated ? '#95a5a6' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (loading || !adminCreated) ? 'not-allowed' : 'pointer',
                opacity: (loading || !adminCreated) ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🗑️ 刪除管理員
            </button>
          </div>
        </div>

        {/* 快速導航 */}
        {adminCreated && (
          <div style={{
            background: '#fff3cd',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '32px',
            border: '2px solid #ffc107'
          }}>
            <h3 style={{ fontSize: '16px', color: '#856404', marginBottom: '12px' }}>
              🎯 快速測試導航
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="/auth/signin" style={{ 
                color: '#856404', 
                textDecoration: 'underline',
                fontSize: '14px'
              }}>
                登入頁面
              </a>
              <a href="/dashboard" style={{ 
                color: '#856404', 
                textDecoration: 'underline',
                fontSize: '14px'
              }}>
                儀表板
              </a>
              <a href="/admin/database" style={{ 
                color: '#856404', 
                textDecoration: 'underline',
                fontSize: '14px'
              }}>
                資料庫管理
              </a>
            </div>
          </div>
        )}

        {/* 執行日誌 */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#34495e' }}>
            📝 執行日誌
          </h2>
          
          <div style={{
            background: '#2c3e50',
            color: '#ecf0f1',
            padding: '16px',
            borderRadius: '8px',
            height: '300px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            {logs.length === 0 && (
              <div style={{ color: '#7f8c8d' }}>等待執行...</div>
            )}
            
            {logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))}
            
            {loading && (
              <div style={{ color: '#f39c12' }}>
                執行中...
              </div>
            )}
          </div>
        </div>

        {/* 清除日誌 */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={() => setLogs([])}
            style={{
              padding: '8px 16px',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🗑️ 清除日誌
          </button>
        </div>
      </div>
    </div>
  )
}