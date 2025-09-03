/**
 * 專案管理模組 V2 - 升級版
 * 主要升級：動態模板、巢狀任務、甘特圖、細分權限
 */

class ProjectsModuleV2 {
    static moduleInfo = {
        name: '專案管理 2.0',
        subtitle: '智慧專案追蹤系統',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"></path><path d="M3 9h18"></path><path d="M9 3v18"></path></svg>',
        version: '2.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.projects = [];
        this.templates = this.loadTemplates();
        this.expandedProjects = new Set();
    }

    loadTemplates() {
        const saved = localStorage.getItem('project_templates_v2');
        if (saved) return JSON.parse(saved);
        
        return {
            '旅遊': {
                icon: '✈',
                color: '#3b82f6',
                structure: [
                    {
                        name: '行前準備',
                        subtasks: [
                            { name: '護照檢查', assignee: null },
                            { name: '簽證辦理', assignee: null },
                            { name: '旅遊保險', assignee: null }
                        ]
                    },
                    {
                        name: '交通安排',
                        subtasks: [
                            { name: '機票訂購', assignee: null },
                            { name: '當地交通', assignee: null }
                        ]
                    },
                    {
                        name: '住宿餐飲',
                        subtasks: [
                            { name: '飯店預訂', assignee: null },
                            { name: '餐廳預約', assignee: null }
                        ]
                    },
                    {
                        name: '行程規劃',
                        subtasks: [
                            { name: '景點安排', assignee: null },
                            { name: '活動預訂', assignee: null }
                        ]
                    }
                ]
            },
            '商務': {
                icon: '💼',
                color: '#10b981',
                structure: [
                    {
                        name: '前期準備',
                        subtasks: [
                            { name: '需求分析', assignee: null },
                            { name: '報價單', assignee: null }
                        ]
                    },
                    {
                        name: '合約階段',
                        subtasks: [
                            { name: '合約草擬', assignee: null },
                            { name: '合約簽署', assignee: null }
                        ]
                    },
                    {
                        name: '執行交付',
                        subtasks: [
                            { name: '專案執行', assignee: null },
                            { name: '品質檢查', assignee: null }
                        ]
                    },
                    {
                        name: '結案收款',
                        subtasks: [
                            { name: '交付確認', assignee: null },
                            { name: '發票開立', assignee: null },
                            { name: '款項追蹤', assignee: null }
                        ]
                    }
                ]
            }
        };
    }

    async render(uuid) {
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        await this.loadData(uuid);
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        this.bindEvents();
        this.initDragAndDrop();
        this.startAutoSave();
    }

