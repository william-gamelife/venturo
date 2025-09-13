import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import { Clock, Zap } from 'lucide-react'
import { VersionIndicator } from '@/components/VersionIndicator'

export default function TimeboxPage() {
  return (
    <ModuleLayout
      header={{
        icon: Icons.timebox,
        title: "Timebox 實驗功能",
        subtitle: "時間管理與專注力提升工具",
        actions: (
          <div className="v-experiment-badge">
            <Zap size={16} />
            <span>實驗中</span>
          </div>
        )
      }}
    >
      <div className="v-experiment-container">
        <div className="v-experiment-card">
          <div className="v-experiment-icon">
            <Clock size={48} />
          </div>
          <h2 className="v-experiment-title">Timebox 功能開發中</h2>
          <p className="v-experiment-description">
            我們正在開發全新的時間管理功能，包括番茄鐘計時器、專注會話追蹤、
            以及智能任務分配系統。敬請期待！
          </p>
          <div className="v-experiment-features">
            <div className="v-feature-item">
              <span className="v-feature-dot"></span>
              <span>番茄鐘計時器</span>
            </div>
            <div className="v-feature-item">
              <span className="v-feature-dot"></span>
              <span>專注會話追蹤</span>
            </div>
            <div className="v-feature-item">
              <span className="v-feature-dot"></span>
              <span>智能任務分配</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Venturo 實驗功能樣式 */
        .v-experiment-badge {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: linear-gradient(135deg, #FFB800, #FF8A00);
          color: white;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .v-experiment-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          padding: var(--spacing-xl);
        }

        .v-experiment-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          text-align: center;
          max-width: 500px;
          width: 100%;
          border: 1px solid #E5E5E5;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .v-experiment-icon {
          display: flex;
          justify-content: center;
          margin-bottom: var(--spacing-lg);
          color: var(--primary);
          opacity: 0.7;
        }

        .v-experiment-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin: 0 0 var(--spacing-md) 0;
        }

        .v-experiment-description {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 var(--spacing-lg) 0;
        }

        .v-experiment-features {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          align-items: flex-start;
          text-align: left;
        }

        .v-feature-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 14px;
          color: #333;
        }

        .v-feature-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .v-experiment-container {
            padding: var(--spacing-lg);
            min-height: 300px;
          }

          .v-experiment-card {
            padding: var(--spacing-lg);
          }

          .v-experiment-title {
            font-size: 20px;
          }

          .v-experiment-description {
            font-size: 14px;
          }
        }
      `}</style>

      <VersionIndicator
        page="Timebox實驗"
        authSystem="none"
        version="0.1"
        status="info"
      />
    </ModuleLayout>
  )
}