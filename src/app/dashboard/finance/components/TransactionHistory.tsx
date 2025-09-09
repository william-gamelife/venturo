'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'

interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string
  categoryIcon: string
  categoryColor: string
  date: string
  description?: string
  tags: string[]
  fromAccount?: string
  toAccount?: string
  isRecurring: boolean
  expEarned: number
}

export function TransactionHistory() {
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all')
  const [selectedPeriod, setSelectedPeriod] = useState('this_month')
  const [showAddTransaction, setShowAddTransaction] = useState(false)

  // TODO: 載入實際交易記錄資料
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedType !== 'all' && transaction.type !== selectedType) return false
    
    // 簡化的期間篩選
    const transactionDate = new Date(transaction.date)
    const now = new Date()
    
    switch (selectedPeriod) {
      case 'today':
        return transactionDate.toDateString() === now.toDateString()
      case 'this_week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return transactionDate >= weekAgo
      case 'this_month':
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear()
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        return transactionDate.getMonth() === lastMonth.getMonth() && 
               transactionDate.getFullYear() === lastMonth.getFullYear()
      default:
        return true
    }
  })

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income': return ''
      case 'expense': return ''
      case 'transfer': return ''
      default: return ''
    }
  }

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'income': return '#10B981'
      case 'expense': return '#EF4444'
      case 'transfer': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExp = filteredTransactions
    .reduce((sum, t) => sum + t.expEarned, 0)

  const getGameMessage = () => {
    const messages = [
      ' 每筆記帳都能獲得經驗值！',
      ' 持續記帳解鎖更多成就！',
      ' 您的理財等級正在提升！',
      ' 成為記帳高手指日可待！',
      ' 養成記帳習慣，財富自然來！'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return (
    <>
      <div className="transaction-header">
        <div className="header-info">
          <h2> 收支記錄</h2>
          <p>記錄每一筆收支，培養理財好習慣</p>
          <div className="game-message">
            {getGameMessage()}
          </div>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary" 
            onClick={() => setShowAddTransaction(true)}
          >
            ➕ 快速記帳
          </Button>
          <Button variant="ghost">
             收支分析
          </Button>
        </div>
      </div>

      {/* 統計概覽 */}
      <div className="stats-overview">
        <div className="stat-card income">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <span className="stat-label">總收入</span>
            <span className="stat-value">NT$ {totalIncome.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="stat-card expense">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <span className="stat-label">總支出</span>
            <span className="stat-value">NT$ {totalExpense.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="stat-card net">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <span className="stat-label">淨收益</span>
            <span className={`stat-value ${totalIncome - totalExpense >= 0 ? 'positive' : 'negative'}`}>
              NT$ {Math.abs(totalIncome - totalExpense).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="stat-card exp">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <span className="stat-label">獲得經驗</span>
            <span className="stat-value exp-value">{totalExp} EXP</span>
          </div>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="filters">
        <div className="filter-group">
          <label>交易類型</label>
          <div className="type-filters">
            {[
              { id: 'all', name: '全部', icon: '' },
              { id: 'income', name: '收入', icon: '' },
              { id: 'expense', name: '支出', icon: '' },
              { id: 'transfer', name: '轉帳', icon: '' }
            ].map((type) => (
              <button
                key={type.id}
                className={`filter-btn ${selectedType === type.id ? 'active' : ''}`}
                onClick={() => setSelectedType(type.id as any)}
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>時間範圍</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="today">今天</option>
            <option value="this_week">本週</option>
            <option value="this_month">本月</option>
            <option value="last_month">上月</option>
            <option value="all">全部</option>
          </select>
        </div>
      </div>

      {/* 交易列表 */}
      <div className="transactions-list">
        <div className="list-header">
          <h3>交易記錄 ({filteredTransactions.length})</h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>暫無交易記錄</h3>
            <p>開始記錄您的第一筆收支，獲得經驗值獎勵！</p>
            <Button variant="primary" onClick={() => setShowAddTransaction(true)}>
              ➕ 立即記帳
            </Button>
          </div>
        ) : (
          <div className="transactions-grid">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-main">
                  <div className="transaction-icon-section">
                    <div 
                      className="category-icon" 
                      style={{ backgroundColor: `${transaction.categoryColor}15` }}
                    >
                      {transaction.categoryIcon}
                    </div>
                    <div 
                      className="type-badge" 
                      style={{ backgroundColor: getTypeColor(transaction.type) }}
                    >
                      {getTypeIcon(transaction.type)}
                    </div>
                  </div>

                  <div className="transaction-details">
                    <div className="transaction-title">
                      <h4>{transaction.title}</h4>
                      {transaction.isRecurring && <span className="recurring-badge"></span>}
                    </div>
                    <div className="transaction-meta">
                      <span className="category">{transaction.category}</span>
                      <span className="date">{transaction.date}</span>
                    </div>
                    {transaction.description && (
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                    )}
                    {transaction.tags.length > 0 && (
                      <div className="transaction-tags">
                        {transaction.tags.map((tag, index) => (
                          <span key={index} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="transaction-amount">
                    <div 
                      className="amount" 
                      style={{ color: getTypeColor(transaction.type) }}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}NT$ {transaction.amount.toLocaleString()}
                    </div>
                    <div className="exp-earned">
                      +{transaction.expEarned} EXP
                    </div>
                  </div>
                </div>

                {(transaction.fromAccount || transaction.toAccount) && (
                  <div className="account-info">
                    {transaction.type === 'transfer' ? (
                      <span>{transaction.fromAccount} → {transaction.toAccount}</span>
                    ) : transaction.type === 'expense' ? (
                      <span>從 {transaction.fromAccount}</span>
                    ) : (
                      <span>到 {transaction.toAccount}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新增交易模態框 */}
      {showAddTransaction && (
        <div className="modal-overlay" onClick={() => setShowAddTransaction(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3> 快速記帳</h3>
              <button className="close-btn" onClick={() => setShowAddTransaction(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>此功能正在開發中，敬請期待！ </p>
              <p>未來您可以在這裡：</p>
              <ul>
                <li> 記錄收入支出</li>
                <li> 設定分類和標籤</li>
                <li> 拍攝收據照片</li>
                <li> 自動分配預算</li>
                <li> 獲得記帳經驗值</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .transaction-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.8);
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

        .game-message {
          font-size: 14px;
          color: #c9a961;
          font-style: italic;
          padding: 8px 12px;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 8px;
          border-left: 3px solid #c9a961;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 24px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .stat-card.income .stat-icon {
          background: rgba(16, 185, 129, 0.15);
        }

        .stat-card.expense .stat-icon {
          background: rgba(239, 68, 68, 0.15);
        }

        .stat-card.net .stat-icon {
          background: rgba(59, 130, 246, 0.15);
        }

        .stat-card.exp .stat-icon {
          background: rgba(245, 158, 11, 0.15);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 12px;
          color: #6d685f;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #3a3833;
        }

        .stat-value.positive {
          color: #10B981;
        }

        .stat-value.negative {
          color: #EF4444;
        }

        .stat-value.exp-value {
          color: #F59E0B;
        }

        .filters {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          gap: 32px;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-size: 14px;
          font-weight: 500;
          color: #3a3833;
        }

        .type-filters {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 1);
        }

        .filter-btn.active {
          background: #c9a961;
          color: white;
          border-color: #c9a961;
        }

        .period-select {
          padding: 8px 12px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          cursor: pointer;
        }

        .transactions-list {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 16px;
          overflow: hidden;
        }

        .list-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.15);
          background: rgba(255, 255, 255, 0.5);
        }

        .list-header h3 {
          margin: 0;
          color: #3a3833;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .transactions-grid {
          padding: 24px;
        }

        .transaction-card {
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
          padding: 16px 0;
        }

        .transaction-card:last-child {
          border-bottom: none;
        }

        .transaction-main {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .transaction-icon-section {
          position: relative;
          flex-shrink: 0;
        }

        .category-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 20px;
        }

        .type-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          border: 2px solid white;
        }

        .transaction-details {
          flex: 1;
          min-width: 0;
        }

        .transaction-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .transaction-title h4 {
          margin: 0;
          color: #3a3833;
          font-size: 1rem;
          font-weight: 600;
        }

        .recurring-badge {
          font-size: 12px;
        }

        .transaction-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #6d685f;
        }

        .transaction-description {
          font-size: 13px;
          color: #6d685f;
          margin-bottom: 8px;
        }

        .transaction-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tag {
          font-size: 11px;
          color: #6d685f;
          background: rgba(201, 169, 97, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .transaction-amount {
          text-align: right;
          flex-shrink: 0;
        }

        .amount {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .exp-earned {
          font-size: 11px;
          color: #F59E0B;
          background: rgba(245, 158, 11, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }

        .account-info {
          margin-top: 8px;
          padding-left: 64px;
          font-size: 12px;
          color: #6d685f;
        }

        .empty-state {
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
          .transaction-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            align-self: stretch;
            justify-content: center;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .type-filters {
            flex-wrap: wrap;
          }

          .transaction-main {
            gap: 12px;
          }

          .transaction-amount {
            align-self: flex-start;
          }

          .account-info {
            padding-left: 60px;
          }
        }

        @media (max-width: 480px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }

          .transaction-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .transaction-amount {
            align-self: flex-end;
          }

          .account-info {
            padding-left: 0;
          }
        }
      `}</style>
    </>
  )
}