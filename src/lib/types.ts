// 用戶角色權限等級
export enum UserRole {
  SUPER_ADMIN = 100,    // William - 完整系統權限
  BUSINESS_ADMIN = 50,  // Carson - 業務管理權限  
  GENERAL_USER = 10     // KAI - 基本使用權限
}

// 用戶介面
export interface User {
  id: string
  username: string
  display_name: string
  password?: string
  role: string
  title?: string
  permissions: UserPermissions
  avatar?: string
  created_at?: string
  updated_at?: string
  last_login_at?: string
}

// 權限介面 - 簡化為模組級開關
export interface UserPermissions {
  [module: string]: boolean  // true = 該模組全功能，false = 完全隱藏
}

// 模組資訊
export interface ModuleInfo {
  id: string
  name: string
  icon: string
  path: string
  requiredPermission: string
  description?: string
}

// 資料庫記錄介面
export interface UserData {
  user_id: string
  module: string
  data: any
  updated_at: string
}

// 待辦事項相關類型
export interface TodoItem {
  id: string
  title: string
  description?: string
  status: 'backlog' | 'in-progress' | 'review' | 'packaging' | 'done'
  category?: string
  assignee?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  type?: 'task' | 'project'  // 新增：區分一般任務和專案
  projectId?: string  // 新增：關聯的專案ID
  parentId?: string  // 新增：父任務ID（用於子任務）
  subtasks?: TodoSubtask[]  // 新增：子任務列表
  isExpanded?: boolean  // 新增：專案卡片是否展開
  createdAt: string
  updatedAt: string
}

// 子任務類型
export interface TodoSubtask {
  id: string
  parentId: string
  title: string
  description?: string
  completed: boolean
  assignee?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

// 專案管理相關類型
export interface Project {
  id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  members?: string[]
  tasks?: ProjectTask[]
  progress?: number
  createdAt: string
  updatedAt: string
}

export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  assignee?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  estimatedHours?: number
  actualHours?: number
  createdAt: string
  updatedAt: string
}

// 時間箱相關類型
export interface TimeboxEntry {
  id: string
  day: number // 0-6 (週日到週六)
  hour: number // 6-22 (早上6點到晚上10點)
  activity: string
  category: string
  color?: string
  description?: string
  recurring?: boolean
  createdAt: string
  updatedAt: string
}

export interface TimeboxActivity {
  id: string
  name: string
  category: string
  color: string
  description?: string
  defaultDuration?: number
}

// 小工具相關類型
export interface Widget {
  id: string
  type: 'todos' | 'projects' | 'timebox' | 'calendar' | 'stats'
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config?: any
  visible: boolean
}

export interface WidgetLayout {
  userId: string
  widgets: Widget[]
  updated_at: string
}

// API 回應類型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 認證狀態
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// 主題配置
export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    accent: string
    background: string
    card: string
    text: string
    textMuted: string
    border: string
  }
}

// 統計資料類型
export interface Stats {
  todos: {
    total: number
    completed: number
    inProgress: number
    overdue: number
  }
  projects: {
    total: number
    active: number
    completed: number
    averageProgress: number
  }
  timebox: {
    plannedHours: number
    completedHours: number
    efficiency: number
  }
}