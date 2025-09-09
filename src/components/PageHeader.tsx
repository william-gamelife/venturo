'use client'

interface PageHeaderProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  actions?: React.ReactNode
}

export function PageHeader({ icon, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header" data-debug-pos={`page-header-${title.replace(/\s/g, '-')}`}>
      <div className="header-content">
        <div className="header-left">
          <div className="header-icon">{icon}</div>
          <div className="header-text">
            <h1 className="header-title">{title}</h1>
            <p className="header-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="header-actions">
          {actions}
        </div>
      </div>
      
      <style jsx>{`
        .page-header {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(248, 250, 252, 0.98) 25%,
            rgba(255, 255, 255, 0.95) 50%,
            rgba(254, 252, 232, 0.98) 75%,
            rgba(255, 255, 255, 0.95) 100%
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 16px;
          padding: 24px 24px;
          margin: 0 0 32px 0;
          box-shadow: 
            0 2px 12px rgba(201, 169, 97, 0.08),
            0 8px 32px rgba(201, 169, 97, 0.04);
          position: relative;
          width: 100%;
          overflow: hidden;
        }
        
        .page-header::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(135deg, 
            rgba(201, 169, 97, 0.2) 0%,
            rgba(255, 215, 0, 0.08) 25%,
            rgba(47, 79, 47, 0.08) 50%,
            rgba(255, 215, 0, 0.08) 75%,
            rgba(201, 169, 97, 0.2) 100%
          );
          border-radius: 16px;
          z-index: -1;
          animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
        
        .header-content {
          display: flex;
          align-items: center;
          margin: 0;
          gap: 24px;
          /* Fixed spacing issue */
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        
        .header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .header-title {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #3a3833, #c9a961, #2f4f2f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header-subtitle {
          font-size: 14px;
          color: #6d685f;
          margin: 0;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }
        
        @media (max-width: 768px) {
          .page-header {
            padding: 20px 20px;
            margin: 0 0 24px 0;
          }
          
          /* 保持水平排列，只縮小間距和字體 */
          .header-content {
            gap: 16px; /* 縮小間距但保持水平 */
          }
          
          .header-left {
            gap: 12px;
          }
          
          .header-icon {
            width: 40px;
            height: 40px;
          }
          
          .header-title {
            font-size: 20px;
          }
          
          .header-subtitle {
            font-size: 13px;
          }
          
          .header-actions {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
        
        @media (max-width: 480px) {
          .page-header {
            padding: 16px 16px;
            margin: 0 0 20px 0;
            border-radius: 12px;
          }
          
          /* 只有在很小的螢幕才垂直排列 */
          .header-content {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          
          .header-left {
            gap: 12px;
          }
          
          .header-icon {
            width: 36px;
            height: 36px;
          }
          
          .header-title {
            font-size: 18px;
          }
          
          .header-subtitle {
            font-size: 12px;
          }
          
          .header-actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  )
}