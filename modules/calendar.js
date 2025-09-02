/**
 * 優雅月曆模組 - 遊戲人生 3.0 大改版
 * 符合 building-manual 規範
 * 
 * 核心功能：
 * 1. 優雅月檢視佈局 - 莫蘭迪配色系統
 * 2. 智能事件管理 - 創建、編輯、刪除
 * 3. 待辦事項整合 - 自動同步顯示
 * 4. 響應式設計 - 完美適配各種設備
 * 5. 鍵盤快捷鍵 - 流暢的操作體驗
 * 6. 優先級視覺化 - 直觀的顏色標示
 * 7. 月份導航 - 平滑的切換動畫
 * 8. 今日高亮 - 清晰的時間定位
 */

class CalendarModule {
    // 靜態資訊（必填）
    static moduleInfo = {
        name: '優雅月曆',
        subtitle: '莫蘭迪風格的時間管理藝術',
        icon: `<svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" fill="url(#warmGradient)" opacity="0.3"/>
                <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
        this.todos = []; // 來自待辦事項的資料
        this.currentDate = new Date();
        this.selectedDate = null;
        this.viewDate = new Date(); // 當前檢視的月份
        
        // 莫蘭迪配色系統
        this.priorityColors = {
            low: '#9faa95',    // 靜水深流
            medium: '#7eb3d3', // 雲起風動  
            high: '#d4a574'    // 夕照金輝
        };
        
        // 月份名稱
        this.monthNames = [
            '一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'
        ];
        
        // 星期名稱
        this.dayNames = ['日', '一', '二', '三', '四', '五', '六'];
        
        // 事件監聽器引用（用於清理）
        this.keyboardHandler = null;
    }

    async render(uuid) {
        this.currentUser = { uuid };
        
        // 動態載入管委會
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 載入資料
        await this.loadData();
        
        // 渲染介面
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 綁定事件
        this.attachEventListeners();
        
        // 初始化月曆視圖
        this.updateCalendarView();
    }

    getHTML() {
        return `
            <div class="calendar-container">
                <!-- 月曆標題和導航 -->
                <div class="calendar-header">
                    <div class="calendar-title">
                        <h2>優雅月曆</h2>
                        <p>莫蘭迪風格的時間管理藝術</p>
                    </div>
                    
                    <div class="calendar-navigation">
                        <button class="nav-btn" onclick="window.activeModule.previousMonth()" aria-label="上個月">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path d="M12 15l-5-5 5-5" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        
                        <div class="current-month">
                            <span class="month-year" id="currentMonthYear">${this.monthNames[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}</span>
                        </div>
                        
                        <button class="nav-btn" onclick="window.activeModule.nextMonth()" aria-label="下個月">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path d="M8 15l5-5-5-5" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        
                        <button class="today-btn" onclick="window.activeModule.goToToday()">今天</button>
                        
                        <button class="add-event-btn" onclick="window.activeModule.showAddEventDialog()">
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            新增事件
                        </button>
                    </div>
                </div>
                
                <!-- 月曆網格 -->
                <div class="calendar-grid-container">
                    <div class="calendar-grid">
                        <!-- 星期標題 -->
                        <div class="calendar-header-row">
                            ${this.dayNames.map(day => `
                                <div class="calendar-day-header">${day}</div>
                            `).join('')}
                        </div>
                        
                        <!-- 日期格子 -->
                        <div class="calendar-days" id="calendarDays">
                            <!-- 由 JavaScript 動態生成 -->
                        </div>
                    </div>
                </div>
            </div>
            
            ${this.getCalendarStyles()}
        `;
    }

    async loadData() {
        try {
            // 載入月曆事件
            const calendarData = await this.syncManager.load(this.currentUser.uuid, 'calendar');
            if (calendarData && calendarData.events) {
                this.events = calendarData.events;
            } else {
                this.events = [];
            }
            
            // 載入待辦事項 (用於整合顯示)
            const todoData = await this.syncManager.load(this.currentUser.uuid, 'todos');
            if (todoData && todoData.todos) {
                this.todos = todoData.todos.filter(todo => {
                    // 只顯示有到期日的待辦事項
                    return todo.dueDate && todo.status === 'pending';
                });
            } else {
                this.todos = [];
            }
        } catch (error) {
            console.error('載入資料失敗:', error);
            this.events = [];
            this.todos = [];
        }
    }

    // 月曆核心功能
    updateCalendarView() {
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        
        // 獲取月份的第一天和最後一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        
        // 計算日曆網格的開始日期 (包含上月的天數)
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let html = '';
        const today = new Date();
        const todayStr = this.formatDate(today);
        
        // 生成 6 週 x 7 天 = 42 個日期格子
        for (let week = 0; week < 6; week++) {
            html += '<div class="calendar-week">';
            
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                
                const dateStr = this.formatDate(currentDate);
                const isToday = dateStr === todayStr;
                const isCurrentMonth = currentDate.getMonth() === month;
                const isSelected = this.selectedDate === dateStr;
                
                // 獲取當日的事件
                const dayEvents = this.getEventsForDate(dateStr);
                const dayTodos = this.getTodosForDate(dateStr);
                
                let dayClass = 'calendar-day';
                if (isToday) dayClass += ' today';
                if (!isCurrentMonth) dayClass += ' other-month';
                if (isSelected) dayClass += ' selected';
                if (dayEvents.length > 0 || dayTodos.length > 0) dayClass += ' has-events';
                
                html += `
                    <div class="${dayClass}" 
                         data-date="${dateStr}"
                         onclick="window.activeModule.selectDate('${dateStr}')"
                         ondblclick="window.activeModule.showAddEventDialog('${dateStr}')">
                        
                        <div class="day-number">${currentDate.getDate()}</div>
                        
                        <div class="day-events">
                            ${dayEvents.slice(0, 3).map(event => `
                                <div class="event-dot ${event.priority}" 
                                     title="${event.title}"
                                     onclick="window.activeModule.showEventDetails('${event.id}'); event.stopPropagation();">
                                    <span class="event-title">${event.title}</span>
                                </div>
                            `).join('')}
                            
                            ${dayTodos.slice(0, 2).map(todo => `
                                <div class="todo-item ${todo.priority}" 
                                     title="[待辦] ${todo.title}"
                                     onclick="window.activeModule.showTodoDetails('${todo.id}'); event.stopPropagation();">
                                    <span class="todo-title">[待辦] ${todo.title}</span>
                                </div>
                            `).join('')}
                            
                            ${(dayEvents.length + dayTodos.length) > 5 ? `
                                <div class="more-events" onclick="window.activeModule.showDayDetails('${dateStr}'); event.stopPropagation();">
                                    +${(dayEvents.length + dayTodos.length) - 5} 更多
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
        }
        
        calendarDays.innerHTML = html;
        
        // 更新標題
        const monthYearEl = document.getElementById('currentMonthYear');
        if (monthYearEl) {
            monthYearEl.textContent = `${this.monthNames[month]} ${year}`;
        }
    }

    // 月份導航功能
    previousMonth() {
        this.viewDate.setMonth(this.viewDate.getMonth() - 1);
        this.updateCalendarView();
    }
    
    nextMonth() {
        this.viewDate.setMonth(this.viewDate.getMonth() + 1);
        this.updateCalendarView();
    }
    
    goToToday() {
        this.viewDate = new Date();
        this.selectedDate = this.formatDate(new Date());
        this.updateCalendarView();
    }
    
    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.updateCalendarView();
    }
    
    // 獲取指定日期的事件
    getEventsForDate(dateStr) {
        return this.events.filter(event => {
            if (event.endDate) {
                // 跨日事件
                return dateStr >= event.startDate && dateStr <= event.endDate;
            } else {
                // 單日事件
                return event.date === dateStr || event.startDate === dateStr;
            }
        });
    }
    
    // 獲取指定日期的待辦事項
    getTodosForDate(dateStr) {
        return this.todos.filter(todo => todo.dueDate === dateStr);
    }
    
    // 日期格式化工具
    formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 顯示新增事件對話框
    showAddEventDialog(selectedDate = null) {
        const defaultDate = selectedDate || (this.selectedDate || this.formatDate(new Date()));
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="dialog calendar-event-dialog">
                <div class="dialog-header">
                    <h3>新增事件</h3>
                    <button class="dialog-close" onclick="window.activeModule.closeDialog()">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                
                <div class="dialog-content">
                    <div class="form-group">
                        <label class="form-label">事件標題 <span class="required">*</span></label>
                        <input type="text" class="form-input" id="eventTitle" 
                               placeholder="輸入事件標題" maxlength="50">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">開始日期</label>
                            <input type="date" class="form-input" id="eventStartDate" value="${defaultDate}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">結束日期</label>
                            <input type="date" class="form-input" id="eventEndDate" value="${defaultDate}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">開始時間</label>
                            <input type="time" class="form-input" id="eventStartTime">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">結束時間</label>
                            <input type="time" class="form-input" id="eventEndTime">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">優先級</label>
                        <div class="priority-selector">
                            <button type="button" class="priority-btn" data-priority="low">
                                <div class="priority-color" style="background: ${this.priorityColors.low}"></div>
                                低優先級
                            </button>
                            <button type="button" class="priority-btn active" data-priority="medium">
                                <div class="priority-color" style="background: ${this.priorityColors.medium}"></div>
                                中優先級
                            </button>
                            <button type="button" class="priority-btn" data-priority="high">
                                <div class="priority-color" style="background: ${this.priorityColors.high}"></div>
                                高優先級
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <input type="checkbox" id="allDayEvent" onchange="window.activeModule.toggleAllDay()">
                        <label for="allDayEvent">全天事件</label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">備註</label>
                        <textarea class="form-textarea" id="eventNote" 
                                  placeholder="記錄相關資訊、提醒事項等" 
                                  rows="3"></textarea>
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
        this.attachDialogEvents(dialog);
        
        // 初始化優先級選擇器
        this.initPrioritySelector();
        
        // 聚焦標題輸入框
        setTimeout(() => {
            document.getElementById('eventTitle').focus();
        }, 100);
    }
    
    // Toast 提示
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.calendar-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'calendar-toast';
        
        const colors = {
            success: { bg: '#9faa95', text: 'white' },
            error: { bg: '#d4a574', text: 'white' },
            info: { bg: '#7eb3d3', text: 'white' }
        };
        
        const color = colors[type] || colors.info;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            z-index: 10000;
            font-weight: 500;
            font-size: 14px;
            backdrop-filter: blur(10px);
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 200);
        }, 3000);
    }
    
    // 缺少的方法 - 暫時簡單實現
    showEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            alert(`事件: ${event.title}\n日期: ${event.startDate}\n優先級: ${event.priority}`);
        }
    }
    
    showTodoDetails(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            alert(`待辦事項: ${todo.title}\n到期日: ${todo.dueDate}\n優先級: ${todo.priority}`);
        }
    }
    
    showDayDetails(dateStr) {
        const events = this.getEventsForDate(dateStr);
        const todos = this.getTodosForDate(dateStr);
        const total = events.length + todos.length;
        
        let message = `${dateStr} 的所有事項 (${total}個):\n\n`;
        
        events.forEach(event => {
            message += `事件: ${event.title} (優先級: ${event.priority})\n`;
        });
        
        todos.forEach(todo => {
            message += `待辦: ${todo.title} (優先級: ${todo.priority})\n`;
        });
        
        alert(message);
    }

    // 事件監聽器
    attachEventListeners() {
        // 鍵盤快捷鍵
        this.keyboardHandler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return; // 在輸入框中不處理快捷鍵
            }
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousMonth();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextMonth();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToToday();
                    break;
                case 'n':
                case 'N':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showAddEventDialog();
                    }
                    break;
                case 'Escape':
                    this.closeDialog();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyboardHandler);
    }
    
    // 優先級選擇器初始化
    initPrioritySelector() {
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // 全天事件切換
    toggleAllDay() {
        const allDayCheck = document.getElementById('allDayEvent');
        const startTime = document.getElementById('eventStartTime');
        const endTime = document.getElementById('eventEndTime');
        
        if (allDayCheck && allDayCheck.checked) {
            startTime.disabled = true;
            endTime.disabled = true;
            startTime.value = '';
            endTime.value = '';
        } else {
            startTime.disabled = false;
            endTime.disabled = false;
        }
    }
    
    // 儲存事件
    async saveEvent() {
        const title = document.getElementById('eventTitle').value.trim();
        if (!title) {
            this.showToast('請輸入事件標題', 'error');
            document.getElementById('eventTitle').focus();
            return;
        }
        
        const startDate = document.getElementById('eventStartDate').value;
        const endDate = document.getElementById('eventEndDate').value;
        const startTime = document.getElementById('eventStartTime').value;
        const endTime = document.getElementById('eventEndTime').value;
        const isAllDay = document.getElementById('allDayEvent').checked;
        const note = document.getElementById('eventNote').value.trim();
        const activePriorityBtn = document.querySelector('.priority-btn.active');
        const priority = activePriorityBtn ? activePriorityBtn.dataset.priority : 'medium';
        
        // 驗證日期
        if (!startDate) {
            this.showToast('請選擇開始日期', 'error');
            return;
        }
        
        if (endDate && endDate < startDate) {
            this.showToast('結束日期不能早於開始日期', 'error');
            return;
        }
        
        // 建立事件物件
        const newEvent = {
            id: Date.now().toString(),
            title,
            startDate,
            endDate: endDate || startDate,
            startTime: isAllDay ? null : startTime,
            endTime: isAllDay ? null : endTime,
            isAllDay,
            priority,
            note,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // 為跨日事件設定 date 屬性 (相容性)
        if (!endDate || startDate === endDate) {
            newEvent.date = startDate;
        }
        
        this.events.push(newEvent);
        await this.saveData();
        
        this.closeDialog();
        this.updateCalendarView();
        this.showToast('事件建立成功', 'success');
    }
    
    // 儲存資料
    async saveData() {
        try {
            await this.syncManager.save(this.currentUser.uuid, 'calendar', {
                events: this.events,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('儲存失敗:', error);
            this.showToast('儲存失敗', 'error');
        }
    }
    
    // 關閉對話框
    closeDialog() {
        const dialog = document.querySelector('.dialog-overlay');
        if (dialog) {
            dialog.style.opacity = '0';
            setTimeout(() => dialog.remove(), 200);
        }
        this.currentDialog = null;
    }
    
    // 對話框事件綁定
    attachDialogEvents(dialog) {
        // ESC 關閉
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                this.closeDialog();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // 點擊外圍關閉
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                this.closeDialog();
            }
        });
        
        // Enter 快速儲存
        const titleInput = document.getElementById('eventTitle');
        if (titleInput) {
            titleInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveEvent();
                }
            });
        }
    }

    // 清理方法
    destroy() {
        // 清理事件監聽器
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }
        
        // 清理 Toast
        const existingToast = document.querySelector('.calendar-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 關閉對話框
        this.closeDialog();
        
        // 清理狀態
        this.selectedDate = null;
        this.currentDialog = null;
        
        console.log('優雅月曆模組已清理');
    }
    
    // 獲取樣式表
    getCalendarStyles() {
        return `
            <style>
                /* 莫蘭迪配色系統 */
                .calendar-container {
                    --calendar-bg: #f5f2ef;
                    --calendar-card: #fefdfb;
                    --calendar-border: #e6e0d8;
                    --calendar-text: #4a453f;
                    --calendar-text-light: #8b847a;
                    --calendar-text-muted: #a8a19a;
                    --calendar-primary: var(--primary);
                    --calendar-low: #9faa95;
                    --calendar-medium: #7eb3d3;
                    --calendar-high: #d4a574;
                    
                    height: 100%;
                    padding: 24px;
                    background: var(--calendar-bg);
                    font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif;
                }
                
                /* 標題區域 */
                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                    background: var(--calendar-card);
                    padding: 24px;
                    border-radius: 20px;
                    border: 1px solid var(--calendar-border);
                    backdrop-filter: blur(20px);
                }
                
                .calendar-title h2 {
                    font-size: 2rem;
                    font-weight: 300;
                    color: var(--calendar-text);
                    margin: 0 0 8px 0;
                }
                
                .calendar-title p {
                    color: var(--calendar-text-light);
                    margin: 0;
                    font-size: 1rem;
                }
                
                .calendar-navigation {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .nav-btn {
                    width: 40px;
                    height: 40px;
                    border: 1px solid var(--calendar-border);
                    background: var(--calendar-card);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--calendar-text);
                }
                
                .nav-btn:hover {
                    background: var(--calendar-primary);
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .current-month {
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                    min-width: 140px;
                    text-align: center;
                }
                
                .current-month:hover {
                    background: rgba(201, 169, 97, 0.1);
                }
                
                .month-year {
                    font-size: 1.1rem;
                    font-weight: 500;
                    color: var(--calendar-text);
                }
                
                .today-btn, .add-event-btn {
                    padding: 8px 16px;
                    border: 1px solid var(--calendar-border);
                    background: var(--calendar-card);
                    color: var(--calendar-text);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .today-btn:hover {
                    background: var(--calendar-medium);
                    color: white;
                    transform: translateY(-1px);
                }
                
                .add-event-btn {
                    background: var(--calendar-primary);
                    color: white;
                    border-color: var(--calendar-primary);
                }
                
                .add-event-btn:hover {
                    background: var(--primary-dark);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(201, 169, 97, 0.3);
                }
                
                /* 月曆網格 */
                .calendar-grid-container {
                    background: var(--calendar-card);
                    border-radius: 20px;
                    border: 1px solid var(--calendar-border);
                    padding: 24px;
                    overflow: hidden;
                }
                
                .calendar-grid {
                    width: 100%;
                }
                
                .calendar-header-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1px;
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid var(--calendar-border);
                }
                
                .calendar-day-header {
                    text-align: center;
                    font-weight: 600;
                    color: var(--calendar-text-light);
                    padding: 12px;
                    font-size: 0.9rem;
                    letter-spacing: 0.5px;
                }
                
                .calendar-days {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .calendar-week {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 8px;
                }
                
                .calendar-day {
                    min-height: 120px;
                    background: var(--calendar-bg);
                    border: 1px solid var(--calendar-border);
                    border-radius: 12px;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                
                .calendar-day:hover {
                    background: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    border-color: var(--calendar-primary);
                }
                
                .calendar-day.today {
                    background: rgba(201, 169, 97, 0.1);
                    border-color: var(--calendar-primary);
                    box-shadow: 0 0 0 2px rgba(201, 169, 97, 0.2);
                }
                
                .calendar-day.selected {
                    background: rgba(201, 169, 97, 0.2);
                    border-color: var(--calendar-primary);
                    box-shadow: 0 0 0 2px var(--calendar-primary);
                }
                
                .calendar-day.other-month {
                    opacity: 0.4;
                }
                
                .calendar-day.has-events {
                    border-left: 4px solid var(--calendar-primary);
                }
                
                .day-number {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--calendar-text);
                    margin-bottom: 8px;
                }
                
                .day-events {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    overflow: hidden;
                }
                
                .event-dot, .todo-item {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 1.2;
                }
                
                .event-dot:hover, .todo-item:hover {
                    transform: scale(1.02);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                
                .event-dot.low { background: var(--calendar-low); }
                .event-dot.medium { background: var(--calendar-medium); }
                .event-dot.high { background: var(--calendar-high); }
                
                .todo-item.low { background: var(--calendar-low); opacity: 0.8; }
                .todo-item.medium { background: var(--calendar-medium); opacity: 0.8; }
                .todo-item.high { background: var(--calendar-high); opacity: 0.8; }
                
                .more-events {
                    padding: 2px 8px;
                    background: var(--calendar-text-muted);
                    color: white;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    text-align: center;
                    cursor: pointer;
                    margin-top: 2px;
                }
                
                /* 對話框樣式 */
                .dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(74, 69, 63, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 1;
                    transition: all 0.2s ease;
                }
                
                .calendar-event-dialog {
                    background: var(--calendar-card);
                    border-radius: 20px;
                    padding: 32px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    border: 1px solid var(--calendar-border);
                }
                
                .dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                
                .dialog-header h3 {
                    font-size: 1.3rem;
                    font-weight: 500;
                    color: var(--calendar-text);
                    margin: 0;
                }
                
                .dialog-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: var(--calendar-bg);
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--calendar-text-light);
                    transition: all 0.2s ease;
                }
                
                .dialog-close:hover {
                    background: var(--calendar-high);
                    color: white;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: var(--calendar-text);
                    font-size: 0.9rem;
                }
                
                .required {
                    color: var(--calendar-high);
                }
                
                .form-input, .form-textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid var(--calendar-border);
                    border-radius: 12px;
                    font-size: 0.95rem;
                    background: var(--calendar-bg);
                    color: var(--calendar-text);
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }
                
                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--calendar-primary);
                    box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
                    background: white;
                }
                
