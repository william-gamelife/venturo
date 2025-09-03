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
    // SignageHost 招牌資料
    static signage = {
        title: '箱型時間',
        subtitle: '2025年1月6日-1月12日', // 動態更新
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        actions: [
            { id:'prevWeek', label:'←', kind:'secondary', onClick:'prevWeek' },
            { id:'today', label:'今天', kind:'secondary', onClick:'goToToday' },
            { id:'nextWeek', label:'→', kind:'secondary', onClick:'nextWeek' },
            { id:'activities', label:'📝 活動管理', kind:'secondary', onClick:'openActivityTypes' },
            { id:'timer', label:'🍅 番茄鐘', kind:'primary', onClick:'toggleTimer' }
        ]
    };

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
        this.dragTimer = null;
        this.isDragging = false;
        this.dragStartSlot = null;
    }

    async render(uuid) {
        this.currentUser = { uuid };
        
        // 動態載入管委會
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 初始化當前週
        this.initCurrentWeek();
        
        // 更新SignageHost subtitle
        this.updateSignageSubtitle();
        
        // 載入資料
        await this.loadData();
        
        // 渲染介面
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 綁定事件
        this.attachEventListeners();
        
        // 設定全域模組參考
        window.activeModule = this;
        
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
                // 檢查是否有重訓類型，沒有則新增
                let activityTypes = data.activityTypes || this.getDefaultActivityTypes();
                const hasWorkout = activityTypes.find(a => a.id === 'workout');
                if (!hasWorkout) {
                    activityTypes.push({ id: 'workout', name: '重訓', color: '#9a8c7a', countType: 'workout' });
                }
                this.activityTypes = activityTypes;
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
            { id: 'work', name: '工作', color: '#8b9690', countType: 'time' },
            { id: 'exercise', name: '運動', color: '#7a8471', countType: 'time' },
            { id: 'workout', name: '重訓', color: '#9a8c7a', countType: 'workout' },  // 特殊類型
            { id: 'study', name: '學習', color: '#6b7b8a', countType: 'time' },
            { id: 'rest', name: '休息', color: '#8a7a7a', countType: 'time' },
            { id: 'meal', name: '用餐', color: '#8b7e71', countType: 'time' },
            { id: 'social', name: '社交', color: '#7a8491', countType: 'time' },
            { id: 'entertainment', name: '娛樂', color: '#8a8a73', countType: 'time' },
            { id: 'commute', name: '通勤', color: '#8a9299', countType: 'time' },
            { id: 'meeting', name: '會議', color: '#967a7a', countType: 'time' }
        ];
    }

    getHTML() {
        return `
            <div class="timebox-container">

                <!-- 控制工具列 -->
                <div class="timebox-controls">
                    <div class="time-unit-selector">
                        <button class="unit-btn ${this.timeUnit === 15 ? 'active' : ''}" 
                                onclick="window.activeModule.setTimeUnit(15)">15分</button>
                        <button class="unit-btn ${this.timeUnit === 30 ? 'active' : ''}" 
                                onclick="window.activeModule.setTimeUnit(30)">30分</button>
                        <button class="unit-btn ${this.timeUnit === 60 ? 'active' : ''}" 
                                onclick="window.activeModule.setTimeUnit(60)">60分</button>
                    </div>
                    
                    <!-- 活動快速選擇區域 -->
                    <div class="activity-quick-selector">
                        <span class="quick-selector-label">常用活動：</span>
                        <div class="activity-tiles">
                            ${this.getFrequentActivities().map(activity => `
                                <div class="activity-tile" 
                                     data-activity-id="${activity.id}"
                                     style="background-color: ${activity.color};" 
                                     draggable="true"
                                     ondragstart="window.activeModule.startActivityDrag(event, '${activity.id}')"
                                     title="${activity.name}">
                                    ${activity.name.charAt(0)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 番茄鐘面板 -->
                <div id="pomodoroPanel" class="pomodoro-panel" style="display: none;">
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
                    gap: 16px;
                    padding: 0;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }

                /* 控制工具列 */
                .timebox-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--card);
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    margin-bottom: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .time-unit-selector {
                    display: flex;
                    background: var(--bg);
                    border-radius: 8px;
                    padding: 2px;
                    border: 1px solid var(--border);
                }
                
                .selection-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                
                .selection-buttons {
                    display: flex;
                    gap: 8px;
                }
                
                .edit-selection-btn {
                    padding: 4px 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .edit-selection-btn:hover {
                    background: var(--primary-dark);
                }
                
                .clear-selection-btn {
                    padding: 4px 12px;
                    background: var(--danger);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .clear-selection-btn:hover {
                    background: var(--danger-dark);
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

                /* 活動快速選擇區域 */
                .activity-quick-selector {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .quick-selector-label {
                    font-size: 0.85rem;
                    color: var(--text-light);
                    font-weight: 500;
                    white-space: nowrap;
                }

                .activity-tiles {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .activity-tile {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: move;
                    transition: all 0.2s ease;
                    border: 2px solid transparent;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    user-select: none;
                }

                .activity-tile:hover {
                    transform: scale(1.1);
                    border-color: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }

                .activity-tile.dragging {
                    opacity: 0.7;
                    transform: scale(0.9);
                }

                /* 時間調整控制點 */
                .resize-handle {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.3);
                    cursor: ns-resize;
                    opacity: 0;
                    transition: all 0.2s ease;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .resize-handle::before {
                    content: '';
                    width: 20px;
                    height: 3px;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 2px;
                }

                .resize-top {
                    top: -3px;
                    border-radius: 6px 6px 0 0;
                }

                .resize-bottom {
                    bottom: -3px;
                    border-radius: 0 0 6px 6px;
                }

                .time-slot.occupied:hover .resize-handle {
                    opacity: 1;
                    background: rgba(255, 255, 255, 0.4);
                }

                .resize-handle:hover {
                    opacity: 1 !important;
                    background: rgba(255, 255, 255, 0.6) !important;
                    height: 8px;
                }

                .resize-handle:hover::before {
                    background: white;
                    height: 4px;
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
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
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

                /* 時間格子 - 簡約版 */
                .time-slot {
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    user-select: none;
                    border: 1px solid var(--border);
                    border-radius: 3px;
                    overflow: hidden;
                }

                /* 真正合併的格子樣式 */
                .merged-slot {
                    border-radius: 6px;
                    border: 2px solid;
                }

                .time-slot:hover {
                    background: var(--primary-light);
                    border-color: var(--primary);
                }

                .time-slot.selected {
                    background: linear-gradient(135deg, #2196F3, #1976D2) !important;
                    color: white !important;
                    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.4), 
                               0 2px 8px rgba(33, 150, 243, 0.3),
                               inset 0 1px 3px rgba(255,255,255,0.3) !important;
                    transform: scale(1.02);
                    font-weight: bold;
                    z-index: 10;
                    animation: selectedPulse 0.3s ease;
                    border: 2px solid #1976D2 !important;
                }

                @keyframes selectedPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1.02); }
                }
                
                .time-slot.selecting {
                    background: linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(25, 118, 210, 0.3)) !important;
                    border: 2px dashed #2196F3 !important;
                    animation: selectingBlink 0.8s ease infinite;
                }

                @keyframes selectingBlink {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }

                .time-slot.occupied {
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.1);
                }
                
                /* 改善的合併邊框樣式 */
                .time-slot.merge-top {
                    border-top: none;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                }
                
                .time-slot.merge-bottom {
                    border-bottom: none;
                    border-bottom-left-radius: 0;
                    border-bottom-right-radius: 0;
                }
                
                .time-slot.merge-left {
                    border-left: none;
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                }
                
                .time-slot.merge-right {
                    border-right: none;
                    border-top-right-radius: 0;
                    border-bottom-right-radius: 0;
                }

                /* 連續任務的特殊樣式 */
                .time-slot.task-start {
                    border-radius: 6px 6px 0 0;
                }
                
                .time-slot.task-middle {
                    border-radius: 0;
                    border-top: none;
                    border-bottom: none;
                }
                
                .time-slot.task-end {
                    border-radius: 0 0 6px 6px;
                }

                .time-slot.completed {
                    background: var(--accent) !important;
                    opacity: 0.8;
                    border: 1px solid var(--accent);
                }
                
                .time-slot.completed::after {
                    content: '●';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    z-index: 2;
                }

                .time-slot-content {
                    padding: 4px;
                    font-size: 0.7rem;
                    color: white;
                    font-weight: 500;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s;
                }
                
                /* 美化的活動選擇 */
                .activity-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
                    gap: 10px;
                    margin: 16px 0;
                }
                
                .activity-option {
                    padding: 12px 6px;
                    border-radius: 10px;
                    text-align: center;
                    cursor: pointer;
                    color: white;
                    font-weight: 500;
                    font-size: 13px;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    position: relative;
                }
                
                .activity-option:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                }
                
                .activity-option.selected {
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.3);
                    transform: scale(1.05);
                }
                
                .activity-option.selected::after {
                    content: '●';
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }
                
                /* 重訓區域 */
                .workout-inputs {
                    background: var(--bg);
                    padding: 16px;
                    border-radius: 10px;
                    margin: 12px 0;
                }
                
                .workout-inputs h4 {
                    margin: 0 0 12px 0;
                    color: var(--text);
                    font-size: 14px;
                }
                
                .exercise-item {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 35px;
                    gap: 6px;
                    margin-bottom: 10px;
                    align-items: center;
                }
                
                .exercise-item input {
                    padding: 6px 8px;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    font-size: 13px;
                    background: white;
                }
                
                .exercise-item input:focus {
                    outline: none;
                    border-color: var(--primary);
                }
                
                .btn-add-exercise {
                    width: 100%;
                    padding: 8px;
                    background: transparent;
                    border: 2px dashed var(--primary);
                    border-radius: 8px;
                    color: var(--primary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-add-exercise:hover {
                    background: var(--primary-light);
                }
                
                .btn-remove {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: #ff6b6b;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .btn-danger {
                    background: #ff6b6b;
                    color: white;
                }
                
                .btn-danger:hover {
                    background: #ff5252;
                }
                
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                
                .checkbox-label input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
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

                /* Popover 快速選擇樣式 */
                .quick-activity-popover {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                @keyframes popoverFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .popover-header {
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .selected-time-info {
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                }

                .popover-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .popover-close:hover {
                    background: #f5f5f5;
                    color: #666;
                }

                .quick-activities {
                    padding: 8px 0;
                }

                .quick-activity-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 15px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .quick-activity-item:hover {
                    background: #f8f9fa;
                }

                .activity-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                }

                .activity-name {
                    font-size: 14px;
                    color: #333;
                }

                .popover-footer {
                    padding: 8px 15px 12px;
                    border-top: 1px solid #eee;
                }

                .more-options-btn {
                    width: 100%;
                    background: transparent;
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #666;
                    transition: all 0.2s ease;
                }

                .more-options-btn:hover {
                    background: #f8f9fa;
                    border-color: #ccc;
                    color: #333;
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

    // 收集連續任務區塊
    collectTaskBlocks() {
        const blocks = [];
        const slotsPerHour = 60 / this.timeUnit;
        
        for (let d = 0; d < 7; d++) {
            const date = new Date(this.currentWeekStart);
            date.setDate(date.getDate() + d);
            const dateStr = this.formatDate(date);
            
            let currentBlock = null;
            
            for (let hour = 6; hour < 23; hour++) {
                for (let slot = 0; slot < slotsPerHour; slot++) {
                    const minutes = slot * this.timeUnit;
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    const slotKey = `${dateStr}_${timeStr}`;
                    const slotData = this.timeboxData[slotKey];
                    
                    if (slotData && slotData.taskId) {
                        if (!currentBlock || currentBlock.taskId !== slotData.taskId) {
                            // 開始新區塊
                            if (currentBlock) blocks.push(currentBlock);
                            currentBlock = {
                                taskId: slotData.taskId,
                                activityId: slotData.activityId,
                                content: slotData.content,
                                day: d,
                                startRow: (hour - 6) * slotsPerHour + slot + 2, // +2 因為有標題行
                                endRow: (hour - 6) * slotsPerHour + slot + 2,
                                dateStr: dateStr,
                                completed: slotData.completed
                            };
                        } else {
                            // 延續當前區塊
                            currentBlock.endRow = (hour - 6) * slotsPerHour + slot + 2;
                        }
                    } else {
                        // 結束當前區塊
                        if (currentBlock) {
                            blocks.push(currentBlock);
                            currentBlock = null;
                        }
                    }
                }
            }
            
            if (currentBlock) blocks.push(currentBlock);
        }
        
        return blocks;
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
        
        // 使用新的合併渲染方法
        html += this.renderMergedTimeGrid();
        
        return html;
    }

    renderMergedTimeGrid() {
        const slotsPerHour = 60 / this.timeUnit;
        let html = '';
        
        // 先收集所有任務區塊
        const taskBlocks = this.collectTaskBlocks();
        const renderedSlots = new Set();
        
        for (let hour = 6; hour < 23; hour++) {
            for (let slot = 0; slot < slotsPerHour; slot++) {
                const minutes = slot * this.timeUnit;
                const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                const rowIndex = (hour - 6) * slotsPerHour + slot;
                
                // 時間標籤（只在整點顯示）
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
                    
                    // 檢查這個位置是否已經被合併的區塊占用
                    const blockKey = `${d}_${rowIndex + 2}`;
                    if (renderedSlots.has(blockKey)) {
                        continue; // 跳過已渲染的格子
                    }
                    
                    // 查找從這個位置開始的任務區塊
                    const taskBlock = taskBlocks.find(block => 
                        block.day === d && block.startRow === rowIndex + 2
                    );
                    
                    if (taskBlock) {
                        // 渲染合併的任務區塊
                        const rowSpan = taskBlock.endRow - taskBlock.startRow + 1;
                        const activity = this.activityTypes.find(a => a.id === taskBlock.activityId);
                        const totalTime = rowSpan * this.timeUnit;
                        const hours = Math.floor(totalTime / 60);
                        const mins = totalTime % 60;
                        const timeText = hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
                        
                        html += `
                            <div class="time-slot occupied merged-slot ${taskBlock.completed ? 'completed' : ''}" 
                                 data-date="${dateStr}" 
                                 data-time="${timeStr}"
                                 data-key="${slotKey}"
                                 data-task-id="${taskBlock.taskId}"
                                 style="grid-row: span ${rowSpan}; background: ${activity?.color}; border-color: ${activity?.color};"
                                 onmousedown="window.activeModule.onSlotMouseDown(event, '${slotKey}')"
                                 onmouseenter="window.activeModule.onSlotMouseEnter(event, '${slotKey}')"
                                 onmouseup="window.activeModule.onSlotMouseUp(event, '${slotKey}')"
                                 ontouchstart="window.activeModule.onSlotTouchStart(event, '${slotKey}')"
                                 ontouchend="window.activeModule.onSlotTouchEnd(event, '${slotKey}')">
                                
                                <!-- 上邊緣調整控制點 -->
                                <div class="resize-handle resize-top" 
                                     onmousedown="window.activeModule.startResize(event, '${taskBlock.taskId}', 'top')"
                                     title="拖曳調整開始時間">
                                </div>
                                
                                <div class="time-slot-content">
                                    <div>${taskBlock.content || activity?.name}</div>
                                    <div style="font-size: 0.7em; opacity: 0.8;">${timeText}</div>
                                </div>
                                
                                <!-- 下邊緣調整控制點 -->
                                <div class="resize-handle resize-bottom" 
                                     onmousedown="window.activeModule.startResize(event, '${taskBlock.taskId}', 'bottom')"
                                     title="拖曳調整結束時間">
                                </div>
                            </div>
                        `;
                        
                        // 標記所有被占用的位置
                        for (let r = taskBlock.startRow; r <= taskBlock.endRow; r++) {
                            renderedSlots.add(`${d}_${r}`);
                        }
                    } else {
                        // 渲染空格子
                        const slotData = this.timeboxData[slotKey];
                        let slotClass = 'time-slot';
                        let slotStyle = '';
                        
                        if (this.selectedTimeSlots.has(slotKey)) {
                            slotClass += ' selected';
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
                                 ontouchend="window.activeModule.onSlotTouchEnd(event, '${slotKey}')"
                                 ondragover="window.activeModule.onSlotDragOver(event, '${slotKey}')"
                                 ondragleave="window.activeModule.onSlotDragLeave(event, '${slotKey}')"
                                 ondrop="window.activeModule.onSlotDrop(event, '${slotKey}')">
                            </div>
                        `;
                        
                        renderedSlots.add(blockKey);
                    }
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
                <div class="stat-value">${weekStats.dailyCompletionRate}% / ${weekStats.weeklyCompletionRate}%</div>
                <div class="stat-detail">天 / 週</div>
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
        let todayCompletedTasks = 0;
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
                
                // 今日統計
                if (key.startsWith(today)) {
                    if (slot.completed) {
                        todayCompletedTasks++;
                    } else {
                        todaySlots++;
                    }
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
        
        // 計算今日和本週完成率
        const todayTotalTasks = todayCompletedTasks + todaySlots;
        const dailyCompletionRate = todayTotalTasks > 0 ? Math.round(todayCompletedTasks / todayTotalTasks * 100) : 0;
        const weeklyCompletionRate = plannedTasks > 0 ? Math.round(completedTasks / plannedTasks * 100) : 0;
        
        return {
            plannedSlots: plannedTasks,  // 任務數
            completedSlots: completedTasks,  // 完成任務數
            plannedHours: parseFloat(totalHours.toFixed(1)),  // 總時數
            dailyCompletionRate,
            weeklyCompletionRate,
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

    // 顏色處理函數
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    // 選擇活動類型
    selectActivity(activityId) {
        // 移除所有選中狀態
        document.querySelectorAll('.activity-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // 添加選中狀態
        const selected = document.querySelector(`.activity-option[data-id="${activityId}"]`);
        if (selected) {
            selected.classList.add('selected');
            
            // 檢查是否為重訓
            const isWorkout = selected.dataset.type === 'workout';
            document.getElementById('workoutSection').style.display = isWorkout ? 'block' : 'none';
            document.getElementById('normalSection').style.display = isWorkout ? 'none' : 'block';
        }
    }
    
    // 渲染重訓項目
    renderWorkoutExercises(exercises = [{}]) {
        if (!exercises || exercises.length === 0) exercises = [{}];
        
        return exercises.map((ex, index) => `
            <div class="exercise-item" data-index="${index}">
                <input type="text" class="exercise-equipment" placeholder="器材名稱" value="${ex.equipment || ''}">
                <input type="number" class="exercise-weight" placeholder="重量(kg)" value="${ex.weight || ''}" min="0" step="0.5">
                <input type="number" class="exercise-reps" placeholder="次數" value="${ex.reps || ''}" min="1">
                <input type="number" class="exercise-sets" placeholder="組數" value="${ex.sets || ''}" min="1">
                ${exercises.length > 1 ? `<button class="btn-remove" onclick="window.activeModule.removeExercise(${index})">×</button>` : ''}
            </div>
        `).join('');
    }
    
    // 新增重訓項目
    addExercise() {
        const container = document.getElementById('workoutExercises');
        const currentExercises = this.getWorkoutInputs();
        currentExercises.push({});
        container.innerHTML = this.renderWorkoutExercises(currentExercises);
    }
    
    // 移除重訓項目
    removeExercise(index) {
        const container = document.getElementById('workoutExercises');
        const currentExercises = this.getWorkoutInputs();
        currentExercises.splice(index, 1);
        container.innerHTML = this.renderWorkoutExercises(currentExercises);
    }
    
    // 取得重訓輸入值
    getWorkoutInputs() {
        const exercises = [];
        document.querySelectorAll('.exercise-item').forEach(item => {
            const equipment = item.querySelector('.exercise-equipment').value;
            const weight = parseFloat(item.querySelector('.exercise-weight').value) || 0;
            const reps = parseInt(item.querySelector('.exercise-reps').value) || 0;
            const sets = parseInt(item.querySelector('.exercise-sets').value) || 0;
            
            if (equipment || weight || reps || sets) {
                exercises.push({ equipment, weight, reps, sets });
            }
        });
        return exercises;
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
        const container = document.querySelector('.timebox-container');
        const grid = document.querySelector('.timebox-grid');
        
        if (container) {
            container.addEventListener('selectstart', (e) => e.preventDefault());
            container.addEventListener('dragstart', (e) => e.preventDefault());
        }
        
        if (grid) {
            grid.addEventListener('selectstart', (e) => e.preventDefault());
            grid.addEventListener('dragstart', (e) => e.preventDefault());
            
            // 全域鼠標事件（處理快速拖拽）
            document.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    // 快速拖拽時用座標計算來選取格子
                    this.handleFastDrag(e);
                }
            });
            
            document.addEventListener('mouseup', (e) => {
                if (this.isDragging) {
                    this.isDragging = false;
                    // 拖拽結束後立即彈出 Popover 快速選擇
                    if (this.selectedTimeSlots.size > 0) {
                        setTimeout(() => {
                            this.showQuickActivityPopover(e);
                        }, 100);
                    }
                }
                if (this.dragTimer) {
                    clearTimeout(this.dragTimer);
                    this.dragTimer = null;
                }
            });
        }
        
        // 全域防選取
        document.addEventListener('selectstart', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }

    handleKeyPress(e) {
        if (e.key === 'Delete' && this.selectedTimeSlots.size > 0) {
            this.deleteSelectedSlots();
        }
        if (e.key === 'Escape') {
            this.clearSelection();
        }
    }

    // 滑鼠事件處理
    onSlotMouseDown(e, slotKey) {
        // 右鍵點擊已佔用的格子來編輯
        if (e.button === 2 && this.timeboxData[slotKey]) {
            e.preventDefault();
            this.showSlotEditDialog([slotKey]);
            return;
        }

        // 左鍵開始拖拽選擇
        if (e.button === 0) {
            e.preventDefault();
            this.isDragging = true;
            this.dragStartSlot = slotKey;
            
            // 開始拖拽計時器
            this.dragTimer = setTimeout(() => {
                this.isDragging = true;
            }, 150);
            
            // 選擇當前格子
            if (this.selectedTimeSlots.has(slotKey)) {
                this.selectedTimeSlots.delete(slotKey);
            } else {
                this.selectedTimeSlots.add(slotKey);
            }
            this.updateSlotSelection();
        }
    }

    onSlotMouseEnter(e, slotKey) {
        // 拖拽過程中選擇經過的格子
        if (this.isDragging && e.buttons === 1) {
            this.selectedTimeSlots.add(slotKey);
            this.updateSlotSelection();
        }
    }

    onSlotMouseUp(e, slotKey) {
        // 拖拽結束
        if (this.dragTimer) {
            clearTimeout(this.dragTimer);
            this.dragTimer = null;
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
        
        // 如果有選中的時間格，顯示快速選擇 Popover
        if (this.selectedTimeSlots.size > 0) {
            // 使用觸摸位置
            const touch = e.changedTouches[0];
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            
            setTimeout(() => {
                this.showQuickActivityPopover(fakeEvent);
            }, 100);
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
        
        // 更新選擇信息
        const selectionInfo = document.getElementById('selectionInfo');
        if (selectionInfo) {
            const count = this.selectedTimeSlots.size;
            if (count > 0) {
                selectionInfo.style.display = 'flex';
                selectionInfo.querySelector('.selected-count').textContent = `已選擇 ${count} 個時段`;
            } else {
                selectionInfo.style.display = 'none';
            }
        }
    }

    clearSelection() {
        this.selectedTimeSlots.clear();
        this.updateSlotSelection();
    }

    editSelection() {
        if (this.selectedTimeSlots.size > 0) {
            this.showSlotEditDialog();
        }
    }

    handleFastDrag(e) {
        // 用座標計算快速拖拽時經過的格子
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element.classList.contains('time-slot') && element.dataset.key) {
            this.selectedTimeSlots.add(element.dataset.key);
            this.updateSlotSelection();
        }
    }

    // 快速活動選擇 Popover
    showQuickActivityPopover(event) {
        // 移除現有的 popover
        const existingPopover = document.querySelector('.quick-activity-popover');
        if (existingPopover) {
            existingPopover.remove();
        }

        if (this.selectedTimeSlots.size === 0) return;

        // 獲取最近使用的活動 (從歷史記錄)
        const recentActivities = this.getRecentActivities();
        
        // 獲取滑鼠位置
        const x = event.clientX || window.innerWidth / 2;
        const y = event.clientY || window.innerHeight / 2;

        // 創建 Popover
        const popover = document.createElement('div');
        popover.className = 'quick-activity-popover';
        popover.innerHTML = `
            <div class="popover-header">
                <span class="selected-time-info">${this.getSelectedTimeInfo()}</span>
                <button class="popover-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            
            <div class="quick-activities">
                ${recentActivities.map(activity => `
                    <div class="quick-activity-item" 
                         data-activity-id="${activity.id}"
                         style="border-left: 4px solid ${activity.color};"
                         onclick="window.activeModule.quickSelectActivity('${activity.id}')">
                        <div class="activity-icon" style="background-color: ${activity.color};">
                            ${activity.name.charAt(0)}
                        </div>
                        <span class="activity-name">${activity.name}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="popover-footer">
                <button class="more-options-btn" onclick="window.activeModule.showFullEditDialog()">
                    更多選項...
                </button>
            </div>
        `;

        // 設置位置
        popover.style.cssText = `
            position: fixed;
            left: ${Math.min(x, window.innerWidth - 250)}px;
            top: ${Math.min(y, window.innerHeight - 200)}px;
            z-index: 1000;
            background: white;
            border: 1px solid #ddd;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            min-width: 200px;
            max-width: 250px;
            animation: popoverFadeIn 0.2s ease;
        `;

        document.body.appendChild(popover);

        // 點擊外部關閉
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!popover.contains(e.target)) {
                    popover.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    }

    // 獲取最近使用的活動
    getRecentActivities() {
        // 從活動類型中選擇最常用的 4-5 個
        const allActivities = this.activityTypes.slice();
        
        // 如果沒有活動類型，返回預設的
        if (allActivities.length === 0) {
            return [
                { id: 'work', name: '工作', color: '#2196F3' },
                { id: 'study', name: '學習', color: '#4CAF50' },
                { id: 'break', name: '休息', color: '#FF9800' },
                { id: 'meeting', name: '會議', color: '#9C27B0' }
            ];
        }

        // 優先顯示最近使用的，最多5個
        return allActivities.slice(0, 5);
    }

    // 獲取選中時間資訊
    getSelectedTimeInfo() {
        const slots = Array.from(this.selectedTimeSlots);
        if (slots.length === 0) return '';

        // 計算時間範圍
        const times = slots.map(slot => {
            // slotKey 格式是 "dateStr_timeStr"，例如 "2024-01-01_09:30"
            const [dateStr, timeStr] = slot.split('_');
            const [hour, minute] = timeStr.split(':');
            return parseInt(hour) * 60 + parseInt(minute);
        }).sort((a, b) => a - b);

        const startTime = times[0];
        const endTime = times[times.length - 1] + this.timeUnit;
        
        const formatTime = (minutes) => {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${h}:${m.toString().padStart(2, '0')}`;
        };

        const duration = endTime - startTime;
        return `${formatTime(startTime)} - ${formatTime(endTime)} (${duration}分鐘)`;
    }

    // 快速選擇活動
    quickSelectActivity(activityId) {
        const activity = this.activityTypes.find(a => a.id === activityId);
        if (!activity) return;

        // 應用到選中的時間格
        const taskId = this.generateUUID();
        const slots = Array.from(this.selectedTimeSlots);

        slots.forEach(slotKey => {
            this.timeboxData[slotKey] = {
                taskId: taskId,
                title: activity.name,
                activity: activity.id,
                color: activity.color,
                createdAt: new Date().toISOString()
            };
        });

        // 儲存並重新渲染
        this.saveData();
        this.clearSelection();
        this.refreshView();

        // 移除 popover
        document.querySelector('.quick-activity-popover')?.remove();

        this.showToast(`已設定 ${activity.name}`, 'success');
    }

    // 顯示完整編輯對話框
    showFullEditDialog() {
        document.querySelector('.quick-activity-popover')?.remove();
        this.showSlotEditDialog();
    }

    // 重新渲染視圖
    refreshView() {
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
    }

    // 生成UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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
    <!-- 活動類型選擇（美化版） -->
    <div class="form-group">
    <label class="form-label">選擇活動類型</label>
    <div class="activity-grid">
    ${this.activityTypes.map(a => `
    <div class="activity-option ${existingData?.activityId === a.id ? 'selected' : ''}" 
         data-id="${a.id}"
             data-type="${a.countType}"
                 style="background: linear-gradient(135deg, ${a.color} 0%, ${this.lightenColor(a.color, 20)} 100%);"
                     onclick="window.activeModule.selectActivity('${a.id}')">
                    <span>${a.name}</span>
                </div>
        `).join('')}
    </div>
    </div>
    
    <!-- 重訓特殊輸入區（預設隱藏） -->
    <div id="workoutSection" style="display: ${existingData?.activityId === 'workout' ? 'block' : 'none'};">
    <div class="workout-inputs">
    <h4>重訓記錄</h4>
    <div id="workoutExercises">
        ${existingData?.workoutData ? this.renderWorkoutExercises(existingData.workoutData) : this.renderWorkoutExercises([{}])}
        </div>
            <button class="btn-add-exercise" onclick="window.activeModule.addExercise()">
                    + 新增器材
                </button>
            </div>
    </div>
    
    <!-- 一般內容輸入 -->
    <div id="normalSection" style="display: ${existingData?.activityId === 'workout' ? 'none' : 'block'};">
        <div class="form-group">
            <label class="form-label">內容描述（選填）</label>
            <textarea class="form-textarea" id="contentInput" rows="3" 
                      placeholder="例如：跑步 5公里">${existingData?.content || ''}</textarea>
        </div>
    </div>
                
                <div class="form-group">
                    <label class="form-label checkbox-label">
                        <input type="checkbox" id="completedCheck"
                            ${existingData?.completed ? 'checked' : ''}>
                <span>標記為已完成</span>
                </label>
                </div>
            </div>
            
            <div class="dialog-actions">
            ${existingData ? 
            `<button class="btn btn-danger" onclick="window.activeModule.deleteSelectedSlots()">刪除</button>` : 
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
        const contentInput = document.getElementById('contentInput');
        if (contentInput) {
            contentInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.saveSlotEdit();
                }
            });
        }
    }

    async saveSlotEdit() {
        // 取得選中的活動ID
        const selectedOption = document.querySelector('.activity-option.selected');
        if (!selectedOption) {
            this.showToast('請選擇活動類型', 'error');
            return;
        }
        
        const activityId = selectedOption.dataset.id;
        const isWorkout = selectedOption.dataset.type === 'workout';
        const completed = document.getElementById('completedCheck').checked;
        
        // 建立資料物件
        let content = '';
        let workoutData = null;
        
        if (isWorkout) {
            // 重訓資料
            workoutData = this.getWorkoutInputs();
            if (workoutData.length === 0) {
                this.showToast('請至少輸入一組重訓資料', 'error');
                return;
            }
            // 產生摘要
            const totalWeight = workoutData.reduce((sum, ex) => sum + (ex.weight * ex.reps * ex.sets), 0);
            content = `總重量: ${totalWeight}kg`;
        } else {
            // 一般內容
            content = document.getElementById('contentInput').value;
        }
        
        // 將選取的格子合併成一個任務
        const slots = Array.from(this.selectedTimeSlots);
        if (slots.length === 0) return;
        
        // 檢查是否為編輯現有任務
        const firstSlot = slots[0];
        const existingData = this.timeboxData[firstSlot];
        let taskId;
        
        if (existingData && existingData.taskId) {
            // 編輯現有任務，使用原有的 taskId
            taskId = existingData.taskId;
        } else {
            // 新建任務，建立新的 taskId
            taskId = 'task_' + Date.now();
        }
        
        // 將所有選取的格子指向同一個任務
        for (const slotKey of slots) {
            this.timeboxData[slotKey] = {
                taskId,        // 同一個任務ID
                activityId,
                content,
                workoutData,   // 重訓資料
                completed,
                isMainSlot: slotKey === slots[0],  // 第一個格子為主格子
                totalSlots: slots.length,          // 總格子數
                updatedAt: new Date().toISOString()
            };
        }
        
        // 更新同一個taskId的所有slot的完成狀態
        for (const key in this.timeboxData) {
            if (this.timeboxData[key].taskId === taskId) {
                this.timeboxData[key].completed = completed;
            }
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
                <div class="dialog-header">
                    <h3>活動類型管理</h3>
                    <p class="dialog-subtitle">自定義您的活動類型與計算方式</p>
                </div>
                <div class="dialog-content">
                    <div class="activity-list">
                        ${this.activityTypes.map((a, i) => `
                            <div class="activity-item">
                                <div class="activity-icon" style="background: linear-gradient(135deg, ${a.color} 0%, ${this.lightenColor(a.color, 20)} 100%);"></div>
                                <div class="activity-info">
                                    <div class="activity-name">${a.name}</div>
                                    <div class="activity-meta">
                                        <select class="activity-select" onchange="window.activeModule.updateActivityCountType(${i}, this.value)">
                                            <option value="time" ${a.countType === 'time' ? 'selected' : ''}>○ 計時型</option>
                                            <option value="count" ${a.countType === 'count' ? 'selected' : ''}>□ 計次型</option>
                                            <option value="workout" ${a.countType === 'workout' ? 'selected' : ''}>● 重訓型</option>
                                        </select>
                                    </div>
                                </div>
                                <button class="activity-delete-btn" onclick="window.activeModule.deleteActivity(${i})" title="刪除活動類型">
                                    ×
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="add-activity-section">
                        <h4>新增活動類型</h4>
                        <div class="form-group">
                            <label class="form-label">活動名稱</label>
                            <input type="text" class="form-input" id="newActivityName" placeholder="例如：重訓、跑步、讀書...">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">類型</label>
                            <select class="form-select" name="countType" id="countTypeSelect">
                                <option value="time" selected>○ 計時型</option>
                                <option value="count">□ 計次型</option>
                                <option value="workout">● 重訓型</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">選擇顏色</label>
                            <div class="color-picker-grid">
                                ${['#8b9690', '#7a8471', '#9a8c7a', '#6b7b8a', '#8a7a7a', '#8b7e71', '#7a8491', '#8a8a73', '#8a9299', '#967a7a', '#9b8b7a', '#7b8a89'].map(color => `
                                    <div class="color-option" style="background: ${color};" 
                                         onclick="window.activeModule.selectColor('${color}', this)" title="${color}"></div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dialog-actions">
                    <button class="btn btn-secondary" onclick="window.activeModule.closeDialog()">取消</button>
                    <button class="btn btn-primary" onclick="window.activeModule.addActivity()">
                        <span>➕</span> 新增活動
                    </button>
                </div>
            </div>
            
            <style>
                .activity-dialog {
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                
                .dialog-header h3 {
                    margin: 0 0 8px 0;
                    color: var(--text);
                }
                
                .dialog-subtitle {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .activity-list {
                    max-height: 300px;
                    overflow-y: auto;
                    margin-bottom: 24px;
                }
                
                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    margin-bottom: 12px;
                    transition: all 0.2s ease;
                }
                
                .activity-item:hover {
                    border-color: var(--primary);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .activity-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                }
                
                .activity-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                
                .activity-name {
                    font-weight: 600;
                    color: var(--text);
                    font-size: 1rem;
                }
                
                .activity-select {
                    padding: 6px 12px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 0.85rem;
                    background: white;
                }
                
                .activity-delete-btn {
                    padding: 8px 12px;
                    border: 1px solid #ffebee;
                    border-radius: 8px;
                    background: #ffebee;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 1rem;
                }
                
                .activity-delete-btn:hover {
                    background: #ffcdd2;
                    border-color: #ffcdd2;
                }
                
                .add-activity-section {
                    border-top: 2px solid var(--border);
                    padding-top: 24px;
                }
                
                .add-activity-section h4 {
                    margin: 0 0 20px 0;
                    color: var(--text);
                    font-size: 1.1rem;
                }
                
                
                .color-picker-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 8px;
                }
                
                .color-option {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                
                .color-option:hover {
                    transform: scale(1.1);
                    border-color: white;
                }
                
                .color-option.selected {
                    transform: scale(1.15);
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px var(--primary);
                }
                
                .btn {
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }
                
                .btn-secondary {
                    background: white;
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                }
                
                .btn-secondary:hover {
                    background: var(--bg);
                }
                
                .btn-primary {
                    background: var(--primary);
                    border: 1px solid var(--primary);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }
            </style>
        `;
        
        document.body.appendChild(dialog);
        this.selectedColor = '#8b9690';
        
        // 預設選擇第一個顏色
        const firstColorOption = dialog.querySelector('.color-option');
        if (firstColorOption) {
            firstColorOption.classList.add('selected');
        }
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
        
        // 取得選中的計算方式
        const countTypeSelect = document.getElementById('countTypeSelect');
        const countType = countTypeSelect ? countTypeSelect.value : 'time';
        
        const newActivity = {
            id: Date.now().toString(),
            name,
            color: this.selectedColor || '#FF6B6B',
            countType
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
    // 更新SignageHost的subtitle
    updateSignageSubtitle() {
        TimeboxModule.signage.subtitle = this.getWeekTitle();
        // 觸發SignageHost重新渲染
        const signageSubtitle = document.querySelector('.signage-subtitle');
        if (signageSubtitle) {
            signageSubtitle.textContent = this.getWeekTitle();
        }
    }

    changeWeek(direction) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (direction * 7));
        this.updateSignageSubtitle();
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
    }

    goToToday() {
        this.initCurrentWeek();
        this.updateSignageSubtitle();
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
        
        // 清理拖曳計時器
        if (this.dragTimer) {
            clearTimeout(this.dragTimer);
        }
        
        // 移除事件監聽
        document.removeEventListener('keydown', this.handleKeyPress);
        
        // 清理選取狀態
        this.clearSelection();
        
        // 關閉對話框
        this.closeDialog();
    }

    // SignageHost 按鈕方法：設定15分鐘時段
    setSlot15() {
        this.slotMinutes = 15;
        console.log('時段設定為15分鐘');
        // 重新渲染時間網格
        this.renderTimeGrid();
    }

    // SignageHost 按鈕方法：設定30分鐘時段
    setSlot30() {
        this.slotMinutes = 30;
        console.log('時段設定為30分鐘');
        // 重新渲染時間網格
        this.renderTimeGrid();
    }

    // SignageHost 按鈕方法：設定60分鐘時段
    setSlot60() {
        this.slotMinutes = 60;
        console.log('時段設定為60分鐘');
        // 重新渲染時間網格
        this.renderTimeGrid();
    }

    // SignageHost 按鈕方法：切換番茄鐘
    togglePomodoro() {
        if (this.pomodoroTimer && this.pomodoroTimer.isActive) {
            this.stopPomodoro();
        } else {
            this.startPomodoro();
        }
    }

    // SignageHost 按鈕方法：上一週
    prevWeek() {
        this.changeWeek(-1);
    }
    
    // SignageHost 按鈕方法：下一週
    nextWeek() {
        this.changeWeek(1);
    }

    // SignageHost 按鈕方法：切換番茄鐘
    toggleTimer() {
        const panel = document.getElementById('pomodoroPanel');
        if (panel) {
            if (panel.style.display === 'none') {
                // 顯示番茄鐘面板
                panel.style.display = 'block';
                this.updatePomodoroDisplay();
            } else {
                // 隱藏面板
                panel.style.display = 'none';
            }
        }
    }

    // SignageHost 按鈕方法：打開活動類型面板
    openActivityTypes() {
        this.showActivityManager();
    }

    // 獲取常用活動類型（最多8個）
    getFrequentActivities() {
        // 取得所有活動類型
        const allActivities = this.activityTypes || this.getDefaultActivityTypes();
        
        // 計算每個活動的使用次數
        const activityUsage = {};
        Object.values(this.timeboxData || {}).forEach(dayData => {
            Object.keys(dayData).forEach(timeKey => {
                const slot = dayData[timeKey];
                if (slot && slot.activityId) {
                    activityUsage[slot.activityId] = (activityUsage[slot.activityId] || 0) + 1;
                }
            });
        });
        
        // 依使用次數排序，沒有使用記錄的放後面
        const sortedActivities = allActivities
            .map(activity => ({
                ...activity,
                usage: activityUsage[activity.id] || 0
            }))
            .sort((a, b) => {
                if (a.usage === 0 && b.usage === 0) {
                    // 都沒用過的話，按預設順序（工作、學習、運動等優先）
                    const priority = ['work', 'study', 'exercise', 'rest'];
                    const aIndex = priority.indexOf(a.id);
                    const bIndex = priority.indexOf(b.id);
                    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    return a.name.localeCompare(b.name);
                }
                return b.usage - a.usage;
            });
        
        // 回傳前8個
        return sortedActivities.slice(0, 8);
    }

    // 開始拖曳活動
    startActivityDrag(event, activityId) {
        event.dataTransfer.setData('text/plain', `activity:${activityId}`);
        event.dataTransfer.effectAllowed = 'copy';
        
        // 加上拖曳視覺效果
        const tile = event.target;
        tile.classList.add('dragging');
        
        // 拖曳結束後移除效果
        setTimeout(() => {
            tile.classList.remove('dragging');
        }, 200);
        
        console.log(`開始拖曳活動: ${activityId}`);
    }

    // 時間格子拖放事件處理
    onSlotDragOver(event, slotKey) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        
        // 加上視覺提示
        const slot = event.target;
        if (slot && !slot.classList.contains('occupied')) {
            slot.style.backgroundColor = 'rgba(139, 115, 85, 0.1)';
            slot.style.borderColor = 'var(--primary)';
        }
    }

    async onSlotDrop(event, slotKey) {
        event.preventDefault();
        
        // 移除視覺提示
        const slot = event.target;
        if (slot) {
            slot.style.backgroundColor = '';
            slot.style.borderColor = '';
        }
        
        // 檢查是否是活動拖曳
        const dragData = event.dataTransfer.getData('text/plain');
        if (dragData.startsWith('activity:')) {
            const activityId = dragData.replace('activity:', '');
            const activity = this.activityTypes.find(a => a.id === activityId);
            
            if (activity) {
                // 直接建立預設30分鐘的活動，之後可以調整
                await this.createActivityWithDuration(activityId, slotKey, 30);
            }
        }
    }

    // 離開拖放區域時移除視覺提示
    onSlotDragLeave(event, slotKey) {
        const slot = event.target;
        if (slot) {
            slot.style.backgroundColor = '';
            slot.style.borderColor = '';
        }
    }

    // 生成唯一任務ID
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 顯示時間長度選擇對話框
    showDurationDialog(activityId, slotKey) {
        const activity = this.activityTypes.find(a => a.id === activityId);
        if (!activity) return;

        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="duration-dialog">
                <div class="dialog-header">
                    <h3>設定「${activity.name}」的時間長度</h3>
                    <button class="dialog-close" onclick="window.activeModule.closeDialog()">×</button>
                </div>
                
                <div class="duration-options">
                    <div class="quick-durations">
                        <button class="duration-btn" onclick="window.activeModule.confirmDuration(15, '${activityId}', '${slotKey}')">15分鐘</button>
                        <button class="duration-btn" onclick="window.activeModule.confirmDuration(30, '${activityId}', '${slotKey}')">30分鐘</button>
                        <button class="duration-btn" onclick="window.activeModule.confirmDuration(60, '${activityId}', '${slotKey}')">1小時</button>
                        <button class="duration-btn" onclick="window.activeModule.confirmDuration(120, '${activityId}', '${slotKey}')">2小時</button>
                    </div>
                    
                    <div class="custom-duration">
                        <label>自訂時間（分鐘）：</label>
                        <input type="number" id="customDuration" min="15" max="480" step="15" value="30">
                        <button class="btn btn-primary" onclick="window.activeModule.confirmCustomDuration('${activityId}', '${slotKey}')">確定</button>
                    </div>
                </div>
            </div>
            
            <style>
                .duration-dialog {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 400px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                }
                
                .dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border);
                }
                
                .quick-durations {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .duration-btn {
                    padding: 12px 16px;
                    background: var(--bg);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .duration-btn:hover {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                
                .custom-duration {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border);
                }
                
                .custom-duration input {
                    width: 80px;
                    padding: 8px;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                }
            </style>
        `;
        
        document.body.appendChild(dialog);
    }

    // 確認時間長度並建立活動
    async confirmDuration(minutes, activityId, slotKey) {
        await this.createActivityWithDuration(activityId, slotKey, minutes);
        this.closeDialog();
    }

    // 確認自訂時間長度
    async confirmCustomDuration(activityId, slotKey) {
        const minutes = parseInt(document.getElementById('customDuration').value);
        if (minutes < 15 || minutes > 480) {
            this.showToast('時間長度必須在15分鐘到8小時之間', 'error');
            return;
        }
        await this.createActivityWithDuration(activityId, slotKey, minutes);
        this.closeDialog();
    }

    // 根據指定的時間長度建立活動
    async createActivityWithDuration(activityId, startSlotKey, durationMinutes) {
        const activity = this.activityTypes.find(a => a.id === activityId);
        if (!activity) return;

        // 解析起始時間格子
        const [dateStr, timeStr] = startSlotKey.split('_');
        const [hour, minute] = timeStr.split(':').map(Number);
        
        // 計算需要多少個時間格子
        const slotsNeeded = Math.ceil(durationMinutes / this.timeUnit);
        
        // 生成唯一任務ID
        const taskId = this.generateTaskId();
        
        // 建立連續的時間格子
        const createdSlots = [];
        for (let i = 0; i < slotsNeeded; i++) {
            // 計算當前格子的時間
            const currentMinutes = minute + (i * this.timeUnit);
            const currentHour = hour + Math.floor(currentMinutes / 60);
            const finalMinute = currentMinutes % 60;
            
            // 檢查是否超出一天範圍
            if (currentHour >= 23) break;
            
            // 生成當前格子的key
            const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;
            const currentSlotKey = `${dateStr}_${currentTimeStr}`;
            
            // 檢查格子是否已被佔用
            if (this.timeboxData[currentSlotKey]) {
                this.showToast(`時間格子 ${currentTimeStr} 已被佔用`, 'error');
                return;
            }
            
            // 建立活動資料
            this.timeboxData[currentSlotKey] = {
                taskId: taskId,
                activityId: activityId,
                content: activity.name,
                completed: false,
                createdAt: new Date().toISOString(),
                isMainSlot: i === 0 // 標記主要格子
            };
            
            createdSlots.push(currentSlotKey);
        }
        
        await this.saveData();
        await this.render(this.currentUser);
        
        const endTime = createdSlots.length > 1 ? 
            createdSlots[createdSlots.length - 1].split('_')[1] : timeStr;
        
        this.showToast(`已建立「${activity.name}」活動：${timeStr} - ${endTime} (${durationMinutes}分鐘)`, 'success');
    }

    // 開始調整時間長度
    startResize(event, taskId, direction) {
        event.preventDefault();
        event.stopPropagation();
        
        // 記錄調整狀態
        this.resizing = {
            taskId: taskId,
            direction: direction,
            startY: event.clientY,
            originalSlots: this.getTaskSlots(taskId)
        };
        
        // 添加全域事件監聽
        document.addEventListener('mousemove', this.handleResize.bind(this));
        document.addEventListener('mouseup', this.endResize.bind(this));
        
        // 添加視覺回饋
        document.body.style.cursor = 'ns-resize';
        document.body.classList.add('resizing');
        
        console.log(`開始調整任務 ${taskId} 的 ${direction} 邊緣`);
    }

    // 處理調整過程
    handleResize(event) {
        if (!this.resizing) return;
        
        const deltaY = event.clientY - this.resizing.startY;
        const slotsToMove = Math.round(deltaY / 30); // 假設每個格子高度約30px
        
        if (slotsToMove === 0) return;
        
        // 根據方向和移動量計算新的時間範圍
        this.previewResize(this.resizing.taskId, this.resizing.direction, slotsToMove);
    }

    // 結束調整
    async endResize(event) {
        if (!this.resizing) return;
        
        // 移除事件監聽
        document.removeEventListener('mousemove', this.handleResize.bind(this));
        document.removeEventListener('mouseup', this.endResize.bind(this));
        
        // 移除視覺回饋
        document.body.style.cursor = '';
        document.body.classList.remove('resizing');
        
        // 應用最終調整
        const deltaY = event.clientY - this.resizing.startY;
        const slotsToMove = Math.round(deltaY / 30);
        
        if (slotsToMove !== 0) {
            await this.applyResize(this.resizing.taskId, this.resizing.direction, slotsToMove);
        }
        
        this.resizing = null;
    }

    // 獲取任務佔用的所有時間格子
    getTaskSlots(taskId) {
        const slots = [];
        for (const [key, data] of Object.entries(this.timeboxData)) {
            if (data.taskId === taskId) {
                slots.push(key);
            }
        }
        return slots.sort(); // 按時間順序排序
    }

    // 預覽調整效果
    previewResize(taskId, direction, slotsToMove) {
        // 這裡可以加上即時預覽的視覺效果
        // 暫時先在控制台顯示
        console.log(`預覽調整: ${taskId}, ${direction}, ${slotsToMove} 格子`);
    }

    // 應用調整
    async applyResize(taskId, direction, slotsToMove) {
        const currentSlots = this.getTaskSlots(taskId);
        if (currentSlots.length === 0) return;
        
        // 解析時間資訊
        const firstSlot = currentSlots[0];
        const lastSlot = currentSlots[currentSlots.length - 1];
        const [dateStr] = firstSlot.split('_');
        
        // 計算新的時間範圍
        let newSlots = [];
        
        if (direction === 'top') {
            // 調整開始時間
            const [, startTimeStr] = firstSlot.split('_');
            const [hour, minute] = startTimeStr.split(':').map(Number);
            
            // 計算新的開始時間
            const newStartMinute = minute - (slotsToMove * this.timeUnit);
            const newStartHour = hour + Math.floor(newStartMinute / 60);
            const finalStartMinute = ((newStartMinute % 60) + 60) % 60;
            
            // 檢查時間範圍是否合理
            if (newStartHour < 6 || newStartHour >= 23) {
                this.showToast('無法調整到該時間範圍', 'error');
                return;
            }
            
            // 重新建立時間格子
            const [, endTimeStr] = lastSlot.split('_');
            const newStartTime = `${newStartHour.toString().padStart(2, '0')}:${finalStartMinute.toString().padStart(2, '0')}`;
            const newStartKey = `${dateStr}_${newStartTime}`;
            
            // 計算新的時長
            const startTotalMinutes = newStartHour * 60 + finalStartMinute;
            const [endHour, endMinute] = endTimeStr.split(':').map(Number);
            const endTotalMinutes = endHour * 60 + endMinute + this.timeUnit;
            const durationMinutes = endTotalMinutes - startTotalMinutes;
            
            // 清除舊的格子
            currentSlots.forEach(key => delete this.timeboxData[key]);
            
            // 建立新的活動
            const activityId = this.timeboxData[firstSlot]?.activityId;
            if (activityId) {
                await this.createActivityWithDuration(activityId, newStartKey, durationMinutes);
            }
            
        } else if (direction === 'bottom') {
            // 調整結束時間
            const currentDuration = currentSlots.length * this.timeUnit;
            const newDuration = currentDuration + (slotsToMove * this.timeUnit);
            
            if (newDuration < 15) {
                this.showToast('活動時長不能少於15分鐘', 'error');
                return;
            }
            
            // 清除舊的格子
            currentSlots.forEach(key => delete this.timeboxData[key]);
            
            // 建立新的活動
            const activityId = this.timeboxData[firstSlot]?.activityId;
            if (activityId) {
                await this.createActivityWithDuration(activityId, firstSlot, newDuration);
            }
        }
        
        await this.saveData();
        await this.render(this.currentUser);
        
        this.showToast('活動時間已調整', 'success');
    }
}

// ES6 模組匯出
export { TimeboxModule };
