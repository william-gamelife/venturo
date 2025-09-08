'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { QuickTag } from '@/types'

interface TodoToolbarProps {
  searchTerm: string
  onSearch: (term: string) => void
  quickTags: QuickTag[]
  onTagFilter: (tagId: string) => void
  onClearTagFilter: () => void
  selectedCount: number
  isBusinessUser: boolean
  canCreate: boolean
  onAddTodo: () => void
  onPackageTodos: () => void
}

export const TodoToolbar: React.FC<TodoToolbarProps> = ({
  searchTerm,
  onSearch,
  quickTags,
  onTagFilter,
  onClearTagFilter,
  selectedCount,
  isBusinessUser,
  canCreate,
  onAddTodo,
  onPackageTodos
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* 搜尋和新增區域 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="搜尋待辦事項..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              {canCreate && (
                <Button onClick={onAddTodo} className="shrink-0">
                  ➕ 新增待辦
                </Button>
              )}
              
              {isBusinessUser && selectedCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={onPackageTodos}
                  className="shrink-0"
                >
                  📦 打包選中 ({selectedCount})
                </Button>
              )}
            </div>
          </div>

          {/* 快速標籤過濾 */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-800 self-center">
              快速篩選:
            </span>
            
            <Button
              variant={searchTerm === '' ? 'default' : 'outline'}
              size="sm"
              onClick={onClearTagFilter}
              className="text-xs"
            >
              全部
            </Button>
            
            {quickTags.map(tag => (
              <Button
                key={tag.id}
                variant={searchTerm === tag.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTagFilter(tag.id)}
                className="text-xs"
                style={{
                  backgroundColor: searchTerm === tag.name ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: searchTerm === tag.name ? 'white' : tag.color
                }}
              >
                {tag.name}
              </Button>
            ))}
          </div>

          {/* 選擇狀態顯示 */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                已選擇 {selectedCount} 項待辦事項
              </Badge>
              
              {isBusinessUser && (
                <span className="text-xs text-gray-500">
                  點擊「打包選中」可將選中的待辦事項移至專案打包欄
                </span>
              )}
            </div>
          )}

          {/* 搜尋結果提示 */}
          {searchTerm && (
            <div className="flex items-center justify-between pt-2 border-t border-primary/10">
              <span className="text-xs text-gray-500">
                搜尋: "{searchTerm}"
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearTagFilter}
                className="text-xs h-auto p-1 hover:bg-transparent hover:text-primary"
              >
                清除搜尋
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}