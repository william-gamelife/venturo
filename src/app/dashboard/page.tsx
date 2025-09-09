'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { localAuth } from '@/lib/local-auth'
import api from '@/lib/api-manager'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showDevModal, setShowDevModal] = useState(false)
  const [selectedWidgetIndex, setSelectedWidgetIndex] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    // 使用本地認證系統
    const user = localAuth.getCurrentUser()
    
    if (!user) {
      console.log('未登入，跳轉到首頁')
      router.push('/')
      return
    }
    
    console.log('👤 當前使用者:', user.display_name)
    setCurrentUser(user)
    
    // 顯示儲存統計（延遲執行避免初始化問題）
    setTimeout(() => {
      try {
        const stats = api.getStorageStats()
        console.log(`📊 儲存使用率: ${stats.percentage}%`)
      } catch (error) {
        console.log('儲存統計尚未就緒')
      }
    }, 100)
  }, [router])


  const handleWidgetClick = (index: number) => {
    setSelectedWidgetIndex(index)
    setShowDevModal(true)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      // 這裡可以處理實際的小工具位置交換邏輯
      console.log(`移動小工具從位置 ${draggedIndex} 到位置 ${dropIndex}`)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  if (!currentUser) {
    return (
      <div className="loading">
        正在載入系統總覽...
      </div>
    )
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.dashboard,
        title: "工作台",
        subtitle: `歡迎回來，${currentUser.display_name || currentUser.username}`,
        actions: (
          <>
            <Button variant="ghost" icon={Icons.settingsSmall} onClick={() => router.push('/dashboard/settings')}>
              設定
            </Button>
            <Button variant="primary" icon={Icons.refreshSmall} onClick={() => window.location.reload()}>
              重新整理
            </Button>
          </>
        )
      }}
    >


      {/* 小工具區域 */}
      <div className="widgets-section">
        <div className="widgets-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div 
              key={index}
              className={`widget-placeholder ${
                draggedIndex === index ? 'dragging' : ''
              } ${
                dragOverIndex === index ? 'drag-over' : ''
              }`}
              onClick={() => handleWidgetClick(index)}
              data-widget-id={index}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="placeholder-content">
                <div className="placeholder-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </div>
                <div className="placeholder-text">添加小工具</div>
                <div className="placeholder-subtitle">
                  {draggedIndex === null ? '點擊設置您的小工具' : '拖拽可調整位置'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 開發中彈窗 */}
      {showDevModal && (
        <div className="modal-overlay" onClick={() => setShowDevModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>小工具開發中</h3>
              <button 
                className="close-button"
                onClick={() => setShowDevModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="dev-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 8v6m11-7h-6m-8 0H1"/>
                </svg>
              </div>
              <p>小工具 #{selectedWidgetIndex !== null ? selectedWidgetIndex + 1 : ''} 正在開發中</p>
              <p className="dev-subtitle">敬請期待自定義小工具功能！</p>
            </div>
            <div className="modal-footer">
              <Button variant="primary" onClick={() => setShowDevModal(false)}>
                了解
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`


        /* iOS 小工具風格的統計網格 */
        .widget-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          max-width: none;
          margin: 0;
          padding: 0;
        }

        /* 統計卡片樣式 */
        .stats-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(244, 164, 96, 0.2);
          border-radius: 20px;
          padding: 32px 24px;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .stats-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(244, 164, 96, 0.1), rgba(47, 79, 47, 0.05));
          opacity: 0;
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(244, 164, 96, 0.5);
          box-shadow: 0 20px 60px rgba(244, 164, 96, 0.2);
        }

        .stats-card:hover::before {
          opacity: 1;
        }

        .stats-content {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .stats-icon {
          margin: 0 auto 20px;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(244, 164, 96, 0.1), rgba(47, 79, 47, 0.05));
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .stats-card:hover .stats-icon {
          transform: scale(1.1);
          background: linear-gradient(135deg, rgba(244, 164, 96, 0.2), rgba(47, 79, 47, 0.1));
        }

        .stats-number {
          font-size: 48px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 8px;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(244, 164, 96, 0.3);
        }

        .stats-label {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stats-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          opacity: 0.8;
        }

        /* 特定卡片顏色 */
        .todos-card:hover {
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.2);
        }

        .projects-card:hover {
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.2);
        }

        .timebox-card:hover {
          box-shadow: 0 20px 60px rgba(245, 158, 11, 0.2);
        }

        .widget-placeholder {
          background: transparent;
          border: 2px dashed rgba(244, 164, 96, 0.4);
          border-radius: 20px;
          padding: 40px 24px;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .widget-placeholder:hover {
          border-color: rgba(244, 164, 96, 0.7);
          background: rgba(244, 164, 96, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(244, 164, 96, 0.15);
        }

        .placeholder-content {
          text-align: center;
          opacity: 0.6;
          transition: all 0.3s ease;
        }

        .widget-placeholder:hover .placeholder-content {
          opacity: 0.9;
        }

        .placeholder-icon {
          margin: 0 auto 16px;
          color: rgba(244, 164, 96, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-text {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .placeholder-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        /* 添加微妙的動畫效果 */
        .widget-placeholder::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, transparent, rgba(244, 164, 96, 0.1), transparent);
          border-radius: 22px;
          opacity: 0;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% { 
            opacity: 0;
            transform: rotate(0deg);
          }
          50% { 
            opacity: 0.3;
            transform: rotate(180deg);
          }
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: var(--text-secondary);
          font-size: 16px;
        }

        /* 小工具區域樣式 */
        .widgets-section {
          margin-top: 0;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 24px 0;
          text-align: left;
        }

        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: none;
        }

        @media (max-width: 1200px) {
          .widgets-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .widgets-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .widget-placeholder {
          background: transparent;
          border: 2px dashed rgba(244, 164, 96, 0.4);
          border-radius: 16px;
          padding: 32px 16px;
          min-height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
          position: relative;
          will-change: border-color, background-color;
        }

        .widget-placeholder:hover {
          border-color: rgba(244, 164, 96, 0.7);
          background: rgba(244, 164, 96, 0.05);
        }

        .placeholder-content {
          text-align: center;
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .widget-placeholder:hover .placeholder-content {
          opacity: 1;
        }

        /* 拖拽狀態樣式 */
        .widget-placeholder.dragging {
          opacity: 0.5;
          transform: rotate(5deg) scale(0.95);
          border-color: rgba(244, 164, 96, 0.8);
          background: rgba(244, 164, 96, 0.1);
        }

        .widget-placeholder.drag-over {
          border-color: rgba(244, 164, 96, 0.9);
          background: rgba(244, 164, 96, 0.15);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 30px rgba(244, 164, 96, 0.25);
        }

        .widget-placeholder {
          transition: all 0.3s ease, transform 0.2s ease;
        }

        .widget-placeholder.dragging {
          transition: none;
        }

        .placeholder-icon {
          margin: 0 auto 12px;
          color: rgba(244, 164, 96, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .placeholder-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        /* 彈窗樣式 */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 400px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f0f0f0;
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
          text-align: center;
        }

        .dev-icon {
          margin: 0 auto 16px;
          color: rgba(244, 164, 96, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body p {
          margin: 0 0 8px;
          font-size: 16px;
          color: var(--text-primary);
        }

        .dev-subtitle {
          font-size: 14px !important;
          color: #6d685f !important;
          margin-bottom: 0 !important;
        }

        .modal-footer {
          padding: 16px 24px 20px;
          display: flex;
          justify-content: center;
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .dashboard-overview {
            padding: 0;
          }
          
          /* 響應式模式下重置錨點偏移 */
          .dashboard-overview > div:first-child {
            transform: translate(0px, 0px) !important;
          }
          
          .widget-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            transform: translate(0px, 0px) !important;
          }
          
          .stats-card {
            min-height: 180px;
            padding: 28px 20px;
          }
          
          .stats-number {
            font-size: 40px;
          }
          
          .stats-icon {
            width: 56px;
            height: 56px;
            margin-bottom: 16px;
          }
          
          .widget-placeholder {
            min-height: 180px;
            padding: 32px 20px;
          }
          
          .placeholder-text {
            font-size: 16px;
          }
          
          .placeholder-subtitle {
            font-size: 13px;
          }
          
          .dashboard-title {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-overview {
            padding: 0;
          }
          
          .widget-grid {
            gap: 16px;
          }
          
          .stats-card {
            min-height: 160px;
            padding: 24px 16px;
          }
          
          .stats-number {
            font-size: 36px;
          }
          
          .stats-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 12px;
          }
          
          .stats-label {
            font-size: 15px;
          }
          
          .stats-subtitle {
            font-size: 13px;
          }
          
          .widget-placeholder {
            min-height: 160px;
            padding: 24px 16px;
          }
          
          .placeholder-text {
            font-size: 15px;
          }
          
          .placeholder-subtitle {
            font-size: 12px;
          }
        }
      `}</style>
    </ModuleLayout>
  )
}