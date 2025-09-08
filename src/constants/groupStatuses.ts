/**
 * 旅遊團狀態常量定義
 */

// 狀態代碼
export const GROUP_STATUSES = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN', 
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

// 狀態中文名稱
export const GROUP_STATUS_NAMES = {
  [GROUP_STATUSES.DRAFT]: '草稿',
  [GROUP_STATUSES.OPEN]: '開放報名',
  [GROUP_STATUSES.CONFIRMED]: '已確認',
  [GROUP_STATUSES.IN_PROGRESS]: '進行中',
  [GROUP_STATUSES.COMPLETED]: '已完成', 
  [GROUP_STATUSES.CANCELLED]: '已取消'
} as const;

// 狀態顏色配置
export const GROUP_STATUS_COLORS = {
  [GROUP_STATUSES.DRAFT]: 'default',
  [GROUP_STATUSES.OPEN]: 'primary',
  [GROUP_STATUSES.CONFIRMED]: 'success',
  [GROUP_STATUSES.IN_PROGRESS]: 'warning',
  [GROUP_STATUSES.COMPLETED]: 'info',
  [GROUP_STATUSES.CANCELLED]: 'error'
} as const;

// 狀態選項列表
export const GROUP_STATUS_OPTIONS = Object.keys(GROUP_STATUSES).map(key => ({
  value: GROUP_STATUSES[key as keyof typeof GROUP_STATUSES],
  label: GROUP_STATUS_NAMES[GROUP_STATUSES[key as keyof typeof GROUP_STATUSES]]
}));

// 類型定義
export type GroupStatus = typeof GROUP_STATUSES[keyof typeof GROUP_STATUSES];
export type GroupStatusColor = typeof GROUP_STATUS_COLORS[keyof typeof GROUP_STATUS_COLORS];