'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { venturoAuth } from '@/lib/venturo-auth'

import { Icons } from '@/components/icons'
import { Button } from '@/components/Button'
import { ModeProvider, useMode } from '@/contexts/ModeContext'

interface SidebarProps {
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: SidebarProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  const { currentMode, toggleMode } = useMode()
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
    venturoAuth.getCurrentUser().then(user => {
      if (!user) {
        console.log('Layout: 用戶未登入')
        // router.push('/') // 🔓 已停用登入重定向
        return
      }
      console.log('Layout: 用戶已登入', user.real_name || user.email)
      setCurrentUser(user)
    }).catch(error => {
      console.error('Layout: 獲取用戶失敗', error)
    })

    return () => {
      // Cleanup function
    }
  }, [router])

  const handleLogout = async () => {
    // 清除新角色登入系統的資料
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dev_mode')
      localStorage.removeItem('dev_user')
      localStorage.removeItem('venturo_last_character')
    }
    
    // 使用新的雲端認證系統登出
    await venturoAuth.logout()
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
      id: 'mind-magic',
      name: '心靈魔法',
      href: '/dashboard/mind-magic',
      modes: ['game'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
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
      id: 'contracts',
      name: '合約管理',
      href: '/dashboard/contracts',
      modes: ['corner'], // 只在角落模式顯示
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <path d="M16 10h-2"/>
          <path d="M16 14h-2"/>
          <path d="M16 18h-2"/>
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
        <div className="sidebar-logo">
          <div className="logo-icon">V</div>
          <div className="logo-text">VENTURO</div>
        </div>
        
        {/* 模式切換按鈕或模式顯示 */}
        {currentUser?.role === 'CORNER_EMPLOYEE' ? (
          <div className="mode-switcher" style={{ transform: 'translateY(-10px)' }}>
            <div className="toggle-container" onClick={toggleMode}>
              <div className={`toggle-slider ${currentMode}`}></div>
              <div className="toggle-labels">
                <span className={`toggle-label ${currentMode === 'game' ? 'active' : ''}`}>冒險</span>
                <span className={`toggle-label ${currentMode === 'corner' ? 'active' : ''}`}>角落</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mode-display" style={{ transform: 'translateY(-10px)' }}>
            <div className="adventure-mode-label">
              🏔️ 冒險人生
            </div>
          </div>
        )}
        
        <nav className="flex-1 flex flex-col">
          <ul className="nav-menu">
            {visibleMenuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <a
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
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
            <div className="user-info-compact">
              <span className="user-nickname">{currentUser.display_name || currentUser.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                登出
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* 主要內容區域 */}
      <div className="main-content">
        <div className="module-container">
          {children}
        </div>
      </div>



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
          padding: 24px 20px 80px 20px; /* 減少底部間距 */
          /* border-right: 隱藏了醇髙的邊框 */
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow-y: auto;
          overflow-x: hidden;
          transition: all 0.3s ease; /* 添加動畫效果 */
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

        /* 模式顯示樣式（非角落員工用戶） */
        .mode-display {
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .adventure-mode-label {
          width: 100%;
          height: 44px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          box-shadow: 0 2px 8px rgba(201, 169, 97, 0.3);
          border: 1px solid rgba(201, 169, 97, 0.2);
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

        /* 緊密版底部區域 */
        .sidebar-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 200px;
          padding: 12px 16px; /* 減少間距 */
          /* border-top: 隱藏了醇髙的上邊框 */
          background: rgba(255, 253, 250, 0.98);
          backdrop-filter: blur(20px);
          z-index: 101;
        }

        /* 緊密版用戶信息 */
        .user-info-compact {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }

        .user-nickname {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 13px;
          flex: 1;
          text-align: left;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 60px;
        }

        .logout-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
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

// Wrapper 組件提供 ModeProvider
export default function DashboardLayout({ children }: SidebarProps) {
  return (
    <ModeProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ModeProvider>
  )
}