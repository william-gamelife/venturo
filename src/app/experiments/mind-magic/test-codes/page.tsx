'use client'

import { useState } from 'react'
import { calculateResult, PatternCodeUtils } from '@/data/mind-magic-questions'

export default function TestCodesPage() {
  const [results, setResults] = useState<any[]>([])

  const generateRandomTest = () => {
    // 生成隨機答案（模擬用戶作答）
    const answers: { [key: number]: number } = {}
    for (let i = 0; i < 60; i++) {
      answers[i] = [0, 1, 2, 3, 4][Math.floor(Math.random() * 5)] // 0-4對應5個選項
    }

    const result = calculateResult(answers)
    const analysis = PatternCodeUtils.analyzeCode(result.patternId)

    setResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      code: result.patternId,
      threeHighs: result.threeHighs,
      twoLows: result.twoLows,
      analysis: analysis,
      rawScores: result.rawScores
    }])
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">光影1320測驗系統 - 代號測試</h1>
      
      <div className="mb-6">
        <button 
          onClick={generateRandomTest}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600"
        >
          生成隨機測驗
        </button>
        <button 
          onClick={clearResults}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          清空結果
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">用戶看到的結果</h3>
                <div className="bg-white p-3 rounded border">
                  <p><strong>測驗代號:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.code}</code></p>
                  <p><strong>時間:</strong> {result.timestamp}</p>
                  <p><strong>三高:</strong> {result.threeHighs.map(h => `${h.code}(${h.value})`).join(', ')}</p>
                  <p><strong>二低:</strong> {result.twoLows.map(l => `${l.code}(${l.value})`).join(', ')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">後台解析資訊</h3>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  {result.analysis.isValid ? (
                    <>
                      <div className="mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          result.analysis.version === 'full' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {result.analysis.version === 'full' ? '新版完整' : '舊版相容'}
                        </span>
                      </div>
                      
                      {result.analysis.version === 'full' ? (
                        <>
                          <p><strong>內部編號:</strong> {result.analysis.fullId} / 95040</p>
                          <p><strong>三高原型:</strong> {result.analysis.rawThreeHighs.join(' → ')}</p>
                          <p><strong>三高中文:</strong> {result.analysis.threeHighs.join(' → ')}</p>
                          <p><strong>二低原型:</strong> {result.analysis.rawTwoLows.join(' → ')}</p>
                          <p><strong>二低中文:</strong> {result.analysis.twoLows.join(' → ')}</p>
                          <p className="text-green-600 text-sm mt-2">✅ 完整三高二低解析成功</p>
                        </>
                      ) : (
                        <>
                          <p><strong>內部編號:</strong> {result.analysis.id1320} / 1320</p>
                          <p><strong>三高原型:</strong> {result.analysis.rawThreeHighs.join(' → ')}</p>
                          <p><strong>三高中文:</strong> {result.analysis.threeHighs.join(' → ')}</p>
                          <p><strong>二低:</strong> <span className="text-gray-500">舊版無法識別</span></p>
                          <p className="text-blue-600 text-sm mt-2">✅ 舊版格式向後相容</p>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-red-600">❌ 代號解析失敗: {result.analysis.error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          點擊"生成隨機測驗"開始測試代號系統
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">系統說明 v2.0</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">🆕 新版完整格式</h4>
            <ul className="space-y-1">
              <li>• <strong>格式:</strong> XXX-QYYY-ZW (如: A3K-Q125-AF)</li>
              <li>• <strong>識別:</strong> 三高 + 二低 完整解析</li>
              <li>• <strong>組合數:</strong> 95,040種 (1320×72)</li>
              <li>• <strong>特色:</strong> 第一字母=主神，第三段第一字母=最低神</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">🔄 舊版相容格式</h4>
            <ul className="space-y-1">
              <li>• <strong>格式:</strong> XXX-QYY-ZZZ (如: A3K-Q25-M7X)</li>
              <li>• <strong>識別:</strong> 僅三高，二低未知</li>
              <li>• <strong>組合數:</strong> 1,320種</li>
              <li>• <strong>特色:</strong> 向後相容，自動識別</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="font-semibold mb-2">共同特性</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>用戶體驗:</strong> 只看到神秘代號，無法反推規律</li>
            <li>• <strong>後台功能:</strong> 智能解析，自動判斷新舊格式</li>
            <li>• <strong>安全性:</strong> 校驗碼防偽造，種子加密</li>
          </ul>
        </div>
      </div>
    </div>
  )
}