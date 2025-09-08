import { create } from 'zustand'

// 專案任務類別（根據PDF）
export const PROJECT_CATEGORIES = {
  TRANSPORT: '交通',
  ACCOMMODATION: '住宿', 
  MEAL: '餐飲',
  ACTIVITY: '活動',
  INSURANCE: '保險',
  DOCUMENT: '文件',
  OTHER: '其他'
} as const

// 專案階段（根據PDF的職務交辦單）
export const PROJECT_PHASES = {
  PROPOSAL: '提案簽約',
  BOOKING: '預訂作業', 
  PREPARATION: '行前準備',
  CONFIRMATION: '出發確認',
  WRAPUP: '結案整理'
} as const

export interface ProjectTask {
  id: string
  category: keyof typeof PROJECT_CATEGORIES
  phase: keyof typeof PROJECT_PHASES
  title: string
  description?: string
  responsible: '承辦業務' | '業務助理' | '隨團領隊'
  completed: boolean
  completedAt?: Date
  dueDate?: Date
}

export interface Project {
  id: string
  name: string
  quotationId?: string
  clientName: string
  startDate: Date
  endDate: Date
  totalDays: number
  tasks: ProjectTask[]
  currentPhase: keyof typeof PROJECT_PHASES
  status: '規劃中' | '執行中' | '已完成' | '已取消'
  autoCreateGroup: boolean
  groupId?: string
  createdAt: Date
  updatedAt: Date
}

interface ProjectStore {
  projects: Project[]
  currentProjectNumber: number
  
  // Actions
  createProjectFromQuotation: (quotationId: string, quotationData: any, autoCreateGroup: boolean) => Project
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
  generateProjectNumber: () => string
  toggleTask: (projectId: string, taskId: string) => void
  addTask: (projectId: string, task: Omit<ProjectTask, 'id'>) => void
  deleteTask: (projectId: string, taskId: string) => void
  generateDefaultTasks: (quotationItems: any[]) => ProjectTask[]
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProjectNumber: 1,

  generateProjectNumber: () => {
    const currentNumber = get().currentProjectNumber
    const year = new Date().getFullYear()
    const formattedNumber = String(currentNumber).padStart(3, '0')
    set({ currentProjectNumber: currentNumber + 1 })
    return `PRJ-${year}-${formattedNumber}`
  },

