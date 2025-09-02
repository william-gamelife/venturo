/**
 * 優雅月曆模組 - 遊戲人生 3.0
 * 統一歡迎卡片版本
 */

class CalendarModule {
    // SignageHost 招牌資料
    static signage = {
        title: '行事曆',
        subtitle: '時間管理與行程安排',
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16" r="2" fill="currentColor"/></svg>',
        actions: [
            { id:'prev',  label:'〈',    kind:'secondary', onClick:'previousMonth' },
            { id:'today', label:'今天',  kind:'secondary', onClick:'goToToday' },
            { id:'next',  label:'〉',    kind:'secondary', onClick:'nextMonth' }
        ]
    };

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
                
                /* 對話框樣式 */
                .calendar-dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .calendar-dialog {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-lg);
                }
                
                .dialog-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                
                .dialog-header h3 {
                    margin: 0;
                    color: var(--text);
                    font-size: 1.2rem;
                }
                
                .dialog-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-light);
                    padding: 4px;
                    border-radius: 4px;
                }
                
                .dialog-close:hover {
                    background: var(--bg);
                }
                
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 0.9rem;
                    color: var(--text-light);
                    font-weight: 500;
                }
                
                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }
                
                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
                }
                
                .event-type-selector {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                .type-btn {
                    padding: 8px 16px;
                    border: 1px solid var(--border);
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }
                
                .type-btn:hover {
                    background: var(--bg);
                }
                
                .type-btn.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                
                .form-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                
                .event-settings {
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                    background: var(--bg);
                }
                
                .dialog-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 24px;
                }
                
                .btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .btn-secondary {
                    background: var(--bg);
                    color: var(--text);
                    border: 1px solid var(--border);
                }
                
                .btn-secondary:hover {
                    background: var(--border);
                }
                
                .btn-primary {
                    background: var(--primary);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: var(--primary-dark);
                }
                
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    background: var(--text);
                    color: white;
                    border-radius: 8px;
                    box-shadow: var(--shadow);
                    z-index: 2000;
                    animation: slideUp 0.3s ease;
                }
                
                .toast.error {
                    background: #e74c3c;
                }
                
                .toast.success {
                    background: #27ae60;
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
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
        this.showAddEventDialog(dateStr);
    }

    showAddEventDialog(dateStr = null) {
        const selectedDate = dateStr ? new Date(dateStr) : this.selectedDate || new Date();
        const dateString = selectedDate.toISOString().split('T')[0];
        
        const dialog = document.createElement('div');
        dialog.className = 'calendar-dialog-overlay';
        dialog.innerHTML = `
            <div class="calendar-dialog">
                <div class="dialog-header">
                    <h3>新增事件</h3>
                    <button class="dialog-close" onclick="window.activeModule.closeDialog()">×</button>
                </div>
                
                <div class="dialog-content">
                    <div class="form-group">
                        <label>事件標題</label>
                        <input type="text" id="eventTitle" placeholder="輸入事件標題" maxlength="50">
                    </div>
                    
                    <div class="form-group">
                        <label>事件類型</label>
                        <div class="event-type-selector">
                            <button class="type-btn active" data-type="timed" onclick="window.activeModule.selectEventType('timed')">定時事件</button>
                            <button class="type-btn" data-type="allday" onclick="window.activeModule.selectEventType('allday')">全日事件</button>
                            <button class="type-btn" data-type="multiday" onclick="window.activeModule.selectEventType('multiday')">跨日事件</button>
                        </div>
                    </div>
                    
                    <!-- 定時事件設定 -->
                    <div id="timedEventSettings" class="event-settings">
                        <div class="form-row">
                            <div class="form-group">
                                <label>開始日期</label>
                                <input type="date" id="startDate" value="${dateString}">
                            </div>
                            <div class="form-group">
                                <label>開始時間</label>
                                <input type="time" id="startTime" value="09:00">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>結束日期</label>
                                <input type="date" id="endDate" value="${dateString}">
                            </div>
                            <div class="form-group">
                                <label>結束時間</label>
                                <input type="time" id="endTime" value="10:00">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 全日事件設定 -->
                    <div id="alldayEventSettings" class="event-settings" style="display: none;">
                        <div class="form-group">
                            <label>日期</label>
                            <input type="date" id="alldayDate" value="${dateString}">
                        </div>
                    </div>
                    
                    <!-- 跨日事件設定 -->
                    <div id="multidayEventSettings" class="event-settings" style="display: none;">
                        <div class="form-row">
                            <div class="form-group">
                                <label>開始日期</label>
                                <input type="date" id="multidayStartDate" value="${dateString}">
                            </div>
                            <div class="form-group">
                                <label>結束日期</label>
                                <input type="date" id="multidayEndDate" value="${dateString}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>備註</label>
                        <textarea id="eventDescription" placeholder="事件詳細說明（選填）" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>優先級</label>
                        <select id="eventPriority">
                            <option value="low">低</option>
                            <option value="medium" selected>中</option>
                            <option value="high">高</option>
                        </select>
                    </div>
                </div>
                
                <div class="dialog-actions">
                    <button class="btn btn-secondary" onclick="window.activeModule.closeDialog()">取消</button>
                    <button class="btn btn-primary" onclick="window.activeModule.saveEvent()">儲存事件</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.currentDialog = dialog;
        this.selectedEventType = 'timed';
        
        // 聚焦標題輸入框
        setTimeout(() => {
            document.getElementById('eventTitle').focus();
        }, 100);
    }

    selectEventType(type) {
        this.selectedEventType = type;
        
        // 更新按鈕狀態
        document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        // 顯示/隱藏對應設定
        document.querySelectorAll('.event-settings').forEach(el => el.style.display = 'none');
        document.getElementById(`${type}EventSettings`).style.display = 'block';
    }
    
    async saveEvent() {
        const title = document.getElementById('eventTitle').value.trim();
        if (!title) {
            this.showToast('請輸入事件標題', 'error');
            return;
        }
        
        const eventType = this.selectedEventType;
        const priority = document.getElementById('eventPriority').value;
        const description = document.getElementById('eventDescription').value.trim();
        
        let eventData = {
            id: Date.now().toString(),
            title,
            description,
            priority,
            type: eventType,
            createdAt: new Date().toISOString()
        };
        
        // 根據事件類型處理時間
        if (eventType === 'timed') {
            const startDate = document.getElementById('startDate').value;
            const startTime = document.getElementById('startTime').value;
            const endDate = document.getElementById('endDate').value;
            const endTime = document.getElementById('endTime').value;
            
            eventData.startDateTime = `${startDate}T${startTime}:00`;
            eventData.endDateTime = `${endDate}T${endTime}:00`;
        } else if (eventType === 'allday') {
            const date = document.getElementById('alldayDate').value;
            eventData.date = date;
            eventData.allDay = true;
        } else if (eventType === 'multiday') {
            const startDate = document.getElementById('multidayStartDate').value;
            const endDate = document.getElementById('multidayEndDate').value;
            
            eventData.startDate = startDate;
            eventData.endDate = endDate;
            eventData.multiDay = true;
        }
        
        this.events.push(eventData);
        await this.saveData();
        
        this.closeDialog();
        this.refreshView();
        this.showToast('事件建立成功', 'success');
    }
    
    closeDialog() {
        if (this.currentDialog) {
            this.currentDialog.remove();
            this.currentDialog = null;
        }
    }
    
    refreshView() {
        const moduleContainer = document.getElementById('moduleContainer');
        if (moduleContainer) {
            moduleContainer.innerHTML = this.getHTML();
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
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
