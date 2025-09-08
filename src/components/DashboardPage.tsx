'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'

interface DashboardPageProps {
  isPreview: boolean;
}

export default function DashboardPage({ isPreview }: DashboardPageProps) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = authManager.getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    setCurrentUser(user)
  }, [router])

  const handleLogout = async () => {
    await authManager.logout()
    // authManager.logout() 會自動重定向
  }

  if (!currentUser) {
    return (
      <div className="loading">
        正在載入系統總覽...
      </div>
    )
  }

  return (
    <div className="dashboard-overview">
      <div className="welcome-section">
        <h1 className="dashboard-title">
          系統總覽 {isPreview && <span className="preview-badge">🔍 預覽模式</span>}
        </h1>
        <p className="dashboard-subtitle">
          {currentUser.role === 'SUPER_ADMIN' ? '系統管理員' : 
           currentUser.role === 'BUSINESS_ADMIN' ? '業務管理員' : '一般使用者'}
        </p>
      </div>

      {/* 小工具網格 */}
      <div className="widgets-grid">
        {/* 待辦事項卡片 */}
        <div className="widget-card" onClick={() => router.push('/dashboard/todos')}>
          <div className="widget-header">
            <div className="widget-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 11l3 3L20 5"/>
              </svg>
            </div>
            <h3>待辦事項</h3>
          </div>
          <div className="widget-content">
            <div className="stat-number">-</div>
            <div className="stat-label">載入中...</div>
          </div>
          <div className="widget-footer">
            <span className="widget-link">查看全部 →</span>
          </div>
        </div>

        {/* 專案管理卡片 */}
        <div className="widget-card" onClick={() => router.push('/dashboard/projects')}>
          <div className="widget-header">
            <div className="widget-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>專案管理</h3>
          </div>
          <div className="widget-content">
            <div className="stat-number">-</div>
            <div className="stat-label">載入中...</div>
          </div>
          <div className="widget-footer">
            <span className="widget-link">查看全部 →</span>
          </div>
        </div>

        {/* 時間盒卡片 */}
        <div className="widget-card" onClick={() => router.push('/dashboard/timebox')}>
          <div className="widget-header">
            <div className="widget-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h3>箱型時間</h3>
          </div>
          <div className="widget-content">
            <div className="stat-number">-</div>
            <div className="stat-label">載入中...</div>
          </div>
          <div className="widget-footer">
            <span className="widget-link">查看詳情 →</span>
          </div>
        </div>

        {/* 行事曆卡片 */}
        <div className="widget-card" onClick={() => router.push('/dashboard/calendar')}>
          <div className="widget-header">
            <div className="widget-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>今日行程</h3>
          </div>
          <div className="widget-content">
            <div className="stat-number">-</div>
            <div className="stat-label">載入中...</div>
          </div>
          <div className="widget-footer">
            <span className="widget-link">查看行事曆 →</span>
          </div>
        </div>

        {/* 用戶管理卡片 */}
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'BUSINESS_ADMIN') && (
          <div className="widget-card" onClick={() => router.push('/dashboard/users')}>
            <div className="widget-header">
              <div className="widget-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>
                </svg>
              </div>
              <h3>用戶管理</h3>
            </div>
            <div className="widget-content">
              <div className="stat-number">-</div>
              <div className="stat-label">載入中...</div>
            </div>
            <div className="widget-footer">
              <span className="widget-link">管理用戶 →</span>
            </div>
          </div>
        )}

        {/* 心靈魔法卡片 */}
        <div className="widget-card" onClick={() => router.push('/dashboard/mind-magic')}>
          <div className="widget-header">
            <div className="widget-icon magic-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.27L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h3>心靈魔法</h3>
          </div>
          <div className="widget-content">
            <div className="stat-number">🔮</div>
            <div className="stat-label">探索內心世界</div>
          </div>
          <div className="widget-footer">
            <span className="widget-link">開始測驗 →</span>
          </div>
        </div>

        {/* 系統設定卡片 */}
        <div className="widget-card" onClick={() => router.push('/dashboard/settings')}>
          <div className="widget-header">
            <div className="widget-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <h3>系統設定</h3>
          </div>
          <div className="widget-content">
            <div className="stat-number">-</div>
            <div className="stat-label">載入中...</div>
          </div>
          <div className="widget-footer">
            <span className="widget-link">系統設定 →</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-overview {
          max-width: none;
          margin: 0 auto;
        }

        .welcome-section {
          margin-bottom: 32px;
        }

        .dashboard-title {
          font-size: 28px;
          font-weight: 700;
          color: #3a3833;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .preview-badge {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
          font-size: 14px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }

        .dashboard-subtitle {
          font-size: 16px;
          color: #6d685f;
        }

        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .widget-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .widget-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
        }

        .widget-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .widget-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .widget-icon svg {
          width: 20px;
          height: 20px;
        }

        .widget-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #3a3833;
          margin: 0;
        }

        .widget-content {
          margin-bottom: 16px;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #c9a961;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6d685f;
        }

        .widget-footer {
          padding-top: 16px;
          border-top: 1px solid rgba(201, 169, 97, 0.1);
        }

        .widget-link {
          color: #c9a961;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .widget-link:hover {
          color: #8b7355;
        }

        .magic-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          animation: magic-glow 3s ease-in-out infinite;
        }

        @keyframes magic-glow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(102, 126, 234, 0.4);
          }
          50% { 
            box-shadow: 0 0 20px rgba(118, 75, 162, 0.8);
          }
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6d685f;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .widgets-grid {
            grid-template-columns: 1fr;
          }
          
          .dashboard-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  )
}