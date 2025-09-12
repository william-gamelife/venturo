/**
 * 收款單 API
 * 完全符合 CornerERP 原始設計
 */

import { 
  Receipt, 
  createDefaultReceipt,
  RECEIPT_STATUS,
  RECEIPT_TYPE 
} from './models/ReceiptModel';
import { getNextNumber, NumberTypes } from '@/lib/max-numbers/maxNumberApi';
import { OrderApi } from '../orders/OrderApi';

// 模擬資料庫（記憶體儲存）
let receipts: Receipt[] = [
  {
    receiptNumber: 'RCP001',
    orderNumber: 'ORD001',
    receiptDate: new Date('2025-01-06'),
    receiptAmount: 20000,
    actualAmount: 20000,
    receiptType: RECEIPT_TYPE.TRANSFER,
    receiptAccount: '銀行轉帳-台銀',
    email: 'chen@example.com',
    payDateline: new Date('2025-01-10'),
    note: '訂金',
    status: RECEIPT_STATUS.COMPLETED,
    createdAt: new Date('2025-01-06'),
    createdBy: 'admin',
    groupCode: 'GRP001',
    groupName: '日本東京五日遊'
  },
  {
    receiptNumber: 'RCP002',
    orderNumber: 'ORD001',
    receiptDate: new Date('2025-01-20'),
    receiptAmount: 60000,
    actualAmount: 60000,
    receiptType: RECEIPT_TYPE.CREDIT,
    receiptAccount: '信用卡',
    email: 'chen@example.com',
    payDateline: new Date('2025-01-25'),
    note: '尾款',
    status: RECEIPT_STATUS.PENDING,
    createdAt: new Date('2025-01-20'),
    createdBy: 'admin',
    groupCode: 'GRP001',
    groupName: '日本東京五日遊'
  },
  {
    receiptNumber: 'RCP003',
    orderNumber: 'ORD002',
    receiptDate: new Date('2025-01-09'),
    receiptAmount: 160000,
    actualAmount: 160000,
    receiptType: RECEIPT_TYPE.CASH,
    receiptAccount: '現金',
    email: 'lin@example.com',
    payDateline: null,
    note: '全額付清',
    status: RECEIPT_STATUS.COMPLETED,
    createdAt: new Date('2025-01-09'),
    createdBy: 'admin',
    groupCode: 'GRP001',
    groupName: '日本東京五日遊'
  }
];

/**
 * 收款單 API 類別
 */
export class ReceiptApi {
  /**
   * 取得所有收款單
   */
  static async getReceipts(params?: {
    orderNumber?: string;
    groupCode?: string;
    status?: RECEIPT_STATUS[];
    limit?: number;
  }): Promise<Receipt[]> {
    let result = [...receipts];
    
    if (params) {
      // 訂單編號篩選
      if (params.orderNumber) {
        result = result.filter(r => r.orderNumber === params.orderNumber);
      }
      
      // 團號篩選
      if (params.groupCode) {
        result = result.filter(r => r.groupCode === params.groupCode);
      }
      
      // 狀態篩選
      if (params.status && params.status.length > 0) {
        result = result.filter(r => params.status!.includes(r.status));
      }
      
      // 限制筆數
      if (params.limit) {
        result = result.slice(0, params.limit);
      }
    }
    
    // 排序：最新的收款單優先
    result.sort((a, b) => {
      return new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime();
    });
    
    return result;
  }
  
  /**
   * 取得單一收款單
   */
  static async getReceipt(receiptNumber: string): Promise<Receipt | null> {
    const receipt = receipts.find(r => r.receiptNumber === receiptNumber);
    return receipt || null;
  }
  
  /**
   * 取得訂單的所有收款單
   */
  static async getReceiptsByOrder(orderNumber: string): Promise<Receipt[]> {
    const orderReceipts = receipts.filter(r => r.orderNumber === orderNumber);
    
    // 加入關聯資料
    for (const receipt of orderReceipts) {
      const order = await OrderApi.getOrder(orderNumber);
      if (order) {
        receipt.groupCode = order.groupCode;
        receipt.groupName = order.groupName;
      }
    }
    
    return orderReceipts;
  }
  
