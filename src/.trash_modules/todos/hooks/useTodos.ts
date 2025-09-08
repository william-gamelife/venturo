// useTodos Hook - 管理待辦事項狀態
import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoFilter, TodoStats } from '../types';
import { getTodoService } from '../services/TodoService';

export function useTodos(initialFilter?: TodoFilter) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>(initialFilter || {});
  const [stats, setStats] = useState<TodoStats | null>(null);

  const todoService = getTodoService();

  // 載入待辦事項
  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await todoService.getAll(filter);
      setTodos(data);
      
      // 同時載入統計資料
      const statsData = await todoService.getStats();
      setStats(statsData);
    } catch (err) {
      setError('Failed to load todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // 創建待辦事項
  const createTodo = async (todo: Partial<Todo>) => {
    try {
      const newTodo = await todoService.create(todo);
      setTodos(prev => [...prev, newTodo]);
      await loadTodos(); // 重新載入以更新統計
      return newTodo;
    } catch (err) {
      setError('Failed to create todo');
      throw err;
    }
  };

  // 更新待辦事項
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updated = await todoService.update(id, updates);
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
      await loadTodos(); // 重新載入以更新統計
      return updated;
    } catch (err) {
      setError('Failed to update todo');
      throw err;
    }
  };

  // 刪除待辦事項
  const deleteTodo = async (id: string) => {
    try {
      await todoService.delete(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      await loadTodos(); // 重新載入以更新統計
    } catch (err) {
      setError('Failed to delete todo');
      throw err;
    }
  };

  // 完成待辦事項
  const completeTodo = async (id: string) => {
    try {
      const completed = await todoService.complete(id);
      setTodos(prev => prev.map(t => t.id === id ? completed : t));
      await loadTodos(); // 重新載入以更新統計
      return completed;
    } catch (err) {
      setError('Failed to complete todo');
      throw err;
    }
  };

  // 批量操作
  const batchComplete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => completeTodo(id)));
      await loadTodos();
    } catch (err) {
      setError('Failed to complete todos');
      throw err;
    }
  };

  const batchDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteTodo(id)));
      await loadTodos();
    } catch (err) {
      setError('Failed to delete todos');
      throw err;
    }
  };

  // 初始載入
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return {
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
    batchComplete,
    batchDelete,
    refresh: loadTodos
  };
}