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

export const GROUP_STATUS_NAMES = {
  [GROUP_STATUS.ACTIVE]: '進行中',
  [GROUP_STATUS.INACTIVE]: '暫停',
  [GROUP_STATUS.COMPLETED]: '完成'
}

export const GROUP_STATUS_COLORS = {
  [GROUP_STATUS.ACTIVE]: 'green',
  [GROUP_STATUS.INACTIVE]: 'yellow',
  [GROUP_STATUS.COMPLETED]: 'blue'
}

export const createDefaultGroup = (): Partial<GroupModel> => ({
  groupCode: '',
  groupName: '',
  status: GROUP_STATUS.ACTIVE,
  memberCount: 0,
  maxMembers: 10
})