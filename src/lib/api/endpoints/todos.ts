/**
 * 待辦事項 API
 * 統一的 API 端點定義
 */

import { APIClient } from '../client'
import type { ApiResponse, Todo, TodoStatus, QueryParams } from '@/types'

export interface TodoQueryParams extends QueryParams {
  status?: TodoStatus
  completed?: boolean
  assignee?: string
  projectId?: string
  businessType?: 'group' | 'order' | 'general'
}

export interface TodoStats {
  total: number
  completed: number
  inProgress: number
  overdue: number
  byStatus: Record<TodoStatus, number>
}

/**
 * Todos API 類別
 */
export class TodosAPI extends APIClient {
  constructor() {
    super('/api')
  }
  
  /**
   * 取得所有待辦事項
   */
  async getTodos(params?: TodoQueryParams): Promise<ApiResponse<Todo[]>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return this.get<Todo[]>(`/todos${queryString}`)
  }
  
  /**
   * 取得單一待辦事項
   */
  async getTodo(id: string): Promise<ApiResponse<Todo>> {
    return this.get<Todo>(`/todos/${id}`)
  }
  
  /**
   * 取得用戶的待辦事項
   */
  async getUserTodos(userId: string, params?: TodoQueryParams): Promise<ApiResponse<Todo[]>> {
    const queryString = params ? `&${new URLSearchParams(params as any).toString()}` : ''
    return this.get<Todo[]>(`/todos?user_id=${userId}${queryString}`)
  }
  
  /**
   * 建立新待辦事項
   */
  async createTodo(data: Partial<Todo>): Promise<ApiResponse<Todo>> {
    return this.post<Todo>('/todos', data)
  }
  
  /**
   * 更新待辦事項
   */
  async updateTodo(id: string, data: Partial<Todo>): Promise<ApiResponse<Todo>> {
    return this.put<Todo>(`/todos/${id}`, data)
  }
  
  /**
   * 切換完成狀態
   */
  async toggleComplete(id: string): Promise<ApiResponse<Todo>> {
    return this.patch<Todo>(`/todos/${id}/toggle`)
  }
  
  /**
   * 更新狀態
   */
  async updateStatus(id: string, status: TodoStatus): Promise<ApiResponse<Todo>> {
    return this.patch<Todo>(`/todos/${id}/status`, { status })
  }
  
  /**
   * 刪除待辦事項
   */
  async deleteTodo(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/todos/${id}`)
  }
  
  /**
   * 批次刪除待辦事項
   */
  async deleteTodos(ids: string[]): Promise<ApiResponse<void>> {
    return this.post('/todos/batch-delete', { ids })
  }
  
  /**
   * 批次更新狀態
   */
  async batchUpdateStatus(ids: string[], status: TodoStatus): Promise<ApiResponse<void>> {
    return this.post('/todos/batch-status', { ids, status })
  }
  
  /**
   * 取得待辦事項統計
   */
  async getTodoStats(userId?: string): Promise<ApiResponse<TodoStats>> {
    const query = userId ? `?userId=${userId}` : ''
    return this.get<TodoStats>(`/todos/stats${query}`)
  }
  
  /**
   * 搜尋待辦事項
   */
  async searchTodos(query: string, params?: TodoQueryParams): Promise<ApiResponse<Todo[]>> {
    const queryParams = { ...params, search: query }
    const queryString = new URLSearchParams(queryParams as any).toString()
    return this.get<Todo[]>(`/todos/search?${queryString}`)
  }
  
  /**
   * 取得專案的待辦事項
   */
  async getProjectTodos(projectId: string): Promise<ApiResponse<Todo[]>> {
    return this.get<Todo[]>(`/todos?projectId=${projectId}`)
  }
  
  /**
   * 重新排序待辦事項
   */
  async reorderTodos(ids: string[]): Promise<ApiResponse<void>> {
    return this.post('/todos/reorder', { ids })
  }
}

// 匯出單例
export const todosAPI = new TodosAPI()

// 匯出預設
export default todosAPI
