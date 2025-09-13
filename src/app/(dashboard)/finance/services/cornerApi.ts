/**
 * 角落API服務
 * 用於與角落ERP系統對接，處理墊款、核銷等財務流程
 */

interface CornerApiConfig {
  baseUrl: string
  apiKey: string
  version: string
}

interface AdvanceRequest {
  title: string
  amount: number
  purpose: string
  requesterId: string
  projectId?: string
  expectedDate?: string
  documents?: string[]
}

interface AdvanceResponse {
  id: string
  referenceId: string
  status: 'pending' | 'approved' | 'rejected'
  approvedAmount?: number
  approvedAt?: string
  message?: string
}

interface ReimbursementRequest {
  advanceId: string
  amount: number
  receipts: string[]
  description?: string
  notes?: string
}

interface ReimbursementResponse {
  id: string
  status: 'submitted' | 'approved' | 'processed' | 'rejected'
  processedAt?: string
  message?: string
}

export class CornerApiService {
  private config: CornerApiConfig
  private baseHeaders: Record<string, string>

  constructor() {
    this.config = {
      baseUrl: process.env.CORNER_API_BASE_URL || 'https://api.corner.example.com',
      apiKey: process.env.CORNER_API_KEY || '',
      version: process.env.CORNER_API_VERSION || 'v1'
    }

    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-API-Version': this.config.version
    }
  }

  /**
   * 提交墊款申請到角落系統
   */
  async submitAdvanceRequest(request: AdvanceRequest): Promise<AdvanceResponse> {
    try {
      // 模擬API調用 - 在實際環境中會替換為真實API
      console.log('🔄 向角落系統提交墊款申請:', request)
      
      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模擬響應
      const mockResponse: AdvanceResponse = {
        id: `corner_advance_${Date.now()}`,
        referenceId: `ADV-${Date.now().toString().slice(-6)}`,
        status: 'pending',
        message: '墊款申請已提交至角落系統，等待審核'
      }

      console.log('✅ 角落系統回應:', mockResponse)
      return mockResponse

    } catch (error) {
      console.error('❌ 墊款申請提交失敗:', error)
      throw new Error('無法連接到角落系統，請稍後再試')
    }
  }

  /**
   * 查詢墊款狀態
   */
  async getAdvanceStatus(cornerReferenceId: string): Promise<AdvanceResponse> {
    try {
      console.log('🔍 查詢墊款狀態:', cornerReferenceId)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模擬不同狀態
      const statuses: Array<AdvanceResponse['status']> = ['pending', 'approved', 'rejected']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      const mockResponse: AdvanceResponse = {
        id: cornerReferenceId,
        referenceId: cornerReferenceId,
        status: randomStatus,
        approvedAmount: randomStatus === 'approved' ? 5000 : undefined,
        approvedAt: randomStatus === 'approved' ? new Date().toISOString() : undefined,
        message: this.getStatusMessage(randomStatus)
      }

      return mockResponse

    } catch (error) {
      console.error('❌ 查詢墊款狀態失敗:', error)
      throw new Error('無法查詢墊款狀態')
    }
  }

  /**
   * 提交核銷申請
   */
  async submitReimbursement(request: ReimbursementRequest): Promise<ReimbursementResponse> {
    try {
      console.log('🧾 提交核銷申請:', request)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockResponse: ReimbursementResponse = {
        id: `corner_reimb_${Date.now()}`,
        status: 'submitted',
        message: '核銷申請已提交至角落系統'
      }

      console.log('✅ 核銷提交成功:', mockResponse)
      return mockResponse

    } catch (error) {
      console.error('❌ 核銷提交失敗:', error)
      throw new Error('無法提交核銷申請')
    }
  }

  /**
   * 同步財務資料
   */
  async syncFinancialData(userId: string): Promise<any> {
    try {
      console.log('🔄 同步財務資料:', userId)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模擬同步結果
      const mockSyncResult = {
        advances: {
          synced: 5,
          updated: 2,
          new: 1
        },
        reimbursements: {
          synced: 3,
          updated: 1,
          new: 0
        },
        lastSyncAt: new Date().toISOString(),
        status: 'success'
      }

      console.log('✅ 財務資料同步完成:', mockSyncResult)
      return mockSyncResult

    } catch (error) {
      console.error('❌ 財務資料同步失敗:', error)
      throw new Error('無法同步財務資料')
    }
  }

  /**
   * 獲取用戶權限
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      console.log('👤 查詢用戶權限:', userId)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 模擬權限檢查
      const mockPermissions = [
        'advance.create',
        'advance.view',
        'reimbursement.create',
        'reimbursement.view',
        'finance.report.view'
      ]

      return mockPermissions

    } catch (error) {
      console.error('❌ 查詢用戶權限失敗:', error)
      throw new Error('無法查詢用戶權限')
    }
  }

  /**
   * 上傳文件到角落系統
   */
  async uploadDocument(file: File, type: 'receipt' | 'document' | 'approval'): Promise<string> {
    try {
      console.log('📎 上傳文件:', file.name, type)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模擬文件上傳
      const mockFileUrl = `https://corner-storage.example.com/files/${Date.now()}_${file.name}`
      
      console.log('✅ 文件上傳成功:', mockFileUrl)
      return mockFileUrl

    } catch (error) {
      console.error('❌ 文件上傳失敗:', error)
      throw new Error('文件上傳失敗')
    }
  }

  /**
   * 獲取狀態消息
   */
  private getStatusMessage(status: string): string {
    switch (status) {
      case 'pending':
        return '申請已提交，等待主管審核'
      case 'approved':
        return '申請已核准，可以進行核銷'
      case 'rejected':
        return '申請被拒絕，請查看拒絕原因'
      default:
        return '狀態未知'
    }
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 檢查角落系統連接狀態')
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 模擬健康檢查
      const isHealthy = Math.random() > 0.1 // 90% 成功率
      
      if (isHealthy) {
        console.log('✅ 角落系統連接正常')
      } else {
        console.log('⚠️ 角落系統連接異常')
      }
      
      return isHealthy

    } catch (error) {
      console.error('❌ 角落系統健康檢查失敗:', error)
      return false
    }
  }

  /**
   * 獲取系統配置
   */
  getConfig(): Partial<CornerApiConfig> {
    return {
      baseUrl: this.config.baseUrl,
      version: this.config.version
      // 不返回 apiKey 以確保安全性
    }
  }
}

// 創建單例實例
export const cornerApiService = new CornerApiService()

// 輔助函數
export const formatCornerAmount = (amount: number): string => {
  return `NT$ ${amount.toLocaleString()}`
}

export const getAdvanceStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#F59E0B'
    case 'approved': return '#10B981'
    case 'rejected': return '#EF4444'
    default: return '#6B7280'
  }
}

export const getAdvanceStatusText = (status: string): string => {
  switch (status) {
    case 'pending': return '待審核'
    case 'approved': return '已核准'
    case 'rejected': return '已拒絕'
    default: return '未知狀態'
  }
}