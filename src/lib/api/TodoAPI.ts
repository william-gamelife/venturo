/**
 * TodoAPI - 待辦事項 API
 * 基於 BaseAPI 擴展，提供待辦事項特定功能
 */

import { BaseAPI, BaseModel, ApiResponse, QueryParams } from '@/lib/base-api'

// 待辦事項資料模型
export interface Todo extends BaseModel {
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  tags?: string[]
  category?: string
  parentId?: string  // 用於子任務
}

// 待辦事項統計
export interface TodoStats {
  total: number
  completed: number
  pending: number
  overdue: number
  todayDue: number
  highPriority: number
}

/**
 * TodoAPI 類別
 */
export class TodoAPI {
  private static MODULE = 'todos'

  /**
   * 取得所有待辦事項
   */
  static async getAll(userId: string): Promise<Todo[]> {
    return BaseAPI.loadData<Todo>(this.MODULE, userId, [])
  }

  /**
   * 取得單筆待辦事項
   */
  static async getById(userId: string, id: string): Promise<Todo | null> {
    return BaseAPI.getById<Todo>(this.MODULE, userId, id)
  }

  /**
   * 新增待辦事項
   */
  static async create(
    userId: string,
    todo: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'syncStatus'>
  ): Promise<ApiResponse<Todo>> {
    // 設定預設值
    const todoWithDefaults = {
      completed: false,
      priority: 'medium' as const,
      ...todo
    }
    
    return BaseAPI.create<Todo>(this.MODULE, userId, todoWithDefaults)
  }

  /**
   * 更新待辦事項
   */
  static async update(
    userId: string,
    id: string,
    updates: Partial<Todo>
  ): Promise<ApiResponse<Todo>> {
    return BaseAPI.update<Todo>(this.MODULE, userId, id, updates)
  }

  /**
   * 刪除待辦事項
   */
  static async delete(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete<Todo>(this.MODULE, userId, id)
  }

  /**
   * 切換完成狀態
   */
  static async toggleComplete(userId: string, id: string): Promise<ApiResponse<Todo>> {
    const todo = await this.getById(userId, id)
    if (!todo) {
      return {
        success: false,
        error: '找不到該待辦事項'
      }
    }
    
    return this.update(userId, id, { completed: !todo.completed })
  }

  /**
   * 批量完成
   */
  static async bulkComplete(userId: string, ids: string[]): Promise<ApiResponse<void>> {
    return BaseAPI.bulkOperation<Todo>(this.MODULE, userId, {
      action: 'update',
      ids,
      data: { completed: true }
    })
  }

  /**
   * 批量刪除
   */
  static async bulkDelete(userId: string, ids: string[]): Promise<ApiResponse<void>> {
    return BaseAPI.bulkOperation<Todo>(this.MODULE, userId, {
      action: 'delete',
      ids
    })
  }

  /**
   * 查詢待辦事項
   */
  static async query(userId: string, params: QueryParams & {
    completed?: boolean
    priority?: 'low' | 'medium' | 'high'
    category?: string
    hasDeadline?: boolean
  }): Promise<Todo[]> {
    // 建立過濾條件
    const filter: Record<string, any> = {}
    
    if (params.completed !== undefined) {
      filter.completed = params.completed
    }
    if (params.priority) {
      filter.priority = params.priority
    }
    if (params.category) {
      filter.category = params.category
    }
    
    // 使用 BaseAPI 的查詢功能
    let todos = await BaseAPI.query<Todo>(this.MODULE, userId, {
      ...params,
      filter
    })
    
    // 額外的過濾邏輯
    if (params.hasDeadline !== undefined) {
      todos = todos.filter(todo => 
        params.hasDeadline ? !!todo.dueDate : !todo.dueDate
      )
    }
    
    return todos
  }

  /**
   * 取得今日待辦
   */
  static async getTodayTodos(userId: string): Promise<Todo[]> {
    const todos = await this.getAll(userId)
    const today = new Date().toISOString().split('T')[0]
    
    return todos.filter(todo => {
      if (!todo.dueDate) return false
      const dueDate = todo.dueDate.split('T')[0]
      return dueDate === today && !todo.completed
    })
  }

  /**
   * 取得過期待辦
   */
  static async getOverdueTodos(userId: string): Promise<Todo[]> {
    const todos = await this.getAll(userId)
    const today = new Date().toISOString().split('T')[0]
    
    return todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false
      const dueDate = todo.dueDate.split('T')[0]
      return dueDate < today
    })
  }

  /**
   * 取得統計資料
   */
  static async getStats(userId: string): Promise<TodoStats> {
    const todos = await this.getAll(userId)
    const today = new Date().toISOString().split('T')[0]
    
    const stats: TodoStats = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length,
      overdue: 0,
      todayDue: 0,
      highPriority: todos.filter(t => t.priority === 'high' && !t.completed).length
    }
    
    todos.forEach(todo => {
      if (todo.dueDate && !todo.completed) {
        const dueDate = todo.dueDate.split('T')[0]
        if (dueDate < today) stats.overdue++
        if (dueDate === today) stats.todayDue++
      }
    })
    
    return stats
  }

  /**
   * 搜尋待辦事項
   */
  static async search(userId: string, keyword: string): Promise<Todo[]> {
    if (!keyword.trim()) return []
    
    const todos = await this.getAll(userId)
    const searchLower = keyword.toLowerCase()
    
    return todos.filter(todo => 
      todo.title.toLowerCase().includes(searchLower) ||
      (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
      (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    )
  }

  /**
   * 依分類取得待辦事項
   */
  static async getByCategory(userId: string, category: string): Promise<Todo[]> {
    return this.query(userId, { category })
  }

  /**
   * 取得所有分類
   */
  static async getCategories(userId: string): Promise<string[]> {
    const todos = await this.getAll(userId)
    const categories = new Set<string>()
    
    todos.forEach(todo => {
      if (todo.category) {
        categories.add(todo.category)
      }
    })
    
    return Array.from(categories).sort()
  }

  /**
   * 取得所有標籤
   */
  static async getTags(userId: string): Promise<string[]> {
    const todos = await this.getAll(userId)
    const tags = new Set<string>()
    
    todos.forEach(todo => {
      if (todo.tags) {
        todo.tags.forEach(tag => tags.add(tag))
      }
    })
    
    return Array.from(tags).sort()
  }

  /**
   * 複製待辦事項
   */
  static async duplicate(userId: string, id: string): Promise<ApiResponse<Todo>> {
    const todo = await this.getById(userId, id)
    if (!todo) {
      return {
        success: false,
        error: '找不到該待辦事項'
      }
    }
    
    const { id: _, createdAt, updatedAt, syncStatus, ...todoData } = todo
    return this.create(userId, {
      ...todoData,
      title: `${todoData.title} (複製)`,
      completed: false
    })
  }

  /**
   * 清除已完成的待辦事項
   */
  static async clearCompleted(userId: string): Promise<ApiResponse<void>> {
    const todos = await this.getAll(userId)
    const completedIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id)
    
    if (completedIds.length === 0) {
      return {
        success: false,
        error: '沒有已完成的待辦事項'
      }
    }
    
    return this.bulkDelete(userId, completedIds)
  }
}

// 匯出預設
export default TodoAPI
