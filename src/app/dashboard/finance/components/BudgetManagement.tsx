'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'

interface BudgetCategory {
  id: string
  name: string
  icon: string
  color: string
  budgeted: number
  spent: number
  remaining: number
  alertThreshold: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  target: number
}

export function BudgetManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [showAddBudget, setShowAddBudget] = useState(false)

  // 預算分類資料
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: '飲食',
      icon: '🍽',
      color: '#EF4444',
      budgeted: 15000,
      spent: 12500,
      remaining: 2500,
      alertThreshold: 0.8
    },
    {
      id: '2',
      name: '交通',
      icon: '🚗',
      color: '#3B82F6',
      budgeted: 8000,
      spent: 6200,
      remaining: 1800,
      alertThreshold: 0.8
    },
    {
      id: '3',
      name: '娛樂',
      icon: '',
      color: '#8B5CF6',
      budgeted: 5000,
      spent: 3800,
      remaining: 1200,
      alertThreshold: 0.8
    },
    {
      id: '4',
      name: '購物',
      icon: '',
      color: '#F59E0B',
      budgeted: 10000,
      spent: 11500,
      remaining: -1500,
      alertThreshold: 0.8
    },
    {
      id: '5',
      name: '生活用品',
      icon: '',
      color: '#10B981',
      budgeted: 3000,
      spent: 2100,
      remaining: 900,
      alertThreshold: 0.8
    }
  ])

  // 成就系統
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: '預算新手',
      description: '完成第一次預算設定',
      icon: '',
      unlocked: true,
      progress: 1,
      target: 1
    },
    {
      id: '2',
      title: '節約達人',
      description: '連續3個月未超預算',
      icon: '',
      unlocked: false,
      progress: 2,
      target: 3
    },
    {
      id: '3',
      title: '理財高手',
      description: '儲蓄率達到30%以上',
      icon: '',
      unlocked: true,
      progress: 1,
      target: 1
    },
    {
      id: '4',
      title: '記帳勇者',
      description: '連續記帳30天',
      icon: '',
      unlocked: false,
      progress: 18,
      target: 30
    }
  ])

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0)
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent
  const overallProgress = (totalSpent / totalBudgeted) * 100

  const getBudgetStatus = (category: BudgetCategory) => {
    const usage = category.spent / category.budgeted
    if (usage > 1) return { status: 'over', message: '超支', color: '#EF4444' }
    if (usage > category.alertThreshold) return { status: 'warning', message: '注意', color: '#F59E0B' }
    return { status: 'good', message: '良好', color: '#10B981' }
  }

  const getMotivationalMessage = () => {
    const messages = [
      ' 每一筆精明的消費，都是向財務自由邁進的一步！',
      ' 控制預算就像練功一樣，越練越強！',
      ' 預算不是限制，而是實現夢想的工具！',
      ' 今天的節約，是明天的財富！',
      ' 您的理財冒險正在展開，加油！'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return (
    <>
      <div className="budget-header">
        <div className="header-info">
          <h2> 預算編列中心</h2>
          <p>用遊戲化方式管理預算，讓理財變得有趣！</p>
          <div className="motivational-message">
            {getMotivationalMessage()}
          </div>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary" 
            onClick={() => setShowAddBudget(true)}
          >
            ➕ 新增預算
          </Button>
          <Button variant="ghost">
             預算分析
          </Button>
        </div>
      </div>

      {/* 預算總覽 */}
      <div className="budget-overview-card">
        <div className="overview-header">
          <h3> 本月預算概況</h3>
          <div className="period-selector">
            <button 
              className={selectedPeriod === 'current' ? 'active' : ''}
              onClick={() => setSelectedPeriod('current')}
            >
              本月
            </button>
            <button 
              className={selectedPeriod === 'next' ? 'active' : ''}
              onClick={() => setSelectedPeriod('next')}
            >
              下月
            </button>
          </div>
        </div>
        
        <div className="overview-stats">
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <span className="stat-label">總預算</span>
              <span className="stat-value">NT$ {totalBudgeted.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <span className="stat-label">已支出</span>
              <span className="stat-value">NT$ {totalSpent.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <span className="stat-label">剩餘</span>
              <span className={`stat-value ${totalRemaining >= 0 ? 'positive' : 'negative'}`}>
                NT$ {Math.abs(totalRemaining).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span>整體預算使用率</span>
            <span className="progress-percent">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min(overallProgress, 100)}%`,
                backgroundColor: overallProgress > 100 ? '#EF4444' : overallProgress > 80 ? '#F59E0B' : '#10B981'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* 預算分類 */}
      <div className="budget-categories">
        <h3> 預算分類</h3>
        <div className="categories-grid">
          {budgetCategories.map((category) => {
            const status = getBudgetStatus(category)
            const usage = (category.spent / category.budgeted) * 100
            
            return (
              <div key={category.id} className="category-card" style={{ borderColor: category.color }}>
                <div className="category-header">
                  <div className="category-icon" style={{ backgroundColor: `${category.color}15` }}>
                    {category.icon}
                  </div>
                  <div className="category-info">
                    <h4>{category.name}</h4>
                    <span className="category-status" style={{ color: status.color }}>
                      {status.message}
                    </span>
                  </div>
                  <div className="category-menu">⋯</div>
                </div>

                <div className="category-amounts">
                  <div className="amount-row">
                    <span>預算</span>
                    <span>NT$ {category.budgeted.toLocaleString()}</span>
                  </div>
                  <div className="amount-row">
                    <span>支出</span>
                    <span style={{ color: category.spent > category.budgeted ? '#EF4444' : '#3a3833' }}>
                      NT$ {category.spent.toLocaleString()}
                    </span>
                  </div>
                  <div className="amount-row remaining">
                    <span>剩餘</span>
                    <span className={category.remaining >= 0 ? 'positive' : 'negative'}>
                      NT$ {Math.abs(category.remaining).toLocaleString()}
                      {category.remaining < 0 && ' (超支)'}
                    </span>
                  </div>
                </div>

                <div className="category-progress">
                  <div className="progress-bar small">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${Math.min(usage, 100)}%`,
                        backgroundColor: status.color
                      }}
                    ></div>
                  </div>
                  <span className="usage-percent">{usage.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 成就系統 */}
      <div className="achievements-section">
        <h3> 理財成就</h3>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`achievement-card ${achievement.unlocked ? 'unlocked' : ''}`}>
              <div className="achievement-icon">
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>
              <div className="achievement-content">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                {!achievement.unlocked && (
                  <div className="achievement-progress">
                    <div className="progress-bar tiny">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {achievement.progress} / {achievement.target}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 新增預算模態框 */}
      {showAddBudget && (
        <div className="modal-overlay" onClick={() => setShowAddBudget(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3> 新增預算分類</h3>
              <button className="close-btn" onClick={() => setShowAddBudget(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>此功能正在開發中，敬請期待！ </p>
              <p>未來您可以在這裡：</p>
              <ul>
                <li> 建立自訂預算分類</li>
                <li> 設定預算金額和目標</li>
                <li> 配置預算提醒</li>
                <li> 設定成就獎勵</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .budget-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.2);
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

        .motivational-message {
          font-size: 14px;
          color: #8B5CF6;
          font-style: italic;
          padding: 8px 12px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          border-left: 3px solid #8B5CF6;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .budget-overview-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .overview-header h3 {
          margin: 0;
          color: #3a3833;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .period-selector {
          display: flex;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .period-selector button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .period-selector button.active {
          background: #c9a961;
          color: white;
        }

        .overview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
        }

        .stat-icon {
          font-size: 24px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 12px;
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

        .progress-section {
          margin-top: 20px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6d685f;
        }

        .progress-percent {
          font-weight: 600;
          color: #3a3833;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar.small {
          height: 6px;
        }

        .progress-bar.tiny {
          height: 4px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .budget-categories {
          margin-bottom: 32px;
        }

        .budget-categories h3 {
          margin: 0 0 20px 0;
          color: #3a3833;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .category-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-left: 4px solid;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 169, 97, 0.15);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .category-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 20px;
        }

        .category-info {
          flex: 1;
        }

        .category-info h4 {
          margin: 0 0 4px 0;
          color: #3a3833;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .category-status {
          font-size: 12px;
          font-weight: 500;
        }

        .category-menu {
          cursor: pointer;
          color: #6d685f;
          padding: 4px;
        }

        .category-amounts {
          margin-bottom: 16px;
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 14px;
          color: #6d685f;
        }

        .amount-row.remaining {
          border-top: 1px solid rgba(201, 169, 97, 0.2);
          padding-top: 8px;
          margin-top: 8px;
          font-weight: 600;
        }

        .amount-row span:last-child {
          font-weight: 600;
          color: #3a3833;
        }

        .category-progress {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .usage-percent {
          font-size: 12px;
          font-weight: 600;
          color: #6d685f;
          min-width: 35px;
        }

        .achievements-section h3 {
          margin: 0 0 20px 0;
          color: #3a3833;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .achievement-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .achievement-card.unlocked {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(255, 255, 255, 0.9));
          border-color: rgba(16, 185, 129, 0.3);
        }

        .achievement-card:hover {
          transform: translateY(-1px);
        }

        .achievement-icon {
          font-size: 28px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(201, 169, 97, 0.1);
        }

        .achievement-card.unlocked .achievement-icon {
          background: rgba(16, 185, 129, 0.15);
        }

        .achievement-content {
          flex: 1;
        }

        .achievement-content h4 {
          margin: 0 0 4px 0;
          color: #3a3833;
          font-size: 1rem;
          font-weight: 600;
        }

        .achievement-content p {
          margin: 0 0 8px 0;
          color: #6d685f;
          font-size: 12px;
        }

        .achievement-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-text {
          font-size: 11px;
          color: #6d685f;
          min-width: 40px;
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
          .budget-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            align-self: stretch;
            justify-content: center;
          }

          .overview-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .overview-stats {
            grid-template-columns: 1fr;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}