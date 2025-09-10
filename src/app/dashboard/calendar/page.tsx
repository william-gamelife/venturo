'use client';

import { useState, useEffect } from 'react';
import CalendarView from '@/components/calendar/CalendarView';
import { CalendarEvent } from '@/types/calendar';
import { 
  groupToCalendarEvent, 
  customerBirthdayToCalendarEvent,
  taskToCalendarEvent,
  meetingToCalendarEvent 
} from '@/components/calendar/CalendarEventModel';
import { format } from 'date-fns';
import { VersionIndicator } from '@/components/VersionIndicator';

// Mock API 資料生成函數
function generateMockData() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // 模擬旅遊團資料
  const mockGroups = [
    {
      groupCode: 'TW2025001',
      groupName: '日本櫻花團',
      departureDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`,
      returnDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
      status: 1,
      description: '東京、大阪賞櫻5日遊'
    },
    {
      groupCode: 'TW2025002',
      groupName: '歐洲經典團',
      departureDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
      returnDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-08`,
      status: 1,
      description: '法國、德國、瑞士8日遊'
    },
    {
      groupCode: 'TW2025003',
      groupName: '台灣環島團',
      departureDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-20`,
      returnDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-24`,
      status: 1,
      description: '台灣深度環島5日遊'
    },
    {
      groupCode: 'TW2025004',
      groupName: '泰國曼谷團',
      departureDate: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-05`,
      returnDate: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-09`,
      status: 1,
      description: '曼谷、芭達雅5日遊'
    }
  ];

  // 模擬客戶生日資料
  const mockCustomers = [
    {
      id: 'c001',
      name: '王小明',
      birthday: '1990-03-15'
    },
    {
      id: 'c002', 
      name: '李小花',
      birthday: '1985-11-28'
    },
    {
      id: 'c003',
      name: '張大華',
      birthday: '1975-07-10'
    },
    {
      id: 'c004',
      name: '陳美玲',
      birthday: `1988-${String(currentMonth + 1).padStart(2, '0')}-25`
    }
  ];

  // 模擬任務資料
  const mockTasks = [
    {
      id: 't001',
      title: '準備日本團資料',
      dueDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-10`,
      description: '整理護照、簽證等文件',
      priority: 'high'
    },
    {
      id: 't002',
      title: '聯絡歐洲團客戶',
      dueDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-25`,
      description: '確認行程安排',
      priority: 'medium'
    },
    {
      id: 't003',
      title: '整理旅遊保險資料',
      dueDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-18`,
      description: '準備團體保險文件',
      priority: 'low'
    }
  ];

  // 模擬會議資料
  const mockMeetings = [
    {
      id: 'm001',
      title: '團隊週會',
      startTime: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-08T10:00:00`,
      endTime: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-08T11:00:00`,
      description: '討論本週工作安排',
      location: '會議室A',
      participants: ['張經理', '李專員', '王助理']
    },
    {
      id: 'm002',
      title: '客戶諮詢會議',
      startTime: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-22T14:00:00`,
      endTime: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-22T15:30:00`,
      description: '與VIP客戶討論定製行程',
      location: '貴賓室',
      participants: ['業務經理', 'VIP客戶']
    }
  ];

  return { mockGroups, mockCustomers, mockTasks, mockMeetings };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // 模擬 API 載入
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { mockGroups, mockCustomers, mockTasks, mockMeetings } = generateMockData();
        const allEvents: CalendarEvent[] = [];

        // 轉換旅遊團為日曆事件
        const groupEvents = mockGroups.map(group => groupToCalendarEvent(group));
        allEvents.push(...groupEvents);

        // 轉換客戶生日為日曆事件
        const currentYear = new Date().getFullYear();
        const birthdayEvents = mockCustomers
          .filter(customer => customer.birthday)
          .map(customer => customerBirthdayToCalendarEvent(customer, currentYear));
        allEvents.push(...birthdayEvents);

        // 轉換任務為日曆事件
        const taskEvents = mockTasks.map(task => taskToCalendarEvent(task));
        allEvents.push(...taskEvents);

        // 轉換會議為日曆事件
        const meetingEvents = mockMeetings.map(meeting => meetingToCalendarEvent(meeting));
        allEvents.push(...meetingEvents);

        setEvents(allEvents);
      } catch (error) {
        console.error('載入行事曆資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarData();
  }, []);

  // 處理事件點擊
  const handleEventClick = (event: CalendarEvent) => {
    console.log('點擊事件:', event);
    
    const extendedProps = event.extendedProps;
    if (extendedProps?.type === 'group' && extendedProps.groupCode) {
      alert(`查看旅遊團: ${extendedProps.groupCode}\n${event.title}\n${extendedProps.description || ''}`);
    } else if (extendedProps?.type === 'birthday' && extendedProps.customerId) {
      alert(`客戶生日提醒: ${extendedProps.customerName}`);
    } else if (extendedProps?.type === 'task') {
      alert(`任務: ${event.title}\n優先級: ${extendedProps.priority}\n${extendedProps.description || ''}`);
    } else if (extendedProps?.type === 'meeting') {
      alert(`會議: ${event.title}\n地點: ${extendedProps.location || ''}\n參與者: ${extendedProps.participants?.join(', ') || ''}`);
    }
  };

  // 處理日期點擊
  const handleDateClick = (date: string) => {
    console.log('點擊日期:', date);
    alert(`在 ${date} 新增事件`);
  };

  return (
    <div className="calendar-page">
      {/* 頁面統計資訊 */}
      <div className="calendar-stats">
        <div className="page-header">
          <h1>🗓️ Venturo 行事曆系統</h1>
          <p>統合管理旅遊團行程、客戶生日提醒、任務和會議</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--primary)' }}>
              {events.filter(e => e.extendedProps?.type === 'group').length}
            </div>
            <div className="stat-label">旅遊團</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#FF6B6B' }}>
              {events.filter(e => e.extendedProps?.type === 'birthday').length}
            </div>
            <div className="stat-label">生日提醒</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#9CAF88' }}>
              {events.filter(e => e.extendedProps?.type === 'task').length}
            </div>
            <div className="stat-label">任務</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#3B82F6' }}>
              {events.filter(e => e.extendedProps?.type === 'meeting').length}
            </div>
            <div className="stat-label">會議</div>
          </div>
        </div>
      </div>

      {/* 日曆組件 */}
      <CalendarView
        events={events}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        isLoading={loading}
      />

      {/* 操作說明 */}
      <div className="calendar-guide">
        <h4>💡 操作說明</h4>
        <ul>
          <li>點擊日期可新增事件</li>
          <li>點擊事件可查看詳細資訊</li>
          <li>使用上方過濾器切換顯示類型</li>
          <li>當日事件過多時，點擊「更多」查看完整清單</li>
          <li>不同類型事件有不同顏色標識</li>
        </ul>
      </div>

      <style jsx>{`
        .calendar-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-lg);
          background: var(--background);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .calendar-stats {
          background: linear-gradient(135deg, var(--primary-bg), var(--surface));
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .page-header h1 {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .page-header p {
          font-size: var(--font-size-base);
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--spacing-lg);
          margin-top: var(--spacing-lg);
        }

        .stat-card {
          text-align: center;
          padding: var(--spacing-lg);
          background: var(--surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          transition: all var(--animation-fast);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .stat-number {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          font-weight: 500;
        }

        .calendar-guide {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .calendar-guide h4 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--text-primary);
          font-size: var(--font-size-lg);
          font-weight: 600;
        }

        .calendar-guide ul {
          margin: 0;
          padding-left: var(--spacing-xl);
          color: var(--text-secondary);
        }

        .calendar-guide li {
          margin-bottom: var(--spacing-xs);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .calendar-page {
            padding: var(--spacing-md);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
          }

          .page-header h1 {
            font-size: var(--font-size-xl);
          }
        }
      `}</style>
      
      <VersionIndicator 
        page="行事曆"
        authSystem="mixed" 
        version="1.2"
        status="error"
      />
    </div>
  );
}