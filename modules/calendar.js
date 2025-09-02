/**
 * 優雅月曆模組 - 遊戲人生 3.0
 * 統一歡迎卡片版本
 */

class CalendarModule {
    static moduleInfo = {
        name: '行事曆',
        subtitle: '時間管理與行程安排',
        icon: `<svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="16" r="2" fill="currentColor"/>
               </svg>`,
        version: '2.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.events = [];
        this.currentDate = new Date();
        this.viewDate = new Date();
        this.monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        this.dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    }

    async render(uuid) {
        window.activeModule = this;
        this.currentUser = { uuid };
        
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        await this.loadData();
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        this.updateCalendarView();
        this.attachEventListeners();
    }

    getHTML() {
        return `
            <div class="calendar-container">
                <!-- 統一歡迎卡片 -->
                <div class="module-welcome-card">
                    <div class="welcome-left">
                        <div class="module-icon-wrapper">
                            ${CalendarModule.moduleInfo.icon}
                        </div>
                        <div class="module-text">
                            <h2 class="module-title">${CalendarModule.moduleInfo.name}</h2>
                            <p class="module-subtitle">${CalendarModule.moduleInfo.subtitle}</p>
                        </div>
                    </div>
                    <div class="welcome-right">
                        <button class="nav-btn" onclick="window.activeModule.previousMonth()">
                            <svg width="20" height="20"><path d="M12 15l-5-5 5-5" stroke="currentColor" fill="none" stroke-width="2"/></svg>
                        </button>
                        <span class="month-display">${this.monthNames[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}</span>
                        <button class="nav-btn" onclick="window.activeModule.nextMonth()">
                            <svg width="20" height="20"><path d="M8 15l5-5-5-5" stroke="currentColor" fill="none" stroke-width="2"/></svg>
                        </button>
                        <button class="btn-secondary" onclick="window.activeModule.goToToday()">今天</button>
                        <button class="btn-primary" onclick="window.activeModule.showAddEventDialog()">
                            <svg width="16" height="16"><path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="2"/></svg>
                            新增事件
                        </button>
                    </div>
                </div>
                
                <!-- 月曆主體 -->
                <div class="calendar-main">
                    <div class="calendar-grid">
                        <div class="calendar-weekdays">
                            ${this.dayNames.map(day => `<div class="weekday">${day}</div>`).join('')}
                        </div>
                        <div class="calendar-days" id="calendarDays"></div>
                    </div>
                </div>
            </div>
            
            <style>
                /* 統一歡迎卡片樣式 */
                .module-welcome-card {
                    height: 100px;
                    background: var(--card);
                    border-radius: 16px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid var(--border);
                    margin-bottom: 20px;
                    backdrop-filter: blur(20px);
                }
                
                .welcome-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .module-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border-radius: 12px;
                    color: white;
                    flex-shrink: 0;
                }
                
                .module-icon-wrapper svg {
                    width: 24px;
                    height: 24px;
                }
                
                .module-text {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .module-title {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text);
                    line-height: 1.4;
                }
                
                .module-subtitle {
                    margin: 0;
                    font-size: 0.875rem;
                    color: var(--text-light);
                    line-height: 1.4;
                }
                
                .welcome-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .nav-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .nav-btn:hover {
                    background: var(--primary-light);
                }
                
                .month-display {
                    min-width: 150px;
                    text-align: center;
                    font-weight: 600;
                    color: var(--text);
                }
                
                .btn-secondary, .btn-primary {
                    height: 36px;
                    padding: 0 16px;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .btn-secondary {
                    background: white;
                    border: 1px solid var(--border);
                    color: var(--text);
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border: none;
                    color: white;
                    font-weight: 500;
                }
                
                /* 月曆主體 - 無額外背景 */
                .calendar-main {
                    background: var(--card);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid var(--border);
                }
                
                .calendar-grid {
                    width: 100%;
                }
                
                .calendar-weekdays {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1px;
                    margin-bottom: 10px;
                }
                
                .weekday {
                    text-align: center;
                    font-weight: 600;
                    color: var(--text-light);
                    padding: 10px 0;
                    font-size: 0.9rem;
                }
                
                .calendar-days {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1px;
                    background: var(--border);
                }
                
                .calendar-day {
                    background: white;
                    min-height: 80px;
                    padding: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }
                
                .calendar-day:hover {
                    background: var(--primary-light);
                }
                
                .calendar-day.today {
                    background: linear-gradient(135deg, var(--primary-light), rgba(255,255,255,0.9));
                    font-weight: bold;
                }
                
                .calendar-day.other-month {
                    opacity: 0.3;
                }
                
                .day-number {
                    font-size: 0.9rem;
                    color: var(--text);
                }
                
                .day-events {
                    margin-top: 4px;
                    font-size: 0.75rem;
                }
                
                .event-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 4px;
                }
                
                /* 響應式 */
                @media (max-width: 768px) {
                    .module-welcome-card {
                        height: auto;
                        padding: 16px;
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .welcome-right {
                        width: 100%;
                        justify-content: space-between;
                    }
                    
                    .month-display {
                        min-width: auto;
                    }
                }
            </style>
        `;
    }

    updateCalendarView() {
        const container = document.getElementById('calendarDays');
        if (!container) return;
        
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let html = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isToday = date.getTime() === today.getTime();
            const isCurrentMonth = date.getMonth() === month;
            const dayEvents = this.getEventsForDate(date);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}"
                     onclick="window.activeModule.selectDate('${date.toISOString()}')">
                    <div class="day-number">${date.getDate()}</div>
                    <div class="day-events">
                        ${dayEvents.slice(0, 3).map(event => `
                            <div class="event-dot" style="background: ${this.getPriorityColor(event.priority)}"></div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<span>+${dayEvents.length - 3}</span>` : ''}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    getPriorityColor(priority) {
        const colors = {
            low: '#9faa95',
            medium: '#7eb3d3',
            high: '#d4a574'
        };
        return colors[priority] || colors.medium;
    }

    getEventsForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.events.filter(event => event.date === dateStr);
    }

    previousMonth() {
        this.viewDate.setMonth(this.viewDate.getMonth() - 1);
        this.updateMonthDisplay();
        this.updateCalendarView();
    }

    nextMonth() {
        this.viewDate.setMonth(this.viewDate.getMonth() + 1);
        this.updateMonthDisplay();
        this.updateCalendarView();
    }

    goToToday() {
        this.viewDate = new Date();
        this.updateMonthDisplay();
        this.updateCalendarView();
    }

    updateMonthDisplay() {
        const display = document.querySelector('.month-display');
        if (display) {
            display.textContent = `${this.monthNames[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
        }
    }

    selectDate(dateStr) {
        this.selectedDate = new Date(dateStr);
        this.showDateDetails();
    }

    showAddEventDialog() {
        console.log('新增事件對話框');
        // TODO: 實作新增事件對話框
    }

    showDateDetails() {
        console.log('顯示日期詳情:', this.selectedDate);
        // TODO: 實作日期詳情顯示
    }

    async loadData() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'calendar');
            if (data) {
                this.events = data.events || [];
            }
        } catch (error) {
            console.error('載入月曆資料失敗:', error);
            this.events = [];
        }
    }

    attachEventListeners() {
        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousMonth();
            if (e.key === 'ArrowRight') this.nextMonth();
            if (e.key === 't' || e.key === 'T') this.goToToday();
        });
    }

    destroy() {
        // 清理事件監聽器
        document.removeEventListener('keydown', this.attachEventListeners);
    }
}

export { CalendarModule };
