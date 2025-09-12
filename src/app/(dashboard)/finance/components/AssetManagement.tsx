'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'

interface Asset {
  id: string
  name: string
  type: 'cash' | 'bank_account' | 'credit_card' | 'investment' | 'insurance' | 'property' | 'other'
  balance: number
  description?: string
  bankName?: string
  creditLimit?: number
  availableCredit?: number
  isHidden: boolean
  lastUpdated: string
}

interface AssetCategory {
  id: string
  name: string
  type: Asset['type']
  icon: string
  color: string
  description: string
}

export function AssetManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // 資產分類
  const categories: AssetCategory[] = [
    { id: 'all', name: '全部', type: 'cash', icon: '📊', color: '#8B5CF6', description: '所有資產' },
    { id: 'cash', name: '現金', type: 'cash', icon: '💵', color: '#10B981', description: '現金與錢包' },
    { id: 'bank_account', name: '銀行帳戶', type: 'bank_account', icon: '🏦', color: '#3B82F6', description: '銀行存款帳戶' },
    { id: 'credit_card', name: '信用卡', type: 'credit_card', icon: '💳', color: '#F59E0B', description: '信用卡額度' },
    { id: 'investment', name: '投資', type: 'investment', icon: '📈', color: '#EF4444', description: '股票、基金、債券' },
    { id: 'insurance', name: '保險', type: 'insurance', icon: '🚑', color: '#6366F1', description: '保險產品' },
    { id: 'property', name: '房地產', type: 'property', icon: '🏠', color: '#EC4899', description: '不動產資產' },
    { id: 'other', name: '其他', type: 'other', icon: '💼', color: '#6B7280', description: '其他資產' }
  ]

  // TODO: 載入實際資產資料
  const [assets, setAssets] = useState<Asset[]>([])

  const filteredAssets = selectedCategory === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === selectedCategory)

  const getAssetIcon = (type: Asset['type']) => {
    const category = categories.find(cat => cat.type === type)
    return category?.icon || ''
  }

  const getAssetColor = (type: Asset['type']) => {
    const category = categories.find(cat => cat.type === type)
    return category?.color || '#6B7280'
  }

  const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0)
  const filteredTotal = filteredAssets.reduce((sum, asset) => sum + asset.balance, 0)

  return (
    <>
      <div className="asset-header">
        <div className="header-info">
          <h2> 資產管理中心</h2>
          <p>管理您的所有資產，讓財富增值更有系統</p>
          <div className="total-assets">
            總資產價值: <span className="total-value">NT$ {totalAssets.toLocaleString()}</span>
          </div>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
          >
            ➕ 新增資產
          </Button>
          <Button variant="ghost">
             資產報告
          </Button>
        </div>
      </div>

      <div className="category-filter">
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              style={{ borderColor: category.color }}
            >
              <span className="category-icon">{category.icon}</span>
              <div className="category-info">
                <span className="category-name">{category.name}</span>
                <span className="category-count">
                  {category.id === 'all' 
                    ? `${assets.length} 項` 
                    : `${assets.filter(a => a.type === category.type).length} 項`
                  }
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="assets-section">
        <div className="section-header">
          <h3>
            {selectedCategory === 'all' ? '全部資產' : categories.find(c => c.id === selectedCategory)?.name}
            <span className="asset-count">({filteredAssets.length})</span>
          </h3>
          {selectedCategory !== 'all' && (
            <div className="category-total">
              小計: NT$ {filteredTotal.toLocaleString()}
            </div>
          )}
        </div>

        <div className="assets-grid">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="asset-card" style={{ borderLeftColor: getAssetColor(asset.type) }}>
              <div className="asset-header-card">
                <div className="asset-icon" style={{ backgroundColor: `${getAssetColor(asset.type)}15` }}>
                  {getAssetIcon(asset.type)}
                </div>
                <div className="asset-info">
                  <h4>{asset.name}</h4>
                  {asset.bankName && <span className="bank-name">{asset.bankName}</span>}
                  {asset.description && <span className="asset-desc">{asset.description}</span>}
                </div>
                <div className="asset-menu">⋯</div>
              </div>

              <div className="asset-balance">
                <div className="balance-main">
                  NT$ {asset.balance.toLocaleString()}
                </div>
                {asset.type === 'credit_card' && asset.creditLimit && (
                  <div className="credit-info">
                    <div className="credit-limit">
                      額度: NT$ {asset.creditLimit.toLocaleString()}
                    </div>
                    <div className="available-credit">
                      可用: NT$ {(asset.availableCredit || 0).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="asset-footer">
                <span className="last-updated">
                  更新於 {asset.lastUpdated}
                </span>
                <div className="asset-actions">
                  <button className="action-btn"></button>
                  <button className="action-btn"></button>
                  <button className="action-btn"></button>
                </div>
              </div>
            </div>
          ))}

          {filteredAssets.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>尚無此類型資產</h3>
              <p>點擊「新增資產」開始建立您的第一個{categories.find(c => c.id === selectedCategory)?.name}資產</p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                ➕ 新增資產
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 新增資產模態框 - 簡化版 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3> 新增資產</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>此功能正在開發中，敬請期待！ </p>
              <p>未來您可以在這裡：</p>
              <ul>
                <li> 新增銀行帳戶</li>
                <li> 設定信用卡</li>
                <li> 記錄投資組合</li>
                <li> 管理保險產品</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .asset-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .header-info h2 {
          margin: 0 0 8px 0;
          color: #3a3833;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .header-info p {
          margin: 0 0 12px 0;
          color: #6d685f;
        }

        .total-assets {
          font-size: 14px;
          color: #6d685f;
        }

        .total-value {
          font-weight: 700;
          font-size: 1.1rem;
          color: #10B981;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .category-filter {
          margin-bottom: 32px;
        }

        .category-tabs {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid transparent;
          border-radius: 18px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: max-content;
          backdrop-filter: blur(5px);
          position: relative;
          overflow: hidden;
        }

        .category-tab::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .category-tab:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .category-tab:hover::before {
          left: 100%;
        }

        .category-tab.active {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.9));
          border-color: currentColor;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .category-icon {
          font-size: 20px;
        }

        .category-name {
          font-weight: 600;
          color: #3a3833;
          display: block;
        }

        .category-count {
          font-size: 12px;
          color: #6d685f;
          display: block;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          margin: 0;
          color: #3a3833;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .asset-count {
          color: #6d685f;
          font-weight: 400;
          font-size: 1rem;
        }

        .category-total {
          font-weight: 600;
          color: #10B981;
        }

        .assets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .asset-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-left: 6px solid;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .asset-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .asset-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 40px rgba(201, 169, 97, 0.2), 0 8px 16px rgba(0, 0, 0, 0.05);
          border-color: rgba(201, 169, 97, 0.3);
        }

        .asset-card:hover::before {
          opacity: 1;
        }

        .asset-header-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .asset-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          font-size: 24px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .asset-card:hover .asset-icon {
          transform: scale(1.1);
          filter: brightness(1.1);
        }

        .asset-info {
          flex: 1;
        }

        .asset-info h4 {
          margin: 0 0 4px 0;
          color: #3a3833;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .bank-name, .asset-desc {
          display: block;
          font-size: 12px;
          color: #6d685f;
          margin-bottom: 2px;
        }

        .asset-menu {
          cursor: pointer;
          color: #6d685f;
          font-weight: bold;
          padding: 4px;
        }

        .asset-balance {
          margin-bottom: 16px;
        }

        .balance-main {
          font-size: 1.5rem;
          font-weight: 700;
          color: #3a3833;
          margin-bottom: 4px;
        }

        .credit-info {
          display: flex;
          gap: 16px;
        }

        .credit-limit, .available-credit {
          font-size: 11px;
          color: #6d685f;
        }

        .available-credit {
          color: #10B981;
        }

        .asset-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .last-updated {
          font-size: 11px;
          color: #6d685f;
        }

        .asset-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(201, 169, 97, 0.2);
          cursor: pointer;
          padding: 8px 10px;
          border-radius: 10px;
          transition: all 0.3s ease;
          font-size: 14px;
          backdrop-filter: blur(5px);
          position: relative;
          overflow: hidden;
        }

        .action-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(201, 169, 97, 0.4);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .action-btn:hover::before {
          width: 100%;
          height: 100%;
          border-radius: 10px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #6d685f;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #3a3833;
        }

        .empty-state p {
          margin: 0 0 20px 0;
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
        }

        .modal-header h3 {
          margin: 0;
          color: #3a3833;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-body ul {
          margin: 16px 0;
          padding-left: 20px;
        }

        .modal-body li {
          margin-bottom: 8px;
          color: #6d685f;
        }

        @media (max-width: 768px) {
          .asset-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            align-self: stretch;
            justify-content: center;
          }

          .category-tabs {
            gap: 8px;
          }

          .category-tab {
            padding: 12px 16px;
          }

          .assets-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  )
}