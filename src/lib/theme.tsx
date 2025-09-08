'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'morandi' | 'wolf' | 'cosmic'

export interface ThemeConfig {
  name: string
  displayName: string
  description: string
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    secondary: string
    accent: string
    background: string
    backgroundDark: string
    backgroundGradient: string
    card: string
    text: string
    textLight: string
    textMuted: string
    border: string
    shadow: string
    shadowLg: string
  }
  gradients: {
    main: string
    card: string
    text: string
  }
}

export const themes: Record<Theme, ThemeConfig> = {
  // 預設主題（枯山水風格）
  morandi: {
    name: 'morandi',
    displayName: 'Default',
    description: '枯山水主題，金棕色系配和紙質感',
    colors: {
      primary: '#c9a961',
      primaryLight: '#e4c661', 
      primaryDark: '#b8954d',
      secondary: '#7a8b74',
      accent: '#7a8b74',
      background: '#f4f1eb',
      backgroundDark: '#e8e2d5',
      backgroundGradient: '#f4f1eb',
      card: 'rgba(255, 255, 255, 0.85)',
      text: '#3a3833',
      textLight: '#6d685f',
      textMuted: '#9b9588',
      border: 'rgba(201, 169, 97, 0.2)',
      shadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
      shadowLg: '0 20px 60px rgba(0, 0, 0, 0.12)'
    },
    gradients: {
      main: '#c9a961',
      card: 'rgba(255, 255, 255, 0.85)',
      text: '#c9a961'
    }
  },

  // 深色主題
  wolf: {
    name: 'wolf',
    displayName: 'Dark',
    description: '深色主題，護眼模式',
    colors: {
      primary: '#c9a961',
      primaryLight: '#e4c661',
      primaryDark: '#b8954d', 
      secondary: '#7a8b74',
      accent: '#7a8b74',
      background: '#1a1d1d',
      backgroundDark: '#151717',
      backgroundGradient: '#1a1d1d',
      card: 'rgba(42, 47, 47, 0.85)',
      text: '#e8e8e8',
      textLight: '#cccccc',
      textMuted: '#999999',
      border: 'rgba(201, 169, 97, 0.2)',
      shadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 20px 60px rgba(0, 0, 0, 0.6)'
    },
    gradients: {
      main: '#c9a961',
      card: 'rgba(42, 47, 47, 0.85)',
      text: '#c9a961'
    }
  },

  // 科技主題
  cosmic: {
    name: 'cosmic', 
    displayName: 'Blue',
    description: '藍色科技主題',
    colors: {
      primary: '#0099cc',
      primaryLight: '#00d4ff',
      primaryDark: '#0066aa',
      secondary: '#7a8b74', 
      accent: '#0099cc',
      background: '#f4f1eb',
      backgroundDark: '#e8e2d5',
      backgroundGradient: '#f4f1eb',
      card: 'rgba(255, 255, 255, 0.85)',
      text: '#3a3833',
      textLight: '#6d685f', 
      textMuted: '#9b9588',
      border: 'rgba(0, 153, 204, 0.2)',
      shadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
      shadowLg: '0 20px 60px rgba(0, 0, 0, 0.12)'
    },
    gradients: {
      main: '#0099cc',
      card: 'rgba(255, 255, 255, 0.85)',
      text: '#0099cc'
    }
  }
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themeConfig: ThemeConfig
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('morandi')

  useEffect(() => {
    // 從 localStorage 讀取主題設定
    const savedTheme = localStorage.getItem('gamelife_theme') as Theme
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // 保存主題設定
    localStorage.setItem('gamelife_theme', theme)
    
    // 應用 CSS 變數到 document
    const themeConfig = themes[theme]
    const root = document.documentElement
    
    // 設置 CSS 自訂屬性
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // 設置漸層
    Object.entries(themeConfig.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value)
    })
    
    // 設置 body 背景
    document.body.style.background = themeConfig.colors.backgroundGradient
    
    // 切換 dark mode class
    if (theme === 'wolf') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const value: ThemeContextType = {
    theme,
    setTheme,
    themeConfig: themes[theme]
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}