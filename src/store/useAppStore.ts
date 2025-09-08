import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppState {
  // UI 狀態
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  
  // 全局 Loading
  globalLoading: boolean
  globalError: string | null
  
  // 通知
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: number
  }>
  
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setGlobalLoading: (loading: boolean) => void
  setGlobalError: (error: string | null) => void
  
  // 通知管理
  addNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      globalLoading: false,
      globalError: null,
      notifications: [],
      
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setTheme: (theme) => set({ theme }),
      setGlobalLoading: (globalLoading) => set({ globalLoading }),
      setGlobalError: (globalError) => set({ globalError }),
      
      addNotification: (type, message) => {
        const notification = {
          id: `notif_${Date.now()}`,
          type,
          message,
          timestamp: Date.now()
        }
        
        set(state => ({
          notifications: [...state.notifications, notification]
        }))
        
        // 自動移除通知（5秒後）
        setTimeout(() => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== notification.id)
          }))
        }, 5000)
      },
      
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },
      
      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'app-store' // DevTools 名稱
    }
  )
)