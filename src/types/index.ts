/**
 * Venturo 統一類型定義系統
 * 所有類型定義的單一來源
 */

// ========================================
// 基礎類型
// ========================================

/**
 * 基礎模型介面 - 所有資料模型的基礎
 */
export interface BaseModel {
  id: string
  created_at: string
  updated_at: string
}

// ========================================
// 用戶相關類型
// ========================================

/**
 * 用戶角色 - 使用字串字面量類型
 */
export type UserRole = 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'GENERAL_USER'

/**
 * 用戶角色權限等級（用於比較）
 */
export const UserRoleLevel = {
  SUPER_ADMIN: 100,
  BUSINESS_ADMIN: 50,
  GENERAL_USER: 10
} as const

/**
 * 模組權限定義
 */
export interface ModulePermission {
  read: boolean
  write: boolean
  delete: boolean
  admin: boolean
  [key: string]: boolean // 支援自定義權限
}

/**
 * 用戶權限集合
 */
export interface UserPermissions {
  [module: string]: ModulePermission | boolean
}

/**
 * 用戶介面
 */
export interface User extends BaseModel {
  username: string
  email?: string
  display_name: string
  role: UserRole
  title?: string
  permissions: UserPermissions
  avatar?: string
  last_login_at?: string
}

// ========================================
// 待辦事項相關類型
// ========================================

/**
 * 待辦事項狀態
 */
export type TodoStatus = 
  | 'backlog' 
  | 'in-progress' 
  | 'review' 
  | 'packaging' 
  | 'done'
  | 'waiting'
  | 'unorganized'

/**
 * 優先級
 */
export type Priority = 'low' | 'medium' | 'high'

/**
 * 業務類型（角落模式）
 */
export type BusinessType = 'group' | 'order' | 'general'

/**
 * 資料完整度（角落模式）
 */
export type DataCompleteness = 'skeleton' | 'basic' | 'detailed' | 'complete'

/**
 * 子任務介面
 */
export interface TodoSubtask {
  id: string
  parentId: string
  title: string
  description?: string
  completed: boolean
  assignee?: string
  dueDate?: string
  priority?: Priority
  createdAt: string
  updatedAt: string
}

/**
 * 角落模式資料
 */
export interface CornerModeData {
  isGroupRelated: boolean
  quickActions: string[]
  priority: Priority
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  departureDate?: string
  returnDate?: string
  totalMembers?: number
  budget?: number
  itinerary?: string
  specialRequests?: string
  notes?: string
}

/**
 * 待辦事項介面（統一 Todo 和 TodoItem）
 */
export interface Todo extends BaseModel {
  user_id: string
  title: string
  description?: string
  status: TodoStatus
  category?: string
  assignee?: string
  assigned_to?: string // 相容舊版
  dueDate?: string
  due_date?: string // 相容舊版
  priority?: Priority
  tags?: string[]
  completed: boolean
  completed_at?: string
  
  // 專案相關
  type?: 'task' | 'project'
  projectId?: string
  parentId?: string
  subtasks?: TodoSubtask[]
  isExpanded?: boolean
  
  // 角落模式
  businessType?: BusinessType
  groupCode?: string
  orderNumber?: string
  dataCompleteness?: DataCompleteness
  cornerModeData?: CornerModeData
}

// 保留 TodoItem 作為別名（向後相容）
export type TodoItem = Todo

// ========================================
// 專案相關類型
// ========================================

/**
 * 專案狀態
 */
export type ProjectStatus = 'active' | 'completed' | 'archived'

/**
 * 專案任務
 */
export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  assignee?: string
  dueDate?: string
  priority?: Priority
  estimatedHours?: number
  actualHours?: number
  createdAt: string
  updatedAt: string
}

/**
 * 專案介面
 */
export interface Project extends BaseModel {
  user_id: string
  name: string // 相容舊版
  title: string // 新版
  description?: string
  status: ProjectStatus
  startDate?: string
  endDate?: string
  members?: string[]
  tasks?: ProjectTask[]
  progress?: number
}

// ========================================
// 時間管理相關類型
// ========================================

/**
 * 時間箱條目
 */
export interface TimeboxEntry extends BaseModel {
  day: number // 0-6 (週日到週六)
  hour: number // 6-22 (早上6點到晚上10點)
  activity: string
  category: string
  color?: string
  description?: string
  recurring?: boolean
}

/**
 * 時間箱活動
 */
export interface TimeboxActivity {
  id: string
  name: string
  category: string
  color: string
  description?: string
  defaultDuration?: number
}

// ========================================
// UI 相關類型
// ========================================

/**
 * 小工具類型
 */
export type WidgetType = 'todos' | 'projects' | 'timebox' | 'calendar' | 'stats'

/**
 * 小工具配置
 */
