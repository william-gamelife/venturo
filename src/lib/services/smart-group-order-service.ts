import { 
  UnifiedGroupOrder, 
  ExtendedTodo, 
  DATA_COMPLETENESS_CONFIG,
  TravelerInfo 
} from '../models/unified-group-order-model';
import { TodoItem } from '@/types';

/**
 * 智慧團體訂單服務
 */
export class SmartGroupOrderService {
  private static storageKey = 'venturo_group_orders';
  
  /**
   * 一鍵開團（包含首張訂單）
   */
  static async quickCreateGroup(
    userId: string,
    todoItem: TodoItem
  ): Promise<UnifiedGroupOrder> {
    const now = new Date().toISOString();
    const timestamp = Date.now();
    
    // 1. 建立團體框架
    const group = {
      groupCode: `G${timestamp}`,
      groupName: todoItem.title || `專案_${timestamp}`,
      status: 'draft' as const,
      createdAt: now,
      updatedAt: now
    };
    
    // 2. 同時建立首張訂單
    const primaryOrder = {
      orderNumber: `O${timestamp}_001`,
      groupCode: group.groupCode,
      status: 'draft' as const
    };
    
    // 3. 評估資料完整度
    const dataCompleteness = this.assessCompleteness({
      group,
      primaryOrder,
      dataCompleteness: {
        level: 'skeleton',
        missingFields: [],
        completionPercentage: 0,
        lastUpdated: now
      }
    });
    
    // 4. 建立關聯
    const unifiedGroupOrder: UnifiedGroupOrder = {
      group,
      primaryOrder,
      dataCompleteness,
      todoLink: {
        todoId: todoItem.id,
        originalTitle: todoItem.title,
        originalDescription: todoItem.description || ''
      }
    };
    
    // 5. 儲存到本地/雲端
    await this.saveGroupOrder(userId, unifiedGroupOrder);
    
    return unifiedGroupOrder;
  }
  
  /**
   * 漸進式更新資料
   */
  static async progressiveUpdate(
    userId: string,
    groupCode: string,
    updates: Partial<UnifiedGroupOrder>
  ): Promise<UnifiedGroupOrder> {
    // 1. 取得現有資料
    const existing = await this.getGroupOrder(userId, groupCode);
    if (!existing) {
      throw new Error(`Group order not found: ${groupCode}`);
    }
    
    // 2. 深度合併更新
    const updated: UnifiedGroupOrder = {
      ...existing,
      group: {
        ...existing.group,
        ...updates.group,
        updatedAt: new Date().toISOString()
      },
      primaryOrder: {
        ...existing.primaryOrder,
        ...updates.primaryOrder
      },
      todoLink: {
        ...existing.todoLink,
        ...updates.todoLink
      }
    };
    
    // 3. 重新評估完整度
    updated.dataCompleteness = this.assessCompleteness(updated);
    
    // 4. 儲存
    await this.saveGroupOrder(userId, updated);
    
    return updated;
  }
  
