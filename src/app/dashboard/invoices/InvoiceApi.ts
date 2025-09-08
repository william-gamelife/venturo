/**
 * 請款單 API
 * 完全符合 CornerERP 原始設計
 */

import { 
  Invoice,
  InvoiceItem,
  createDefaultInvoice,
  createDefaultInvoiceItem,
  INVOICE_STATUS,
  INVOICE_ITEM_TYPES
} from './models/InvoiceModel';
import { getNextNumber, NumberTypes } from '@/lib/max-numbers/maxNumberApi';

// 模擬資料庫（記憶體儲存）
let invoices: Invoice[] = [
  {
    groupCode: 'GRP001',
    invoiceNumber: 'INV001',
    orderNumber: 'ORD001',
    status: INVOICE_STATUS.PAID,
    invoiceDate: new Date('2025-01-03'),
    createdAt: new Date('2025-01-03'),
    createdBy: 'admin',
    modifiedAt: new Date('2025-01-03'),
    modifiedBy: 'admin'
  },
  {
    groupCode: 'GRP001',
    invoiceNumber: 'INV002',
    orderNumber: 'ORD002',
    status: INVOICE_STATUS.PROCESSING,
    invoiceDate: new Date('2025-01-07'),
    createdAt: new Date('2025-01-07'),
    createdBy: 'admin',
    modifiedAt: new Date('2025-01-07'),
    modifiedBy: 'admin'
  }
];

let invoiceItems: InvoiceItem[] = [
  {
    id: 1,
    invoiceNumber: 'INV001',
    invoiceType: INVOICE_ITEM_TYPES.HOTEL,
    payFor: 'SUP001',
    price: 30000,
    quantity: 2,
    note: '東京飯店 2晚',
    createdAt: new Date('2025-01-03'),
    createdBy: 'admin',
    modifiedAt: new Date('2025-01-03'),
    modifiedBy: 'admin'
  },
  {
    id: 2,
    invoiceNumber: 'INV001',
    invoiceType: INVOICE_ITEM_TYPES.TICKET,
    payFor: 'SUP002',
    price: 15000,
    quantity: 2,
    note: '來回機票',
    createdAt: new Date('2025-01-03'),
    createdBy: 'admin',
    modifiedAt: new Date('2025-01-03'),
    modifiedBy: 'admin'
  },
  {
    id: 3,
    invoiceNumber: 'INV002',
    invoiceType: INVOICE_ITEM_TYPES.HOTEL,
    payFor: 'SUP001',
    price: 30000,
    quantity: 4,
    note: '東京飯店 2晚 雙人房x2',
    createdAt: new Date('2025-01-07'),
    createdBy: 'admin',
    modifiedAt: new Date('2025-01-07'),
    modifiedBy: 'admin'
  }
];

let nextItemId = 4;

/**
 * 請款單 API 類別
 */
export class InvoiceApi {
  /**
   * 取得所有請款單
   */
  static async getInvoices(params?: {
    groupCode?: string;
    orderNumber?: string;
    status?: InvoiceStatus[];
    limit?: number;
  }): Promise<Invoice[]> {
    let result = [...invoices];
    
    if (params) {
      // 團號篩選
      if (params.groupCode) {
        result = result.filter(i => i.groupCode === params.groupCode);
      }
      
      // 訂單編號篩選
      if (params.orderNumber) {
        result = result.filter(i => i.orderNumber === params.orderNumber);
      }
      
      // 狀態篩選
      if (params.status && params.status.length > 0) {
        result = result.filter(i => params.status!.includes(i.status));
      }
      
      // 限制筆數
      if (params.limit) {
        result = result.slice(0, params.limit);
      }
    }
    
    // 排序：最新的請款單優先
    result.sort((a, b) => {
      return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    });
    
    return result;
  }
  
  /**
   * 取得單一請款單
   */
  static async getInvoice(invoiceNumber: string): Promise<Invoice | null> {
    const invoice = invoices.find(i => i.invoiceNumber === invoiceNumber);
    return invoice || null;
  }
  
