'use client'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

export default function FinancePage() {
  return (
    <div className="module-container">
      <div>
        <PageHeader
          icon={Icons.finance}
          title="財務管理"
          subtitle="收支和預算管理"
          actions={
            <>
              <Button variant="ghost" icon={Icons.plus}>
                新增記錄
              </Button>
              <Button variant="primary">
                匯出報表
              </Button>
            </>
          }
        />
      </div>
      
      <div className="module-content">
        <div className="placeholder-message">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6m0 0v6M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5"/>
            </svg>
          </div>
          <h3>財務管理功能開發中</h3>
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