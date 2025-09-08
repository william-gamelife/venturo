export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          display_name: string | null
          role: string
          permissions: string[] | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          display_name?: string | null
          role?: string
          permissions?: string[] | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          display_name?: string | null
          role?: string
          permissions?: string[] | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string
          tags: string[] | null
          due_date: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
          assigned_to: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          tags?: string[] | null
          due_date?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          assigned_to?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          tags?: string[] | null
          due_date?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          assigned_to?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          setting_key: string
          setting_value: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          setting_key: string
          setting_value: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          setting_key?: string
          setting_value?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'GENERAL_USER' | 'PROJECT_MANAGER' | 'BUSINESS_ADMIN' | 'SUPER_ADMIN'
      todo_status: 'unorganized' | 'in-progress' | 'waiting' | 'project' | 'completed'
    }
  }
}