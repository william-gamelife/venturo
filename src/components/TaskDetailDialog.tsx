'use client'

import { useState, useEffect } from 'react'
import styles from './TaskDetailDialog.module.css'

interface Todo {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  type: 'task' | 'project' | 'invoice' | 'order' | 'group' | 'quotation'
  due_date?: string
  tags: string[]
  linkedId?: string
  created_at: string
  updated_at: string
}

interface TaskDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  task: Todo | null
  onSave: (taskData: Partial<Todo>) => void
  onDelete?: (taskId: string) => void
  position?: { x: number; y: number }
  isCornerMode?: boolean
}

export default function TaskDetailDialog({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  position,
  isCornerMode = false
}: TaskDetailDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || ''
      })
    }
  }, [task])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.title.trim()) {
      newErrors.title = '任務標題為必填欄位'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const updatedData = {
      title: formData.title,
      description: formData.description,
      updated_at: new Date().toISOString()
    }

    onSave(updatedData)
  }

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id)
    }
  }

  if (!isOpen || !task) return null

  const getDialogStyle = () => {
    if (!position) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    
    const dialogWidth = isCornerMode ? 720 : 400
    const dialogHeight = 400
    const padding = 20
    
    let { x, y } = position
    
    // 邊界檢測
    if (x + dialogWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - dialogWidth - padding
    } else if (x - dialogWidth / 2 < padding) {
      x = padding + dialogWidth / 2
    }
    
    if (y + dialogHeight > window.innerHeight - padding) {
      y = window.innerHeight - dialogHeight - padding
    } else if (y < padding) {
      y = padding
    }
    
    return {
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-50%, 0)',
      transformOrigin: 'center top'
    }
  }

  return (
    <div 
      className={styles.dialogOverlay}
      onClick={onClose}
    >
      <div 
        className={`${styles.dialogContainer} ${isCornerMode ? styles.cornerMode : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={getDialogStyle()}
      >
        <div className={styles.dialogContent}>
          <div className={styles.dialogForm}>
            <form onSubmit={handleSubmit}>
              {/* 任務標題 */}
              <div className={styles.formGroup}>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.titleInput} ${errors.title ? styles.error : ''}`}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="任務標題"
                />
                {errors.title && (
                  <span className={styles.errorMessage}>{errors.title}</span>
                )}
              </div>

              {/* 任務描述 */}
              <div className={styles.formGroup}>
                <textarea
                  className={styles.formTextarea}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="任務描述"
                  rows={3}
                />
              </div>

              {/* 任務資訊 */}
              {task && (
                <div className={styles.taskInfo}>
                  <div className={styles.taskInfoItem}>
                    <span>狀態:</span>
                    <span className={styles.taskInfoValue}>{task.status}</span>
                  </div>
                  <div className={styles.taskInfoItem}>
                    <span>類型:</span>
                    <span className={styles.taskInfoValue}>{task.type}</span>
                  </div>
                  {task.due_date && (
                    <div className={styles.taskInfoItem}>
                      <span>到期時間:</span>
                      <span className={styles.taskInfoValue}>
                        {new Date(task.due_date).toLocaleString('zh-TW', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {task.tags.length > 0 && (
                    <div className={styles.tagsContainer}>
                      {task.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 按鈕 */}
              <div className={styles.dialogActions}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  儲存
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn"
                    style={{ 
                      background: 'var(--danger)', 
                      color: 'var(--text-white)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    刪除
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* 角落模式面板 */}
          {isCornerMode && (
            <div className={styles.cornerPanel}>
              {/* Tab 選項 */}
              <div className={styles.cornerTabs}>
                {['請款', '收款', '開團'].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.cornerTab} ${
                      tab === '請款' ? styles.active : ''
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab 內容 */}
              <div className={styles.cornerContent}>
                <div style={{ textAlign: 'center', color: '#6b7280', paddingTop: '60px' }}>
                  請款功能
                  <br />
                  開發中...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}