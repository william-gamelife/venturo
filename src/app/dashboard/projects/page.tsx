'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'
import {
  Folder,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import { useProjectStore, PROJECT_PHASES } from '@/lib/stores/project-store'
import { VersionIndicator } from '@/components/VersionIndicator'

export default function ProjectsPage() {
  const router = useRouter()
  const projects = useProjectStore((state) => state.projects)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 篩選專案
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // 計算專案進度
  const calculateProgress = (project: any) => {
    const totalTasks = project.tasks.length
    const completedTasks = project.tasks.filter((t: any) => t.completed).length
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  // 取得當前階段名稱
  const getCurrentPhaseName = (phase: keyof typeof PROJECT_PHASES) => {
    return PROJECT_PHASES[phase]
  }

  const formatDate = (date: Date) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.projects,
        title: "專案管理",
        subtitle: "管理所有進行中的旅遊專案",
        actions: (
          <div className="v-stats">
            <div className="v-stat-item">
              <Folder className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{projects.length}</span>
                <span className="v-stat-label">總專案數</span>
              </div>
            </div>
            <div className="v-stat-item">
              <Clock className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">
                  {projects.filter(p => p.status === '執行中').length}
                </span>
                <span className="v-stat-label">執行中</span>
              </div>
            </div>
            <div className="v-stat-item">
              <AlertCircle className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">
                  {projects.filter(p => p.status === '規劃中').length}
                </span>
                <span className="v-stat-label">規劃中</span>
              </div>
            </div>
            <div className="v-stat-item">
              <CheckCircle className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">
                  {projects.filter(p => p.status === '已完成').length}
                </span>
                <span className="v-stat-label">已完成</span>
              </div>
            </div>
          </div>
        )
      }}
    >

      {/* 搜尋和篩選區 */}
      <div className="v-filters">
        <div className="v-search-group">
          <div className="v-input-group">
            <Search className="v-input-icon" size={16} />
            <input
              type="text"
              placeholder="搜尋專案名稱或客戶..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="v-input"
            />
          </div>
          <div className="v-select-group">
            <Filter className="v-select-icon" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="v-select"
            >
              <option value="all">所有狀態</option>
              <option value="規劃中">規劃中</option>
              <option value="執行中">執行中</option>
              <option value="已完成">已完成</option>
              <option value="已取消">已取消</option>
            </select>
          </div>
        </div>
      </div>

      {/* 專案卡片列表 */}
      <div className="v-project-grid">
        {filteredProjects.length === 0 ? (
          <div className="v-empty-state">
            <p className="v-empty-message">
              {searchTerm || statusFilter !== 'all'
                ? '沒有符合條件的專案'
                : '尚無專案，從報價單成交後會自動建立專案'}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const progress = calculateProgress(project)
            const completedTasks = project.tasks.filter((t: any) => t.completed).length
            const totalTasks = project.tasks.length

            return (
              <div
                key={project.id}
                className="v-project-card"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                {/* 專案卡片頭部 */}
                <div className="v-card-header">
                  <div className="v-card-title-row">
                    <h3 className="v-card-title">
                      {project.name}
                    </h3>
                    <span className={`v-badge ${
                      project.status === '執行中' ? 'v-info' :
                      project.status === '規劃中' ? 'v-warning' :
                      project.status === '已完成' ? 'v-success' :
                      'v-primary'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="v-card-subtitle">
                    {project.clientName}
                  </p>
                  <p className="v-card-meta">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)} ({project.totalDays}天)
                  </p>
                </div>

                {/* 進度條 */}
                <div className="v-progress-section">
                  <div className="v-progress-info">
                    <span className="v-progress-label">
                      進度：{completedTasks}/{totalTasks} 任務
                    </span>
                    <span className="v-progress-percent">
                      {progress}%
                    </span>
                  </div>
                  <div className="v-progress-bar">
                    <div
                      className="v-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* 當前階段 */}
                <div className="v-card-footer">
                  <div className="v-phase-info">
                    <div>
                      <span className="v-phase-label">當前階段</span>
                      <p className="v-phase-name">
                        {getCurrentPhaseName(project.currentPhase)}
                      </p>
                    </div>
                    {project.groupId ? (
                      <span className="v-badge v-success">
                        已開團
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/groups/new?projectId=${project.id}`)
                        }}
                        className="v-button variant-primary size-sm"
                      >
                        開立團體
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      <style jsx global>{`
        /* Venturo 專案管理樣式 */
        .v-stats {
          display: flex;
          gap: var(--spacing-lg);
          align-items: center;
        }

        .v-stat-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-md);
          border: 1px solid rgba(212, 196, 160, 0.2);
        }

        .v-stat-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .v-stat-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .v-stat-number {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }

        .v-stat-label {
          font-size: 11px;
          color: #666;
          white-space: nowrap;
        }

        /* 篩選區域 */
        .v-filters {
          margin-bottom: var(--spacing-lg);
        }

        .v-search-group {
          display: flex;
          gap: var(--spacing-md);
        }

        .v-input-group {
          position: relative;
          flex: 1;
        }

        .v-input-icon {
          position: absolute;
          left: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
        }

        .v-input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px;
          border: 1px solid #E5E5E5;
          border-radius: var(--radius-md);
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .v-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(212, 196, 160, 0.1);
        }

        .v-select-group {
          position: relative;
          min-width: 160px;
        }

        .v-select-icon {
          position: absolute;
          left: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
          z-index: 1;
        }

        .v-select {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px;
          border: 1px solid #E5E5E5;
          border-radius: var(--radius-md);
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .v-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(212, 196, 160, 0.1);
        }

        /* 專案網格 */
        .v-project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--spacing-lg);
        }

        .v-empty-state {
          grid-column: 1 / -1;
          background: white;
          border-radius: var(--radius-lg);
          padding: 48px 24px;
          text-align: center;
          border: 1px solid #E5E5E5;
        }

        .v-empty-message {
          color: #666;
          margin: 0;
        }

        /* 專案卡片 */
        .v-project-card {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid #E5E5E5;
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .v-project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          border-color: #D1D5DB;
        }

        .v-card-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid #F0F0F0;
        }

        .v-card-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-sm);
        }

        .v-card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary);
          margin: 0;
        }

        .v-badge {
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .v-badge.v-info {
          background: #E3F2FD;
          color: #1976D2;
        }

        .v-badge.v-warning {
          background: #FFF3E0;
          color: #F57C00;
        }

        .v-badge.v-success {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .v-badge.v-primary {
          background: rgba(212, 196, 160, 0.2);
          color: var(--primary);
        }

        .v-card-subtitle {
          font-size: 14px;
          color: #333;
          margin: 0 0 4px 0;
        }

        .v-card-meta {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        /* 進度區域 */
        .v-progress-section {
          padding: var(--spacing-md) var(--spacing-lg);
        }

        .v-progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .v-progress-label {
          font-size: 14px;
          color: #666;
        }

        .v-progress-percent {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
        }

        .v-progress-bar {
          width: 100%;
          height: 6px;
          background: #F0F0F0;
          border-radius: 3px;
          overflow: hidden;
        }

        .v-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--sage-green));
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        /* 卡片底部 */
        .v-card-footer {
          padding: var(--spacing-lg);
        }

        .v-phase-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .v-phase-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .v-phase-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin: 2px 0 0 0;
        }

        /* 按鈕樣式 */
        .v-button {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid #E5E5E5;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          background: white;
          color: #333;
        }

        .v-button.variant-primary {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .v-button.variant-primary:hover {
          background: var(--sage-green);
          border-color: var(--sage-green);
        }

        .v-button.size-sm {
          padding: 6px var(--spacing-sm);
          font-size: 12px;
        }

        .v-button:hover {
          background: #F8F9FA;
          border-color: var(--primary);
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .v-stats {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: stretch;
          }

          .v-stat-item {
            justify-content: space-between;
            padding: var(--spacing-md);
          }

          .v-stat-content {
            align-items: flex-end;
          }

          .v-search-group {
            flex-direction: column;
          }

          .v-project-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .v-project-grid {
            gap: var(--spacing-md);
          }

          .v-card-header,
          .v-progress-section,
          .v-card-footer {
            padding: var(--spacing-md);
          }
        }
      `}</style>
      
      <VersionIndicator 
        page="專案管理"
        authSystem="mixed" 
        version="1.3"
        status="error"
      />
    </ModuleLayout>
  )
}
