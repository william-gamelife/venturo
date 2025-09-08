'use client'

export default function ThemesPage() {
  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title">主題設定</h1>
        <p className="module-subtitle">界面主題和外觀設定</p>
      </div>
      
      <div className="module-content">
        <div className="placeholder-message">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M21 12h-6M9 12H3"/>
            </svg>
          </div>
          <h3>主題設定功能開發中</h3>
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