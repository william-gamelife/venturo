/**
 * UnifiedTodoAPI - 統一的待辦事項 API
 * 整合 TodoAPI 和 StatusTodoAPI，避免雙系統問題
 */

import { BaseAPI, BaseModel, ApiResponse, QueryParams } from '@/lib/base-api'
import { TodoItem, TodoSubtask } from '@/lib/types'

// 擴展 TodoItem 以相容 BaseModel
export interface UnifiedTodo extends TodoItem, BaseModel {
  // TodoItem 已有的欄位
  // BaseModel 額外需要的欄位
  userId: string
  syncStatus?: 'local' | 'synced' | 'pending' | 'conflict'
}

/**
 * 統一的待辦事項 API
 * 同時支援 completed 和 status 模式
 */
export class UnifiedTodoAPI {
  private static MODULE = 'todos'

  /**
   * 資料格式轉換：確保相容性
   */
  private static normalizeData(data: any[]): UnifiedTodo[] {
    return data.map(item => ({
      ...item,
      // 確保有 status 欄位
      status: item.status || (item.completed ? 'done' : 'backlog'),
      // 確保有 completed 欄位（為了相容）
      completed: item.completed ?? (item.status === 'done'),
      // 確保有預設值
      tags: item.tags || [],
      comments: item.comments || [],
      type: item.type || 'task',
      priority: item.priority || 'medium'
    }))
  }

  /**
   * 取得所有待辦事項
   */
  static async getAll(userId: string): Promise<UnifiedTodo[]> {
    const data = await BaseAPI.loadData<UnifiedTodo>(this.MODULE, userId, [])
    return this.normalizeData(data)
  }

  /**
   * 新增待辦事項
   */
  static async create(
    userId: string,
    todo: Partial<TodoItem>
  ): Promise<ApiResponse<UnifiedTodo>> {
    const todoData = {
      title: todo.title || '',
      description: todo.description || '',
      status: todo.status || 'backlog',
      completed: todo.status === 'done',
      tags: todo.tags || [],
      type: todo.type || 'task',
      priority: todo.priority || 'medium',
      comments: todo.comments || [],
      subtasks: todo.subtasks || []
    }

    return BaseAPI.create<UnifiedTodo>(this.MODULE, userId, todoData as any)
  }

  /**
   * 更新待辦事項
   */
  static async update(
    userId: string,
    id: string,
    updates: Partial<TodoItem>
  ): Promise<ApiResponse<UnifiedTodo>> {
    // 如果更新 status，同步更新 completed
    if (updates.status) {
      updates.completed = updates.status === 'done'
    }
    // 如果更新 completed，同步更新 status
    if (updates.completed !== undefined) {
      updates.status = updates.completed ? 'done' : 'backlog'
    }

    return BaseAPI.update<UnifiedTodo>(this.MODULE, userId, id, updates)
  }

  /**
   * 更新狀態（看板拖放）
   */
  static async updateStatus(
    userId: string,
    id: string,
    status: TodoItem['status']
  ): Promise<ApiResponse<UnifiedTodo>> {
    return this.update(userId, id, { 
      status, 
      completed: status === 'done' 
    })
  }

  /**
   * 切換完成狀態（勾選框）
   */
  static async toggleComplete(
    userId: string,
    id: string
  ): Promise<ApiResponse<UnifiedTodo>> {
    const todos = await this.getAll(userId)
    const todo = todos.find(t => t.id === id)
    
    if (!todo) {
      return {
        success: false,
        error: '找不到該待辦事項'
      }
    }

    // 根據當前狀態決定新狀態
    const newStatus = todo.status === 'done' ? 'backlog' : 'done'
    return this.updateStatus(userId, id, newStatus)
  }

  /**
   * 批量更新狀態
   */
  static async bulkUpdateStatus(
    userId: string,
    ids: string[],
    status: TodoItem['status']
  ): Promise<ApiResponse<void>> {
    return BaseAPI.bulkOperation<UnifiedTodo>(this.MODULE, userId, {
      action: 'update',
      ids,
      data: { 
        status, 
        completed: status === 'done' 
      }
    })
  }

  /**
   * 刪除待辦事項
   */
  static async delete(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete<UnifiedTodo>(this.MODULE, userId, id)
  }

  /**
   * 新增子任務
   */
  static async addSubtask(
    userId: string,
    parentId: string,
    subtask: { title: string; priority?: string }
  ): Promise<ApiResponse<UnifiedTodo>> {
    const todos = await this.getAll(userId)
    const parent = todos.find(t => t.id === parentId)
    
    if (!parent) {
      return {
        success: false,
        error: '找不到父任務'
      }
    }

    const newSubtask: TodoSubtask = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentId,
      title: subtask.title,
      completed: false,
      priority: (subtask.priority || 'medium') as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedParent = {
      ...parent,
      subtasks: [...(parent.subtasks || []), newSubtask]
    }

    return this.update(userId, parentId, updatedParent)
  }

  /**
   * 更新子任務
   */
  static async updateSubtask(
    userId: string,
    parentId: string,
    subtaskId: string,
    updates: Partial<TodoSubtask>
  ): Promise<ApiResponse<UnifiedTodo>> {
    const todos = await this.getAll(userId)
    const parent = todos.find(t => t.id === parentId)
    
    if (!parent || !parent.subtasks) {
      return {
        success: false,
        error: '找不到任務或子任務'
      }
    }

    const updatedSubtasks = parent.subtasks.map(st =>
      st.id === subtaskId
        ? { ...st, ...updates, updatedAt: new Date().toISOString() }
        : st
    )

    // 檢查是否所有子任務都完成
    const allCompleted = updatedSubtasks.every(st => st.completed)
    
    return this.update(userId, parentId, {
      subtasks: updatedSubtasks,
      // 如果所有子任務完成，更新父任務狀態
      status: allCompleted ? 'done' : parent.status
    })
  }

  /**
   * 新增留言
   */
  static async addComment(
    userId: string,
    taskId: string,
    comment: string
  ): Promise<ApiResponse<UnifiedTodo>> {
    const todos = await this.getAll(userId)
    const todo = todos.find(t => t.id === taskId)
    
    if (!todo) {
      return {
        success: false,
        error: '找不到該任務'
      }
    }

    return this.update(userId, taskId, {
      comments: [...(todo.comments || []), comment.trim()]
    })
  }

  /**
   * 取得統計資料
   */
  static async getStats(userId: string) {
    const todos = await this.getAll(userId)
    
    return {
      total: todos.length,
      backlog: todos.filter(t => t.status === 'backlog').length,
      inProgress: todos.filter(t => t.status === 'in-progress').length,
      review: todos.filter(t => t.status === 'review').length,
      packaging: todos.filter(t => t.status === 'packaging').length,
      done: todos.filter(t => t.status === 'done').length,
      projects: todos.filter(t => t.type === 'project').length,
      tasks: todos.filter(t => t.type === 'task').length
    }
  }
}