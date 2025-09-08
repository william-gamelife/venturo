'use client'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

export default function CalendarPage() {
  return (
    <div className="module-container">
      <div>
        <PageHeader
          icon={Icons.calendar}
          title="行事曆"
          subtitle="日程安排和事件管理"
          actions={
            <>
              <Button variant="ghost" icon={Icons.plus}>
                新增事件
              </Button>
              <Button variant="primary">
                月檢視
              </Button>
            </>
          }
        />
      </div>
      
      <div className="module-content">
        <div className="placeholder-message">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3>行事曆功能開發中</h3>
          <p>此模組正在開發中，敬請期待</p>
        </div>
      </div>

      <style jsx>{`
        .module-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .module-header {
          margin-bottom: 32px;
        }

        .module-title {
          font-size: 28px;
          font-weight: 700;
          color: #3a3833;
          margin: 0 0 8px 0;
        }

        .module-subtitle {
          font-size: 16px;
          color: #6d685f;
          margin: 0;
        }

        .module-content {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 48px;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .placeholder-message {
          text-align: center;
          color: #6d685f;
        }

        .placeholder-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          color: #c9a961;
        }

        .placeholder-message h3 {
          margin: 0 0 8px 0;
          color: #3a3833;
          font-size: 1.5rem;
        }

        .placeholder-message p {
          margin: 0;
        }
      `}</style>
    </div>
  )
}