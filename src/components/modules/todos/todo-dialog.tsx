'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Todo, QuickTag, KanbanColumn } from '@/types'

interface TodoDialogProps {
  title: string
  todo?: Todo | null
  quickTags: QuickTag[]
  visibleColumns: KanbanColumn[]
  onSave: (todoData: Partial<Todo>) => void
  onDelete?: () => void
  onClose: () => void
}

export const TodoDialog: React.FC<TodoDialogProps> = ({
  title,
  todo,
  quickTags,
  visibleColumns,
  onSave,
  onDelete,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'unorganized',
    tags: [] as string[],
    due_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        status: todo.status || 'unorganized',
        tags: todo.tags || [],
        due_date: todo.due_date ? todo.due_date.split('T')[0] : ''
      })
    }
  }, [todo])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('請輸入待辦事項標題')
      return
    }

    setLoading(true)
    setError('')

    try {
      const todoData: Partial<Todo> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status as any,
        tags: formData.tags,
        due_date: formData.due_date || null
      }

      await onSave(todoData)
      onClose()
    } catch (error) {
      console.error('儲存失敗:', error)
      setError('儲存失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (window.confirm('確定要刪除這個待辦事項嗎？')) {
      setLoading(true)
      try {
        await onDelete()
        onClose()
      } catch (error) {
        console.error('刪除失敗:', error)
        setError('刪除失敗，請重試')
      } finally {
        setLoading(false)
      }
    }
  }

  const getTagColor = (tagId: string) => {
    const tag = quickTags.find(t => t.id === tagId)
    return tag?.color || '#6b7280'
  }

  const getColumnName = (columnId: string) => {
    const column = visibleColumns.find(c => c.id === columnId)
    return column ? `${column.icon} ${column.title}` : columnId
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary">
              {title}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              {/* 標題 */}
              <div className="form-group">
                <label className="form-label">
                  標題 <span className="form-required">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="請輸入待辦事項標題"
                  disabled={loading}
                  required
                />
              </div>

              {/* 描述 */}
              <div className="form-group">
                <label className="form-label">描述</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="請輸入詳細描述（選填）"
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="form-row">
                {/* 狀態 */}
                <div className="form-group">
                  <label className="form-label">狀態</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={loading}
                    className="select"
                  >
                    {visibleColumns.map(column => (
                      <option key={column.id} value={column.id}>
                        {getColumnName(column.id)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 到期日期 */}
                <div className="form-group">
                  <label className="form-label">到期日期</label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 快速標籤 */}
              <div className="form-group">
                <label className="form-label">快速標籤</label>
                <div className="flex flex-wrap gap-2">
                  {quickTags.map(tag => {
                    const isSelected = formData.tags.includes(tag.id)
                    return (
                      <Badge
                        key={tag.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer transition-colors"
                        style={{
                          backgroundColor: isSelected ? tag.color : 'transparent',
                          borderColor: tag.color,
                          color: isSelected ? 'white' : tag.color
                        }}
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    )
                  })}
                </div>
                {formData.tags.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    點擊標籤來選擇分類
                  </p>
                )}
              </div>

              {/* 按鈕區域 */}
              <div className="flex justify-between pt-4 border-t border-primary/10">
                <div>
                  {onDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      {loading ? '刪除中...' : '刪除'}
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? '儲存中...' : '儲存'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}