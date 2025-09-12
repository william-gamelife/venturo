// 通用 CRUD API 基礎類別
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface BaseModel {
  id: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export class BaseApi<T extends BaseModel> {
  constructor(protected tableName: string) {}

  async getAll(): Promise<ApiResponse<T[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data: data as T[] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '獲取資料失敗' }
    }
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { data: data as T }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '獲取資料失敗' }
    }
  }

  async create(input: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(input)
        .select()
        .single()
      
      if (error) throw error
      return { data: data as T }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '建立失敗' }
    }
  }

  async update(id: string, input: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(input)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data: data as T }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '更新失敗' }
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { data: undefined }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '刪除失敗' }
    }
  }

  async search(query: string, fields: string[] = ['id']): Promise<ApiResponse<T[]>> {
    try {
      let searchQuery = supabase.from(this.tableName).select('*')
      
      // 對每個欄位進行搜尋
      const orConditions = fields.map(field => `${field}.ilike.%${query}%`).join(',')
      searchQuery = searchQuery.or(orConditions)
      
      const { data, error } = await searchQuery.order('created_at', { ascending: false })
      
      if (error) throw error
      return { data: data as T[] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '搜尋失敗' }
    }
  }
}