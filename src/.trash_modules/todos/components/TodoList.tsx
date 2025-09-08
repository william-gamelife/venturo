'use client';

import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { Todo } from '../types';
import { Plus, Filter, Search, RefreshCw } from 'lucide-react';

export function TodoList() {
  const {
    todos,
    loading,
    error,
    stats,
    filter,
    setFilter,
    createTodo,
    updateTodo,
    deleteTodo,
    completeTodo,
    refresh
  } = useTodos();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as Todo['priority'],
    category: 'general'
  });

  const handleCreate = async () => {
    if (!newTodo.title.trim()) return;
    
    await createTodo(newTodo);
    setNewTodo({
      title: '',
      description: '',
      priority: 'medium',
      category: 'general'
    });
    setShowCreateForm(false);
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 border-red-500';
      case 'high': return 'text-orange-500 border-orange-500';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      case 'low': return 'text-green-500 border-green-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const getStatusBadge = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">完成</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">進行中</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">待處理</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">已取消</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計資訊 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <p className="text-sm text-purple-200">總任務</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <p className="text-sm text-purple-200">已完成</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <p className="text-sm text-purple-200">進行中</p>
            <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <p className="text-sm text-purple-200">完成率</p>
            <p className="text-2xl font-bold text-white">{stats.completionRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* 工具列 */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            新增任務
          </button>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            <RefreshCw size={20} />
            重新整理
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={filter.status || 'all'}
            onChange={(e) => setFilter({ ...filter, status: e.target.value === 'all' ? undefined : e.target.value as Todo['status'] })}
            className="px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none focus:border-purple-400"
          >
            <option value="all">全部狀態</option>
            <option value="pending">待處理</option>
            <option value="in_progress">進行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>

          <select
            value={filter.priority || 'all'}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value === 'all' ? undefined : e.target.value as Todo['priority'] })}
            className="px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none focus:border-purple-400"
          >
            <option value="all">全部優先級</option>
            <option value="urgent">緊急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>

      {/* 新增任務表單 */}
      {showCreateForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">新增任務</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="任務標題"
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 placeholder-white/50 focus:outline-none focus:border-purple-400"
            />
            <textarea
              placeholder="任務描述（選填）"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 placeholder-white/50 focus:outline-none focus:border-purple-400"
              rows={3}
            />
            <div className="flex gap-4">
              <select
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Todo['priority'] })}
                className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none focus:border-purple-400"
              >
                <option value="urgent">緊急</option>
                <option value="high">高優先級</option>
                <option value="medium">中優先級</option>
                <option value="low">低優先級</option>
              </select>
              <input
                type="text"
                placeholder="分類"
                value={newTodo.category}
                onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 placeholder-white/50 focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                建立任務
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 任務列表 */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">暫無任務</p>
            <p className="text-white/40 text-sm mt-2">點擊「新增任務」開始建立你的第一個任務</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.status === 'completed'}
                      onChange={() => completeTodo(todo.id)}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-purple-600"
                    />
                    <h4 className={`text-lg font-medium ${todo.status === 'completed' ? 'line-through text-white/50' : 'text-white'}`}>
                      {todo.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs border rounded-full ${getPriorityColor(todo.priority)}`}>
                      {todo.priority}
                    </span>
                    {getStatusBadge(todo.status)}
                  </div>
                  {todo.description && (
                    <p className="text-white/60 text-sm mt-2 ml-8">{todo.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 ml-8 text-sm text-white/40">
                    <span>分類: {todo.category}</span>
                    {todo.dueDate && (
                      <span>截止: {new Date(todo.dueDate).toLocaleDateString()}</span>
                    )}
                    {todo.progress > 0 && todo.progress < 100 && (
                      <span>進度: {todo.progress}%</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  刪除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}