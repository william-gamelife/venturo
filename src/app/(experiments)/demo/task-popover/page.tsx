'use client'

import { useState } from 'react'
import TaskDetailDialog from '@/components/TaskDetailDialog'

// 模擬任務數據
const mockTasks = [
  {
    id: '1',
    title: '完成每日運動',
    description: '跑步30分鐘或做瑜伽，保持身體健康',
    status: 'pending' as const,
    type: 'task' as const,
    tags: ['健康', '日常'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: '學習 React Hooks',
    description: '完成線上課程第三章，並做練習題',
    status: 'in_progress' as const,
    type: 'task' as const,
    tags: ['學習', '程式'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: '整理房間',
    description: '清理書桌，整理衣櫃，打掃地板',
    status: 'pending' as const,
    type: 'task' as const,
    tags: ['家務'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
]

export default function TaskPopoverDemo() {
  const [selectedTask, setSelectedTask] = useState<typeof mockTasks[0] | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 })

  const handleTaskClick = (task: typeof mockTasks[0], event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    
    setDialogPosition({ x, y })
    setSelectedTask(task)
    setShowDialog(true)
  }

  const handleSave = (updatedData: any) => {
    console.log('保存任務:', updatedData)
    setShowDialog(false)
  }

  const handleDelete = (taskId: string) => {
    console.log('刪除任務:', taskId)
    setShowDialog(false)
  }

  return (
    <div className="demo-container">
      {/* 標題區 */}
      <div className="demo-header">
        <h1 className="demo-title">任務 Popover 展示</h1>
        <p className="demo-subtitle">點擊任務卡片體驗從點擊位置彈出的 Popover 效果</p>
      </div>

      {/* 功能特色展示 */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📍</div>
          <h3>智能定位</h3>
          <p>從點擊位置彈出，自動邊界檢測</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>快速編輯</h3>
          <p>標題、描述即時修改，UX體驗優先</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>留言系統</h3>
          <p>支援新增留言，記錄時間戳記</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>精簡設計</h3>
          <p>去除冗餘功能，專注核心需求</p>
        </div>
      </div>

      {/* 操作步驟說明 */}
      <div className="steps-section">
        <h2>操作步驟</h2>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>點擊任務卡</h4>
              <p>點擊下方任何一個任務卡片</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Popover 彈出</h4>
              <p>從點擊位置彈出編輯視窗</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>編輯內容</h4>
              <p>修改標題、描述或新增留言</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>儲存或關閉</h4>
              <p>點擊儲存或點選外部區域關閉</p>
            </div>
          </div>
        </div>
      </div>

      {/* 互動展示區 */}
      <div className="demo-playground">
        <h2>互動展示區</h2>
        <p>試試點擊不同位置的任務卡，觀察 Popover 如何智能定位</p>
        
        <div className="task-grid">
          {mockTasks.map((task, index) => (
            <div 
              key={task.id} 
              className={`demo-task-card ${task.status}`}
              onClick={(e) => handleTaskClick(task, e)}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <span className={`task-status ${task.status}`}>
                  {task.status === 'pending' ? '準備區' : 
                   task.status === 'in_progress' ? '等待區' : '已完成'}
                </span>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-tags">
                {task.tags.map(tag => (
                  <span key={tag} className="task-tag">{tag}</span>
                ))}
              </div>
              <div className="click-hint">點擊體驗 Popover</div>
            </div>
          ))}
        </div>
      </div>

      {/* 設計理念說明 */}
      <div className="design-philosophy">
        <h2>設計理念</h2>
        <div className="philosophy-grid">
          <div className="philosophy-item">
            <h4>🚀 速度優先</h4>
            <p>輕量級彈窗，快速載入，避免滿版 modal 的沉重感</p>
          </div>
          <div className="philosophy-item">
            <h4>🎯 精準互動</h4>
            <p>從點擊位置彈出，建立視覺連接，用戶清楚知道在編輯哪個任務</p>
          </div>
          <div className="philosophy-item">
            <h4>✨ 減法設計</h4>
            <p>移除狀態選擇、標籤管理等複雜功能，專注於核心編輯需求</p>
          </div>
          <div className="philosophy-item">
            <h4>💡 智能體驗</h4>
            <p>自動邊界檢測、快速鍵支援、點外關閉等現代化交互體驗</p>
          </div>
        </div>
      </div>

      {/* 任務詳細資訊對話框 */}
      <TaskDetailDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        task={selectedTask}
        onSave={handleSave}
        onDelete={handleDelete}
        position={dialogPosition}
      />

      <style jsx>{`
        .demo-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fef7e6, #f9f3e8);
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .demo-title {
          font-size: 48px;
          font-weight: 700;
          color: #2d2d2d;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #c9a961, #8b7355);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .demo-subtitle {
          font-size: 18px;
          color: #6d685f;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto 80px;
        }

        .feature-card {
          background: white;
          padding: 32px 24px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(201, 169, 97, 0.1);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .feature-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #2d2d2d;
          margin-bottom: 12px;
        }

        .feature-card p {
          color: #6d685f;
          line-height: 1.5;
          margin: 0;
        }

        .steps-section {
          max-width: 1200px;
          margin: 0 auto 80px;
        }

        .steps-section h2 {
          text-align: center;
          font-size: 32px;
          color: #2d2d2d;
          margin-bottom: 40px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          border-left: 4px solid #c9a961;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-content h4 {
          font-size: 16px;
          color: #2d2d2d;
          margin-bottom: 8px;
        }

        .step-content p {
          color: #6d685f;
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .demo-playground {
          max-width: 1200px;
          margin: 0 auto 80px;
        }

        .demo-playground h2 {
          text-align: center;
          font-size: 32px;
          color: #2d2d2d;
          margin-bottom: 16px;
        }

        .demo-playground > p {
          text-align: center;
          color: #6d685f;
          margin-bottom: 40px;
          font-size: 16px;
        }

        .task-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          perspective: 1000px;
        }

        .demo-task-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(201, 169, 97, 0.15);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .demo-task-card:hover {
          transform: translateY(-8px) rotateX(2deg);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border-color: rgba(201, 169, 97, 0.3);
        }

        .demo-task-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #c9a961, #e4d4a8);
        }

        .demo-task-card.pending::before {
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
        }

        .demo-task-card.in_progress::before {
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .task-title {
          font-size: 18px;
          font-weight: 600;
          color: #2d2d2d;
          margin: 0;
          flex: 1;
          margin-right: 12px;
        }

        .task-status {
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
          white-space: nowrap;
        }

        .task-status.pending {
          background: rgba(251, 191, 36, 0.1);
          color: #d97706;
        }

        .task-status.in_progress {
          background: rgba(139, 92, 246, 0.1);
          color: #7c3aed;
        }

        .task-description {
          color: #6d685f;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .task-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .task-tag {
          background: rgba(201, 169, 97, 0.1);
          color: #8b7355;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 500;
        }

        .click-hint {
          text-align: center;
          color: #c9a961;
          font-size: 12px;
          font-weight: 500;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .demo-task-card:hover .click-hint {
          opacity: 1;
        }

        .design-philosophy {
          max-width: 1200px;
          margin: 0 auto;
        }

        .design-philosophy h2 {
          text-align: center;
          font-size: 32px;
          color: #2d2d2d;
          margin-bottom: 40px;
        }

        .philosophy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .philosophy-item {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          padding: 24px;
          border-radius: 12px;
          border: 1px solid rgba(201, 169, 97, 0.1);
        }

        .philosophy-item h4 {
          font-size: 16px;
          color: #2d2d2d;
          margin-bottom: 12px;
        }

        .philosophy-item p {
          color: #6d685f;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .demo-container {
            padding: 20px 16px;
          }

          .demo-title {
            font-size: 36px;
          }

          .features-grid,
          .steps-grid,
          .task-grid,
          .philosophy-grid {
            grid-template-columns: 1fr;
          }

          .step-item {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}