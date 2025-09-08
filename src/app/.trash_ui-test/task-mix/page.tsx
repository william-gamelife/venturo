'use client'

export default function TaskMixTest() {
  return (
    <div className="test-page">
      <div className="layout">
        {/* 可調整寬度的側邊欄 */}
        <aside className="resizable-sidebar">
          <div className="sidebar-header">分類</div>
          <div className="category-list">
            <div className="category active">所有任務</div>
            <div className="category">今日待辦</div>
            <div className="category">重要事項</div>
          </div>
        </aside>
        
        {/* 主內容區 */}
        <main className="main-content">
          <div className="task-grid">
            <div className="task-card glowing">
              <div className="task-priority"></div>
              <h3>重要任務</h3>
              <p>這是一個會發光的重要任務</p>
            </div>
            <div className="task-card">
              <h3>一般任務</h3>
              <p>普通的任務卡片</p>
            </div>
          </div>
        </main>
      </div>
      
      {/* 手機版 Floating Dock */}
      <div className="mobile-dock">
        <button className="dock-btn">➕</button>
        <button className="dock-btn">📋</button>
        <button className="dock-btn">⭐</button>
        <button className="dock-btn">🔍</button>
      </div>
      
      <style jsx>{`
        .test-page {
          height: 100vh;
          background: #f8f8f8;
        }
        
        .layout {
          display: flex;
          height: 100%;
        }
        
        /* 可調整側邊欄 */
        .resizable-sidebar {
          width: 250px;
          background: white;
          border-right: 1px solid #e0e0e0;
          position: relative;
        }
        
        .resizable-sidebar::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          cursor: ew-resize;
          background: transparent;
        }
        
        .resizable-sidebar:hover::after {
          background: #c9a961;
        }
        
        /* 任務卡片 */
        .task-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        
        .task-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          position: relative;
          transition: all 0.3s;
        }
        
        /* Glowing 重要任務 */
        .task-card.glowing {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(201,169,97,0.4);
          }
          50% {
            box-shadow: 0 0 20px 10px rgba(201,169,97,0.4);
          }
        }
        
        /* Mobile Dock */
        .mobile-dock {
          display: none;
        }
        
        @media (max-width: 768px) {
          .resizable-sidebar {
            display: none;
          }
          
          .mobile-dock {
            display: flex;
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border-radius: 25px;
            padding: 10px;
            gap: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          
          .dock-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #c9a961, #e4d4a8);
            color: white;
            font-size: 20px;
            transition: transform 0.2s;
          }
          
          .dock-btn:active {
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  )
}