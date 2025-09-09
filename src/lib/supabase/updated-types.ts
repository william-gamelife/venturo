// 更新的 Supabase 類型定義
// 匹配 database/schema.sql 和 finance_schema.sql

export type Database = {
  public: {
    Tables: {
      // 使用者檔案 (擴展 auth.users)
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'corner' | 'user'
          level: number
          experience: number
          experience_lifetime: number
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'corner' | 'user'
          level?: number
          experience?: number
          experience_lifetime?: number
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'corner' | 'user'
          level?: number
          experience?: number
          experience_lifetime?: number
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      
      // 待辦事項
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          type: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier'
          related_id: string | null
          related_type: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier' | null
          due_date: string | null
          completed_at: string | null
          corner_data: any
          exp_reward: number
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          type?: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier'
          related_id?: string | null
          related_type?: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier' | null
          due_date?: string | null
          completed_at?: string | null
          corner_data?: any
          exp_reward?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          type?: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier'
          related_id?: string | null
          related_type?: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier' | null
          due_date?: string | null
          completed_at?: string | null
          corner_data?: any
          exp_reward?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      
      // 專案
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string | null
          end_date: string | null
          budget: number | null
          progress: number
          client_name: string | null
          client_contact: any
          parent_id: string | null
          metadata: any
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          progress?: number
          client_name?: string | null
          client_contact?: any
          parent_id?: string | null
          metadata?: any
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      
      // 團體管理 (角落模式)
      groups: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          name: string
          code: string | null
          description: string | null
          departure_date: string | null
          return_date: string | null
          member_count: number
          max_members: number | null
          contact_person: string | null
          contact_phone: string | null
          contact_email: string | null
          status: string
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          name: string
          code?: string | null
          description?: string | null
          departure_date?: string | null
          return_date?: string | null
          member_count?: number
          max_members?: number | null
          contact_person?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          status?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      
      // 訂單 (角落模式)
      orders: {
        Row: {
          id: string
          user_id: string
          group_id: string | null
          project_id: string | null
          order_number: string
          customer_name: string
          amount: number | null
          paid_amount: number
          status: string
          payment_status: string
          order_date: string
          due_date: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id?: string | null
          project_id?: string | null
          order_number: string
          customer_name: string
          amount?: number | null
          paid_amount?: number
          status?: string
          payment_status?: string
          order_date?: string
          due_date?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      
      // 經驗值記錄
      experience_logs: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string | null
          source_type: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier' | null
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason?: string | null
          source_type?: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier' | null
          source_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['experience_logs']['Insert']>
      }
      
      // === 財務管理模組 ===
      
      // 資產分類
      asset_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
          description: string | null
          icon: string | null
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
          description?: string | null
          icon?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['asset_categories']['Insert']>
      }
      
      // 個人資產
      assets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          name: string
          description: string | null
          type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
          account_number: string | null
          bank_name: string | null
          currency: string
          balance: number
          credit_limit: number | null
          available_credit: number | null
          cost_basis: number | null
          current_value: number | null
          is_active: boolean
          is_hidden: boolean
          auto_sync: boolean
          last_sync_at: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          name: string
          description?: string | null
          type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
          account_number?: string | null
          bank_name?: string | null
          currency?: string
          balance?: number
          credit_limit?: number | null
          available_credit?: number | null
          cost_basis?: number | null
          current_value?: number | null
          is_active?: boolean
          is_hidden?: boolean
          auto_sync?: boolean
          last_sync_at?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['assets']['Insert']>
      }
      
      // 預算分類
      budget_categories: {
        Row: {
          id: string
          user_id: string
          parent_id: string | null
          name: string
          description: string | null
          icon: string | null
          color: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          parent_id?: string | null
          name: string
          description?: string | null
          icon?: string | null
          color?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['budget_categories']['Insert']>
      }
      
      // 預算
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          name: string
          description: string | null
          period_start: string
          period_end: string
          planned_amount: number
          spent_amount: number
          remaining_amount: number
          target_savings: number | null
          achievement_level: number
          bonus_exp: number
          is_active: boolean
          is_recurring: boolean
          recurrence_pattern: string | null
          alert_threshold: number
          alert_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          name: string
          description?: string | null
          period_start: string
          period_end: string
          planned_amount: number
          spent_amount?: number
          target_savings?: number | null
          achievement_level?: number
          bonus_exp?: number
          is_active?: boolean
          is_recurring?: boolean
          recurrence_pattern?: string | null
          alert_threshold?: number
          alert_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>
      }
      
      // 收支交易
      transactions: {
        Row: {
          id: string
          user_id: string
          from_asset_id: string | null
          to_asset_id: string | null
          budget_category_id: string | null
          title: string
          description: string | null
          amount: number
          currency: string
          type: 'income' | 'expense' | 'transfer' | 'adjustment'
          transaction_date: string
          tags: string[]
          location: string | null
          receipt_url: string | null
          receipt_data: any
          advance_id: string | null
          reimbursement_id: string | null
          exp_earned: number
          achievement_unlocked: string[] | null
          is_verified: boolean
          is_recurring: boolean
          recurrence_pattern: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          from_asset_id?: string | null
          to_asset_id?: string | null
          budget_category_id?: string | null
          title: string
          description?: string | null
          amount: number
          currency?: string
          type: 'income' | 'expense' | 'transfer' | 'adjustment'
          transaction_date?: string
          tags?: string[]
          location?: string | null
          receipt_url?: string | null
          receipt_data?: any
          advance_id?: string | null
          reimbursement_id?: string | null
          exp_earned?: number
          achievement_unlocked?: string[] | null
          is_verified?: boolean
          is_recurring?: boolean
          recurrence_pattern?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      
      // 墊款
      advances: {
        Row: {
          id: string
          user_id: string
          requester_id: string
          approver_id: string | null
          title: string
          description: string | null
          amount: number
          currency: string
          purpose: string
          project_id: string | null
          expected_date: string | null
          status: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
          requested_at: string
          approved_at: string | null
          disbursed_at: string | null
          due_date: string | null
          reimbursed_amount: number
          outstanding_amount: number
          documents: any
          approval_notes: string | null
          corner_reference_id: string | null
          corner_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          requester_id: string
          approver_id?: string | null
          title: string
          description?: string | null
          amount: number
          currency?: string
          purpose: string
          project_id?: string | null
          expected_date?: string | null
          status?: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
          requested_at?: string
          approved_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          reimbursed_amount?: number
          documents?: any
          approval_notes?: string | null
          corner_reference_id?: string | null
          corner_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['advances']['Insert']>
      }
      
      // 核銷
      reimbursements: {
        Row: {
          id: string
          user_id: string
          advance_id: string | null
          title: string
          description: string | null
          total_amount: number
          status: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
          submitted_at: string
          approved_at: string | null
          processed_at: string | null
          receipts: any
          documents: any
          notes: string | null
          approval_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          advance_id?: string | null
          title: string
          description?: string | null
          total_amount: number
          status?: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
          submitted_at?: string
          approved_at?: string | null
          processed_at?: string | null
          receipts?: any
          documents?: any
          notes?: string | null
          approval_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['reimbursements']['Insert']>
      }
      
      // 財務目標
      financial_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_amount: number
          current_amount: number
          start_date: string
          target_date: string | null
          difficulty_level: number
          reward_exp: number
          milestone_rewards: any
          is_active: boolean
          is_achieved: boolean
          achieved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_amount: number
          current_amount?: number
          start_date?: string
          target_date?: string | null
          difficulty_level?: number
          reward_exp?: number
          milestone_rewards?: any
          is_active?: boolean
          is_achieved?: boolean
          achieved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['financial_goals']['Insert']>
      }
    }
    Views: {
      // 使用者統計
      user_stats: {
        Row: {
          id: string
          username: string | null
          level: number
          experience: number
          completed_tasks: number
          pending_tasks: number
          total_projects: number
          total_revenue: number | null
        }
      }
      // 財務總覽
      financial_overview: {
        Row: {
          id: string
          username: string | null
          total_cash: number
          total_bank: number
          total_investment: number
          total_assets: number
          monthly_budget: number
          monthly_spent: number
          monthly_income: number
          monthly_expense: number
        }
      }
    }
    Functions: {
      check_level_up: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'admin' | 'corner' | 'user'
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      priority_level: 'low' | 'medium' | 'high' | 'urgent'
      task_type: 'task' | 'project' | 'invoice' | 'receipt' | 'order' | 'quote' | 'itinerary' | 'group' | 'visa' | 'cashier'
      asset_type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
      transaction_type: 'income' | 'expense' | 'transfer' | 'adjustment'
      advance_status: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
    }
  }
}

// 便利的類型別名
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Todo = Database['public']['Tables']['todos']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Asset = Database['public']['Tables']['assets']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type Advance = Database['public']['Tables']['advances']['Row']
export type Reimbursement = Database['public']['Tables']['reimbursements']['Row']

// 插入類型
export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertTodo = Database['public']['Tables']['todos']['Insert']
export type InsertTransaction = Database['public']['Tables']['transactions']['Insert']

// 更新類型
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateTodo = Database['public']['Tables']['todos']['Update']
export type UpdateTransaction = Database['public']['Tables']['transactions']['Update']