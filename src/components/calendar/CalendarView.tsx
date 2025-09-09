'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateClickArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { CalendarEvent, EventFilterType } from '@/types/calendar';
import { compareEvents, getEventDuration } from './CalendarEventModel';

interface CalendarViewProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
  isLoading?: boolean;
}

export default function CalendarView({ 
  events = [], 
  onEventClick, 
  onDateClick,
  isLoading = false 
}: CalendarViewProps) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });

  // 對話框狀態管理
  const [moreEventsDialog, setMoreEventsDialog] = useState<{
    open: boolean;
    date: string;
    events: CalendarEvent[];
  }>({
    open: false,
    date: '',
    events: []
  });

  // 事件類型過濾狀態
  const [eventFilter, setEventFilter] = useState<EventFilterType>('all');

  // 過濾事件函數
  const filterEvents = (events: CalendarEvent[]): CalendarEvent[] => {
    switch (eventFilter) {
      case 'groups':
        return events.filter((event) => event.extendedProps?.type === 'group');
      case 'birthdays':
        return events.filter((event) => event.extendedProps?.type === 'birthday');
      case 'tasks':
        return events.filter((event) => event.extendedProps?.type === 'task');
      case 'meetings':
        return events.filter((event) => event.extendedProps?.type === 'meeting');
      case 'personal':
        return events.filter((event) => event.extendedProps?.type === 'personal');
      case 'all':
      default:
        return events;
    }
  };

  // 應用過濾的事件
  const filteredEvents = filterEvents(events);

  // 處理日期點擊
  const handleDateClick = (info: DateClickArg) => {
    const selectedDate = format(info.date, 'yyyy-MM-dd');
    if (onDateClick) {
      onDateClick(selectedDate);
    } else {
      console.log('點擊日期:', selectedDate);
    }
  };

  // 處理事件點擊
  const handleEventClick = (info: EventClickArg) => {
    const event = info.event;
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      extendedProps: event.extendedProps as any,
    };

    if (onEventClick) {
      onEventClick(calendarEvent);
    } else {
      // 預設行為
      const extendedProps = event.extendedProps as any;
      if (extendedProps?.type === 'group' && extendedProps.groupCode) {
        console.log('導向旅遊團詳細頁面:', extendedProps.groupCode);
      } else if (extendedProps?.type === 'birthday' && extendedProps.customerId) {
        console.log('導向客戶詳細頁面:', extendedProps.customerId);
      } else if (extendedProps?.type === 'task') {
        console.log('編輯任務:', event.title);
      }
    }
  };

  // 處理日期範圍變更
  const handleDatesSet = (dateInfo: any) => {
    setDateRange({
      start: dateInfo.start,
      end: dateInfo.end
    });
  };

  // 處理 "更多" 連結點擊
  const handleMoreLinkClick = (info: any) => {
    info.jsEvent.preventDefault();

    const clickedDate = format(info.date, 'yyyy-MM-dd');

    // 取得當天的所有事件
    const allDayEvents = events.filter((event: CalendarEvent) => {
      const getDateString = (date: string | undefined): string => {
        if (!date) return '';
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
          return date.split('T')[0];
        }
        return format(new Date(date), 'yyyy-MM-dd');
      };

      const eventStartDate = getDateString(event.start);

      // 對於生日事件（沒有 end date），只檢查 start date
      if (!event.end || event.extendedProps?.type === 'birthday') {
        return eventStartDate === clickedDate;
      }

      // 對於有結束日期的事件，檢查日期範圍
      const eventEndDate = getDateString(event.end);
      const isInRange = clickedDate >= eventStartDate && clickedDate <= eventEndDate;

      return isInRange;
    });

    // 排序事件
    const sortedEvents = allDayEvents.sort(compareEvents);

    setMoreEventsDialog({
      open: true,
      date: clickedDate,
      events: sortedEvents
    });

    return 'none';
  };

  // 關閉對話框
  const handleCloseDialog = () => {
    setMoreEventsDialog({
      open: false,
      date: '',
      events: []
    });
  };

  if (isLoading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <p>載入行事曆資料中...</p>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {/* 事件類型過濾器 */}
      <div className="calendar-header">
        <div className="calendar-title">
          <h3>📅 行事曆管理</h3>
          <div className="event-counter">
            {filteredEvents.length} 個事件
          </div>
        </div>
        <div className="calendar-filters">
          <span className="filter-label">顯示類型：</span>
          <div className="filter-buttons">
            {[
              { value: 'all', label: '全部顯示' },
              { value: 'groups', label: '旅遊團' },
              { value: 'tasks', label: '任務' },
              { value: 'meetings', label: '會議' },
              { value: 'birthdays', label: '生日' },
              { value: 'personal', label: '個人' },
            ].map(({ value, label }) => (
              <button
                key={value}
                className={`filter-btn ${eventFilter === value ? 'active' : ''}`}
                onClick={() => setEventFilter(value as EventFilterType)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FullCalendar 主體 */}
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={filteredEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          locale="zh-tw"
          height="auto"
          dayMaxEvents={false}
          moreLinkClick={handleMoreLinkClick}
          moreLinkText="更多"
          weekends={true}
          eventDisplay="block"
          displayEventTime={false}
          eventOrder={compareEvents}
          eventClassNames={(arg) => {
            const type = arg.event.extendedProps?.type;
            return `event-${type}`;
          }}
          eventMinHeight={26}
          dayMaxEventRows={8}
          eventMaxStack={8}
          nextDayThreshold="00:00:00"
        />
      </div>

      {/* 更多事件對話框 */}
      {moreEventsDialog.open && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>
                {moreEventsDialog.date} 的所有活動 ({moreEventsDialog.events.length})
              </h3>
              <button className="close-btn" onClick={handleCloseDialog}>
                ✕
              </button>
            </div>
            
            <div className="dialog-content">
              {moreEventsDialog.events.map((event, index) => (
                <div
                  key={index}
                  className="event-item"
                  onClick={() => {
                    handleEventClick({
                      event: {
                        id: event.id,
                        title: event.title,
                        startStr: event.start,
                        endStr: event.end,
                        allDay: event.allDay,
                        backgroundColor: event.backgroundColor,
                        borderColor: event.borderColor,
                        extendedProps: event.extendedProps
                      }
                    } as any);
                    handleCloseDialog();
                  }}
                >
                  <div 
                    className="event-color" 
                    style={{ backgroundColor: event.backgroundColor || event.color || '#3B82F6' }}
                  />
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    <div className="event-meta">
                      {(() => {
                        if (event.extendedProps?.type === 'birthday') {
                          return '生日提醒';
                        } else if (event.extendedProps?.type === 'group') {
                          let dayInfo = '';
                          if (event.end) {
                            const start = new Date(event.start);
                            const end = new Date(event.end);
                            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            dayInfo = ` • ${days}天`;
                          }
                          return `團號: ${event.extendedProps.groupCode}${dayInfo}`;
                        } else if (event.extendedProps?.type === 'task') {
                          return `任務 • ${event.extendedProps.priority || 'medium'}`;
                        } else if (event.extendedProps?.type === 'meeting') {
                          return `會議 • ${event.extendedProps.location || ''}`;
                        }
                        return '';
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-md);
        }

        .calendar-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: var(--spacing-md);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, var(--primary-bg), var(--surface-hover));
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .calendar-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .calendar-title h3 {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .event-counter {
          background: var(--primary);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          font-weight: 500;
        }

        .calendar-filters {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .filter-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          font-weight: 500;
        }

        .filter-buttons {
          display: flex;
          gap: var(--spacing-xs);
        }

        .filter-btn {
          padding: var(--spacing-xs) var(--spacing-sm);
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--animation-fast);
          font-size: var(--font-size-sm);
          font-weight: 500;
        }

        .filter-btn:hover {
          background: var(--surface-hover);
          border-color: var(--border-hover);
        }

        .filter-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .calendar-wrapper {
          background: white;
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          border: 1px solid var(--border);
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
          z-index: 1000;
          animation: fadeIn var(--animation-normal) ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dialog {
          background: var(--surface);
          border-radius: var(--radius-lg);
          max-width: 500px;
          width: 90vw;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          animation: slideIn var(--animation-normal) ease;
        }

        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border);
        }

        .dialog-header h3 {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: all var(--animation-fast);
        }

        .close-btn:hover {
          background: var(--surface-hover);
          color: var(--text-primary);
        }

        .dialog-content {
          max-height: 60vh;
          overflow-y: auto;
          padding: var(--spacing-md);
        }

        .event-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all var(--animation-fast);
          margin-bottom: var(--spacing-sm);
        }

        .event-item:hover {
          background: var(--surface-hover);
          border-color: var(--border-hover);
          transform: translateY(-1px);
        }

        .event-color {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-xs);
          flex-shrink: 0;
        }

        .event-details {
          flex: 1;
        }

        .event-title {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .event-meta {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .calendar-header {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: flex-start;
          }

          .filter-buttons {
            flex-wrap: wrap;
          }
        }
      `}</style>

      {/* FullCalendar 客製化樣式 */}
      <style jsx global>{`
        .fc-event {
          cursor: pointer;
          border: none !important;
          font-size: 12px;
          padding: 6px 10px;
          font-weight: 500;
          box-shadow: none;
          margin: 1px 0;
          min-height: 24px !important;
          line-height: 1.2;
          border-radius: 6px !important;
        }

        .fc-event:hover {
          opacity: 0.85;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }

        .fc-daygrid-event {
          margin: 1px 0 !important;
          border-radius: 6px !important;
        }

        .fc-day-today {
          background-color: rgba(201, 169, 97, 0.1) !important;
        }

        .fc-daygrid-day:hover {
          background-color: rgba(0, 0, 0, 0.02);
          cursor: pointer;
        }

        .fc-daygrid-more-link {
          color: var(--primary) !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          transition: all 0.2s ease !important;
        }

        .fc-daygrid-more-link:hover {
          background-color: var(--primary-bg) !important;
        }

        .fc-popover {
          display: none !important;
        }

        .event-group {
          /* 團號顏色由 generateGroupColor 動態設定 */
        }
        
        .event-birthday {
          background-color: #FF6B6B !important;
          border-color: #FF6B6B !important;
        }
        
        .event-task {
          background-color: #9CAF88 !important;
          border-color: #9CAF88 !important;
        }

        .event-meeting {
          background-color: #3B82F6 !important;
          border-color: #3B82F6 !important;
        }

        .event-personal {
          background-color: #8B5CF6 !important;
          border-color: #8B5CF6 !important;
        }
      `}</style>
    </div>
  );
}