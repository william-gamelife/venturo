/**
 * 箱型時間管理模組 - 遊戲人生 3.0 優化版
 * 
 * 新功能：
 * 1. 選取合併成長方形
 * 2. 美化設計（脫離 Excel 感）
 * 3. 當前時間參考線
 * 4. 重訓專屬記錄
 * 5. 週一開始
 * 6. 完成率統計優化
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
        version: '3.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.timeboxData = {};
        this.workoutData = {}; // 重訓記錄
        this.currentWeekStart = null;
        this.selectedSlots = [];
        this.selectionStart = null;
        this.activityTypes = [];
        this.currentTimeInterval = null;
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
        // 設定為週一開始
        const day = today.getDay();
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
                this.timeboxData = {};
                this.workoutData = {};
                this.activityTypes = this.getDefaultActivityTypes();
            }
        } catch (error) {
            console.error('載入失敗:', error);
            this.initDefaultData();
        }
    }

    getDefaultActivityTypes() {
        return [
            { id: 'work', name: '工作', color: '#c9a961', gradient: 'linear-gradient(135deg, #c9a961 0%, #e4d4a8 100%)' },
            { id: 'exercise', name: '運動', color: '#7a8b74', gradient: 'linear-gradient(135deg, #7a8b74 0%, #a3b39c 100%)' },
            { id: 'workout', name: '重訓', color: '#d4a574', gradient: 'linear-gradient(135deg, #d4a574 0%, #f4c89c 100%)' },
            { id: 'study', name: '學習', color: '#6b8e9f', gradient: 'linear-gradient(135deg, #6b8e9f 0%, #8fb4c7 100%)' },
            { id: 'rest', name: '休息', color: '#b87d8b', gradient: 'linear-gradient(135deg, #b87d8b 0%, #d4a0b3 100%)' }
        ];
    }

    getHTML() {
        return `
            <div class="timebox-container">
                <!-- 頂部控制區 -->
                <div class="timebox-header">
                    <div class="week-navigator">
                        <button onclick="window.activeModule.changeWeek(-1)" class="nav-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path d="M12 15l-5-5 5-5" stroke="currentColor" fill="none" stroke-width="2"/>
                            </svg>
                        </button>
                        <h2>${this.getWeekTitle()}</h2>
                        <button onclick="window.activeModule.changeWeek(1)" class="nav-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path d="M8 15l5-5-5-5" stroke="currentColor" fill="none" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="timebox-actions">
                        <button onclick="window.activeModule.goToToday()" class="action-btn">
                            今天
                        </button>
                        <button onclick="window.activeModule.showWeekCopy()" class="action-btn">
                            複製週計畫
                        </button>
                    </div>
                </div>

                <!-- 活動類型選擇區 -->
                <div class="activity-selector">
                    ${this.activityTypes.map(type => `
                        <div class="activity-type" 
                             data-type="${type.id}"
                             style="background: ${type.gradient};"
                             onclick="window.activeModule.selectActivityType('${type.id}')">
                            <span>${type.name}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- 時間格子主區域 -->
                <div class="timebox-grid-container">
                    <div class="time-labels">
                        ${this.getTimeLabels()}
                    </div>
                    <div class="grid-wrapper">
                        <div class="day-labels">
                            ${this.getDayLabels()}
                        </div>
                        <div class="timebox-grid" id="timeboxGrid">
                            ${this.getGridHTML()}
                            <div class="current-time-line" id="currentTimeLine"></div>
                        </div>
                    </div>
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
        
        return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
    }

    getTimeLabels() {
        const labels = [];
        for (let hour = 6; hour < 24; hour++) {
            labels.push(`<div class="time-label">${hour}:00</div>`);
        }
        return labels.join('');
    }

    getDayLabels() {
        const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
        return days.map((day, index) => {
            const date = new Date(this.currentWeekStart);
            date.setDate(date.getDate() + index);
            const isToday = this.isToday(date);
            return `
                <div class="day-label ${isToday ? 'today' : ''}">
                    <div>${day}</div>
                    <div class="date">${date.getMonth() + 1}/${date.getDate()}</div>
                </div>
            `;
        }).join('');
    }

    getGridHTML() {
        const grid = [];
        
        for (let day = 0; day < 7; day++) {
            for (let hour = 6; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const slot = `${day}-${hour}-${minute}`;
                    const data = this.timeboxData[slot];
                    const isCompleted = data?.completed || false;
                    const activity = data ? this.activityTypes.find(t => t.id === data.type) : null;
                    
                    grid.push(`
                        <div class="time-slot ${data ? 'filled' : ''} ${isCompleted ? 'completed' : ''}"
                             data-slot="${slot}"
                             data-day="${day}"
                             data-hour="${hour}"
                             data-minute="${minute}"
                             style="${activity ? `background: ${activity.gradient};` : ''}"
                             onmousedown="window.activeModule.startSelection('${slot}')"
                             onmouseenter="window.activeModule.continueSelection('${slot}')"
                             onmouseup="window.activeModule.endSelection('${slot}')"
                             onclick="window.activeModule.toggleComplete('${slot}')">
                            ${data ? `
                                <div class="slot-content">
                                    <span>${data.title || activity.name}</span>
                                    ${isCompleted ? '<span class="check">✓</span>' : ''}
                                </div>
                            ` : ''}
                        </div>
                    `);
                }
            }
        }
        
        return grid.join('');
    }

    getStatsHTML() {
        const today = new Date();
        const todayStats = this.calculateDayStats(today);
        const weekStats = this.calculateWeekStats();
        
        return `
            <div class="stats-grid">
                <!-- 今日完成率 -->
                <div class="stat-card">
                    <h3>今日進度</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${todayStats.percentage}%"></div>
                    </div>
                    <div class="stat-text">
                        已完成 ${todayStats.completed}/${todayStats.total} 個時段
                    </div>
                </div>

                <!-- 本週完成率 -->
                <div class="stat-card">
                    <h3>本週進度</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${weekStats.percentage}%"></div>
                    </div>
                    <div class="stat-text">
                        已完成 ${weekStats.completed}/${weekStats.total} 個時段
                    </div>
                </div>

                <!-- 活動分布 -->
                <div class="stat-card">
                    <h3>活動分布</h3>
                    <div class="activity-distribution">
                        ${this.getActivityDistribution()}
                    </div>
                </div>

                <!-- 重訓統計 -->
                <div class="stat-card">
                    <h3>本週重訓</h3>
                    <div class="workout-stats">
                        ${this.getWorkoutStats()}
                    </div>
                </div>
            </div>
        `;
    }

    calculateDayStats(date) {
        const day = (date.getDay() + 6) % 7; // 調整為週一開始
        let total = 0;
        let completed = 0;
        
        for (let hour = 6; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const slot = `${day}-${hour}-${minute}`;
                if (this.timeboxData[slot]) {
                    total++;
                    if (this.timeboxData[slot].completed) {
                        completed++;
                    }
                }
            }
        }
        
        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    calculateWeekStats() {
        let total = 0;
        let completed = 0;
        
        Object.values(this.timeboxData).forEach(data => {
            total++;
            if (data.completed) {
                completed++;
            }
        });
        
        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    getActivityDistribution() {
        const distribution = {};
        let totalTime = 0;
        
        Object.values(this.timeboxData).forEach(data => {
            if (!distribution[data.type]) {
                distribution[data.type] = 0;
            }
            distribution[data.type] += 0.5; // 30分鐘
            totalTime += 0.5;
        });
        
        return this.activityTypes.map(type => {
            const hours = distribution[type.id] || 0;
            const percentage = totalTime > 0 ? Math.round((hours / totalTime) * 100) : 0;
            return `
                <div class="distribution-item">
                    <span class="color-box" style="background: ${type.color}"></span>
                    <span class="name">${type.name}</span>
                    <span class="time">${hours}小時</span>
                    <span class="percentage">${percentage}%</span>
                </div>
            `;
        }).join('');
    }

    getWorkoutStats() {
        const workouts = Object.values(this.workoutData).filter(w => {
            const date = new Date(w.date);
            return date >= this.currentWeekStart && date < new Date(this.currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        });
        
        if (workouts.length === 0) {
            return '<div class="no-data">本週尚無重訓記錄</div>';
        }
        
        let totalWeight = 0;
        let totalSets = 0;
        const bodyParts = {};
        
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                totalWeight += exercise.weight * exercise.reps * exercise.sets;
                totalSets += exercise.sets;
                
                if (!bodyParts[exercise.bodyPart]) {
                    bodyParts[exercise.bodyPart] = 0;
                }
                bodyParts[exercise.bodyPart]++;
            });
        });
        
        return `
            <div>訓練次數：${workouts.length} 次</div>
            <div>總重量：${totalWeight.toLocaleString()} kg</div>
            <div>總組數：${totalSets} 組</div>
        `;
    }

    // 選取邏輯
    startSelection(slot) {
        this.selectedSlots = [slot];
        this.selectionStart = slot;
        this.isSelecting = true;
    }

    continueSelection(slot) {
        if (!this.isSelecting) return;
        
        // 計算矩形選取範圍
        const start = this.parseSlot(this.selectionStart);
        const current = this.parseSlot(slot);
        
        const minDay = Math.min(start.day, current.day);
        const maxDay = Math.max(start.day, current.day);
        const minTime = Math.min(start.hour * 60 + start.minute, current.hour * 60 + current.minute);
        const maxTime = Math.max(start.hour * 60 + start.minute, current.hour * 60 + current.minute);
        
        // 清除之前的選取
        document.querySelectorAll('.time-slot.selecting').forEach(el => {
            el.classList.remove('selecting');
        });
        
        // 選取矩形範圍內的所有格子
        this.selectedSlots = [];
        for (let day = minDay; day <= maxDay; day++) {
            for (let time = minTime; time <= maxTime; time += 30) {
                const hour = Math.floor(time / 60);
                const minute = time % 60;
                const slotId = `${day}-${hour}-${minute}`;
                this.selectedSlots.push(slotId);
                
                const element = document.querySelector(`[data-slot="${slotId}"]`);
                if (element) {
                    element.classList.add('selecting');
                }
            }
        }
    }

    async endSelection(slot) {
        if (!this.isSelecting) return;
        this.isSelecting = false;
        
        // 顯示活動選擇對話框
        this.showActivityDialog();
    }

    parseSlot(slot) {
        const [day, hour, minute] = slot.split('-').map(Number);
        return { day, hour, minute };
    }

    showActivityDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'activity-dialog-overlay';
        dialog.innerHTML = `
            <div class="activity-dialog">
                <h3>選擇活動類型</h3>
                <div class="activity-options">
                    ${this.activityTypes.map(type => `
                        <div class="activity-option" 
                             style="background: ${type.gradient};"
                             onclick="window.activeModule.applyActivity('${type.id}')">
                            ${type.name}
                        </div>
                    `).join('')}
                </div>
                <button class="cancel-btn" onclick="window.activeModule.cancelSelection()">取消</button>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    async applyActivity(typeId) {
        const type = this.activityTypes.find(t => t.id === typeId);
        
        // 如果是重訓，顯示詳細記錄對話框
        if (typeId === 'workout') {
            this.showWorkoutDialog();
            return;
        }
        
        // 合併選取的格子
        const mergedData = {
            type: typeId,
            title: type.name,
            slots: this.selectedSlots,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // 保存到每個格子
        this.selectedSlots.forEach(slot => {
            this.timeboxData[slot] = {
                ...mergedData,
                mainSlot: this.selectedSlots[0] // 記錄主格子
            };
        });
        
        await this.saveData();
        this.refresh();
        this.closeDialog();
    }

    showWorkoutDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'workout-dialog-overlay';
        dialog.innerHTML = `
            <div class="workout-dialog">
                <h3>重訓記錄</h3>
                <div class="workout-form">
                    <div id="exerciseList"></div>
                    <button onclick="window.activeModule.addExercise()">+ 新增項目</button>
                    
                    <div class="dialog-actions">
                        <button onclick="window.activeModule.cancelSelection()">取消</button>
                        <button onclick="window.activeModule.saveWorkout()">保存</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        this.addExercise(); // 自動添加第一個項目
    }

    addExercise() {
        const list = document.getElementById('exerciseList');
        const exerciseId = Date.now();
        
        const exerciseHTML = `
            <div class="exercise-item" data-id="${exerciseId}">
                <input type="text" placeholder="器材名稱" class="equipment-input">
                <input type="number" placeholder="重量(kg)" class="weight-input">
                <input type="number" placeholder="次數" class="reps-input">
                <input type="number" placeholder="組數" class="sets-input">
                <button onclick="window.activeModule.removeExercise(${exerciseId})">刪除</button>
            </div>
        `;
        
        list.insertAdjacentHTML('beforeend', exerciseHTML);
    }

    removeExercise(id) {
        document.querySelector(`[data-id="${id}"]`).remove();
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
            const workoutId = Date.now();
            this.workoutData[workoutId] = {
                date: new Date().toISOString(),
                exercises,
                slots: this.selectedSlots
            };
            
            // 保存到時間格子
            this.selectedSlots.forEach(slot => {
                this.timeboxData[slot] = {
                    type: 'workout',
                    title: '重訓',
                    workoutId,
                    completed: false
                };
            });
            
            await this.saveData();
            this.refresh();
        }
        
        this.closeDialog();
    }

    toggleComplete(slot) {
        if (this.timeboxData[slot]) {
            this.timeboxData[slot].completed = !this.timeboxData[slot].completed;
            this.saveData();
            
            const element = document.querySelector(`[data-slot="${slot}"]`);
            element.classList.toggle('completed');
            
            // 更新統計
            document.querySelector('.stats-container').innerHTML = this.getStatsHTML();
        }
    }

    // 當前時間線
    startCurrentTimeLine() {
        this.updateTimeLine();
        // 每分鐘更新一次
        this.currentTimeInterval = setInterval(() => {
            this.updateTimeLine();
        }, 60000);
    }

    updateTimeLine() {
        const now = new Date();
        const day = (now.getDay() + 6) % 7; // 調整為週一開始
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        if (hour < 6 || hour >= 24) return; // 不在顯示範圍內
        
        const line = document.getElementById('currentTimeLine');
        if (line) {
            const position = day * (100 / 7) + ((hour - 6) * 60 + minute) / (18 * 60) * (100 / 7);
            line.style.left = `${position}%`;
            line.style.display = 'block';
        }
    }

    // 週複製功能
    showWeekCopy() {
        const dialog = document.createElement('div');
        dialog.className = 'copy-dialog-overlay';
        dialog.innerHTML = `
            <div class="copy-dialog">
                <h3>複製週計畫到下週</h3>
                <div class="copy-options">
                    <label><input type="checkbox" value="work" checked> 工作</label>
                    <label><input type="checkbox" value="exercise" checked> 運動</label>
                    <label><input type="checkbox" value="workout" checked> 重訓</label>
                    <label><input type="checkbox" value="study"> 學習</label>
                    <label><input type="checkbox" value="rest"> 休息</label>
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
        
        // 複製選中類型的活動到下週
        const newData = {};
        Object.entries(this.timeboxData).forEach(([slot, data]) => {
            if (selectedTypes.includes(data.type)) {
                const [day, hour, minute] = slot.split('-');
                // 保持相同的時間，但不複製完成狀態
                newData[slot] = {
                    ...data,
                    completed: false,
                    copiedFrom: this.currentWeekStart.toISOString()
                };
            }
        });
        
        // 前進到下週
        this.changeWeek(1);
        
        // 合併資料
        this.timeboxData = { ...this.timeboxData, ...newData };
        await this.saveData();
        this.refresh();
        this.closeDialog();
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
        document.querySelector('.activity-dialog-overlay')?.remove();
        document.querySelector('.workout-dialog-overlay')?.remove();
        document.querySelector('.copy-dialog-overlay')?.remove();
    }

    cancelSelection() {
        this.selectedSlots = [];
        document.querySelectorAll('.time-slot.selecting').forEach(el => {
            el.classList.remove('selecting');
        });
        this.closeDialog();
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
            if (e.target.closest('.timebox-grid')) {
                e.preventDefault();
            }
        });
    }

    initDefaultData() {
        this.timeboxData = {};
        this.workoutData = {};
        this.activityTypes = this.getDefaultActivityTypes();
    }

    selectActivityType(typeId) {
        // 未來可以實作直接選取活動類型
        console.log('Selected activity:', typeId);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
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
                    gap: 20px;
                    padding: 20px;
                }

                /* 頂部控制區 */
                .timebox-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--card);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                }

                .week-navigator {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .nav-btn {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: var(--bg);
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .nav-btn:hover {
                    background: var(--primary-light);
                }

                .timebox-actions {
                    display: flex;
                    gap: 12px;
                }

                .action-btn {
                    padding: 8px 16px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }

                /* 活動類型選擇區 */
                .activity-selector {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    background: var(--card);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .activity-type {
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .activity-type:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                /* 時間格子 */
                .timebox-grid-container {
                    flex: 1;
                    display: flex;
                    gap: 12px;
                    background: var(--card);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    overflow: auto;
                }

                .time-labels {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .time-label {
                    height: 60px;
                    display: flex;
                    align-items: center;
                    padding-right: 12px;
                    color: var(--text-light);
                    font-size: 12px;
                }

                .grid-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .day-labels {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 2px;
                    margin-bottom: 8px;
                }

                .day-label {
                    text-align: center;
                    padding: 8px;
                    background: var(--bg);
                    border-radius: 8px;
                    font-weight: 500;
                }

                .day-label.today {
                    background: var(--primary-light);
                    color: white;
                }

                .day-label .date {
                    font-size: 12px;
                    opacity: 0.8;
                }

                .timebox-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    grid-template-rows: repeat(36, 30px);
                    gap: 2px;
                    position: relative;
                }

                .time-slot {
                    background: var(--bg);
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                }

                .time-slot:hover {
                    background: var(--bg-dark);
                    transform: scale(1.05);
                }

                .time-slot.filled {
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                }

                .time-slot.selecting {
                    border: 2px solid var(--primary);
                    background: rgba(201, 169, 97, 0.2);
                }

                .time-slot.completed {
                    opacity: 0.7;
                }

                .time-slot.completed::after {
                    content: '✓';
                    position: absolute;
                    top: 2px;
                    right: 4px;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                }

                .slot-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    padding: 2px;
                    overflow: hidden;
                }

                /* 當前時間線 */
                .current-time-line {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #ff6b6b;
                    box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
                    pointer-events: none;
                    display: none;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }

                /* 統計區域 */
                .stats-container {
                    background: var(--card);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }

                .stat-card {
                    background: var(--bg);
                    padding: 16px;
                    border-radius: 12px;
                }

                .stat-card h3 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    color: var(--text-light);
                }

                .progress-bar {
                    height: 8px;
                    background: var(--bg-dark);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
                    transition: width 0.3s;
                }

                .stat-text {
                    font-size: 12px;
                    color: var(--text-light);
                }

                .distribution-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 12px;
                }

                .color-box {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                }

                .workout-stats {
                    font-size: 14px;
                    line-height: 1.8;
                }

                .no-data {
                    color: var(--text-light);
                    font-style: italic;
                }

                /* 對話框 */
                .activity-dialog-overlay,
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

                .activity-dialog,
                .workout-dialog,
                .copy-dialog {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    min-width: 400px;
                    max-width: 90%;
                }

                .activity-options {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin: 20px 0;
                }

                .activity-option {
                    padding: 20px;
                    border-radius: 12px;
                    color: white;
                    text-align: center;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .activity-option:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .workout-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .exercise-item {
                    display: flex;
                    gap: 8px;
                    padding: 12px;
                    background: var(--bg);
                    border-radius: 8px;
                }

                .exercise-item input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid var(--border);
                    border-radius: 4px;
                }

                .exercise-item button {
                    padding: 8px 12px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .dialog-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 20px;
                }

                .dialog-actions button,
                .cancel-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .dialog-actions button:first-child,
                .cancel-btn {
                    background: var(--bg);
                    color: var(--text);
                }

                .dialog-actions button:last-child {
                    background: var(--primary);
                    color: white;
                }

                .copy-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin: 20px 0;
                }

                .copy-options label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: var(--bg);
                    border-radius: 8px;
                    cursor: pointer;
                }

                .copy-options input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
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
                    animation: slideUp 0.3s;
                    z-index: 2000;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
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
                }
            </style>
        `;
    }
}

// ES6 模組匯出
export { TimeboxModule };