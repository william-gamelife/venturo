'use client'

import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { CalendarEvent, CalendarViewProps } from '@/types/calendar'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

export default function CalendarView({ 
  events, 
  onEventClick, 
  onDateClick,
  onEventUpdate,
  onEventDelete 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date)
      return isSameDay(eventDate, date)
    })
  }

  const goToPrevious = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNext = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date)
    }
  }

  const getEventTypeColor = (type?: string) => {
    switch (type) {
      case 'meeting': return '#3B82F6'
      case 'task': return '#EF4444'
      case 'reminder': return '#F59E0B'
      case 'personal': return '#10B981'
      case 'work': return '#8B5CF6'
      default: return '#6B7280'
    }
  }

  return (
    <div className="calendar-container">
      {/* 行事曆標題和控制項 */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <Button variant="ghost" onClick={goToPrevious}>
            ← 上個月
          </Button>
          <h2 className="calendar-title">
            {format(currentDate, 'yyyy年 M月', { locale: zhTW })}
          </h2>
          <Button variant="ghost" onClick={goToNext}>
            下個月 →
          </Button>
        </div>
        
        <div className="calendar-actions">
          <Button variant="ghost" onClick={goToToday}>
            今天
          </Button>
          <div className="view-switcher">
            <button 
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              月
            </button>
            <button 
              className={`view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >
              周
            </button>
            <button 
              className={`view-btn ${view === 'day' ? 'active' : ''}`}
              onClick={() => setView('day')}
            >
              日
            </button>
          </div>
        </div>
      </div>

      {/* 月視圖 */}
      {view === 'month' && (
        <div className="calendar-grid">
          {/* 星期標題 */}
          <div className="weekdays-header">
            {['一', '二', '三', '四', '五', '六', '日'].map(day => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>

          {/* 日期網格 */}
          <div className="days-grid">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={index}
                  className={`calendar-day ${
                    !isCurrentMonth ? 'other-month' : ''
                  } ${isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="day-number">
                    {format(day, 'd')}
                  </div>
                  
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="event-item"
                        style={{ backgroundColor: event.color || getEventTypeColor(event.type) }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onEventClick) onEventClick(event)
                        }}
                      >
                        <span className="event-title">{event.title}</span>
                        {!event.all_day && (
                          <span className="event-time">
                            {format(new Date(event.start_date), 'HH:mm')}
                          </span>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="more-events">
                        +{dayEvents.length - 3} 更多
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          border: 2px solid rgba(201, 169, 97, 0.2);
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.1);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
        }

        .calendar-navigation {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .calendar-title {
          font-size: 24px;
          font-weight: 700;
          color: #3a3833;
          margin: 0;
          min-width: 150px;
          text-align: center;
        }

        .calendar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .view-switcher {
          display: flex;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 8px;
          padding: 4px;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .view-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          color: #6d685f;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          box-shadow: 0 2px 8px rgba(201, 169, 97, 0.3);
        }

        .view-btn:hover:not(.active) {
          background: rgba(201, 169, 97, 0.2);
          color: #3a3833;
        }

        .calendar-grid {
          width: 100%;
        }

        .weekdays-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 8px;
        }

        .weekday {
          text-align: center;
          padding: 12px 8px;
          font-weight: 600;
          color: #6d685f;
          font-size: 14px;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: rgba(201, 169, 97, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .calendar-day {
          background: rgba(255, 255, 255, 0.8);
          min-height: 120px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .calendar-day:hover {
          background: rgba(201, 169, 97, 0.1);
        }

        .calendar-day.other-month {
          opacity: 0.3;
        }

        .calendar-day.today {
          background: rgba(201, 169, 97, 0.2);
          border: 2px solid #c9a961;
        }

        .calendar-day.today .day-number {
          color: #c9a961;
          font-weight: 700;
        }

        .day-number {
          font-size: 16px;
          font-weight: 500;
          color: #3a3833;
          margin-bottom: 4px;
        }

        .day-events {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .event-item {
          background: #3B82F6;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
          opacity: 0.9;
        }

        .event-item:hover {
          opacity: 1;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .event-title {
          font-weight: 500;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .event-time {
          font-size: 10px;
          opacity: 0.9;
          margin-left: 4px;
        }

        .more-events {
          background: rgba(107, 114, 128, 0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          text-align: center;
          cursor: pointer;
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .calendar-container {
            padding: 16px;
            border-radius: 16px;
          }

          .calendar-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .calendar-navigation {
            justify-content: center;
          }

          .calendar-title {
            font-size: 20px;
          }

          .calendar-actions {
            justify-content: center;
          }

          .calendar-day {
            min-height: 80px;
            padding: 4px;
          }

          .day-number {
            font-size: 14px;
          }

          .event-item {
            font-size: 10px;
            padding: 1px 4px;
          }

          .event-title {
            max-width: 60px;
          }

          .view-btn {
            padding: 6px 12px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .calendar-day {
            min-height: 60px;
          }

          .day-number {
            font-size: 12px;
          }

          .event-item {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  )
}