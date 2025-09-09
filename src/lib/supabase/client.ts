// 暫時的 Supabase 客戶端，避免建置錯誤
export const supabase = {
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: (data: any) => ({ data: null, error: null }),
    update: (data: any) => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null })
  }),
  
  auth: {
    getUser: () => ({ data: { user: null }, error: null }),
    signOut: () => ({ error: null })
  }
};