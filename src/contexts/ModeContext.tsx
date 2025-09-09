'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Mode = 'game' | 'corner'

interface ModeContextType {
  currentMode: Mode
  setCurrentMode: (mode: Mode) => void
  toggleMode: () => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

interface ModeProviderProps {
  children: ReactNode
}

export function ModeProvider({ children }: ModeProviderProps) {
  const [currentMode, setCurrentMode] = useState<Mode>('game')

  // 初始化時載入用戶的模式偏好
  useEffect(() => {
    const loadUserMode = async () => {
      try {
        // 使用 checkAuth 獲取當前用戶
        const { checkAuth } = await import('@/lib/auth-utils')
        const { user } = await checkAuth()
        if (user) {
          const savedMode = localStorage.getItem(`gamelife_mode_${user.id}`)
          console.log('ModeContext 載入模式:', savedMode, 'User ID:', user.id) // Debug
          if (savedMode === 'corner' || savedMode === 'game') {
            setCurrentMode(savedMode)
            console.log('ModeContext 設定模式為:', savedMode) // Debug
          }
        }
      } catch (error) {
        console.error('載入模式偏好失敗:', error)
      }
    }

    loadUserMode()
  }, [])

  const toggleMode = async () => {
    const newMode = currentMode === 'game' ? 'corner' : 'game'
    setCurrentMode(newMode)
    
    // 保存到 localStorage
    try {
      const { checkAuth } = await import('@/lib/auth-utils')
      const { user } = await checkAuth()
      if (user) {
        localStorage.setItem(`gamelife_mode_${user.id}`, newMode)
        console.log('模式切換至:', newMode, 'User ID:', user.id) // Debug
        
        // 觸發自定義事件讓其他組件知道模式已改變
        window.dispatchEvent(new CustomEvent('modeChanged', { detail: newMode }))
      }
    } catch (error) {
      console.error('保存模式偏好失敗:', error)
    }
  }

  return (
    <ModeContext.Provider value={{
      currentMode,
      setCurrentMode,
      toggleMode
    }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}