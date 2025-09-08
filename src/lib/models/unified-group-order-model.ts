import { TodoItem } from '../../../Venturo/src/lib/types';

/**
 * 團體訂單一體化模型
 * 團體建立時自動包含首張訂單
 */
export interface UnifiedGroupOrder {
  // 團體核心資料
  group: {
    groupCode: string;
    groupName: string;
    status: 'draft' | 'active' | 'completed';
    createdAt: string;
    updatedAt: string;
    departureDate?: string;
    returnDate?: string;
    totalMembers?: number;
    budget?: number;
    itinerary?: string;
    notes?: string;
  };
  
  // 首張訂單（與團體同時建立）
  primaryOrder: {
    orderNumber: string;
    groupCode: string;      // 關聯到團體
    contactPerson?: string;  // 可後填
    contactPhone?: string;   // 可後填
    contactEmail?: string;   // 可後填
    status: 'draft' | 'confirmed' | 'processing' | 'completed';
    travelers?: TravelerInfo[];
    specialRequests?: string;
  };
  
  // 資料完整度追蹤
  dataCompleteness: {
    level: 'skeleton' | 'basic' | 'detailed' | 'complete';
    missingFields: string[];
    completionPercentage: number;
    lastUpdated: string;
  };
  
  // 待辦事項關聯
  todoLink?: {
    todoId: string;
    originalTitle: string;
    originalDescription: string;
  };
}

export interface TravelerInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  passport?: string;
  birthDate?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

/**
 * 擴展的待辦事項，包含業務類型資訊
 * 注意：現在 TodoItem 已經包含這些欄位，所以 ExtendedTodo 主要作為類型別名
 */
export type ExtendedTodo = TodoItem;

/**
 * 資料完整度評估配置
 */
export const DATA_COMPLETENESS_CONFIG = {
  skeleton: {
    requiredFields: ['groupName'],
    weight: 25,
    description: '基本框架'
  },
  basic: {
    requiredFields: ['contactPerson', 'contactPhone'],
    weight: 50,
    description: '基礎聯絡資訊'
  },
  detailed: {
    requiredFields: ['departureDate', 'returnDate', 'totalMembers'],
    weight: 75,
    description: '詳細行程資訊'
  },
  complete: {
    requiredFields: ['budget', 'itinerary'],
    weight: 100,
    description: '完整資料'
  }
} as const;

/**
 * 團體狀態機定義
 */
export const GROUP_STATUS_FLOW = {
  draft: {
    next: ['active'],
    actions: ['edit', 'activate', 'delete'],
    description: '草稿階段'
  },
  active: {
    next: ['completed'],
    actions: ['edit', 'complete', 'suspend'],
    description: '進行中'
  },
  completed: {
    next: [],
    actions: ['view', 'export'],
    description: '已完成'
  }
} as const;

/**
 * 訂單狀態機定義
 */
export const ORDER_STATUS_FLOW = {
  draft: {
    next: ['confirmed'],
    actions: ['edit', 'confirm', 'delete'],
    description: '草稿'
  },
  confirmed: {
    next: ['processing'],
    actions: ['process', 'modify', 'cancel'],
    description: '已確認'
  },
  processing: {
    next: ['completed'],
    actions: ['complete', 'update'],
    description: '處理中'
  },
  completed: {
    next: [],
    actions: ['view', 'export'],
    description: '已完成'
  }
} as const;