// Groups 模組配置檔
import { BaseApi } from '@/lib/api/BaseApi'
import { GroupModel } from './models/GroupModel'
import { Column } from '@/components/shared/DataTable'

// 建立 API 實例
export const groupApi = new BaseApi<GroupModel>('groups')

// 定義表格欄位
export const groupColumns: Column<GroupModel>[] = [
  { 
    key: 'groupCode', 
    label: '團號',
    width: 'w-32'
  },
  { 
    key: 'groupName', 
    label: '團名',
    width: 'w-64'
  },
  { 
    key: 'status', 
    label: '狀態',
    width: 'w-24',
    render: (value) => {
      const statusMap = {
        active: { label: '進行中', color: 'bg-green-100 text-green-800' },
        inactive: { label: '未開始', color: 'bg-gray-100 text-gray-800' },
        completed: { label: '已完成', color: 'bg-blue-100 text-blue-800' }
      }
      const status = statusMap[value as keyof typeof statusMap] || statusMap.inactive
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      )
    }
  },
  { 
    key: 'startDate', 
    label: '開始日期',
    width: 'w-32',
    render: (value) => value ? new Date(value).toLocaleDateString('zh-TW') : '-'
  },
  { 
    key: 'memberCount', 
    label: '成員數',
    width: 'w-24',
    render: (value, row) => `${value || 0}/${row.maxMembers || '∞'}`
  }
]

// 搜尋欄位
export const searchFields = ['groupCode', 'groupName', 'description']