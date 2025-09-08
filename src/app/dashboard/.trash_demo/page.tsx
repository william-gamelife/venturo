'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Validator } from '@/lib/validators'
import { ErrorHandler } from '@/lib/error-handler'
import { withPerformanceTracking } from '@/lib/performance'

export default function DemoPage() {
  const { addNotification } = useAppStore()
  const [loading, setLoading] = useState(false)

  const testNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: '🎉 操作成功完成！',
      error: '❌ 發生錯誤，請稍後再試',
      warning: '⚠️ 請注意這個警告訊息',
      info: 'ℹ️ 這是一個資訊提示'
    }
    addNotification(type, messages[type])
  }

  const testValidation = () => {
    const testData = {
      title: '', // 故意留空測試驗證
      description: 'Test description'
    }
    
    const validation = Validator.todo.create(testData)
    if (!validation.valid) {
      addNotification('error', `驗證失敗: ${validation.errors.join(', ')}`)
    } else {
      addNotification('success', '資料驗證通過！')
    }
  }

  const testPerformance = async () => {
    setLoading(true)
    
    // 模擬 API 呼叫並測試效能監控
    await withPerformanceTracking('demo_api_call', async () => {
      return new Promise(resolve => {
        setTimeout(() => {
          addNotification('success', '效能測試完成！檢查開發者工具查看結果')
          resolve('完成')
        }, Math.random() * 1000 + 500) // 500-1500ms 隨機延遲
      })
    })
    
    setLoading(false)
  }

  const testErrorHandling = () => {
    try {
      // 故意拋出錯誤
      throw new Error('測試錯誤處理')
    } catch (error) {
      const result = ErrorHandler.handle(error, 'DemoPage')
      addNotification('error', result.error || '錯誤處理測試')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🎮 CORNER-GAMELIFE 架構演示</h1>
        <p className="text-gray-600">
          測試我們新增的架構優化功能：驗證層、錯誤處理、效能監控、通知系統
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 通知系統測試 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">📢 通知系統測試</h2>
          <div className="space-y-3">
            <button 
              onClick={() => testNotification('success')}
              className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              測試成功通知
            </button>
            <button 
              onClick={() => testNotification('error')}
              className="w-full p-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              測試錯誤通知
            </button>
            <button 
              onClick={() => testNotification('warning')}
              className="w-full p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              測試警告通知
            </button>
            <button 
              onClick={() => testNotification('info')}
              className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              測試資訊通知
            </button>
          </div>
        </div>

        {/* 驗證系統測試 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">✅ 驗證系統測試</h2>
          <div className="space-y-3">
            <button 
              onClick={testValidation}
              className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              測試資料驗證
            </button>
            <div className="text-sm text-gray-600">
              <p>這會測試一個空標題的待辦事項，</p>
              <p>驗證器會攔截並顯示錯誤訊息</p>
            </div>
          </div>
        </div>

        {/* 效能監控測試 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">⏱️ 效能監控測試</h2>
          <div className="space-y-3">
            <button 
              onClick={testPerformance}
              disabled={loading}
              className="w-full p-3 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {loading ? '測試中...' : '測試 API 效能追蹤'}
            </button>
            <div className="text-sm text-gray-600">
              <p>點擊後檢查右下角的開發工具，</p>
              <p>在「效能」分頁查看監控結果</p>
            </div>
          </div>
        </div>

        {/* 錯誤處理測試 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">🚨 錯誤處理測試</h2>
          <div className="space-y-3">
            <button 
              onClick={testErrorHandling}
              className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              測試錯誤處理機制
            </button>
            <div className="text-sm text-gray-600">
              <p>故意拋出錯誤，測試錯誤處理器</p>
              <p>和用戶友好的錯誤訊息</p>
            </div>
          </div>
        </div>
      </div>

      {/* 開發工具說明 */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold mb-3">🛠️ 開發工具使用指南</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1. 開發工具面板：</strong>點擊右下角的 &lt;/&gt; 按鈕開啟</p>
          <p><strong>2. 效能監控：</strong>執行測試後在「效能」分頁查看 API 回應時間</p>
          <p><strong>3. Store 狀態：</strong>在「Store」分頁查看全局狀態</p>
          <p><strong>4. 架構資訊：</strong>在「架構」分頁查看優化完成狀況</p>
          <p><strong>5. 通知系統：</strong>所有通知會在右上角顯示，5秒後自動消失</p>
        </div>
      </div>

      {/* 架構優化摘要 */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-500">
        <h3 className="text-lg font-semibold mb-3">🎉 架構優化完成</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-1">✅</div>
            <div>驗證層</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🛡️</div>
            <div>錯誤處理</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⏱️</div>
            <div>效能監控</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🔧</div>
            <div>開發工具</div>
          </div>
        </div>
      </div>
    </div>
  )
}