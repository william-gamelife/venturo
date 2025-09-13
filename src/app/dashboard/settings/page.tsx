'use client'

import { useEffect, useState, useRef } from 'react'
import { localAuth } from '@/lib/local-auth'
import { DEFAULT_MODULES } from '@/lib/modules'
import { BaseAPI } from '@/lib/base-api'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'
import { VersionIndicator } from '@/components/VersionIndicator'
import {
  Settings,
  Monitor,
  Smartphone,
  GripVertical,
  Trash2,
  RotateCcw,
  Save,
  Shield,
  Palette,
  Layers
} from 'lucide-react'

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
          <div className="v-settings-actions">
            {hasUnsavedChanges && (
              <button className="v-button variant-primary" onClick={saveSidebarOrder}>
                <Save size={16} />
                儲存變更
              </button>
            )}
            <button className="v-button variant-outline" onClick={resetToDefault}>
              <RotateCcw size={16} />
              重設預設值
            </button>
          </div>
        )
      }}
    >
        {/* 安全設定 */}
        <div className="v-setting-section">
          <div className="v-section-header">
            <Shield className="v-section-icon" size={20} />
            <div>
              <h2 className="v-section-title">安全設定</h2>
              <p className="v-section-description">管理您的密碼和帳戶安全</p>
            </div>
          </div>

          <div className="v-security-items">
            <div className="v-security-item">
              <div className="v-security-info">
                <h4>密碼</h4>
                <p>上次修改：從未</p>
              </div>
              <button className="v-button variant-outline" disabled>
                修改密碼
                <span className="v-badge v-warning">即將推出</span>
              </button>
            </div>

            <div className="v-security-item v-danger">
              <div className="v-security-info">
                <h4>清除所有資料</h4>
                <p>清除所有本地儲存的資料，包括用戶、待辦事項、專案等</p>
              </div>
              <button className="v-button variant-danger" onClick={clearAllData}>
                <Trash2 size={16} />
                清除所有資料
              </button>
            </div>
          </div>
        </div>

        {/* 主題設定 */}
        <div className="v-setting-section">
          <div className="v-section-header">
            <Palette className="v-section-icon" size={20} />
            <div>
              <h2 className="v-section-title">外觀設定</h2>
              <p className="v-section-description">自訂您的介面主題和外觀</p>
            </div>
          </div>

          <div className="v-theme-options">
            <div className="v-theme-option">
              <input type="radio" id="theme-light" name="theme" defaultChecked disabled />
              <label htmlFor="theme-light" className="v-theme-card">
                <div className="v-theme-preview v-light">
                  <div className="v-preview-header"></div>
                  <div className="v-preview-sidebar"></div>
                  <div className="v-preview-content"></div>
                </div>
                <span>淺色主題</span>
              </label>
            </div>

            <div className="v-theme-option">
              <input type="radio" id="theme-dark" name="theme" disabled />
              <label htmlFor="theme-dark" className="v-theme-card">
                <div className="v-theme-preview v-dark">
                  <div className="v-preview-header"></div>
                  <div className="v-preview-sidebar"></div>
                  <div className="v-preview-content"></div>
                </div>
                <span>深色主題</span>
              </label>
            </div>

            <div className="v-theme-option">
              <input type="radio" id="theme-auto" name="theme" disabled />
              <label htmlFor="theme-auto" className="v-theme-card">
                <div className="v-theme-preview v-auto">
                  <div className="v-preview-header"></div>
                  <div className="v-preview-sidebar"></div>
                  <div className="v-preview-content"></div>
                </div>
                <span>自動切換</span>
              </label>
            </div>
          </div>

          <div className="v-coming-soon-notice">
            <span className="v-badge v-warning">主題功能即將推出</span>
          </div>
        </div>

        {/* 側邊欄排序設定 */}
        <div className="v-setting-section">
          <div className="v-section-header">
            <Layers className="v-section-icon" size={20} />
            <div>
              <h2 className="v-section-title">側邊欄排序設定</h2>
              <p className="v-section-description">
                拖放下方的功能項目來自訂您的側邊欄順序。桌機版和手機版可以設定不同的排序。
              </p>
            </div>
          </div>

          {/* 平台選擇 */}
          <div className="v-platform-tabs">
            <button
              className={`v-tab ${activeTab === 'desktop' ? 'v-active' : ''}`}
              onClick={() => setActiveTab('desktop')}
            >
              <Monitor size={16} />
              桌機版
            </button>
            <button
              className={`v-tab ${activeTab === 'mobile' ? 'v-active' : ''}`}
              onClick={() => setActiveTab('mobile')}
            >
              <Smartphone size={16} />
              手機版
            </button>
          </div>
          
          {/* 拖放排序區域 */}
          <div className="v-drag-container">
            <div className="v-preview-section">
              <h3 className="v-preview-title">
                {activeTab === 'desktop' ? '桌機版預覽' : '手機版預覽'}
              </h3>
              <div className={`v-sidebar-preview ${activeTab === 'desktop' ? 'v-desktop' : 'v-mobile'}`}>
                {sidebarOrder[activeTab].map((moduleId, index) => (
                  <div key={moduleId} className="v-preview-item">
                    {getModuleIcon(moduleId)}
                    <span className="v-preview-text">{getModuleName(moduleId)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="v-drag-section">
              <h3 className="v-drag-title">拖放排序</h3>
              <div className="v-drag-list">
                {sidebarOrder[activeTab].map((moduleId, index) => (
                  <div
                    key={moduleId}
                    className={`v-drag-item ${
                      draggedItem === moduleId ? 'v-dragging' : ''
                    } ${
                      dragOverIndex === index ? 'v-drag-over' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, moduleId, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="v-drag-handle">
                      <GripVertical size={16} />
                    </div>
                    {getModuleIcon(moduleId)}
                    <span className="v-drag-text">{getModuleName(moduleId)}</span>
                    <span className="v-drag-order">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="v-setting-actions">
            <button
              className="v-button variant-outline"
              onClick={resetToDefault}
            >
              <RotateCcw size={16} />
              重設為預設
            </button>
            <button
              className={`v-button variant-primary ${hasUnsavedChanges ? 'v-highlight' : ''}`}
              onClick={saveSidebarOrder}
              disabled={!hasUnsavedChanges}
            >
              <Save size={16} />
              {hasUnsavedChanges ? '儲存變更' : '已儲存'}
            </button>
          </div>
        </div>

      <style jsx>{`
        /* Venturo 設定頁面樣式 */
        .v-settings-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .v-setting-section {
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-xl);
          border-bottom: 1px solid rgba(212, 196, 160, 0.1);
        }

        .v-setting-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .v-section-header {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .v-section-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .v-section-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px 0;
        }

        .v-section-description {
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        /* 安全設定 */
        .v-security-items {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .v-security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(212, 196, 160, 0.1);
          border-radius: var(--radius-lg);
        }

        .v-security-item.v-danger {
          border-color: rgba(244, 67, 54, 0.2);
          background: rgba(244, 67, 54, 0.02);
        }

        .v-security-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .v-security-item.v-danger .v-security-info h4 {
          color: #F44336;
        }

        .v-security-info p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        /* 主題設定 */
        .v-theme-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .v-theme-option {
          position: relative;
        }

        .v-theme-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .v-theme-card {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: 2px solid rgba(212, 196, 160, 0.2);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.5);
        }

        .v-theme-card:hover {
          border-color: rgba(212, 196, 160, 0.4);
          box-shadow: 0 4px 12px rgba(212, 196, 160, 0.1);
        }

        .v-theme-option input[type="radio"]:checked + .v-theme-card {
          border-color: var(--primary);
          background: rgba(212, 196, 160, 0.05);
          box-shadow: 0 4px 12px rgba(212, 196, 160, 0.2);
        }

        .v-theme-preview {
          height: 80px;
          border-radius: var(--radius-md);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(212, 196, 160, 0.2);
        }

        .v-theme-preview.v-light {
          background: white;
        }

        .v-theme-preview.v-dark {
          background: #333;
        }

        .v-theme-preview.v-auto {
          background: linear-gradient(45deg, white 50%, #333 50%);
        }

        .v-preview-header {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          height: 12px;
          background: rgba(212, 196, 160, 0.3);
          border-radius: 4px;
        }

        .v-preview-sidebar {
          position: absolute;
          top: 24px;
          left: 8px;
          width: 24px;
          bottom: 8px;
          background: rgba(212, 196, 160, 0.5);
          border-radius: 4px;
        }

        .v-preview-content {
          position: absolute;
          top: 24px;
          left: 36px;
          right: 8px;
          bottom: 8px;
          background: rgba(212, 196, 160, 0.2);
          border-radius: 4px;
        }

        .v-theme-card span {
          text-align: center;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .v-coming-soon-notice {
          text-align: center;
          padding: var(--spacing-md);
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: var(--radius-md);
        }

        /* 側邊欄排序 */
        .v-platform-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: var(--spacing-lg);
          background: rgba(212, 196, 160, 0.1);
          border-radius: var(--radius-lg);
          padding: 4px;
          width: fit-content;
        }

        .v-tab {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-lg);
          border: none;
          background: transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 500;
          color: #666;
          transition: all 0.2s ease;
        }

        .v-tab.v-active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(212, 196, 160, 0.3);
        }

        .v-drag-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-lg);
        }

        .v-preview-section,
        .v-drag-section {
          background: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          border: 1px solid rgba(212, 196, 160, 0.1);
        }

        .v-preview-title,
        .v-drag-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 var(--spacing-md) 0;
        }

        .v-sidebar-preview {
          border: 2px solid rgba(212, 196, 160, 0.2);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .v-sidebar-preview.v-desktop {
          max-height: 400px;
          overflow-y: auto;
        }

        .v-sidebar-preview.v-mobile {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          padding: var(--spacing-sm);
          gap: var(--spacing-sm);
        }

        .v-preview-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(255, 255, 255, 0.7);
          border-bottom: 1px solid rgba(212, 196, 160, 0.1);
          font-size: 14px;
          color: #333;
        }

        .v-sidebar-preview.v-mobile .v-preview-item {
          flex-direction: column;
          gap: 4px;
          padding: var(--spacing-xs) var(--spacing-sm);
          border: none;
          border-radius: var(--radius-sm);
          text-align: center;
          min-width: 80px;
        }

        .v-preview-text {
          font-weight: 500;
        }

        .v-sidebar-preview.v-mobile .v-preview-text {
          font-size: 10px;
          line-height: 1.2;
        }

        .v-drag-list {
          min-height: 200px;
        }

        .v-drag-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: white;
          border: 1px solid rgba(212, 196, 160, 0.2);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
          cursor: grab;
          transition: all 0.2s ease;
          user-select: none;
        }

        .v-drag-item:hover {
          box-shadow: 0 4px 12px rgba(212, 196, 160, 0.2);
          border-color: rgba(212, 196, 160, 0.4);
        }

        .v-drag-item.v-dragging {
          opacity: 0.5;
          box-shadow: 0 8px 24px rgba(212, 196, 160, 0.3);
          transform: rotate(2deg);
          cursor: grabbing;
        }

        .v-drag-item.v-drag-over {
          background: rgba(212, 196, 160, 0.1);
          border-color: var(--primary);
        }

        .v-drag-handle {
          color: #666;
          cursor: grab;
        }

        .v-drag-text {
          flex: 1;
          font-weight: 500;
          color: #333;
        }

        .v-drag-order {
          font-size: 12px;
          color: #666;
          background: rgba(212, 196, 160, 0.1);
          padding: 4px var(--spacing-sm);
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        .icon {
          width: 16px;
          height: 16px;
          color: var(--primary);
        }

        .v-setting-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm);
          padding-top: var(--spacing-lg);
          border-top: 1px solid rgba(212, 196, 160, 0.2);
        }

        .v-highlight {
          animation: v-pulse 2s infinite;
        }

        @keyframes v-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #666;
          font-size: 16px;
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .v-drag-container {
            grid-template-columns: 1fr;
          }

          .v-platform-tabs {
            width: 100%;
            justify-content: center;
          }

          .v-tab {
            flex: 1;
            justify-content: center;
          }

          .v-setting-actions,
          .v-settings-actions {
            flex-direction: column;
          }

          .v-security-item {
            flex-direction: column;
            gap: var(--spacing-sm);
            text-align: center;
          }

          .v-theme-options {
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
