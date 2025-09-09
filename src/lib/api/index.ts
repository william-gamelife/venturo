/**
 * API 統一導出
 * 所有 API 端點和工具從這裡導出
 */

// 導出 API 客戶端
export { APIClient, apiClient } from './client'
export type { RequestOptions } from './client'

// 導出所有 API 端點
export { todosAPI } from './endpoints/todos'
export { projectsAPI } from './endpoints/projects'
export { groupsAPI } from './endpoints/groups'
export { ordersAPI } from './endpoints/orders'

// 導出 API 類型
export type { TodoQueryParams, TodoStats } from './endpoints/todos'
export type { ProjectQueryParams, ProjectStats } from './endpoints/projects'
export type { Group, GroupStatus, GroupQueryParams } from './endpoints/groups'
export type { Order, OrderType, OrderQueryParams } from './endpoints/orders'

// 統一的 API 物件（方便使用）
import { todosAPI } from './endpoints/todos'
import { projectsAPI } from './endpoints/projects'
import { groupsAPI } from './endpoints/groups'
import { ordersAPI } from './endpoints/orders'

export const api = {
  todos: todosAPI,
  projects: projectsAPI,
  groups: groupsAPI,
  orders: ordersAPI,
} as const

// 預設導出
export default api
