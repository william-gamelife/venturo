'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ModuleLayout } from '@/components/ModuleLayout'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { useProjectStore, PROJECT_PHASES } from '@/lib/stores/project-store'

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
    <ModuleLayout>
      <PageHeader 
        title="專案管理"
        subtitle="管理所有進行中的旅遊專案"
        icon="📋"
        actions={
          <>
            <div className="project-stats">
              <div className="stat-item">
                <span className="stat-number">{projects.length}</span>
                <span className="stat-label">總專案數</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-blue-600">
                  {projects.filter(p => p.status === '執行中').length}
                </span>
                <span className="stat-label">執行中</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-yellow-600">
                  {projects.filter(p => p.status === '規劃中').length}
                </span>
                <span className="stat-label">規劃中</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-green-600">
                  {projects.filter(p => p.status === '已完成').length}
                </span>
                <span className="stat-label">已完成</span>
              </div>
            </div>
          </>
        }
      />

      {/* 搜尋和篩選區 */}
      <div className="filter-section">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="搜尋專案名稱或客戶..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
          >
            <option value="all">所有狀態</option>
            <option value="規劃中">規劃中</option>
            <option value="執行中">執行中</option>
            <option value="已完成">已完成</option>
            <option value="已取消">已取消</option>
          </select>
        </div>
      </div>

      {/* 專案卡片列表（布告欄風格） */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                {/* 專案卡片頭部 */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === '執行中' ? 'bg-blue-100 text-blue-700' :
                      project.status === '規劃中' ? 'bg-yellow-100 text-yellow-700' :
                      project.status === '已完成' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {project.clientName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)} ({project.totalDays}天)
                  </p>
                </div>

                {/* 進度條 */}
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      進度：{completedTasks}/{totalTasks} 任務
                    </span>
                    <span className="text-sm font-semibold text-[#c9a961]">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#c9a961] to-[#e4d4a8] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* 當前階段 */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">當前階段</span>
                      <p className="text-sm font-medium text-gray-700">
                        {getCurrentPhaseName(project.currentPhase)}
                      </p>
                    </div>
                    {project.groupId ? (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                        已開團
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/groups/new?projectId=${project.id}`)
                        }}
                        className="text-xs bg-[#c9a961] text-white px-3 py-1 rounded hover:bg-[#b39555]"
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
        .project-stats {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        
        .project-stats .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        
        .project-stats .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
        }
        
        .project-stats .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          white-space: nowrap;
        }
        
        .filter-section {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          border: 1px solid #e5e7eb;
        }
        
        @media (max-width: 768px) {
          .project-stats {
            flex-direction: column;
            gap: 12px;
          }
          
          .project-stats .stat-item {
            flex-direction: row;
            gap: 8px;
          }
        }
      `}</style>
    </ModuleLayout>
  )
}
