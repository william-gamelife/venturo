/**
 * 團體 API
 * 統一的 API 端點定義
 */

import { APIClient } from '../client'
import type { ApiResponse, QueryParams } from '@/types'

// 團體相關類型
export interface Group {
  groupCode: string
  groupName: string
  departureDate: Date | string
  returnDate: Date | string
  status: GroupStatus
  salesPerson: string
  opId: string
  customerCount: number
  createdAt: Date | string
  createdBy: string
  modifiedAt?: Date | string
  modifiedBy?: string
  expReward?: number
  notes?: string
}

export type GroupStatus = 
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SPECIAL'
  | 'CANCELLED'

export const GROUP_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS' as GroupStatus,
  COMPLETED: 'COMPLETED' as GroupStatus,
  SPECIAL: 'SPECIAL' as GroupStatus,
  CANCELLED: 'CANCELLED' as GroupStatus,
} as const

export interface GroupQueryParams extends QueryParams {
  status?: GroupStatus[]
  groupCode?: string
  groupName?: string
  dateFrom?: string
  dateTo?: string
  excludeCompletedGroups?: boolean
}

/**
 * Groups API 類別
 */
export class GroupsAPI extends APIClient {
  constructor() {
    super('/api')
  }
  
  /**
   * 取得所有團體
   */
  async getGroups(params?: GroupQueryParams): Promise<ApiResponse<Group[]>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return this.get<Group[]>(`/groups${queryString}`)
  }
  
  /**
   * 取得單一團體
   */
  async getGroup(groupCode: string): Promise<ApiResponse<Group>> {
    return this.get<Group>(`/groups/${groupCode}`)
  }
  
  /**
   * 建立新團體
   */
  async createGroup(data: Partial<Group>): Promise<ApiResponse<Group>> {
    return this.post<Group>('/groups', data)
  }
  
  /**
   * 更新團體
   */
  async updateGroup(groupCode: string, data: Partial<Group>): Promise<ApiResponse<Group>> {
    return this.put<Group>(`/groups/${groupCode}`, data)
  }
  
  /**
   * 刪除團體
   */
  async deleteGroup(groupCode: string): Promise<ApiResponse<void>> {
    return this.delete(`/groups/${groupCode}`)
  }
  
  /**
   * 批次刪除團體
   */
  async deleteGroups(groupCodes: string[]): Promise<ApiResponse<void>> {
    return this.post('/groups/batch-delete', { groupCodes })
  }
  
  /**
   * 取得團體統計
   */
  async getGroupStats(): Promise<ApiResponse<{
    total: number
    inProgress: number
    completed: number
    cancelled: number
  }>> {
    return this.get('/groups/stats')
  }
}

// 匯出單例
export const groupsAPI = new GroupsAPI()

// 匯出預設
export default groupsAPI
