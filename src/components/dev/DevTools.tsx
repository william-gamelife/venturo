'use client'

import { useState, useEffect } from 'react'
import { PerformanceMonitor } from '@/lib/performance'
import { useAppStore } from '@/store/useAppStore'

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'performance' | 'store' | 'logs'>('performance')
  const [performanceData, setPerformanceData] = useState<any>({})

  // 開發環境才顯示
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const refreshPerformanceData = () => {
    setPerformanceData(PerformanceMonitor.getMetrics())
  }

  useEffect(() => {
    if (isOpen && activeTab === 'performance') {
      refreshPerformanceData()
      const interval = setInterval(refreshPerformanceData, 2000)
      return () => clearInterval(interval)
    }
  }, [isOpen, activeTab])

  const PerformanceTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">效能監控</h3>
        <div className="space-x-2">
          <button 
            onClick={refreshPerformanceData}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            刷新
          </button>
          <button 
            onClick={() => {
              PerformanceMonitor.clearMetrics()
              refreshPerformanceData()
            }}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded"
          >
            清空
          </button>
          <button 
            onClick={() => PerformanceMonitor.logSummary()}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded"
          >
            輸出摘要
          </button>
        </div>
      </div>
      
      {Object.keys(performanceData).length === 0 ? (
        <p className="text-gray-500">尚無效能資料</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(performanceData).map(([name, stats]: [string, any]) => (
            <div key={name} className="p-3 bg-gray-50 rounded border">
              <div className="font-medium text-sm mb-1">{name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>呼叫次數: {stats.count}</div>
                <div>平均時間: {stats.avg.toFixed(2)}ms</div>
                <div>總時間: {stats.total.toFixed(2)}ms</div>
                <div>範圍: {stats.min.toFixed(2)} - {stats.max.toFixed(2)}ms</div>
              </div>
              <div className="mt-1">
                <div 
                  className={`w-full h-2 rounded ${
                    stats.avg < 100 ? 'bg-green-200' :
                    stats.avg < 500 ? 'bg-yellow-200' : 'bg-red-200'
                  }`}
                >
                  <div 
                    className={`h-full rounded ${
                      stats.avg < 100 ? 'bg-green-500' :
                      stats.avg < 500 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (stats.avg / 1000) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const StoreTab = () => {
    const { notifications, globalLoading, globalError } = useAppStore()

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Store 狀態</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded border">
            <h4 className="font-medium text-sm mb-2">App Store</h4>
            <div className="text-xs space-y-1">
              <div>通知數量: {notifications.length}</div>
              <div>全局載入: {globalLoading ? '是' : '否'}</div>
              <div>全局錯誤: {globalError || '無'}</div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded border">
            <h4 className="font-medium text-sm mb-2">CORNER-GAMELIFE 系統</h4>
            <div className="text-xs space-y-1">
              <div>狀態: 運行中</div>
              <div>端口: 1069</div>
              <div>環境: 開發環境</div>
              <div>主題: 遊戲化生活管理</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const LogsTab = () => (
    <div className="space-y-4">
      <h3 className="font-semibold">系統日誌</h3>
      <div className="text-sm text-gray-600">
        <p>架構優化已完成：</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>✅ 驗證層系統</li>
          <li>✅ 錯誤處理機制</li>
          <li>✅ 效能監控工具</li>
          <li>✅ Zustand 狀態管理</li>
          <li>✅ 通知系統</li>
          <li>✅ 開發者工具</li>
        </ul>
        <p className="mt-3 text-xs text-green-600">
          🎉 所有架構優化已成功應用到 CORNER-GAMELIFE！
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* 觸發按鈕 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 flex items-center justify-center z-40"
        title="開發者工具"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* DevTools 面板 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div 
            className="absolute inset-0 bg-black bg-opacity-25" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative bg-white w-96 h-2/3 shadow-xl border-l border-t rounded-tl-lg flex flex-col">
            {/* 標題列 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">CORNER-GAMELIFE 開發工具</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* 標籤列 */}
            <div className="flex border-b">
              {[
                { id: 'performance', label: '效能' },
                { id: 'store', label: 'Store' },
                { id: 'logs', label: '架構' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-sm border-r ${
                    activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 內容區域 */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === 'performance' && <PerformanceTab />}
              {activeTab === 'store' && <StoreTab />}
              {activeTab === 'logs' && <LogsTab />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}