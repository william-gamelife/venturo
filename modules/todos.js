/**
 * 待辦事項管理系統 - 遊戲人生 3.0 大改版
 * 符合 building-manual 規範
 * 
 * 核心功能：
 * 1. 智能五欄看板系統（待處理、今日執行、本週規劃、最近完成、轉為專案）
 * 2. 增強快速分類標籤（報價、行程、簡報、合約、團務機票、團務訂房、團務訂車）
 * 3. 流暢拖曳移動與多選功能
 * 4. 智能合併成專案功能
 * 5. 進階篩選與搜尋
 * 6. 留言系統與協作功能
 * 7. 任務優先級與到期日管理
 * 8. 專案識別標籤系統
 * 9. Enter/ESC 快捷鍵支持
 * 10. 響應式互動體驗
 */

class TodosModule {
    // SignageHost 招牌資料
    static signage = {
        title: '待辦事項',
        subtitle: '郵務總局｜任務與流程',
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 11l3 3L20 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        actions: [
            { id: 'mergeProject', label: '轉為專案', kind: 'primary', onClick: 'convertToProject' }
        ]
    };

    // 靜態資訊（必填）- 店家招牌
    static moduleInfo = {
        name: '待辦事項',
        subtitle: '智慧任務管理與專案追蹤',
        icon: `<svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <rect x="7" y="2" width="10" height="5" rx="1" fill="currentColor" opacity="0.3"/>
               </svg>`,
        version: '2.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.todos = [];
        this.selectedTodos = new Set();
        this.draggedItem = null;
        
        // 新增狀態管理
        this.isSelecting = false;
        this.dragStartSlot = null;
        this.editingTask = null;
        
        // 專案模板
        this.projectTemplates = [
            {
                id: 'travel-basic',
                name: '旅行社基礎模板',
                categories: [
                    { id: 'contract', name: '合約類' },
                    { id: 'flight', name: '機票類' },
                    { id: 'hotel', name: '住宿類' },
                    { id: 'transport', name: '交通類' }
                ]
            },
            {
                id: 'travel-full',
                name: '旅行社完整模板',
                categories: [
                    { id: 'contract', name: '合約類' },
                    { id: 'flight', name: '機票類' },
                    { id: 'hotel', name: '住宿類' },
                    { id: 'transport', name: '交通類' },
                    { id: 'activity', name: '活動類' },
                    { id: 'meal', name: '餐飲類' },
                    { id: 'insurance', name: '保險類' },
                    { id: 'document', name: '文件類' }
                ]
            },
            {
                id: 'blank',
                name: '空白專案',
                categories: [
                    { id: 'general', name: '一般任務' }
                ]
            }
        ];
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
    }

