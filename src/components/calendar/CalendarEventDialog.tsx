'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarEvent, CalendarEventInput } from '@/types/calendar'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

interface CalendarEventDialogProps {
  isOpen: boolean
  onClose: () => void
  event?: CalendarEvent | null
  selectedDate?: Date
  onSave: (eventData: CalendarEventInput) => void
  onDelete?: (eventId: string) => void
}

export default function CalendarEventDialog({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete
}: CalendarEventDialogProps) {
  const [formData, setFormData] = useState<CalendarEventInput>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    all_day: true,
    type: 'personal',
    location: '',
    participants: [],
    status: 'confirmed',
    color: '#3B82F6'
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (event) {
      // 編輯現有事件
      setFormData({
        title: event.title,
        description: event.description || '',
        start_date: event.start_date,
        end_date: event.end_date || '',
        all_day: event.all_day,
        type: event.type || 'personal',
        location: event.location || '',
        participants: event.participants || [],
        status: event.status || 'confirmed',
        color: event.color || '#3B82F6'
      })
    } else if (selectedDate) {
      // 新增事件，使用選定的日期
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      setFormData(prev => ({
        ...prev,
        start_date: `${dateStr}T09:00`,
        end_date: `${dateStr}T10:00`
      }))
    }
  }, [event, selectedDate])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.title.trim()) {
      newErrors.title = '標題為必填欄位'
    }

    if (!formData.start_date) {
      newErrors.start_date = '開始時間為必填欄位'
    }

    if (!formData.all_day && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = '結束時間必須晚於開始時間'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // 如果是全天事件，調整時間格式
    let eventData = { ...formData }
    if (formData.all_day) {
      const dateOnly = formData.start_date.split('T')[0]
      eventData.start_date = `${dateOnly}T00:00:00.000Z`
      eventData.end_date = `${dateOnly}T23:59:59.999Z`
    }

    onSave(eventData)
  }

  const handleDelete = () => {
    if (event && onDelete) {
      if (window.confirm('確定要刪除這個事件嗎？')) {
        onDelete(event.id)
      }
    }
  }

  const eventTypeOptions = [
    { value: 'meeting', label: '會議', color: '#3B82F6' },
    { value: 'task', label: '任務', color: '#EF4444' },
    { value: 'reminder', label: '提醒', color: '#F59E0B' },
    { value: 'personal', label: '個人', color: '#10B981' },
    { value: 'work', label: '工作', color: '#8B5CF6' }
  ]

  if (!isOpen) return null

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">
            {event ? '編輯事件' : '新增事件'}
          </h2>
          <button className="dialog-close" onClick={onClose}>
            <Icons.close />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          {/* 標題 */}
          <div className="form-group">
            <label className="form-label">
              標題 <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="輸入事件標題"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* 描述 */}
          <div className="form-group">
            <label className="form-label">描述</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="輸入事件描述（選填）"
              rows={3}
            />
          </div>

          {/* 全天事件切換 */}
          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.all_day}
                onChange={(e) => handleInputChange('all_day', e.target.checked)}
              />
              <span className="checkmark"></span>
              全天事件
            </label>
          </div>

          {/* 開始時間 */}
          <div className="form-group">
            <label className="form-label">
              開始時間 <span className="required">*</span>
            </label>
            <input
              type={formData.all_day ? 'date' : 'datetime-local'}
              className={`form-input ${errors.start_date ? 'error' : ''}`}
              value={formData.all_day ? formData.start_date.split('T')[0] : formData.start_date}
              onChange={(e) => {
                if (formData.all_day) {
                  handleInputChange('start_date', `${e.target.value}T00:00`)
                } else {
                  handleInputChange('start_date', e.target.value)
                }
              }}
            />
            {errors.start_date && <span className="error-message">{errors.start_date}</span>}
          </div>

          {/* 結束時間 */}
          {!formData.all_day && (
            <div className="form-group">
              <label className="form-label">結束時間</label>
              <input
                type="datetime-local"
                className={`form-input ${errors.end_date ? 'error' : ''}`}
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
              />
              {errors.end_date && <span className="error-message">{errors.end_date}</span>}
            </div>
          )}

          {/* 事件類型 */}
          <div className="form-group">
            <label className="form-label">事件類型</label>
            <div className="event-type-grid">
              {eventTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`event-type-btn ${formData.type === option.value ? 'active' : ''}`}
                  style={{ borderColor: option.color }}
                  onClick={() => {
                    handleInputChange('type', option.value)
                    handleInputChange('color', option.color)
                  }}
                >
                  <div 
                    className="event-type-color" 
                    style={{ backgroundColor: option.color }}
                  ></div>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 地點 */}
          <div className="form-group">
            <label className="form-label">地點</label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="輸入事件地點（選填）"
            />
          </div>

          {/* 狀態 */}
          <div className="form-group">
            <label className="form-label">狀態</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="confirmed">確認</option>
              <option value="tentative">暫定</option>
              <option value="cancelled">取消</option>
            </select>
          </div>

          <div className="dialog-actions">
            {event && onDelete && (
              <Button
                type="button"
                variant="danger"
                icon={Icons.trash}
                onClick={handleDelete}
              >
                刪除
              </Button>
            )}
            <div className="action-buttons">
              <Button type="button" variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                {event ? '更新' : '創建'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .dialog-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 2px solid rgba(201, 169, 97, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          margin-bottom: 24px;
        }

        .dialog-title {
          font-size: 24px;
          font-weight: 700;
          color: #3a3833;
          margin: 0;
        }

        .dialog-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          color: #6d685f;
          transition: all 0.2s ease;
        }

        .dialog-close:hover {
          background: rgba(201, 169, 97, 0.1);
          color: #3a3833;
        }

        .dialog-form {
          padding: 0 24px 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #3a3833;
          font-size: 14px;
        }

        .required {
          color: #EF4444;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid rgba(201, 169, 97, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          color: #3a3833;
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #c9a961;
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
        }

        .form-input.error,
        .form-textarea.error,
        .form-select.error {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-weight: 500;
          color: #3a3833;
        }

        .form-checkbox input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(201, 169, 97, 0.3);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.8);
          margin-right: 12px;
          position: relative;
          transition: all 0.2s ease;
        }

        .form-checkbox input[type="checkbox"]:checked + .checkmark {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          border-color: #c9a961;
        }

        .form-checkbox input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: 12px;
        }

        .event-type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .event-type-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(201, 169, 97, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          color: #3a3833;
        }

        .event-type-btn:hover {
          background: rgba(201, 169, 97, 0.1);
        }

        .event-type-btn.active {
          background: rgba(201, 169, 97, 0.2);
          border-color: #c9a961;
        }

        .event-type-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .error-message {
          display: block;
          margin-top: 4px;
          color: #EF4444;
          font-size: 12px;
        }

        .dialog-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(201, 169, 97, 0.2);
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .dialog-container {
            margin: 0 10px;
            border-radius: 16px;
          }

          .dialog-header {
            padding: 20px 20px 0;
          }

          .dialog-title {
            font-size: 20px;
          }

          .dialog-form {
            padding: 0 20px 20px;
          }

          .event-type-grid {
            grid-template-columns: 1fr;
          }

          .dialog-actions {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .action-buttons {
            justify-content: stretch;
          }
        }
      `}</style>
    </div>
  )
}