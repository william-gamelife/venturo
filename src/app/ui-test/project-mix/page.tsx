'use client'

export default function ProjectMixTest() {
  return (
    <div className="test-page">
      {/* Lamp 聚焦當前專案 */}
      <div className="spotlight-project">
        <div className="lamp-effect"></div>
        <h2>當前專案：網站改版</h2>
      </div>
      
      {/* Bento Grid 不同大小的專案卡片 */}
      <div className="project-bento">
        <div className="project-card featured">
          <div className="glow-border"></div>
          <h3>重點專案</h3>
          <div className="progress">70%</div>
        </div>
        
        <div className="project-card normal">
          <h3>進行中專案</h3>
        </div>
        
        <div className="project-card small">
          <h3>待開始</h3>
        </div>
      </div>
      
      {/* 可伸縮的詳情面板 */}
      <div className="detail-panel">
        <div className="resize-handle">⋮</div>
        <h3>專案詳情</h3>
        <p>拖動左邊調整寬度</p>
      </div>
      
      <style jsx>{`
        .test-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
          padding: 20px;
          position: relative;
        }
        
        /* Lamp 聚光燈效果 */
        .spotlight-project {
          position: relative;
          text-align: center;
          padding: 60px 20px;
          margin-bottom: 40px;
        }
        
        .lamp-effect {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 300px;
          background: conic-gradient(from 180deg, transparent, rgba(201,169,97,0.3), transparent);
          filter: blur(60px);
          pointer-events: none;
        }
        
        /* Bento 專案網格 */
        .project-bento {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .project-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          position: relative;
        }
        
        .project-card.featured {
          grid-column: span 3;
          grid-row: span 2;
        }
        
        .project-card.normal {
          grid-column: span 2;
        }
        
        .project-card.small {
          grid-column: span 1;
        }
        
        /* Glowing border for featured */
        .glow-border {
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, #c9a961, transparent, #e4d4a8);
          border-radius: 16px;
          opacity: 0.6;
          z-index: -1;
          animation: rotate 3s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* 可調整面板 */
        .detail-panel {
          position: fixed;
          right: 0;
          top: 0;
          height: 100vh;
          width: 300px;
          background: white;
          box-shadow: -5px 0 20px rgba(0,0,0,0.1);
          padding: 20px;
        }
        
        .resize-handle {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 60px;
          background: #c9a961;
          border-radius: 0 10px 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ew-resize;
          color: white;
        }
      `}</style>
    </div>
  )
}