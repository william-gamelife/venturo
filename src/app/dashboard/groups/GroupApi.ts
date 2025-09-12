/**
 * 團體 API
 * 移植自 CornerERP，但使用本地儲存（開發階段）
 */

import { Group, GROUP_STATUS, GroupStatus, createDefaultGroup } from './models/GroupModel';
import { getNextNumber, NumberTypes } from '@/lib/max-numbers/maxNumberApi';

// 模擬資料庫（記憶體儲存）
let groups: Group[] = [
  {
    groupCode: 'GRP001',
    groupName: '日本東京五日遊',
    departureDate: new Date('2025-02-01'),
    returnDate: new Date('2025-02-05'),
    status: GROUP_STATUS.IN_PROGRESS,
    salesPerson: '王小明',
    opId: 'OP001',
    customerCount: 15,
    createdAt: new Date('2025-01-01'),
    createdBy: 'admin',
    expReward: 150
  },
  {
    groupCode: 'GRP002',
    groupName: '韓國首爾四日遊',
    departureDate: new Date('2025-02-10'),
    returnDate: new Date('2025-02-13'),
    status: GROUP_STATUS.IN_PROGRESS,
    salesPerson: '李小華',
    opId: 'OP002',
    customerCount: 20,
    createdAt: new Date('2025-01-05'),
    createdBy: 'admin',
    expReward: 120
  },
  {
    groupCode: 'GRP003',
    groupName: '泰國曼谷五日遊',
    departureDate: new Date('2025-01-15'),
    returnDate: new Date('2025-01-19'),
    status: GROUP_STATUS.COMPLETED,
    salesPerson: '張大同',
    opId: 'OP001',
    customerCount: 25,
    createdAt: new Date('2024-12-20'),
    createdBy: 'admin',
    expReward: 200
  }
];

/**
 * 團體 API 類別
 */
export class GroupApi {
  /**
   * 取得所有團體
   */
  static async getGroups(params?: {
    status?: GroupStatus[];
    groupCode?: string;
    groupName?: string;
    dateFrom?: string;
    dateTo?: string;
    excludeCompletedGroups?: boolean;
  }): Promise<Group[]> {
    let result = [...groups];
    
    if (params) {
      // 狀態篩選
      if (params.status && params.status.length > 0) {
        result = result.filter(g => params.status!.includes(g.status));
      }
      
      // 團號篩選
      if (params.groupCode) {
        result = result.filter(g => 
          g.groupCode.toLowerCase().includes(params.groupCode!.toLowerCase())
        );
      }
      
      // 團名篩選
      if (params.groupName) {
        result = result.filter(g => 
          g.groupName.toLowerCase().includes(params.groupName!.toLowerCase())
        );
      }
      
      // 排除已結團
      if (params.excludeCompletedGroups) {
        result = result.filter(g => g.status !== GROUP_STATUS.COMPLETED);
      }
      
      // 日期範圍篩選
      if (params.dateFrom) {
        const fromDate = new Date(params.dateFrom);
        result = result.filter(g => g.departureDate >= fromDate);
      }
      
      if (params.dateTo) {
        const toDate = new Date(params.dateTo);
        result = result.filter(g => g.departureDate <= toDate);
      }
    }
    
    // 排序：特殊團優先，然後按團號降序
    result.sort((a, b) => {
      if (a.status === GROUP_STATUS.SPECIAL && b.status !== GROUP_STATUS.SPECIAL) {
        return -1;
      }
      if (a.status !== GROUP_STATUS.SPECIAL && b.status === GROUP_STATUS.SPECIAL) {
        return 1;
      }
      return b.groupCode.localeCompare(a.groupCode);
    });
    
    return result;
  }
  
  /**
   * 取得單一團體
   */
  static async getGroup(groupCode: string): Promise<Group | null> {
    const group = groups.find(g => g.groupCode === groupCode);
    return group || null;
  }
  
  /**
   * 建立新團體
   */
  static async createGroup(data: Partial<Group>): Promise<Group> {
    // 生成團號
    const groupCode = await getNextNumber(NumberTypes.GROUP);
    
    const newGroup: Group = createDefaultGroup({
      ...data,
      groupCode,
      createdAt: new Date(),
      createdBy: 'current_user'
    });
    
    groups.push(newGroup);
    return newGroup;
  }
  
  /**
   * 更新團體
   */
  static async updateGroup(groupCode: string, data: Partial<Group>): Promise<Group | null> {
    const index = groups.findIndex(g => g.groupCode === groupCode);
    
    if (index === -1) {
      return null;
    }
    
    groups[index] = {
      ...groups[index],
      ...data,
      groupCode: groups[index].groupCode, // 團號不可改
      modifiedAt: new Date(),
      modifiedBy: 'current_user'
    };
    
    return groups[index];
  }
  
  /**
   * 刪除團體
   */
  static async deleteGroup(groupCode: string): Promise<boolean> {
    const index = groups.findIndex(g => g.groupCode === groupCode);
    
    if (index === -1) {
      return false;
    }
    
    groups.splice(index, 1);
    return true;
  }
  
  /**
   * 批次刪除團體
   */
  static async deleteGroups(groupCodes: string[]): Promise<boolean> {
    groups = groups.filter(g => !groupCodes.includes(g.groupCode));
    return true;
  }
}

export default GroupApi;
