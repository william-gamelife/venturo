'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import {
  ArrowLeft,
  ExternalLink,
  Users,
  Plus,
  Car,
  Building,
  UtensilsCrossed,
  Target,
  Shield,
  FileText,
  Bookmark
} from 'lucide-react'
import { useProjectStore, PROJECT_PHASES, PROJECT_CATEGORIES, type ProjectTask } from '@/lib/stores/project-store'
import { VersionIndicator } from '@/components/VersionIndicator'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const { getProject, toggleTask, addTask, deleteTask } = useProjectStore()
  const [project, setProject] = useState<any>(null)
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['PROPOSAL', 'BOOKING'])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [newTaskInputs, setNewTaskInputs] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const p = getProject(projectId)
    if (p) {
      setProject(p)
    } else {
      // 如果沒有專案，返回列表
      router.push('/dashboard/projects')
    }
  }, [projectId])

  if (!project) {
    return <div>載入中...</div>
  }

  // 按階段分組任務
  const tasksByPhase = Object.keys(PROJECT_PHASES).reduce((acc, phase) => {
    acc[phase] = project.tasks.filter((task: ProjectTask) => task.phase === phase)
    return acc
  }, {} as Record<string, ProjectTask[]>)

  // 按類別分組任務（用於預訂作業階段）
  const getTasksByCategory = (phaseTasks: ProjectTask[]) => {
    return Object.keys(PROJECT_CATEGORIES).reduce((acc, category) => {
      acc[category] = phaseTasks.filter((task: ProjectTask) => task.category === category)
      return acc
    }, {} as Record<string, ProjectTask[]>)
  }

  // 切換階段展開/收合
  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => 
      prev.includes(phase) 
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    )
  }

  // 切換類別展開/收合
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // 新增任務到特定類別
  const handleAddTask = (phase: keyof typeof PROJECT_PHASES, category: keyof typeof PROJECT_CATEGORIES) => {
    const inputKey = `${phase}-${category}`
    const taskTitle = newTaskInputs[inputKey]
    
    if (!taskTitle?.trim()) return
    
    addTask(projectId, {
      category,
      phase,
      title: taskTitle,
      responsible: '業務助理',
      completed: false
    })
    
    setNewTaskInputs(prev => ({ ...prev, [inputKey]: '' }))
    
    // 重新載入專案
    const updatedProject = getProject(projectId)
    if (updatedProject) setProject(updatedProject)
  }

  // 計算階段進度
  const getPhaseProgress = (phase: string) => {
    const phaseTasks = tasksByPhase[phase] || []
    const completed = phaseTasks.filter(t => t.completed).length
    return { completed, total: phaseTasks.length }
  }

  // 取得類別圖標
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ElementType> = {
      TRANSPORT: Car,
      ACCOMMODATION: Building,
      MEAL: UtensilsCrossed,
      ACTIVITY: Target,
      INSURANCE: Shield,
      DOCUMENT: FileText,
      OTHER: Bookmark
    }
    const IconComponent = iconMap[category] || Bookmark
    return <IconComponent size={16} className="v-category-icon-svg" />
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title={project.name}
        description={`${project.clientName} | ${new Date(project.startDate).toLocaleDateString('zh-TW')} - ${new Date(project.endDate).toLocaleDateString('zh-TW')}`}
      />

      {/* 快速操作區 */}
      <div className="flex gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/projects')}
        >
          返回列表
        </Button>
        {project.quotationId && (
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/quotations/${project.quotationId}`)}
          >
            查看報價單
          </Button>
        )}
        {project.groupId ? (
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/groups/${project.groupId}`)}
          >
            查看團體
          </Button>
        ) : (
          <Button
            className="bg-[#c9a961] hover:bg-[#b39555] text-white"
            onClick={() => router.push(`/dashboard/groups/new?projectId=${projectId}`)}
          >
            開立團體
          </Button>
        )}
      </div>

      {/* 任務管理區 - 抽屜式 */}
      <div className="space-y-4">
        {Object.entries(PROJECT_PHASES).map(([phaseKey, phaseName]) => {
          const phaseTasks = tasksByPhase[phaseKey] || []
          const progress = getPhaseProgress(phaseKey)
          const isExpanded = expandedPhases.includes(phaseKey)
          
          return (
            <div key={phaseKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* 階段標題 */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => togglePhase(phaseKey)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
                  <h3 className="font-semibold text-lg">{phaseName}</h3>
                  <span className="text-sm text-gray-500">
                    ({progress.completed}/{progress.total} 完成)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {progress.total > 0 && (
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#c9a961] to-[#e4d4a8] h-2 rounded-full"
                        style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      />
                    </div>
                  )}
                  {phaseKey === project.currentPhase && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      當前階段
                    </span>
                  )}
                </div>
              </div>

              {/* 階段內容 */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  {phaseKey === 'BOOKING' ? (
                    // 預訂作業特殊處理 - 按類別分組
                    <div className="p-4 space-y-3">
                      {Object.entries(PROJECT_CATEGORIES).map(([categoryKey, categoryName]) => {
                        const categoryTasks = phaseTasks.filter(t => t.category === categoryKey)
                        const isCategoryExpanded = expandedCategories.includes(categoryKey)
                        
                        if (categoryKey === 'INSURANCE' || categoryKey === 'DOCUMENT') {
                          // 這兩個類別主要在其他階段使用
                          if (categoryTasks.length === 0) return null
                        }
                        
                        return (
                          <div key={categoryKey} className="bg-gray-50 rounded-lg p-3">
                            {/* 類別標題 */}
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleCategory(categoryKey)}
                            >
                              <div className="flex items-center gap-2">
                                <span>{getCategoryIcon(categoryKey)}</span>
                                <span className="font-medium">{categoryName}</span>
                                <span className="text-sm text-gray-500">
                                  ({categoryTasks.filter(t => t.completed).length}/{categoryTasks.length})
                                </span>
                              </div>
                              <span className="text-sm">{isCategoryExpanded ? '▼' : '▶'}</span>
                            </div>

                            {/* 類別任務 */}
                            {isCategoryExpanded && (
                              <div className="mt-3 space-y-2">
                                {categoryTasks.map((task) => (
                                  <div key={task.id} className="flex items-center gap-3 bg-white p-2 rounded">
                                    <input
                                      type="checkbox"
                                      checked={task.completed}
                                      onChange={() => {
                                        toggleTask(projectId, task.id)
                                        const updatedProject = getProject(projectId)
                                        if (updatedProject) setProject(updatedProject)
                                      }}
                                      className="w-4 h-4"
                                    />
                                    <span className={task.completed ? 'line-through text-gray-400' : ''}>
                                      {task.title}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({task.responsible})
                                    </span>
                                    <button
                                      onClick={() => {
                                        deleteTask(projectId, task.id)
                                        const updatedProject = getProject(projectId)
                                        if (updatedProject) setProject(updatedProject)
                                      }}
                                      className="ml-auto text-red-500 hover:text-red-700 text-sm"
                                    >
                                      刪除
                                    </button>
                                  </div>
                                ))}
                                
                                {/* 新增任務輸入 */}
                                <div className="flex gap-2 mt-2">
                                  <input
                                    type="text"
                                    placeholder="新增任務..."
                                    value={newTaskInputs[`${phaseKey}-${categoryKey}`] || ''}
                                    onChange={(e) => setNewTaskInputs(prev => ({
                                      ...prev,
                                      [`${phaseKey}-${categoryKey}`]: e.target.value
                                    }))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddTask(phaseKey as keyof typeof PROJECT_PHASES, categoryKey as keyof typeof PROJECT_CATEGORIES)
                                      }
                                    }}
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                                  />
                                  <button
                                    onClick={() => handleAddTask(phaseKey as keyof typeof PROJECT_PHASES, categoryKey as keyof typeof PROJECT_CATEGORIES)}
                                    className="px-3 py-1 bg-[#c9a961] text-white rounded text-sm hover:bg-[#b39555]"
                                  >
                                    新增
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    // 其他階段 - 簡單列表
                    <div className="v-simple-tasks">
                      {phaseTasks.map((task) => (
                        <div key={task.id} className="v-task-item">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {
                              toggleTask(projectId, task.id)
                              const updatedProject = getProject(projectId)
                              if (updatedProject) setProject(updatedProject)
                            }}
                            className="v-checkbox"
                          />
                          <span className={task.completed ? 'v-task-title v-completed' : 'v-task-title'}>
                            {task.title}
                          </span>
                          <span className="v-task-responsible">
                            ({task.responsible})
                          </span>
                          {task.description && (
                            <span className="v-task-description">
                              - {task.description}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 專案統計 */}
      <div className="v-project-stats">
        <div className="v-stat-card">
          <div className="v-stat-label">總任務數</div>
          <div className="v-stat-value">{project.tasks.length}</div>
        </div>
        <div className="v-stat-card">
          <div className="v-stat-label">已完成</div>
          <div className="v-stat-value v-success">
            {project.tasks.filter((t: ProjectTask) => t.completed).length}
          </div>
        </div>
        <div className="v-stat-card">
          <div className="v-stat-label">完成率</div>
          <div className="v-stat-value v-primary">
            {project.tasks.length > 0
              ? Math.round((project.tasks.filter((t: ProjectTask) => t.completed).length / project.tasks.length) * 100)
              : 0}%
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Venturo 專案詳情樣式 */
        .v-loading-state {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        .v-loading-message {
          color: #666;
          font-size: 16px;
        }

        .v-project-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        /* 任務階段樣式 */
        .v-task-phases {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .v-phase-card {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid #E5E5E5;
          overflow: hidden;
        }

        .v-phase-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-lg);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .v-phase-header:hover {
          background: #F8F9FA;
        }

        .v-phase-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .v-expand-icon {
          font-size: 18px;
          color: var(--primary);
        }

        .v-phase-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .v-phase-progress {
          font-size: 14px;
          color: #666;
        }

        .v-phase-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .v-progress-bar {
          width: 120px;
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

        .v-phase-content {
          border-top: 1px solid #F0F0F0;
        }

        /* 類別樣式 */
        .v-categories {
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .v-category-section {
          background: #F8F9FA;
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
        }

        .v-category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .v-category-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .v-category-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .v-category-icon-svg {
          color: var(--primary);
          opacity: 0.8;
        }

        .v-category-name {
          font-weight: 500;
          color: #333;
        }

        .v-category-count {
          font-size: 14px;
          color: #666;
        }

        /* 任務樣式 */
        .v-tasks {
          margin-top: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .v-simple-tasks {
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .v-task-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: white;
          border-radius: var(--radius-sm);
          border: 1px solid #E5E5E5;
        }

        .v-checkbox {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
        }

        .v-task-title {
          flex: 1;
          font-size: 14px;
          color: #333;
        }

        .v-task-title.v-completed {
          text-decoration: line-through;
          color: #999;
        }

        .v-task-responsible {
          font-size: 12px;
          color: #666;
        }

        .v-task-description {
          font-size: 12px;
          color: #999;
        }

        .v-task-delete {
          margin-left: auto;
          color: #DC2626;
          background: none;
          border: none;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .v-task-delete:hover {
          background: #FEE2E2;
          color: #B91C1C;
        }

        /* 新增任務樣式 */
        .v-add-task {
          display: flex;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
        }

        .v-add-task .v-input {
          flex: 1;
          padding: 6px var(--spacing-sm);
          border: 1px solid #E5E5E5;
          border-radius: var(--radius-sm);
          font-size: 14px;
        }

        /* 統計卡片樣式 */
        .v-project-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-top: var(--spacing-lg);
        }

        .v-stat-card {
          background: white;
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          border: 1px solid #E5E5E5;
        }

        .v-stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: var(--spacing-xs);
        }

        .v-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .v-stat-value.v-success {
          color: #16A34A;
        }

        .v-stat-value.v-primary {
          color: var(--primary);
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .v-project-actions {
            flex-direction: column;
          }

          .v-phase-title {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-xs);
          }

          .v-phase-meta {
            margin-top: var(--spacing-sm);
          }

          .v-category-title {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-xs);
          }

          .v-task-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-xs);
          }

          .v-add-task {
            flex-direction: column;
          }

          .v-project-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <VersionIndicator
        page="專案詳情"
        authSystem="mixed"
        version="1.4"
        status="success"
      />
    </ModuleLayout>
  )
}
