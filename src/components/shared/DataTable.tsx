// 通用 DataTable 元件
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export interface Column<T> {
  key: keyof T | string
  label: string
  width?: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  onRowClick?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  emptyMessage = '暫無資料'
}: DataTableProps<T>) {
  const router = useRouter()

  const getValue = (row: T, key: string): any => {
    const keys = key.split('.')
    let value: any = row
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.width || ''
                }`}
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = getValue(row, column.key as string)
                return (
                  <td key={column.key as string} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(value, row) : value}
                  </td>
                )
              })}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(row)
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        編輯
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(row)
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}