// 通用頁面 Header 元件
'use client'

import React from 'react'
import { Plus, Search } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  onAdd?: () => void
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function PageHeader({
  title,
  description,
  onAdd,
  onSearch,
  searchPlaceholder = '搜尋...',
  actions,
  breadcrumbs
}: PageHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <div className="mb-6">
      {/* 麵包屑 */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-gray-700">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 標題區 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>

        {/* 操作區 */}
        <div className="flex items-center gap-3">
          {/* 搜尋框 */}
          {onSearch && (
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          )}

          {/* 自定義操作 */}
          {actions}

          {/* 新增按鈕 */}
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="h-5 w-5 mr-1" />
              新增
            </button>
          )}
        </div>
      </div>
    </div>
  )
}