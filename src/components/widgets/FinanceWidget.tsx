'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Icons } from '@/components/icons'

interface FinanceTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
}

interface FinanceStats {
  totalIncome: number
  totalExpense: number
  balance: number
  todayIncome: number
  todayExpense: number
}

export default function FinanceWidget() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [showQuickInput, setShowQuickInput] = useState(false)
  const [inputType, setInputType] = useState<'income' | 'expense'>('expense')
  const [quickAmount, setQuickAmount] = useState('')
  const [quickDescription, setQuickDescription] = useState('')
  const [quickCategory, setQuickCategory] = useState('')
  const [stats, setStats] = useState<FinanceStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    todayIncome: 0,
    todayExpense: 0
  })

  // 快速類別選項
  const expenseCategories = ['餐飲', '交通', '購物', '娛樂', '生活用品', '其他']
  const incomeCategories = ['薪資', '獎金', '投資', '副業', '其他']

  // 載入數據 - 使用 setTimeout 避免阻塞主線程
  useEffect(() => {
    setTimeout(() => {
      const savedTransactions = localStorage.getItem('finance_transactions')
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions)
          setTransactions(parsedTransactions)
          calculateStats(parsedTransactions)
        } catch (error) {
          console.error('Failed to parse finance transactions:', error)
          localStorage.removeItem('finance_transactions')
        }
      }
    }, 0)
  }, [])

  // 計算統計 - 使用 useCallback 優化
  const calculateStats = useCallback((transactionList: FinanceTransaction[]) => {
    const today = new Date().toDateString()
    
    let totalIncome = 0
    let totalExpense = 0
    let todayIncome = 0
    let todayExpense = 0

    transactionList.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount
        if (new Date(transaction.date).toDateString() === today) {
          todayIncome += transaction.amount
        }
      } else {
        totalExpense += transaction.amount
        if (new Date(transaction.date).toDateString() === today) {
          todayExpense += transaction.amount
        }
      }
    })

    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      todayIncome,
      todayExpense
    })
  }, [])

  // 添加交易
  const addTransaction = () => {
    if (!quickAmount.trim() || !quickDescription.trim()) {
      alert('請填寫金額和描述')
      return
    }

    const amount = parseFloat(quickAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('請輸入有效金額')
      return
    }

    const newTransaction: FinanceTransaction = {
      id: Date.now().toString(),
      type: inputType,
      amount: amount,
      description: quickDescription,
      category: quickCategory || (inputType === 'expense' ? expenseCategories[0] : incomeCategories[0]),
      date: new Date().toISOString()
    }

    const updatedTransactions = [newTransaction, ...transactions]
    setTransactions(updatedTransactions)
    calculateStats(updatedTransactions)
    
    // 儲存到localStorage
    localStorage.setItem('finance_transactions', JSON.stringify(updatedTransactions))

    // 重置表單
    setQuickAmount('')
    setQuickDescription('')
    setQuickCategory('')
    setShowQuickInput(false)
  }

  // 格式化金額 - 使用 useCallback 避免重複創建
  const formatAmount = useCallback((amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }, [])

  // 使用 useMemo 優化最近交易列表
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 3)
  }, [transactions])

  return (
    <div className="finance-widget">
      {/* 統計概覽 */}
      <div className="finance-stats">
        <div className="stat-item">
          <div className="stat-label">餘額</div>
          <div className={`stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
            {formatAmount(stats.balance)}
          </div>
        </div>
        <div className="stat-row">
          <div className="stat-mini">
            <div className="stat-mini-label">今日收入</div>
            <div className="stat-mini-value income">+{formatAmount(stats.todayIncome)}</div>
          </div>
          <div className="stat-mini">
            <div className="stat-mini-label">今日支出</div>
            <div className="stat-mini-value expense">-{formatAmount(stats.todayExpense)}</div>
          </div>
        </div>
      </div>

      {/* 快速操作按鈕 */}
      <div className="quick-actions">
        <button 
          className="quick-btn income-btn"
          onClick={() => {
            setInputType('income')
            setShowQuickInput(true)
          }}
        >
          <div className="btn-icon">💰</div>
          <div className="btn-text">收入</div>
        </button>
        <button 
          className="quick-btn expense-btn"
          onClick={() => {
            setInputType('expense')
            setShowQuickInput(true)
          }}
        >
          <div className="btn-icon">💸</div>
          <div className="btn-text">支出</div>
        </button>
      </div>

      {/* 最近交易 */}
      <div className="recent-transactions">
        <div className="section-title">最近交易</div>
        <div className="transaction-list">
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-desc">{transaction.description}</div>
                <div className="transaction-category">{transaction.category}</div>
              </div>
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="no-transactions">尚無交易記錄</div>
          )}
        </div>
      </div>

      {/* 快速輸入對話框 */}
      {showQuickInput && (
        <div className="quick-input-overlay" onClick={() => setShowQuickInput(false)}>
          <div className="quick-input-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{inputType === 'income' ? '💰 新增收入' : '💸 新增支出'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowQuickInput(false)}
              >
                ×
              </button>
            </div>
            
            <div className="input-form">
              <div className="form-group">
                <label>金額</label>
                <input
                  type="number"
                  placeholder="輸入金額"
                  value={quickAmount}
                  onChange={e => setQuickAmount(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>描述</label>
                <input
                  type="text"
                  placeholder="例如：午餐、薪水、投資收益"
                  value={quickDescription}
                  onChange={e => setQuickDescription(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>類別</label>
                <div className="category-grid">
                  {(inputType === 'expense' ? expenseCategories : incomeCategories).map(category => (
                    <button
                      key={category}
                      className={`category-btn ${quickCategory === category ? 'active' : ''}`}
                      onClick={() => setQuickCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowQuickInput(false)}>
                取消
              </button>
              <button className="submit-btn" onClick={addTransaction}>
                新增
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .finance-widget {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* 統計區域 */
        .finance-stats {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .stat-item {
          text-align: center;
          margin-bottom: 12px;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          line-height: 1;
        }

        .stat-value.positive {
          color: #059669;
        }

        .stat-value.negative {
          color: #dc2626;
        }

        .stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-mini {
          text-align: center;
        }

        .stat-mini-label {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 2px;
        }

        .stat-mini-value {
          font-size: 14px;
          font-weight: 600;
        }

        .stat-mini-value.income {
          color: #059669;
        }

        .stat-mini-value.expense {
          color: #dc2626;
        }

        /* 快速操作按鈕 */
        .quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .quick-btn {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .quick-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .income-btn {
          border-color: #10b981;
          color: #059669;
        }

        .income-btn:hover {
          background: rgba(16, 185, 129, 0.05);
          border-color: #059669;
        }

        .expense-btn {
          border-color: #f87171;
          color: #dc2626;
        }

        .expense-btn:hover {
          background: rgba(248, 113, 113, 0.05);
          border-color: #dc2626;
        }

        .btn-icon {
          font-size: 20px;
        }

        .btn-text {
          font-size: 14px;
          font-weight: 600;
        }

        /* 最近交易 */
        .recent-transactions {
          flex: 1;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .transaction-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .transaction-item:hover {
          border-color: #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .transaction-info {
          flex: 1;
        }

        .transaction-desc {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 2px;
        }

        .transaction-category {
          font-size: 12px;
          color: #64748b;
        }

        .transaction-amount {
          font-size: 14px;
          font-weight: 600;
        }

        .transaction-amount.income {
          color: #059669;
        }

        .transaction-amount.expense {
          color: #dc2626;
        }

        .no-transactions {
          text-align: center;
          color: #64748b;
          font-size: 14px;
          padding: 20px;
        }

        /* 快速輸入對話框 */
        .quick-input-overlay {
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
          backdrop-filter: blur(4px);
        }

        .quick-input-modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 400px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #64748b;
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f1f5f9;
        }

        .input-form {
          padding: 20px 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #C4A484;
          box-shadow: 0 0 0 3px rgba(196, 164, 132, 0.1);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .category-btn {
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-btn:hover {
          border-color: #C4A484;
        }

        .category-btn.active {
          background: #C4A484;
          color: white;
          border-color: #C4A484;
        }

        .modal-actions {
          padding: 16px 24px 20px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .submit-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #C4A484, #D4B5A0);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(196, 164, 132, 0.3);
        }
      `}</style>
    </div>
  )
}