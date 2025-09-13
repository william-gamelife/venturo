// Groups 模組的 Model 定義
import { BaseModel } from '@/lib/api/BaseApi'

export interface GroupModel extends BaseModel {
  groupCode: string
  groupName: string
  groupType?: string
  status?: 'active' | 'inactive' | 'completed'
  startDate?: string
  endDate?: string
  description?: string
  memberCount?: number
  maxMembers?: number
}

export const GROUP_STATUS = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  COMPLETED: 'completed' as const
}