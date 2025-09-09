// 伺服器端數據庫模組
export class ServerDB {
  static async get(collection: string, id?: string) {
    // 獲取數據邏輯
    return { success: true, data: [] }
  }

  static async post(collection: string, data: any) {
    // 創建數據邏輯
    return { success: true, data }
  }

  static async put(collection: string, id: string, data: any) {
    // 更新數據邏輯
    return { success: true, data }
  }

  static async delete(collection: string, id: string) {
    // 刪除數據邏輯
    return { success: true }
  }
}