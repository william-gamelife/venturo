// 模組配置系統 - 功能與專案綁定
export interface ModuleConfig {
  id: string
  name: string
  description: string
  href: string
  icon: React.ReactNode
  enabled: boolean
  dependencies?: string[] // 依賴的其他模組
}

// 預設模組配置
export const DEFAULT_MODULES: { [key: string]: ModuleConfig } = {
  timebox: {
    id: 'timebox',
    name: '時間管理',
    description: '箱型時間管理，支持ZOOM縮放和活動記錄',
    href: '/dashboard/timebox',
    icon: null, // 在使用時設定
    enabled: true
  },
  todos: {
    id: 'todos', 
    name: '任務清單',
    description: '待辦事項管理，支持標籤和留言',
    href: '/dashboard/todos',
    icon: null,
    enabled: true
  },
  projects: {
    id: 'projects',
    name: '專案管理',
    description: '專案和任務管理',
    href: '/dashboard/projects', 
    icon: null,
    enabled: false
  },
  calendar: {
    id: 'calendar',
    name: '行事曆',
    description: '日程安排和事件管理',
    href: '/dashboard/calendar',
    icon: null,
    enabled: true
  },
  finance: {
    id: 'finance',
    name: '財務管理',
    description: '收支和預算管理',
    href: '/dashboard/finance',
    icon: null,
    enabled: false
  },
  'life-simulator': {
    id: 'life-simulator',
    name: '人生模擬器',
    description: '模擬人生決策和發展',
    href: '/dashboard/life-simulator',
    icon: null,
    enabled: true
  },
  'pixel-life': {
    id: 'pixel-life',
    name: '像素人生',
    description: '像素風格的生活記錄',
    href: '/dashboard/pixel-life',
    icon: null,
    enabled: true
  },
  'travel-pdf': {
    id: 'travel-pdf',
    name: '旅行 PDF',
    description: '旅行計劃和記錄文件生成',
    href: '/dashboard/travel-pdf',
    icon: null,
    enabled: false
  },
  themes: {
    id: 'themes',
    name: '主題設定',
    description: '界面主題和外觀設定',
    href: '/dashboard/themes',
    icon: null,
    enabled: true
  },
  sync: {
    id: 'sync',
    name: '同步管理',
    description: '數據同步和備份設定',
    href: '/dashboard/sync',
    icon: null,
    enabled: false
  },
  settings: {
    id: 'settings',
    name: '系統設定',
    description: '主題切換、側欄順序等個人化設定',
    href: '/dashboard/settings',
    icon: null,
    enabled: true // 所有用戶都能看到
  }
}

// 取得使用者可用模組
export function getUserModules(userRole: string, customModules?: string[]): string[] {
  // 如果有自訂模組列表，使用自訂的
  if (customModules) {
    return customModules
  }

  // 根據角色決定預設模組
  switch (userRole) {
    case 'SUPER_ADMIN':
      // 管理員看到所有模組（包括預設關閉的）
      return Object.keys(DEFAULT_MODULES)
    case 'BUSINESS_ADMIN':
      return ['timebox', 'todos', 'projects', 'finance', 'settings']
    case 'USER':
    case 'GENERAL_USER':
    default:
      return ['timebox', 'todos', 'settings'] // 一般用戶只有基本功能 + 系統設定
  }
}

// 檢查模組是否可用
export function isModuleAvailable(moduleId: string, userModules: string[]): boolean {
  return userModules.includes(moduleId)
}

// 取得模組配置
export function getModuleConfig(moduleId: string): ModuleConfig | undefined {
  return DEFAULT_MODULES[moduleId]
}