  /**
   * 取得團體的所有收款單
   */
  static async getReceiptsByGroup(groupCode: string): Promise<Receipt[]> {
    // 先取得團體的所有訂單
    const orders = await OrderApi.getOrdersByGroup(groupCode);
    const orderNumbers = orders.map(o => o.orderNumber);
    
    // 取得這些訂單的所有收款單
    return receipts.filter(r => orderNumbers.includes(r.orderNumber));
  }
  
  /**
   * 建立新收款單
   */
  static async createReceipt(data: Partial<Receipt>): Promise<Receipt> {
    // 生成收款單號
    const receiptNumber = await getNextNumber(NumberTypes.RECEIPT);
    
    // 取得訂單和團體資訊
    if (data.orderNumber) {
      const order = await OrderApi.getOrder(data.orderNumber);
      if (order) {
        data.groupCode = order.groupCode;
        data.groupName = order.groupName;
      }
    }
    
    const newReceipt: Receipt = createDefaultReceipt({
      ...data,
      receiptNumber,
      createdAt: new Date(),
      createdBy: 'current_user'
    });
    
    receipts.push(newReceipt);
    return newReceipt;
  }
  
  /**
   * 更新收款單
   */
  static async updateReceipt(receiptNumber: string, data: Partial<Receipt>): Promise<Receipt | null> {
    const index = receipts.findIndex(r => r.receiptNumber === receiptNumber);
    
    if (index === -1) {
      return null;
    }
    
    receipts[index] = {
      ...receipts[index],
      ...data,
      receiptNumber: receipts[index].receiptNumber, // 收款單號不可改
      modifiedAt: new Date(),
      modifiedBy: 'current_user'
    };
    
    return receipts[index];
  }
  
  /**
   * 刪除收款單
   */
  static async deleteReceipt(receiptNumber: string): Promise<boolean> {
    const index = receipts.findIndex(r => r.receiptNumber === receiptNumber);
    
    if (index === -1) {
      return false;
    }
    
    receipts.splice(index, 1);
    return true;
  }
  
  /**
   * 計算訂單的收款統計
   */
  static async getOrderReceiptStats(orderNumber: string): Promise<{
    totalAmount: number;      // 總收款金額
    actualAmount: number;     // 實收金額
    pendingAmount: number;    // 待收金額
    receiptCount: number;     // 收款單數量
  }> {
    const orderReceipts = await this.getReceiptsByOrder(orderNumber);
    
    const stats = {
      totalAmount: 0,
      actualAmount: 0,
      pendingAmount: 0,
      receiptCount: orderReceipts.length
    };
    
    for (const receipt of orderReceipts) {
      stats.totalAmount += receipt.receiptAmount;
      
      if (receipt.status === RECEIPT_STATUS.COMPLETED) {
        stats.actualAmount += receipt.actualAmount;
      } else if (receipt.status === RECEIPT_STATUS.PENDING) {
        stats.pendingAmount += receipt.receiptAmount;
      }
    }
    
    return stats;
  }
  
  /**
   * 計算團體的收款統計
   */
  static async getGroupReceiptStats(groupCode: string): Promise<{
    totalAmount: number;
    actualAmount: number;
    pendingAmount: number;
    receiptCount: number;
    orderCount: number;
  }> {
    const groupReceipts = await this.getReceiptsByGroup(groupCode);
    const orders = await OrderApi.getOrdersByGroup(groupCode);
    
    const stats = {
      totalAmount: 0,
      actualAmount: 0,
      pendingAmount: 0,
      receiptCount: groupReceipts.length,
      orderCount: orders.length
    };
    
    for (const receipt of groupReceipts) {
      stats.totalAmount += receipt.receiptAmount;
      
      if (receipt.status === RECEIPT_STATUS.COMPLETED) {
        stats.actualAmount += receipt.actualAmount;
      } else if (receipt.status === RECEIPT_STATUS.PENDING) {
        stats.pendingAmount += receipt.receiptAmount;
      }
    }
    
    return stats;
  }
}

export default ReceiptApi;
