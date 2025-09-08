'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme, themes, Theme } from '@/lib/theme'

interface ThemeSwitcherProps {
  className?: string
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { theme, setTheme, themeConfig } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  const getThemeIcon = (themeName: Theme) => {
    switch (themeName) {
      case 'morandi': return 'M'
      case 'wolf': return 'D'
      case 'cosmic': return 'C'
      default: return 'M'
    }
  }

  const getThemePreview = (themeName: Theme) => {
    const config = themes[themeName]
    return (
      <div 
        className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-xs"
        style={{
          background: config.gradients.main,
          boxShadow: config.colors.shadow
        }}
      >
        {getThemeIcon(themeName)}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* 當前主題按鈕 */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
        style={{
          background: themeConfig.gradients.main,
          color: themeConfig.colors.text,
          boxShadow: themeConfig.colors.shadow
        }}
      >
        {getThemeIcon(theme)}
        <span className="text-sm font-medium">{themeConfig.displayName}</span>
        <span className="text-xs opacity-70">
          {isOpen ? '▼' : '▶'}
        </span>
      </Button>

      {/* 主題選擇面板 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 主題面板 */}
          <Card 
            className="absolute top-full mt-2 right-0 z-50 w-80"
            style={{
              background: themeConfig.colors.card,
              borderColor: themeConfig.colors.border,
              boxShadow: themeConfig.colors.shadowLg
            }}
          >
            <CardContent className="p-4">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: themeConfig.colors.text }}
              >
                🎨 選擇主題風格
              </h3>
              
              <div className="space-y-3">
                {Object.values(themes).map((config) => (
                  <button
                    key={config.name}
                    onClick={() => handleThemeChange(config.name as Theme)}
                    className={`w-full p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                      theme === config.name ? 'ring-2' : ''
                    }`}
                    style={{
                      background: config.gradients.card,
                      color: config.colors.text,
                      ringColor: config.colors.primary,
                      border: `1px solid ${config.colors.border}`,
                      boxShadow: theme === config.name ? config.colors.shadowLg : config.colors.shadow
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* 主題預覽 */}
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          background: config.gradients.main,
                          boxShadow: config.colors.shadow
                        }}
                      >
                        {getThemeIcon(config.name as Theme)}
                      </div>
                      
                      {/* 主題信息 */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{config.displayName}</h4>
                          {theme === config.name && (
                            <span 
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                background: config.colors.primary,
                                color: config.colors.background
                              }}
                            >
                              使用中
                            </span>
                          )}
                        </div>
                        <p 
                          className="text-sm mt-1"
                          style={{ color: config.colors.textMuted }}
                        >
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* 主題說明 */}
              <div 
                className="mt-4 p-3 rounded-lg"
                style={{
                  background: `${themeConfig.colors.accent}20`,
                  border: `1px solid ${themeConfig.colors.border}`
                }}
              >
                <p 
                  className="text-xs leading-relaxed"
                  style={{ color: themeConfig.colors.textMuted }}
                >
                  💡 每個主題都有獨特的色彩搭配和視覺風格，
                  選擇最適合你當下心情的主題，打造專屬的遊戲人生體驗。
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// 簡化版主題切換器（用於移動端或緊湊空間）
export const CompactThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme()
  
  const cycleTheme = () => {
    const themeOrder: Theme[] = ['morandi', 'wolf', 'cosmic']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const getThemeIcon = (themeName: Theme) => {
    switch (themeName) {
      case 'morandi': return 'M'
      case 'wolf': return 'D'
      case 'cosmic': return 'C'
      default: return 'M'
    }
  }

  return (
    <Button
      onClick={cycleTheme}
      className={`w-10 h-10 p-0 rounded-full transition-all duration-300 hover:scale-110 ${className}`}
      style={{
        background: themes[theme].gradients.main,
        boxShadow: themes[theme].colors.shadow
      }}
    >
      {getThemeIcon(theme)}
    </Button>
  )
}