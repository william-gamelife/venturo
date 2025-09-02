/**
 * 箱型時間管理模組 - 遊戲人生 3.0
 * 符合 building-manual 規範
 * 
 * 功能：
 * 1. 週時間規劃面板（7天 × 17小時格子）
 * 2. 番茄鐘計時器（全域背景計時）
 * 3. 活動類型管理與統計
 * 4. 歷史記錄與分析
 */

class TimeboxModule {
    // 靜態資訊（必填）- 店家招牌
    static moduleInfo = {
        name: '箱型時間',
        subtitle: '視覺化時間規劃與番茄鐘管理',
        icon: `<svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
                <path d="M3 9h18M9 3v18" stroke="currentColor" stroke-width="1" opacity="0.3"/>
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/>
                <path d="M12 9v3l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
               </svg>`,
        version: '2.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.timeboxData = null;
        this.currentWeekStart = null;
        this.timerState = null;
        this.activityTypes = [];
        this.selectedTimeSlots = new Set();
        this.timeUnit = 30; // 預設30分鐘為單位
        this.touchStartTime = null;
        this.longPressTimer = null;
    }

    async render(uuid) {
        this.currentUser = { uuid };
        
        // 動態載入管委會
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 初始化當前週
        this.initCurrentWeek();
        
        // 載入資料
        await this.loadData();
        
        // 渲染介面
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 綁定事件
        this.attachEventListeners();
        
        // 檢查計時器狀態
        this.checkTimerState();
    }

    initCurrentWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        // 修正為週一開始
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        this.currentWeekStart = new Date(today.setDate(diff));
        this.currentWeekStart.setHours(0, 0, 0, 0);
    }

    async loadData() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'timebox');
            if (data) {
                this.timeboxData = data.timeboxes || {};
                this.activityTypes = data.activityTypes || this.getDefaultActivityTypes();
                this.timerState = data.timerState || null;
            } else {
                this.timeboxData = {};
                this.activityTypes = this.getDefaultActivityTypes();
                this.timerState = null;
            }
        } catch (error) {
            console.error('載入資料失敗:', error);
            this.timeboxData = {};
            this.activityTypes = this.getDefaultActivityTypes();
        }
    }

    async saveData() {
        try {
            await this.syncManager.save(this.currentUser.uuid, 'timebox', {
                timeboxes: this.timeboxData,
                activityTypes: this.activityTypes,
                timerState: this.timerState,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('儲存失敗:', error);
            this.showToast('儲存失敗', 'error');
        }
    }

    getDefaultActivityTypes() {
        return [
            { id: 'work', name: '工作', color: '#c9a961', countType: 'time' },
            { id: 'exercise', name: '運動', color: '#7a8b74', countType: 'time' },
            { id: 'workout', name: '重訓', color: '#d4a574', countType: 'time' },
            { id: 'study', name: '學習', color: '#6b8e9f', countType: 'time' },
            { id: 'rest', name: '休息', color: '#b87d8b', countType: 'time' }
        ];
    }

    getHTML() {
        return `
            <div class="timebox-container">
                <!-- 頂部工具列 -->
                <div class="timebox-header">
                    <div class="week-navigator">
                        <button class="week-btn prev" onclick="window.activeModule.changeWeek(-1)">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path d="M12 15l-5-5 5-5" stroke="currentColor" fill="none" stroke-width="2"/>
                            </svg>
                        </button>
                        <div class="week-title">
                            <span class="week-text">${this.getWeekTitle()}</span>
                            <button class="today-btn" onclick="window.activeModule.goToToday()">今天</button>
                        </div>
                        <button class="week-btn next" onclick="window.activeModule.changeWeek(1)">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path d="M8 15l5-5-5-5" stroke="currentColor" fill="none" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="timebox-tools">
                        <!-- 時間單位切換 -->
                        <div class="time-unit-selector">
                            <button class="unit-btn ${this.timeUnit === 15 ? 'active' : ''}" 
                                    onclick="window.activeModule.setTimeUnit(15)">15分</button>
                            <button class="unit-btn ${this.timeUnit === 30 ? 'active' : ''}" 
                                    onclick="window.activeModule.setTimeUnit(30)">30分</button>
                            <button class="unit-btn ${this.timeUnit === 60 ? 'active' : ''}" 
                                    onclick="window.activeModule.setTimeUnit(60)">60分</button>
                        </div>
                        
                        <!-- 番茄鐘按鈕 -->
                        <button class="pomodoro-btn" onclick="window.activeModule.togglePomodoroPanel()">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                                <path d="M10 6v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span>番茄鐘</span>
                        </button>
                        
                        <!-- 活動類型管理 -->
                        <button class="activity-btn" onclick="window.activeModule.showActivityManager()">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <rect x="3" y="3" width="6" height="6" fill="currentColor" opacity="0.3"/>
                                <rect x="11" y="3" width="6" height="6" fill="currentColor" opacity="0.5"/>
                                <rect x="3" y="11" width="6" height="6" fill="currentColor" opacity="0.7"/>
                                <rect x="11" y="11" width="6" height="6" fill="currentColor"/>
                            </svg>
                            <span>活動類型</span>
                        </button>
                    </div>
                </div>

                <!-- 番茄鐘面板（初始隱藏）-->
                <div class="pomodoro-panel" id="pomodoroPanel" style="display: none;">
                    ${this.getPomodoroHTML()}
                </div>

                <!-- 主要時間格子區 -->
                <div class="timebox-grid-wrapper">
                    <div class="timebox-grid">
                        ${this.getTimeGridHTML()}
                    </div>
                </div>

                <!-- 統計區域 -->
                <div class="timebox-stats">
                    ${this.getStatsHTML()}
                </div>
            </div>

            <style>
                .timebox-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 20px;
                }

                /* 頂部工具列 */
                .timebox-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                    background: var(--card);
                    padding: 16px 20px;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                }

                .week-navigator {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .week-btn {
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

                .week-btn:hover {
                    background: var(--primary-light);
                    transform: scale(1.05);
                }

                .week-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .week-text {
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: var(--text);
                    min-width: 180px;
                    text-align: center;
                }

                .today-btn {
                    padding: 6px 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .today-btn:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }

                .timebox-tools {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                /* 時間單位選擇器 */
                .time-unit-selector {
                    display: flex;
                    background: var(--bg);
                    border-radius: 8px;
                    padding: 2px;
                    border: 1px solid var(--border);
                }

                .unit-btn {
                    padding: 6px 12px;
                    background: transparent;
                    border: none;
                    color: var(--text-light);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                }

                .unit-btn.active {
                    background: white;
                    color: var(--primary);
                    font-weight: 600;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .pomodoro-btn, .activity-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }

                .pomodoro-btn:hover, .activity-btn:hover {
                    background: var(--primary-light);
                    transform: translateY(-1px);
                }

                /* 時間格子網格 */
                .timebox-grid-wrapper {
                    flex: 1;
                    background: var(--card);
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    overflow: auto;
                    min-height: 400px;
                }

                .timebox-grid {
                    display: grid;
                    grid-template-columns: 60px repeat(7, 1fr);
                    grid-template-rows: 40px repeat(${17 * (60/this.timeUnit)}, 30px);
                    gap: 1px;
                    background: var(--border);
                    padding: 1px;
                    min-width: 700px;
                }

                /* 時間標籤 */
                .time-label {
                    background: var(--bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    position: sticky;
                    left: 0;
                    z-index: 1;
                }

                /* 星期標題 */
                .day-header {
                    background: linear-gradient(to bottom, white, var(--bg));
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: var(--text);
                    position: sticky;
                    top: 0;
                    z-index: 2;
                    border-bottom: 2px solid var(--border);
                }

                .day-header.today {
                    background: linear-gradient(to bottom, var(--primary-light), var(--bg));
                    color: var(--primary-dark);
                }

                .day-name {
                    font-size: 0.9rem;
                }

                .day-date {
                    font-size: 0.75rem;
                    color: var(--text-light);
                    font-weight: 400;
                }

                /* 時間格子 */
                .time-slot {
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    user-select: none;
                    border: 1px solid var(--border);
                }

                .time-slot:hover {
                    background: var(--bg);
                    transform: scale(1.02);
                    z-index: 1;
                }

                .time-slot.selected {
                    background: var(--primary-light);
                    border: 2px solid var(--primary);
                }

                .time-slot.occupied {
                    cursor: default;
                    position: relative;
                    overflow: hidden;
                    border: none;
                }
                
                /* 合併邊框樣式 */
                .time-slot.merge-top {
                    border-top: none;
                    margin-top: -1px;
                }
                
                .time-slot.merge-bottom {
                    border-bottom: none;
                }
                
                .time-slot.merge-left {
                    border-left: none;
                    margin-left: -1px;
                }
                
                .time-slot.merge-right {
                    border-right: none;
                }

                .time-slot.completed {
                    opacity: 0.9;
                }

                .time-slot.completed::after {
                    content: '✓';
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                    background: rgba(0,0,0,0.3);
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .time-slot-content {
                    padding: 4px;
                    font-size: 0.7rem;
                    color: white;
                    font-weight: 500;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }

                /* 番茄鐘面板 */
                .pomodoro-panel {
                    background: var(--card);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid var(--border);
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .pomodoro-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }

                .timer-display {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .timer-circle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: conic-gradient(
                        var(--primary) var(--progress, 0deg),
                        var(--bg) var(--progress, 0deg)
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .timer-circle::before {
                    content: '';
                    position: absolute;
                    width: 70px;
                    height: 70px;
                    background: white;
                    border-radius: 50%;
                }

                .timer-text {
                    position: relative;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--text);
                }

                .timer-controls {
                    display: flex;
                    gap: 8px;
                }

                .timer-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: white;
                    color: var(--text);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .timer-btn:hover {
                    background: var(--primary);
                    color: white;
                    transform: translateY(-1px);
                }

                .timer-btn.primary {
                    background: var(--primary);
                    color: white;
                }

                /* 統計區域 */
                .timebox-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .stat-card {
                    background: var(--card);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid var(--border);
                }

                .stat-title {
                    font-size: 0.85rem;
                    color: var(--text-light);
                    margin-bottom: 8px;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--primary);
                }

                .stat-detail {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 4px;
                }

                /* 活動編輯對話框 */
                .activity-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    min-width: 400px;
                    max-width: 90vw;
                }

                .dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 999;
                }

                .dialog-header {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: var(--text);
                }

                .dialog-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-label {
                    font-size: 0.9rem;
                    color: var(--text-light);
                    font-weight: 500;
                }

                .form-input, .form-select, .form-textarea {
                    padding: 10px 12px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
                }

                .color-picker-group {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .color-option {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }

                .color-option:hover {
                    transform: scale(1.1);
                }

                .color-option.selected {
                    border-color: var(--text);
                    box-shadow: 0 0 0 2px white, 0 0 0 4px var(--text);
                }

                .dialog-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: white;
                    color: var(--text);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .btn:hover {
                    transform: translateY(-1px);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                }

                /* Toast 提示 */
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

                .toast.error {
                    background: #e74c3c;
                }

                .toast.success {
                    background: #27ae60;
                }

                /* 手機版響應式 */
                @media (max-width: 768px) {
                    .timebox-container {
                        padding: 12px;
                        gap: 12px;
                    }

                    .timebox-header {
                        flex-direction: column;
                        padding: 12px;
                    }

                    .timebox-tools {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .timebox-grid {
                        grid-template-rows: 40px repeat(${17 * (60/this.timeUnit)}, 25px);
                        min-width: 100%;
                    }

                    .time-label {
                        font-size: 0.7rem;
                    }

                    .timebox-stats {
                        grid-template-columns: 1fr;
                    }

                    .activity-dialog {
                        min-width: 90vw;
                        padding: 20px;
                    }
                }
            </style>
        `;
    }

    getWeekTitle() {
        const endDate = new Date(this.currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);
        
        const startStr = `${this.currentWeekStart.getMonth() + 1}/${this.currentWeekStart.getDate()}`;
        const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
        
        return `${this.currentWeekStart.getFullYear()}年 ${startStr} - ${endStr}`;
    }

    getTimeGridHTML() {
        const days = ['一', '二', '三', '四', '五', '六', '日'];  // 週一到週日
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let html = '<div class="time-label"></div>'; // 左上角空格
        
        // 星期標題
        for (let d = 0; d < 7; d++) {
            const date = new Date(this.currentWeekStart);
            date.setDate(date.getDate() + d);
            const isToday = date.getTime() === today.getTime();
            
            html += `
                <div class="day-header ${isToday ? 'today' : ''}">
                    <div class="day-name">${days[d]}</div>
                    <div class="day-date">${date.getMonth() + 1}/${date.getDate()}</div>
                </div>
            `;
        }
        
        // 時間格子
        const slotsPerHour = 60 / this.timeUnit;
        for (let hour = 6; hour < 23; hour++) {
            for (let slot = 0; slot < slotsPerHour; slot++) {
                const minutes = slot * this.timeUnit;
                const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                
                // 時間標籤（只在整點或第一個時段顯示）
                if (slot === 0) {
                    html += `<div class="time-label">${timeStr}</div>`;
                } else {
                    html += `<div class="time-label"></div>`;
                }
                
                // 7天的格子
                for (let d = 0; d < 7; d++) {
                    const date = new Date(this.currentWeekStart);
                    date.setDate(date.getDate() + d);
                    const dateStr = this.formatDate(date);
                    const slotKey = `${dateStr}_${timeStr}`;
                    const slotData = this.timeboxData[slotKey];
                    
                    let slotClass = 'time-slot';
                    let slotContent = '';
                    let slotStyle = '';
                    
                    if (slotData) {
                        // 檢查是否為主格子，非主格子不顯示內容（但保留背景色）
                        slotClass += ' occupied';
                        if (slotData.completed) {
                            slotClass += ' completed';
                        }
                        
                        // 檢查是否需要合併邊框
                        if (slotData.taskId) {
                            // 檢查上下（同一天的不同時間）
                            const prevTimeStr = this.getTimeString(hour, minutes - this.timeUnit);
                            const nextTimeStr = this.getTimeString(hour, minutes + this.timeUnit);
                            const prevSlot = prevTimeStr ? this.timeboxData[`${dateStr}_${prevTimeStr}`] : null;
                            const nextSlot = nextTimeStr ? this.timeboxData[`${dateStr}_${nextTimeStr}`] : null;
                            
                            // 檢查左右（不同天的同一時間）
                            if (d > 0) {
                                const leftDate = new Date(date);
                                leftDate.setDate(leftDate.getDate() - 1);
                                const leftSlot = this.timeboxData[`${this.formatDate(leftDate)}_${timeStr}`];
                                if (leftSlot && leftSlot.taskId === slotData.taskId) {
                                    slotClass += ' merge-left';
                                }
                            }
                            
                            if (d < 6) {
                                const rightDate = new Date(date);
                                rightDate.setDate(rightDate.getDate() + 1);
                                const rightSlot = this.timeboxData[`${this.formatDate(rightDate)}_${timeStr}`];
                                if (rightSlot && rightSlot.taskId === slotData.taskId) {
                                    slotClass += ' merge-right';
                                }
                            }
                            
                            // 添加合併類別
                            if (prevSlot && prevSlot.taskId === slotData.taskId) {
                                slotClass += ' merge-top';
                            }
                            if (nextSlot && nextSlot.taskId === slotData.taskId) {
                                slotClass += ' merge-bottom';
                            }
                        }
                        
                        const activity = this.activityTypes.find(a => a.id === slotData.activityId);
                        if (activity) {
                            slotStyle = `background-color: ${activity.color};`;
                            // 只在主格子顯示內容
                            if (slotData.isMainSlot) {
                                const displayText = slotData.content || activity.name;
                                const totalTime = (slotData.totalSlots || 1) * this.timeUnit;
                                const hours = Math.floor(totalTime / 60);
                                const mins = totalTime % 60;
                                const timeText = hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
                                slotContent = `
                                    <div class="time-slot-content">
                                        <div>${displayText}</div>
                                        <div style="font-size: 0.7em; opacity: 0.8;">${timeText}</div>
                                    </div>
                                `;
                            }
                        }
                    }
                    
                    html += `
                        <div class="${slotClass}" 
                             data-date="${dateStr}" 
                             data-time="${timeStr}"
                             data-key="${slotKey}"
                             style="${slotStyle}"
                             onmousedown="window.activeModule.onSlotMouseDown(event, '${slotKey}')"
                             onmouseenter="window.activeModule.onSlotMouseEnter(event, '${slotKey}')"
                             onmouseup="window.activeModule.onSlotMouseUp(event, '${slotKey}')"
                             ontouchstart="window.activeModule.onSlotTouchStart(event, '${slotKey}')"
                             ontouchend="window.activeModule.onSlotTouchEnd(event, '${slotKey}')">
                            ${slotContent}
                        </div>
                    `;
                }
            }
        }
        
        return html;
    }

    getPomodoroHTML() {
        const isRunning = this.timerState && this.timerState.isRunning;
        const remainingTime = this.timerState ? this.timerState.remainingTime : 25 * 60;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        
        return `
            <div class="pomodoro-content">
                <div class="timer-display">
                    <div class="timer-circle" style="--progress: ${this.getTimerProgress()}deg;">
                        <div class="timer-text">
                            ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}
                        </div>
                    </div>
                    <div class="timer-info">
                        <div class="timer-status">${isRunning ? '專注中...' : '準備開始'}</div>
                        <div class="timer-activity">${this.timerState?.activityName || '選擇活動'}</div>
                    </div>
                </div>
                
                <div class="timer-controls">
                    ${isRunning ? 
                        `<button class="timer-btn" onclick="window.activeModule.pauseTimer()">暫停</button>` :
                        `<button class="timer-btn primary" onclick="window.activeModule.startTimer()">開始</button>`
                    }
                    <button class="timer-btn" onclick="window.activeModule.resetTimer()">重置</button>
                    <button class="timer-btn" onclick="window.activeModule.setTimerDuration(25)">25分</button>
                    <button class="timer-btn" onclick="window.activeModule.setTimerDuration(5)">休息5分</button>
                </div>
            </div>
        `;
    }

    getTimerProgress() {
        if (!this.timerState) return 0;
        const total = this.timerState.totalTime || 25 * 60;
        const remaining = this.timerState.remainingTime || total;
        return ((total - remaining) / total) * 360;
    }

    getStatsHTML() {
        const weekStats = this.calculateWeekStats();
        
        return `
            <div class="stat-card">
                <div class="stat-title">本週規劃</div>
                <div class="stat-value">${weekStats.plannedHours}小時</div>
                <div class="stat-detail">${weekStats.plannedSlots}個時段</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-title">完成率</div>
                <div class="stat-value">${weekStats.completionRate}%</div>
                <div class="stat-detail">${weekStats.completedSlots}/${weekStats.plannedSlots} 完成</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-title">最多活動</div>
                <div class="stat-value">${weekStats.topActivity.name || '無'}</div>
                <div class="stat-detail">${weekStats.topActivity.hours || 0}小時</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-title">今日待辦</div>
                <div class="stat-value">${weekStats.todaySlots}個</div>
                <div class="stat-detail">時段待完成</div>
            </div>
        `;
    }

    calculateWeekStats() {
        const tasks = new Map();  // 以taskId為鍵的任務集合
        let todaySlots = 0;
        const activityHours = {};
        const today = this.formatDate(new Date());
        
        // 收集所有任務
        for (const key in this.timeboxData) {
            const slot = this.timeboxData[key];
            if (this.isInCurrentWeek(key)) {
                // 如果有taskId，且是主格子，才計算為一個任務
                if (slot.taskId && slot.isMainSlot) {
                    tasks.set(slot.taskId, {
                        completed: slot.completed,
                        activityId: slot.activityId,
                        totalSlots: slot.totalSlots || 1
                    });
                } else if (!slot.taskId) {
                    // 舊格式相容
                    const tempId = 'single_' + key;
                    tasks.set(tempId, {
                        completed: slot.completed,
                        activityId: slot.activityId,
                        totalSlots: 1
                    });
                }
                
                // 今日待辦
                if (key.startsWith(today) && !slot.completed) {
                    todaySlots++;
                }
            }
        }
        
        // 計算統計
        let plannedTasks = tasks.size;
        let completedTasks = 0;
        let totalHours = 0;
        
        tasks.forEach(task => {
            if (task.completed) {
                completedTasks++;
            }
            
            const hours = (task.totalSlots * this.timeUnit) / 60;
            totalHours += hours;
            
            // 統計活動時間
            if (task.activityId) {
                if (!activityHours[task.activityId]) {
                    activityHours[task.activityId] = 0;
                }
                activityHours[task.activityId] += hours;
            }
        });
        
        // 找出最多的活動
        let topActivity = { name: '', hours: 0 };
        for (const activityId in activityHours) {
            const activity = this.activityTypes.find(a => a.id === activityId);
            if (activity && activityHours[activityId] > topActivity.hours) {
                topActivity = {
                    name: activity.name,
                    hours: parseFloat(activityHours[activityId].toFixed(1))
                };
            }
        }
        
        return {
            plannedSlots: plannedTasks,  // 任務數
            completedSlots: completedTasks,  // 完成任務數
            plannedHours: parseFloat(totalHours.toFixed(1)),  // 總時數
            completionRate: plannedTasks > 0 ? Math.round(completedTasks / plannedTasks * 100) : 0,
            topActivity,
            todaySlots
        };
    }

    isInCurrentWeek(slotKey) {
        const [dateStr] = slotKey.split('_');
        const slotDate = new Date(dateStr);
        const weekEnd = new Date(this.currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        return slotDate >= this.currentWeekStart && slotDate < weekEnd;
    }

    formatDate(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    
    getTimeString(hour, minutes) {
        // 處理時間溢出
        while (minutes >= 60) {
            hour++;
            minutes -= 60;
        }
        while (minutes < 0) {
            hour--;
            minutes += 60;
        }
        if (hour < 6 || hour >= 23) return null;
        
        return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // 事件處理方法
    attachEventListeners() {
        // 鍵盤快捷鍵
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 防止文字選取
        const grid = document.querySelector('.timebox-grid');
        if (grid) {
            grid.addEventListener('selectstart', (e) => e.preventDefault());
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Delete' && this.selectedTimeSlots.size > 0) {
            this.deleteSelectedSlots();
        }
        if (e.key === 'Escape') {
            this.clearSelection();
        }
    }

    // 滑鼠拖曳選取
    onSlotMouseDown(e, slotKey) {
        e.preventDefault();
        this.isDragging = true;
        this.dragStartSlot = slotKey;
        this.clearSelection();
        this.selectedTimeSlots.add(slotKey);
        this.updateSlotSelection();
    }

    onSlotMouseEnter(e, slotKey) {
        if (this.isDragging) {
            this.selectedTimeSlots.add(slotKey);
            this.updateSlotSelection();
        }
    }

    onSlotMouseUp(e, slotKey) {
        if (this.isDragging) {
            this.isDragging = false;
            if (this.selectedTimeSlots.size > 0) {
                this.showSlotEditDialog();
            }
        }
    }

    // 手機觸控處理
    onSlotTouchStart(e, slotKey) {
        e.preventDefault();
        this.touchStartTime = Date.now();
        
        // 長按偵測
        this.longPressTimer = setTimeout(() => {
            const slot = this.timeboxData[slotKey];
            if (slot) {
                this.showSlotEditDialog([slotKey]);
            }
        }, 500);
        
        // 處理選取
        if (this.selectedTimeSlots.has(slotKey)) {
            this.selectedTimeSlots.delete(slotKey);
        } else {
            this.selectedTimeSlots.add(slotKey);
        }
        this.updateSlotSelection();
    }

    onSlotTouchEnd(e, slotKey) {
        clearTimeout(this.longPressTimer);
        
        const touchDuration = Date.now() - this.touchStartTime;
        if (touchDuration < 200 && this.selectedTimeSlots.size > 1) {
            // 短按且有多選，顯示編輯
            this.showSlotEditDialog();
        }
    }

    updateSlotSelection() {
        document.querySelectorAll('.time-slot').forEach(slot => {
            const key = slot.dataset.key;
            if (this.selectedTimeSlots.has(key)) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }
        });
    }

    clearSelection() {
        this.selectedTimeSlots.clear();
        this.updateSlotSelection();
    }

    // 顯示時段編輯對話框
    showSlotEditDialog(slots = null) {
        const slotsToEdit = slots || Array.from(this.selectedTimeSlots);
        if (slotsToEdit.length === 0) return;
        
        const existingData = this.timeboxData[slotsToEdit[0]];
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="activity-dialog">
                <div class="dialog-header">編輯時段</div>
                <div class="dialog-content">
                    <div class="form-group">
                        <label class="form-label">活動類型</label>
                        <select class="form-select" id="activitySelect">
                            ${this.activityTypes.map(a => `
                                <option value="${a.id}" ${existingData?.activityId === a.id ? 'selected' : ''}>
                                    ${a.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">內容描述（選填）</label>
                        <textarea class="form-textarea" id="contentInput" rows="3" 
                                  placeholder="例如：跑步 5公里">${existingData?.content || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="completedCheck" 
                                   ${existingData?.completed ? 'checked' : ''}>
                            標記為已完成
                        </label>
                    </div>
                </div>
                
                <div class="dialog-actions">
                    ${existingData ? 
                        `<button class="btn" onclick="window.activeModule.deleteSelectedSlots()" style="margin-right: auto;">刪除</button>` : 
                        ''
                    }
                    <button class="btn" onclick="window.activeModule.closeDialog()">取消</button>
                    <button class="btn btn-primary" onclick="window.activeModule.saveSlotEdit()">儲存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 點擊外圍關閉
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                this.closeDialog();
            }
        });
        
        // Enter 儲存
        document.getElementById('contentInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveSlotEdit();
            }
        });
    }

    async saveSlotEdit() {
        const activityId = document.getElementById('activitySelect').value;
        const content = document.getElementById('contentInput').value;
        const completed = document.getElementById('completedCheck').checked;
        
        // 將選取的格子合併成一個任務
        const slots = Array.from(this.selectedTimeSlots);
        if (slots.length === 0) return;
        
        // 建立一個主任務ID
        const taskId = 'task_' + Date.now();
        
        // 將所有選取的格子指向同一個任務
        for (const slotKey of slots) {
            this.timeboxData[slotKey] = {
                taskId,        // 同一個任務ID
                activityId,
                content,
                completed,
                isMainSlot: slotKey === slots[0],  // 第一個格子為主格子
                totalSlots: slots.length,          // 總格子數
                updatedAt: new Date().toISOString()
            };
        }
        
        await this.saveData();
        this.clearSelection();
        this.closeDialog();
        
        // 重新渲染
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
        
        this.showToast('儲存成功', 'success');
    }

    async deleteSelectedSlots() {
        // 收集所有選取格子的任務ID
        const taskIds = new Set();
        for (const slotKey of this.selectedTimeSlots) {
            if (this.timeboxData[slotKey] && this.timeboxData[slotKey].taskId) {
                taskIds.add(this.timeboxData[slotKey].taskId);
            }
        }
        
        // 刪除所有相關的格子（同一個任務ID）
        for (const slotKey in this.timeboxData) {
            if (taskIds.has(this.timeboxData[slotKey].taskId) || this.selectedTimeSlots.has(slotKey)) {
                delete this.timeboxData[slotKey];
            }
        }
        
        await this.saveData();
        this.clearSelection();
        this.closeDialog();
        
        // 重新渲染
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
        
        this.showToast('刪除成功', 'success');
    }

    // 活動類型管理
    showActivityManager() {
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="activity-dialog">
                <div class="dialog-header">管理活動類型</div>
                <div class="dialog-content">
                    <div class="activity-list">
                        ${this.activityTypes.map((a, i) => `
                            <div class="activity-item" style="display: flex; align-items: center; gap: 12px; padding: 8px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px;">
                                <div style="width: 24px; height: 24px; background: ${a.color}; border-radius: 4px;"></div>
                                <span style="flex: 1;">${a.name}</span>
                                <select onchange="window.activeModule.updateActivityCountType(${i}, this.value)">
                                    <option value="time" ${a.countType === 'time' ? 'selected' : ''}>計時</option>
                                    <option value="count" ${a.countType === 'count' ? 'selected' : ''}>計次</option>
                                </select>
                                <button onclick="window.activeModule.deleteActivity(${i})" style="padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer;">刪除</button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px;">
                        <div class="form-group">
                            <label class="form-label">新增活動類型</label>
                            <input type="text" class="form-input" id="newActivityName" placeholder="活動名稱">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">選擇顏色</label>
                            <div class="color-picker-group">
                                ${['#c9a961', '#7a8b74', '#6b8e9f', '#d4a574', '#b87d8b', '#8b9dc3', '#f4a460', '#dda0dd'].map(color => `
                                    <div class="color-option" style="background: ${color};" 
                                         onclick="window.activeModule.selectColor('${color}', this)"></div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dialog-actions">
                    <button class="btn" onclick="window.activeModule.closeDialog()">關閉</button>
                    <button class="btn btn-primary" onclick="window.activeModule.addActivity()">新增活動</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.selectedColor = '#c9a961';
        
        // 預設選擇第一個顏色
        dialog.querySelector('.color-option').classList.add('selected');
    }

    selectColor(color, element) {
        this.selectedColor = color;
        document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }

    async addActivity() {
        const name = document.getElementById('newActivityName').value.trim();
        if (!name) {
            this.showToast('請輸入活動名稱', 'error');
            return;
        }
        
        const newActivity = {
            id: Date.now().toString(),
            name,
            color: this.selectedColor || '#c9a961',
            countType: 'time'
        };
        
        this.activityTypes.push(newActivity);
        await this.saveData();
        
        this.closeDialog();
        this.showActivityManager(); // 重新開啟顯示更新
        this.showToast('新增成功', 'success');
    }

    async updateActivityCountType(index, countType) {
        this.activityTypes[index].countType = countType;
        await this.saveData();
    }

    async deleteActivity(index) {
        if (confirm('確定要刪除此活動類型嗎？')) {
            this.activityTypes.splice(index, 1);
            await this.saveData();
            this.closeDialog();
            this.showActivityManager(); // 重新開啟顯示更新
        }
    }

    // 週導航
    changeWeek(direction) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (direction * 7));
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
    }

    goToToday() {
        this.initCurrentWeek();
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
    }

    // 時間單位切換
    setTimeUnit(unit) {
        this.timeUnit = unit;
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
    }

    // 番茄鐘功能
    togglePomodoroPanel() {
        const panel = document.getElementById('pomodoroPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    async startTimer() {
        if (!this.timerState) {
            this.timerState = {
                totalTime: 25 * 60,
                remainingTime: 25 * 60,
                isRunning: false,
                startTime: null,
                activityName: '專注時間'
            };
        }
        
        this.timerState.isRunning = true;
        this.timerState.startTime = Date.now();
        
        await this.saveData();
        this.startTimerInterval();
        this.showToast('番茄鐘開始', 'success');
        
        // 更新顯示
        this.updatePomodoroDisplay();
    }

    startTimerInterval() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (this.timerState && this.timerState.isRunning) {
                this.timerState.remainingTime--;
                
                if (this.timerState.remainingTime <= 0) {
                    this.onTimerComplete();
                } else {
                    this.updatePomodoroDisplay();
                }
            }
        }, 1000);
    }

    updatePomodoroDisplay() {
        const panel = document.getElementById('pomodoroPanel');
        if (panel) {
            panel.innerHTML = this.getPomodoroHTML();
        }
    }

    async pauseTimer() {
        if (this.timerState) {
            this.timerState.isRunning = false;
            await this.saveData();
            clearInterval(this.timerInterval);
            this.updatePomodoroDisplay();
        }
    }

    async resetTimer() {
        this.timerState = {
            totalTime: 25 * 60,
            remainingTime: 25 * 60,
            isRunning: false,
            startTime: null,
            activityName: '專注時間'
        };
        
        clearInterval(this.timerInterval);
        await this.saveData();
        this.updatePomodoroDisplay();
    }

    onTimerComplete() {
        clearInterval(this.timerInterval);
        this.timerState.isRunning = false;
        
        // 發送通知
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('番茄鐘完成！', {
                body: '恭喜完成一個番茄鐘，休息一下吧！',
                icon: '/icon-192.png'
            });
        }
        
        // 播放提示音
        this.playNotificationSound();
        
        this.showToast('番茄鐘完成！', 'success');
        this.resetTimer();
    }

    playNotificationSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2Oy9diMFl2MS');
        audio.play().catch(e => console.log('無法播放音效'));
    }

    checkTimerState() {
        // 檢查是否有進行中的計時器
        if (this.timerState && this.timerState.isRunning) {
            this.startTimerInterval();
        }
        
        // 請求通知權限
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // 工具方法
    isInCurrentWeek(slotKey) {
        const [dateStr] = slotKey.split('_');
        const slotDate = new Date(dateStr);
        const weekEnd = new Date(this.currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        return slotDate >= this.currentWeekStart && slotDate < weekEnd;
    }

    formatDate(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    async saveData() {
        try {
            await this.syncManager.save(this.currentUser.uuid, 'timebox', {
                timeboxes: this.timeboxData,
                activityTypes: this.activityTypes,
                timerState: this.timerState,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('儲存失敗:', error);
            this.showToast('儲存失敗', 'error');
        }
    }

    closeDialog() {
        const dialog = document.querySelector('.dialog-overlay');
        if (dialog) {
            dialog.remove();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 清理方法（切換模組時呼叫）
    destroy() {
        // 清理計時器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // 清理長按計時器
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
        
        // 移除事件監聽
        document.removeEventListener('keydown', this.handleKeyPress);
        
        // 清理選取狀態
        this.clearSelection();
        
        // 關閉對話框
        this.closeDialog();
    }
}

// ES6 模組匯出
export { TimeboxModule };