    getHTML() {
        return `
            <div class="projects-v2-container">
                <div class="projects-header">
                    <div class="header-left">
                        <h2>專案管理 2.0</h2>
                        <span class="version-badge">升級版</span>
                    </div>
                    <div class="header-tools">
                        <button onclick="window.activeModule.showCreateProject()" class="btn-primary">
                            新增專案
                        </button>
                        <button onclick="window.activeModule.showTemplates()" class="btn-tool">
                            模板管理
                        </button>
                        <button onclick="window.activeModule.showGantt()" class="btn-tool">
                            甘特圖
                        </button>
                        <button onclick="window.activeModule.exportProjects()" class="btn-tool">
                            匯出報表
                        </button>
                    </div>
                </div>

                <div class="projects-stats">
                    <div class="stat-card">
                        <div class="stat-value">${this.projects.length}</div>
                        <div class="stat-label">總專案數</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getActiveCount()}</div>
                        <div class="stat-label">進行中</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getCompletedCount()}</div>
                        <div class="stat-label">已完成</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getOverdueCount()}</div>
                        <div class="stat-label">已逾期</div>
                    </div>
                </div>

                <div class="projects-list" id="projectsList">
                    ${this.projects.map(project => this.renderProject(project)).join('')}
                </div>
            </div>

            <style>
                .projects-v2-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 20px;
                }
                .projects-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 15px;
                    border-bottom: 2px solid var(--border);
                }
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .version-badge {
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .btn-primary {
                    padding: 8px 16px;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .btn-tool {
                    padding: 6px 12px;
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    cursor: pointer;
                }
                .projects-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                }
                .stat-card {
                    background: var(--card);
                    padding: 20px;
                    border-radius: 12px;
                    text-align: center;
                }
                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: var(--primary);
                }
                .stat-label {
                    font-size: 14px;
                    color: #666;
                    margin-top: 5px;
                }
                .projects-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    overflow-y: auto;
                }
                .project-card {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.3s;
                }
                .project-card.expanded {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .project-header {
                    padding: 15px;
                    background: var(--card);
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .project-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .project-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .project-title {
                    font-size: 18px;
                    font-weight: bold;
                }
                .project-meta {
                    display: flex;
                    gap: 10px;
                    margin-top: 5px;
                    font-size: 12px;
                    color: #666;
                }
                .project-progress {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .progress-bar {
                    width: 100px;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #34d399);
                    transition: width 0.3s;
                }
                .progress-text {
                    font-weight: bold;
                    font-size: 14px;
                }
                .project-body {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s;
                }
                .project-card.expanded .project-body {
                    max-height: 1000px;
                }
                .task-tree {
                    padding: 20px;
                }
                .task-group {
                    margin-bottom: 20px;
                }
                .task-group-header {
                    font-weight: bold;
                    padding: 8px;
                    background: var(--bg);
                    border-radius: 6px;
                    margin-bottom: 10px;
                }
                .task-item {
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    margin-left: 20px;
                    border-left: 2px solid var(--border);
                    position: relative;
                }
                .task-item::before {
                    content: '';
                    position: absolute;
                    left: -2px;
                    top: 50%;
                    width: 10px;
                    height: 2px;
                    background: var(--border);
                }
                .task-checkbox {
                    margin-right: 10px;
                }
                .task-name {
                    flex: 1;
                    transition: all 0.2s;
                }
                .task-item.completed .task-name {
                    text-decoration: line-through;
                    color: #999;
                }
                .task-assignee {
                    padding: 2px 8px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    font-size: 11px;
                    margin-left: 10px;
                }
                .task-date {
                    font-size: 11px;
                    color: #666;
                    margin-left: 10px;
                }
                .subtask {
                    margin-left: 40px;
                    font-size: 14px;
                    opacity: 0.9;
                }
                .expand-icon {
                    transition: transform 0.3s;
                }
                .project-card.expanded .expand-icon {
                    transform: rotate(180deg);
                }
                @media (max-width: 768px) {
                    .projects-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .project-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                }
            </style>
        `;
    }

