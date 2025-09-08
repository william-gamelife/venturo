// 用戶類型
export interface User {
  id: string
  username: string
  email?: string
  display_name?: string
  role: UserRole
  permissions?: string[]
  created_at: string
  updated_at: string
  last_login?: string
}

export type UserRole = 'GENERAL_USER' | 'PROJECT_MANAGER' | 'BUSINESS_ADMIN' | 'SUPER_ADMIN'

// 待辦事項類型
export interface Todo {
  id: string
  user_id: string
  title: string
  description?: string
  status: TodoStatus
  tags?: string[]
  due_date?: string
  completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
  assigned_to?: string
}

export type TodoStatus = 'unorganized' | 'in-progress' | 'waiting' | 'project' | 'completed'

// 專案類型
export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

// 快速標籤類型
export interface QuickTag {
  id: string
  name: string
  color: string
}

// 看板欄位類型
export interface KanbanColumn {
  id: TodoStatus
  title: string
  icon: string
}

// 權限類型
export interface Permission {
  module: string
  action: 'read' | 'create' | 'update' | 'delete'
}

// API 回應類型
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// 表單類型
export interface LoginForm {
  username: string
  password: string
}

export interface TodoForm {
  title: string
  description?: string
  status: TodoStatus
  quickTag?: string
  dueDate?: string
}