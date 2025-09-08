'use client'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

export default function TravelPdfPage() {
  return (
    <div className="module-container">
      <div>
        <PageHeader
          icon={Icons.plus}
          title="旅行 PDF"
          subtitle="旅行計劃和記錄文件生成"
          actions={
            <Button variant="primary">
              生成 PDF
            </Button>
          }
        />
      </div>
      
      <div className="module-content">
        <div className="placeholder-message">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <h3>旅行 PDF 功能開發中</h3>
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