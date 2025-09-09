'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth, getMockTodos, getMockUserProfile } from '@/lib/auth-utils'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import TaskDetailDialog from '@/components/TaskDetailDialog'
import { useMode } from '@/contexts/ModeContext'

// 型別定義
interface Todo {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  type: 'task' | 'project' | 'invoice' | 'order' | 'group' | 'quotation'
  due_date?: string
  tags: string[]
  linkedId?: string
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  email: string
  username?: string
  role: 'admin' | 'corner' | 'user'
}

export default function TodosPage() {
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [activeView, setActiveView] = useState<'board' | 'list'>('board')
  const [showAddPopover, setShowAddPopover] = useState<{ column: 'pending' | 'in_progress', x: number, y: number } | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [draggedTask, setDraggedTask] = useState<Todo | null>(null)
  const [showCompletedDrawer, setShowCompletedDrawer] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 })
  const { currentMode } = useMode()

  // 載入使用者資料和待辦事項
  useEffect(() => {
    loadUserAndTodos()
  }, [])


  const loadUserAndTodos = async () => {
    try {
      const { user } = await checkAuth()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUserProfile(getMockUserProfile())
      
      // 簡化的模擬數據
      setTodos([
        {
          id: '1',
          title: '完成每日運動',
          description: '跑步30分鐘或做瑜伽',
          type: 'task',
          status: 'pending',
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: '學習 React Hooks',
          description: '完成線上課程第三章',
          type: 'task',
          status: 'in_progress',
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: '整理房間',
          type: 'task',
          status: 'pending',
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          title: '閱讀《原子習慣》',
          description: '完成第一章',
          type: 'task',
          status: 'completed',
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      setLoading(false)
    } catch (error) {
      console.error('載入資料失敗:', error)
      setLoading(false)
    }
  }

  // 快速新增任務
  const handleQuickAdd = (status: 'pending' | 'in_progress') => {
    if (!newTaskTitle.trim()) return

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDesc,
      type: 'task',
      status: status,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setTodos([...todos, newTodo])
    setNewTaskTitle('')
    setNewTaskDesc('')
    setShowAddPopover(null)
    showNotification('任務已新增 +10 EXP', 'success')
  }

  // 開啟新增彈窗
  const openAddPopover = (column: 'pending' | 'in_progress', event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setShowAddPopover({ 
      column, 
      x: rect.left,
      y: rect.bottom + 8
    })
  }

  // 更新待辦事項狀態
  const handleUpdateStatus = async (id: string, status: Todo['status']) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, status, updated_at: new Date().toISOString() }
        : todo
    ))
    
    if (status === 'completed') {
      showNotification('任務完成！獲得 10 EXP ⭐', 'success')
    }
  }

  // 刪除待辦事項
  const handleDeleteTodo = async (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
    showNotification('任務已刪除', 'info')
  }

  // 打開任務詳細對話框
  const handleTaskClick = (task: Todo, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2  // 卡片中心X座標
    const y = rect.top + rect.height / 2  // 卡片中心Y座標
    
    setDialogPosition({ x, y })
    setSelectedTask(task)
    setShowTaskDialog(true)
  }

  // 關閉任務詳細對話框
  const handleCloseTaskDialog = () => {
    setShowTaskDialog(false)
    setSelectedTask(null)
  }

  // 儲存任務變更
  const handleSaveTask = (updatedData: Partial<Todo>) => {
    if (!selectedTask) return

    setTodos(todos.map(todo => 
      todo.id === selectedTask.id 
        ? { ...todo, ...updatedData }
        : todo
    ))

    showNotification('任務已更新！', 'success')
    handleCloseTaskDialog()
  }

  // 從對話框刪除任務
  const handleDeleteFromDialog = (id: string) => {
    handleDeleteTodo(id)
    handleCloseTaskDialog()
  }

  // 拖曳處理函數
  const handleDragStart = (e: React.DragEvent, task: Todo) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: Todo['status']) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      handleUpdateStatus(draggedTask.id, newStatus)
      const statusName = newStatus === 'pending' ? '準備區' : '等待區'
      showNotification(`任務已移至${statusName}`, 'success')
    }
    setDraggedTask(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  // 顯示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${bgColor};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  // 按狀態分組待辦事項
  const pendingTodos = todos.filter(t => t.status === 'pending')
  const inProgressTodos = todos.filter(t => t.status === 'in_progress')
  const completedTodos = todos.filter(t => t.status === 'completed')

  if (loading) {
    return (
      <div className="loading">
        正在載入任務系統...
      </div>
    )
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.todos,
        title: "任務管理",
        subtitle: "冒險模式",
        actions: (
          <div className="header-actions">
            <button 
              className={`completed-btn ${showCompletedDrawer ? 'active' : ''}`}
              onClick={() => setShowCompletedDrawer(!showCompletedDrawer)}
            >
              已完成 ({completedTodos.length})
            </button>
            <div className="view-toggles">
              <button 
                className={`view-btn ${activeView === 'board' ? 'active' : ''}`}
                onClick={() => setActiveView('board')}
              >
                看板
              </button>
              <button 
                className={`view-btn ${activeView === 'list' ? 'active' : ''}`}
                onClick={() => setActiveView('list')}
              >
                列表
              </button>
            </div>
          </div>
        )
      }}
    >
      {/* 看板視圖 */}
      {activeView === 'board' ? (
        <div className="kanban-board">
          {/* 準備區容器 */}
          <div className="kanban-column">
            <div className="column-header pending">
              <div className="header-left">
                <h3>準備區</h3>
                <span className="count-badge">{pendingTodos.length}</span>
              </div>
              <button 
                className="add-task-header-btn"
                onClick={(e) => openAddPopover('pending', e)}
                title="新增任務"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div 
              className="tasks-container"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'pending')}
            >
              {pendingTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`task-card ${draggedTask?.id === todo.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHoveredCard(todo.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={(e) => handleTaskClick(todo, e)}
                >
                  <div className="task-content-layout">
                    <h4 className="task-title">
                      {todo.title}
                    </h4>
                    {todo.description && (
                      <p className="task-desc">{todo.description}</p>
                    )}
                  </div>
                  
                  {/* Hover 時顯示的快捷按鈕 - 準備區也可以直接完成 */}
                  {hoveredCard === todo.id && (
                    <div className="hover-actions" style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '4px',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      <button 
                        className="hover-btn complete"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#10b981';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                          e.currentTarget.style.color = '#10b981';
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(todo.id, 'completed')
                        }}
                        title="標記完成"
                      >
                        ✓
                      </button>
                      <button 
                        className="hover-btn delete"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTodo(todo.id)
                        }}
                        title="刪除"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 等待區容器 */}
          <div className="kanban-column">
            <div className="column-header in-progress">
              <div className="header-left">
                <h3>等待區</h3>
                <span className="count-badge">{inProgressTodos.length}</span>
              </div>
              <button 
                className="add-task-header-btn"
                onClick={(e) => openAddPopover('in_progress', e)}
                title="新增任務"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div 
              className="tasks-container"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'in_progress')}
            >
              {inProgressTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`task-card ${draggedTask?.id === todo.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHoveredCard(todo.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={(e) => handleTaskClick(todo, e)}
                >
                  <div className="task-content-layout">
                    <h4 className="task-title">
                      {todo.title}
                    </h4>
                    {todo.description && (
                      <p className="task-desc">{todo.description}</p>
                    )}
                  </div>
                  
                  {/* Hover 時顯示的快捷按鈕 - 等待區也可以直接完成 */}
                  {hoveredCard === todo.id && (
                    <div className="hover-actions" style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '4px',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      <button 
                        className="hover-btn complete"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#10b981';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                          e.currentTarget.style.color = '#10b981';
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(todo.id, 'completed')
                        }}
                        title="標記完成"
                      >
                        ✓
                      </button>
                      <button 
                        className="hover-btn delete"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTodo(todo.id)
                        }}
                        title="刪除"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // 列表視圖
        <div className="list-view">
          {todos.filter(t => t.status !== 'completed').map(todo => (
            <div key={todo.id} className={`list-item ${todo.status}`}>
              <div className="list-content">
                <h4>{todo.title}</h4>
                {todo.description && (
                  <p className="list-desc">{todo.description}</p>
                )}
              </div>
              <div className="list-actions">
                <button 
                  className="action-btn complete"
                  onClick={() => handleUpdateStatus(todo.id, 'completed')}
                >
                  完成
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新增任務 Popover */}
      {showAddPopover && (
        <>
          <div className="popover-backdrop" onClick={() => setShowAddPopover(null)} />
          <div 
            className="add-popover"
            style={{
              left: `${showAddPopover.x}px`,
              top: `${showAddPopover.y}px`
            }}
          >
            <h4>新增任務</h4>
            <input
              type="text"
              placeholder="任務名稱"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleQuickAdd(showAddPopover.column)
                }
              }}
              autoFocus
              className="popover-input"
            />
            <textarea
              placeholder="任務描述（選填）"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              className="popover-textarea"
            />
            <div className="popover-actions">
              <button 
                onClick={() => handleQuickAdd(showAddPopover.column)}
                className="popover-confirm"
                disabled={!newTaskTitle.trim()}
              >
                新增
              </button>
              <button 
                onClick={() => {
                  setShowAddPopover(null)
                  setNewTaskTitle('')
                  setNewTaskDesc('')
                }}
                className="popover-cancel"
              >
                取消
              </button>
            </div>
          </div>
        </>
      )}

      {/* 已完成抽屜 */}
      <div className={`completed-drawer ${showCompletedDrawer ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>已完成任務</h3>
          <button 
            className="close-drawer"
            onClick={() => setShowCompletedDrawer(false)}
          >
            ×
          </button>
        </div>
        <div className="drawer-content">
          {completedTodos.length === 0 ? (
            <p className="empty-message">暫無已完成的任務</p>
          ) : (
            completedTodos.map(todo => (
              <div key={todo.id} className="completed-task">
                <div className="task-info">
                  <h4>{todo.title}</h4>
                  {todo.description && <p>{todo.description}</p>}
                  <span className="complete-time">
                    完成於 {new Date(todo.updated_at).toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="task-actions">
                  <button 
                    className="action-btn reopen"
                    onClick={() => handleUpdateStatus(todo.id, 'pending')}
                  >
                    重新開啟
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 任務詳細資訊對話框 */}
      <TaskDetailDialog
        isOpen={showTaskDialog}
        onClose={handleCloseTaskDialog}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteFromDialog}
        position={dialogPosition}
        isCornerMode={currentMode === 'corner'}
      />

      <style jsx>{`
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6d685f;
          font-size: 16px;
        }

        .header-actions {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .completed-btn {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--success-bg);
          color: var(--success);
          border: 1px solid var(--success);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 500;
          transition: var(--animation-fast);
          font-size: var(--font-size-sm);
        }

        .completed-btn:hover {
          background: var(--success-hover);
          color: var(--text-white);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .completed-btn.active {
          background: var(--success);
          color: var(--text-white);
          box-shadow: var(--shadow-md);
        }

        .view-toggles {
          display: flex;
          gap: 4px;
          background: rgba(201, 169, 97, 0.1);
          padding: 4px;
          border-radius: 10px;
        }

        .view-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #6d685f;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: white;
          color: #c9a961;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* 看板視圖 - 使用 grid 讓容器不超過螢幕高度 */
        .kanban-board {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          height: calc(100vh - 240px);
          max-height: 600px;
        }

        .kanban-column {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          padding: 16px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin: -16px -16px 16px -16px;
          border-radius: 16px 16px 0 0;
          flex-shrink: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .add-task-header-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-task-header-btn:hover {
          background: rgba(255, 255, 255, 0.4);
          border-color: rgba(255, 255, 255, 0.7);
          transform: scale(1.05);
        }

        .column-header.pending {
          background: linear-gradient(135deg, var(--primary), var(--primary-hover));
        }

        .column-header.in-progress {
          background: linear-gradient(135deg, var(--secondary), var(--secondary-hover));
        }

        .column-header h3 {
          margin: 0;
          color: white;
          font-size: 16px;
          font-weight: 600;
        }

        .count-badge {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .tasks-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          padding: 8px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* 自訂滾動條 */
        .tasks-container::-webkit-scrollbar {
          width: 6px;
        }

        .tasks-container::-webkit-scrollbar-track {
          background: var(--primary-bg);
          border-radius: 3px;
        }

        .tasks-container::-webkit-scrollbar-thumb {
          background: var(--primary);
          opacity: 0.3;
          border-radius: 3px;
        }

        .tasks-container::-webkit-scrollbar-thumb:hover {
          background: var(--primary-hover);
          opacity: 0.5;
        }

        .task-card {
          border-radius: 12px;
          padding: 16px;
          border: 1px solid var(--border);
          transition: all 0.3s ease;
          cursor: pointer;
          user-select: none;
          position: relative;
          flex-shrink: 0;
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .task-card:active {
          cursor: grabbing;
        }

        .task-card.dragging {
          opacity: 0.5;
          transform: rotate(5deg);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          z-index: 1000;
        }

        .task-content-layout {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 70px;
          min-height: 40px;
        }

        .task-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #3a3833;
          line-height: 1.3;
        }

        .task-desc {
          font-size: 13px;
          color: #6d685f;
          margin: 0;
          line-height: 1.4;
          opacity: 0.8;
        }

        /* Popover 新增介面 */
        .popover-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          z-index: 998;
        }

        .add-popover {
          position: fixed;
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 999;
          width: 320px;
          animation: popIn 0.2s ease;
        }

        .add-popover h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #3a3833;
        }

        .popover-input {
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .popover-input:focus {
          outline: none;
          border-color: #c9a961;
        }

        .popover-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 16px;
          resize: vertical;
          min-height: 60px;
          font-family: inherit;
        }

        .popover-textarea:focus {
          outline: none;
          border-color: #c9a961;
        }

        .popover-actions {
          display: flex;
          gap: 8px;
        }

        .popover-confirm {
          flex: 1;
          padding: 8px 16px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .popover-confirm:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        .popover-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .popover-cancel {
          flex: 1;
          padding: 8px 16px;
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }

        /* 其他樣式保持不變 */
        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.complete {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .action-btn.reopen {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        /* 列表視圖 */
        .list-view {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          max-height: calc(100vh - 240px);
          overflow-y: auto;
        }

        .list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
          transition: background 0.2s ease;
        }

        .list-item:hover {
          background: rgba(201, 169, 97, 0.05);
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .list-content {
          flex: 1;
        }

        .list-content h4 {
          margin: 0;
          font-size: 16px;
          color: #3a3833;
        }

        .list-desc {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: #6d685f;
        }

        .list-actions {
          display: flex;
          gap: 8px;
        }

        /* 已完成抽屜 - Venturo 風格 */
        .completed-drawer {
          position: fixed;
          top: 0;
          right: -400px;
          width: 400px;
          height: 100vh;
          background: var(--surface);
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow-xl);
          transition: right var(--animation-normal);
          z-index: 999;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border);
        }

        .completed-drawer.open {
          right: 0;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border);
          background: var(--gradient-card-bg);
          color: var(--text-primary);
        }

        .drawer-header h3 {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--primary-dark);
        }

        .close-drawer {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--primary-bg);
          color: var(--primary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          transition: var(--animation-fast);
        }

        .close-drawer:hover {
          background: var(--primary);
          color: var(--text-white);
          transform: scale(1.05);
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
        }

        .completed-task {
          background: var(--gradient-card-subtle-bg);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
          border: var(--gradient-card-border);
          box-shadow: var(--shadow-xs);
          transition: var(--animation-fast);
        }

        .completed-task:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .task-info h4 {
          margin: 0 0 8px 0;
          font-size: 15px;
          color: #3a3833;
          text-decoration: line-through;
        }

        .task-info p {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #6d685f;
        }

        .complete-time {
          font-size: var(--font-size-xs);
          color: var(--success);
          font-weight: 500;
        }

        .empty-message {
          text-align: center;
          color: var(--text-secondary);
          margin-top: var(--spacing-2xl);
          font-size: var(--font-size-base);
        }

        @media (max-width: 768px) {
          .kanban-board {
            grid-template-columns: 1fr;
            height: auto;
            max-height: none;
          }
          
          .kanban-column {
            height: 400px;
          }
          
          .completed-drawer {
            width: 100%;
            right: -100%;
          }
          
          .add-popover {
            width: 90%;
            left: 5% !important;
            right: 5%;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ModuleLayout>
  )
}