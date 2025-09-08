/**
 * StatusTodoAPI - 狀態式待辦事項 API
 * 專門處理 Kanban 看板式的狀態管理
 */

import { BaseAPI, BaseModel, ApiResponse } from '@/lib/base-api'
import { TodoItem, TodoSubtask } from '@/lib/types'

/**
 * 狀態式待辦事項 API
 */
export class StatusTodoAPI {
  private static MODULE = 'status-todos'

  /**
   * 取得所有待辦事項
   */
  static async getAll(userId: string): Promise<TodoItem[]> {
    const todos = await BaseAPI.loadData<TodoItem>(this.MODULE, userId, [])
    return todos.map(todo => ({
      ...todo,
      id: String(todo.id), // 確保 id 是字串
      status: todo.status || 'backlog',
      priority: todo.priority || 'medium'
    }))
  }

  /**
   * 取得單筆待辦事項
   */
  static async getById(userId: string, id: string): Promise<TodoItem | null> {
    return BaseAPI.getById<TodoItem>(this.MODULE, userId, String(id))
  }

  /**
   * 新增待辦事項
   */
  static async create(
    userId: string,
    todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<TodoItem>> {
    // 設定預設值
    const todoWithDefaults = {
      status: 'backlog' as const,
      priority: 'medium' as const,
      type: 'task' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...todo
    }
    
    return BaseAPI.create<TodoItem>(this.MODULE, userId, todoWithDefaults)
  }

  /**
   * 更新待辦事項
   */
  static async update(
    userId: string,
    id: string,
    updates: Partial<TodoItem>
  ): Promise<ApiResponse<TodoItem>> {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return BaseAPI.update<TodoItem>(this.MODULE, userId, String(id), updatesWithTimestamp)
  }

  /**
   * 刪除待辦事項
   */
  static async delete(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete<TodoItem>(this.MODULE, userId, String(id))
  }

  /**
   * 切換完成狀態 (轉換為狀態)
   */
  static async toggleComplete(userId: string, id: string): Promise<ApiResponse<TodoItem>> {
    const todo = await this.getById(userId, id)
    if (!todo) {
      return {
        success: false,
        error: '找不到該待辦事項'
      }
    }
    
    // 狀態式切換：如果是 done 就回到 backlog，否則變成 done
    const newStatus = todo.status === 'done' ? 'backlog' : 'done'
    return this.update(userId, id, { status: newStatus })
  }

  /**
   * 更新狀態
   */
  static async updateStatus(
    userId: string, 
    id: string, 
    status: TodoItem['status']
  ): Promise<ApiResponse<TodoItem>> {
    return this.update(userId, id, { status })
  }

  /**
   * 批量更新狀態
   */
  static async bulkUpdateStatus(
    userId: string,
    ids: string[],
    status: TodoItem['status']
  ): Promise<ApiResponse<void>> {
    return BaseAPI.bulkOperation<TodoItem>(this.MODULE, userId, {
      action: 'update',
      ids: ids.map(id => String(id)),
      data: { status, updatedAt: new Date().toISOString() }
    })
  }

  /**
   * 批量刪除
   */
  static async bulkDelete(userId: string, ids: string[]): Promise<ApiResponse<void>> {
    return BaseAPI.bulkOperation<TodoItem>(this.MODULE, userId, {
      action: 'delete',
      ids: ids.map(id => String(id))
    })
  }

  /**
   * 依狀態取得待辦事項
   */
  static async getByStatus(userId: string, status: TodoItem['status']): Promise<TodoItem[]> {
    const todos = await this.getAll(userId)
    return todos.filter(todo => todo.status === status)
  }

  /**
   * 新增子任務
   */
  static async addSubtask(
    userId: string,
    parentId: string,
    subtask: Omit<TodoSubtask, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<TodoItem>> {
    const parent = await this.getById(userId, parentId)
    if (!parent) {
      return {
        success: false,
        error: '找不到父任務'
      }
    }

    const newSubtask: TodoSubtask = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentId: String(parentId),
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...subtask
    }

    const updatedSubtasks = [...(parent.subtasks || []), newSubtask]
    
    return this.update(userId, parentId, { subtasks: updatedSubtasks })
  }

  /**
   * 更新子任務
   */
  static async updateSubtask(
    userId: string,
    parentId: string,
    subtaskId: string,
    updates: Partial<TodoSubtask>
  ): Promise<ApiResponse<TodoItem>> {
    const parent = await this.getById(userId, parentId)
    if (!parent) {
      return {
        success: false,
        error: '找不到父任務'
      }
    }

    const updatedSubtasks = (parent.subtasks || []).map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, ...updates, updatedAt: new Date().toISOString() }
        : subtask
    )

    return this.update(userId, parentId, { subtasks: updatedSubtasks })
  }

  /**
   * 刪除子任務
   */
  static async deleteSubtask(
    userId: string,
    parentId: string,
    subtaskId: string
  ): Promise<ApiResponse<TodoItem>> {
    const parent = await this.getById(userId, parentId)
    if (!parent) {
      return {
        success: false,
        error: '找不到父任務'
      }
    }

    const updatedSubtasks = (parent.subtasks || []).filter(subtask => subtask.id !== subtaskId)
    
    return this.update(userId, parentId, { subtasks: updatedSubtasks })
  }

  /**
   * 新增留言
   */
  static async addComment(
    userId: string,
    todoId: string,
    comment: string
  ): Promise<ApiResponse<TodoItem>> {
    const todo = await this.getById(userId, todoId)
    if (!todo) {
      return {
        success: false,
        error: '找不到該待辦事項'
      }
    }

    const comments = [...((todo as any).comments || []), comment.trim()]
    
    return this.update(userId, todoId, { comments } as any)
  }

  /**
   * 取得統計資料
   */
  static async getStats(userId: string): Promise<{
    backlog: number
    'in-progress': number
    review: number
    packaging: number
    done: number
    total: number
  }> {
    const todos = await this.getAll(userId)
    
    return {
      backlog: todos.filter(t => t.status === 'backlog').length,
      'in-progress': todos.filter(t => t.status === 'in-progress').length,
      review: todos.filter(t => t.status === 'review').length,
      packaging: todos.filter(t => t.status === 'packaging').length,
      done: todos.filter(t => t.status === 'done').length,
      total: todos.length
    }
  }

  /**
   * 搜尋待辦事項
   */
  static async search(userId: string, keyword: string): Promise<TodoItem[]> {
    if (!keyword.trim()) return []
    
    const todos = await this.getAll(userId)
    const searchLower = keyword.toLowerCase()
    
    return todos.filter(todo => 
      todo.title.toLowerCase().includes(searchLower) ||
      (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
      (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    )
  }
}

export default StatusTodoAPI