'use client'

import { useEffect, useState } from 'react'

export type ThemeType = 'original' | 'morandi' | 'zen'

interface ThemeConfig {
  id: ThemeType
  name: string
  description: string
  preview: {
    primary: string
    secondary: string
    background: string
    surface: string
  }
}

const themes: ThemeConfig[] = [
  {
    id: 'original',
    name: '原始設計',
    description: '金色奢華風格，專業商務感',
    preview: {
      primary: '#c9a961',
      secondary: '#8b5cf6',
      background: '#fdfbf7',
      surface: '#ffffff'
    }
  },
  {
    id: 'morandi',
    name: '莫蘭迪薄霧',
    description: '柔和內斂的高級灰調，長時間使用不疲勞',
    preview: {
      primary: '#9CAF88',
      secondary: '#C4A4A7',
      background: '#F8F6F3',
      surface: '#ffffff'
    }
  },
  {
    id: 'zen',
    name: '枯山水禪境',
    description: '溫潤自然的東方美學，沉穩優雅',
    preview: {
      primary: '#B8975A',
      secondary: '#7A8B76',
      background: '#E8DCC4',
      surface: '#F2EBE0'
    }
  }
]

export function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('original')
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    // 載入已儲存的主題
    const savedTheme = localStorage.getItem('venturo-theme') as ThemeType
    if (savedTheme && themes.some(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (themeId: ThemeType) => {
    const theme = themes.find(t => t.id === themeId)
    if (!theme) return

    // 移除所有主題類別
    document.documentElement.classList.remove('theme-original', 'theme-morandi', 'theme-zen')
    
    // 加入新主題類別
    document.documentElement.classList.add(`theme-${themeId}`)
    
    // 更新 CSS 變數
    const root = document.documentElement
    if (themeId === 'original') {
      root.style.setProperty('--primary', '#c9a961')
      root.style.setProperty('--primary-hover', '#b8975a')
      root.style.setProperty('--primary-light', '#e4d4a8')
      root.style.setProperty('--secondary', '#8b5cf6')
      root.style.setProperty('--background', '#fdfbf7')
      root.style.setProperty('--surface', 'rgba(255, 255, 255, 0.9)')
      root.style.setProperty('--text-primary', '#3a3833')
      root.style.setProperty('--text-secondary', '#6d685f')
      root.style.setProperty('--border', 'rgba(201, 169, 97, 0.2)')
    } else if (themeId === 'morandi') {
      root.style.setProperty('--primary', '#9CAF88')
      root.style.setProperty('--primary-hover', '#8B9E77')
      root.style.setProperty('--primary-light', '#B8C4A8')
      root.style.setProperty('--secondary', '#C4A4A7')
      root.style.setProperty('--background', '#F8F6F3')
      root.style.setProperty('--surface', '#FFFFFF')
      root.style.setProperty('--text-primary', '#4A4843')
      root.style.setProperty('--text-secondary', '#7D7A73')
      root.style.setProperty('--border', 'rgba(184, 176, 160, 0.2)')
    } else if (themeId === 'zen') {
      root.style.setProperty('--primary', '#B8975A')
      root.style.setProperty('--primary-hover', '#A08650')
      root.style.setProperty('--primary-light', '#D4C4A0')
      root.style.setProperty('--secondary', '#7A8B76')
      root.style.setProperty('--background', '#E8DCC4')
      root.style.setProperty('--surface', '#F2EBE0')
      root.style.setProperty('--text-primary', '#3A3833')
      root.style.setProperty('--text-secondary', '#6D685F')
      root.style.setProperty('--border', 'rgba(58, 56, 51, 0.15)')
    }
  }

  const handleThemeChange = (themeId: ThemeType) => {
    setIsChanging(true)
    setCurrentTheme(themeId)
    
    // 儲存主題選擇
    localStorage.setItem('venturo-theme', themeId)
    
    // 套用主題
    applyTheme(themeId)
    
    // 動畫效果
    setTimeout(() => {
      setIsChanging(false)
    }, 300)
  }

  return (
    <div className="theme-settings">
      <h2 className="section-title">主題設定</h2>
      <p className="section-description">
        選擇適合您的視覺主題，打造個人化的使用體驗
      </p>
      
      <div className="theme-grid">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`theme-card ${currentTheme === theme.id ? 'active' : ''}`}
            onClick={() => handleThemeChange(theme.id)}
          >
            <div className="theme-preview">
              <div 
                className="preview-header" 
                style={{ background: theme.preview.primary }}
              />
              <div 
                className="preview-body"
                style={{ background: theme.preview.background }}
              >
                <div 
                  className="preview-sidebar"
                  style={{ background: theme.preview.surface }}
                />
                <div className="preview-content">
                  <div 
                    className="preview-card"
                    style={{ background: theme.preview.surface }}
                  />
                  <div 
                    className="preview-card"
                    style={{ background: theme.preview.surface }}
                  />
                </div>
              </div>
              <div className="preview-badge">
                <div 
                  className="badge-dot"
                  style={{ background: theme.preview.secondary }}
                />
              </div>
            </div>
            
            <div className="theme-info">
              <h3 className="theme-name">{theme.name}</h3>
              <p className="theme-desc">{theme.description}</p>
            </div>
            
            {currentTheme === theme.id && (
              <div className="theme-selected">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                使用中
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .theme-settings {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }
        
        .section-description {
          color: var(--text-secondary);
          margin: 0 0 24px 0;
        }
        
        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .theme-card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .theme-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border-color: var(--primary);
        }
        
        .theme-card.active {
          border-color: var(--primary);
          background: var(--surface);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
        
        .theme-preview {
          width: 100%;
          height: 160px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
          position: relative;
          border: 1px solid var(--border);
        }
        
        .preview-header {
          height: 24px;
          width: 100%;
        }
        
        .preview-body {
          height: 136px;
          padding: 8px;
          display: flex;
          gap: 8px;
        }
        
        .preview-sidebar {
          width: 60px;
          border-radius: 4px;
        }
        
        .preview-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .preview-card {
          flex: 1;
          border-radius: 4px;
        }
        
        .preview-badge {
          position: absolute;
          top: 16px;
          right: 16px;
        }
        
        .badge-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .theme-info {
          margin-bottom: 12px;
        }
        
        .theme-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }
        
        .theme-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }
        
        .theme-selected {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--primary);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        @media (max-width: 768px) {
          .theme-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
