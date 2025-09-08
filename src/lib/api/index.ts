/**
 * API 統一匯出點
 * 所有 API 模組從這裡匯出
 */

// 基礎 API
export { BaseAPI } from '@/lib/base-api'
export type { BaseModel, ApiResponse, QueryParams, BulkOperation } from '@/lib/base-api'

// 模組 API
export { TodoAPI } from './TodoAPI'
export type { Todo, TodoStats } from './TodoAPI'
export { UnifiedTodoAPI } from './UnifiedTodoAPI'
export type { UnifiedTodo } from './UnifiedTodoAPI'

// 未來可以加入更多模組 API
// export { ProjectAPI } from './ProjectAPI'
// export { TimeboxAPI } from './TimeboxAPI'
// export { FinanceAPI } from './FinanceAPI'
