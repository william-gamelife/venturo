'use client'

import { useEffect, useState, useRef } from 'react'
import { authManager } from '@/lib/auth'
import { TodoItem, TodoSubtask } from '@/lib/types'
import { StatusTodoAPI } from '@/lib/api/StatusTodoAPI'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

// 輔助函數
const getCurrentUser = () => authManager.getCurrentUser()

interface Column {
  id: string
  title: string
  status: TodoItem['status']
}

export default function TodosPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [hasPackagingPermission, setHasPackagingPermission] = useState(false)
  const [currentMode, setCurrentMode] = useState<'game' | 'corner'>('game')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTaskColumn, setNewTaskColumn] = useState<string>('')
  const [draggedItem, setDraggedItem] = useState<TodoItem | null>(null)
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, taskId: string | null}>({show: false, taskId: null})
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddPosition, setQuickAddPosition] = useState({ x: 0, y: 0 })
  const [quickAddColumn, setQuickAddColumn] = useState<string>('')
  const [showCompletedPanel, setShowCompletedPanel] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    type: 'task' as 'task' | 'project',
    comments: [] as string[]
  })

  // 定義看板欄位
  const getColumns = (): Column[] => {
    const baseColumns: Column[] = [
      { id: 'backlog', title: '尚未整理', status: 'backlog' },
      { id: 'in-progress', title: '進行中', status: 'in-progress' },
      { id: 'review', title: '等待確認', status: 'review' }
    ]

    // 只有在角落模式下且有打包權限時才顯示專案欄位
    if (hasPackagingPermission && currentMode === 'corner') {
      baseColumns.push({ id: 'packaging', title: '專案', status: 'packaging' })
    }

    // 不再顯示完成欄位在主看板中
    // baseColumns.push({ id: 'done', title: '完成', status: 'done' })

    return baseColumns
  }

  useEffect(() => {
    const user = authManager.getCurrentUser()
    setCurrentUser(user)
    
    if (!user) return

    // 檢查打包權限（有專案權限 = 有打包功能）
    const hasPackaging = user.permissions?.projects || false
    setHasPackagingPermission(hasPackaging)

    // 載入用戶的模式偏好
    const savedMode = localStorage.getItem(`gamelife_mode_${user.id}`)
    if (savedMode === 'corner' || savedMode === 'game') {
      setCurrentMode(savedMode)
    }

    if (user) {
      loadTodos()
    }
  }, [currentUser])

  const loadTodos = async () => {
    console.log('🔍 開始載入 todos...')
    console.log('📋 Current user ID:', currentUser?.id)
    
    try {
      const apiTodos = await StatusTodoAPI.getAll(currentUser.id)
      console.log('📦 從 API 取得的 todos:', apiTodos)
      console.log('📊 API Todos 數量:', apiTodos.length)
      
      // 檢查數據結構並轉換（如果需要）
      let formattedTodos = apiTodos
      if (apiTodos.length > 0) {
        console.log('📋 第一個 todo 的結構:', apiTodos[0])
        
        // 如果 API 返回的數據沒有 status 欄位，需要轉換
        formattedTodos = apiTodos.map((todo: any) => {
          // 如果已經有正確的結構，直接返回
          if (todo.status) {
            return todo
          }
          
          // 如果是簡單格式，需要轉換
          return {
            ...todo,
            status: todo.completed ? 'done' : 'backlog',
            description: todo.description || '',
            tags: todo.tags || [],
            type: todo.type || 'task',
            comments: todo.comments || [],
            subtasks: todo.subtasks || [],
            isExpanded: todo.isExpanded || false
          }
        })
      }
      
      console.log('🔄 格式化後的 todos:', formattedTodos)
      setTodos(formattedTodos)
      console.log('✅ setTodos 執行完成')
    } catch (error) {
      console.error('❌ 載入 todos 失敗:', error)
    }
  }


  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const getTasksByStatus = (status: TodoItem['status']) => {
    return todos.filter(todo => todo.status === status)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const addTodo = async (title: string) => {
    console.log('➕ 新增任務:', title)
    console.log('👤 Current user ID:', currentUser?.id)
    console.log('🗄️ 儲存 key:', `gamelife_todos_${currentUser?.id}`)
    
    const result = await StatusTodoAPI.create(currentUser.id, {
      title,
      status: newTaskColumn || 'backlog',
      priority: 'medium'
    })
    
    console.log('📤 新增結果:', result)
    
    if (result.success) {
      console.log('✅ 新增成功，重新載入資料...')
      await loadTodos() // 重新載入
      
      // 檢查實際儲存位置
      const stored = localStorage.getItem(`gamelife_todos_${currentUser.id}`)
      console.log('💾 實際儲存的資料:', stored)
    } else {
      console.error('❌ 新增失敗:', result)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    await addTodo(newTask.title)

    // 重置表單
    setNewTask({
      title: '',
      description: '',
      tags: [],
      type: 'task',
      comments: []
    })
    setShowAddDialog(false)
    setNewTaskColumn('')
  }

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.title.trim()) return

    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error('No current user found')
      return
    }

    try {
      const { id, createdAt, updatedAt, ...updateData } = editingTask
      const result = await StatusTodoAPI.update(currentUser.id, editingTask.id, updateData)
      
      if (result.success) {
        await loadTodos()
        setEditingTask(null)
      } else {
        console.error('Failed to update task:', result.error)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const toggleTodo = async (id: string) => {
    const result = await StatusTodoAPI.toggleComplete(currentUser.id, id)
    if (result.success) {
      await loadTodos() // 重新載入
    }
  }

  const deleteTodo = async (id: string) => {
    const result = await StatusTodoAPI.delete(currentUser.id, id)
    if (result.success) {
      await loadTodos() // 重新載入
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setDeleteConfirm({show: true, taskId})
  }

  const confirmDelete = async () => {
    if (deleteConfirm.taskId) {
      await deleteTodo(deleteConfirm.taskId)
    }
    setDeleteConfirm({show: false, taskId: null})
  }

  const handleDragOver = (e: React.DragEvent, columnId?: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (columnId && columnId !== dragOverColumn) {
      setDragOverColumn(columnId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // 只有當離開整個欄位區域時才清除狀態
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDragStart = (e: React.DragEvent, task: TodoItem) => {
    console.log('Starting drag for task:', task.title)
    console.log('User has todos permission:', !!currentUser.permissions?.todos)
    
    setIsDragging(true)
    setDraggedItem(task)
    
    // 使用簡單的字符串而不是JSON
    if (selectedTasks.has(task.id)) {
      e.dataTransfer.setData('text/plain', `batch:${Array.from(selectedTasks).join(',')}`)
      console.log('Set batch drag data:', Array.from(selectedTasks))
    } else {
      e.dataTransfer.setData('text/plain', `single:${task.id}`)
      console.log('Set single drag data:', task.id)
    }
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: TodoItem['status']) => {
    e.preventDefault()
    console.log('Drop event triggered for status:', newStatus)
    
    setIsDragging(false)
    setDragOverColumn(null)
    
    const dragData = e.dataTransfer.getData('text/plain')
    console.log('Retrieved drag data:', dragData)
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error('No current user found')
      setDraggedItem(null)
      return
    }
    
    try {
      if (!dragData) {
        console.log('No drag data, using fallback with draggedItem:', draggedItem?.title)
        // 如果DataTransfer失敗，使用state中的draggedItem作為備用
        if (draggedItem) {
          const result = await StatusTodoAPI.updateStatus(currentUser.id, draggedItem.id, newStatus)
          if (result.success) {
            await loadTodos()
            console.log('Successfully moved task using fallback method')
          } else {
            console.error('Failed to move task:', result.error)
          }
        }
        setDraggedItem(null)
        return
      }
      
      if (dragData.startsWith('batch:')) {
        // 批次移動
        const taskIds = dragData.substring(6).split(',')
        console.log('Batch move:', taskIds)
        const result = await StatusTodoAPI.bulkUpdateStatus(currentUser.id, taskIds, newStatus)
        if (result.success) {
          await loadTodos()
          setSelectedTasks(new Set())
        } else {
          console.error('Failed to batch move tasks:', result.error)
        }
      } else if (dragData.startsWith('single:')) {
        // 單個移動
        const taskId = dragData.substring(7)
        const task = todos.find(t => t.id === taskId)
        if (task) {
          console.log('Single move:', task.title, 'to', newStatus)
          const result = await StatusTodoAPI.updateStatus(currentUser.id, taskId, newStatus)
          if (result.success) {
            await loadTodos()
          } else {
            console.error('Failed to move task:', result.error)
          }
        }
      }
    } catch (error) {
      console.error('Error in handleDrop:', error)
    }
    
    setDraggedItem(null)
  }

  const openAddDialog = (columnId: string) => {
    setNewTaskColumn(columnId)
    setShowAddDialog(true)
  }

  const handleQuickAdd = (e: React.MouseEvent, columnId: string) => {
    // 只在非拖拽狀態下觸發
    if (isDragging) return
    
    // 檢查是否點擊到卡片或其他元素
    const target = e.target as HTMLElement
    if (target.closest('.task-card')) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    setQuickAddPosition({ 
      x: rect.left + 20, 
      y: e.clientY 
    })
    setQuickAddColumn(columnId)
    setShowQuickAdd(true)
  }

  const handleQuickAddSubmit = async (title: string) => {
    if (!title.trim()) return

    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error('No current user found')
      return
    }

    try {
      const result = await StatusTodoAPI.create(currentUser.id, {
        title: title,
        description: '',
        status: (quickAddColumn as TodoItem['status']) || 'backlog',
        tags: [],
        type: 'task',
        priority: 'medium'
      })

      if (result.success) {
        await loadTodos()
        setShowQuickAdd(false)
      } else {
        console.error('Failed to create task:', result.error)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const toggleProjectExpansion = async (projectId: string) => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error('No current user found')
      return
    }

    try {
      const todo = todos.find(t => t.id === projectId)
      if (todo) {
        const result = await StatusTodoAPI.update(currentUser.id, projectId, {
          isExpanded: !todo.isExpanded
        })
        
        if (result.success) {
          await loadTodos()
        } else {
          console.error('Failed to update project expansion:', result.error)
        }
      }
    } catch (error) {
      console.error('Error updating project expansion:', error)
    }
  }

  const toggleSubtaskComplete = async (projectId: string, subtaskId: string) => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error('No current user found')
      return
    }

    try {
      const todo = todos.find(t => t.id === projectId)
      if (!todo || !todo.subtasks) return

      const subtask = todo.subtasks.find(s => s.id === subtaskId)
      if (!subtask) return

      const result = await StatusTodoAPI.updateSubtask(
        currentUser.id, 
        projectId, 
        subtaskId, 
        { completed: !subtask.completed }
      )
      
      if (result.success) {
        await loadTodos()
      } else {
        console.error('Failed to update subtask:', result.error)
      }
    } catch (error) {
      console.error('Error updating subtask:', error)
    }
  }

  const addSubtask = async (projectId: string, subtaskTitle: string) => {
    if (!subtaskTitle.trim()) return

    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error('No current user found')
      return
    }

    try {
      const result = await StatusTodoAPI.addSubtask(currentUser.id, projectId, {
        title: subtaskTitle,
        priority: 'medium'
      })
      
      if (result.success) {
        await loadTodos()
      } else {
        console.error('Failed to add subtask:', result.error)
      }
    } catch (error) {
      console.error('Error adding subtask:', error)
    }
  }

  // 新增留言功能
  const addComment = async (taskId: string, comment: string) => {
    if (!comment.trim()) return
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error('No current user found')
      return
    }

    try {
      const result = await StatusTodoAPI.addComment(currentUser.id, taskId, comment)
      
      if (result.success) {
        await loadTodos()
      } else {
        console.error('Failed to add comment:', result.error)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  if (!currentUser) {
    return (
      <div className="loading">
        正在載入待辦事項...
      </div>
    )
  }

  if (!currentUser.permissions?.todos) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>權限不足</h2>
        <p>您沒有權限查看待辦事項功能</p>
      </div>
    )
  }

  const columns = getColumns()

  return (
    <div className="todos-container">
      <div>
        <PageHeader
          icon={Icons.todos}
          title="待辦事項"
          subtitle={`看板式任務管理 ${(hasPackagingPermission && currentMode === 'corner') ? '• 專案打包版' : '• 基礎版'}`}
          actions={
            <Button 
              variant="secondary" 
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.5 3L6 11L2.5 7.5l1.06-1.06L6 8.94l6.44-6.44L13.5 3z"/>
                </svg>
              }
              onClick={() => setShowCompletedPanel(true)}
            >
              完成 ({getTasksByStatus('done').length})
            </Button>
          }
        />
      </div>

      <div className={`kanban-board columns-${columns.length}`}>
        {columns.map(column => (
          <div 
            key={column.id}
            className="kanban-column"
            data-drag-over={dragOverColumn === column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="column-header">
              <div className="column-title-section">
                <h3 className="column-title">{column.title}</h3>
                <span className="column-count">{getTasksByStatus(column.status).length}</span>
              </div>
              {column.status !== 'done' && column.status !== 'packaging' && currentUser.permissions?.todos && (
                <button 
                  className="add-task-btn"
                  onClick={() => openAddDialog(column.id)}
                  title="新增任務"
                >
                  <svg viewBox="0 0 16 16" width="12" height="12">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            <div 
              className="column-tasks"
              onClick={(e) => {
                if (column.status !== 'done' && column.status !== 'packaging' && currentUser.permissions?.todos) {
                  handleQuickAdd(e, column.id)
                }
              }}
            >
              {getTasksByStatus(column.status).map(task => (
                <div 
                  key={task.id}
                  className={`task-card ${task.status === 'done' ? 'completed' : ''} ${selectedTasks.has(task.id) ? 'selected' : ''} ${task.type === 'project' ? 'project-card' : ''}`}
                  draggable={!!currentUser.permissions?.todos}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={(e) => {
                    // 避免在拖曳時觸發點擊
                    if (isDragging || e.detail === 0) return
                    
                    // 延遲處理，確保拖拽狀態更新完成
                    setTimeout(() => {
                      if (!isDragging) {
                        if (task.type === 'project') {
                          e.preventDefault()
                          toggleProjectExpansion(task.id)
                        } else {
                          setEditingTask(task)
                        }
                      }
                    }, 100)
                  }}
                  onDragEnd={() => {
                    console.log('Drag ended for:', task.title)
                    setIsDragging(false)
                    setDraggedItem(null)
                  }}
                >

                  <div className="task-main-content">
                    <div className="task-header">
                      <h4 className="task-title">
                        {task.type === 'project' && (
                          <span className="project-icon">📋</span>
                        )}
                        {task.title}
                        {task.type === 'project' && task.subtasks && (
                          <span className="subtask-count">
                            ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                          </span>
                        )}
                      </h4>
                      <div className="task-actions">
                        {currentUser.permissions?.todos && (
                          <button 
                            className="action-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(task.id)
                            }}
                            title="刪除"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14">
                              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    

                    {/* 專案子任務展開區域 */}
                    {task.type === 'project' && task.isExpanded && (
                      <div className="subtasks-container">
                        <div className="subtasks-header">
                          <span>子任務</span>
                          <button 
                            className="add-subtask-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              const title = prompt('請輸入子任務標題')
                              if (title) addSubtask(task.id, title)
                            }}
                          >
                            + 新增
                          </button>
                        </div>
                        
                        <div className="subtasks-list">
                          {task.subtasks?.map(subtask => (
                            <div key={subtask.id} className="subtask-item">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  toggleSubtaskComplete(task.id, subtask.id)
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className={`subtask-title ${subtask.completed ? 'completed' : ''}`}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {getTasksByStatus(column.status).length === 0 && (
                <div className="empty-column">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 11l3 3L20 5"/>
                  </svg>
                  <p>暫無任務</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 新增任務對話框 */}
      {showAddDialog && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddDialog(false)}>
          <div className="modal-content">
            <h3 className="modal-title">新增任務</h3>
            
            <div className="form-group">
              <label>任務標題</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="輸入任務標題"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>任務描述</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="輸入任務描述（選填）"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>任務類型</label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({...newTask, type: e.target.value as 'task' | 'project'})}
              >
                <option value="task">一般任務</option>
                {currentMode === 'corner' && (
                  <option value="project">專案</option>
                )}
              </select>
            </div>


            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowAddDialog(false)}
              >
                取消
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAddTask}
              >
                新增任務
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯任務對話框 */}
      {editingTask && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingTask(null)}>
          <div className="modal-content">
            <h3 className="modal-title">編輯任務</h3>
            
            <div className="form-group">
              <label>任務標題</label>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>任務描述</label>
              <textarea
                value={editingTask.description || ''}
                onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                rows={3}
              />
            </div>



            <div className="form-group">
              <label>留言記錄</label>
              <div className="comments-section">
                {editingTask.comments && editingTask.comments.length > 0 ? (
                  <div className="existing-comments">
                    {editingTask.comments.map((comment, index) => (
                      <div key={index} className="comment-item">
                        <span className="comment-text">{comment}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-comments">暫無留言</p>
                )}
                <input
                  type="text"
                  placeholder="新增留言..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      addComment(editingTask.id, e.currentTarget.value)
                      e.currentTarget.value = ''
                      // 更新編輯中的任務資料
                      const updatedTask = todos.find(t => t.id === editingTask.id)
                      if (updatedTask) {
                        setEditingTask(updatedTask)
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setEditingTask(null)}
              >
                取消
              </button>
              <button 
                className="btn-primary" 
                onClick={handleEditTask}
              >
                儲存變更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認對話框 */}
      {deleteConfirm.show && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm({show: false, taskId: null})}>
          <div className="modal-content delete-confirm-modal">
            <h3 className="modal-title">確認刪除</h3>
            <p className="delete-warning">
              確定要刪除這個任務嗎？此操作無法復原。
            </p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setDeleteConfirm({show: false, taskId: null})}
              >
                取消
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmDelete}
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Popover */}
      {showQuickAdd && (
        <>
          <div 
            className="popover-overlay"
            onClick={() => setShowQuickAdd(false)}
          />
          <div 
            className="quick-add-popover"
            style={{
              position: 'fixed',
              left: quickAddPosition.x,
              top: quickAddPosition.y,
              zIndex: 1001
            }}
          >
            <div className="quick-add-header">
              <h4>快速新增任務</h4>
            </div>
            
            <div className="quick-add-content">
              <input
                type="text"
                placeholder="輸入任務標題..."
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleQuickAddSubmit(e.currentTarget.value)
                  } else if (e.key === 'Escape') {
                    setShowQuickAdd(false)
                  }
                }}
                onBlur={(e) => {
                  // 延遲執行，讓用戶有時間點擊其他按鈕
                  setTimeout(() => {
                    if (e.target.value.trim()) {
                      handleQuickAddSubmit(e.target.value)
                    } else {
                      setShowQuickAdd(false)
                    }
                  }, 100)
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Completed Tasks Slide Panel */}
      {showCompletedPanel && (
        <>
          <div 
            className="slide-panel-overlay"
            onClick={() => setShowCompletedPanel(false)}
          />
          <div className="completed-slide-panel">
            <div className="slide-panel-header">
              <h3>完成的任務</h3>
              <button 
                className="close-panel-btn"
                onClick={() => setShowCompletedPanel(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="slide-panel-content">
              {getTasksByStatus('done').length === 0 ? (
                <div className="empty-completed">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  <p>還沒有完成的任務</p>
                </div>
              ) : (
                <div className="completed-tasks-list">
                  {getTasksByStatus('done').map(task => (
                    <div key={task.id} className="completed-task-item">
                      <div className="completed-task-header">
                        <h4 className="completed-task-title">
                          {task.type === 'project' && (
                            <span className="project-icon">📋</span>
                          )}
                          {task.title}
                        </h4>
                        <span className="completed-date">
                          {new Date(task.updatedAt).toLocaleDateString('zh-TW')}
                        </span>
                      </div>
                      {task.description && (
                        <p className="completed-task-description">{task.description}</p>
                      )}
                      {task.comments && task.comments.length > 0 && (
                        <div className="completed-task-comments">
                          {task.comments.map((comment, index) => (
                            <div key={index} className="completed-comment">
                              {comment}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .todos-container {
          max-width: none;
          margin: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          width: 100%;
        }


        .stats-overview {
          display: flex;
          gap: 24px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #c9a961;
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #6d685f;
          margin-top: 2px;
        }

        .kanban-board {
          flex: 1;
          display: grid;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 20px;
          min-height: 500px;
          width: 100%;
        }

        .kanban-board.columns-4 {
          grid-template-columns: repeat(4, minmax(280px, 1fr));
        }

        .kanban-board.columns-5 {
          grid-template-columns: repeat(5, minmax(240px, 1fr));
        }

        .kanban-column {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          padding: 12px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          min-height: 400px;
          transition: all 0.3s ease;
          min-width: 240px;
          position: relative;
        }

        .kanban-column:hover {
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.1);
        }

        .kanban-column[data-drag-over="true"] {
          background: rgba(201, 169, 97, 0.1);
          border: 2px dashed rgba(201, 169, 97, 0.5);
          transform: scale(1.02);
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(201, 169, 97, 0.3);
        }

        .column-title-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .column-title {
          font-size: 16px;
          font-weight: 600;
          color: #3a3833;
          margin: 0;
        }

        .column-count {
          background: rgba(201, 169, 97, 0.2);
          color: #8b7355;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }

        .add-task-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: rgba(201, 169, 97, 0.2);
          color: #8b7355;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .add-task-btn:hover {
          background: rgba(201, 169, 97, 0.3);
          transform: scale(1.1);
        }

        .column-tasks {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 300px;
        }

        .task-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          padding: 16px 12px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          transition: all 0.3s ease;
          cursor: move;
          position: relative;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .task-card:active {
          opacity: 0.7;
          transform: rotate(2deg);
          z-index: 1000;
        }

        .task-card.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .task-card.project-card {
          border-left: 4px solid #8b5cf6;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(255, 255, 255, 0.9));
        }

        .project-icon {
          margin-right: 6px;
          font-size: 14px;
        }

        .subtask-count {
          font-size: 12px;
          color: #8b5cf6;
          font-weight: 500;
          margin-left: 8px;
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201, 169, 97, 0.2);
          border-color: rgba(201, 169, 97, 0.4);
        }

        .task-card.completed {
          opacity: 0.7;
          background: rgba(245, 245, 245, 0.9);
        }

        .task-card.completed .task-title {
          text-decoration: line-through;
          color: #6b7280;
        }

        .task-header {
          display: flex;
          align-items: center;
          margin: 0;
          gap: 8px;
          flex: 1;
        }


        .task-main-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
        }

        .task-title {
          font-size: 14px;
          font-weight: 500;
          color: #3a3833;
          margin: 0;
          line-height: 1.3;
          flex: 1;
        }

        .task-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .task-card:hover .task-actions {
          opacity: 1;
        }

        .action-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }


        .delete-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
        }

        .task-description {
          font-size: 13px;
          color: #6d685f;
          line-height: 1.4;
          margin: 0 0 12px 0;
        }

        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }


        .task-priority {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .empty-column {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
        }

        .empty-column svg {
          margin-bottom: 8px;
          opacity: 0.5;
        }

        .empty-column p {
          margin: 0;
          font-size: 14px;
        }

        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          color: #6d685f;
        }

        .access-denied-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 20px;
          color: #c9a961;
        }

        .access-denied h2 {
          margin: 0 0 8px 0;
          color: #3a3833;
          font-size: 1.5rem;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6d685f;
          font-size: 16px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-title {
          margin: 0 0 20px 0;
          color: #3a3833;
          font-size: 20px;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #3a3833;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 60px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-secondary {
          padding: 10px 20px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          background: white;
          border-radius: 8px;
          cursor: pointer;
          color: #6d685f;
        }

        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        /* 子任務樣式 */
        .subtasks-container {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(139, 92, 246, 0.2);
        }

        .subtasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #8b5cf6;
        }

        .add-subtask-btn {
          padding: 2px 6px;
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
          transition: all 0.2s ease;
        }

        .add-subtask-btn:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .subtasks-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .subtask-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: rgba(139, 92, 246, 0.03);
          border-radius: 4px;
          font-size: 12px;
        }

        .subtask-item input[type="checkbox"] {
          width: 12px;
          height: 12px;
          accent-color: #8b5cf6;
        }

        .subtask-title {
          flex: 1;
          color: #6b7280;
        }

        .subtask-title.completed {
          text-decoration: line-through;
          opacity: 0.6;
        }

        /* 刪除確認模態框樣式 */
        .delete-confirm-modal {
          max-width: 400px;
          text-align: center;
        }

        .delete-warning {
          color: #6b7280;
          margin: 16px 0;
          line-height: 1.5;
        }

        .btn-danger {
          padding: 10px 20px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-danger:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-1px);
        }

        /* 留言區域樣式 */
        .comments-section {
          margin-top: 8px;
        }

        .existing-comments {
          margin-bottom: 12px;
        }

        .comment-item {
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
        }

        .comment-text {
          font-size: 13px;
          color: #6d685f;
          line-height: 1.5;
        }

        .no-comments {
          color: #9ca3af;
          font-style: italic;
          margin-bottom: 10px;
        }

        /* Quick Add Popover 樣式 */
        .popover-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          z-index: 1000;
        }

        .quick-add-popover {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(201, 169, 97, 0.2);
          min-width: 250px;
          max-width: 300px;
        }

        .quick-add-header {
          margin-bottom: 12px;
        }

        .quick-add-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #3a3833;
        }

        .quick-add-content input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .quick-add-content input:focus {
          border-color: #c9a961;
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
        }

        @media (max-width: 1200px) {
          .kanban-board {
            gap: 12px;
          }
          
          .kanban-column {
            padding: 10px;
            min-width: 220px;
          }
        }

        @media (max-width: 1024px) {
          .kanban-board {
            overflow-x: auto;
            grid-template-columns: repeat(${columns.length}, minmax(220px, 280px));
            gap: 10px;
          }
          
          .stats-overview {
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .todos-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .kanban-board {
            grid-template-columns: repeat(${columns.length}, 260px);
            gap: 8px;
          }
          
          .kanban-column {
            padding: 8px;
            min-width: 200px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}