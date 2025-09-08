'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'
import { BaseAPI } from '@/lib/base-api'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState({
    todoCount: 0,
    projectCount: 0,
    completedTodos: 0,
    timeboxSessions: 0
  })

  useEffect(() => {
    const user = authManager.getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    setCurrentUser(user)
    loadStats(user.id)
  }, [router])

  const loadStats = async (userId: string) => {
    try {
      // 載入待辦事項統計
      const todos = await BaseAPI.loadData('todos', userId, [])
      const activeTodos = todos.filter((todo: any) => !todo.completed)
      const completedTodos = todos.filter((todo: any) => todo.completed)
      
      // 載入專案統計
      const projects = await BaseAPI.loadData('projects', userId, [])
      const activeProjects = projects.filter((project: any) => project.status === 'active')
      
      // 載入時間盒統計
      const timeboxSessions = await BaseAPI.loadData('timebox', userId, [])
      
      setStats({
        todoCount: activeTodos.length,
        projectCount: activeProjects.length,
        completedTodos: completedTodos.length,
        timeboxSessions: timeboxSessions.length
      })
    } catch (error) {
      console.error('載入統計資料失敗:', error)
    }
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
      <div>
        <PageHeader
          icon={Icons.dashboard}
          title="系統總覽"
          subtitle={`歡迎回來，${currentUser.display_name || currentUser.username}`}
          actions={
            <>
              <Button variant="ghost" icon={Icons.settings} onClick={() => router.push('/dashboard/settings')}>
                設定
              </Button>
              <Button variant="primary" onClick={() => window.location.reload()}>
                重新整理
              </Button>
            </>
          }
        />
      </div>

      {/* iOS 小工具風格的統計卡片 */}
      <div className="widget-grid">
        {/* 待辦事項統計卡片 */}
        <div 
          className="stats-card todos-card" 
          onClick={() => router.push('/dashboard/todos')}
          data-debug="待辦事項卡片"
          data-debug-pos="dashboard-todo-card"
        >
          <div className="stats-content">
            <div className="stats-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <div className="stats-number">{stats.todoCount}</div>
            <div className="stats-label">進行中任務</div>
            <div className="stats-subtitle">{stats.completedTodos} 已完成</div>
          </div>
        </div>

        {/* 專案統計卡片 */}
        <div 
          className="stats-card projects-card" 
          onClick={() => router.push('/dashboard/projects')}
          data-debug="專案統計卡片"
          data-debug-pos="dashboard-project-card"
        >
          <div className="stats-content">
            <div className="stats-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div className="stats-number">{stats.projectCount}</div>
            <div className="stats-label">進行中專案</div>
            <div className="stats-subtitle">專案管理</div>
          </div>
        </div>

        {/* 時間盒統計卡片 */}
        <div 
          className="stats-card timebox-card" 
          onClick={() => router.push('/dashboard/timebox')}
          data-debug="時間盒統計卡片"
          data-debug-pos="dashboard-timebox-card"
        >
          <div className="stats-content">
            <div className="stats-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div className="stats-number">{stats.timeboxSessions}</div>
            <div className="stats-label">時間記錄</div>
            <div className="stats-subtitle">時間管理</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-overview {
          max-width: none;
          margin: 0;
          padding: 0;
          position: relative;
        }


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
          color: #f4a460;
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
          color: #f4a460;
          margin-bottom: 8px;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(244, 164, 96, 0.3);
        }

        .stats-label {
          font-size: 16px;
          font-weight: 600;
          color: #3a3833;
          margin-bottom: 4px;
        }

        .stats-subtitle {
          font-size: 14px;
          color: #6d685f;
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
          color: #3a3833;
          margin-bottom: 8px;
        }

        .placeholder-subtitle {
          font-size: 14px;
          color: #6d685f;
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
          color: #6d685f;
          font-size: 16px;
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
    </div>
  )
}