  /**
   * 取得請款單的所有項目
   */
  static async getInvoiceItems(invoiceNumber: string): Promise<InvoiceItem[]> {
    return invoiceItems.filter(item => item.invoiceNumber === invoiceNumber);
  }
  
  /**
   * 建立新請款單
   */
  static async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    // 生成請款單號
    const invoiceNumber = await getNextNumber(NumberTypes.INVOICE);
    
    const newInvoice: Invoice = createDefaultInvoice({
      ...data,
      invoiceNumber,
      createdAt: new Date(),
      createdBy: 'current_user',
      modifiedAt: new Date(),
      modifiedBy: 'current_user'
    });
    
    invoices.push(newInvoice);
    return newInvoice;
  }
  
  /**
   * 更新請款單
   */
  static async updateInvoice(invoiceNumber: string, data: Partial<Invoice>): Promise<Invoice | null> {
    const index = invoices.findIndex(i => i.invoiceNumber === invoiceNumber);
    
    if (index === -1) {
      return null;
    }
    
    invoices[index] = {
      ...invoices[index],
      ...data,
      invoiceNumber: invoices[index].invoiceNumber, // 請款單號不可改
      modifiedAt: new Date(),
      modifiedBy: 'current_user'
    };
    
    return invoices[index];
  }
  
  /**
   * 刪除請款單
   */
  static async deleteInvoice(invoiceNumber: string): Promise<boolean> {
    const index = invoices.findIndex(i => i.invoiceNumber === invoiceNumber);
    
    if (index === -1) {
      return false;
    }
    
    // 同時刪除相關項目
    invoiceItems = invoiceItems.filter(item => item.invoiceNumber !== invoiceNumber);
    invoices.splice(index, 1);
    
    return true;
  }
  
  /**
   * 新增請款項目
   */
  static async createInvoiceItem(data: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const newItem: InvoiceItem = createDefaultInvoiceItem({
      ...data,
      id: nextItemId++,
      createdAt: new Date(),
      createdBy: 'current_user',
      modifiedAt: new Date(),
      modifiedBy: 'current_user'
    });
    
    invoiceItems.push(newItem);
    return newItem;
  }
  
  /**
   * 更新請款項目
   */
  static async updateInvoiceItem(id: number, data: Partial<InvoiceItem>): Promise<InvoiceItem | null> {
    const index = invoiceItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    invoiceItems[index] = {
      ...invoiceItems[index],
      ...data,
      id: invoiceItems[index].id, // ID 不可改
      modifiedAt: new Date(),
      modifiedBy: 'current_user'
    };
    
    return invoiceItems[index];
  }
  
  /**
   * 刪除請款項目
   */
  static async deleteInvoiceItem(id: number): Promise<boolean> {
    const index = invoiceItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    invoiceItems.splice(index, 1);
    return true;
  }
  
  /**
   * 計算請款單總金額
   */
  static async getInvoiceTotal(invoiceNumber: string): Promise<number> {
    const items = await this.getInvoiceItems(invoiceNumber);
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  /**
   * 計算團體的請款統計
   */
  static async getGroupInvoiceStats(groupCode: string): Promise<{
    totalCost: number;       // 總成本
    paidCost: number;        // 已付成本
    pendingCost: number;     // 待付成本
    invoiceCount: number;    // 請款單數量
  }> {
    const groupInvoices = await this.getInvoices({ groupCode });
    
    const stats = {
      totalCost: 0,
      paidCost: 0,
      pendingCost: 0,
      invoiceCount: groupInvoices.length
    };
    
    for (const invoice of groupInvoices) {
      const total = await this.getInvoiceTotal(invoice.invoiceNumber);
      stats.totalCost += total;
      
      if (invoice.status === INVOICE_STATUS.PAID) {
        stats.paidCost += total;
      } else if (invoice.status === INVOICE_STATUS.PENDING) {
        stats.pendingCost += total;
      }
    }
    
    return stats;
  }
}

export default InvoiceApi;
