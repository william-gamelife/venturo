/**
 * 待辦事項管理系統 - 遊戲人生 3.0 修正版
 * 解決所有UI問題
 */

class TodosModule {
    static moduleInfo = {
        name: '待辦事項',
        subtitle: '智慧任務管理與專案追蹤',
        icon: `<svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
               </svg>`,
        version: '2.1.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.todos = [];
        this.selectedTodos = new Set();
        this.currentFilter = 'all';
        this.draggedItem = null;
        this.availableUsers = [];
        
        // 簡潔的標籤系統
        this.quickTags = [
            { id: 'quote', name: '報價', color: '#c9a961' },
            { id: 'schedule', name: '行程', color: '#7a8b74' },
            { id: 'presentation', name: '簡報', color: '#6b8e9f' },
            { id: 'contract', name: '合約', color: '#d4a574' },
            { id: 'flight', name: '團務機票', color: '#b87d8b' },
            { id: 'hotel', name: '團務訂房', color: '#8b9dc3' },
            { id: 'transport', name: '團務訂車', color: '#a0c4a0' }
        ];
    }

    async render(uuid) {
        window.activeModule = this;
        this.currentUser = { uuid };
        
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 直接從雲端載入，避免本地快取
        await this.loadDataFromCloud();
        await this.loadAvailableUsers();
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        this.attachEventListeners();
    }

