import React, { useState } from 'react';
import { TodoItem } from '../../../Venturo/src/lib/types';
import { SmartGroupOrderService } from '../../lib/services/smart-group-order-service';
import { AutoSaveService } from '../../lib/services/auto-save-service';
import CornerActionButtons from './corner-action-buttons';
import ProgressiveGroupForm from './progressive-group-form';
import { TaskCardTags } from './corner-tags';

interface IntegratedTaskCardProps {
  todo: TodoItem;
  userId: string;
  worldMode: 'corner' | 'game';
  onTodoUpdate?: (updatedTodo: TodoItem) => void;
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (todo: TodoItem) => void;
  selectedTasks?: Set<string>;
  onToggleSelect?: (id: string) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, task: TodoItem) => void;
  onDragEnd?: () => void;
  hasPackagingPermission?: boolean;
}

/**
 * 整合版任務卡片 - 支援角落模式和遊戲模式的統一卡片
 */
export function IntegratedTaskCard({ 
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
  hasPackagingPermission = false
}: IntegratedTaskCardProps) {
  const [groupOrder, setGroupOrder] = useState<any>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 處理團體建立
  const handleGroupCreated = async (groupCode: string) => {
    try {
      const order = await SmartGroupOrderService.getGroupOrder(userId, groupCode);
      setGroupOrder(order);
      
      // 更新待辦事項資料
      const updatedTodo: TodoItem = {
        ...todo,
        businessType: 'group',
        groupCode,
        dataCompleteness: 'skeleton',
        cornerModeData: {
          isGroupRelated: true,
          quickActions: ['edit_contact', 'set_date'],
          priority: 'high'
        }
      };
      
      onTodoUpdate?.(updatedTodo);
      setShowGroupForm(true);
    } catch (error) {
      console.error('Failed to handle group creation:', error);
    }
  };

  // 處理查看團體
  const handleViewGroup = async (groupCode: string) => {
    setIsLoading(true);
    try {
      const order = await SmartGroupOrderService.getGroupOrder(userId, groupCode);
      setGroupOrder(order);
      setShowGroupForm(true);
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 處理團體更新
  const handleGroupUpdate = (updatedOrder: any) => {
    setGroupOrder(updatedOrder);
    
    // 更新待辦事項的完整度狀態
    const updatedTodo: TodoItem = {
      ...todo,
      dataCompleteness: updatedOrder.dataCompleteness.level,
      cornerModeData: {
        ...todo.cornerModeData,
        contactPerson: updatedOrder.primaryOrder.contactPerson,
        contactPhone: updatedOrder.primaryOrder.contactPhone,
        contactEmail: updatedOrder.primaryOrder.contactEmail,
        departureDate: updatedOrder.group.departureDate,
        returnDate: updatedOrder.group.returnDate,
        totalMembers: updatedOrder.group.totalMembers,
        budget: updatedOrder.group.budget,
        itinerary: updatedOrder.group.itinerary
      }
    };
    
    onTodoUpdate?.(updatedTodo);
  };

  return (
    <div 
      className={`task-card ${todo.status === 'done' ? 'completed' : ''} ${selectedTasks?.has(todo.id) ? 'selected' : ''} ${todo.type === 'project' ? 'project-card' : ''} ${worldMode === 'corner' ? 'corner-mode' : 'game-mode'}`}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => onDragStart(e, todo) : undefined}
      onDragEnd={onDragEnd}
      onClick={() => {
        if (isDragging) return;
        if (todo.type === 'project') {
          // 處理專案展開邏輯
        } else if (onEdit) {
          onEdit(todo);
        }
      }}
    >
      <div className="task-main-content">
        {/* 選擇模式 checkbox (角落模式且有打包權限) */}
        {worldMode === 'corner' && hasPackagingPermission && todo.type !== 'project' && onToggleSelect && (
          <input
            type="checkbox"
            className="task-checkbox"
            checked={selectedTasks?.has(todo.id) || false}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(todo.id);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        <div className="task-content-wrapper">
          <div className="task-header">
            <h4 className="task-title">
              {todo.type === 'project' && (
                <span className="project-icon">📋</span>
              )}
              {todo.title}
              {todo.type === 'project' && todo.subtasks && (
                <span className="subtask-count">
                  ({todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length})
                </span>
              )}
            </h4>
            <div className="task-actions">
              {onDelete && (
                <button 
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(todo.id);
                  }}
                  title="刪除"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 任務描述 */}
          {todo.description && (
            <p className="task-description">{todo.description}</p>
          )}

          {/* 角落模式標籤 */}
          {worldMode === 'corner' && <TaskCardTags task={todo} />}

          {/* 角落模式專屬功能 */}
          {worldMode === 'corner' && (
            <div className="corner-mode-section">
              <CornerActionButtons
                todo={todo}
                userId={userId}
                onGroupCreated={handleGroupCreated}
                onViewGroup={handleViewGroup}
              />

              {/* 團體表單（摺疊式） */}
              {showGroupForm && groupOrder && (
                <div className="group-form-container">
                  <button 
                    className="toggle-form-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGroupForm(!showGroupForm);
                    }}
                  >
                    <span>團體管理</span>
                    <svg 
                      className={`chevron ${showGroupForm ? 'expanded' : ''}`}
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </button>
                  
                  {showGroupForm && (
                    <div className="group-form-wrapper">
                      <ProgressiveGroupForm
                        groupOrder={groupOrder}
                        userId={userId}
                        onUpdate={handleGroupUpdate}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 遊戲模式基礎功能 */}
          {worldMode === 'game' && (
            <div className="game-mode-actions">
              {onToggleComplete && (
                <button 
                  className="btn-complete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(todo.id);
                  }}
                >
                  {todo.status === 'done' ? '恢復' : '完成'}
                </button>
              )}
              {onEdit && (
                <button 
                  className="btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(todo);
                  }}
                >
                  編輯
                </button>
              )}
            </div>
          )}

          {/* 任務元資料 */}
          <div className="task-meta">
            <span className="created-date">
              建立：{new Date(todo.createdAt).toLocaleDateString()}
            </span>
            
            {todo.groupCode && (
              <span className="group-code-badge">
                {todo.groupCode}
              </span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .task-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          padding: 16px 12px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          transition: all 0.3s ease;
          cursor: move;
          position: relative;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .task-card.corner-mode {
          border-left: 4px solid #3b82f6;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(255, 255, 255, 0.9));
        }

        .task-card.game-mode {
          border-left: 4px solid #10b981;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(255, 255, 255, 0.9));
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201, 169, 97, 0.2);
          border-color: rgba(201, 169, 97, 0.4);
        }

        .task-card.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .task-card.project-card {
          border-left: 4px solid #8b5cf6;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(255, 255, 255, 0.9));
        }

        .task-main-content {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex: 1;
        }
        
        .task-checkbox {
          margin-top: 2px;
          width: 16px;
          height: 16px;
          accent-color: #c9a961;
          cursor: pointer;
        }

        .task-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .task-title {
          font-size: 14px;
          font-weight: 500;
          color: #3a3833;
          margin: 0;
          line-height: 1.3;
          flex: 1;
        }

        .project-icon {
          margin-right: 6px;
          font-size: 14px;
        }

        .subtask-count {
          font-size: 12px;
          color: #8b5cf6;
          font-weight: 500;
          margin-left: 8px;
        }

        .task-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .task-card:hover .task-actions {
          opacity: 1;
        }

        .action-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
        }

        .task-description {
          font-size: 13px;
          color: #6d685f;
          line-height: 1.4;
          margin: 0;
        }

        .corner-mode-section {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(59, 130, 246, 0.1);
        }

        .group-form-container {
          margin-top: 12px;
        }

        .toggle-form-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          color: #3b82f6;
          transition: all 0.2s ease;
        }

        .toggle-form-btn:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron.expanded {
          transform: rotate(180deg);
        }

        .group-form-wrapper {
          margin-top: 8px;
          padding: 12px;
          background: rgba(249, 250, 251, 0.8);
          border-radius: 6px;
        }

        .game-mode-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .btn-complete,
        .btn-edit {
          padding: 4px 12px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
          color: #10b981;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-complete:hover,
        .btn-edit:hover {
          background: rgba(16, 185, 129, 0.1);
        }

        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #9ca3af;
          margin-top: 8px;
        }

        .group-code-badge {
          padding: 2px 6px;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border-radius: 4px;
          font-weight: 500;
        }

        .task-card.completed {
          opacity: 0.7;
          background: rgba(245, 245, 245, 0.9);
        }

        .task-card.completed .task-title {
          text-decoration: line-through;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

export default IntegratedTaskCard;