  generateDefaultTasks: (quotationItems) => {
    const tasks: ProjectTask[] = []
    let taskId = 1

    // 分析報價單內容，自動產生任務
    const hasAirTicket = quotationItems.some(item => 
      item.itemName.includes('機票') || item.itemName.includes('航班')
    )
    const hasHotel = quotationItems.some(item => 
      item.itemName.includes('住宿') || item.itemName.includes('飯店') || item.itemName.includes('酒店')
    )
    const hasMeal = quotationItems.some(item => 
      item.itemName.includes('餐') || item.itemName.includes('用餐')
    )
    const hasActivity = quotationItems.some(item => 
      item.itemName.includes('活動') || item.itemName.includes('門票') || item.itemName.includes('導覽')
    )

    // 提案簽約階段（必要任務）
    tasks.push({
      id: `task-${taskId++}`,
      category: 'DOCUMENT',
      phase: 'PROPOSAL',
      title: '客戶基本資料收集',
      description: '護照影本、聯絡方式',
      responsible: '承辦業務',
      completed: false
    })
    tasks.push({
      id: `task-${taskId++}`,
      category: 'DOCUMENT',
      phase: 'PROPOSAL',
      title: '作業金收款',
      description: '現金／轉帳／刷卡／支票',
      responsible: '承辦業務',
      completed: false
    })
    tasks.push({
      id: `task-${taskId++}`,
      category: 'DOCUMENT',
      phase: 'PROPOSAL',
      title: '合約簽署',
      description: '紙本合約／電子合約',
      responsible: '業務助理',
      completed: false
    })

    // 預訂作業階段（根據報價內容）
    if (hasAirTicket) {
      tasks.push({
        id: `task-${taskId++}`,
        category: 'TRANSPORT',
        phase: 'BOOKING',
        title: '機票預訂',
        description: '含機位保留與開票期限確認',
        responsible: '業務助理',
        completed: false
      })
    }

    if (hasHotel) {
      tasks.push({
        id: `task-${taskId++}`,
        category: 'ACCOMMODATION',
        phase: 'BOOKING',
        title: '住宿預訂',
        description: '依照實際報名人數分配房型，含特殊需求說明',
        responsible: '業務助理',
        completed: false
      })
    }

    if (hasMeal) {
      tasks.push({
        id: `task-${taskId++}`,
        category: 'MEAL',
        phase: 'BOOKING',
        title: '餐廳預訂',
        description: '確認特殊餐食需求，如素食、過敏等',
        responsible: '業務助理',
        completed: false
      })
    }

    if (hasActivity) {
      tasks.push({
        id: `task-${taskId++}`,
        category: 'ACTIVITY',
        phase: 'BOOKING',
        title: '活動與景點預訂',
        description: '預約導覽、購買門票，註明使用日期與時段',
        responsible: '業務助理',
        completed: false
      })
    }

    // 交通安排（通常都需要）
    tasks.push({
      id: `task-${taskId++}`,
      category: 'TRANSPORT',
      phase: 'BOOKING',
      title: '交通安排',
      description: '預訂車輛、司機、路線規劃與接送時間表',
      responsible: '業務助理',
      completed: false
    })

    // 行前準備階段
    tasks.push({
      id: `task-${taskId++}`,
      category: 'OTHER',
      phase: 'PREPARATION',
      title: '行前說明會安排',
      description: '線上／實體',
      responsible: '承辦業務',
      completed: false
    })
    tasks.push({
      id: `task-${taskId++}`,
      category: 'INSURANCE',
      phase: 'PREPARATION',
      title: '旅遊保險辦理',
      description: '旅責險／旅平險',
      responsible: '業務助理',
      completed: false
    })
    tasks.push({
      id: `task-${taskId++}`,
      category: 'DOCUMENT',
      phase: 'PREPARATION',
      title: '出團資料準備',
      description: '行李吊牌、行程手冊、電子機票、住宿憑證等',
      responsible: '業務助理',
      completed: false
    })

    return tasks
  },

  createProjectFromQuotation: (quotationId, quotationData, autoCreateGroup) => {
    const tasks = get().generateDefaultTasks(quotationData.items)
    
    const project: Project = {
      id: get().generateProjectNumber(),
      name: `${quotationData.clientName} - ${new Date(quotationData.dateRange.start).toLocaleDateString('zh-TW')}`,
      quotationId,
      clientName: quotationData.clientName,
      startDate: quotationData.dateRange.start,
      endDate: quotationData.dateRange.end,
      totalDays: quotationData.tripDays,
      tasks,
      currentPhase: 'PROPOSAL',
      status: '規劃中',
      autoCreateGroup,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    set((state) => ({
      projects: [...state.projects, project]
    }))

    return project
  },

  addProject: (projectData) => {
    const project: Project = {
      ...projectData,
      id: get().generateProjectNumber(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    set((state) => ({
      projects: [...state.projects, project]
    }))
    
    return project
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              updatedAt: new Date()
            }
          : p
      )
    }))
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id)
    }))
  },

  getProject: (id) => {
    return get().projects.find((p) => p.id === id)
  },

  toggleTask: (projectId, taskId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined }
                  : t
              ),
              updatedAt: new Date()
            }
          : p
      )
    }))
  },

  addTask: (projectId, taskData) => {
    const task: ProjectTask = {
      ...taskData,
      id: `task-${Date.now()}`
    }

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: [...p.tasks, task],
              updatedAt: new Date()
            }
          : p
      )
    }))
  },

  deleteTask: (projectId, taskId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.filter((t) => t.id !== taskId),
              updatedAt: new Date()
            }
          : p
      )
    }))
  }
}))
