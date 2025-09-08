'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authManager } from '@/lib/auth'
import { GameDebugGrid } from '@/components/GameDebugGrid'
import { SimpleGridHelper } from '@/components/SimpleGridHelper'
import { Icons } from '@/components/icons'
import { Button } from '@/components/Button'

interface SidebarProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: SidebarProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [currentMode, setCurrentMode] = useState<'game' | 'corner'>('game')
  const [showDebugGrid, setShowDebugGrid] = useState(false)
  const [showSimpleGrid, setShowSimpleGrid] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 檢測是否為手機版
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const user = authManager.getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    setCurrentUser(user)
    
    // 載入用戶的模式偏好
    const savedMode = localStorage.getItem(`gamelife_mode_${user.id}`)
    if (savedMode === 'corner' || savedMode === 'game') {
      setCurrentMode(savedMode)
    }

    return () => {
      // Cleanup function
    }
  }, [router])

  const handleLogout = async () => {
    await authManager.logout()
  }

  const toggleMode = () => {
    const newMode = currentMode === 'game' ? 'corner' : 'game'
    setCurrentMode(newMode)
    
    if (currentUser) {
      localStorage.setItem(`gamelife_mode_${currentUser.id}`, newMode)
    }
    
    // React 狀態更新會自動觸發重新渲染，不需要頁面重載
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // 菜單項目 - 根據模式顯示不同選項
  const allMenuItems = [
    // 共同顯示項目
    {
      id: 'dashboard',
      name: '系統總覽',
      href: '/dashboard',
      modes: ['game', 'corner'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    {
      id: 'todos',
      name: '待辦事項',
      href: '/dashboard/todos',
      modes: ['game', 'corner'], // 兩邊都顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      )
    },
    // 遊戲模式專屬
    {
      id: 'timebox',
      name: '時間盒',
      href: '/dashboard/timebox',
      modes: ['game'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      )
    },
    {
      id: 'finance',
      name: '財務管理',
      href: '/dashboard/finance',
      modes: ['game'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      )
    },
    {
      id: 'calendar',
      name: '行事曆',
      href: '/dashboard/calendar',
      modes: ['game', 'corner'], // 兩個模式都顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    // 角落模式專屬
    {
      id: 'quotations',
      name: '報價單',
      href: '/dashboard/quotations',
      modes: ['corner'], // 只在角落模式顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <path d="M12 11h-2"/>
          <path d="M12 15h-2"/>
          <path d="M14 11h2"/>
          <path d="M14 15h2"/>
        </svg>
      )
    },
    {
      id: 'groups',
      name: '團體管理',
      href: '/dashboard/groups',
      modes: ['corner'], // 只在角落模式顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      id: 'orders',
      name: '訂單管理',
      href: '/dashboard/orders',
      modes: ['corner'], // 只在角落模式顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      )
    },
    {
      id: 'receipts',
      name: '收款單',
      href: '/dashboard/receipts',
      modes: ['corner'], // 只在角落模式顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <path d="M2 10h20"/>
          <path d="M12 15h.01"/>
        </svg>
      )
    },
    {
      id: 'invoices',
      name: '請款單',
      href: '/dashboard/invoices',
      modes: ['corner'], // 只在角落模式顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      )
    },
    {
      id: 'projects',
      name: '專案管理',
      href: '/dashboard/projects',
      modes: ['corner'], // 只在角落模式顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    },
    // 管理功能（兩邊都顯示）
    {
      id: 'users',
      name: '用戶管理',
      href: '/dashboard/users',
      modes: ['game', 'corner'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      roles: ['SUPER_ADMIN', 'BUSINESS_ADMIN']
    },
    {
      id: 'settings',
      name: '系統設定',
      href: '/dashboard/settings',
      modes: ['game', 'corner'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      )
    }
  ]

  // 根據當前模式和用戶權限過濾菜單
  const visibleMenuItems = allMenuItems.filter(item => {
    // 首先檢查模式是否匹配
    if (!item.modes.includes(currentMode)) return false
    
    // 然後檢查權限
    if (!item.roles) return true
    return currentUser && item.roles.includes(currentUser.role)
  })

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      {/* 側邊欄 */}
      <div className="sidebar">
        <div className="sidebar-logo" data-debug-pos="sidebar-logo">
          <div className="logo-icon">V</div>
          <div className="logo-text">VENTURO</div>
        </div>
        
        {/* 模式切換按鈕 */}
        <div className="mode-switcher" data-debug-pos="mode-switcher" style={{ transform: 'translateY(-10px)' }}>
          <div className="toggle-container" onClick={toggleMode}>
            <div className={`toggle-slider ${currentMode}`}></div>
            <div className="toggle-labels">
            <span className={`toggle-label ${currentMode === 'game' ? 'active' : ''}`}>冒險</span>
            <span className={`toggle-label ${currentMode === 'corner' ? 'active' : ''}`}>角落</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col">
          <ul className="nav-menu">
            {visibleMenuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <a
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                  data-debug-pos={`nav-${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(item.href)
                  }}
                >
                  <div className="nav-icon">{item.icon}</div>
                  <span>{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
          
          {/* 用戶資訊和登出按鈕 */}
          <div className="sidebar-footer">
            <div className="user-info-sidebar">
              <div className="user-name">{currentUser.display_name || currentUser.username}</div>
              <div className="user-role">
                {currentUser.role === 'SUPER_ADMIN' ? '系統管理員' : 
                 currentUser.role === 'BUSINESS_ADMIN' ? '業務管理員' : '一般使用者'}
              </div>
            </div>
            <button 
              className="simple-grid-btn" 
              onClick={() => setShowSimpleGrid(!showSimpleGrid)}
              title="簡單視覺網格 (Ctrl+G)"
              data-debug-pos="simple-grid-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3z"/>
                <path d="M9 3v18"/>
                <path d="M15 3v18"/>
                <path d="M3 9h18"/>
                <path d="M3 15h18"/>
              </svg>
              {showSimpleGrid ? '關閉網格' : '顯示網格'}
            </button>
            
            <button 
              className="debug-grid-btn" 
              onClick={() => setShowDebugGrid(!showDebugGrid)}
              title="完整調試模式"
              data-debug-pos="debug-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 3v18"/>
                <path d="M15 3v18"/>
                <path d="M3 9h18"/>
                <path d="M3 15h18"/>
              </svg>
              {showDebugGrid ? '關閉調試' : '調試模式'}
            </button>
            <Button 
              variant="primary" 
              icon={Icons.logoutSmall}
              onClick={handleLogout}
              fullWidth={true}
            >
              登出
            </Button>
          </div>
        </nav>
      </div>

      {/* 主要內容區域 */}
      <div className="main-content">
        <div className="module-container">
          {children}
        </div>
      </div>

      {/* 全域遊戲調試網格 */}
      <GameDebugGrid 
        isEnabled={showDebugGrid}
        onToggle={() => setShowDebugGrid(!showDebugGrid)}
      />
      
      {/* 簡單視覺網格 */}
      <SimpleGridHelper
        isEnabled={showSimpleGrid}
        onToggle={() => setShowSimpleGrid(!showSimpleGrid)}
      />

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 100%);
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 200px;
          height: 100vh;
          background: rgba(255, 253, 250, 0.95);
          backdrop-filter: blur(20px);
          padding: 24px 20px 280px 20px;
          border-right: 1px solid rgba(201, 169, 97, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          flex-shrink: 0;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .logo-icon::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 70%
          );
          transform: rotate(45deg);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          color: #3a3833;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #c9a961, #8b7355);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* 模式切換按鈕樣式 - 滑動色塊設計 */
        .mode-switcher {
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .toggle-container {
          position: relative;
          width: 100%;
          height: 44px;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 4px;
        }

        .toggle-container:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201, 169, 97, 0.25);
          border-color: rgba(201, 169, 97, 0.4);
        }

        .toggle-slider {
          position: absolute;
          top: 4px;
          left: 4px;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          border-radius: 8px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(201, 169, 97, 0.3);
        }

        .toggle-slider.corner {
          transform: translateX(calc(100% + 0px));
          background: linear-gradient(135deg, #8b7355, #c9a961);
        }

        .toggle-labels {
          position: relative;
          display: flex;
          height: 100%;
          z-index: 2;
        }

        .toggle-label {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s ease;
          color: #6d685f;
          pointer-events: none;
        }

        .toggle-label.active {
          color: white;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .nav-menu {
          list-style: none;
          padding: 0;
          margin: 0;
          transition: all 0.3s ease;
          flex: 1;
          overflow-y: visible;
        }

        .nav-item {
          margin-bottom: 4px;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          text-decoration: none;
          color: #6d685f;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .nav-link:hover {
          background: rgba(201, 169, 97, 0.1);
          color: #3a3833;
        }

        .nav-link.active {
          background: rgba(201, 169, 97, 0.2);
          color: #8b7355;
          font-weight: 500;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .nav-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .main-content {
          margin-left: 200px;
          padding-right: 20px;
          padding-left: 20px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow-x: hidden;
        }

        .module-container {
          flex: 1;
          padding: 24px 12px;
          background: transparent;
          margin: 0;
          width: 100%;
        }

        /* 側邊欄底部區域 */
        .sidebar-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 200px;
          padding: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(201, 169, 97, 0.2);
          background: linear-gradient(to top, 
            rgba(255, 253, 250, 1) 0%,
            rgba(255, 253, 250, 1) 90%,
            rgba(255, 253, 250, 0.95) 100%);
          backdrop-filter: blur(20px);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
          z-index: 101;
        }

        .user-info-sidebar {
          padding: 16px 0;
          text-align: center;
        }

        .user-name {
          font-weight: 600;
          color: #3a3833;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .user-role {
          color: #6d685f;
          font-size: 12px;
        }


        .simple-grid-btn {
          width: 100%;
          padding: 8px 16px;
          background: rgba(255, 165, 0, 0.1);
          color: #ffa500;
          border: 1px solid rgba(255, 165, 0, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .simple-grid-btn:hover {
          background: rgba(255, 165, 0, 0.2);
          border-color: rgba(255, 165, 0, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 165, 0, 0.2);
        }

        .debug-grid-btn {
          width: 100%;
          padding: 8px 16px;
          background: rgba(0, 255, 255, 0.1);
          color: #00ffff;
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .debug-grid-btn:hover {
          background: rgba(0, 255, 255, 0.2);
          border-color: rgba(0, 255, 255, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 255, 255, 0.2);
        }


        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e4d4a8;
          border-radius: 50%;
          border-top-color: #c9a961;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* 手機版響應式設計 */
        @media (max-width: 768px) {
          /* 響應式模式下重置所有錨點偏移 */
          .dashboard-layout [style*="translate"] {
            transform: none !important;
          }
          
          .sidebar {
            position: fixed;
            bottom: 0;
            left: 0;
            top: auto;
            width: 100%;
            height: auto;
            background: rgba(255, 253, 250, 0.95);
            backdrop-filter: blur(20px);
            padding: 8px 16px;
            border-right: none;
            border-top: 1px solid rgba(201, 169, 97, 0.2);
            transform: none;
            z-index: 1001;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }

          .sidebar-logo {
            display: none;
          }

          .nav-menu {
            display: flex;
            flex-direction: row;
            gap: 4px;
            flex: 1;
            justify-content: space-around;
            align-items: center;
            margin: 0;
            padding: 0;
          }

          .nav-item {
            margin-bottom: 0;
            flex: 1;
          }

          .nav-link {
            flex-direction: column;
            padding: 8px 4px;
            gap: 4px;
            text-align: center;
            border-radius: 8px;
          }

          .nav-icon {
            width: 16px;
            height: 16px;
          }

          .nav-link span {
            font-size: 10px;
            line-height: 1.2;
          }

          .main-content {
            margin-left: 0;
            padding-left: 0;
            padding-right: 0;
            margin-bottom: 70px;
            width: 100%;
          }

          .module-container {
            padding: 16px 12px;
            max-width: none;
          }

          .sidebar-footer {
            display: none;
          }

          .mode-switcher {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .nav-link span {
            font-size: 9px;
          }
          
          .nav-link {
            padding: 6px 2px;
          }

          .main-content {
            padding-left: 0;
            padding-right: 0;
          }

          .module-container {
            padding: 12px 6px;
          }
        }
      `}</style>
    </div>
  )
}