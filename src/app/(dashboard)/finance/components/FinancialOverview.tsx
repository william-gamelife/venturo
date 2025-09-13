'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'

interface FinancialStats {
  totalAssets: number
  totalCash: number
  totalInvestment: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyBudget: number
  monthlySpent: number
  savingsRate: number
}

export function FinancialOverview() {
  const [stats, setStats] = useState<FinancialStats>({
    totalAssets: 0,
    totalCash: 0,
    totalInvestment: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlyBudget: 0,
    monthlySpent: 0,
    savingsRate: 0
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: 實際載入財務資料
    setTimeout(() => {
      setStats({
        totalAssets: 0,
        totalCash: 0,
        totalInvestment: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        monthlyBudget: 0,
        monthlySpent: 0,
        savingsRate: 0
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="overview-loading">
        <div className="loading-spinner"></div>
        <p>正在載入您的財務冒險資料...</p>
        
        <style jsx>{`
          .overview-loading {
            text-align: center;
            padding: 60px 20px;
            color: #6d685f;
          }
          
          .loading-spinner {
            font-size: 48px;
            margin-bottom: 16px;
            animation: spin 2s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const budgetUsagePercent = (stats.monthlySpent / stats.monthlyBudget) * 100
  const getBudgetStatus = () => {
    if (budgetUsagePercent < 70) return { color: '#10B981', message: '預算控制良好！繼續保持 ' }
    if (budgetUsagePercent < 90) return { color: '#F59E0B', message: '預算使用接近上限，要小心囉 ' }
    return { color: '#EF4444', message: '預算已超支，需要調整支出 🚨' }
  }

  const budgetStatus = getBudgetStatus()

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card total-assets">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>總資產</h3>
            <div className="stat-value">NT$ {stats.totalAssets.toLocaleString()}</div>
            <div className="stat-trend">-- %</div>
          </div>
        </div>

        <div className="stat-card cash">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>現金資產</h3>
            <div className="stat-value">NT$ {stats.totalCash.toLocaleString()}</div>
            <div className="stat-trend">-- %</div>
          </div>
        </div>

        <div className="stat-card investment">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>投資資產</h3>
            <div className="stat-value">NT$ {stats.totalInvestment.toLocaleString()}</div>
            <div className="stat-trend">-- %</div>
          </div>
        </div>

        <div className="stat-card savings-rate">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>儲蓄率</h3>
            <div className="stat-value">{stats.savingsRate}%</div>
            <div className="stat-trend">-- %</div>
          </div>
        </div>
      </div>

      <div className="monthly-overview">
        <div className="section-header">
          <h3> 本月財務概況</h3>
          <span className="month-indicator">{new Date().getFullYear()}年{new Date().getMonth() + 1}月</span>
        </div>
        
        <div className="monthly-stats">
          <div className="monthly-item income">
            <div className="monthly-icon"></div>
            <div className="monthly-content">
              <span className="monthly-label">本月收入</span>
              <span className="monthly-value">NT$ {stats.monthlyIncome.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="monthly-item expense">
            <div className="monthly-icon"></div>
            <div className="monthly-content">
              <span className="monthly-label">本月支出</span>
              <span className="monthly-value">NT$ {stats.monthlyExpense.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="monthly-item net">
            <div className="monthly-icon"></div>
            <div className="monthly-content">
              <span className="monthly-label">本月結餘</span>
              <span className="monthly-value positive">NT$ {(stats.monthlyIncome - stats.monthlyExpense).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="budget-overview">
        <div className="section-header">
          <h3> 預算使用情況</h3>
          <span className="budget-status" style={{ color: budgetStatus.color }}>
            {budgetStatus.message}
          </span>
        </div>
        
        <div className="budget-progress">
          <div className="budget-bar">
            <div 
              className="budget-fill" 
              style={{ 
                width: `${Math.min(budgetUsagePercent, 100)}%`,
                backgroundColor: budgetStatus.color
              }}
            ></div>
          </div>
          <div className="budget-details">
            <span>已使用 NT$ {stats.monthlySpent.toLocaleString()}</span>
            <span>預算 NT$ {stats.monthlyBudget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 169, 97, 0.15);
        }

        .stat-icon {
          font-size: 32px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 12px;
        }

        .stat-content h3 {
          margin: 0 0 8px 0;
          color: #6d685f;
          font-size: 14px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #3a3833;
          margin-bottom: 4px;
        }

        .stat-trend {
          font-size: 12px;
          font-weight: 500;
        }

        .stat-trend.positive {
          color: #10B981;
        }

        .monthly-overview, .budget-overview {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
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
          font-size: 1.2rem;
          font-weight: 600;
        }

        .month-indicator, .budget-status {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(201, 169, 97, 0.1);
          color: #6d685f;
        }

        .monthly-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .monthly-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
        }

        .monthly-icon {
          font-size: 24px;
        }

        .monthly-content {
          display: flex;
          flex-direction: column;
        }

        .monthly-label {
          font-size: 12px;
          color: #6d685f;
          margin-bottom: 4px;
        }

        .monthly-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #3a3833;
        }

        .monthly-value.positive {
          color: #10B981;
        }

        .budget-progress {
          margin-top: 16px;
        }

        .budget-bar {
          width: 100%;
          height: 8px;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .budget-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .budget-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6d685f;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .monthly-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}