'use client'

import { useEffect, useState, useRef } from 'react'
import { localAuth } from '@/lib/local-auth'
import { DEFAULT_MODULES } from '@/lib/modules'
import { BaseAPI } from '@/lib/base-api'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'
import { VersionIndicator } from '@/components/VersionIndicator'

interface SidebarOrder {
  desktop: string[]
  mobile: string[]
}

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [availableModules, setAvailableModules] = useState<string[]>([])
  const [sidebarOrder, setSidebarOrder] = useState<SidebarOrder>({
    desktop: [],
    mobile: []
  })
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    const user = localAuth.getCurrentUser()
    setCurrentUser(user)
    
    if (user) {
      // 根據角色設定可用模組
      const roleModules: Record<string, string[]> = {
        'SUPER_ADMIN': ['users', 'todos', 'projects', 'calendar', 'finance', 'timebox', 'settings'],
        'BUSINESS_ADMIN': ['todos', 'projects', 'calendar', 'finance', 'timebox'],
        'GENERAL_USER': ['todos', 'calendar', 'timebox']
      }
      
      const userModules = roleModules[user.role] || roleModules['GENERAL_USER']
      setAvailableModules(userModules)
      
      // 載入已儲存的排序設定
      loadSidebarOrder(user.id, userModules)
    }
  }, [])

  const loadSidebarOrder = async (userId: string, userModules: string[]) => {
    try {
      const settings = await BaseAPI.loadData('settings', userId, {})
      if (settings.sidebarOrder) {
        const savedOrder = settings.sidebarOrder as SidebarOrder
        
        // 確保所有用戶模組都在排序中
        const ensureAllModules = (order: string[]) => {
          const missing = userModules.filter(m => !order.includes(m))
          return [...order.filter(m => userModules.includes(m)), ...missing]
        }
        
        setSidebarOrder({
          desktop: ensureAllModules(savedOrder.desktop || []),
          mobile: ensureAllModules(savedOrder.mobile || [])
        })
      } else {
        // 使用預設排序
        setSidebarOrder({
          desktop: [...userModules],
          mobile: [...userModules]
        })
      }
    } catch (error) {
      console.error('載入側邊欄排序失敗:', error)
      setSidebarOrder({
        desktop: [...userModules],
        mobile: [...userModules]
      })
    }
  }

  const saveSidebarOrder = async () => {
    if (!currentUser) return
    
    try {
      const currentSettings = await BaseAPI.loadData('settings', currentUser.id, {})
      const updatedSettings = {
        ...currentSettings,
        sidebarOrder
      }
      await BaseAPI.saveData('settings', currentUser.id, updatedSettings)
      setHasUnsavedChanges(false)
      
      // 顯示成功訊息
      alert('側邊欄排序已儲存！')
    } catch (error) {
      console.error('儲存側邊欄排序失敗:', error)
      alert('儲存失敗，請重試')
    }
  }

  const resetToDefault = () => {
    if (confirm('確定要重設為預設排序嗎？')) {
      setSidebarOrder({
        desktop: [...availableModules],
        mobile: [...availableModules]
      })
      setHasUnsavedChanges(true)
    }
  }

  const clearAllData = async () => {
    if (confirm('⚠️ 警告：這將清除所有本地資料，包括用戶資料、待辦事項、專案等。\n\n確定要繼續嗎？此操作無法復原！')) {
      if (confirm('⚠️ 最後確認：您確定要清除所有資料嗎？\n\n點擊確定後將立即清除並重新載入頁面。')) {
        // 清除所有資料
        if (currentUser) {
          BaseAPI.clearAllData(currentUser.id)
        }
        localStorage.clear()
        
        // 重新載入頁面
        window.location.reload()
      }
    }
  }

  // HTML5 原生拖放處理
  const handleDragStart = (e: React.DragEvent, moduleId: string, index: number) => {
    setDraggedItem(moduleId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (dragIndex !== dropIndex && draggedItem) {
      const items = Array.from(sidebarOrder[activeTab])
      const [removed] = items.splice(dragIndex, 1)
      items.splice(dropIndex, 0, removed)
      
      setSidebarOrder({
        ...sidebarOrder,
        [activeTab]: items
      })
      setHasUnsavedChanges(true)
    }
    
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const getModuleName = (moduleId: string) => {
    const moduleNames: { [key: string]: string } = {
      users: '使用者管理',
      todos: '任務清單',
      projects: '專案管理',
      calendar: '行事曆',
      finance: '財務管理',
      timebox: '時間管理',
      'life-simulator': '人生模擬器',
      'pixel-life': '像素人生',
      'travel-pdf': '旅行 PDF',
      themes: '主題設定',
      sync: '同步管理',
      settings: '系統設定'
    }
    return moduleNames[moduleId] || moduleId
  }

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'timebox':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className="icon">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        )
      case 'todos':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.02 1.17.06"/>
          </svg>
        )
      case 'users':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="m22 21-3-3m0 0a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/>
          </svg>
        )
      case 'projects':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        )
      case 'calendar':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        )
      case 'finance':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6m0 0v6M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5"/>
          </svg>
        )
      case 'settings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        )
    }
  }

  if (!currentUser) {
    return (
      <div className="loading">
        載入中...
      </div>
    )
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.settings,
        title: "系統設定",
        subtitle: "個人化您的側邊欄排序和介面設定",
        actions: (
          <>
            {hasUnsavedChanges && (
              <Button variant="primary" onClick={saveSidebarOrder}>
                儲存變更
              </Button>
            )}
            <Button variant="ghost" onClick={resetToDefault}>
              重設預設值
            </Button>
          </>
        )
      }}
    >
        {/* 安全設定 */}
        <div className="setting-section">
          <h2 className="section-title">安全設定</h2>
          <p className="section-description">
            管理您的密碼和帳戶安全
          </p>
          
          <div className="security-section">
            <div className="security-item">
              <div className="security-info">
                <h4>密碼</h4>
                <p>上次修改：從未</p>
              </div>
              <button className="btn-secondary" disabled>
                修改密碼
                <span className="coming-soon">即將推出</span>
              </button>
            </div>
            
            <div className="security-item danger">
              <div className="security-info">
                <h4>清除所有資料</h4>
                <p>清除所有本地儲存的資料，包括用戶、待辦事項、專案等</p>
              </div>
              <button className="btn-danger" onClick={clearAllData}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6h14zM10 11v6M14 11v6"/>
                </svg>
                清除所有資料
              </button>
            </div>
          </div>
        </div>

        {/* 主題設定 */}
        <div className="setting-section">
          <h2 className="section-title">外觀設定</h2>
          <p className="section-description">
            自訂您的介面主題和外觀
          </p>
          
          <div className="theme-section">
            <div className="theme-options">
              <div className="theme-option">
                <input type="radio" id="theme-light" name="theme" defaultChecked disabled />
                <label htmlFor="theme-light" className="theme-card">
                  <div className="theme-preview light">
                    <div className="preview-header"></div>
                    <div className="preview-sidebar"></div>
                    <div className="preview-content"></div>
                  </div>
                  <span>淺色主題</span>
                </label>
              </div>
              
              <div className="theme-option">
                <input type="radio" id="theme-dark" name="theme" disabled />
                <label htmlFor="theme-dark" className="theme-card">
                  <div className="theme-preview dark">
                    <div className="preview-header"></div>
                    <div className="preview-sidebar"></div>
                    <div className="preview-content"></div>
                  </div>
                  <span>深色主題</span>
                </label>
              </div>
              
              <div className="theme-option">
                <input type="radio" id="theme-auto" name="theme" disabled />
                <label htmlFor="theme-auto" className="theme-card">
                  <div className="theme-preview auto">
                    <div className="preview-header"></div>
                    <div className="preview-sidebar"></div>
                    <div className="preview-content"></div>
                  </div>
                  <span>自動切換</span>
                </label>
              </div>
            </div>
            
            <div className="coming-soon-notice">
              <span className="coming-soon">主題功能即將推出</span>
            </div>
          </div>
        </div>

        {/* 側邊欄排序設定 */}
        <div className="setting-section">
          <h2 className="section-title">側邊欄排序設定</h2>
          <p className="section-description">
            拖放下方的功能項目來自訂您的側邊欄順序。桌機版和手機版可以設定不同的排序。
          </p>
          
          {/* 平台選擇 */}
          <div className="platform-tabs">
            <button 
              className={`tab ${activeTab === 'desktop' ? 'active' : ''}`}
              onClick={() => setActiveTab('desktop')}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
                <rect x="2" y="4" width="20" height="12" rx="2"/>
                <path d="M8 18h8"/>
                <path d="M10 22h4"/>
                <path d="M12 18v4"/>
              </svg>
              桌機版
            </button>
            <button 
              className={`tab ${activeTab === 'mobile' ? 'active' : ''}`}
              onClick={() => setActiveTab('mobile')}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
                <rect x="7" y="2" width="10" height="20" rx="2"/>
                <circle cx="12" cy="18" r="1"/>
              </svg>
              手機版
            </button>
          </div>
          
          {/* 拖放排序區域 */}
          <div className="drag-container">
            <div className="preview-section">
              <h3 className="preview-title">
                {activeTab === 'desktop' ? '桌機版預覽' : '手機版預覽'}
              </h3>
              <div className={`sidebar-preview ${activeTab}`}>
                {sidebarOrder[activeTab].map((moduleId, index) => (
                  <div key={moduleId} className="preview-item">
                    {getModuleIcon(moduleId)}
                    <span className="preview-text">{getModuleName(moduleId)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="drag-section">
              <h3 className="drag-title">拖放排序</h3>
              <div className="drag-list">
                {sidebarOrder[activeTab].map((moduleId, index) => (
                  <div
                    key={moduleId}
                    className={`drag-item ${
                      draggedItem === moduleId ? 'dragging' : ''
                    } ${
                      dragOverIndex === index ? 'drag-over' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, moduleId, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="drag-handle">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="7" r="1"/>
                        <circle cx="15" cy="7" r="1"/>
                        <circle cx="9" cy="12" r="1"/>
                        <circle cx="15" cy="12" r="1"/>
                        <circle cx="9" cy="17" r="1"/>
                        <circle cx="15" cy="17" r="1"/>
                      </svg>
                    </div>
                    {getModuleIcon(moduleId)}
                    <span className="drag-text">{getModuleName(moduleId)}</span>
                    <span className="drag-order">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 操作按鈕 */}
          <div className="setting-actions">
            <button 
              className="btn-secondary" 
              onClick={resetToDefault}
            >
              重設為預設
            </button>
            <button 
              className={`btn-primary ${hasUnsavedChanges ? 'highlight' : ''}`}
              onClick={saveSidebarOrder}
              disabled={!hasUnsavedChanges}
            >
              {hasUnsavedChanges ? '儲存變更' : '已儲存'}
            </button>
          </div>
        </div>

      <style jsx>{`

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .settings-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0;
        }

        .setting-section {
          margin-bottom: 40px;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
        }

        .setting-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
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
          line-height: 1.5;
        }

        .platform-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 12px;
          padding: 4px;
          width: fit-content;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .tab.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        .tab-icon {
          width: 16px;
          height: 16px;
        }

        .drag-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 24px;
        }

        .preview-section,
        .drag-section {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(201, 169, 97, 0.1);
        }

        .preview-title,
        .drag-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 16px 0;
        }

        .sidebar-preview {
          border: 2px solid rgba(201, 169, 97, 0.2);
          border-radius: 8px;
          overflow: hidden;
        }

        .sidebar-preview.desktop {
          max-height: 400px;
          overflow-y: auto;
        }

        .sidebar-preview.mobile {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          padding: 8px;
          gap: 8px;
        }

        .preview-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.7);
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
          font-size: 14px;
          color: var(--text-primary);
        }

        .sidebar-preview.mobile .preview-item {
          flex-direction: column;
          gap: 4px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          text-align: center;
          min-width: 80px;
        }

        .preview-text {
          font-weight: 500;
        }

        .sidebar-preview.mobile .preview-text {
          font-size: 10px;
          line-height: 1.2;
        }

        .drag-list {
          min-height: 200px;
        }

        .drag-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: grab;
          transition: all 0.2s ease;
          user-select: none;
        }

        .drag-item:hover {
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.2);
          border-color: rgba(201, 169, 97, 0.4);
        }

        .drag-item.dragging {
          opacity: 0.5;
          box-shadow: 0 8px 24px rgba(201, 169, 97, 0.3);
          transform: rotate(2deg);
          cursor: grabbing;
        }

        .drag-item.drag-over {
          background: rgba(201, 169, 97, 0.1);
          border-color: var(--primary);
        }

        .drag-handle {
          width: 16px;
          height: 16px;
          color: var(--text-secondary);
          cursor: grab;
        }

        .drag-text {
          flex: 1;
          font-weight: 500;
          color: var(--text-primary);
        }

        .drag-order {
          font-size: 12px;
          color: var(--text-secondary);
          background: rgba(201, 169, 97, 0.1);
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .icon {
          width: 16px;
          height: 16px;
          color: var(--primary);
        }

        .setting-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid rgba(201, 169, 97, 0.2);
        }

        .btn-secondary {
          padding: 12px 20px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          background: white;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: rgba(201, 169, 97, 0.05);
          border-color: rgba(201, 169, 97, 0.5);
        }

        .btn-primary {
          padding: 12px 20px;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201, 169, 97, 0.3);
        }

        .btn-primary.highlight {
          animation: pulse 2s infinite;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: var(--text-secondary);
          font-size: 16px;
        }

        /* 安全設定區塊 */
        .security-section {
          margin-bottom: 24px;
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(201, 169, 97, 0.1);
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .security-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .security-info p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* 主題設定區塊 */
        .theme-section {
          margin-bottom: 24px;
        }

        .theme-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .theme-option {
          position: relative;
        }

        .theme-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .theme-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          border: 2px solid rgba(201, 169, 97, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.5);
        }

        .theme-card:hover {
          border-color: rgba(201, 169, 97, 0.4);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.1);
        }

        .theme-option input[type="radio"]:checked + .theme-card {
          border-color: var(--primary);
          background: rgba(201, 169, 97, 0.05);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.2);
        }

        .theme-preview {
          height: 80px;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .theme-preview.light {
          background: var(--surface);
        }

        .theme-preview.dark {
          background: var(--text-primary);
        }

        .theme-preview.auto {
          background: linear-gradient(45deg, var(--surface) 50%, var(--text-primary) 50%);
        }

        .preview-header {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          height: 12px;
          background: rgba(201, 169, 97, 0.3);
          border-radius: 4px;
        }

        .preview-sidebar {
          position: absolute;
          top: 24px;
          left: 8px;
          width: 24px;
          bottom: 8px;
          background: rgba(201, 169, 97, 0.5);
          border-radius: 4px;
        }

        .preview-content {
          position: absolute;
          top: 24px;
          left: 36px;
          right: 8px;
          bottom: 8px;
          background: rgba(201, 169, 97, 0.2);
          border-radius: 4px;
        }

        .theme-card span {
          text-align: center;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 14px;
        }

        .coming-soon-notice {
          text-align: center;
          padding: 12px;
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 8px;
          color: var(--warning);
        }

        .coming-soon {
          font-size: 12px;
          color: var(--warning);
          background: rgba(255, 193, 7, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          margin-left: 8px;
          font-weight: 500;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          position: relative;
        }

        .btn-danger {
          padding: 12px 20px;
          background: linear-gradient(135deg, var(--danger), var(--danger));
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-danger:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
          background: linear-gradient(135deg, var(--danger), var(--danger));
        }

        .security-item.danger {
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.02);
        }

        .security-item.danger .security-info h4 {
          color: var(--danger);
        }

        @media (max-width: 768px) {
          .drag-container {
            grid-template-columns: 1fr;
          }
          
          .platform-tabs {
            width: 100%;
            justify-content: center;
          }
          
          .tab {
            flex: 1;
            justify-content: center;
          }

          .setting-actions {
            flex-direction: column;
          }

          .security-item {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .theme-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      <VersionIndicator 
        page="系統設定"
        authSystem="localAuth" 
        version="0.8"
        status="error"
      />
    </ModuleLayout>
  )
}