export interface Widget {
  id: string
  type: WidgetType
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

/**
 * 小工具布局
 */
export interface WidgetLayout {
  userId: string
  widgets: Widget[]
  updated_at: string
}

/**
 * 看板欄位
 */
export interface KanbanColumn {
  id: TodoStatus
  title: string
  icon: string
}

/**
 * 快速標籤
 */
export interface QuickTag {
  id: string
  name: string
  color: string
}

// ========================================
// 主題與設定
// ========================================

/**
 * 主題配置
 */
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

/**
 * 用戶設定
 */
export interface UserSettings {
  id: string
  user_id: string
  theme?: string
  language?: string
  notifications?: boolean
  [key: string]: any
}

// ========================================
// API 相關類型
// ========================================

/**
 * API 回應格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 分頁參數
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
  sortBy?: string
}

/**
 * 查詢參數
 */
export interface QueryParams extends PaginationParams {
  search?: string
  filter?: Record<string, any>
}

// ========================================
// 表單類型
// ========================================

/**
 * 登入表單
 */
export interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

/**
 * 待辦事項表單
 */
export interface TodoForm {
  title: string
  description?: string
  status: TodoStatus
  priority?: Priority
  quickTag?: string
  dueDate?: string
  assignee?: string
}

/**
 * 專案表單
 */
export interface ProjectForm {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  members?: string[]
}

// ========================================
// 狀態管理類型
// ========================================

/**
 * 認證狀態
 */
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error?: string
}

/**
 * 應用程式狀態
 */
export interface AppState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  currentMode: 'game' | 'corner'
  notifications: Notification[]
}

/**
 * 通知
 */
export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: number
  read?: boolean
}

// ========================================
// 行事曆相關類型
// ========================================

/**
 * 行事曆事件類型
 */
export type CalendarEventType = 'meeting' | 'task' | 'reminder' | 'personal' | 'work'

/**
 * 行事曆事件狀態
 */
export type CalendarEventStatus = 'confirmed' | 'tentative' | 'cancelled'

/**
 * 行事曆檢視模式
 */
export type CalendarView = 'month' | 'week' | 'day'

/**
 * 行事曆事件
 */
export interface CalendarEvent extends BaseModel {
  user_id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  all_day: boolean
  type?: CalendarEventType
  location?: string
  participants?: string[]
  status?: CalendarEventStatus
  color?: string
}

/**
 * 行事曆事件輸入
 */
export interface CalendarEventInput {
  title: string
  description?: string
  start_date: string
  end_date?: string
  all_day: boolean
  type?: CalendarEventType
  location?: string
  participants?: string[]
  status?: CalendarEventStatus
  color?: string
}

/**
 * 行事曆檢視屬性
 */
export interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  onEventUpdate?: (eventId: string, updates: Partial<CalendarEventInput>) => void
  onEventDelete?: (eventId: string) => void
}

/**
 * 行事曆狀態
 */
export interface CalendarState {
  currentDate: Date
  view: CalendarView
  selectedEvent: CalendarEvent | null
  isLoading: boolean
}

// ========================================
// 統計資料類型
// ========================================

/**
 * 統計資料
 */
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
  finance?: {
    totalRevenue: number
    totalExpense: number
    balance: number
  }
}

// ========================================
// 資料庫相關類型（Supabase）
// ========================================

/**
 * 資料庫 Schema（保留給 Supabase 使用）
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: Omit<User, 'permissions'> & { permissions: string[] | null }
        Insert: Partial<User>
        Update: Partial<User>
      }
      todos: {
        Row: Todo
        Insert: Partial<Todo>
        Update: Partial<Todo>
      }
      projects: {
        Row: Project
        Insert: Partial<Project>
        Update: Partial<Project>
      }
      user_settings: {
        Row: UserSettings
        Insert: Partial<UserSettings>
        Update: Partial<UserSettings>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      todo_status: TodoStatus
      priority: Priority
    }
  }
}

// ========================================
// 工具類型
// ========================================

/**
 * 深度部分類型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 可為空類型
 */
export type Nullable<T> = T | null

/**
 * 可選類型
 */
export type Optional<T> = T | undefined

// ========================================
// 匯出所有類型（向後相容）
// ========================================

// 匯出模組資訊（從 lib/types.ts）
export interface ModuleInfo {
  id: string
  name: string
  icon: string
  path: string
  requiredPermission: string
  description?: string
}

// 匯出用戶資料（從 lib/types.ts）
export interface UserData {
  user_id: string
  module: string
  data: any
  updated_at: string
}

// 匯出批量操作（從 base-api.ts）
export interface BulkOperation<T> {
  action: 'delete' | 'update' | 'archive'
  ids: string[]
  data?: Partial<T>
}
