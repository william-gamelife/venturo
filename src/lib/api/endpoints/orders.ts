/**
 * 訂單 API
 * 統一的 API 端點定義
 */

import { APIClient } from '../client'
import type { ApiResponse, QueryParams } from '@/types'

// 訂單相關類型
export interface Order {
  orderNumber: string
  groupCode: string
  groupName?: string
  contactPerson: string
  contactPhone: string
  contactEmail?: string
  orderType: OrderType
  salesPerson: string
  opId?: string
  notes?: string
  createdAt: Date | string
  createdBy: string
  modifiedAt?: Date | string
  modifiedBy?: string
}

export type OrderType = 'individual' | 'group' | 'corporate'

export interface OrderQueryParams extends QueryParams {
  groupCode?: string
  searchTerm?: string
  orderType?: OrderType
  salesPerson?: string
}

/**
 * Orders API 類別
 */
export class OrdersAPI extends APIClient {
  constructor() {
    super('/api')
  }
  
  /**
   * 取得所有訂單
   */
  async getOrders(params?: OrderQueryParams): Promise<ApiResponse<Order[]>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return this.get<Order[]>(`/orders${queryString}`)
  }
  
  /**
   * 取得單一訂單
   */
  async getOrder(orderNumber: string): Promise<ApiResponse<Order>> {
    return this.get<Order>(`/orders/${orderNumber}`)
  }
  
  /**
   * 取得團體的所有訂單
   */
  async getOrdersByGroup(groupCode: string): Promise<ApiResponse<Order[]>> {
    return this.get<Order[]>(`/orders?groupCode=${groupCode}`)
  }
  
  /**
   * 建立新訂單
   */
  async createOrder(data: Partial<Order>): Promise<ApiResponse<Order>> {
    return this.post<Order>('/orders', data)
  }
  
  /**
   * 更新訂單
   */
  async updateOrder(orderNumber: string, data: Partial<Order>): Promise<ApiResponse<Order>> {
    return this.put<Order>(`/orders/${orderNumber}`, data)
  }
  
  /**
   * 刪除訂單
   */
  async deleteOrder(orderNumber: string): Promise<ApiResponse<void>> {
    return this.delete(`/orders/${orderNumber}`)
  }
  
  /**
   * 批次刪除訂單
   */
  async deleteOrders(orderNumbers: string[]): Promise<ApiResponse<void>> {
    return this.post('/orders/batch-delete', { orderNumbers })
  }
  
  /**
   * 取得訂單統計
   */
  async getOrderStats(): Promise<ApiResponse<{
    total: number
    individual: number
    group: number
    corporate: number
  }>> {
    return this.get('/orders/stats')
  }
}

// 匯出單例
export const ordersAPI = new OrdersAPI()

// 匯出預設
export default ordersAPI
