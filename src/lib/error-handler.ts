import { ApiResponse } from '@/lib/base-api'

export class ErrorHandler {
  static handle(error: any, module?: string): ApiResponse {
    const timestamp = new Date().toISOString()
    const errorMessage = error?.message || error || '操作失敗'
    
    // 開發環境輸出詳細錯誤
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 [${module || 'System'}] Error - ${timestamp}`)
      console.error('Error object:', error)
      console.error('Stack trace:', error?.stack)
      console.groupEnd()
    } else {
      // 生產環境只輸出簡化資訊
      console.error(`[${module || 'System'}] ${errorMessage}`)
    }
    
    return {
      success: false,
      error: this.formatUserError(errorMessage),
      code: error?.code || 'UNKNOWN_ERROR'
    }
  }
  
  static async wrap<T>(
    fn: () => Promise<T>,
    module?: string
  ): Promise<ApiResponse<T>> {
    try {
      const result = await fn()
      return { success: true, data: result }
    } catch (error) {
      return this.handle(error, module)
    }
  }
  
  static formatUserError(error: string): string {
    // 將技術錯誤轉換為用戶友好的訊息
    const errorMap: Record<string, string> = {
      'Failed to fetch': '網路連線問題，請稍後再試',
      'Network error': '網路錯誤，請檢查連線',
      'Unauthorized': '權限不足',
      'Forbidden': '存取被拒絕',
      'Not found': '找不到指定資源',
      'Internal server error': '系統錯誤，請稍後再試',
      'Bad request': '請求格式錯誤',
      'Timeout': '請求超時，請稍後再試'
    }
    
    for (const [technical, friendly] of Object.entries(errorMap)) {
      if (error.toLowerCase().includes(technical.toLowerCase())) {
        return friendly
      }
    }
    
    return error
  }
  
  // 特殊錯誤類型處理
  static validation(errors: string[], module?: string): ApiResponse {
    console.warn(`[${module || 'Validation'}] Validation failed:`, errors)
    
    return {
      success: false,
      error: errors.join('；'),
      code: 'VALIDATION_ERROR'
    }
  }
  
  static network(error: any, module?: string): ApiResponse {
    console.error(`[${module || 'Network'}] Network error:`, error)
    
    return {
      success: false,
      error: '網路連線問題，請檢查網路後重試',
      code: 'NETWORK_ERROR'
    }
  }
  
  static storage(error: any, module?: string): ApiResponse {
    console.error(`[${module || 'Storage'}] Storage error:`, error)
    
    return {
      success: false,
      error: '資料儲存錯誤，請稍後再試',
      code: 'STORAGE_ERROR'
    }
  }
  
  // 錯誤統計（開發用）
  private static errorStats = new Map<string, number>()
  
  static logErrorStats() {
    if (process.env.NODE_ENV !== 'development') return
    
    console.group('📊 Error Statistics')
    this.errorStats.forEach((count, error) => {
      console.log(`${error}: ${count} times`)
    })
    console.groupEnd()
  }
  
  private static trackError(error: string) {
    if (process.env.NODE_ENV !== 'development') return
    
    const current = this.errorStats.get(error) || 0
    this.errorStats.set(error, current + 1)
  }
}