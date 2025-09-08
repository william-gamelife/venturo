'use client'

import { useState, useEffect } from 'react'
import { TodoAPI } from '@/lib/api/TodoAPI'
import { authManager } from '@/lib/auth'

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = authManager.getCurrentUser()
    if (user) {
      setCurrentUser(user)
      addResult(`✅ 登入用戶: ${user.username}`)
    }
  }, [])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  // 測試 1: 新增待辦事項
  const testCreate = async () => {
    if (!currentUser) {
      addResult('❌ 請先登入')
      return
    }

    addResult('🧪 測試新增待辦事項...')
    const result = await TodoAPI.create(currentUser.id, {
      title: '測試待辦事項 ' + Date.now(),
      description: '這是使用新 BaseAPI 建立的',
      priority: 'high',
      completed: false,
      tags: ['測試', 'API']
    })

    if (result.success) {
      addResult(`✅ 新增成功! ID: ${result.data?.id}`)
    } else {
      addResult(`❌ 新增失敗: ${result.error}`)
    }
  }

  // 測試 2: 查詢所有待辦事項
  const testGetAll = async () => {
    if (!currentUser) {
      addResult('❌ 請先登入')
      return
    }

    addResult('🧪 測試查詢所有待辦事項...')
    const todos = await TodoAPI.getAll(currentUser.id)
    addResult(`✅ 找到 ${todos.length} 筆待辦事項`)
  }

  // 測試 3: 取得統計資料
  const testGetStats = async () => {
    if (!currentUser) {
      addResult('❌ 請先登入')
      return
    }

    addResult('🧪 測試統計功能...')
    const stats = await TodoAPI.getStats(currentUser.id)
    addResult(`✅ 統計資料:`)
    addResult(`   - 總數: ${stats.total}`)
    addResult(`   - 已完成: ${stats.completed}`)
    addResult(`   - 待處理: ${stats.pending}`)
    addResult(`   - 高優先: ${stats.highPriority}`)
  }

  // 測試 4: 批量操作
  const testBulkOperation = async () => {
    if (!currentUser) {
      addResult('❌ 請先登入')
      return
    }

    addResult('🧪 測試批量操作...')
    
    // 先建立幾筆測試資料
    const ids = []
    for (let i = 0; i < 3; i++) {
      const result = await TodoAPI.create(currentUser.id, {
        title: `批量測試 ${i + 1}`,
        priority: 'low',
        completed: false
      })
      if (result.success && result.data) {
        ids.push(result.data.id)
      }
    }
    addResult(`✅ 建立 ${ids.length} 筆測試資料`)

    // 批量完成
    const bulkResult = await TodoAPI.bulkComplete(currentUser.id, ids)
    if (bulkResult.success) {
      addResult(`✅ 批量完成成功`)
    }

    // 批量刪除
    const deleteResult = await TodoAPI.bulkDelete(currentUser.id, ids)
    if (deleteResult.success) {
      addResult(`✅ 批量刪除成功`)
    }
  }

  // 測試 5: 搜尋功能
  const testSearch = async () => {
    if (!currentUser) {
      addResult('❌ 請先登入')
      return
    }

    addResult('🧪 測試搜尋功能...')
    const results = await TodoAPI.search(currentUser.id, '測試')
    addResult(`✅ 搜尋 "測試" 找到 ${results.length} 筆結果`)
  }

  // 執行所有測試
  const runAllTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    addResult('🚀 開始執行 BaseAPI 測試套件...')
    
    await testCreate()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testGetAll()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testGetStats()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testBulkOperation()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testSearch()
    
    addResult('✨ 所有測試完成!')
    setIsLoading(false)
  }

  return (
    <div className="api-test-page">
      <div className="test-header">
        <h1>🧪 BaseAPI 測試中心</h1>
        <p>測試新的 API 抽象層是否正常運作</p>
      </div>

      <div className="test-controls">
        <button 
          onClick={runAllTests}
          disabled={isLoading || !currentUser}
          className="test-button primary"
        >
          {isLoading ? '測試中...' : '執行所有測試'}
        </button>

        <div className="individual-tests">
          <button onClick={testCreate} disabled={isLoading} className="test-button">
            新增測試
          </button>
          <button onClick={testGetAll} disabled={isLoading} className="test-button">
            查詢測試
          </button>
          <button onClick={testGetStats} disabled={isLoading} className="test-button">
            統計測試
          </button>
          <button onClick={testBulkOperation} disabled={isLoading} className="test-button">
            批量測試
          </button>
          <button onClick={testSearch} disabled={isLoading} className="test-button">
            搜尋測試
          </button>
        </div>
      </div>

      <div className="test-results">
        <h3>測試結果：</h3>
        <div className="results-container">
          {testResults.length === 0 ? (
            <p className="no-results">尚未執行測試</p>
          ) : (
            testResults.map((result, index) => (
              <div 
                key={index} 
                className={`result-line ${
                  result.includes('✅') ? 'success' : 
                  result.includes('❌') ? 'error' : 
                  result.includes('🧪') ? 'testing' : ''
                }`}
              >
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .api-test-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px;
        }

        .test-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 32px;
          border-radius: 20px;
          margin-bottom: 32px;
          text-align: center;
        }

        .test-header h1 {
          font-size: 32px;
          margin: 0 0 8px 0;
        }

        .test-header p {
          font-size: 16px;
          opacity: 0.9;
        }

        .test-controls {
          background: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .test-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f3f4f6;
          color: #374151;
          margin-right: 12px;
          margin-bottom: 12px;
        }

        .test-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .test-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .test-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 16px;
          padding: 14px 32px;
        }

        .individual-tests {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .test-results {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .test-results h3 {
          margin: 0 0 16px 0;
          color: #374151;
        }

        .results-container {
          background: #1e1e1e;
          padding: 16px;
          border-radius: 8px;
          max-height: 400px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }

        .no-results {
          color: #6b7280;
          text-align: center;
          padding: 32px;
        }

        .result-line {
          color: #d1d5db;
          padding: 4px 0;
          line-height: 1.5;
        }

        .result-line.success {
          color: #10b981;
        }

        .result-line.error {
          color: #ef4444;
        }

        .result-line.testing {
          color: #60a5fa;
        }
      `}</style>
    </div>
  )
}
