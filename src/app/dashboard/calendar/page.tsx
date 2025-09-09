'use client'

import { useState, useEffect } from 'react'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'
import { useMode } from '@/contexts/ModeContext'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  endDate?: string // 跨日活動的結束日期
  time?: string
  endTime?: string // 結束時間
  allDay?: boolean // 全日活動
  color: string
  type: 'meeting' | 'task' | 'reminder' | 'personal'
}

export default function CalendarPage() {
  const { currentMode } = useMode()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '09:00',
    endTime: '17:00',
    endDate: '',
    allDay: false,
    color: '#3b82f6',
    type: 'personal' as const
  })

  // 載入儲存的事件
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar_events')
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
  }, [])

  // 儲存事件到 localStorage
  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents)
    localStorage.setItem('calendar_events', JSON.stringify(newEvents))
  }

  // 生成日曆網格
  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1) // 從週一開始
    
    const days = []
    const currentDateCopy = new Date(startDate)
    
    for (let i = 0; i < 42; i++) { // 6週 x 7天
      days.push(new Date(currentDateCopy))
      currentDateCopy.setDate(currentDateCopy.getDate() + 1)
    }
    
    return days
  }

  // 獲取特定日期的事件
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      // 單日事件
      if (!event.endDate) {
        return event.date === dateStr
      }
      // 跨日事件：檢查是否在日期範圍內
      return dateStr >= event.date && dateStr <= event.endDate
    })
  }

  // 處理日期點擊
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    setShowAddDialog(true)
  }

  // 新增事件
  const handleAddEvent = () => {
    if (!newEvent.title || !selectedDate) return
    
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate,
      endDate: newEvent.endDate || undefined,
      time: newEvent.allDay ? undefined : newEvent.time,
      endTime: newEvent.allDay ? undefined : newEvent.endTime,
      allDay: newEvent.allDay,
      color: newEvent.color,
      type: newEvent.type
    }
    
    const updatedEvents = [...events, event]
    saveEvents(updatedEvents)
    
    // 重置表單
    setShowAddDialog(false)
    setNewEvent({
      title: '',
      description: '',
      time: '09:00',
      endTime: '17:00',
      endDate: '',
      allDay: false,
      color: '#3b82f6',
      type: 'personal'
    })
    setSelectedDate('')
  }

  // 刪除事件
  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(e => e.id !== eventId)
    saveEvents(updatedEvents)
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const weekdays = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
  const calendarDays = generateCalendar()
  const today = new Date()

  return (
    <ModuleLayout
      header={{
        icon: Icons.calendar,
        title: "行事曆",
        subtitle: "管理您的日程安排",
        actions: (
          <div className="header-actions">
            <button
              className="nav-btn"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              ← 上個月
            </button>
            <h2 className="month-title">
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            </h2>
            <button
              className="nav-btn"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              下個月 →
            </button>
            <Button variant="ghost" onClick={() => setCurrentDate(new Date())}>
              今天
            </Button>
            <Button variant="primary" icon={Icons.plus} onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0])
              setShowAddDialog(true)
            }}>
              新增事件
            </Button>
          </div>
        )
      }}
    >
      <div className="calendar-page">

        {/* 日曆網格 */}
        <div className="calendar-grid">
          {/* 星期標題 */}
          <div className="weekdays">
            {weekdays.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          {/* 日期格 */}
          <div className="calendar-days">
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              const isToday = date.toDateString() === today.toDateString()

              return (
                <div
                  key={index}
                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="day-number">{date.getDate()}</div>
                  <div className="day-events">
                    {dayEvents.slice(0, 2).map(event => {
                      const currentDateStr = date.toISOString().split('T')[0]
                      const isStart = event.date === currentDateStr
                      const isEnd = event.endDate === currentDateStr
                      const isMiddle = event.endDate && currentDateStr > event.date && currentDateStr < event.endDate
                      
                      return (
                        <div
                          key={event.id}
                          className={`event-item ${event.allDay ? 'all-day' : ''} ${
                            event.endDate ? (isStart ? 'multi-start' : isEnd ? 'multi-end' : isMiddle ? 'multi-middle' : '') : ''
                          }`}
                          style={{ backgroundColor: event.color }}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`刪除事件「${event.title}」？`)) {
                              handleDeleteEvent(event.id)
                            }
                          }}
                        >
                          <span className="event-title">
                            {isStart || !event.endDate ? event.title : ''}
                          </span>
                          {!event.allDay && event.time && isStart && <span className="event-time">{event.time}</span>}
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <div className="more-events">+{dayEvents.length - 2} 更多</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 事件統計 */}
        <div className="calendar-stats">
          <div className="stat-item">
            <div className="stat-number">{events.length}</div>
            <div className="stat-label">總事件</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {events.filter(e => new Date(e.date) >= today).length}
            </div>
            <div className="stat-label">即將到來</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {events.filter(e => e.type === 'meeting').length}
            </div>
            <div className="stat-label">會議</div>
          </div>
        </div>
      </div>

      {/* 新增事件對話框 */}
      {showAddDialog && (
        <div className="dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className={`dialog ${currentMode === 'corner' ? 'corner-mode' : ''}`} onClick={e => e.stopPropagation()}>
            <h3>新增事件</h3>
            
            <div className="form-group">
              <label>事件標題</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="輸入事件標題"
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="事件描述（選填）"
                rows={3}
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newEvent.allDay}
                  onChange={e => setNewEvent({...newEvent, allDay: e.target.checked})}
                />
                <span className="checkbox-text">全日活動</span>
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>開始日期</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>結束日期（跨日活動）</label>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={e => setNewEvent({...newEvent, endDate: e.target.value})}
                  min={selectedDate}
                />
              </div>
            </div>

            {!newEvent.allDay && (
              <div className="form-row">
                <div className="form-group">
                  <label>開始時間</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>結束時間</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={e => setNewEvent({...newEvent, endTime: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>類型</label>
              <select
                value={newEvent.type}
                onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
              >
                <option value="personal">個人</option>
                <option value="meeting">會議</option>
                <option value="task">任務</option>
                <option value="reminder">提醒</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>顏色</label>
              <div className="color-options">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                  <button
                    key={color}
                    className={`color-btn ${newEvent.color === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewEvent({...newEvent, color})}
                  />
                ))}
              </div>
            </div>
            
            <div className="dialog-actions">
              <button onClick={() => setShowAddDialog(false)}>取消</button>
              <button onClick={handleAddEvent} disabled={!newEvent.title}>
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-page {
          padding: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .header-actions .nav-btn {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s;
        }

        .header-actions .nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        .header-actions .month-title {
          font-size: 18px;
          font-weight: 700;
          color: #374151;
          margin: 0 8px;
          min-width: 120px;
          text-align: center;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 16px;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .nav-btn {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s;
        }

        .nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        .month-title {
          font-size: 24px;
          font-weight: 700;
          color: #374151;
          margin: 0;
        }

        .calendar-grid {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(201, 169, 97, 0.2);
          box-shadow: 0 8px 25px rgba(201, 169, 97, 0.1);
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
        }

        .weekday {
          padding: 16px;
          text-align: center;
          font-weight: 600;
          color: #6b7280;
          border-right: 1px solid rgba(201, 169, 97, 0.1);
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-day {
          min-height: 120px;
          padding: 8px;
          border-right: 1px solid rgba(201, 169, 97, 0.1);
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .calendar-day:hover {
          background: rgba(201, 169, 97, 0.05);
        }

        .calendar-day.other-month {
          opacity: 0.3;
        }

        .calendar-day.today {
          background: rgba(201, 169, 97, 0.1);
          border: 2px solid #c9a961;
        }

        .calendar-day.today .day-number {
          color: #c9a961;
          font-weight: 700;
        }

        .day-number {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .day-events {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .event-item {
          background: #3b82f6;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }

        .event-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .event-title {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .event-time {
          font-size: 10px;
          margin-left: 4px;
        }

        .event-badge {
          font-size: 8px;
          background: rgba(255, 255, 255, 0.3);
          padding: 1px 4px;
          border-radius: 2px;
          margin-left: 4px;
        }

        .event-item.all-day {
          border-left: 3px solid rgba(255, 255, 255, 0.5);
        }

        /* 跨日事件連續顯示 */
        .event-item.multi-start {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          margin-right: -1px;
        }

        .event-item.multi-middle {
          border-radius: 0;
          margin-right: -1px;
          margin-left: -1px;
        }

        .event-item.multi-end {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          margin-left: -1px;
        }

        /* 勾選框樣式 */
        .checkbox-group {
          margin-bottom: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          margin-right: 8px;
          width: 16px;
          height: 16px;
        }

        .checkbox-text {
          user-select: none;
        }

        .more-events {
          background: #6b7280;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          text-align: center;
        }

        .calendar-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-top: 24px;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 16px;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #c9a961;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dialog {
          background: white;
          border-radius: 16px;
          padding: 28px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .dialog.corner-mode {
          max-width: 1000px;
          position: relative;
        }

        .dialog.corner-mode::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 10%;
          bottom: 10%;
          width: 1px;
          background: linear-gradient(to bottom, 
            transparent 0%, 
            rgba(201, 169, 97, 0.3) 20%, 
            rgba(201, 169, 97, 0.5) 50%, 
            rgba(201, 169, 97, 0.3) 80%, 
            transparent 100%
          );
          transform: translateX(-50%);
          z-index: 1;
        }

        .dialog.corner-mode > * {
          width: 50%;
          box-sizing: border-box;
        }

        .dialog h3 {
          margin: 0 0 24px 0;
          font-size: 20px;
          font-weight: 700;
          color: #374151;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
        }

        .color-options {
          display: flex;
          gap: 8px;
        }

        .color-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
        }

        .color-btn.active {
          border-color: #374151;
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 28px;
        }

        .dialog-actions button {
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }

        .dialog-actions button:first-child {
          background: #f3f4f6;
          color: #6b7280;
        }

        .dialog-actions button:last-child {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
        }

        .dialog-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .calendar-day {
            min-height: 80px;
            padding: 4px;
          }

          .day-number {
            font-size: 14px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .dialog.corner-mode {
            max-width: 500px;
          }

          .dialog.corner-mode::after {
            display: none;
          }

          .dialog.corner-mode > * {
            width: 100%;
          }
        }
      `}</style>
    </ModuleLayout>
  )
}