/**
 * 收款單資料模型
 * 完全符合 CornerERP 原始設計
 */

// 收款狀態
export const RECEIPT_STATUS = {
  PENDING: 0,      // 待收款
  PARTIAL: 1,      // 部分收款
  COMPLETED: 2,    // 已收款
  CANCELLED: 9     // 已取消
} as const;

export type ReceiptStatus = typeof RECEIPT_STATUS[keyof typeof RECEIPT_STATUS];

// 收款方式
export const RECEIPT_TYPE = {
  CASH: 1,         // 現金
  TRANSFER: 2,     // 轉帳
  CREDIT: 3,       // 信用卡
  CHECK: 4,        // 支票
  OTHER: 9         // 其他
} as const;

export type ReceiptType = typeof RECEIPT_TYPE[keyof typeof RECEIPT_TYPE];

export interface Receipt {
  // 核心欄位
  receiptNumber: string;    // 收款單號
  orderNumber: string;      // 訂單編號
  receiptDate: Date;        // 收款日期
  receiptAmount: number;    // 收款金額
  actualAmount: number;     // 實收金額
  receiptType: ReceiptType | null; // 付款方式
  receiptAccount: string;   // 收款帳號
  email: string;           // 收款Email
  payDateline: Date | null; // 付款截止日
  note: string;            // 備註
  status: ReceiptStatus;    // 狀態
  
  // 系統欄位
  createdAt: Date;
  createdBy: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  
  // 關聯資料（透過 JOIN 取得）
  groupCode?: string;       // 團號（從 orders 表取得）
  groupName?: string;       // 團名（從 orders -> groups 取得）
}

// 收款狀態名稱
export const RECEIPT_STATUS_NAMES: Record<ReceiptStatus, string> = {
  [RECEIPT_STATUS.PENDING]: '待收款',
  [RECEIPT_STATUS.PARTIAL]: '部分收款',
  [RECEIPT_STATUS.COMPLETED]: '已收款',
  [RECEIPT_STATUS.CANCELLED]: '已取消'
};

// 收款方式名稱
export const RECEIPT_TYPE_NAMES: Record<ReceiptType, string> = {
  [RECEIPT_TYPE.CASH]: '現金',
  [RECEIPT_TYPE.TRANSFER]: '轉帳',
  [RECEIPT_TYPE.CREDIT]: '信用卡',
  [RECEIPT_TYPE.CHECK]: '支票',
  [RECEIPT_TYPE.OTHER]: '其他'
};

// 收款狀態顏色
export const RECEIPT_STATUS_COLORS: Record<ReceiptStatus, string> = {
  [RECEIPT_STATUS.PENDING]: 'warning',
  [RECEIPT_STATUS.PARTIAL]: 'info',
  [RECEIPT_STATUS.COMPLETED]: 'success',
  [RECEIPT_STATUS.CANCELLED]: 'error'
};

/**
 * 建立預設收款單資料（符合 CornerERP ReceiptModel）
 */
export function createDefaultReceipt(partial?: Partial<Receipt>): Receipt {
  const defaults = {
    receiptNumber: '',
    orderNumber: '',
    receiptDate: new Date(),
    receiptAmount: 0,
    actualAmount: 0,
    receiptType: null,
    receiptAccount: '',
    email: '',
    payDateline: null,
    note: '',
    status: RECEIPT_STATUS.PENDING,
    createdAt: new Date(),
    createdBy: '',
    modifiedAt: undefined,
    modifiedBy: undefined
  };
  
  return { ...defaults, ...partial };
}

/**
 * 取得收款方式名稱
 */
export function getReceiptTypeName(type: ReceiptType | null): string {
  if (type === null) return '-';
  return RECEIPT_TYPE_NAMES[type] || '-';
}
