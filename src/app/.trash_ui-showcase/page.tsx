'use client'

import React from 'react'

export default function UIShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f1eb] to-[#e8e2d5] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#c9a961] mb-4">UI 效果展示</h1>
          <p className="text-gray-600">Aceternity UI 組件庫效果預覽</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">文字懸停效果</h3>
            <p className="text-gray-600">展示文字懸停的動態效果</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">背景漸變動畫</h3>
            <p className="text-gray-600">流動的背景漸變動畫</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">格子佈局</h3>
            <p className="text-gray-600">響應式的 Bento 網格佈局</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">星火特效</h3>
            <p className="text-gray-600">閃爍的粒子背景效果</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">浮動導航</h3>
            <p className="text-gray-600">智能的浮動導航欄</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">波浪背景</h3>
            <p className="text-gray-600">動態波浪背景動畫</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">卡片懸停</h3>
            <p className="text-gray-600">3D 卡片懸停效果</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">無限滾動</h3>
            <p className="text-gray-600">無限滾動的卡片組件</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">打字機效果</h3>
            <p className="text-gray-600">逐字顯示的文字動畫</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            所有 Aceternity UI 組件已成功安裝並可供使用
          </p>
          <div className="bg-white rounded-xl p-6 shadow-lg border inline-block">
            <h4 className="text-lg font-semibold text-[#c9a961] mb-2">已安裝的組件</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
              <span>• 文字懸停效果</span>
              <span>• 背景漸變動畫</span>
              <span>• Bento 格子佈局</span>
              <span>• 星火粒子效果</span>
              <span>• 浮動導航欄</span>
              <span>• 波浪背景</span>
              <span>• 卡片懸停效果</span>
              <span>• 無限滾動卡片</span>
              <span>• 打字機效果</span>
              <span>• 發光效果</span>
              <span>• 燈光容器</span>
              <span>• 英雄視差</span>
              <span>• 容器滾動</span>
              <span>• SVG 遮罩</span>
              <span>• 側邊欄</span>
              <span>• 佈局網格</span>
              <span>• 浮動工具欄</span>
              <span>• 可調整導航</span>
              <span>• 世界地圖</span>
              <span>• 追蹤光束</span>
              <span>• 圖片滑塊</span>
              <span>• 更多組件...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}