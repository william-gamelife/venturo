/**
 * 請款單資料模型
 * 完全符合 CornerERP 原始設計
 */

// 請款狀態
export const INVOICE_STATUS = {
  PENDING: 0,      // 待請款
  PROCESSING: 1,   // 處理中
  PAID: 2,        // 已付款
  CANCELLED: 9    // 已取消
} as const;

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];

// 請款項目類型
export const INVOICE_ITEM_TYPES = {
  HOTEL: 'hotel',           // 飯店
  TICKET: 'ticket',         // 機票
  TRANSPORT: 'transport',   // 交通
  MEAL: 'meal',            // 餐食
  GUIDE: 'guide',          // 導遊
  OTHER: 'other'           // 其他
} as const;

export type InvoiceItemType = typeof INVOICE_ITEM_TYPES[keyof typeof INVOICE_ITEM_TYPES];

/**
 * 請款單主表
 */
export interface Invoice {
  // 核心欄位
  groupCode: string;        // 團號
  invoiceNumber: string;    // 請款單號
  orderNumber: string;      // 訂單編號
  status: InvoiceStatus;    // 狀態
  invoiceDate: Date;        // 請款日期
  
  // 系統欄位
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

/**
 * 請款單項目（明細）
 */
export interface InvoiceItem {
  id: number;               // 請款項目編號
  invoiceNumber: string;    // 請款單號
  invoiceType: InvoiceItemType; // 請款類型
  payFor: string;          // 付款給supplier的代號
  price: number;           // 價格
  quantity: number;        // 數量
  note: string;           // 備註
  
  // 系統欄位
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

// 請款狀態名稱
export const INVOICE_STATUS_NAMES: Record<InvoiceStatus, string> = {
  [INVOICE_STATUS.PENDING]: '待請款',
  [INVOICE_STATUS.PROCESSING]: '處理中',
  [INVOICE_STATUS.PAID]: '已付款',
  [INVOICE_STATUS.CANCELLED]: '已取消'
};

// 請款項目類型名稱
export const INVOICE_ITEM_TYPE_NAMES: Record<InvoiceItemType, string> = {
  [INVOICE_ITEM_TYPES.HOTEL]: '飯店',
  [INVOICE_ITEM_TYPES.TICKET]: '機票',
  [INVOICE_ITEM_TYPES.TRANSPORT]: '交通',
  [INVOICE_ITEM_TYPES.MEAL]: '餐食',
  [INVOICE_ITEM_TYPES.GUIDE]: '導遊',
  [INVOICE_ITEM_TYPES.OTHER]: '其他'
};

// 請款狀態顏色
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  [INVOICE_STATUS.PENDING]: 'warning',
  [INVOICE_STATUS.PROCESSING]: 'info',
  [INVOICE_STATUS.PAID]: 'success',
  [INVOICE_STATUS.CANCELLED]: 'error'
};

/**
 * 建立預設請款單資料（符合 CornerERP InvoiceModel）
 */
export function createDefaultInvoice(partial?: Partial<Invoice>): Invoice {
  const defaults = {
    groupCode: '',
    invoiceNumber: '',
    orderNumber: '',
    status: INVOICE_STATUS.PENDING,
    invoiceDate: new Date(),
    createdAt: new Date(),
    createdBy: '',
    modifiedAt: new Date(),
    modifiedBy: ''
  };
  
  return { ...defaults, ...partial };
}

/**
 * 建立預設請款項目資料（符合 CornerERP InvoiceItemModel）
 */
export function createDefaultInvoiceItem(partial?: Partial<InvoiceItem>, isNew = false): InvoiceItem {
  const defaults = {
    id: 0,
    invoiceNumber: '',
    invoiceType: INVOICE_ITEM_TYPES.OTHER,
    payFor: '',
    price: 0,
    quantity: 1,
    note: '',
    createdAt: new Date(),
    createdBy: '',
    modifiedAt: new Date(),
    modifiedBy: ''
  };
  
  const item = { ...defaults, ...partial };
  
  if (isNew) {
    delete (item as any).id;
  }
  
  return item;
}
