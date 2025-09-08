/**
 * 團體資料模型
 * 完全符合 CornerERP 原始設計
 */

export interface Group {
  // 核心欄位
  groupCode: string;        // 團號
  groupName: string;        // 團名
  departureDate: Date;      // 出發日期
  returnDate: Date;         // 回程日期
  status: number;           // 團狀態 (0: 進行中, 1: 已結團, 9: 特殊團)
  
  // 系統欄位
  createdAt: Date;
  createdBy: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  
  // 關聯資料（從 orders JOIN 取得，不存在資料庫）
  op?: string;              // OP員顯示名稱（從訂單彙總）
  salesPerson?: string;     // 業務員顯示名稱（從訂單彙總）
}

// 團狀態常數
export const GROUP_STATUS = {
  IN_PROGRESS: 0,  // 進行中
  COMPLETED: 1,    // 已結團
  SPECIAL: 9       // 特殊團
} as const;

// 團狀態枚舉 (for compatibility with UI components)
export const GroupStatus = {
  IN_PROGRESS: 0,  // 進行中
  COMPLETED: 1,    // 已結團
  SPECIAL: 9       // 特殊團
} as const;

export type GroupStatusType = typeof GROUP_STATUS[keyof typeof GROUP_STATUS];

// 團狀態名稱
export const GROUP_STATUS_NAMES: Record<GroupStatusType, string> = {
  [GROUP_STATUS.IN_PROGRESS]: '進行中',
  [GROUP_STATUS.COMPLETED]: '已結團',
  [GROUP_STATUS.SPECIAL]: '特殊團'
};

// 團狀態顏色（用於 UI）
export const GROUP_STATUS_COLORS: Record<GroupStatusType, string> = {
  [GROUP_STATUS.IN_PROGRESS]: 'success',
  [GROUP_STATUS.COMPLETED]: 'default',
  [GROUP_STATUS.SPECIAL]: 'warning'
};

/**
 * 建立預設團體資料（符合 CornerERP GroupModel）
 */
export function createDefaultGroup(partial?: Partial<Group>): Group {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const defaults = {
    groupCode: '',
    groupName: '',
    departureDate: today,
    returnDate: today,      // CornerERP 預設同一天
    status: GROUP_STATUS.IN_PROGRESS,
    createdAt: today,
    createdBy: '',
    modifiedAt: undefined,
    modifiedBy: undefined
  };
  
  return { ...defaults, ...partial };
}
