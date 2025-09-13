'use client'

import React from 'react'

/**
 * Venturo UI 設計系統頁面
 * 提供所有 UI 組件的即時預覽和使用說明
 */
export default function DesignSystemPage() {
  return (
    <div className="design-system-container">
      <iframe 
        src="/venturo-ui-components.html"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none'
        }}
        title="Venturo UI Components"
      />
      
      {/* 快速存取按鈕 */}
      <div className="quick-access">
        <button 
          onClick={() => window.open('/venturo-ui-components.html', '_blank')}
          className="btn-primary"
        >
          在新視窗開啟
        </button>
      </div>
      
      <style jsx>{`
        .design-system-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }
        
        .quick-access {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 100;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #D4C4A0, #c9a961);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </div>
  )
}