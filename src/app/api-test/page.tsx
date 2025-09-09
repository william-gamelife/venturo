'use client'

import { useState, useEffect } from 'react'
import { BaseAPI } from '@/lib/base-api'
import { ProjectAPI } from '@/lib/api/ProjectAPI'
import { StatusTodoAPI } from '@/lib/api/StatusTodoAPI'

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // 取得當前使用者（從開發模式）
    if (typeof window !== 'undefined' && localStorage.getItem('dev_mode') === 'true') {
      const devUser = JSON.parse(localStorage.getItem('dev_user') || '{}')
      if (devUser.id) {
        setCurrentUser(devUser)
      }
    }
  }, [])

  const addTestResult = (name: string, status: 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      name,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    }])
  }

  const runApiTests = async () => {
    if (!currentUser) {
      alert('請先登入')
      return
    }

    setIsLoading(true)
    setTestResults([])

    const userId = currentUser.id

    try {
      // 測試 1: BaseAPI 基本功能
      addTestResult('BaseAPI 載入測試', 'success', '開始測試 BaseAPI...')
      
      // 測試儲存資料
      const testData = [
        { id: '1', name: '測試項目1', value: 100 },
        { id: '2', name: '測試項目2', value: 200 }
      ]
      
      const saveResult = await BaseAPI.saveData('test_module', userId, testData)
      if (saveResult.success) {
        addTestResult('BaseAPI 儲存', 'success', '儲存成功', saveResult.data)
      } else {
        addTestResult('BaseAPI 儲存', 'error', saveResult.error || '儲存失敗')
      }

      // 測試載入資料
      const loadedData = await BaseAPI.loadData('test_module', userId)
      addTestResult('BaseAPI 載入', 'success', `載入 ${loadedData.length} 筆資料`, loadedData)

      // 測試 2: ProjectAPI
      addTestResult('ProjectAPI 測試', 'success', '開始測試 ProjectAPI...')
      
      // 建立測試專案
      const projectResult = await ProjectAPI.create(userId, {
        title: '測試專案',
        description: '這是一個測試專案',
        status: 'active',
        color: '#f59e0b',
        tasks: []
      })
      
      if (projectResult.success) {
        addTestResult('建立專案', 'success', '專案建立成功', projectResult.data)
        
        // 新增任務到專案
        if (projectResult.data) {
          const taskResult = await ProjectAPI.addTask(userId, projectResult.data.id, {
            title: '測試任務',
            status: 'todo'
          })
          
          if (taskResult.success) {
            addTestResult('新增任務', 'success', '任務新增成功', taskResult.data)
          } else {
            addTestResult('新增任務', 'error', taskResult.error || '新增失敗')
          }
        }
      } else {
        addTestResult('建立專案', 'error', projectResult.error || '建立失敗')
      }

      // 取得所有專案
      const allProjects = await ProjectAPI.getAll(userId)
      addTestResult('取得專案列表', 'success', `找到 ${allProjects.length} 個專案`, allProjects)

      // 測試 3: TodoAPI
      addTestResult('TodoAPI 測試', 'success', '開始測試 TodoAPI...')
      
      // 建立測試待辦事項
      const todoResult = await StatusTodoAPI.create(userId, {
        title: '測試待辦事項',
        description: '這是測試用的待辦事項',
        priority: 'medium',
        status: 'todo',
        category: 'work'
      })
      
      if (todoResult.success) {
        addTestResult('建立待辦事項', 'success', '待辦事項建立成功', todoResult.data)
      } else {
        addTestResult('建立待辦事項', 'error', todoResult.error || '建立失敗')
      }

      // 取得所有待辦事項
      const allTodos = await StatusTodoAPI.getAll(userId)
      addTestResult('取得待辦事項', 'success', `找到 ${allTodos.length} 個待辦事項`, allTodos)

      // 測試 4: LocalStorage 檢查
      addTestResult('LocalStorage 檢查', 'success', '檢查 LocalStorage 內容...')
      
      const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('gamelife_'))
      const storageData: Record<string, any> = {}
      
      localStorageKeys.forEach(key => {
        try {
          storageData[key] = JSON.parse(localStorage.getItem(key) || '[]')
        } catch {
          storageData[key] = localStorage.getItem(key)
        }
      })
      
      addTestResult('LocalStorage 內容', 'success', `找到 ${localStorageKeys.length} 個資料鍵`, storageData)

      // 測試 5: 環境變數檢查
      addTestResult('環境變數檢查', 'success', '檢查環境變數設定...')
      
      const envData = {
        NODE_ENV: process.env.NODE_ENV,
        API_URL: process.env.NEXT_PUBLIC_API_URL,
        AUTH_MODE: localStorage.getItem('dev_mode') === 'true' ? '開發模式' : '正式模式',
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已設定' : '未設定'
      }
      
      addTestResult('環境變數', 'success', '環境變數檢查完成', envData)

    } catch (error) {
      addTestResult('測試錯誤', 'error', error instanceof Error ? error.message : '未知錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllData = () => {
    if (confirm('確定要清除所有測試資料嗎？')) {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('gamelife_'))
      keys.forEach(key => localStorage.removeItem(key))
      setTestResults([])
      addTestResult('清除資料', 'success', `已清除 ${keys.length} 個資料鍵`)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 標題 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #c9a961, #e4c661)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            🔧 API 測試工具
          </h1>
          <p style={{ color: '#6d685f', fontSize: '16px' }}>
            測試本地 API 和資料儲存功能
          </p>
          
          {currentUser && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(201, 169, 97, 0.1)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6d685f'
            }}>
              當前使用者：{currentUser.user_metadata?.display_name} ({currentUser.id})
            </div>
          )}
        </div>

        {/* 控制按鈕 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <button
            onClick={runApiTests}
            disabled={isLoading || !currentUser}
            style={{
              padding: '12px 24px',
              background: currentUser 
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: currentUser ? 'pointer' : 'not-allowed',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? '測試中...' : '開始測試'}
          </button>
          
          <button
            onClick={clearAllData}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            清除測試資料
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#c9a961',
              border: '2px solid #c9a961',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            返回首頁
          </button>
        </div>

        {/* 測試結果 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          minHeight: '400px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#3a3833'
          }}>
            測試結果
          </h2>
          
          {testResults.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6d685f'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>
                📋
              </div>
              <p>尚未執行測試</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                點擊「開始測試」按鈕執行 API 測試
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: result.status === 'success' 
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    border: `2px solid ${result.status === 'success' ? '#10b981' : '#ef4444'}`,
                    borderRadius: '8px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {result.status === 'success' ? '✅' : '❌'}
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#3a3833'
                    }}>
                      {result.name}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6d685f',
                      marginLeft: 'auto'
                    }}>
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: '14px',
                    color: '#6d685f',
                    marginLeft: '32px'
                  }}>
                    {result.message}
                  </div>
                  
                  {result.data && (
                    <details style={{ marginLeft: '32px', marginTop: '8px' }}>
                      <summary style={{
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#c9a961',
                        fontWeight: '600'
                      }}>
                        查看詳細資料
                      </summary>
                      <pre style={{
                        marginTop: '8px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API 說明 */}
        <div style={{
          marginTop: '24px',
          background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(228, 198, 97, 0.05))',
          borderLeft: '4px solid #c9a961',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#c9a961',
            marginBottom: '12px'
          }}>
            📚 API 系統說明
          </h3>
          <div style={{
            fontSize: '14px',
            color: '#6d685f',
            lineHeight: '1.8'
          }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>本地儲存模式：</strong>
              目前系統使用 LocalStorage 作為資料儲存，所有資料都存在瀏覽器本地。
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>API 架構：</strong>
              BaseAPI 提供統一的 CRUD 操作，各模組（如 ProjectAPI、TodoAPI）繼承基礎功能。
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>資料格式：</strong>
              資料以 JSON 格式儲存，鍵值格式為 gamelife_[模組名]_[使用者ID]。
            </p>
            <p>
              <strong>同步機制：</strong>
              系統會標記需要同步的資料，未來可整合雲端儲存服務。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