    async loadData() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'todos');
            if (data && data.todos) {
                this.todos = data.todos;
            } else {
                this.todos = [];
            }
        } catch (error) {
            console.error('載入待辦事項失敗:', error);
            this.todos = [];
        }
    }

    async saveData() {
        try {
            await this.syncManager.save(this.currentUser.uuid, 'todos', {
                todos: this.todos,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('儲存失敗:', error);
            this.showToast('儲存失敗', 'error');
        }
    }

    getHTML() {
        return `
            <div class="todos-container">
                <!-- 五欄看板 -->
                <div class="kanban-board">
                    ${this.getKanbanColumns()}
                </div>
            </div>

            <style>
                .todos-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    gap: 0;
                }
                

                /* 看板欄位 */
                .kanban-board {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 16px;
                    overflow-x: auto;
                    min-height: 400px;
                }

                .kanban-column {
                    background: var(--bg);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    min-width: 250px;
                }

                .column-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid var(--border);
                }

                .column-title {
                    font-weight: 600;
                    color: var(--text);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .add-btn {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .add-btn:hover {
                    background: var(--primary-dark);
                    transform: scale(1.1);
                }

                .column-count {
                    background: var(--primary-light);
                    color: var(--primary-dark);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .column-tasks {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    overflow-y: auto;
                    padding: 4px;
                }

                .column-tasks.drag-over {
                    background: rgba(201, 169, 97, 0.1);
                    border: 2px dashed var(--primary);
                    border-radius: 8px;
                }

                /* 任務卡片 */
                .task-card {
                    background: white;
                    border-radius: 8px;
                    padding: 12px;
                    border: 1px solid var(--border);
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .task-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow);
                }

                .task-card.selected {
                    border-color: var(--primary);
                    background: var(--primary-light);
                }

                .task-card.dragging {
                    opacity: 0.5;
                    transform: rotate(2deg);
                }

                .task-checkbox {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .task-content {
                    margin-left: 30px;
                }

                .task-title {
                    font-weight: 500;
                    color: var(--text);
                    margin-bottom: 4px;
                    font-size: 0.95rem;
                }

                .task-desc {
                    font-size: 0.85rem;
                    color: var(--text-light);
                    margin-bottom: 8px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .task-meta {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .task-tag {
                    padding: 2px 8px;
                    background: var(--bg);
                    border-radius: 4px;
                    font-size: 0.75rem;
                    color: var(--text-light);
                }

                .task-priority {
                    display: flex;
                    gap: 2px;
                }

                .star {
                    width: 12px;
                    height: 12px;
                    fill: var(--border);
                }

                .star.filled {
                    fill: var(--primary);
                }

                .task-due {
                    font-size: 0.75rem;
                    color: var(--accent);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .task-actions {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .task-card:hover .task-actions {
                    opacity: 1;
                }

                .task-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    border: 1px solid var(--border);
                    background: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .task-btn:hover {
                    background: var(--bg);
                }

                /* 對話框 */
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
                }

                .dialog {
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
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: var(--text);
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 0.9rem;
                    color: var(--text-light);
                    font-weight: 500;
                }

                .form-input, .form-textarea, .form-select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }

                .form-input:focus, .form-textarea:focus, .form-select:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .priority-selector {
                    display: flex;
                    gap: 8px;
                }

                .priority-star {
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .priority-star:hover path {
                    fill: var(--primary-light, #a89080);
                }
                
                /* 對話框關閉按鈕 */
                .dialog-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-light);
                    transition: all 0.2s;
                    border-radius: 50%;
                }
                
                .dialog-close:hover {
                    background: var(--bg);
                    transform: rotate(90deg);
                }
                
                .dialog-header {
                    position: relative;
                    padding-right: 50px;
                }

                .tag-selector {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .tag-option {
                    padding: 6px 12px;
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }

                .tag-option:hover {
                    background: var(--bg);
                }

                .tag-option.selected {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
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
                    border: 1px solid var(--border);
                    background: white;
                    color: var(--text);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .btn:hover {
                    background: var(--bg);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                }

                .btn-danger {
                    background: #e74c3c;
                    color: white;
                    border-color: #e74c3c;
                }

                /* 留言區 */
                .comments-section {
                    border-top: 1px solid var(--border);
                    margin-top: 16px;
                    padding-top: 16px;
                }

                .comment {
                    background: var(--bg);
                    padding: 8px 12px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .comment-time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .comment-text {
                    font-size: 0.9rem;
                    color: var(--text);
                    margin-top: 4px;
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
                    .todos-container {
                        padding: 12px;
                    }

                    .todos-header {
                        flex-direction: column;
                        gap: 12px;
                        align-items: stretch;
                    }

                    .todos-actions {
                        flex-direction: column;
                    }

                    .kanban-board {
                        grid-template-columns: 1fr;
                        overflow-x: visible;
                    }

                    .kanban-column {
                        min-width: auto;
                    }

                }
            </style>
        `;
    }

    getKanbanColumns() {
        const columns = [
            { id: 'pending', title: '待處理', icon: 'clipboard' },
            { id: 'today', title: '今日執行', icon: 'fire' },
            { id: 'week', title: '本週規劃', icon: 'calendar' },
            { id: 'completed', title: '最近完成', icon: 'check' },
            { id: 'project', title: '轉為專案', icon: 'folder' }
        ];

        return columns.map(column => {
            const tasks = this.getTasksByColumn(column.id);
            const hasAddButton = ['pending', 'today', 'week'].includes(column.id);
            
            return `
                <div class="kanban-column" data-column="${column.id}">
                    <div class="column-header">
                        <div class="column-title">
                            ${column.title}
                            ${hasAddButton ? '<button class="add-btn" onclick="window.activeModule.showAddDialog(\'' + column.id + '\')">＋</button>' : ''}
                        </div>
                        <div class="column-count">${tasks.length}</div>
                    </div>
                    <div class="column-tasks" 
                         ondrop="window.activeModule.handleDrop(event, '${column.id}')"
                         ondragover="window.activeModule.handleDragOver(event)"
                         ondragleave="window.activeModule.handleDragLeave(event)">
                        ${tasks.map(task => this.getTaskCard(task)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    getTasksByColumn(columnId) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        let filtered = this.todos;

        // 根據欄位篩選
        switch (columnId) {
            case 'pending':
                return filtered.filter(task => 
                    task.status === 'pending' && 
                    (!task.dueDate || new Date(task.dueDate) > weekEnd)
                );
            
            case 'today':
                return filtered.filter(task => {
                    if (task.status !== 'pending') return false;
                    if (!task.dueDate) return false;
                    const due = new Date(task.dueDate);
                    return due.toDateString() === today.toDateString();
                });
            
            case 'week':
                return filtered.filter(task => {
                    if (task.status !== 'pending') return false;
                    if (!task.dueDate) return false;
                    const due = new Date(task.dueDate);
                    return due > today && due <= weekEnd;
                });
            
            case 'completed':
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return filtered.filter(task => 
                    task.status === 'completed' &&
                    new Date(task.completedAt) > thirtyDaysAgo
                );
            
            case 'project':
                return filtered.filter(task => task.status === 'project');
            
            default:
                return [];
        }
    }

    getTaskCard(task) {
        const isSelected = this.selectedTodos.has(task.id);
        const priorityStars = this.getPriorityStars(task.priority);
        const tagInfo = this.quickTags.find(t => t.id === task.tags?.[0]);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';
        const commentsCount = task.comments ? task.comments.length : 0;
        
        return `
            <div class="task-card ${isSelected ? 'selected' : ''} ${isOverdue ? 'overdue' : ''}" 
                 data-task-id="${task.id}"
                 draggable="true"
                 ondragstart="window.activeModule.handleDragStart(event, '${task.id}')"
                 ondragend="window.activeModule.handleDragEnd(event)"
                 onclick="window.activeModule.handleTaskCardClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox"
                       ${isSelected ? 'checked' : ''}
                       onchange="window.activeModule.toggleTaskSelection('${task.id}')"
                       onclick="event.stopPropagation()">
                
                <div class="task-content">
                    <div class="task-title">
                        ${task.title}
                        ${task.projectTag ? `<span class="project-tag">#${task.projectTag}</span>` : ''}
                        ${isOverdue ? `<span class="overdue-badge">逾期</span>` : ''}
                    </div>
                    
                    ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                    
                    <div class="task-meta">
                        ${task.priority > 0 ? `
                            <div class="task-priority" title="優先級: ${task.priority} 星">
                                ${priorityStars}
                            </div>
                        ` : ''}
                        
                        ${tagInfo ? `
                            <div class="task-tag" style="background: ${tagInfo.color}; color: white;">
                                ${tagInfo.name}
                            </div>
                        ` : ''}
                        
                        ${task.dueDate ? `
                            <div class="task-due ${isOverdue ? 'overdue' : ''}">
                                <svg width="12" height="12" viewBox="0 0 12 12">
                                    <rect x="1" y="2" width="10" height="9" rx="1" fill="none" stroke="currentColor"/>
                                    <path d="M3 0v3M9 0v3M1 4h10" stroke="currentColor"/>
                                </svg>
                                ${this.formatDate(task.dueDate)}
                            </div>
                        ` : ''}
                        
                        ${commentsCount > 0 ? `
                            <div class="task-comments" title="${commentsCount} 則留言">
                                <svg width="12" height="12" viewBox="0 0 12 12">
                                    <path d="M2 2h8a1 1 0 011 1v6a1 1 0 01-1 1H3l-1 2V3a1 1 0 011-1z" stroke="currentColor" fill="none"/>
                                </svg>
                                ${commentsCount}
                            </div>
                        ` : ''}
                        
                        ${task.assignedTo ? `
                            <div class="task-assignee" title="負責人: ${task.assignedTo}">
                                <svg width="12" height="12" viewBox="0 0 12 12">
                                    <circle cx="6" cy="4" r="2" stroke="currentColor" fill="none"/>
                                    <path d="M2 10c0-2.5 1.8-4 4-4s4 1.5 4 4" stroke="currentColor" fill="none"/>
                                </svg>
                                ${task.assignedTo}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="task-btn" onclick="window.activeModule.showTaskDetails('${task.id}'); event.stopPropagation();" title="查看詳情">
                        <svg width="14" height="14" viewBox="0 0 14 14">
                            <circle cx="7" cy="7" r="1" fill="currentColor"/>
                            <circle cx="7" cy="7" r="5" stroke="currentColor" fill="none"/>
                        </svg>
                    </button>
                    
                    <button class="task-btn" onclick="window.activeModule.editTask('${task.id}'); event.stopPropagation();" title="編輯">
                        <svg width="14" height="14" viewBox="0 0 14 14">
                            <path d="M10 2l2 2-7 7-3 1 1-3z" fill="none" stroke="currentColor"/>
                        </svg>
                    </button>
                    
                    ${task.status === 'pending' ? `
                        <button class="task-btn task-btn-complete" onclick="window.activeModule.completeTask('${task.id}'); event.stopPropagation();" title="完成任務">
                            <svg width="14" height="14" viewBox="0 0 14 14">
                                <path d="M2 7l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    ` : `
                        <button class="task-btn task-btn-reopen" onclick="window.activeModule.reopenTask('${task.id}'); event.stopPropagation();" title="重新開啟">
                            <svg width="14" height="14" viewBox="0 0 14 14">
                                <path d="M1 7l2-2m0 0l2 2m-2-2v6a2 2 0 002 2h6" stroke="currentColor" fill="none" stroke-width="1.5"/>
                            </svg>
                        </button>
                    `}
                    
                    <button class="task-btn task-btn-delete" onclick="window.activeModule.deleteTask('${task.id}'); event.stopPropagation();" title="刪除">
                        <svg width="14" height="14" viewBox="0 0 14 14">
                            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    getPriorityStars(priority) {
        let stars = '';
        for (let i = 1; i <= 3; i++) {
            stars += `<svg class="star ${i <= priority ? 'filled' : ''}" viewBox="0 0 12 12">
                        <path d="M6 0l2 4 4 0.5-3 3L10 12 6 10 2 12l1-4.5-3-3L4 4z"/>
                      </svg>`;
        }
        return stars;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    // 事件處理
    attachEventListeners() {
        // ESC 關閉對話框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDialog();
            }
        });
    }

    // 增強版新增任務對話框
    showAddDialog(columnId = null, prefillData = null) {
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="dialog enhanced-dialog">
                <div class="dialog-header">
                    <h3>${prefillData ? '編輯待辦事項' : '新增待辦事項'}</h3>
                    <button class="dialog-close" onclick="window.activeModule.closeDialog()">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                
                <div class="dialog-content">
                    <div class="form-row">
                        <div class="form-group form-group-full">
                            <label class="form-label">任務標題 <span class="required">*</span></label>
                            <input type="text" class="form-input" id="taskTitle" 
                                   placeholder="輸入清晰具體的任務標題"
                                   value="${prefillData?.title || ''}"
                                   maxlength="100">
                            <div class="form-hint">建議：使用動詞開頭，如「完成報價單」、「聯繫客戶」</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group form-group-full">
                            <label class="form-label">詳細描述</label>
                            <textarea class="form-textarea" id="taskDesc" 
                                      placeholder="補充說明、注意事項、相關連結等（選填）"
                                      rows="3">${prefillData?.description || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">優先級</label>
                            <div class="priority-selector" id="prioritySelector">
                                <svg class="priority-star" data-priority="1" onclick="window.activeModule.setPriority(1)" viewBox="0 0 24 24" width="28" height="28">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                                          stroke="currentColor" stroke-width="2" fill="none"/>
                                </svg>
                                <svg class="priority-star" data-priority="2" onclick="window.activeModule.setPriority(2)" viewBox="0 0 24 24" width="28" height="28">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                                          stroke="currentColor" stroke-width="2" fill="none"/>
                                </svg>
                                <svg class="priority-star" data-priority="3" onclick="window.activeModule.setPriority(3)" viewBox="0 0 24 24" width="28" height="28">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                                          stroke="currentColor" stroke-width="2" fill="none"/>
                                </svg>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">到期日期</label>
                            <input type="date" class="form-input" id="dueDate" 
                                   min="${new Date().toISOString().split('T')[0]}"
                                   value="${prefillData?.dueDate || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group form-group-full">
                            <label class="form-label">快速分類標籤</label>
                            <div class="tag-selector">
                                ${this.quickTags.map(tag => `
                                    <div class="tag-option ${prefillData?.tags?.includes(tag.id) ? 'selected' : ''}" 
                                         data-tag="${tag.id}" 
                                         onclick="window.activeModule.toggleTag('${tag.id}')"
                                         style="--tag-color: ${tag.color}">
                                        <span class="tag-name">${tag.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">專案識別標籤</label>
                            <input type="text" class="form-input" id="projectTag" 
                                   placeholder="例如：王小姐、ABC公司"
                                   value="${prefillData?.projectTag || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">指派對象</label>
                            <select class="form-select" id="assignedTo">
                                <option value="">指派給...</option>
                                <option value="自己" ${prefillData?.assignedTo === '自己' ? 'selected' : ''}>自己</option>
                                <option value="小美" ${prefillData?.assignedTo === '小美' ? 'selected' : ''}>小美</option>
                                <option value="小明" ${prefillData?.assignedTo === '小明' ? 'selected' : ''}>小明</option>
                                <option value="經理" ${prefillData?.assignedTo === '經理' ? 'selected' : ''}>經理</option>
                            </select>
                        </div>
                    </div>
                    
                    ${prefillData?.comments?.length > 0 ? `
                        <div class="form-row">
                            <div class="form-group form-group-full">
                                <label class="form-label">現有留言 (${prefillData.comments.length})</label>
                                <div class="existing-comments">
                                    ${prefillData.comments.map(comment => `
                                        <div class="comment-item">
                                            <div class="comment-time">${this.formatDateTime(comment.createdAt)}</div>
                                            <div class="comment-text">${comment.text}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="form-row">
                        <div class="form-group form-group-full">
                            <label class="form-label">新增留言</label>
                            <textarea class="form-textarea" id="newComment" 
                                      placeholder="記錄想法、進度更新、注意事項等"
                                      rows="2"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="dialog-actions">
                    <button class="btn btn-secondary" onclick="window.activeModule.closeDialog()">取消</button>
                    <button class="btn btn-primary" onclick="window.activeModule.saveTask()" id="saveTaskBtn">
                        <svg width="16" height="16" viewBox="0 0 16 16" style="margin-right: 4px;">
                            <path d="M2 8l3 3 7-7" stroke="currentColor" fill="none" stroke-width="2"/>
                        </svg>
                        ${prefillData ? '更新任務' : '建立任務'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.currentDialog = dialog;
        
        // 初始化狀態
        this.selectedPriority = prefillData?.priority || 0;
        this.selectedTag = prefillData?.tags?.[0] || null;
        this.editingTask = prefillData;
        this.addDialogColumnId = columnId; // 儲存欄位 ID 用於新增任務
        
        // 事件綁定
        this.attachDialogEvents(dialog);
        
        // 聚焦到標題輸入框
        setTimeout(() => {
            const titleInput = document.getElementById('taskTitle');
            if (titleInput) {
                titleInput.focus();
                if (prefillData) {
                    titleInput.setSelectionRange(0, titleInput.value.length);
                }
            }
        }, 100);
    }

    // 增強版設定優先級
    setPriority(level) {
        this.selectedPriority = level;
        const stars = document.querySelectorAll('.priority-star');
        stars.forEach(star => {
            const starLevel = parseInt(star.dataset.priority);
            if (starLevel <= level) {
                star.querySelector('path').setAttribute('fill', 'var(--primary)');
            } else {
                star.querySelector('path').setAttribute('fill', 'none');
            }
        });
    }

    // 增強版切換標籤
    toggleTag(tagId) {
        const element = document.querySelector(`[data-tag="${tagId}"]`);
        const titleInput = document.getElementById('taskTitle');
        const tag = this.quickTags.find(t => t.id === tagId);
        
        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            // 移除標籤文字
            const currentValue = titleInput.value;
            const tagText = `${tag.name}│`;
            if (currentValue.startsWith(tagText)) {
                titleInput.value = currentValue.substring(tagText.length).trim();
            }
        } else {
            // 先清除其他標籤
            document.querySelectorAll('.tag-option').forEach(t => {
                t.classList.remove('selected');
                // 移除舊標籤文字
                const oldTag = this.quickTags.find(qt => qt.id === t.dataset.tag);
                if (oldTag) {
                    const oldTagText = `${oldTag.name}│`;
                    if (titleInput.value.startsWith(oldTagText)) {
                        titleInput.value = titleInput.value.substring(oldTagText.length).trim();
                    }
                }
            });
            
            element.classList.add('selected');
            // 加入新標籤文字
            const tagText = `${tag.name}│`;
            if (!titleInput.value.startsWith(tagText)) {
                titleInput.value = tagText + titleInput.value;
            }
            
            // 設定游標位置到直線後面
            titleInput.focus();
            titleInput.setSelectionRange(tagText.length, tagText.length);
        }
    }

    // 儲存任務
    getStatusFromColumnId(columnId) {
        const statusMap = {
            'pending': 'pending',
            'today': 'pending',
            'week': 'pending',
            'completed': 'completed',
            'project': 'pending'
        };
        return statusMap[columnId] || 'pending';
    }

    async saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            this.showToast('請輸入任務標題', 'error');
            return;
        }
        
        const newTask = {
            id: Date.now().toString(),
            title,
            description: document.getElementById('taskDesc').value.trim(),
            priority: this.selectedPriority || 0,
            tags: this.selectedTag ? [this.selectedTag] : [],
            projectTag: document.getElementById('projectTag').value.replace('#', '').trim(),
            dueDate: document.getElementById('dueDate').value,
            status: this.getStatusFromColumnId(this.addDialogColumnId) || 'pending',
            createdAt: new Date().toISOString(),
            comments: []
        };
        
        this.todos.push(newTask);
        await this.saveData();
        
        this.closeDialog();
        this.render(this.currentUser.uuid);
        this.showToast('任務新增成功', 'success');
    }

    // 編輯任務
    editTask(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (!task) return;
        
        // 使用類似新增的對話框，但填入現有資料
        // 這裡簡化處理，實際可以重用 showAddDialog 並修改
        this.showEditDialog(task);
    }

    showEditDialog(task) {
        // 與 showAddDialog 類似，但預填資料
        // 省略具體實現，邏輯相同
    }

    // 完成任務
    async completeTask(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (task) {
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            task.updatedAt = new Date().toISOString();
            
            // 任務完成後可以在這裡添加其他同步邏輯
            
            await this.saveData();
            this.render(this.currentUser.uuid);
            this.showToast('任務已完成', 'success');
        }
    }

    // 刪除任務
    async deleteTask(taskId) {
        if (confirm('確定要刪除此任務嗎？')) {
            this.todos = this.todos.filter(t => t.id !== taskId);
            await this.saveData();
            this.render(this.currentUser.uuid);
            this.showToast('任務已刪除', 'success');
        }
    }

    // 任務選取
    toggleTaskSelection(taskId) {
        if (this.selectedTodos.has(taskId)) {
            this.selectedTodos.delete(taskId);
        } else {
            this.selectedTodos.add(taskId);
        }
        
        // 更新合併按鈕狀態
        const mergeBtn = document.querySelector('.btn-merge');
        if (mergeBtn) {
            if (this.selectedTodos.size >= 2) {
                mergeBtn.classList.remove('disabled');
                mergeBtn.disabled = false;
            } else {
                mergeBtn.classList.add('disabled');
                mergeBtn.disabled = true;
            }
        }
        
        // 更新卡片顯示
        const card = document.querySelector(`[data-task-id="${taskId}"]`);
        if (card) {
            card.classList.toggle('selected');
        }
    }

    // 拖曳功能
    handleDragStart(e, taskId) {
        this.draggedItem = taskId;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.column-tasks').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    async handleDrop(e, columnId) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (!this.draggedItem) return;
        
        const task = this.todos.find(t => t.id === this.draggedItem);
        if (!task) return;
        
        // 根據目標欄位更新任務狀態
        switch (columnId) {
            case 'pending':
                task.status = 'pending';
                task.dueDate = '';
                break;
            
            case 'today':
                task.status = 'pending';
                task.dueDate = new Date().toISOString().split('T')[0];
                break;
            
            case 'week':
                task.status = 'pending';
                const weekLater = new Date();
                weekLater.setDate(weekLater.getDate() + 3);
                task.dueDate = weekLater.toISOString().split('T')[0];
                break;
            
            case 'completed':
                task.status = 'completed';
                task.completedAt = new Date().toISOString();
                break;
            
            case 'project':
                task.status = 'project';
                break;
        }
        
        await this.saveData();
        this.render(this.currentUser.uuid);
        this.showToast('任務已移動', 'success');
    }

    // 合併成專案
    showMergeDialog() {
        if (this.selectedTodos.size < 2) return;
        
        const selectedTasks = Array.from(this.selectedTodos).map(id => 
            this.todos.find(t => t.id === id)
        );
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="dialog">
                <div class="dialog-header">合併成專案</div>
                
                <div class="form-group">
                    <label class="form-label">專案名稱</label>
                    <input type="text" class="form-input" id="projectName" 
                           placeholder="例如：王小姐曼谷團">
                </div>
                
                <div class="form-group">
                    <label class="form-label">選擇模板</label>
                    <select class="form-select" id="projectTemplate">
                        <option value="travel-basic">旅行社基礎模板</option>
                        <option value="travel-full">旅行社完整模板</option>
                        <option value="blank">空白專案</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">已選取的任務 (${selectedTasks.length}個)</label>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
                        ${selectedTasks.map(task => `
                            <div style="padding: 4px 0; color: var(--text-light);">
                                • ${task.title}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="dialog-actions">
                    <button class="btn" onclick="window.activeModule.closeDialog()">取消</button>
                    <button class="btn btn-primary" onclick="window.activeModule.createProject()">建立專案</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }

    async createProject() {
        const projectName = document.getElementById('projectName').value.trim();
        const templateId = document.getElementById('projectTemplate').value;
        
        if (!projectName) {
            this.showToast('請輸入專案名稱', 'error');
            return;
        }
        
        // 獲取選中的任務
        const selectedTasks = Array.from(this.selectedTodos).map(taskId => 
            this.todos.find(t => t.id === taskId)
        ).filter(task => task);
        
        // 生成專案編號
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const projectId = `P${dateStr}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        
        // 準備要傳遞給專案模組的資料
        const projectCreationData = {
            name: projectName,
            template: templateId,
            mergedTasks: selectedTasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                tags: task.tags,
                projectTag: task.projectTag,
                assignedTo: task.assignedTo,
                dueDate: task.dueDate,
                status: 'pending',
                createdAt: task.createdAt,
                comments: task.comments || []
            }))
        };
        
        // 嘗試將資料傳遞給專案模組
        try {
            await this.createProjectInProjectsModule(projectId, projectCreationData);
            
            // 標記選中的任務為已轉專案
            this.selectedTodos.forEach(taskId => {
                const task = this.todos.find(t => t.id === taskId);
                if (task) {
                    task.status = 'project';
                    task.projectId = projectId;
                    task.updatedAt = new Date().toISOString();
                }
            });
            
            await this.saveData();
            this.showToast(`專案「${projectName}」建立成功，已轉移 ${selectedTasks.length} 個任務`, 'success');
            
        } catch (error) {
            console.error('建立專案失敗:', error);
            this.showToast('專案建立失敗，請稍後重試', 'error');
            return;
        }
        
        this.selectedTodos.clear();
        this.closeDialog();
        this.render(this.currentUser.uuid);
    }
    
    // 新增方法：在專案模組中建立專案
    async createProjectInProjectsModule(projectId, projectData) {
        try {
            // 載入專案管理模組
            const projectModule = await import('./projects.js');
            const projectsManager = new projectModule.ProjectsModule();
            await projectsManager.render(this.currentUser.uuid);
            
            // 調用專案建立方法
            await projectsManager.createProjectFromTodos(projectId, projectData);
            
        } catch (error) {
            console.error('專案模組操作失敗:', error);
            throw error;
        }
    }

    // 篩選功能
    // 關閉對話框
    closeDialog() {
        const dialog = document.querySelector('.dialog-overlay');
        if (dialog) {
            dialog.remove();
        }
        
        // 清理臨時狀態
        this.selectedPriority = 0;
        this.selectedTag = null;
    }

    // Toast 提示
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

    // 新增方法：處理任務卡片點擊
    handleTaskCardClick(event, taskId) {
        // 如果點擊的是複選框或按鈕，不處理
        if (event.target.closest('.task-checkbox') || event.target.closest('.task-btn')) {
            return;
        }
        
        // Ctrl/Cmd + Click 多選
        if (event.ctrlKey || event.metaKey) {
            this.toggleTaskSelection(taskId);
            return;
        }
        
        // 單擊顯示任務詳情
        this.showTaskDetails(taskId);
    }
    
    // 顯示任務詳情
    showTaskDetails(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (!task) return;
        
        const tagInfo = this.quickTags.find(t => t.id === task.tags?.[0]);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="dialog task-details-dialog">
                <div class="dialog-header">
                    <h3>任務詳情</h3>
                    <button class="dialog-close" onclick="window.activeModule.closeDialog()">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                
                <div class="task-details-content">
                    <div class="task-header-info">
                        <h4 class="task-title-large">
                            ${task.title}
                            ${task.projectTag ? `<span class="project-tag">#${task.projectTag}</span>` : ''}
                            ${isOverdue ? `<span class="overdue-badge">逾期</span>` : ''}
                        </h4>
                        
                        <div class="task-meta-large">
                            <div class="meta-item">
                                <span class="meta-label">狀態：</span>
                                <span class="task-status status-${task.status}">${this.getStatusLabel(task.status)}</span>
                            </div>
                            
                            ${task.priority > 0 ? `
                                <div class="meta-item">
                                    <span class="meta-label">優先級：</span>
                                    <div class="priority-display">${this.getPriorityStars(task.priority)}</div>
                                </div>
                            ` : ''}
                            
                            ${tagInfo ? `
                                <div class="meta-item">
                                    <span class="meta-label">分類：</span>
                                    <span class="tag-large" style="background: ${tagInfo.color}; color: white;">
                                        ${tagInfo.icon} ${tagInfo.name}
                                    </span>
                                </div>
                            ` : ''}
                            
                            ${task.assignedTo ? `
                                <div class="meta-item">
                                    <span class="meta-label">負責人：</span>
                                    <span class="assignee-large">${task.assignedTo}</span>
                                </div>
                            ` : ''}
                            
                            ${task.dueDate ? `
                                <div class="meta-item">
                                    <span class="meta-label">到期日：</span>
                                    <span class="due-date-large ${isOverdue ? 'overdue' : ''}">${this.formatDate(task.dueDate)}</span>
                                </div>
                            ` : ''}
                            
                            <div class="meta-item">
                                <span class="meta-label">建立時間：</span>
                                <span class="created-time">${this.formatDateTime(task.createdAt)}</span>
                            </div>
                            
                            ${task.updatedAt && task.updatedAt !== task.createdAt ? `
                                <div class="meta-item">
                                    <span class="meta-label">最後更新：</span>
                                    <span class="updated-time">${this.formatDateTime(task.updatedAt)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${task.description ? `
                        <div class="task-description-section">
                            <h5>任務描述</h5>
                            <div class="task-description">${task.description}</div>
                        </div>
                    ` : ''}
                    
                    ${task.comments && task.comments.length > 0 ? `
                        <div class="task-comments-section">
                            <h5>留言記錄 (${task.comments.length})</h5>
                            <div class="comments-list">
                                ${task.comments.map(comment => `
                                    <div class="comment-item">
                                        <div class="comment-header">
                                            <span class="comment-author">${comment.author || '系統管理員'}</span>
                                            <span class="comment-time">${this.formatDateTime(comment.createdAt)}</span>
                                        </div>
                                        <div class="comment-text">${comment.text}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="dialog-actions">
                    <button class="btn btn-secondary" onclick="window.activeModule.closeDialog()">關閉</button>
                    <button class="btn" onclick="window.activeModule.editTask('${task.id}')">
                        <svg width="16" height="16" viewBox="0 0 16 16" style="margin-right: 4px;">
                            <path d="M10 2l2 2-7 7-3 1 1-3z" fill="none" stroke="currentColor"/>
                        </svg>
                        編輯任務
                    </button>
                    ${task.status === 'pending' ? `
                        <button class="btn btn-success" onclick="window.activeModule.completeTask('${task.id}')">
                            <svg width="16" height="16" viewBox="0 0 16 16" style="margin-right: 4px;">
                                <path d="M2 8l3 3 7-7" stroke="currentColor" fill="none" stroke-width="2"/>
                            </svg>
                            完成
                        </button>
                    ` : task.status === 'completed' ? `
                        <button class="btn" onclick="window.activeModule.reopenTask('${task.id}')">
                            <svg width="16" height="16" viewBox="0 0 16 16" style="margin-right: 4px;">
                                <path d="M1 8l2-2m0 0l2 2m-2-2v6a2 2 0 002 2h6" stroke="currentColor" fill="none" stroke-width="1.5"/>
                            </svg>
                            重新開啟
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.currentDialog = dialog;
        this.attachDialogEvents(dialog);
    }
    
    // 獲取狀態標籤
    getStatusLabel(status) {
        const labels = {
            'pending': '待處理',
            'in_progress': '進行中',
            'completed': '已完成',
            'project': '已轉專案',
            'cancelled': '已取消'
        };
        return labels[status] || status;
    }
    
    // 格式化日期時間
    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
    
    // 重新開啟任務
    async reopenTask(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (task) {
            task.status = 'pending';
            task.completedAt = null;
            task.updatedAt = new Date().toISOString();
            
            await this.saveData();
            this.closeDialog();
            this.refreshView();
            this.showToast('任務已重新開啟', 'success');
        }
    }
    
    // 編輯任務
    editTask(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (!task) {
            this.showToast('找不到任務', 'error');
            return;
        }
        
        // 關閉當前對話框
        this.closeDialog();
        
        // 顯示編輯對話框
        setTimeout(() => {
            this.showAddDialog(task);
        }, 100);
    }
    
    // 更新選取狀態 UI
    updateSelectionUI() {
        const selectedCount = this.selectedTodos.size;
        
        // 更新按鈕狀態
        const batchBtn = document.querySelector('.btn-batch');
        const mergeBtn = document.querySelector('.btn-merge');
        const clearBtn = document.querySelector('.btn-clear');
        const selectedCountEl = document.querySelector('.selected-count');
        
        if (batchBtn) {
            batchBtn.classList.toggle('disabled', selectedCount === 0);
            batchBtn.disabled = selectedCount === 0;
        }
        
        if (mergeBtn) {
            mergeBtn.classList.toggle('disabled', selectedCount < 2);
            mergeBtn.disabled = selectedCount < 2;
        }
        
        if (clearBtn) {
            clearBtn.classList.toggle('disabled', selectedCount === 0);
            clearBtn.disabled = selectedCount === 0;
        }
        
        if (selectedCountEl) {
            selectedCountEl.textContent = `已選取 ${selectedCount} 個`;
            selectedCountEl.style.display = selectedCount > 0 ? 'inline' : 'none';
        }
        
        // 更新卡片顯示
        document.querySelectorAll('.task-card').forEach(card => {
            const taskId = card.dataset.taskId;
            const checkbox = card.querySelector('.task-checkbox');
            
            if (this.selectedTodos.has(taskId)) {
                card.classList.add('selected');
                if (checkbox) checkbox.checked = true;
            } else {
                card.classList.remove('selected');
                if (checkbox) checkbox.checked = false;
            }
        });
    }
    
    // 清除選取
    clearSelection() {
        this.selectedTodos.clear();
        this.updateSelectionUI();
    }
    
    // 刷新視圖
    refreshView() {
        const moduleContainer = document.getElementById('moduleContainer');
        if (moduleContainer) {
            moduleContainer.innerHTML = this.getHTML();
            this.attachEventListeners();
        }
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
        
        // Enter 快速動作
        const inputs = dialog.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    if (input.id === 'taskTitle' && dialog.querySelector('#saveTaskBtn')) {
                        e.preventDefault();
                        this.saveTask();
                    }
                }
            });
        });
    }
    
    // 清理方法
    destroy() {
        // 清理選取狀態
        this.selectedTodos.clear();
        
        // 關閉對話框
        this.closeDialog();
        
        // 清理拖曳狀態
        this.draggedItem = null;
        
        // 清理狀態
        this.editingTask = null;
        this.currentDialog = null;
    }

    // SignageHost 按鈕方法：轉為專案
    convertToProject() {
        // TODO: 實現把選取的任務轉換為專案
        console.log('轉為專案功能待實現');
        
        // 可以在這裡實現：
        // 1. 檢查是否有選取的任務
        // 2. 顯示轉換為專案的對話框
        // 3. 讓使用者選擇現有專案或創建新專案
        // 4. 將選取的任務標記為屬於該專案
        
        // 暫時顯示提示
        alert('轉為專案功能開發中...');
    }
}

// ES6 模組匯出
export { TodosModule };