                .form-textarea {
                    resize: vertical;
                    font-family: inherit;
                }
                
                .priority-selector {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                
                .priority-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    border: 1px solid var(--calendar-border);
                    background: var(--calendar-bg);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.9rem;
                    color: var(--calendar-text);
                }
                
                .priority-btn:hover {
                    background: white;
                    transform: translateY(-1px);
                }
                
                .priority-btn.active {
                    background: var(--calendar-primary);
                    color: white;
                    border-color: var(--calendar-primary);
                }
                
                .priority-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                
                .dialog-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 32px;
                }
                
                .btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    font-size: 0.95rem;
                    border: none;
                }
                
                .btn-secondary {
                    background: var(--calendar-bg);
                    color: var(--calendar-text);
                    border: 1px solid var(--calendar-border);
                }
                
                .btn-secondary:hover {
                    background: white;
                    transform: translateY(-1px);
                }
                
                .btn-primary {
                    background: var(--calendar-primary);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(201, 169, 97, 0.3);
                }
                
                /* 響應式設計 */
                @media (max-width: 768px) {
                    .calendar-container {
                        padding: 16px;
                    }
                    
                    .calendar-header {
                        flex-direction: column;
                        gap: 16px;
                        padding: 20px;
                    }
                    
                    .calendar-navigation {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    
                    .calendar-day {
                        min-height: 80px;
                        padding: 8px;
                    }
                    
                    .day-number {
                        font-size: 1rem;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .priority-selector {
                        grid-template-columns: 1fr;
                    }
                    
                    .calendar-event-dialog {
                        padding: 24px;
                        width: 95%;
                    }
                }
            </style>
        `;
    }
}

export { CalendarModule };