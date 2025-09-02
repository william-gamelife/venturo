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
    // 靜態資訊（必填）- 店家招牌
    static moduleInfo = {
        name: '待辦事項',
        subtitle: '智慧任務管理與專案追蹤',
        description: '支援四欄位看板管理、專案分組、批量操作及智慧篩選功能。專為旅行社業務流程設計，整合報價、行程、簡報等工作標籤。',
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
        this.currentFilter = 'all';
        this.draggedItem = null;
        this.availableUsers = []; // 可用的用戶列表
        this.quickTags = [
            { id: 'quote', name: '報價', icon: 'M3 3v4.5l11-7v4.5h7V3H3zm18 18v-4.5l-11 7v-4.5H3v2h18z', color: '#c9a961' },
            { id: 'schedule', name: '行程', icon: 'M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z M5 22h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2z', color: '#7a8b74' },
            { id: 'presentation', name: '簡報', icon: 'M3 3v18h18V3H3zm16 16H5V5h14v14zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z', color: '#6b8e9f' },
            { id: 'contract', name: '合約', icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z', color: '#d4a574' },
            { id: 'flight', name: '團務機票', icon: 'M12 2L13.09 8.26L22 9L14 14.74L16.18 22L12 18.82L7.82 22L10 14.74L2 9L10.91 8.26L12 2Z', color: '#b87d8b' },
            { id: 'hotel', name: '團務訂房', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 3v18M5 9h14M5 13h14', color: '#8b9dc3' },
            { id: 'transport', name: '團務訂車', icon: 'M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M5 17H3v-6l2-5h9l4 5v6h-2', color: '#a0c4a0' }
        ];
        
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
                    { id: 'contract', name: '合約類', icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z' },
                    { id: 'flight', name: '機票類', icon: 'M12 2L13.09 8.26L22 9L14 14.74L16.18 22L12 18.82L7.82 22L10 14.74L2 9L10.91 8.26L12 2Z' },
                    { id: 'hotel', name: '住宿類', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 3v18M5 9h14M5 13h14' },
                    { id: 'transport', name: '交通類', icon: 'M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M5 17H3v-6l2-5h9l4 5v6h-2' }
                ]
            },
            {
                id: 'travel-full',
                name: '旅行社完整模板',
                categories: [
                    { id: 'contract', name: '合約類', icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z' },
                    { id: 'flight', name: '機票類', icon: 'M12 2L13.09 8.26L22 9L14 14.74L16.18 22L12 18.82L7.82 22L10 14.74L2 9L10.91 8.26L12 2Z' },
                    { id: 'hotel', name: '住宿類', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 3v18M5 9h14M5 13h14' },
                    { id: 'transport', name: '交通類', icon: 'M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M5 17H3v-6l2-5h9l4 5v6h-2' },
                    { id: 'activity', name: '活動類', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
                    { id: 'meal', name: '餐飲類', icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' },
                    { id: 'insurance', name: '保險類', icon: 'M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z' },
                    { id: 'document', name: '文件類', icon: 'M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z' }
                ]
            },
            {
                id: 'blank',
                name: '空白專案',
                categories: [
                    { id: 'general', name: '一般任務', icon: '📝' }
                ]
            }
        ];
    }

    async render(uuid) {
        // ⭐ 必須：第一行設定 activeModule
        window.activeModule = this;
        
        this.currentUser = { uuid };
        
        // 動態載入管委會
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 載入資料
        await this.loadData();
        
        // 載入用戶列表
        await this.loadAvailableUsers();
        
        // 渲染介面
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 綁定事件
        this.attachEventListeners();

        // 更新招牌
        this.updateSignboard();
    }

    updateSignboard() {
        // 動態更新招牌內容
        const moduleInfo = {
            ...TodosModule.moduleInfo,
            stats: [
                { label: `${this.todos.length} 個任務`, highlight: false },
                ...(this.selectedTodos.size > 0 ? [{ label: `已選取 ${this.selectedTodos.size} 個`, highlight: true }] : [])
            ],
            categories: [
                { id: 'quote', label: '📋 報價', active: this.currentFilter === 'quote', onClick: 'window.activeModule.setFilter' },
                { id: 'schedule', label: '📅 行程', active: this.currentFilter === 'schedule', onClick: 'window.activeModule.setFilter' },
                { id: 'presentation', label: '📊 簡報', active: this.currentFilter === 'presentation', onClick: 'window.activeModule.setFilter' },
                { id: 'contract', label: '📄 合約', active: this.currentFilter === 'contract', onClick: 'window.activeModule.setFilter' },
                { id: 'flight', label: '✈️ 團務機票', active: this.currentFilter === 'flight', onClick: 'window.activeModule.setFilter' },
                { id: 'hotel', label: '🏨 團務訂房', active: this.currentFilter === 'hotel', onClick: 'window.activeModule.setFilter' },
                { id: 'transport', label: '🚌 團務訂車', active: this.currentFilter === 'transport', onClick: 'window.activeModule.setFilter' }
            ],
            filters: [
                { id: 'all', label: '全部', active: this.currentFilter === 'all', onClick: 'window.activeModule.setFilter' },
                { id: 'today', label: '今日', active: this.currentFilter === 'today', onClick: 'window.activeModule.setFilter' },
                { id: 'week', label: '本週', active: this.currentFilter === 'week', onClick: 'window.activeModule.setFilter' },
                { id: 'project', label: '專案', active: this.currentFilter === 'project', onClick: 'window.activeModule.setFilter' }
            ],
            actions: [
                { 
                    label: '新增任務', 
                    onClick: 'window.activeModule.showAddDialog', 
                    primary: true,
                    icon: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
                },
                { 
                    label: '批量操作', 
                    onClick: 'window.activeModule.showBatchActions', 
                    disabled: this.selectedTodos.size === 0 
                },
                { 
                    label: '合併專案', 
                    onClick: 'window.activeModule.showMergeDialog', 
                    disabled: this.selectedTodos.size < 2 
                },
                { 
                    label: '清除選取', 
                    onClick: 'window.activeModule.clearSelection', 
                    disabled: this.selectedTodos.size === 0 
                }
            ]
        };

        // 更新儀表板招牌
        if (typeof updateModuleSignboard === 'function') {
            updateModuleSignboard(moduleInfo);
        }
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

    async loadAvailableUsers() {
        try {
            // 直接從 Supabase 查詢用戶資料
            if (!this.syncManager.supabase) {
                console.warn('🚨 Supabase 未初始化，使用預設用戶');
                this.availableUsers = [
                    { uuid: 'self', display_name: '自己', role: 'user' },
                    { uuid: 'william', display_name: 'William', role: 'admin' },
                    { uuid: 'team', display_name: '團隊', role: 'user' }
                ];
                return;
            }

            // 查詢用戶資料表
            const { data, error } = await this.syncManager.supabase
                .from('user_data')
                .select('data')
                .eq('module', 'users');

            if (error) {
                console.error('載入用戶資料失敗:', error);
                this.availableUsers = [
                    { uuid: 'self', display_name: '自己', role: 'user' }
                ];
                return;
            }

            if (data && data.length > 0 && data[0].data) {
                // 提取用戶列表，只取顯示名稱和UUID
                this.availableUsers = data[0].data.map(user => ({
                    uuid: user.uuid,
                    display_name: user.display_name || user.username,
                    role: user.role || 'user'
                }));
                console.log('✅ 載入用戶列表:', this.availableUsers.length, '位');
            } else {
                console.warn('⚠️ 未找到用戶資料，使用預設選項');
                this.availableUsers = [
                    { uuid: 'self', display_name: '自己', role: 'user' }
                ];
            }
        } catch (error) {
            console.error('載入用戶資料異常:', error);
            this.availableUsers = [
                { uuid: 'self', display_name: '自己', role: 'user' }
            ];
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

                <!-- 四欄看板 -->
                <div class="kanban-board">
                    ${this.getMainColumns()}
                </div>

                <!-- 專案區域 -->
                <div class="projects-section">
                    <div class="projects-header">
                        <h3>專案</h3>
                        <span class="projects-count">${this.getProjectTasks().length} 個專案</span>
                    </div>
                    <div class="projects-grid">
                        ${this.getProjectTasks().map(task => this.getTaskCard(task)).join('')}
                        ${this.getProjectTasks().length === 0 ? '<div class="empty-projects">暫無專案</div>' : ''}
                    </div>
                </div>
            </div>

            <style>
                .todos-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }


                /* 看板欄位 */
                .kanban-board {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
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
                    gap: 8px;
                }

                .column-count {
                    background: var(--primary-light);
                    color: var(--primary-dark);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .add-task-btn {
                    width: 28px;
                    height: 28px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .add-task-btn:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }

                .empty-column {
                    text-align: center;
                    padding: 20px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    background: rgba(0,0,0,0.02);
                    border-radius: 8px;
                    border: 2px dashed var(--border);
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

                /* 專案區域 */
                .projects-section {
                    background: var(--card);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow);
                }

                .projects-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid var(--border);
                }

                .projects-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--text);
                }

                .projects-count {
                    background: var(--accent-light);
                    color: var(--accent);
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .projects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 12px;
                }

                .empty-projects {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    background: rgba(0,0,0,0.02);
                    border-radius: 8px;
                    border: 2px dashed var(--border);
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
                    width: 14px;
                    height: 14px;
                    display: inline-block;
                    transition: all 0.2s ease;
                }

                .star.filled {
                    color: #f39c12;
                    filter: drop-shadow(0 1px 2px rgba(243, 156, 18, 0.3));
                }

                .star.hollow {
                    color: var(--border);
                }

                .star.hollow:hover {
                    color: #f39c12;
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
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .priority-star {
                    min-width: 80px;
                    padding: 12px;
                    border: 2px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s;
                    background: var(--card);
                }

                .priority-star:hover {
                    background: var(--bg-dark);
                    border-color: var(--primary);
                    transform: translateY(-1px);
                }

                .priority-star.selected {
                    background: var(--primary-light);
                    border-color: var(--primary);
                    box-shadow: 0 2px 8px rgba(201, 169, 97, 0.2);
                }

                .star-display {
                    display: flex;
                    gap: 2px;
                }

                .priority-none {
                    font-size: 0.9rem;
                    color: var(--text-light);
                    font-weight: 500;
                }

                .priority-label {
                    font-size: 0.8rem;
                    color: var(--text-light);
                    font-weight: 500;
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

                .toast.info {
                    background: #3498db;
                }

                /* 手機版響應式 */
                @media (max-width: 768px) {
                    .kanban-board {
                        grid-template-columns: 1fr;
                        overflow-x: visible;
                    }

                    .kanban-column {
                        min-width: auto;
                    }

                    .projects-section {
                        padding: 16px;
                    }

                    .projects-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    }

    getMainColumns() {
        const columns = [
            { id: 'pending', title: '待整理' },
            { id: 'today', title: '今日執行' },
            { id: 'week', title: '代辦事項' },
            { id: 'completed', title: '完成' }
        ];

        return columns.map(column => {
            const tasks = this.getTasksByColumn(column.id);
            
            return `
                <div class="kanban-column" data-column="${column.id}">
                    <div class="column-header">
                        <div class="column-title">${column.title}</div>
                        <div class="column-count">${tasks.length}</div>
                        <button class="add-task-btn" onclick="window.activeModule.showAddDialogForColumn('${column.id}')" title="新增任務">
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="column-tasks" 
                         ondrop="window.activeModule.handleDrop(event, '${column.id}')"
                         ondragover="window.activeModule.handleDragOver(event)"
                         ondragleave="window.activeModule.handleDragLeave(event)">
                        ${tasks.map(task => this.getTaskCard(task)).join('')}
                        ${tasks.length === 0 ? `<div class="empty-column">暫無${column.title}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getProjectTasks() {
        let filtered = this.todos;

        // 先套用標籤篩選
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(task => task.tags && task.tags.includes(this.currentFilter));
        }

        return filtered.filter(task => task.status === 'project');
    }

    getTasksByColumn(columnId) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        let filtered = this.todos;

        // 先套用標籤篩選
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(task => task.tags && task.tags.includes(this.currentFilter));
        }

        // 再根據欄位篩選
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
                                <svg class="tag-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="${tagInfo.icon}"/></svg>
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
            const isFilled = i <= priority;
            stars += `<svg class="star ${isFilled ? 'filled' : 'hollow'}" viewBox="0 0 24 24" width="14" height="14">
                        ${isFilled ? 
                            `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>` :
                            `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.5"/>`
                        }
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

    // 針對特定欄位的新增任務對話框
    showAddDialogForColumn(columnId) {
        const prefillData = {
            status: 'pending'
        };

        // 根據欄位預設適當的到期日期
        const today = new Date();
        switch (columnId) {
            case 'today':
                prefillData.dueDate = today.toISOString().split('T')[0];
                break;
            case 'week':
                const threeDaysLater = new Date(today);
                threeDaysLater.setDate(today.getDate() + 3);
                prefillData.dueDate = threeDaysLater.toISOString().split('T')[0];
                break;
            case 'completed':
                prefillData.status = 'completed';
                prefillData.completedAt = today.toISOString();
                break;
        }

        this.showAddDialog(prefillData);
    }

    // 增強版新增任務對話框
    showAddDialog(prefillData = null) {
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="dialog enhanced-dialog">
                <div class="dialog-header">
                    <h3>${prefillData ? '編輯待辦事項' : '新增待辦事項'}</h3>
                    <button class="dialog-close" onclick="window.activeModule.closeDialog()">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2"/>
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
                            <label class="form-label">優先級設定</label>
                            <div class="priority-selector">
                                <div class="priority-star ${(prefillData?.priority || 0) === 0 ? 'selected' : ''}" 
                                     data-priority="0" 
                                     onclick="window.activeModule.setPriority(0)">
                                    <span class="priority-none">無</span>
                                </div>
                                ${[1,2,3].map(i => `
                                    <div class="priority-star ${(prefillData?.priority || 0) >= i ? 'selected' : ''}" 
                                         data-priority="${i}" 
                                         onclick="window.activeModule.setPriority(${i})"
                                         title="${['', '低優先級', '中優先級', '高優先級'][i]}">
                                        <div class="star-display">
                                            ${Array.from({length: 3}, (_, index) => {
                                                const starIndex = index + 1;
                                                const isFilled = starIndex <= i;
                                                return `<svg class="star ${isFilled ? 'filled' : 'hollow'}" viewBox="0 0 24 24" width="16" height="16">
                                                    ${isFilled ? 
                                                        `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>` :
                                                        `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.5"/>`
                                                    }
                                                </svg>`;
                                            }).join('')}
                                        </div>
                                        <span class="priority-label">${['', '低', '中', '高'][i]}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">到期日期</label>
                            <input type="date" class="form-input" id="dueDate" 
                                   min="${new Date().toISOString().split('T')[0]}"
                                   value="${prefillData?.dueDate || ''}">
                            <div class="form-hint">不設定表示無截止日期</div>
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
                                        <svg class="tag-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="${tag.icon}"/></svg>
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
                            <div class="form-hint">用於將相關任務歸類到同一專案</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">指派對象</label>
                            <select class="form-select" id="assignedTo">
                                <option value="">請選擇指派對象...</option>
                                ${this.availableUsers.map(user => `
                                    <option value="${user.display_name}" ${prefillData?.assignedTo === user.display_name ? 'selected' : ''}>
                                        ${user.role === 'admin' ? '👑' : '👤'} ${user.display_name}
                                    </option>
                                `).join('')}
                            </select>
                            <div class="form-hint">可指派給團隊中的任何成員</div>
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
        document.querySelectorAll('.priority-star').forEach(star => {
            const priority = parseInt(star.dataset.priority);
            star.classList.remove('selected');
            if (priority === level) {
                star.classList.add('selected');
            }
        });
    }

    // 增強版切換標籤
    toggleTag(tagId) {
        const element = document.querySelector(`[data-tag="${tagId}"]`);
        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            this.selectedTag = null;
        } else {
            document.querySelectorAll('.tag-option').forEach(t => t.classList.remove('selected'));
            element.classList.add('selected');
            this.selectedTag = tagId;
        }
    }

    // 自動分類功能
    autoClassifyTask(title, description) {
        const text = (title + ' ' + (description || '')).toLowerCase();
        
        // 分類關鍵詞映射
        const classificationRules = {
            'quote': ['報價', '詢價', '價格', '費用', '成本', '預算', '估價', '價單'],
            'schedule': ['行程', '排程', '時間', '日期', '安排', '預約', '會議', '約定'],
            'presentation': ['簡報', '提案', '展示', 'ppt', 'powerpoint', '說明會', '發表'],
            'contract': ['合約', '契約', '簽約', '協議', '條約', '合同', '法律', '簽署'],
            'flight': ['機票', '航班', '飛機', '登機', '起飛', '降落', '航空', '機位'],
            'hotel': ['訂房', '飯店', '酒店', '住宿', '房間', 'hotel', '旅館', '民宿'],
            'transport': ['訂車', '交通', '巴士', '遊覽車', '司機', '接送', '租車', '車輛']
        };
        
        // 檢查每個分類
        for (const [category, keywords] of Object.entries(classificationRules)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        
        return null; // 無法自動分類
    }

    // 儲存任務
    async saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            this.showToast('請輸入任務標題', 'error');
            return;
        }
        
        const description = document.getElementById('taskDesc').value.trim();
        
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            priority: this.selectedPriority || 0,
            tags: this.selectedTag ? [this.selectedTag] : [],
            projectTag: document.getElementById('projectTag').value.replace('#', '').trim(),
            assignedTo: document.getElementById('assignedTo').value.trim(),
            dueDate: document.getElementById('dueDate').value,
            status: 'pending',
            createdAt: new Date().toISOString(),
            comments: []
        };
        
        // 如果沒有手動選擇標籤，自動分類
        if (!this.selectedTag) {
            const autoCategory = this.autoClassifyTask(title, description);
            if (autoCategory) {
                newTask.tags = [autoCategory];
                this.showToast(`已自動分類為：${this.quickTags.find(t => t.id === autoCategory)?.name}`, 'info');
            }
        }
        
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
        if (!projectName) {
            this.showToast('請輸入專案名稱', 'error');
            return;
        }
        
        // 準備專案資料
        const projectData = {
            name: projectName,
            template: document.getElementById('projectTemplate').value,
            tasks: Array.from(this.selectedTodos),
            createdAt: new Date().toISOString()
        };
        
        // 標記選中的任務為已轉專案
        this.selectedTodos.forEach(taskId => {
            const task = this.todos.find(t => t.id === taskId);
            if (task) {
                task.status = 'project';
                task.projectId = Date.now().toString();
            }
        });
        
        await this.saveData();
        
        // 切換到專案模組（如果有的話）
        // 這裡需要與專案模組協作
        this.showToast(`專案「${projectName}」建立成功`, 'success');
        
        this.selectedTodos.clear();
        this.closeDialog();
        this.render(this.currentUser.uuid);
    }

    // 篩選功能
    setFilter(filter) {
        this.currentFilter = filter;
        this.render(this.currentUser.uuid);
    }

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
                            標記完成
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
}

// ES6 模組匯出
export { TodosModule };