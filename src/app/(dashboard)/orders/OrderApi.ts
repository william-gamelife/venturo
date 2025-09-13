/**
 * 訂單 API
 * 完全符合 CornerERP 原始設計（無金額欄位）
 */

import { Order, createDefaultOrder } from './models/OrderModel';
import { getNextNumber, NumberTypes } from '@/lib/max-numbers/maxNumberApi';
import { GroupApi } from '../groups/GroupApi';

// 模擬資料庫（記憶體儲存）
let orders: Order[] = [
  {
    orderNumber: 'ORD001',
    groupCode: 'GRP001',
    contactPerson: '陳小明',
    contactPhone: '0912-345-678',
    orderType: 'individual',
    salesPerson: 'USER001',
    opId: 'OP001',
    groupName: '日本東京五日遊',
    createdAt: new Date('2025-01-05'),
    createdBy: 'admin',
    modifiedAt: new Date('2025-01-05'),
    modifiedBy: 'admin'
  },
  {
    orderNumber: 'ORD002',
    groupCode: 'GRP001',
    contactPerson: '林小華',
    contactPhone: '0923-456-789',
    orderType: 'group',
    salesPerson: 'USER001',
    opId: 'OP001',
    groupName: '日本東京五日遊',
    createdAt: new Date('2025-01-08'),
    createdBy: 'admin',
    modifiedAt: new Date('2025-01-08'),
    modifiedBy: 'admin'
  },
  {
    orderNumber: 'ORD003',
    groupCode: 'GRP002',
    contactPerson: '張大同',
    contactPhone: '0934-567-890',
    orderType: 'corporate',
    salesPerson: 'USER002',
    groupName: '韓國首爾四日遊',
    createdAt: new Date('2025-01-10'),
    createdBy: 'admin',
    modifiedAt: new Date('2025-01-10'),
    modifiedBy: 'admin'
  }
];

/**
 * 訂單 API 類別
 */
export class OrderApi {
  /**
   * 取得所有訂單
   */
  static async getOrders(params?: {
    groupCode?: string;
    searchTerm?: string;
    limit?: number;
  }): Promise<Order[]> {
    let result = [...orders];
    
    if (params) {
      // 團號篩選
      if (params.groupCode) {
        result = result.filter(o => o.groupCode === params.groupCode);
      }
      
      // 搜尋（訂單號、聯絡人、電話）
      if (params.searchTerm) {
        const term = params.searchTerm.toLowerCase();
        result = result.filter(o => 
          o.orderNumber.toLowerCase().includes(term) ||
          o.contactPerson.toLowerCase().includes(term) ||
          o.contactPhone.includes(term)
        );
      }
      
      // 限制筆數
      if (params.limit) {
        result = result.slice(0, params.limit);
      }
    }
    
    // 排序：按團號降序
    result.sort((a, b) => b.groupCode.localeCompare(a.groupCode));
    
    return result;
  }
  
  /**
   * 取得單一訂單
   */
  static async getOrder(orderNumber: string): Promise<Order | null> {
    const order = orders.find(o => o.orderNumber === orderNumber);
    return order || null;
  }
  
  /**
   * 取得團體的所有訂單
   */
  static async getOrdersByGroup(groupCode: string): Promise<Order[]> {
    return orders.filter(o => o.groupCode === groupCode);
  }
  
  /**
   * 建立新訂單
   */
  static async createOrder(data: Partial<Order>): Promise<Order> {
    // 生成訂單號
    const orderNumber = await getNextNumber(NumberTypes.ORDER);
    
    // 取得團體資訊
    let groupName = data.groupName;
    if (data.groupCode && !groupName) {
      const group = await GroupApi.getGroup(data.groupCode);
      if (group) {
        groupName = group.groupName;
      }
    }
    
    const newOrder: Order = createDefaultOrder({
      ...data,
      orderNumber,
      groupName,
      createdAt: new Date(),
      createdBy: 'current_user',
      modifiedAt: new Date(),
      modifiedBy: 'current_user'
    });
    
    orders.push(newOrder);
    return newOrder;
  }
  
  /**
   * 更新訂單
   */
  static async updateOrder(orderNumber: string, data: Partial<Order>): Promise<Order | null> {
    const index = orders.findIndex(o => o.orderNumber === orderNumber);
    
    if (index === -1) {
      return null;
    }
    
    // 更新資料
    orders[index] = {
      ...orders[index],
      ...data,
      orderNumber: orders[index].orderNumber, // 訂單號不可改
      modifiedAt: new Date(),
      modifiedBy: 'current_user'
    };
    
    return orders[index];
  }
  
  /**
   * 刪除訂單
   */
  static async deleteOrder(orderNumber: string): Promise<boolean> {
    const index = orders.findIndex(o => o.orderNumber === orderNumber);
    
    if (index === -1) {
      return false;
    }
    
    orders.splice(index, 1);
    return true;
  }
  
  /**
   * 批次刪除訂單
   */
  static async deleteOrders(orderNumbers: string[]): Promise<boolean> {
    orders = orders.filter(o => !orderNumbers.includes(o.orderNumber));
    return true;
  }
  
  /**
   * 取得訂單的選項列表（用於下拉選單）
   */
  static async getOrdersForSelect(): Promise<Array<{
    orderNumber: string;
    groupCode: string;
    groupName: string;
  }>> {
    return orders.map(o => ({
      orderNumber: o.orderNumber,
      groupCode: o.groupCode,
      groupName: o.groupName || ''
    }));
  }
}

export default OrderApi;
