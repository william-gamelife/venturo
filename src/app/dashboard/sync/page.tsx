'use client'

export default function SyncPage() {
  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title">同步管理</h1>
        <p className="module-subtitle">數據同步和備份設定</p>
      </div>
      
      <div className="module-content">
        <div className="placeholder-message">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </div>
          <h3>同步管理功能開發中</h3>
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