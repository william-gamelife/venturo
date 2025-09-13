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
import { Calendar, Users, Cake, CheckSquare, MessageCircle } from 'lucide-react';

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
    <div className="v-page">
      {/* Header 區塊 */}
      <header className="v-header">
        <div className="v-header-content">
          <div className="v-title-group">
            <Calendar className="v-title-icon" size={24} />
            <h1 className="v-title">行事曆管理</h1>
          </div>
          <p className="v-subtitle">統合管理旅遊團行程、客戶生日提醒、任務和會議</p>
        </div>
      </header>

      {/* Main 區塊 */}
      <main className="v-main">
        {/* 統計卡片 */}
        <div className="v-stats-grid">
          <div className="v-stat-card">
            <Users className="v-stat-icon" size={20} />
            <div className="v-stat-content">
              <div className="v-stat-number">
                {events.filter(e => e.extendedProps?.type === 'group').length}
              </div>
              <div className="v-stat-label">旅遊團</div>
            </div>
          </div>

          <div className="v-stat-card">
            <Cake className="v-stat-icon" size={20} />
            <div className="v-stat-content">
              <div className="v-stat-number">
                {events.filter(e => e.extendedProps?.type === 'birthday').length}
              </div>
              <div className="v-stat-label">生日提醒</div>
            </div>
          </div>

          <div className="v-stat-card">
            <CheckSquare className="v-stat-icon" size={20} />
            <div className="v-stat-content">
              <div className="v-stat-number">
                {events.filter(e => e.extendedProps?.type === 'task').length}
              </div>
              <div className="v-stat-label">任務</div>
            </div>
          </div>

          <div className="v-stat-card">
            <MessageCircle className="v-stat-icon" size={20} />
            <div className="v-stat-content">
              <div className="v-stat-number">
                {events.filter(e => e.extendedProps?.type === 'meeting').length}
              </div>
              <div className="v-stat-label">會議</div>
            </div>
          </div>
        </div>

        {/* 日曆主體 */}
        <div className="v-calendar-container">
          <CalendarView
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            isLoading={loading}
          />
        </div>
      </main>

      {/* Sidebar 區塊 */}
      <aside className="v-sidebar">
        <div className="v-guide-card">
          <h3 className="v-guide-title">操作說明</h3>
          <ul className="v-guide-list">
            <li>點擊日期可新增事件</li>
            <li>點擊事件可查看詳細資訊</li>
            <li>使用上方過濾器切換顯示類型</li>
            <li>當日事件過多時，點擊「更多」查看完整清單</li>
            <li>不同類型事件有不同顏色標識</li>
          </ul>
        </div>
      </aside>

      <style jsx>{`
        /* Venturo 三區塊架構 */
        .v-page {
          display: grid;
          grid-template-areas:
            "header header"
            "main sidebar";
          grid-template-columns: 1fr 280px;
          grid-template-rows: auto 1fr;
          min-height: 100vh;
          gap: var(--v-spacing-lg);
          padding: var(--v-spacing-lg);
          background: var(--v-color-background);
        }

        /* Header 區塊 */
        .v-header {
          grid-area: header;
        }

        .v-header-content {
          text-align: center;
          padding: var(--v-spacing-xl) 0;
        }

        .v-title-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--v-spacing-sm);
          margin-bottom: var(--v-spacing-sm);
        }

        .v-title-icon {
          color: var(--v-color-primary);
        }

        .v-title {
          font-size: var(--v-font-size-2xl);
          font-weight: var(--v-font-weight-bold);
          color: var(--v-color-text-primary);
          margin: 0;
        }

        .v-subtitle {
          font-size: var(--v-font-size-base);
          color: var(--v-color-text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        /* Main 區塊 */
        .v-main {
          grid-area: main;
          display: flex;
          flex-direction: column;
          gap: var(--v-spacing-lg);
        }

        .v-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: var(--v-spacing-md);
        }

        .v-stat-card {
          display: flex;
          align-items: center;
          gap: var(--v-spacing-sm);
          padding: var(--v-spacing-md);
          background: var(--v-color-surface);
          border-radius: var(--v-radius-md);
          border: 1px solid var(--v-color-border);
          transition: all var(--v-animation-fast);
        }

        .v-stat-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--v-shadow-md);
          border-color: var(--v-color-border-hover);
        }

        .v-stat-icon {
          color: var(--v-color-primary);
          flex-shrink: 0;
        }

        .v-stat-content {
          flex: 1;
        }

        .v-stat-number {
          font-size: var(--v-font-size-xl);
          font-weight: var(--v-font-weight-bold);
          color: var(--v-color-text-primary);
          line-height: 1.2;
        }

        .v-stat-label {
          font-size: var(--v-font-size-sm);
          color: var(--v-color-text-secondary);
          font-weight: var(--v-font-weight-medium);
        }

        .v-calendar-container {
          flex: 1;
        }

        /* Sidebar 區塊 */
        .v-sidebar {
          grid-area: sidebar;
        }

        .v-guide-card {
          background: var(--v-color-surface);
          border-radius: var(--v-radius-lg);
          padding: var(--v-spacing-lg);
          border: 1px solid var(--v-color-border);
          box-shadow: var(--v-shadow-sm);
        }

        .v-guide-title {
          font-size: var(--v-font-size-lg);
          font-weight: var(--v-font-weight-semibold);
          color: var(--v-color-text-primary);
          margin: 0 0 var(--v-spacing-md) 0;
        }

        .v-guide-list {
          margin: 0;
          padding-left: var(--v-spacing-lg);
          color: var(--v-color-text-secondary);
        }

        .v-guide-list li {
          margin-bottom: var(--v-spacing-xs);
          line-height: 1.5;
        }

        /* 響應式設計 */
        @media (max-width: 1024px) {
          .v-page {
            grid-template-areas:
              "header"
              "main"
              "sidebar";
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr auto;
          }
        }

        @media (max-width: 768px) {
          .v-page {
            padding: var(--v-spacing-md);
            gap: var(--v-spacing-md);
          }

          .v-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .v-title {
            font-size: var(--v-font-size-xl);
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