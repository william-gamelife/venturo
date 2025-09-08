'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { useProjectStore, PROJECT_PHASES, PROJECT_CATEGORIES, type ProjectTask } from '@/lib/stores/project-store'

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
    const icons: Record<string, string> = {
      TRANSPORT: '🚗',
      ACCOMMODATION: '🏨',
      MEAL: '🍽️',
      ACTIVITY: '🎯',
      INSURANCE: '📋',
      DOCUMENT: '📄',
      OTHER: '📌'
    }
    return icons[category] || '📌'
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
                    <div className="p-4 space-y-2">
                      {phaseTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
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
                          {task.description && (
                            <span className="text-xs text-gray-400">
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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">總任務數</div>
          <div className="text-2xl font-bold">{project.tasks.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">已完成</div>
          <div className="text-2xl font-bold text-green-600">
            {project.tasks.filter((t: ProjectTask) => t.completed).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">完成率</div>
          <div className="text-2xl font-bold text-[#c9a961]">
            {project.tasks.length > 0 
              ? Math.round((project.tasks.filter((t: ProjectTask) => t.completed).length / project.tasks.length) * 100)
              : 0}%
          </div>
        </div>
      </div>
    </div>
  )
}
