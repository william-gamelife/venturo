'use client'

import { useState, useEffect } from 'react'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import {
  BarChart3,
  Users,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react'
import { VersionIndicator } from '@/components/VersionIndicator'
import Link from 'next/link'

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const quickActions = [
    { id: 'projects', name: '新增專案', icon: Plus, href: '/dashboard/projects/new', color: 'primary' },
    { id: 'finance', name: '財務總覽', icon: DollarSign, href: '/dashboard/finance', color: 'success' },
    { id: 'calendar', name: '行事曆', icon: Calendar, href: '/dashboard/calendar', color: 'info' },
    { id: 'contracts', name: '合約管理', icon: FileText, href: '/dashboard/contracts', color: 'warning' }
  ]

  const statsData = [
    { id: 'projects', name: '進行中專案', value: '12', icon: BarChart3, trend: '+2', color: 'primary' },
    { id: 'users', name: '活躍用戶', value: '48', icon: Users, trend: '+5', color: 'success' },
    { id: 'revenue', name: '本月營收', value: '2.4M', icon: TrendingUp, trend: '+12%', color: 'info' },
    { id: 'tasks', name: '待處理任務', value: '23', icon: Clock, trend: '-3', color: 'warning' }
  ]

  const recentActivities = [
    { id: 1, type: 'project', title: '日本關西賞櫻之旅', action: '專案已更新', time: '2小時前', status: 'success' },
    { id: 2, type: 'contract', title: '韓國首爾自由行', action: '合約已簽署', time: '4小時前', status: 'info' },
    { id: 3, type: 'finance', title: '月度財務報告', action: '報告已生成', time: '6小時前', status: 'warning' },
    { id: 4, type: 'user', title: '新用戶註冊', action: '王小明加入團隊', time: '8小時前', status: 'primary' }
  ]

  return (
    <ModuleLayout
      header={{
        icon: Icons.dashboard,
        title: "儀表板",
        subtitle: "總覽您的業務狀況和關鍵指標",
        actions: (
          <div className="v-dashboard-header">
            <div className="v-datetime">
              <div className="v-date">{formatDate(currentTime)}</div>
              <div className="v-time">{formatTime(currentTime)}</div>
            </div>
          </div>
        )
      }}
    >
      {/* 統計卡片 */}
      <div className="v-stats-grid">
        {statsData.map((stat) => {
          const IconComponent = stat.icon
          return (
            <div key={stat.id} className={`v-stat-card v-${stat.color}`}>
              <div className="v-stat-header">
                <IconComponent className="v-stat-icon" size={24} />
                <span className={`v-stat-trend v-${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="v-stat-content">
                <div className="v-stat-value">{stat.value}</div>
                <div className="v-stat-label">{stat.name}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 主要內容區域 */}
      <div className="v-dashboard-grid">
        {/* 快速操作 */}
        <div className="v-dashboard-section">
          <div className="v-section-header">
            <h2 className="v-section-title">快速操作</h2>
            <p className="v-section-subtitle">常用功能快捷入口</p>
          </div>
          <div className="v-quick-actions">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              return (
                <Link key={action.id} href={action.href} className={`v-quick-action v-${action.color}`}>
                  <IconComponent size={20} />
                  <span>{action.name}</span>
                  <ArrowRight size={16} className="v-action-arrow" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* 最近活動 */}
        <div className="v-dashboard-section">
          <div className="v-section-header">
            <h2 className="v-section-title">最近活動</h2>
            <p className="v-section-subtitle">系統動態和更新</p>
          </div>
          <div className="v-activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="v-activity-item">
                <div className={`v-activity-status v-${activity.status}`}></div>
                <div className="v-activity-content">
                  <div className="v-activity-title">{activity.title}</div>
                  <div className="v-activity-action">{activity.action}</div>
                </div>
                <div className="v-activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
          <div className="v-section-footer">
            <Link href="/dashboard/activities" className="v-link">
              查看所有活動 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Venturo 儀表板樣式 */
        .v-dashboard-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .v-datetime {
          text-align: right;
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-md);
          border: 1px solid rgba(212, 196, 160, 0.2);
        }

        .v-date {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          line-height: 1;
        }

        .v-time {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .v-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .v-stat-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          border: 1px solid #E5E5E5;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .v-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--primary);
        }

        .v-stat-card.v-success::before {
          background: #22C55E;
        }

        .v-stat-card.v-info::before {
          background: #3B82F6;
        }

        .v-stat-card.v-warning::before {
          background: #F59E0B;
        }

        .v-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }

        .v-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .v-stat-icon {
          color: var(--primary);
          padding: var(--spacing-xs);
          background: rgba(212, 196, 160, 0.1);
          border-radius: var(--radius-md);
        }

        .v-stat-card.v-success .v-stat-icon {
          color: #22C55E;
          background: rgba(34, 197, 94, 0.1);
        }

        .v-stat-card.v-info .v-stat-icon {
          color: #3B82F6;
          background: rgba(59, 130, 246, 0.1);
        }

        .v-stat-card.v-warning .v-stat-icon {
          color: #F59E0B;
          background: rgba(245, 158, 11, 0.1);
        }

        .v-stat-trend {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }

        .v-stat-trend.v-positive {
          color: #059669;
          background: rgba(5, 150, 105, 0.1);
        }

        .v-stat-trend.v-negative {
          color: #DC2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .v-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }

        .v-stat-label {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }

        .v-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-xl);
        }

        .v-dashboard-section {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid #E5E5E5;
          overflow: hidden;
        }

        .v-section-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid #F0F0F0;
        }

        .v-section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px 0;
        }

        .v-section-subtitle {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .v-quick-actions {
          display: flex;
          flex-direction: column;
          padding: var(--spacing-md);
          gap: var(--spacing-sm);
        }

        .v-quick-action {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: rgba(212, 196, 160, 0.05);
          border: 1px solid rgba(212, 196, 160, 0.1);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: #333;
          transition: all 0.2s ease;
          position: relative;
        }

        .v-quick-action:hover {
          background: rgba(212, 196, 160, 0.1);
          border-color: rgba(212, 196, 160, 0.3);
          transform: translateX(4px);
        }

        .v-quick-action .v-action-arrow {
          margin-left: auto;
          opacity: 0.5;
          transition: all 0.2s ease;
        }

        .v-quick-action:hover .v-action-arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        .v-activity-list {
          padding: var(--spacing-md);
        }

        .v-activity-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          transition: all 0.2s ease;
        }

        .v-activity-item:hover {
          background: rgba(212, 196, 160, 0.05);
        }

        .v-activity-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .v-activity-status.v-success {
          background: #22C55E;
        }

        .v-activity-status.v-info {
          background: #3B82F6;
        }

        .v-activity-status.v-warning {
          background: #F59E0B;
        }

        .v-activity-status.v-primary {
          background: var(--primary);
        }

        .v-activity-content {
          flex: 1;
        }

        .v-activity-title {
          font-weight: 500;
          color: #333;
          font-size: 14px;
          line-height: 1.2;
        }

        .v-activity-action {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .v-activity-time {
          font-size: 12px;
          color: #999;
          flex-shrink: 0;
        }

        .v-section-footer {
          padding: var(--spacing-md) var(--spacing-lg);
          border-top: 1px solid #F0F0F0;
          background: rgba(212, 196, 160, 0.02);
        }

        .v-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--primary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .v-link:hover {
          color: var(--sage-green);
          gap: var(--spacing-sm);
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .v-stats-grid {
            grid-template-columns: 1fr;
          }

          .v-dashboard-grid {
            grid-template-columns: 1fr;
          }

          .v-dashboard-header {
            flex-direction: column;
            align-items: stretch;
            gap: var(--spacing-md);
          }

          .v-datetime {
            text-align: center;
          }

          .v-stat-card {
            padding: var(--spacing-md);
          }

          .v-stat-value {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .v-section-header {
            padding: var(--spacing-md);
          }

          .v-activity-item {
            padding: var(--spacing-sm);
          }

          .v-activity-content {
            min-width: 0;
          }
        }
      `}</style>

      <VersionIndicator
        page="儀表板"
        authSystem="mixed"
        version="1.0"
        status="error"
      />
    </ModuleLayout>
  )
}