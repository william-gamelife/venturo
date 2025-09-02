/**
 * 箱型時間管理模組 - 遊戲人生 3.0 修正版
 * 
 * 修正：
 * 1. 時間線改為橫向（顯示當前時間）
 * 2. 選取邏輯修正（只選取拖曳範圍）
 * 3. 格子不透明（清楚顯示）
 * 4. 互動問題修正
 */

class TimeboxModule {
    static moduleInfo = {
        name: '箱型時間',
        subtitle: '視覺化時間規劃與訓練記錄',
        icon: `<svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/>
                <path d="M3 9h18M9 3v18" stroke="currentColor" stroke-width="1" opacity="0.3"/>
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/>
                <path d="M12 9v3l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
               </svg>`,
        version: '3.2.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.timeboxData = {};
        this.workoutData = {};
        this.currentWeekStart = null;
        this.selectedSlots = [];
        this.isSelecting = false;
        this.selectionStart = null;
        this.activityTypes = [];
        this.currentTimeInterval = null;
        this.selectedActivity = null;
    }

    async render(uuid) {
        this.currentUser = { uuid };
        
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        this.initCurrentWeek();
        await this.loadData();
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        this.attachEventListeners();
        this.startCurrentTimeLine();
    }

    initCurrentWeek() {
        const today = new Date();
        const day = today.getDay();
        // 調整為週一開始
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        this.currentWeekStart = new Date(today.setDate(diff));
        this.currentWeekStart.setHours(0, 0, 0, 0);
    }

