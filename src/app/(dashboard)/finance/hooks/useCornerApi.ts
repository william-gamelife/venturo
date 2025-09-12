'use client'

import { useState, useCallback, useEffect } from 'react'
import { cornerApiService } from '../services/cornerApi'

interface UseCornerApiState {
  isLoading: boolean
  error: string | null
  isConnected: boolean
  lastSyncAt: Date | null
}

export function useCornerApi() {
  const [state, setState] = useState<UseCornerApiState>({
    isLoading: false,
    error: null,
    isConnected: false,
    lastSyncAt: null
  })

  // 檢查連接狀態
  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const isHealthy = await cornerApiService.healthCheck()
      setState(prev => ({
        ...prev,
        isConnected: isHealthy,
        error: isHealthy ? null : '角落系統連接異常',
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error.message : '連接檢查失敗',
        isLoading: false
      }))
    }
  }, [])

  // 提交墊款申請
  const submitAdvance = useCallback(async (advanceData: {
    title: string
    amount: number
    purpose: string
    requesterId: string
    projectId?: string
    expectedDate?: string
    documents?: string[]
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await cornerApiService.submitAdvanceRequest(advanceData)
      setState(prev => ({ ...prev, isLoading: false }))
      
      // 顯示成功消息（可以用 toast 或其他方式）
      console.log('🎉 墊款申請提交成功:', response.referenceId)
      
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提交失敗'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // 查詢墊款狀態
  const getAdvanceStatus = useCallback(async (referenceId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await cornerApiService.getAdvanceStatus(referenceId)
      setState(prev => ({ ...prev, isLoading: false }))
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '查詢失敗'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // 提交核銷申請
  const submitReimbursement = useCallback(async (reimbursementData: {
    advanceId: string
    amount: number
    receipts: string[]
    description?: string
    notes?: string
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await cornerApiService.submitReimbursement(reimbursementData)
      setState(prev => ({ ...prev, isLoading: false }))
      
      console.log('🎉 核銷申請提交成功:', response.id)
      
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '核銷提交失敗'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // 同步財務資料
  const syncFinancialData = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await cornerApiService.syncFinancialData(userId)
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncAt: new Date()
      }))
      
      console.log('🔄 財務資料同步完成:', result)
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '同步失敗'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // 上傳文件
  const uploadDocument = useCallback(async (
    file: File, 
    type: 'receipt' | 'document' | 'approval'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const fileUrl = await cornerApiService.uploadDocument(file, type)
      setState(prev => ({ ...prev, isLoading: false }))
      
      console.log('📎 文件上傳成功:', fileUrl)
      
      return fileUrl
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '文件上傳失敗'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // 獲取用戶權限
  const getUserPermissions = useCallback(async (userId: string) => {
    try {
      const permissions = await cornerApiService.getUserPermissions(userId)
      return permissions
    } catch (error) {
      console.error('獲取用戶權限失敗:', error)
      return []
    }
  }, [])

  // 清除錯誤
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // 獲取API配置
  const getApiConfig = useCallback(() => {
    return cornerApiService.getConfig()
  }, [])

  // 初始化時檢查連接
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return {
    // 狀態
    ...state,
    
    // 方法
    checkConnection,
    submitAdvance,
    getAdvanceStatus,
    submitReimbursement,
    syncFinancialData,
    uploadDocument,
    getUserPermissions,
    clearError,
    getApiConfig,
    
    // 輔助方法
    retry: checkConnection
  }
}

// 輔助 Hook：檢查是否有特定權限
export function useCornerPermission(userId: string, permission: string) {
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)
  const { getUserPermissions } = useCornerApi()

  useEffect(() => {
    const checkPermission = async () => {
      setIsChecking(true)
      try {
        const permissions = await getUserPermissions(userId)
        setHasPermission(permissions.includes(permission))
      } catch (error) {
        console.error('權限檢查失敗:', error)
        setHasPermission(false)
      } finally {
        setIsChecking(false)
      }
    }

    if (userId) {
      checkPermission()
    }
  }, [userId, permission, getUserPermissions])

  return { hasPermission, isChecking }
}

// 輔助 Hook：自動同步
export function useCornerAutoSync(userId: string, interval: number = 5 * 60 * 1000) { // 預設5分鐘
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false)
  const { syncFinancialData, isConnected } = useCornerApi()

  useEffect(() => {
    if (!userId || !isConnected) return

    setIsAutoSyncing(true)
    
    const syncInterval = setInterval(async () => {
      try {
        console.log('🔄 自動同步財務資料')
        await syncFinancialData(userId)
      } catch (error) {
        console.error('自動同步失敗:', error)
      }
    }, interval)

    return () => {
      clearInterval(syncInterval)
      setIsAutoSyncing(false)
    }
  }, [userId, isConnected, interval, syncFinancialData])

  return { isAutoSyncing }
}