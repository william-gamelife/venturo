// 待辦事項服務 - Supabase 版本
import { supabase } from '@/lib/supabase/client';
import { Todo, TodoFilter, TodoStats } from '../types';

export class TodoService {
  // 取得當前使用者
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  async getAll(filter?: TodoFilter): Promise<Todo[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      let query = supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });

      // 應用過濾器
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      if (filter?.priority) {
        query = query.eq('priority', filter.priority);
      }
      if (filter?.category) {
        query = query.eq('category', filter.category);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch todos:', error);
        return [];
      }

      // 轉換資料格式以符合前端介面
      return (data || []).map(this.transformFromDB);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      return [];
    }
  }

  async create(todo: Partial<Todo>): Promise<Todo> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const newTodo = {
      user_id: userId,
      title: todo.title || '',
      description: todo.description || null,
      status: todo.status || 'pending',
      priority: todo.priority || 'medium',
      category: todo.category || 'general',
      tags: todo.tags || [],
      exp_reward: this.getExpReward(todo.priority || 'medium'),
      coin_reward: this.getCoinReward(todo.priority || 'medium'),
      difficulty: this.getDifficulty(todo.priority || 'medium'),
      position: 0,
      is_archived: false,
      metadata: {}
    };

    const { data, error } = await supabase
      .from('todos')
      .insert(newTodo)
      .select()
      .single();

    if (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }

    return this.transformFromDB(data);
  }

  async update(id: string, updates: Partial<Todo>): Promise<Todo> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // 只更新提供的欄位
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
      updateData.exp_reward = this.getExpReward(updates.priority);
      updateData.coin_reward = this.getCoinReward(updates.priority);
      updateData.difficulty = this.getDifficulty(updates.priority);
    }
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.progress !== undefined) updateData.position = updates.progress; // 暫時用 position 存 progress

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }

    return this.transformFromDB(data);
  }

  async delete(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    }
  }

  async complete(id: string): Promise<Todo> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // 先取得目前狀態
    const { data: currentTodo } = await supabase
      .from('todos')
      .select('status')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    // 切換狀態
    const newStatus = currentTodo?.status === 'completed' ? 'pending' : 'completed';
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.position = 100; // 暫時用 position 存 progress
    } else {
      updateData.completed_at = null;
      updateData.position = 0;
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to complete todo:', error);
      throw error;
    }

    // 如果完成任務，更新使用者經驗值
    if (newStatus === 'completed' && data) {
      await this.updateUserExp(userId, data.exp_reward || 10, data.coin_reward || 5);
    }

    return this.transformFromDB(data);
  }

  async getStats(): Promise<TodoStats> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        completionRate: 0,
        todaysDue: 0,
        overdue: 0
      };
    }

    const { data: todos } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (!todos) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        completionRate: 0,
        todaysDue: 0,
        overdue: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      total: todos.length,
      completed: todos.filter(t => t.status === 'completed').length,
      pending: todos.filter(t => t.status === 'pending').length,
      inProgress: todos.filter(t => t.status === 'in_progress').length,
      completionRate: todos.length ? 
        (todos.filter(t => t.status === 'completed').length / todos.length) * 100 : 0,
      todaysDue: todos.filter(t => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        return due >= today && due < tomorrow;
      }).length,
      overdue: todos.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < today;
      }).length
    };
  }

  // 更新使用者經驗值和金幣
  private async updateUserExp(userId: string, expReward: number, coinReward: number) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('experience, coins, level')
        .eq('id', userId)
        .single();

      if (profile) {
        const newExp = (profile.experience || 0) + expReward;
        const newCoins = (profile.coins || 0) + coinReward;
        const newLevel = Math.floor(Math.sqrt(newExp / 100)) + 1;

        await supabase
          .from('profiles')
          .update({
            experience: newExp,
            coins: newCoins,
            level: newLevel
          })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Failed to update user exp:', error);
    }
  }

  // 根據優先級計算經驗值獎勵
  private getExpReward(priority: string): number {
    switch (priority) {
      case 'urgent': return 30;
      case 'high': return 20;
      case 'medium': return 10;
      case 'low': return 5;
      default: return 10;
    }
  }

  // 根據優先級計算金幣獎勵
  private getCoinReward(priority: string): number {
    switch (priority) {
      case 'urgent': return 15;
      case 'high': return 10;
      case 'medium': return 5;
      case 'low': return 3;
      default: return 5;
    }
  }

  // 根據優先級決定難度
  private getDifficulty(priority: string): string {
    switch (priority) {
      case 'urgent': return 'legendary';
      case 'high': return 'hard';
      case 'medium': return 'normal';
      case 'low': return 'easy';
      default: return 'normal';
    }
  }

  // 轉換資料庫資料為前端格式
  private transformFromDB(dbTodo: any): Todo {
    return {
      id: dbTodo.id,
      title: dbTodo.title,
      description: dbTodo.description,
      status: dbTodo.status,
      priority: dbTodo.priority,
      category: dbTodo.category || 'general',
      tags: dbTodo.tags || [],
      dueDate: dbTodo.due_date,
      completedAt: dbTodo.completed_at,
      createdAt: dbTodo.created_at,
      updatedAt: dbTodo.updated_at,
      progress: dbTodo.position || 0, // 暫時用 position 存 progress
      assignedTo: dbTodo.user_id,
      projectId: dbTodo.project_id,
      parentId: dbTodo.parent_id
    };
  }
}

// 單例模式
let todoServiceInstance: TodoService | null = null;

export function getTodoService(): TodoService {
  if (!todoServiceInstance) {
    todoServiceInstance = new TodoService();
  }
  return todoServiceInstance;
}