    renderProject(project) {
        const progress = this.calculateProgress(project);
        const isExpanded = this.expandedProjects.has(project.id);
        
        return `
            <div class="project-card ${isExpanded ? 'expanded' : ''}" data-id="${project.id}">
                <div class="project-header" onclick="window.activeModule.toggleProject('${project.id}')">
                    <div class="project-info">
                        <div class="project-icon" style="background: ${project.color}20; color: ${project.color}">
                            ${project.icon || '📁'}
                        </div>
                        <div>
                            <div class="project-title">${project.name}</div>
                            <div class="project-meta">
                                <span>📅 ${new Date(project.created_at).toLocaleDateString()}</span>
                                ${project.due_date ? `<span>⏰ ${new Date(project.due_date).toLocaleDateString()}</span>` : ''}
                                <span>👤 ${project.owner || this.currentUser.name}</span>
                            </div>
                        </div>
                    </div>
                    <div class="project-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${progress}%</div>
                        <svg class="expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="project-body">
                    <div class="task-tree">
                        ${this.renderTaskTree(project.tasks || [])}
                    </div>
                    <div class="project-actions" style="padding: 0 20px 20px;">
                        <button onclick="window.activeModule.editProject('${project.id}')" class="btn-tool">編輯</button>
                        <button onclick="window.activeModule.addTask('${project.id}')" class="btn-tool">新增任務</button>
                        <button onclick="window.activeModule.exportProject('${project.id}')" class="btn-tool">匯出</button>
                        ${this.currentUser.name === 'william' || this.currentUser.name === 'carson' ? 
                            `<button onclick="window.activeModule.deleteProject('${project.id}')" class="btn-tool" style="color: red;">刪除</button>` : 
                            ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderTaskTree(tasks, level = 0) {
        if (!tasks || tasks.length === 0) return '';
        
        return tasks.map(task => {
            const isGroup = task.subtasks && task.subtasks.length > 0;
            const canEdit = this.canEditTask(task);
            
            if (isGroup) {
                return `
                    <div class="task-group">
                        <div class="task-group-header">${task.name}</div>
                        ${this.renderTaskTree(task.subtasks, level + 1)}
                    </div>
                `;
            } else {
                return `
                    <div class="task-item ${task.completed ? 'completed' : ''} ${level > 0 ? 'subtask' : ''}" 
                         data-task-id="${task.id}">
                        <input type="checkbox" 
                               class="task-checkbox" 
                               ${task.completed ? 'checked' : ''}
                               ${canEdit ? '' : 'disabled'}
                               onchange="window.activeModule.toggleTask('${task.id}')">
                        <span class="task-name">${task.name}</span>
                        ${task.assignee ? `<span class="task-assignee">${task.assignee}</span>` : ''}
                        ${task.completed_at ? `<span class="task-date">✓ ${new Date(task.completed_at).toLocaleDateString()}</span>` : ''}
                    </div>
                `;
            }
        }).join('');
    }

    canEditTask(task) {
        if (this.currentUser.name === 'william' || this.currentUser.name === 'carson') {
            return true;
        }
        return task.assignee === this.currentUser.name;
    }

    calculateProgress(project) {
        if (!project.tasks || project.tasks.length === 0) return 0;
        
        let total = 0;
        let completed = 0;
        
        const countTasks = (tasks) => {
            tasks.forEach(task => {
                if (task.subtasks && task.subtasks.length > 0) {
                    countTasks(task.subtasks);
                } else {
                    total++;
                    if (task.completed) completed++;
                }
            });
        };
        
        countTasks(project.tasks);
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    toggleProject(projectId) {
        if (this.expandedProjects.has(projectId)) {
            this.expandedProjects.delete(projectId);
        } else {
            this.expandedProjects.add(projectId);
        }
        
        const card = document.querySelector(`.project-card[data-id="${projectId}"]`);
        if (card) {
            card.classList.toggle('expanded');
        }
    }

    async toggleTask(taskId) {
        let targetTask = null;
        let targetProject = null;
        
        for (const project of this.projects) {
            const task = this.findTaskInTree(project.tasks, taskId);
            if (task) {
                targetTask = task;
                targetProject = project;
                break;
            }
        }
        
        if (!targetTask) return;
        
        if (!this.canEditTask(targetTask)) {
            this.showToast('您沒有權限修改此任務', 'error');
            return;
        }
        
        targetTask.completed = !targetTask.completed;
        if (targetTask.completed) {
            targetTask.completed_at = new Date().toISOString();
            targetTask.completed_by = this.currentUser.name;
        } else {
            delete targetTask.completed_at;
            delete targetTask.completed_by;
        }
        
        if (targetTask.mergedFromTodos) {
            try {
                const bridgeModule = await import('./task-bridge-v2.js');
                const bridge = new bridgeModule.TaskBridgeV2();
                await bridge.syncTaskStatus(targetTask.mergedFromTodos, targetTask.completed, this.currentUser.id);
            } catch (error) {
                console.error('同步任務狀態失敗:', error);
            }
        }
        
        await this.saveData();
        await this.render(this.currentUser.id);
    }

    findTaskInTree(tasks, taskId) {
        for (const task of tasks) {
            if (task.id === taskId) return task;
            if (task.subtasks) {
                const found = this.findTaskInTree(task.subtasks, taskId);
                if (found) return found;
            }
        }
        return null;
    }

    showCreateProject() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 10000; min-width: 400px;">
                <h3>建立新專案</h3>
                <div class="form-group" style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px;">專案名稱</label>
                    <input type="text" id="projectName" placeholder="輸入專案名稱" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px;">選擇模板</label>
                    <select id="projectTemplate" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="">空白專案</option>
                        ${Object.entries(this.templates).map(([name, template]) => 
                            `<option value="${name}">${template.icon} ${name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px;">截止日期</label>
                    <input type="date" id="projectDueDate" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="modal-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="window.activeModule.createProject()" class="btn-primary" style="padding: 8px 16px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; cursor: pointer;">建立</button>
                    <button onclick="this.closest('.modal-overlay').remove()" style="padding: 8px 16px; background: #e5e7eb; border: none; border-radius: 6px; cursor: pointer;">取消</button>
                </div>
            </div>
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999;" onclick="this.parentElement.remove()"></div>
        `;
        document.body.appendChild(dialog);
    }

    async createProject() {
        const name = document.getElementById('projectName').value;
        const templateName = document.getElementById('projectTemplate').value;
        const dueDate = document.getElementById('projectDueDate').value;
        
        if (!name) {
            this.showToast('請輸入專案名稱', 'error');
            return;
        }
        
        const template = templateName ? this.templates[templateName] : null;
        const project = {
            id: Date.now().toString(),
            name: name,
            icon: template?.icon || '📁',
            color: template?.color || '#6b7280',
            tasks: template?.structure || [],
            created_at: new Date().toISOString(),
            due_date: dueDate || null,
            owner: this.currentUser.name,
            status: 'active'
        };
        
        const generateTaskIds = (tasks) => {
            tasks.forEach(task => {
                task.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                if (task.subtasks) {
                    generateTaskIds(task.subtasks);
                }
            });
        };
        generateTaskIds(project.tasks);
        
        this.projects.unshift(project);
        await this.saveData();
        await this.render(this.currentUser.id);
        
        document.querySelector('.modal-overlay').remove();
        this.showToast('專案建立成功', 'success');
    }

    getActiveCount() {
        return this.projects.filter(p => p.status === 'active').length;
    }

    getCompletedCount() {
        return this.projects.filter(p => this.calculateProgress(p) === 100).length;
    }

    getOverdueCount() {
        const now = new Date();
        return this.projects.filter(p => {
            if (!p.due_date) return false;
            return new Date(p.due_date) < now && this.calculateProgress(p) < 100;
        }).length;
    }

    initDragAndDrop() {
        document.querySelectorAll('.task-item').forEach(item => {
            item.draggable = true;
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.target.classList.add('dragging');
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                if (dragging && dragging !== item) {
                    const rect = item.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    if (y < rect.height / 2) {
                        item.parentNode.insertBefore(dragging, item);
                    } else {
                        item.parentNode.insertBefore(dragging, item.nextSibling);
                    }
                }
            });
        });
    }

    bindEvents() {
        window.activeModule = this;
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveData();
        }, 30000);
    }

    async saveData() {
        if (!this.syncManager || !this.currentUser.id) return;
        
        const dataToSave = {
            projects: this.projects,
            templates: this.templates,
            version: '2.0.0'
        };
        
        await this.syncManager.save(this.currentUser.uuid, 'projects-v2', dataToSave);
    }

    async loadData(uuid) {
        if (!this.syncManager) return;
        
        const data = await this.syncManager.load(uuid, 'projects-v2');
        if (data) {
            this.projects = data.projects || [];
            if (data.templates) {
                this.templates = data.templates;
                localStorage.setItem('project_templates_v2', JSON.stringify(this.templates));
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    // 補充方法
    showTemplates() {
        this.showToast('模板管理功能開發中', 'info');
    }

    showGantt() {
        this.showToast('甘特圖功能開發中', 'info');
    }

    exportProjects() {
        this.showToast('匯出功能開發中', 'info');
    }

    editProject(projectId) {
        this.showToast('編輯功能開發中', 'info');
    }

    addTask(projectId) {
        this.showToast('新增任務功能開發中', 'info');
    }

    exportProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const dataStr = JSON.stringify(project, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = `${project.name}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showToast('專案已匯出', 'success');
        }
    }

    async deleteProject(projectId) {
        if (!confirm('確定要刪除此專案嗎？')) return;
        
        this.projects = this.projects.filter(p => p.id !== projectId);
        await this.saveData();
        await this.render(this.currentUser.id);
        this.showToast('專案已刪除', 'success');
    }

    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        this.saveData();
        
        this.projects = null;
        this.templates = null;
        this.expandedProjects = null;
        this.syncManager = null;
        this.currentUser = null;
        
        if (window.activeModule === this) {
            window.activeModule = null;
        }
        
        console.log('ProjectsModuleV2 已銷毀');
    }
}

// ES6 模組匯出
export { ProjectsModuleV2 };