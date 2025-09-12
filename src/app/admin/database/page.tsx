'use client'

import { useState, useEffect } from 'react'
import { dbManager } from '@/lib/supabase/database-manager'

export default function DatabaseAdminPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runHealthCheck = async () => {
    setLoading(true)
    addLog('開始健康檢查...')
    
    try {
      const results = await dbManager.healthCheck()
      setHealthStatus(results)
      addLog('健康檢查完成 ✅')
    } catch (error: any) {
      addLog(`健康檢查失敗: ${error.message} ❌`)
    }
    
    setLoading(false)
  }

  const testUserCreation = async () => {
    setLoading(true)
    addLog('測試用戶創建...')
    
    try {
      const testUser = {
        id: 'test-' + Date.now(),
        email: 'testuser@example.com',
        username: 'testuser',
        role: 'FRIEND',
        settings: {
          display_name: 'Test User',
          world_mode: 'game',
          coins: 100
        }
      }
      
      const result = await dbManager.createUserProfile(testUser)
      
      if (result.error) {
        addLog(`用戶創建失敗: ${result.error.message} ❌`)
      } else {
        addLog('用戶創建成功 ✅')
        addLog(`創建的用戶: ${JSON.stringify(result.data)}`)
      }
    } catch (error: any) {
      addLog(`用戶創建錯誤: ${error.message} ❌`)
    }
    
    setLoading(false)
  }

  const testQuery = async () => {
    setLoading(true)
    addLog('測試通用查詢...')
    
    try {
      const result = await dbManager.query('profiles', {
        select: 'id, username, email, role',
        limit: 5
      })
      
      if (result.error) {
        addLog(`查詢失敗: ${result.error.message} ❌`)
      } else {
        addLog(`查詢成功，找到 ${result.data?.length} 筆記錄 ✅`)
        addLog(`資料: ${JSON.stringify(result.data)}`)
      }
    } catch (error: any) {
      addLog(`查詢錯誤: ${error.message} ❌`)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
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
          🛠️ Supabase 資料庫管理面板
        </h1>

        {/* 健康狀態 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#34495e' }}>
            📊 系統健康狀態
          </h2>
          
          {healthStatus && (
            <div style={{ 
              background: '#fff',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e1e8ed'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>連接狀態:</strong> {healthStatus.connection ? '✅ 正常' : '❌ 異常'}
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>認證狀態:</strong> {healthStatus.auth ? '✅ 已登入' : '❌ 未登入'}
              </div>
              
              <div>
                <strong>表格狀態:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  {Object.entries(healthStatus.tables).map(([table, status]) => (
                    <li key={table}>
                      {table}: {status ? '✅ 正常' : '❌ 異常'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 操作按鈕 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#34495e' }}>
            🔧 測試操作
          </h2>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={runHealthCheck}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              🏥 健康檢查
            </button>
            
            <button
              onClick={testUserCreation}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              👤 測試用戶創建
            </button>
            
            <button
              onClick={testQuery}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              🔍 測試查詢
            </button>
          </div>
        </div>

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
              cursor: 'pointer'
            }}
          >
            🗑️ 清除日誌
          </button>
        </div>
      </div>
    </div>
  )
}