/**
 * 訂單資料模型
 * 完全符合 CornerERP 原始設計
 */

// 訂單狀態枚舉
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// 訂單類型枚舉
export enum OrderType {
  DOMESTIC = 'DOMESTIC',
  INTERNATIONAL = 'INTERNATIONAL',
  CUSTOM = 'CUSTOM'
}

// 付款狀態枚舉
export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  OVERDUE = 'OVERDUE'
}

// 狀態名稱對映
export const ORDER_STATUS_NAMES = {
  [OrderStatus.PENDING]: '待確認',
  [OrderStatus.CONFIRMED]: '已確認',
  [OrderStatus.IN_PROGRESS]: '進行中',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消'
} as const;

export const ORDER_TYPE_NAMES = {
  [OrderType.DOMESTIC]: '國內團',
  [OrderType.INTERNATIONAL]: '國外團',
  [OrderType.CUSTOM]: '客製團'
} as const;

export const PAYMENT_STATUS_NAMES = {
  [PaymentStatus.PENDING]: '待付款',
  [PaymentStatus.PARTIAL]: '部分付款',
  [PaymentStatus.PAID]: '已付款',
  [PaymentStatus.REFUNDED]: '已退款',
  [PaymentStatus.OVERDUE]: '逾期未付'
} as const;

// 狀態顏色對映
export const ORDER_STATUS_COLORS = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
} as const;

export const PAYMENT_STATUS_COLORS = {
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PARTIAL]: 'bg-orange-100 text-orange-800',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
  [PaymentStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
  [PaymentStatus.OVERDUE]: 'bg-red-100 text-red-800'
} as const;

export interface Order {
  // 核心欄位
  orderNumber: string;      // 訂單編號
  groupCode: string;        // 團號
  contactPerson: string;    // 聯絡人
  contactPhone: string;     // 聯絡電話
  orderType: string;        // 訂單類型
  salesPerson: string;      // 業務員
  opId?: string;           // OP員
  
  // 系統欄位
  createdAt: Date;
  createdBy: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  
  // 關聯資料（透過 JOIN 取得）
  groupName?: string;       // 團名（從 groups 表取得）
}

/**
 * 建立預設訂單資料（符合 CornerERP OrderModel）
 */
export function createDefaultOrder(partial?: Partial<Order>): Order {
  const defaults = {
    orderNumber: '',
    groupCode: '',
    contactPerson: '',
    contactPhone: '',
    orderType: '',
    salesPerson: '',
    opId: '',
    createdAt: new Date(),
    createdBy: '',
    modifiedAt: new Date(),
    modifiedBy: ''
  };
  
  return { ...defaults, ...partial };
}