  /**
   * 取得團體訂單
   */
  static async getGroupOrder(
    userId: string, 
    groupCode: string
  ): Promise<UnifiedGroupOrder | null> {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${userId}`);
      if (!stored) return null;
      
      const groupOrders: UnifiedGroupOrder[] = JSON.parse(stored);
      return groupOrders.find(order => order.group.groupCode === groupCode) || null;
    } catch (error) {
      console.error('Failed to get group order:', error);
      return null;
    }
  }
  
  /**
   * 取得用戶所有團體訂單
   */
  static async getUserGroupOrders(userId: string): Promise<UnifiedGroupOrder[]> {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get user group orders:', error);
      return [];
    }
  }
  
  /**
   * 儲存團體訂單
   */
  static async saveGroupOrder(
    userId: string, 
    groupOrder: UnifiedGroupOrder
  ): Promise<void> {
    try {
      const existing = await this.getUserGroupOrders(userId);
      const index = existing.findIndex(
        order => order.group.groupCode === groupOrder.group.groupCode
      );
      
      if (index >= 0) {
        existing[index] = groupOrder;
      } else {
        existing.push(groupOrder);
      }
      
      localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save group order:', error);
      throw error;
    }
  }
  
  /**
   * 評估資料完整度
   */
  static assessCompleteness(data: Partial<UnifiedGroupOrder>): UnifiedGroupOrder['dataCompleteness'] {
    const now = new Date().toISOString();
    let level: 'skeleton' | 'basic' | 'detailed' | 'complete' = 'skeleton';
    let completionPercentage = 0;
    const missingFields: string[] = [];
    
    // 檢查 skeleton 層級
    if (data.group?.groupName) {
      level = 'skeleton';
      completionPercentage = 25;
      
      // 檢查 basic 層級
      if (data.primaryOrder?.contactPerson && data.primaryOrder?.contactPhone) {
        level = 'basic';
        completionPercentage = 50;
        
        // 檢查 detailed 層級
        if (data.group?.departureDate && data.group?.returnDate && data.group?.totalMembers) {
          level = 'detailed';
          completionPercentage = 75;
          
          // 檢查 complete 層級
          if (data.group?.budget && data.group?.itinerary) {
            level = 'complete';
            completionPercentage = 100;
          } else {
            if (!data.group?.budget) missingFields.push('budget');
            if (!data.group?.itinerary) missingFields.push('itinerary');
          }
        } else {
          if (!data.group?.departureDate) missingFields.push('departureDate');
          if (!data.group?.returnDate) missingFields.push('returnDate');
          if (!data.group?.totalMembers) missingFields.push('totalMembers');
        }
      } else {
        if (!data.primaryOrder?.contactPerson) missingFields.push('contactPerson');
        if (!data.primaryOrder?.contactPhone) missingFields.push('contactPhone');
      }
    } else {
      missingFields.push('groupName');
    }
    
    return {
      level,
      missingFields,
      completionPercentage,
      lastUpdated: now
    };
  }
  
  /**
   * 更新待辦事項與團體的關聯
   */
  static async updateTodoWithGroupLink(
    userId: string,
    todoId: string,
    groupCode: string
  ): Promise<void> {
    // 這裡應該調用待辦事項服務來更新關聯
    // 暫時用 localStorage 模擬
    try {
      const todoLinksKey = `venturo_todo_group_links_${userId}`;
      const existing = localStorage.getItem(todoLinksKey);
      const links = existing ? JSON.parse(existing) : {};
      
      links[todoId] = {
        groupCode,
        linkedAt: new Date().toISOString()
      };
      
      localStorage.setItem(todoLinksKey, JSON.stringify(links));
    } catch (error) {
      console.error('Failed to update todo group link:', error);
    }
  }
  
  /**
   * 取得待辦事項的團體關聯
   */
  static async getTodoGroupLink(
    userId: string,
    todoId: string
  ): Promise<string | null> {
    try {
      const todoLinksKey = `venturo_todo_group_links_${userId}`;
      const existing = localStorage.getItem(todoLinksKey);
      const links = existing ? JSON.parse(existing) : {};
      
      return links[todoId]?.groupCode || null;
    } catch (error) {
      console.error('Failed to get todo group link:', error);
      return null;
    }
  }
  
  /**
   * 刪除團體訂單
   */
  static async deleteGroupOrder(
    userId: string,
    groupCode: string
  ): Promise<void> {
    try {
      const existing = await this.getUserGroupOrders(userId);
      const filtered = existing.filter(
        order => order.group.groupCode !== groupCode
      );
      
      localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete group order:', error);
      throw error;
    }
  }
  
  /**
   * 搜尋團體訂單
   */
  static async searchGroupOrders(
    userId: string,
    query: {
      keyword?: string;
      status?: string;
      completenessLevel?: string;
      dateRange?: { start: string; end: string };
    }
  ): Promise<UnifiedGroupOrder[]> {
    const allOrders = await this.getUserGroupOrders(userId);
    
    return allOrders.filter(order => {
      // 關鍵字搜尋
      if (query.keyword) {
        const keyword = query.keyword.toLowerCase();
        const searchableText = [
          order.group.groupName,
          order.primaryOrder.contactPerson,
          order.group.itinerary,
          order.group.notes
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(keyword)) {
          return false;
        }
      }
      
      // 狀態篩選
      if (query.status && order.group.status !== query.status) {
        return false;
      }
      
      // 完整度篩選
      if (query.completenessLevel && order.dataCompleteness.level !== query.completenessLevel) {
        return false;
      }
      
      // 日期範圍篩選
      if (query.dateRange) {
        const departureDate = order.group.departureDate;
        if (!departureDate) return false;
        
        const departure = new Date(departureDate);
        const start = new Date(query.dateRange.start);
        const end = new Date(query.dateRange.end);
        
        if (departure < start || departure > end) {
          return false;
        }
      }
      
      return true;
    });
  }
}