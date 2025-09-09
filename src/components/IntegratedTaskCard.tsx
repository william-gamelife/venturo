'use client'

import { useState } from 'react'
import { TodoItem } from '@/lib/types'

interface IntegratedTaskCardProps {
  todo: TodoItem
  userId: string
  worldMode: 'game' | 'corner'  // 模式切換
  onTodoUpdate: (todo: TodoItem) => void
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: TodoItem) => void
  selectedTasks?: Set<string>
  onToggleSelect?: (id: string) => void
  isDragging: boolean
  onDragStart: (e: React.DragEvent, todo: TodoItem) => void
  onDragEnd: () => void
  hasPackagingPermission?: boolean
}

export default function IntegratedTaskCard({
  todo,
  userId,
  worldMode,
  onTodoUpdate,
  onToggleComplete,
  onDelete,
  onEdit,
  selectedTasks,
  onToggleSelect,
  isDragging,
  onDragStart,
  onDragEnd,
  hasPackagingPermission
}: IntegratedTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(todo.isExpanded || false)
  const [showQuickActions, setShowQuickActions] = useState(false)

  // 專案類型檢查
  const isProject = todo.type === 'project'
  
  // 角落模式增強功能
  const showCornerFeatures = worldMode === 'corner' && !isProject
  
  // 計算子任務進度
  const getProjectProgress = () => {
    if (!isProject || !todo.subtasks) return null
    const completed = todo.subtasks.filter(s => s.completed).length
    const total = todo.subtasks.length
    return { completed, total, percentage: (completed / total) * 100 }
  }

  const progress = getProjectProgress()

  return (
    <>
    <div
      className={`task-card ${isProject ? 'project-card' : ''} ${selectedTasks?.has(todo.id) ? 'selected' : ''}`}
      draggable={!isDragging}
      onDragStart={(e) => onDragStart(e, todo)}
      onDragEnd={onDragEnd}
    >
      {/* 批次選擇框 - 角落模式專屬 */}
      {hasPackagingPermission && onToggleSelect && (
        <input
          type="checkbox"
          className="task-select-checkbox"
          checked={selectedTasks?.has(todo.id) || false}
          onChange={() => onToggleSelect(todo.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* 主要內容區 */}
      <div className="task-main-content">
        {/* 專案圖標或完成勾選框 */}
        {isProject ? (
          <span className="project-icon">📋</span>
        ) : (
          <input
            type="checkbox"
            className="task-checkbox"
            checked={todo.status === 'done'}
            onChange={() => onToggleComplete(todo.id)}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* 任務標題區 */}
        <div className="task-content">
          <div className="task-header">
            <h4 className="task-title">{todo.title}</h4>
            
            {/* 專案進度顯示 */}
            {isProject && progress && !isExpanded && (
              <span className="subtask-count">
                {progress.completed}/{progress.total}
              </span>
            )}
            
            {/* 角落模式標籤 */}
            {showCornerFeatures && (
              <div className="corner-mode-tags">
                {todo.businessType && (
                  <span className={`business-tag ${todo.businessType}`}>
                    {todo.businessType === 'group' ? '團體' : 
                     todo.businessType === 'order' ? '訂單' : '一般'}
                  </span>
                )}
                {todo.dataCompleteness && (
                  <span className={`completeness-tag ${todo.dataCompleteness}`}>
                    {todo.dataCompleteness === 'skeleton' ? '🦴' :
                     todo.dataCompleteness === 'basic' ? '📝' :
                     todo.dataCompleteness === 'detailed' ? '📋' : '✅'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 描述 */}
          {todo.description && (
            <p className="task-description">{todo.description}</p>
          )}

          {/* 角落模式額外資訊 */}
          {showCornerFeatures && todo.cornerModeData && (
            <div className="corner-mode-info">
              {todo.cornerModeData.contactPerson && (
                <div className="info-row">
                  <span className="info-label">聯絡人：</span>
                  <span>{todo.cornerModeData.contactPerson}</span>
                </div>
              )}
              {todo.cornerModeData.departureDate && (
                <div className="info-row">
                  <span className="info-label">出發日：</span>
                  <span>{new Date(todo.cornerModeData.departureDate).toLocaleDateString('zh-TW')}</span>
                </div>
              )}
              {todo.cornerModeData.totalMembers && (
                <div className="info-row">
                  <span className="info-label">人數：</span>
                  <span>{todo.cornerModeData.totalMembers}人</span>
                </div>
              )}
            </div>
          )}

          {/* 專案展開內容 */}
          {isProject && isExpanded && todo.subtasks && (
            <div className="subtasks-container">
              <div className="subtasks-header">
                <span>子任務</span>
                <button className="add-subtask-btn" onClick={() => {}}>
                  + 新增
                </button>
              </div>
              <div className="subtasks-list">
                {todo.subtasks.map(subtask => (
                  <div key={subtask.id} className="subtask-item">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => {
                        const updatedSubtasks = todo.subtasks?.map(s =>
                          s.id === subtask.id ? {...s, completed: !s.completed} : s
                        )
                        onTodoUpdate({...todo, subtasks: updatedSubtasks})
                      }}
                    />
                    <span className={`subtask-title ${subtask.completed ? 'completed' : ''}`}>
                      {subtask.title}
                    </span>
                    {subtask.assignee && (
                      <span className="subtask-assignee">{subtask.assignee}</span>
                    )}
                  </div>
                ))}
              </div>
              {/* 進度條 */}
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${progress?.percentage || 0}%`}}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="task-actions">
        {/* 專案展開/收合 */}
        {isProject && (
          <button 
            className="action-btn expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "收合" : "展開"}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        
        {/* 角落模式快速動作 */}
        {showCornerFeatures && (
          <button 
            className="action-btn quick-actions-btn"
            onClick={() => setShowQuickActions(!showQuickActions)}
            title="快速動作"
          >
            ⚡
          </button>
        )}
        
        {/* 編輯按鈕 */}
        <button 
          className="action-btn edit-btn"
          onClick={() => onEdit(todo)}
          title="編輯"
        >
          ✏️
        </button>
        
        {/* 刪除按鈕 */}
        <button 
          className="action-btn delete-btn"
          onClick={() => onDelete(todo.id)}
          title="刪除"
        >
          🗑️
        </button>
      </div>

      {/* 角落模式快速動作選單 */}
      {showCornerFeatures && showQuickActions && todo.cornerModeData?.quickActions && (
        <div className="quick-actions-menu">
          {todo.cornerModeData.quickActions.map(action => (
            <button key={action} className="quick-action-item">
              {action === '新增團體' && '👥'} {action}
            </button>
          ))}
        </div>
      )}
    </div>

    <style jsx>{`
      .task-card {
        border: 1px solid rgba(201, 169, 97, 0.2);
        border-radius: 12px;
        padding: 16px;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        cursor: move;
        position: relative;
        min-height: 80px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        backdrop-filter: blur(10px);
      }

      .task-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(201, 169, 97, 0.15);
        border-color: rgba(201, 169, 97, 0.4);
        background: rgba(255, 255, 255, 0.98);
      }

      .task-card:active {
        transform: scale(1.02) rotate(1deg);
        opacity: 0.9;
        z-index: 1000;
      }

      .task-card.selected {
        border: 2px solid #3b82f6;
        background: rgba(59, 130, 246, 0.05);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .task-card.project-card {
        border-left: 4px solid #c9a961;
        background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(255, 255, 255, 0.95));
        box-shadow: 0 4px 16px rgba(201, 169, 97, 0.12);
      }

      .task-card.project-card:hover {
        box-shadow: 0 8px 32px rgba(201, 169, 97, 0.2);
      }

      .task-select-checkbox {
        position: absolute;
        top: 8px;
        left: 8px;
        width: 16px;
        height: 16px;
        accent-color: #3b82f6;
        cursor: pointer;
        z-index: 10;
      }

      .task-main-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex: 1;
        margin-top: 8px;
      }

      .project-icon {
        font-size: 18px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .task-checkbox {
        width: 18px;
        height: 18px;
        accent-color: #c9a961;
        cursor: pointer;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .task-content {
        flex: 1;
        min-width: 0;
      }

      .task-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        flex-wrap: wrap;
        gap: 8px;
      }

      .task-title {
        font-size: 15px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
        line-height: 1.4;
        flex: 1;
        min-width: 0;
        word-break: break-word;
      }

      .subtask-count {
        background: linear-gradient(135deg, rgba(201, 169, 97, 0.15), rgba(201, 169, 97, 0.25));
        color: #8b7355;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .corner-mode-tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .business-tag {
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 500;
      }

      .business-tag.group {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
      }

      .business-tag.order {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      .business-tag.general {
        background: rgba(107, 114, 128, 0.1);
        color: #6b7280;
      }

      .completeness-tag {
        font-size: 12px;
        padding: 2px;
      }

      .task-description {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.5;
        margin: 0 0 8px 0;
      }

      .corner-mode-info {
        background: rgba(201, 169, 97, 0.05);
        border: 1px solid rgba(201, 169, 97, 0.1);
        border-radius: 8px;
        padding: 8px;
        margin-top: 8px;
      }

      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;
      }

      .info-row:last-child {
        margin-bottom: 0;
      }

      .info-label {
        font-weight: 500;
        color: #8b7355;
        margin-right: 4px;
      }

      .subtasks-container {
        background: rgba(249, 250, 251, 0.8);
        border: 1px solid rgba(201, 169, 97, 0.1);
        border-radius: 8px;
        padding: 12px;
        margin-top: 8px;
      }

      .subtasks-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #c9a961;
      }

      .add-subtask-btn {
        padding: 4px 8px;
        background: rgba(201, 169, 97, 0.1);
        color: #c9a961;
        border: 1px solid rgba(201, 169, 97, 0.3);
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .add-subtask-btn:hover {
        background: rgba(201, 169, 97, 0.2);
        transform: scale(1.05);
      }

      .subtasks-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;
      }

      .subtask-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(201, 169, 97, 0.08);
        border-radius: 6px;
        font-size: 13px;
        transition: all 0.2s ease;
      }

      .subtask-item:hover {
        background: rgba(201, 169, 97, 0.05);
        border-color: rgba(201, 169, 97, 0.15);
      }

      .subtask-item input[type="checkbox"] {
        width: 14px;
        height: 14px;
        accent-color: #c9a961;
        cursor: pointer;
      }

      .subtask-title {
        flex: 1;
        color: #374151;
        font-weight: 500;
      }

      .subtask-title.completed {
        text-decoration: line-through;
        opacity: 0.6;
        color: #9ca3af;
      }

      .subtask-assignee {
        font-size: 11px;
        color: #6b7280;
        background: rgba(107, 114, 128, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(201, 169, 97, 0.1);
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #c9a961, #e4d4a8);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .task-actions {
        display: flex;
        gap: 6px;
        opacity: 0;
        transition: opacity 0.2s ease;
        position: absolute;
        top: 8px;
        right: 8px;
      }

      .task-card:hover .task-actions {
        opacity: 1;
      }

      .action-btn {
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .expand-btn {
        color: #c9a961;
      }

      .expand-btn:hover {
        background: rgba(201, 169, 97, 0.1);
        transform: scale(1.1);
      }

      .quick-actions-btn {
        color: #f59e0b;
      }

      .quick-actions-btn:hover {
        background: rgba(245, 158, 11, 0.1);
        transform: scale(1.1);
      }

      .edit-btn {
        color: #6b7280;
      }

      .edit-btn:hover {
        background: rgba(107, 114, 128, 0.1);
        transform: scale(1.1);
      }

      .delete-btn {
        color: #ef4444;
      }

      .delete-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        transform: scale(1.1);
      }

      .quick-actions-menu {
        position: absolute;
        top: 100%;
        right: 8px;
        background: white;
        border: 1px solid rgba(201, 169, 97, 0.2);
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 100;
      }

      .quick-action-item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        border-radius: 4px;
        font-size: 13px;
        color: #374151;
        transition: background 0.2s ease;
      }

      .quick-action-item:hover {
        background: rgba(201, 169, 97, 0.1);
      }

      /* 響應式設計 */
      @media (max-width: 768px) {
        .task-card {
          padding: 12px;
        }

        .task-actions {
          position: static;
          opacity: 1;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .task-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .corner-mode-tags {
          align-self: flex-start;
        }
      }
    `}</style>
    </>
  )
}