    async loadData() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'timebox');
            if (data) {
                this.timeboxData = data.timeboxes || {};
                this.workoutData = data.workouts || {};
                this.activityTypes = data.activityTypes || this.getDefaultActivityTypes();
            } else {
                this.initDefaultData();
            }
        } catch (error) {
            console.error('載入失敗:', error);
            this.initDefaultData();
        }
    }

    initDefaultData() {
        this.timeboxData = {};
        this.workoutData = {};
        this.activityTypes = this.getDefaultActivityTypes();
    }

    getDefaultActivityTypes() {
        return [
            { id: 'work', name: '工作', color: '#c9a961' },
            { id: 'exercise', name: '運動', color: '#7a8b74' },
            { id: 'workout', name: '重訓', color: '#d4a574' },
            { id: 'study', name: '學習', color: '#6b8e9f' },
            { id: 'rest', name: '休息', color: '#b87d8b' }
        ];
    }

    getHTML() {
        return `
            <div class="timebox-container">
                <!-- 頂部控制區 -->
                <div class="timebox-header">
                    <div class="week-navigator">
                        <button onclick="window.activeModule.changeWeek(-1)" class="nav-btn">◀</button>
                        <h2>${this.getWeekTitle()}</h2>
                        <button onclick="window.activeModule.changeWeek(1)" class="nav-btn">▶</button>
                    </div>
                    
                    <div class="timebox-actions">
                        <button onclick="window.activeModule.goToToday()" class="action-btn">今天</button>
                        <button onclick="window.activeModule.showWeekCopy()" class="action-btn">複製週計畫</button>
                        <button onclick="window.activeModule.clearSelection()" class="action-btn">清除選取</button>
                    </div>
                </div>

                <!-- 活動類型選擇區 -->
                <div class="activity-selector">
                    <span class="selector-label">選擇活動類型：</span>
                    ${this.activityTypes.map(type => `
                        <button class="activity-type ${this.selectedActivity === type.id ? 'active' : ''}" 
                                data-type="${type.id}"
                                style="background: ${type.color};"
                                onclick="window.activeModule.selectActivityType('${type.id}')">
                            ${type.name}
                        </button>
                    `).join('')}
                </div>

                <!-- 時間表格 -->
                <div class="timebox-table-container">
                    <table class="timebox-table">
                        <thead>
                            <tr>
                                <th class="corner-cell">時間</th>
                                ${this.getDayHeaders()}
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getTimeRows()}
                        </tbody>
                    </table>
                    <!-- 當前時間線 -->
                    <div class="current-time-line" id="currentTimeLine"></div>
                </div>

                <!-- 統計區域 -->
                <div class="stats-container">
                    ${this.getStatsHTML()}
                </div>
            </div>

            ${this.getStyles()}
        `;
    }

    getWeekTitle() {
        const start = new Date(this.currentWeekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        
        const formatDate = (date) => {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        };
        
        return `${formatDate(start)} - ${formatDate(end)}`;
    }

    getDayHeaders() {
        const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
        const headers = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.currentWeekStart);
            date.setDate(date.getDate() + i);
            const isToday = this.isToday(date);
            
            headers.push(`
                <th class="day-header ${isToday ? 'today' : ''}">
                    <div>${days[i]}</div>
                    <div class="date-label">${date.getMonth() + 1}/${date.getDate()}</div>
                </th>
            `);
        }
        
        return headers.join('');
    }

    getTimeRows() {
        const rows = [];
        
        for (let hour = 6; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                rows.push(`
                    <tr data-time="${hour}-${minute}">
                        <td class="time-label">
                            ${minute === 0 ? `${hour}:00` : `${hour}:30`}
                        </td>
                        ${this.getDayCells(hour, minute)}
                    </tr>
                `);
            }
        }
        
        return rows.join('');
    }

    getDayCells(hour, minute) {
        const cells = [];
        
        for (let day = 0; day < 7; day++) {
            const slotId = `${day}-${hour}-${minute}`;
            const data = this.timeboxData[slotId];
            const isCompleted = data?.completed || false;
            const activity = data ? this.activityTypes.find(t => t.id === data.type) : null;
            
            cells.push(`
                <td class="time-slot ${data ? 'filled' : ''} ${isCompleted ? 'completed' : ''}"
                    data-slot="${slotId}"
                    data-day="${day}"
                    data-hour="${hour}"
                    data-minute="${minute}"
                    style="${activity ? `background-color: ${activity.color};` : ''}"
                    onclick="window.activeModule.handleCellClick('${slotId}')"
                    onmousedown="window.activeModule.startDrag('${slotId}')"
                    onmouseenter="window.activeModule.continueDrag('${slotId}')"
                    onmouseup="window.activeModule.endDrag()">
                    ${data ? `
                        <div class="slot-content">
                            <span class="activity-name">${activity ? activity.name : ''}</span>
                            ${isCompleted ? '<span class="check-mark">✓</span>' : ''}
                        </div>
                    ` : ''}
                </td>
            `);
        }
        
        return cells.join('');
    }

    // 點擊處理
    handleCellClick(slotId) {
        const data = this.timeboxData[slotId];
        
        if (data) {
            // 切換完成狀態
            data.completed = !data.completed;
            this.saveData();
            this.refresh();
        } else if (this.selectedActivity) {
            // 新增活動
            this.addActivity(slotId, this.selectedActivity);
        }
    }

    // 拖曳選取
    startDrag(slotId) {
        this.isSelecting = true;
        this.selectionStart = slotId;
        this.selectedSlots = [slotId];
        this.highlightSlots();
    }

    continueDrag(slotId) {
        if (!this.isSelecting) return;
        
        // 只添加連續的格子，不要矩形選取
        if (!this.selectedSlots.includes(slotId)) {
            this.selectedSlots.push(slotId);
            this.highlightSlots();
        }
    }

    endDrag() {
        if (!this.isSelecting) return;
        this.isSelecting = false;
        
        if (this.selectedSlots.length > 0 && this.selectedActivity) {
            this.applyActivityToSlots();
        }
    }

    highlightSlots() {
        // 清除所有高亮
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selecting');
        });
        
        // 高亮選中的格子
        this.selectedSlots.forEach(slotId => {
            const element = document.querySelector(`[data-slot="${slotId}"]`);
            if (element) {
                element.classList.add('selecting');
            }
        });
    }

    applyActivityToSlots() {
        if (this.selectedActivity === 'workout') {
            this.showWorkoutDialog();
            return;
        }
        
        const activity = this.activityTypes.find(t => t.id === this.selectedActivity);
        
        this.selectedSlots.forEach(slotId => {
            this.timeboxData[slotId] = {
                type: this.selectedActivity,
                title: activity.name,
                completed: false,
                createdAt: new Date().toISOString()
            };
        });
        
        this.saveData();
        this.refresh();
    }

    addActivity(slotId, activityId) {
        if (activityId === 'workout') {
            this.selectedSlots = [slotId];
            this.showWorkoutDialog();
            return;
        }
        
        const activity = this.activityTypes.find(t => t.id === activityId);
        
        this.timeboxData[slotId] = {
            type: activityId,
            title: activity.name,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.saveData();
        this.refresh();
    }

    // 選擇活動類型
    selectActivityType(typeId) {
        this.selectedActivity = typeId;
        this.refresh();
    }

    // 清除選取
    clearSelection() {
        this.selectedSlots = [];
        this.selectedActivity = null;
        this.refresh();
    }

    // 當前時間線
    startCurrentTimeLine() {
        this.updateTimeLine();
        this.currentTimeInterval = setInterval(() => {
            this.updateTimeLine();
        }, 60000); // 每分鐘更新
    }

    updateTimeLine() {
        const now = new Date();
        const day = (now.getDay() + 6) % 7; // 調整為週一開始
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // 只在6:00-24:00顯示
        if (hour < 6 || hour >= 24) {
            const line = document.getElementById('currentTimeLine');
            if (line) line.style.display = 'none';
            return;
        }
        
        // 檢查是否在當前週
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(this.currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        if (todayStart < this.currentWeekStart || todayStart >= weekEnd) {
            const line = document.getElementById('currentTimeLine');
            if (line) line.style.display = 'none';
            return;
        }
        
        const line = document.getElementById('currentTimeLine');
        if (line) {
            // 計算位置（橫向）
            const totalMinutes = (hour - 6) * 60 + minute;
            const totalSlots = 18 * 60; // 6:00-24:00
            const percentage = (totalMinutes / totalSlots) * 100;
            
            line.style.display = 'block';
            line.style.top = `${135 + percentage * 5.4}px`; // 調整位置
            line.style.left = '60px';
            line.style.right = '0';
            line.style.width = 'calc(100% - 60px)';
        }
    }

    // 重訓對話框
    showWorkoutDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'workout-dialog-overlay';
        dialog.innerHTML = `
            <div class="workout-dialog">
                <h3>重訓記錄</h3>
                <div class="workout-form">
                    <div id="exerciseList">
                        <div class="exercise-item">
                            <input type="text" placeholder="器材名稱" class="equipment-input">
                            <input type="number" placeholder="重量(kg)" class="weight-input" min="0" step="0.5">
                            <input type="number" placeholder="次數" class="reps-input" min="1">
                            <input type="number" placeholder="組數" class="sets-input" min="1">
                        </div>
                    </div>
                    <button onclick="window.activeModule.addExerciseRow()" class="add-exercise-btn">+ 新增項目</button>
                    
                    <div class="dialog-actions">
                        <button onclick="window.activeModule.closeDialog()">取消</button>
                        <button onclick="window.activeModule.saveWorkout()">保存</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    addExerciseRow() {
        const list = document.getElementById('exerciseList');
        const newItem = document.createElement('div');
        newItem.className = 'exercise-item';
        newItem.innerHTML = `
            <input type="text" placeholder="器材名稱" class="equipment-input">
            <input type="number" placeholder="重量(kg)" class="weight-input" min="0" step="0.5">
            <input type="number" placeholder="次數" class="reps-input" min="1">
            <input type="number" placeholder="組數" class="sets-input" min="1">
            <button onclick="this.parentElement.remove()" class="remove-btn">刪除</button>
        `;
        list.appendChild(newItem);
    }

    async saveWorkout() {
        const exercises = [];
        document.querySelectorAll('.exercise-item').forEach(item => {
            const equipment = item.querySelector('.equipment-input').value;
            const weight = parseFloat(item.querySelector('.weight-input').value) || 0;
            const reps = parseInt(item.querySelector('.reps-input').value) || 0;
            const sets = parseInt(item.querySelector('.sets-input').value) || 0;
            
            if (equipment && weight && reps && sets) {
                exercises.push({ equipment, weight, reps, sets });
            }
        });
        
        if (exercises.length > 0) {
            const workoutId = Date.now().toString();
            this.workoutData[workoutId] = {
                date: new Date().toISOString(),
                exercises,
                slots: this.selectedSlots
            };
            
            const activity = this.activityTypes.find(t => t.id === 'workout');
            this.selectedSlots.forEach(slotId => {
                this.timeboxData[slotId] = {
                    type: 'workout',
                    title: '重訓',
                    workoutId,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
            });
            
            await this.saveData();
            this.refresh();
        }
        
        this.closeDialog();
    }

    // 週複製功能
    showWeekCopy() {
        const dialog = document.createElement('div');
        dialog.className = 'copy-dialog-overlay';
        dialog.innerHTML = `
            <div class="copy-dialog">
                <h3>複製本週計畫到下週</h3>
                <div class="copy-options">
                    ${this.activityTypes.map(type => `
                        <label>
                            <input type="checkbox" value="${type.id}" checked>
                            <span style="color: ${type.color};">■</span> ${type.name}
                        </label>
                    `).join('')}
                </div>
                <div class="dialog-actions">
                    <button onclick="window.activeModule.closeDialog()">取消</button>
                    <button onclick="window.activeModule.executeCopy()">確認複製</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    async executeCopy() {
        const selectedTypes = Array.from(document.querySelectorAll('.copy-options input:checked'))
            .map(input => input.value);
        
        const nextWeekData = {};
        Object.entries(this.timeboxData).forEach(([slotId, data]) => {
            if (selectedTypes.includes(data.type)) {
                nextWeekData[slotId] = {
                    ...data,
                    completed: false,
                    copiedFrom: this.currentWeekStart.toISOString()
                };
            }
        });
        
        // 前進到下週
        this.changeWeek(1);
        
        // 合併資料
        this.timeboxData = { ...this.timeboxData, ...nextWeekData };
        await this.saveData();
        this.refresh();
        this.closeDialog();
    }

    // 統計功能
    getStatsHTML() {
        const todayStats = this.calculateDayStats(new Date());
        const weekStats = this.calculateWeekStats();
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>今日進度</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${todayStats.percentage}%"></div>
                    </div>
                    <p>${todayStats.completed} / ${todayStats.total} 完成</p>
                </div>
                
                <div class="stat-card">
                    <h3>本週進度</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${weekStats.percentage}%"></div>
                    </div>
                    <p>${weekStats.completed} / ${weekStats.total} 完成</p>
                </div>
                
                ${this.getActivityStats()}
                ${this.getWorkoutStats()}
            </div>
        `;
    }

    calculateDayStats(date) {
        const day = (date.getDay() + 6) % 7;
        let total = 0;
        let completed = 0;
        
        Object.entries(this.timeboxData).forEach(([slotId, data]) => {
            const [slotDay] = slotId.split('-').map(Number);
            if (slotDay === day) {
                total++;
                if (data.completed) completed++;
            }
        });
        
        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    calculateWeekStats() {
        const total = Object.keys(this.timeboxData).length;
        const completed = Object.values(this.timeboxData).filter(d => d.completed).length;
        
        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    getActivityStats() {
        const stats = {};
        Object.values(this.timeboxData).forEach(data => {
            if (!stats[data.type]) {
                stats[data.type] = { count: 0, completed: 0 };
            }
            stats[data.type].count++;
            if (data.completed) stats[data.type].completed++;
        });
        
        return `
            <div class="stat-card">
                <h3>活動分布</h3>
                ${this.activityTypes.map(type => {
                    const stat = stats[type.id] || { count: 0, completed: 0 };
                    const hours = stat.count * 0.5;
                    return `
                        <div class="activity-stat">
                            <span style="color: ${type.color};">■</span>
                            ${type.name}: ${hours}小時
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getWorkoutStats() {
        const workouts = Object.values(this.workoutData).filter(w => {
            const date = new Date(w.date);
            return date >= this.currentWeekStart && 
                   date < new Date(this.currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        });
        
        let totalWeight = 0;
        let totalSets = 0;
        
        workouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                totalWeight += ex.weight * ex.reps * ex.sets;
                totalSets += ex.sets;
            });
        });
        
        return `
            <div class="stat-card">
                <h3>本週重訓</h3>
                <p>訓練次數：${workouts.length} 次</p>
                <p>總重量：${totalWeight.toLocaleString()} kg</p>
                <p>總組數：${totalSets} 組</p>
            </div>
        `;
    }

    // 工具函數
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    changeWeek(direction) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (direction * 7));
        this.refresh();
    }

    goToToday() {
        this.initCurrentWeek();
        this.refresh();
    }

    refresh() {
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
        this.startCurrentTimeLine();
    }

    closeDialog() {
        document.querySelector('.workout-dialog-overlay')?.remove();
        document.querySelector('.copy-dialog-overlay')?.remove();
    }

    async saveData() {
        try {
            await this.syncManager.save(this.currentUser.uuid, 'timebox', {
                timeboxes: this.timeboxData,
                workouts: this.workoutData,
                activityTypes: this.activityTypes,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('儲存失敗:', error);
        }
    }

    attachEventListeners() {
        // 防止文字選取
        document.addEventListener('selectstart', e => {
            if (e.target.closest('.timebox-table')) {
                e.preventDefault();
            }
        });
        
        // 滑鼠離開時結束拖曳
        document.addEventListener('mouseleave', () => {
            if (this.isSelecting) {
                this.endDrag();
            }
        });
    }

    destroy() {
        if (this.currentTimeInterval) {
            clearInterval(this.currentTimeInterval);
        }
        this.closeDialog();
    }

    getStyles() {
        return `
            <style>
                .timebox-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 20px;
                }

                /* 頂部控制 */
                .timebox-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--card);
                    padding: 16px 20px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .week-navigator {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .week-navigator h2 {
                    margin: 0;
                    font-size: 1.2rem;
                    color: var(--text);
                }

                .nav-btn {
                    width: 32px;
                    height: 32px;
                    border: 1px solid var(--border);
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .nav-btn:hover {
                    background: var(--primary-light);
                }

                .timebox-actions {
                    display: flex;
                    gap: 8px;
                }

                .action-btn {
                    padding: 8px 16px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .action-btn:hover {
                    background: var(--primary-dark);
                }

                /* 活動選擇器 */
                .activity-selector {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--card);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .selector-label {
                    color: var(--text-light);
                    font-size: 14px;
                }

                .activity-type {
                    padding: 8px 16px;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .activity-type:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }

                .activity-type.active {
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.2);
                }

                /* 時間表格 */
                .timebox-table-container {
                    flex: 1;
                    background: var(--card);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    overflow: auto;
                    position: relative;
                }

                .timebox-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .timebox-table th,
                .timebox-table td {
                    border: 1px solid var(--border);
                    text-align: center;
                    position: relative;
                }

                .timebox-table th {
                    background: var(--bg);
                    padding: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .corner-cell {
                    width: 60px;
                }

                .day-header {
                    min-width: 100px;
                }

                .day-header.today {
                    background: var(--primary-light);
                    color: white;
                }

                .date-label {
                    font-size: 12px;
                    opacity: 0.8;
                }

                .time-label {
                    background: var(--bg);
                    padding: 4px 8px;
                    font-size: 12px;
                    color: var(--text-light);
                    position: sticky;
                    left: 0;
                    z-index: 5;
                }

                .time-slot {
                    padding: 4px;
                    height: 30px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                    user-select: none;
                }

                .time-slot:hover {
                    background: var(--bg) !important;
                }

                .time-slot.filled {
                    color: white;
                    font-weight: 500;
                }

                .time-slot.selecting {
                    background: rgba(201, 169, 97, 0.3) !important;
                    border: 2px solid var(--primary) !important;
                }

                .time-slot.completed {
                    opacity: 0.7;
                }

                .slot-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    position: relative;
                }

                .activity-name {
                    font-size: 12px;
                }

                .check-mark {
                    position: absolute;
                    right: 2px;
                    top: -2px;
                    font-size: 12px;
                    font-weight: bold;
                }

                /* 當前時間線 */
                .current-time-line {
                    position: absolute;
                    height: 2px;
                    background: #ff6b6b;
                    box-shadow: 0 0 8px rgba(255, 107, 107, 0.6);
                    pointer-events: none;
                    z-index: 20;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }

                /* 統計區域 */
                .stats-container {
                    background: var(--card);
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .stat-card {
                    background: var(--bg);
                    padding: 12px;
                    border-radius: 8px;
                }

                .stat-card h3 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    color: var(--text-light);
                }

                .stat-card p {
                    margin: 4px 0;
                    font-size: 14px;
                }

                .progress-bar {
                    height: 6px;
                    background: var(--bg-dark);
                    border-radius: 3px;
                    overflow: hidden;
                    margin: 8px 0;
                }

                .progress-fill {
                    height: 100%;
                    background: var(--primary);
                    transition: width 0.3s;
                }

                .activity-stat {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 4px 0;
                    font-size: 14px;
                }

                /* 對話框 */
                .workout-dialog-overlay,
                .copy-dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .workout-dialog,
                .copy-dialog {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    min-width: 400px;
                    max-width: 90%;
                }

                .workout-dialog h3,
                .copy-dialog h3 {
                    margin: 0 0 16px 0;
                }

                .workout-form {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .exercise-item {
                    display: flex;
                    gap: 8px;
                    padding: 8px;
                    background: var(--bg);
                    border-radius: 6px;
                }

                .exercise-item input {
                    flex: 1;
                    padding: 6px;
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    font-size: 14px;
                }

                .remove-btn {
                    padding: 6px 12px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .add-exercise-btn {
                    padding: 8px;
                    background: var(--primary-light);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .copy-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin: 16px 0;
                }

                .copy-options label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: var(--bg);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .dialog-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 16px;
                }

                .dialog-actions button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .dialog-actions button:first-child {
                    background: var(--bg);
                }

                .dialog-actions button:last-child {
                    background: var(--primary);
                    color: white;
                }

                /* 響應式設計 */
                @media (max-width: 768px) {
                    .timebox-header {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .activity-selector {
                        flex-wrap: wrap;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .day-header {
                        min-width: 60px;
                        font-size: 12px;
                    }
                }
            </style>
        `;
    }
}

// ES6 模組匯出
export { TimeboxModule };