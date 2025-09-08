export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          role: 'admin' | 'user'
          level: number
          experience: number
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['todos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['todos']['Insert']>
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description?: string
          status: string
          priority?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      // 財務管理相關表
      asset_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
          description?: string
          icon?: string
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['asset_categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['asset_categories']['Insert']>
      }
      assets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          name: string
          description?: string
          type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
          account_number?: string
          bank_name?: string
          currency: string
          balance: number
          credit_limit?: number
          available_credit?: number
          cost_basis?: number
          current_value?: number
          is_active: boolean
          is_hidden: boolean
          auto_sync: boolean
          last_sync_at?: string
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['assets']['Insert']>
      }
      budget_categories: {
        Row: {
          id: string
          user_id: string
          parent_id?: string
          name: string
          description?: string
          icon?: string
          color: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['budget_categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['budget_categories']['Insert']>
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          name: string
          description?: string
          period_start: string
          period_end: string
          planned_amount: number
          spent_amount: number
          remaining_amount: number
          target_savings?: number
          achievement_level: number
          bonus_exp: number
          is_active: boolean
          is_recurring: boolean
          recurrence_pattern?: string
          alert_threshold: number
          alert_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'id' | 'remaining_amount' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          from_asset_id?: string
          to_asset_id?: string
          budget_category_id?: string
          title: string
          description?: string
          amount: number
          currency: string
          type: 'income' | 'expense' | 'transfer' | 'adjustment'
          transaction_date: string
          tags: string[]
          location?: string
          receipt_url?: string
          receipt_data: any
          advance_id?: string
          reimbursement_id?: string
          exp_earned: number
          achievement_unlocked: string[]
          is_verified: boolean
          is_recurring: boolean
          recurrence_pattern?: string
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      advances: {
        Row: {
          id: string
          user_id: string
          requester_id: string
          approver_id?: string
          title: string
          description?: string
          amount: number
          currency: string
          purpose: string
          project_id?: string
          expected_date?: string
          status: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
          requested_at: string
          approved_at?: string
          disbursed_at?: string
          due_date?: string
          reimbursed_amount: number
          outstanding_amount: number
          documents: any
          approval_notes?: string
          corner_reference_id?: string
          corner_sync_at?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['advances']['Row'], 'id' | 'outstanding_amount' | 'requested_at' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['advances']['Insert']>
      }
      reimbursements: {
        Row: {
          id: string
          user_id: string
          advance_id?: string
          title: string
          description?: string
          total_amount: number
          status: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
          submitted_at: string
          approved_at?: string
          processed_at?: string
          receipts: any
          documents: any
          notes?: string
          approval_notes?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reimbursements']['Row'], 'id' | 'submitted_at' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reimbursements']['Insert']>
      }
      financial_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          target_amount: number
          current_amount: number
          start_date: string
          target_date?: string
          difficulty_level: number
          reward_exp: number
          milestone_rewards: any
          is_active: boolean
          is_achieved: boolean
          achieved_at?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['financial_goals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['financial_goals']['Insert']>
      }
    }
    Views: {
      financial_overview: {
        Row: {
          id: string
          username: string
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
    Enums: {
      asset_type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
      transaction_type: 'income' | 'expense' | 'transfer' | 'adjustment'
      advance_status: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
    }
  }
}