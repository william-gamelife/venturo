// 統一的資料服務管理器
import { TodoService } from '@/modules/todos/services/TodoService';

export class DataService {
  private static instance: DataService;
  
  // 服務實例
  public todos: TodoService;
  
  private constructor() {
    this.todos = new TodoService();
  }
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }
  
  // 通用方法
  async backup(): Promise<void> {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST'
      });
      return response.json();
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }
  
  async export(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    try {
      const response = await fetch(`/api/export?format=${format}`);
      return response.blob();
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
  
  async import(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }
}

// 匯出單例
export const dataService = DataService.getInstance();