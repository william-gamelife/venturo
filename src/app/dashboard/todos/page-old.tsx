'use client'

import { useState, useEffect } from 'react'

// 型別定義
interface Todo {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'task' | 'project' | 'invoice' | 'order' | 'group'
  due_date?: string
  exp_reward: number
  tags: string[]
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  email: string
  username?: string
  role: 'admin' | 'corner' | 'user'
  level: number
  experience: number
}

export default function TodosPage() {
  // 使用假資料，避免認證問題
  const [userProfile] = useState<UserProfile>({
    id: 'user-001',
    email: 'demo@venturo.com',
    username: 'demo',
    role: 'corner',
    level: 5,
    experience: 250
  })
  
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      title: '完成季度報告',
      description: '需要整理Q1的所有數據並製作報告',
      status: 'in_progress',
      priority: 'high',
      type: 'task',
      due_date: '2025-01-15',
      exp_reward: 30,
      tags: ['報告', '重要'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      title: '客戶專案提案',
      description: '準備新客戶的專案提案簡報',
      status: 'pending',
      priority: 'urgent',
      type: 'project',
      due_date: '2025-01-10',
      exp_reward: 50,
      tags: ['客戶', '專案'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      title: '團隊會議',
      description: '週會討論專案進度',
      status: 'pending',
      priority: 'medium',
      type: 'task',
      exp_reward: 10,
      tags: ['會議'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])
  
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as Todo['priority'],
    type: 'task' as Todo['type'],
    due_date: '',
    tags: [] as string[]
  })
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    priority: 'all'
  })

  // 開啟詳細視窗
  const openDetailModal = (todo: Todo) => {
    setSelectedTodo(todo)
    setShowModal(true)
  }

  // 關閉詳細視窗
  const closeModal = () => {
    setShowModal(false)
    setSelectedTodo(null)
  }

  // 建立新待辦事項（本地）
  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTodo.title.trim()) return

    const newTodoItem: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      status: 'pending',
      priority: newTodo.priority,
      type: newTodo.type,
      due_date: newTodo.due_date,
      exp_reward: getExpReward(newTodo.priority, newTodo.type),
      tags: newTodo.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setTodos([newTodoItem, ...todos])
    
    // 重置表單
    setNewTodo({
      title: '',
      description: '',
      priority: 'medium',
      type: 'task',
      due_date: '',
      tags: []
    })
    
    showNotification('任務建立成功！', 'success')
  }

  // 更新待辦事項狀態（本地）
  const handleUpdateStatus = (id: string, status: Todo['status']) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, status, updated_at: new Date().toISOString() } : todo
    ))
    
    if (status === 'completed') {
      const todo = todos.find(t => t.id === id)
      if (todo) {
        showNotification(`任務完成！獲得 ${todo.exp_reward} 經驗值`, 'success')
      }
    }
  }

  // 刪除待辦事項（本地）
  const handleDeleteTodo = (id: string) => {
    if (!confirm('確定要刪除這個任務嗎？')) return
    
    setTodos(todos.filter(todo => todo.id !== id))
    showNotification('任務已刪除', 'info')
    
    if (selectedTodo?.id === id) {
      closeModal()
    }
  }

  // 計算經驗值獎勵
  const getExpReward = (priority: Todo['priority'], type: Todo['type']) => {
    const baseReward = {
      task: 10,
      project: 50,
      invoice: 30,
      order: 25,
      group: 40
    }

    const priorityMultiplier = {
      low: 0.8,
      medium: 1,
      high: 1.5,
      urgent: 2
    }

    return Math.floor((baseReward[type] || 10) * priorityMultiplier[priority])
  }

  // 顯示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div')
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  // 過濾待辦事項
  const filteredTodos = todos.filter(todo => {
    if (filter.status !== 'all' && todo.status !== filter.status) return false
    if (filter.type !== 'all' && todo.type !== filter.type) return false
    if (filter.priority !== 'all' && todo.priority !== filter.priority) return false
    return true
  })

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 頂部資訊 */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">我的任務</h1>
              <p className="opacity-90">管理你的日常冒險</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">等級 {userProfile.level}</div>
              <div className="text-2xl font-bold">{userProfile.experience} EXP</div>
              <div className="w-32 h-2 bg-white/20 rounded-full mt-2">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(userProfile.experience % 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 新增任務表單 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">新增任務</h2>
          <form onSubmit={handleCreateTodo} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="任務標題"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <select
                value={newTodo.type}
                onChange={(e) => setNewTodo({ ...newTodo, type: e.target.value as Todo['type'] })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="task">一般任務</option>
                {userProfile.role !== 'user' && (
                  <>
                    <option value="project">專案</option>
                    <option value="invoice">請款單</option>
                    <option value="order">訂單</option>
                    <option value="group">團體</option>
                  </>
                )}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Todo['priority'] })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">低優先級</option>
                <option value="medium">中優先級</option>
                <option value="high">高優先級</option>
                <option value="urgent">緊急</option>
              </select>
              
              <input
                type="date"
                value={newTodo.due_date}
                onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
              >
                新增任務 (+{getExpReward(newTodo.priority, newTodo.type)} EXP)
              </button>
            </div>
            
            <textarea
              placeholder="任務描述（選填）"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </form>
        </div>

        {/* 過濾器 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">所有狀態</option>
              <option value="pending">待處理</option>
              <option value="in_progress">進行中</option>
              <option value="completed">已完成</option>
            </select>
            
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">所有類型</option>
              <option value="task">一般任務</option>
              {userProfile.role !== 'user' && (
                <>
                  <option value="project">專案</option>
                  <option value="invoice">請款單</option>
                  <option value="order">訂單</option>
                  <option value="group">團體</option>
                </>
              )}
            </select>
            
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">所有優先級</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">緊急</option>
            </select>
          </div>
        </div>

        {/* 任務列表 */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              沒有符合條件的任務
            </div>
          ) : (
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`bg-white rounded-lg shadow-md p-4 transition-all cursor-pointer hover:shadow-lg ${
                  todo.status === 'completed' ? 'opacity-75' : ''
                }`}
                onClick={() => openDetailModal(todo)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.status === 'completed'}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(
                            todo.id, 
                            e.target.checked ? 'completed' : 'pending'
                          )
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded text-primary"
                      />
                      <h3 className={`text-lg font-medium ${
                        todo.status === 'completed' ? 'line-through text-gray-500' : ''
                      }`}>
                        {todo.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        todo.type === 'task' ? 'bg-blue-100 text-blue-700' :
                        todo.type === 'project' ? 'bg-purple-100 text-purple-700' :
                        todo.type === 'invoice' ? 'bg-green-100 text-green-700' :
                        todo.type === 'order' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {todo.type === 'task' ? '任務' :
                         todo.type === 'project' ? '專案' :
                         todo.type === 'invoice' ? '請款' :
                         todo.type === 'order' ? '訂單' :
                         todo.type === 'group' ? '團體' : todo.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        todo.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        todo.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {todo.priority === 'urgent' ? '緊急' :
                         todo.priority === 'high' ? '高' :
                         todo.priority === 'medium' ? '中' :
                         '低'}
                      </span>
                      <span className="text-sm text-primary font-medium">
                        +{todo.exp_reward} EXP
                      </span>
                    </div>
                    {todo.description && (
                      <p className="text-gray-600 mt-2 ml-8">{todo.description}</p>
                    )}
                    {todo.due_date && (
                      <p className="text-sm text-gray-500 mt-1 ml-8">
                        截止日期: {new Date(todo.due_date).toLocaleDateString('zh-TW')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {todo.status !== 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(todo.id, 'in_progress')
                        }}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                      >
                        進行中
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTodo(todo.id)
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 詳細資訊彈窗 */}
      {showModal && selectedTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedTodo.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">描述</h3>
                  <p className="text-gray-600">
                    {selectedTodo.description || '沒有描述'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">狀態</h3>
                  <p className="text-gray-600">{selectedTodo.status}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">優先級</h3>
                  <p className="text-gray-600">{selectedTodo.priority}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">類型</h3>
                  <p className="text-gray-600">{selectedTodo.type}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">經驗值獎勵</h3>
                  <p className="text-gray-600">+{selectedTodo.exp_reward} EXP</p>
                </div>

                {selectedTodo.due_date && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">截止日期</h3>
                    <p className="text-gray-600">
                      {new Date(selectedTodo.due_date).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS 樣式 */}
      <style jsx global>{`
        .bg-primary {
          background-color: #c9a961;
        }
        
        .bg-primary-light {
          background-color: #e4c661;
        }
        
        .bg-primary-dark {
          background-color: #a88b4e;
        }
        
        .text-primary {
          color: #c9a961;
        }
        
        .border-primary {
          border-color: #c9a961;
        }
        
        .focus\\:ring-primary:focus {
          --tw-ring-color: #c9a961;
        }
        
        .hover\\:bg-primary-dark:hover {
          background-color: #a88b4e;
        }
      `}</style>
    </>
  )
}
