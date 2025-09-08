'use client'

export default function DashboardMixTest() {
  return (
    <div className="test-page">
      {/* Lamp 效果做標題 */}
      <div className="lamp-header">
        <div className="lamp-glow"></div>
        <h1 className="lamp-title">Dashboard</h1>
        <p className="lamp-subtitle">Your productivity at a glance</p>
      </div>
      
      {/* Bento Grid 配合 Glowing */}
      <div className="bento-container">
        <div className="bento-item large glowing">
          <h3>今日待辦</h3>
          <div className="stat-number">12</div>
        </div>
        <div className="bento-item medium">
          <h3>本週專案</h3>
          <div className="progress-bar"></div>
        </div>
        <div className="bento-item small glowing">
          <h3>專注時間</h3>
          <div className="timer">2h 30m</div>
        </div>
      </div>
      
      <style jsx>{`
        .test-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, #1a1a1a, #2d2d2d);
          padding: 20px;
        }
        
        /* Lamp 效果 */
        .lamp-header {
          position: relative;
          text-align: center;
          padding: 80px 20px;
        }
        
        .lamp-glow {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(201,169,97,0.6) 0%, transparent 70%);
          filter: blur(40px);
        }
        
        .lamp-title {
          font-size: 48px;
          color: white;
          margin: 0;
          text-shadow: 0 0 30px rgba(201,169,97,0.5);
        }
        
        /* Bento Grid */
        .bento-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .bento-item {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,169,97,0.2);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        
        .bento-item.large {
          grid-column: span 2;
          grid-row: span 2;
        }
        
        .bento-item.medium {
          grid-column: span 2;
        }
        
        /* Glowing 效果 */
        .glowing::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #c9a961, #e4d4a8, #c9a961);
          border-radius: 20px;
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s;
          filter: blur(10px);
        }
        
        .glowing:hover::before {
          opacity: 0.6;
        }
        
        .bento-item h3 {
          color: #c9a961;
          margin: 0 0 16px 0;
        }
        
        .stat-number {
          font-size: 48px;
          color: white;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}