    async loadDataFromCloud() {
        try {
            if (!this.syncManager.supabase) {
                console.warn('Supabase 未初始化');
                this.todos = [];
                return;
            }

            // 直接從 Supabase 載入，跳過本地快取
            const { data, error } = await this.syncManager.supabase
                .from('user_data')
                .select('data')
                .eq('user_id', this.currentUser.uuid)
                .eq('module', 'todos')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('首次使用待辦事項');
                    this.todos = [];
                } else {
                    console.error('載入失敗:', error);
                    this.todos = [];
                }
            } else if (data && data.data && data.data.todos) {
                this.todos = data.data.todos;
                console.log(`載入 ${this.todos.length} 個任務`);
            } else {
                this.todos = [];
            }
        } catch (error) {
            console.error('載入異常:', error);
            this.todos = [];
        }
    }

    async saveDataToCloud() {
        try {
            if (!this.syncManager.supabase) return;

            const saveData = {
                user_id: this.currentUser.uuid,
                module: 'todos',
                data: {
                    todos: this.todos,
                    lastUpdated: new Date().toISOString()
                },
                updated_at: new Date().toISOString()
            };

            const { error } = await this.syncManager.supabase
                .from('user_data')
                .upsert(saveData, {
                    onConflict: 'user_id,module'
                });

            if (error) {
                console.error('儲存失敗:', error);
                this.showToast('儲存失敗', 'error');
            }
        } catch (error) {
            console.error('儲存異常:', error);
        }
    }

    async loadAvailableUsers() {
        try {
            if (!this.syncManager.supabase) {
                this.availableUsers = [
                    { uuid: 'self', display_name: '自己' }
                ];
                return;
            }

            const { data, error } = await this.syncManager.supabase
                .from('user_data')
                .select('data')
                .eq('module', 'users')
                .single();

            if (data && data.data) {
                this.availableUsers = data.data.map(user => ({
                    uuid: user.uuid,
                    display_name: user.display_name || user.username
                }));
            } else {
                this.availableUsers = [
                    { uuid: 'self', display_name: '自己' }
                ];
            }
        } catch (error) {
            console.error('載入用戶失敗:', error);
            this.availableUsers = [
                { uuid: 'self', display_name: '自己' }
            ];
        }
    }

    getHTML() {
        return `
            <div class="todos-container">
                <!-- 統一歡迎卡片 -->
                <div class="module-welcome-card">
                    <div class="welcome-left">
                        <div class="module-icon-wrapper">
                            ${TodosModule.moduleInfo.icon}
                        </div>
                        <div class="module-text">
                            <h2 class="module-title">${TodosModule.moduleInfo.name}</h2>
                            <p class="module-subtitle">${TodosModule.moduleInfo.subtitle}</p>
                        </div>
                    </div>
                    <div class="welcome-right">
                        <span class="task-count">${this.todos.length} 個任務</span>
                        <button class="btn-primary" onclick="window.activeModule.showAddDialog()">
                            <svg width="16" height="16"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2"/></svg>
                            新增任務
                        </button>
                    </div>
                </div>

                <!-- 四欄看板 -->
                <div class="kanban-board">
                    ${this.getKanbanColumns()}
                </div>
            </div>

            ${this.getStyles()}
        `;
    }

    getKanbanColumns() {
        const columns = [
            { id: 'pending', title: '待處理', color: '#9b9588' },
            { id: 'today', title: '今日執行', color: '#c9a961' },
            { id: 'week', title: '本週規劃', color: '#7a8b74' },
            { id: 'done', title: '已完成', color: '#6b8e9f' }
        ];

        return columns.map(col => {
            const tasks = this.getTodosByStatus(col.id);
            return `
                <div class="kanban-column" data-status="${col.id}">
                    <div class="column-header">
                        <span class="column-title" style="color: ${col.color}">
                            ${col.title}
                            <span class="column-count">${tasks.length}</span>
                        </span>
                        <button class="add-btn" onclick="window.activeModule.quickAdd('${col.id}')">+</button>
                    </div>
                    <div class="column-tasks" ondrop="window.activeModule.handleDrop(event, '${col.id}')" 
                         ondragover="window.activeModule.handleDragOver(event)">
                        ${tasks.map(task => this.getTaskCard(task)).join('')}
                        ${tasks.length === 0 ? '<div class="empty-state">暫無任務</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getTaskCard(task) {
        const selectedTag = this.quickTags.find(t => t.id === task.tag);
        
        return `
            <div class="task-card" 
                 data-id="${task.id}"
                 draggable="true"
                 ondragstart="window.activeModule.handleDragStart(event, '${task.id}')"
                 onclick="window.activeModule.editTask('${task.id}')">
                
                <div class="task-header">
                    <input type="checkbox" 
                           class="task-check" 
                           ${task.completed ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.activeModule.toggleComplete('${task.id}')">
                    <div class="task-priority" onclick="event.stopPropagation()">
                        ${this.getPriorityStars(task.priority, task.id)}
                    </div>
                </div>
                
                <div class="task-body">
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                    
                    <div class="task-footer">
                        ${selectedTag ? `
                            <span class="task-tag" style="background: ${selectedTag.color}20; color: ${selectedTag.color}">
                                ${selectedTag.name}
                            </span>
                        ` : ''}
                        ${task.dueDate ? `
                            <span class="task-date">${this.formatDate(task.dueDate)}</span>
                        ` : ''}
                        ${task.assignee && task.assignee !== 'self' ? `
                            <span class="task-assignee">${this.getUserName(task.assignee)}</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getPriorityStars(priority = 0, taskId) {
        let stars = '';
        for (let i = 1; i <= 3; i++) {
            const filled = i <= priority;
            stars += `
                <svg class="priority-star ${filled ? 'filled' : ''}" 
                     data-level="${i}"
                     onclick="window.activeModule.setPriority('${taskId}', ${i})"
                     width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8 1.5l1.8 3.7 4.2.6-3 3 .7 4.2L8 11l-3.7 2 .7-4.2-3-3 4.2-.6z"
                          fill="${filled ? '#c9a961' : 'none'}"
                          stroke="${filled ? '#c9a961' : '#ddd'}"
                          stroke-width="1.5"/>
                </svg>
            `;
        }
        return stars;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return '今天';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return '明天';
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    }

    getUserName(uuid) {
        const user = this.availableUsers.find(u => u.uuid === uuid);
        return user ? user.display_name : uuid;
    }

    getTodosByStatus(status) {
        return this.todos.filter(todo => {
            if (status === 'done') return todo.completed;
            if (todo.completed) return false;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (status === 'today') {
                if (!todo.dueDate) return false;
                const dueDate = new Date(todo.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate.getTime() === today.getTime();
            }
            
            if (status === 'week') {
                if (!todo.dueDate) return false;
                const dueDate = new Date(todo.dueDate);
                const weekEnd = new Date(today);
                weekEnd.setDate(weekEnd.getDate() + 7);
                return dueDate > today && dueDate <= weekEnd;
            }
            
            if (status === 'pending') {
                return !todo.dueDate || new Date(todo.dueDate) > new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            }
            
            return false;
        });
    }

    async showAddDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <h3>新增任務</h3>
                
                <input type="text" id="taskTitle" placeholder="任務標題" class="input-field" autofocus>
                <textarea id="taskDesc" placeholder="詳細說明（選填）" class="input-field" rows="3"></textarea>
                
                <div class="form-row">
                    <label>優先級</label>
                    <div class="priority-selector" id="prioritySelector">
                        ${this.getPriorityStars(0, 'new')}
                    </div>
                </div>
                
                <div class="form-row">
                    <label>標籤</label>
                    <select id="taskTag" class="select-field">
                        <option value="">無標籤</option>
                        ${this.quickTags.map(tag => `
                            <option value="${tag.id}">${tag.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-row">
                    <label>到期日</label>
                    <input type="date" id="taskDate" class="input-field">
                </div>
                
                <div class="form-row">
                    <label>指派給</label>
                    <select id="taskAssignee" class="select-field">
                        <option value="self">自己</option>
                        ${this.availableUsers.filter(u => u.uuid !== 'self').map(user => `
                            <option value="${user.uuid}">${user.display_name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn-save" onclick="window.activeModule.saveNewTask()">儲存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 綁定優先級選擇
        let selectedPriority = 0;
        dialog.querySelectorAll('.priority-star').forEach(star => {
            star.onclick = (e) => {
                e.stopPropagation();
                selectedPriority = parseInt(star.dataset.level);
                dialog.querySelectorAll('.priority-star').forEach((s, i) => {
                    s.classList.toggle('filled', i < selectedPriority);
                    const path = s.querySelector('path');
                    if (i < selectedPriority) {
                        path.setAttribute('fill', '#c9a961');
                        path.setAttribute('stroke', '#c9a961');
                    } else {
                        path.setAttribute('fill', 'none');
                        path.setAttribute('stroke', '#ddd');
                    }
                });
            };
        });
        
        // Enter 鍵儲存
        dialog.querySelector('#taskTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveNewTask();
            }
        });
    }

    async saveNewTask() {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            this.showToast('請輸入任務標題', 'error');
            return;
        }
        
        const priority = document.querySelectorAll('.priority-star.filled').length;
        
        const newTask = {
            id: Date.now().toString(),
            title: title,
            description: document.getElementById('taskDesc').value.trim(),
            priority: priority,
            tag: document.getElementById('taskTag').value,
            dueDate: document.getElementById('taskDate').value,
            assignee: document.getElementById('taskAssignee').value,
            completed: false,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        
        this.todos.push(newTask);
        await this.saveDataToCloud();
        
        document.querySelector('.modal-overlay').remove();
        this.render(this.currentUser.uuid);
        this.showToast('任務已新增', 'success');
    }

    async setPriority(taskId, level) {
        const task = this.todos.find(t => t.id === taskId);
        if (task) {
            task.priority = task.priority === level ? level - 1 : level;
            await this.saveDataToCloud();
            this.render(this.currentUser.uuid);
        }
    }

    async toggleComplete(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            await this.saveDataToCloud();
            this.render(this.currentUser.uuid);
        }
    }

    quickAdd(status) {
        // 快速新增任務到指定欄位
        const title = prompt('任務標題：');
        if (title) {
            const newTask = {
                id: Date.now().toString(),
                title: title,
                status: status,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            // 根據欄位設定預設日期
            if (status === 'today') {
                newTask.dueDate = new Date().toISOString().split('T')[0];
            } else if (status === 'week') {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 3);
                newTask.dueDate = nextWeek.toISOString().split('T')[0];
            }
            
            this.todos.push(newTask);
            this.saveDataToCloud();
            this.render(this.currentUser.uuid);
        }
    }

    editTask(taskId) {
        // TODO: 實作編輯任務對話框
        console.log('編輯任務:', taskId);
    }

    handleDragStart(e, taskId) {
        this.draggedItem = taskId;
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    async handleDrop(e, status) {
        e.preventDefault();
        if (!this.draggedItem) return;
        
        const task = this.todos.find(t => t.id === this.draggedItem);
        if (task) {
            // 更新任務狀態
            if (status === 'done') {
                task.completed = true;
            } else {
                task.completed = false;
                
                // 根據欄位更新日期
                const today = new Date();
                if (status === 'today') {
                    task.dueDate = today.toISOString().split('T')[0];
                } else if (status === 'week') {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 3);
                    task.dueDate = nextWeek.toISOString().split('T')[0];
                } else if (status === 'pending') {
                    task.dueDate = null;
                }
            }
            
            await this.saveDataToCloud();
            this.render(this.currentUser.uuid);
        }
        
        this.draggedItem = null;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    attachEventListeners() {
        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.showAddDialog();
            }
        });
    }

    getStyles() {
        return `
            <style>
                /* 統一歡迎卡片 */
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
                    gap: 16px;
                }
                
                .task-count {
                    color: var(--text-light);
                    font-size: 0.9rem;
                }
                
                .btn-primary {
                    height: 36px;
                    padding: 0 16px;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.875rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow);
                }
                
                /* 看板 */
                .kanban-board {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    height: calc(100vh - 300px);
                }
                
                .kanban-column {
                    background: var(--card);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                }
                
                .column-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .column-title {
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .column-count {
                    padding: 2px 6px;
                    background: var(--bg);
                    border-radius: 8px;
                    font-size: 0.75rem;
                }
                
                .add-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    border: 1px solid var(--border);
                    background: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .add-btn:hover {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                
                .column-tasks {
                    flex: 1;
                    padding: 12px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .empty-state {
                    text-align: center;
                    color: var(--text-muted);
                    padding: 20px;
                    font-size: 0.875rem;
                }
                
                /* 任務卡片 */
                .task-card {
                    background: white;
                    border-radius: 8px;
                    padding: 12px;
                    border: 1px solid var(--border);
                    cursor: move;
                    transition: all 0.2s;
                }
                
                .task-card:hover {
                    box-shadow: var(--shadow-sm);
                    transform: translateY(-1px);
                }
                
                .task-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .task-check {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                
                .task-priority {
                    display: flex;
                    gap: 2px;
                }
                
                .priority-star {
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .priority-star:hover {
                    transform: scale(1.1);
                }
                
                .task-title {
                    font-weight: 500;
                    color: var(--text);
                    margin-bottom: 4px;
                }
                
                .task-desc {
                    font-size: 0.85rem;
                    color: var(--text-light);
                    margin-bottom: 8px;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                
                .task-footer {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                
                .task-tag {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                
                .task-date {
                    font-size: 0.75rem;
                    color: var(--text-light);
                }
                
                .task-assignee {
                    font-size: 0.75rem;
                    color: var(--primary);
                    font-weight: 500;
                }
                
                /* 對話框 */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    width: 90%;
                    max-width: 500px;
                }
                
                .modal-content h3 {
                    margin: 0 0 20px 0;
                    color: var(--text);
                }
                
                .input-field, .select-field {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 16px;
                }
                
                .form-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 16px;
                }
                
                .form-row label {
                    width: 80px;
                    color: var(--text);
                    font-size: 0.9rem;
                }
                
                .priority-selector {
                    display: flex;
                    gap: 4px;
                }
                
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                
                .btn-cancel, .btn-save {
                    padding: 8px 20px;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-cancel {
                    background: white;
                    border: 1px solid var(--border);
                    color: var(--text);
                }
                
                .btn-save {
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border: none;
                    color: white;
                }
                
                /* Toast */
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.9rem;
                    opacity: 0;
                    transition: all 0.3s;
                    z-index: 2000;
                }
                
                .toast.show {
                    opacity: 1;
                    transform: translateY(-10px);
                }
                
                .toast-success {
                    background: #10b981;
                }
                
                .toast-error {
                    background: #ef4444;
                }
                
                .toast-info {
                    background: var(--primary);
                }
                
                /* 響應式 */
                @media (max-width: 1200px) {
                    .kanban-board {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 768px) {
                    .kanban-board {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    }

    destroy() {
        // 清理
    }
}

export { TodosModule };
