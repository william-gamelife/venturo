'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'
import { localStorageManager } from '@/lib/local-storage'
import { Todo, QuickTag, KanbanColumn } from '@/types'
import { KanbanBoard } from './kanban-board'
import { TodoToolbar } from './todo-toolbar'
import { TodoDialog } from './todo-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// 快速標籤配置
const QUICK_TAGS: QuickTag[] = [
  { id: 'quote', name: '報價', color: '#007bff' },
  { id: 'forming', name: '形成', color: '#28a745' },
  { id: 'presentation', name: '簡報', color: '#ffc107' },
  { id: 'contract', name: '合約', color: '#dc3545' },
  { id: 'team', name: '團務', color: '#6f42c1' }
]

// 看板欄位配置
const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'unorganized', title: '尚未整理', icon: '📋' },
  { id: 'in-progress', title: '進行中', icon: '⚡' },
  { id: 'waiting', title: '等待確認', icon: '⏳' },
  { id: 'project', title: '專案打包', icon: '📦' },
  { id: 'completed', title: '完成', icon: '✅' }
]

export function TodosModule() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  
  const router = useRouter()
  const currentUser = authManager.getCurrentUser()
  const isBusinessUser = authManager.isBusinessUser()
  
  // 取得可見的欄位（非業務用戶不顯示專案欄位）
  const visibleColumns = KANBAN_COLUMNS.filter(col => 
    col.id !== 'project' || isBusinessUser
  )

  // 載入資料
  const loadTodos = async () => {
    try {
      if (!currentUser) return

      const todosData = localStorageManager.getTodos(currentUser.id)
      const todosWithDefaults = todosData.map(todo => ({
        ...todo,
        status: todo.status || 'unorganized'
      }))

      setTodos(todosWithDefaults)
      updateFilteredTodos(todosWithDefaults, searchTerm)
    } catch (error) {
      console.error('載入待辦事項失敗:', error)
      setError('載入資料失敗')
    } finally {
      setLoading(false)
    }
  }

  // 更新過濾後的待辦事項
  const updateFilteredTodos = (todoList: Todo[], search: string) => {
    let filtered = todoList.filter(todo => {
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          todo.title.toLowerCase().includes(searchLower) ||
          todo.description?.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    setFilteredTodos(filtered)
  }

  // 儲存待辦事項
  const saveTodo = async (todoData: Partial<Todo>) => {
    try {
      if (!currentUser) return

      const newTodo: Todo = {
        id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: currentUser.id,
        title: todoData.title || '',
        description: todoData.description || '',
        status: todoData.status || 'unorganized',
        tags: todoData.tags || [],
        due_date: todoData.due_date || null,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assigned_to: currentUser.id
      }

      localStorageManager.addTodo(currentUser.id, newTodo)
      
      const updatedTodos = [newTodo, ...todos]
      setTodos(updatedTodos)
      updateFilteredTodos(updatedTodos, searchTerm)
      setShowAddDialog(false)
    } catch (error) {
      console.error('儲存待辦事項失敗:', error)
      setError('儲存失敗')
    }
  }

  // 更新待辦事項
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      if (!currentUser) return

      const updatedTodos = todos.map(todo => 
        todo.id === id ? { 
          ...todo, 
          ...updates,
          updated_at: new Date().toISOString()
        } : todo
      )
      
      localStorageManager.saveTodos(currentUser.id, updatedTodos)
      setTodos(updatedTodos)
      updateFilteredTodos(updatedTodos, searchTerm)
    } catch (error) {
      console.error('更新待辦事項失敗:', error)
      setError('更新失敗')
    }
  }

  // 刪除待辦事項
  const deleteTodo = async (id: string) => {
    try {
      if (!currentUser) return

      const updatedTodos = todos.filter(todo => todo.id !== id)
      localStorageManager.saveTodos(currentUser.id, updatedTodos)
      setTodos(updatedTodos)
      updateFilteredTodos(updatedTodos, searchTerm)
      setSelectedTodos(prev => {
        const newSelected = new Set(prev)
        newSelected.delete(id)
        return newSelected
      })
    } catch (error) {
      console.error('刪除待辦事項失敗:', error)
      setError('刪除失敗')
    }
  }

  // 處理搜尋
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    updateFilteredTodos(todos, term)
  }

  // 處理標籤過濾
  const handleTagFilter = (tagId: string) => {
    const tag = QUICK_TAGS.find(t => t.id === tagId)
    if (tag) {
      handleSearch(tag.name)
    }
  }

  // 清除標籤過濾
  const clearTagFilter = () => {
    handleSearch('')
  }

  // 切換待辦事項選擇
  const toggleTodoSelection = (todoId: string) => {
    const newSelected = new Set(selectedTodos)
    if (newSelected.has(todoId)) {
      newSelected.delete(todoId)
    } else {
      newSelected.add(todoId)
    }
    setSelectedTodos(newSelected)
  }

  // 打包選中的待辦事項
  const packageSelectedTodos = async () => {
    if (selectedTodos.size === 0) return

    try {
      // 將選中的待辦事項移至專案打包欄
      const updates = Array.from(selectedTodos).map(id => 
        updateTodo(id, { status: 'project' })
      )
      
      await Promise.all(updates)
      setSelectedTodos(new Set())
    } catch (error) {
      console.error('打包失敗:', error)
      setError('打包失敗')
    }
  }

  // 拖曳處理
  const handleDragDrop = async (todoId: string, targetStatus: string) => {
    const updates: Partial<Todo> = {
      status: targetStatus as any
    }

    // 如果拖到完成欄，標記為完成
    if (targetStatus === 'completed') {
      updates.completed = true
      updates.completed_at = new Date().toISOString()
    } else {
      updates.completed = false
      updates.completed_at = undefined
    }

    await updateTodo(todoId, updates)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">載入待辦事項...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">待辦事項</h1>
            <p className="text-gray-600 mt-1">五欄看板式任務管理系統</p>
          </div>
          <Button variant="secondary" onClick={() => router.back()}>
            返回
          </Button>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2"
                onClick={() => setError('')}
              >
                關閉
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 工具列 */}
        <TodoToolbar
          searchTerm={searchTerm}
          onSearch={handleSearch}
          quickTags={QUICK_TAGS}
          onTagFilter={handleTagFilter}
          onClearTagFilter={clearTagFilter}
          selectedCount={selectedTodos.size}
          isBusinessUser={isBusinessUser}
          canCreate={authManager.canAccessModule('todos', 'create')}
          onAddTodo={() => setShowAddDialog(true)}
          onPackageTodos={packageSelectedTodos}
        />

        {/* 看板 */}
        <KanbanBoard
          columns={visibleColumns}
          todos={filteredTodos}
          selectedTodos={selectedTodos}
          isBusinessUser={isBusinessUser}
          quickTags={QUICK_TAGS}
          onToggleSelection={toggleTodoSelection}
          onEditTodo={setEditingTodo}
          onDeleteTodo={deleteTodo}
          onDragDrop={handleDragDrop}
          canUpdate={authManager.canAccessModule('todos', 'update')}
          canDelete={authManager.canAccessModule('todos', 'delete')}
        />

        {/* 新增待辦事項對話框 */}
        {showAddDialog && (
          <TodoDialog
            title="新增待辦事項"
            quickTags={QUICK_TAGS}
            visibleColumns={visibleColumns}
            onSave={saveTodo}
            onClose={() => setShowAddDialog(false)}
          />
        )}

        {/* 編輯待辦事項對話框 */}
        {editingTodo && (
          <TodoDialog
            title="編輯待辦事項"
            todo={editingTodo}
            quickTags={QUICK_TAGS}
            visibleColumns={visibleColumns}
            onSave={(updates) => updateTodo(editingTodo.id, updates)}
            onDelete={() => deleteTodo(editingTodo.id)}
            onClose={() => setEditingTodo(null)}
          />
        )}
      </div>
    </div>
  )
}