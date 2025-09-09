// 暫時的資料庫管理器，避免建置錯誤
export const dbManager = {
  getHealthStatus: async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  },
  
  executeQuery: async (query: string) => {
    console.log('執行查詢:', query);
    return { data: [], error: null };
  },
  
  getTableInfo: async (tableName: string) => {
    return { columns: [], rows: 0 };
  }
};