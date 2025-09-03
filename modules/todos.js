/**
 * 待辦事項管理系統 - 看板式管理
 * 符合 building-manual 規範
 * 
 * 核心功能：
 * 1. 五欄看板系統（尚未整理、進行中、等待確認、專案打包、完成）
 * 2. 自由拖曳任務卡片
 * 3. 快速分類標籤
 * 4. 任務卡片管理
 */

class TodosModule {
    // SignageHost 招牌資料
    static signage = {
        title: '待辦事項',
        subtitle: '看板式任務管理',
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 11l3 3L20 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        actions: [
            { id: 'addTask', label: '新增任務', kind: 'primary', onClick: 'showAddDialog' }
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
        this.searchTerm = '';
        this.filteredTodos = [];
        
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
        
        // 快速分類標籤
        this.quickTags = [
            { id: 'quote', name: '報價', color: '#007bff' },
            { id: 'itinerary', name: '行程', color: '#28a745' },
            { id: 'presentation', name: '簡報', color: '#ffc107' },
            { id: 'contract', name: '合約', color: '#dc3545' },
            { id: 'group-flight', name: '團務機票', color: '#6f42c1' },
            { id: 'group-hotel', name: '團務訂房', color: '#fd7e14' },
            { id: 'group-transport', name: '團務訂車', color: '#20c997' }
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
                <!-- 看板欄位 -->
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
                    background: linear-gradient(135deg, #faf9f6 0%, #f5f3ee 100%);
                }

                /* 看板佈局 */
                .kanban-board {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 24px;
                    overflow-x: auto;
                    padding: 0 32px 32px 32px;
                    min-height: 500px;
                }

                /* 空狀態 */
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-light);
                }

                .empty-icon {
                    margin-bottom: 16px;
                }

                .empty-text {
                    font-size: 18px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .empty-hint {
                    font-size: 14px;
                    opacity: 0.7;
                }

                /* 任務卡片 */
                .task-card {
                    background: linear-gradient(145deg, #ffffff 0%, #fefefe 100%);
                    border: none;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: grab;
                    position: relative;
                    box-shadow: 0 4px 20px rgba(45, 55, 72, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                }

                .task-card:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 12px 32px rgba(45, 55, 72, 0.15);
                    border-color: rgba(201, 169, 97, 0.4);
                    background: linear-gradient(145deg, #ffffff 0%, #fffefe 100%);
                }

                .task-card.completed {
                    opacity: 0.6;
                    background: var(--bg);
                }

                .task-card.completed .task-title {
                    text-decoration: line-through;
                }

                .task-main {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    flex: 1;
                }

                .task-checkbox {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--border);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .task-checkbox:hover {
                    border-color: var(--primary);
                }

                .task-card.completed .task-checkbox {
                    background: var(--primary);
                    border-color: var(--primary);
                }

                .task-content {
                    flex: 1;
                }

                .task-title {
                    font-weight: 700;
                    color: #2d3748;
                    line-height: 1.3;
                    margin-bottom: 8px;
                    font-size: 15px;
                    letter-spacing: -0.2px;
                }

                .task-description {
                    font-size: 13px;
                    color: #718096;
                    line-height: 1.5;
                    margin-bottom: 12px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    font-weight: 400;
                }

                .task-tags {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                    margin-bottom: 8px;
                }

                .task-tag {
                    font-size: 11px;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    letter-spacing: 0.2px;
                }

                .task-due-date {
                    font-size: 11px;
                    color: var(--text-light);
                    margin-top: 4px;
                }

                .task-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .task-card:hover .task-actions {
                    opacity: 1;
                }

                .task-action-btn {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: var(--bg);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-light);
                    transition: all 0.2s;
                }

                .task-action-btn:hover {
                    background: var(--border);
                }

                .task-action-btn.delete:hover {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .kanban-column {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    min-width: 280px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 16px 40px rgba(45, 55, 72, 0.08);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .kanban-column:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 24px 60px rgba(45, 55, 72, 0.12);
                    border-color: rgba(201, 169, 97, 0.3);
                }

                .column-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid rgba(201, 169, 97, 0.15);
                    background: linear-gradient(90deg, transparent 0%, rgba(201, 169, 97, 0.03) 50%, transparent 100%);
                    border-radius: 8px;
                    padding: 0 8px 20px 8px;
                }

                .column-title {
                    font-weight: 800;
                    color: #2d3748;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    font-size: 17px;
                    letter-spacing: -0.3px;
                }


                .add-task-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: linear-gradient(135deg, #c9a961 0%, #b8975a 100%);
                    color: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: 700;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
                }

                .add-task-btn:hover {
                    background: linear-gradient(135deg, #b8975a 0%, #a68650 100%);
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 8px 24px rgba(201, 169, 97, 0.4);
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
                    background: linear-gradient(135deg, rgba(201, 169, 97, 0.15) 0%, rgba(201, 169, 97, 0.2) 100%);
                    color: #c9a961;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 800;
                    border: 2px solid rgba(201, 169, 97, 0.1);
                    min-width: 28px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(201, 169, 97, 0.2);
                    letter-spacing: 0.5px;
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

                .task-card.completed {
                    background: rgba(40, 167, 69, 0.1);
                    border-color: #28a745;
                }

                .task-card.completed .task-title {
                    color: #28a745;
                }

                .task-card.selected {
                    border-color: var(--primary);
                    background: var(--primary-light);
                }

                .task-card.dragging {
                    opacity: 0.5;
                    transform: rotate(2deg);
                }

                .task-content {
                    margin-left: 12px;
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
                    align-items: center;
                }

                .task-tag {
                    padding: 2px 8px;
                    background: var(--bg);
                    border-radius: 4px;
                    font-size: 0.75rem;
                    color: var(--text-light);
                    height: 18px; /* 統一高度 */
                    display: flex;
                    align-items: center;
                    line-height: 1;
                }

                .task-priority {
                    display: flex;
                    gap: 2px;
                    align-items: center;
                    height: 18px; /* 固定高度確保對齊 */
                    font-size: 0.75rem; /* 統一字體大小 */
                }

                .star {
                    width: 12px;
                    height: 12px;
                    fill: var(--border);
                    flex-shrink: 0; /* 防止壓縮 */
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
                    height: 18px; /* 與優先級相同的固定高度 */
                    line-height: 1; /* 確保行高一致 */
                }

                .task-due svg {
                    flex-shrink: 0; /* 防止 SVG 被壓縮 */
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

                .task-btn-complete:hover {
                    background: rgba(40, 167, 69, 0.1);
                    border-color: #28a745;
                    color: #28a745;
                }

                .task-btn-reopen:hover {
                    background: rgba(255, 193, 7, 0.1);
                    border-color: #ffc107;
                    color: #ffc107;
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

                .enhanced-dialog {
                    max-width: 600px;
                    width: 95%;
                }

                .dialog-content {
                    padding: 0;
                }

                .form-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .form-group-full {
                    flex: 1;
                }

                .form-hint {
                    font-size: 0.8rem;
                    color: var(--text-light);
                    margin-top: 4px;
                    opacity: 0.7;
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
                    height: 40px; /* 明確設定高度 */
                    box-sizing: border-box;
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
                    align-items: center;
                    justify-content: center;
                    height: 40px; /* 與 form-input 相同高度 */
                    box-sizing: border-box;
                    padding: 8px 12px; /* 與 form-input 相同內距 */
                    border: 1px solid transparent; /* 與 input 邊框對齊 */
                    border-radius: 8px;
                    min-width: 120px;
                }

                .priority-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 2px solid var(--border);
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    pointer-events: auto;
                    z-index: 10;
                }

                .priority-dot:hover {
                    border-color: var(--primary);
                    transform: scale(1.1);
                }

                .priority-dot.active {
                    background: var(--primary);
                    border-color: var(--primary);
                }
                
                .form-row-centered {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                    align-items: stretch; /* 讓兩邊高度一致 */
                    justify-content: center;
                }

                .form-group-center {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 0 0 auto;
                    min-width: 150px;
                }

                .priority-star {
                    cursor: pointer;
                    transition: all 0.2s;
                    fill: var(--border);
                    stroke: var(--border);
                    pointer-events: auto;
                    z-index: 10;
                }

                .priority-star:hover {
                    fill: var(--primary);
                    stroke: var(--primary);
                    transform: scale(1.1);
                }

                .priority-star.active {
                    fill: var(--primary);
                    stroke: var(--primary);
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

                /* 平板響應式 - 三欄 */
                @media (max-width: 1200px) {
                    .kanban-board {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                    }
                }

                /* 小平板響應式 - 兩欄 */
                @media (max-width: 900px) {
                    .kanban-board {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }
                }

                /* 手機版響應式 - 單欄 */
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

                    /* 手機版任務卡片展開功能 */
                    .task-card.expanded {
                        background: var(--card-bg-hover, var(--sidebar-hover, rgba(201, 169, 97, 0.05)));
                        transform: none;
                        box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
                    }
                    
                    .task-expanded-content {
                        display: none;
                        padding: 12px 0 0;
                        border-top: 1px solid var(--border-light, var(--border, rgba(201, 169, 97, 0.2)));
                        margin-top: 12px;
                        animation: expandIn 0.3s ease-out;
                    }
                    
                    .task-card.expanded .task-expanded-content {
                        display: block;
                    }
                    
                    .expanded-section {
                        margin-bottom: 12px;
                    }
                    
                    .expanded-section:last-child {
                        margin-bottom: 0;
                    }
                    
                    .expanded-label {
                        font-size: 11px;
                        font-weight: 600;
                        color: var(--text-light);
                        margin-bottom: 4px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .expanded-value {
                        font-size: 13px;
                        color: var(--text);
                        line-height: 1.4;
                    }
                    
                    .expanded-actions {
                        display: flex;
                        gap: 8px;
                        margin-top: 8px;
                        flex-wrap: wrap;
                    }
                    
                    .expanded-btn {
                        flex: 1;
                        min-width: 60px;
                        padding: 6px 12px;
                        background: var(--bg);
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        color: var(--text);
                        font-size: 11px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 4px;
                    }
                    
                    .expanded-btn:hover {
                        background: var(--primary);
                        color: white;
                        border-color: var(--primary);
                    }
                    
                    .expanded-btn.danger {
                        color: var(--error, #dc3545);
                        border-color: var(--border-error, rgba(220, 53, 69, 0.3));
                    }
                    
                    .expanded-btn.danger:hover {
                        background: var(--error, #dc3545);
                        color: var(--text-inverse, white);
                        border-color: var(--error, #dc3545);
                    }
                    
                    .expanded-btn.success {
                        color: var(--success, #28a745);
                        border-color: var(--border-success, rgba(40, 167, 69, 0.3));
                    }
                    
                    .expanded-btn.success:hover {
                        background: var(--success, #28a745);
                        color: var(--text-inverse, white);
                        border-color: var(--success, #28a745);
                    }
                    
                    @keyframes expandIn {
                        from {
                            opacity: 0;
                            max-height: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            max-height: 300px;
                            transform: translateY(0);
                        }
                    }

                }
            </style>
        `;
    }

    getKanbanColumns() {
        const columns = [
            { id: 'unorganized', title: '尚未整理', icon: '' },
            { id: 'in-progress', title: '進行中', icon: '' },
            { id: 'waiting', title: '等待確認', icon: '' },
            { id: 'project', title: '專案打包', icon: '' },
            { id: 'completed', title: '完成', icon: '' }
        ];

        return columns.map(column => {
            const tasks = this.getTasksByStatus(column.id);
            
            return `
                <div class="kanban-column" data-column="${column.id}">
                    <div class="column-header">
                        <div class="column-title">
                            ${column.title}
                            <button class="add-task-btn" onclick="window.activeModule.showAddDialog('${column.id}')" title="新增任務">+</button>
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

    getTasksByStatus(status) {
        return this.todos.filter(todo => todo.status === status);
    }

    getTaskCard(todo) {
        const tagColors = {
            '報價': '#3b82f6',
            '行程': '#10b981', 
            '簡報': '#f59e0b',
            '合約': '#ef4444',
            '機票': '#8b5cf6',
            '訂房': '#06b6d4',
            '訂車': '#84cc16'
        };

        return `
            <div class="task-card" 
                 data-task-id="${todo.id}"
                 draggable="true"
                 ondragstart="window.activeModule.handleDragStart(event, '${todo.id}')">
                
                <div class="task-content">
                    <div class="task-title">${todo.title}</div>
                    ${todo.description ? `<div class="task-description">${todo.description}</div>` : ''}
                    ${todo.category ? `<div class="task-tags">
                        <span class="task-tag" style="background: ${tagColors[todo.category] || '#6b7280'}">${todo.category}</span>
                    </div>` : ''}
                    ${todo.dueDate ? `<div class="task-due-date">${new Date(todo.dueDate).toLocaleDateString('zh-TW')}</div>` : ''}
                </div>

                <div class="task-actions">
                    <button class="task-action-btn" onclick="window.activeModule.editTask('${todo.id}')" title="編輯">
                        <svg viewBox="0 0 24 24" width="12" height="12">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="m18.5 2.5-1 1L22 8l1-1-1-4.5zM17 4l4 4L10 19H6v-4L17 4z" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="task-action-btn delete" onclick="window.activeModule.deleteTask('${todo.id}')" title="刪除">
                        <svg viewBox="0 0 24 24" width="12" height="12">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
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
                    return task.status === 'pending';
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
        const isOverdue = false; // 關閉過期檢查功能
        const commentsCount = task.comments ? task.comments.length : 0;
        
        return `
            <div class="task-card ${isSelected ? 'selected' : ''} ${task.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" 
                 data-task-id="${task.id}"
                 draggable="true"
                 ondragstart="window.activeModule.handleDragStart(event, '${task.id}')"
                 ondragend="window.activeModule.handleDragEnd(event)"
                 onclick="window.activeModule.handleTaskCardClick(event, '${task.id}')"
                 ondblclick="window.activeModule.editTask('${task.id}')">
                
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
                
                <!-- 手機版展開內容 -->
                <div class="task-expanded-content">
                    ${task.description ? `
                        <div class="expanded-section">
                            <div class="expanded-label">描述</div>
                            <div class="expanded-value">${task.description}</div>
                        </div>
                    ` : ''}
                    
                    ${task.dueDate ? `
                        <div class="expanded-section">
                            <div class="expanded-label">截止日期</div>
                            <div class="expanded-value">${this.formatDate(task.dueDate)}</div>
                        </div>
                    ` : ''}
                    
                    <div class="expanded-section">
                        <div class="expanded-label">狀態</div>
                        <div class="expanded-value">${this.getStatusLabel(task.status)}</div>
                    </div>
                    
                    ${task.tags && task.tags.length > 0 ? `
                        <div class="expanded-section">
                            <div class="expanded-label">標籤</div>
                            <div class="expanded-value">
                                ${task.tags.map(tagId => {
                                    const tag = this.quickTags.find(t => t.id === tagId);
                                    return tag ? `<span style="color: ${tag.color}">#${tag.name}</span>` : '';
                                }).filter(Boolean).join(' ')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${task.assignedTo ? `
                        <div class="expanded-section">
                            <div class="expanded-label">負責人</div>
                            <div class="expanded-value">${task.assignedTo}</div>
                        </div>
                    ` : ''}
                    
                    <div class="expanded-actions">
                        <button class="expanded-btn" onclick="window.activeModule.editTask('${task.id}'); event.stopPropagation();">
                            <svg width="12" height="12" viewBox="0 0 14 14">
                                <path d="M10 2l2 2-7 7-3 1 1-3z" fill="none" stroke="currentColor"/>
                            </svg>
                            編輯
                        </button>
                        
                        ${task.status === 'pending' ? `
                            <button class="expanded-btn success" onclick="window.activeModule.completeTask('${task.id}'); event.stopPropagation();">
                                <svg width="12" height="12" viewBox="0 0 14 14">
                                    <path d="M2 7l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                完成
                            </button>
                        ` : `
                            <button class="expanded-btn" onclick="window.activeModule.reopenTask('${task.id}'); event.stopPropagation();">
                                <svg width="12" height="12" viewBox="0 0 14 14">
                                    <path d="M1 7l2-2m0 0l2 2m-2-2v6a2 2 0 002 2h6" stroke="currentColor" fill="none" stroke-width="1.5"/>
                                </svg>
                                重開
                            </button>
                        `}
                        
                        <button class="expanded-btn danger" onclick="window.activeModule.deleteTask('${task.id}'); event.stopPropagation();">
                            <svg width="12" height="12" viewBox="0 0 14 14">
                                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            刪除
                        </button>
                    </div>
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
                                   placeholder="輸入任務標題"
                                   value="${prefillData?.title || ''}"
                                   maxlength="100">
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
                    
                    <div class="form-row form-row-centered">
                        <div class="form-group form-group-center">
                            <div class="priority-selector" id="prioritySelector">
                                <div class="priority-dot" data-priority="1" 
                                     onclick="event.stopPropagation(); window.activeModule.setPriority(1);"
                                     style="cursor: pointer; pointer-events: auto; z-index: 10; position: relative;"></div>
                                <div class="priority-dot" data-priority="2"
                                     onclick="event.stopPropagation(); window.activeModule.setPriority(2);"
                                     style="cursor: pointer; pointer-events: auto; z-index: 10; position: relative;"></div>
                                <div class="priority-dot" data-priority="3"
                                     onclick="event.stopPropagation(); window.activeModule.setPriority(3);"
                                     style="cursor: pointer; pointer-events: auto; z-index: 10; position: relative;"></div>
                            </div>
                        </div>
                        
                        <div class="form-group form-group-center" style="min-width: 160px;">
                            <input type="date" class="form-input" id="dueDate" 
                                   value="${prefillData?.dueDate || ''}" style="text-align: center;">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group form-group-full">
                            <label class="form-label">詳細描述</label>
                            <textarea class="form-textarea" id="taskDesc" 
                                      placeholder="詳細描述（選填）"
                                      rows="3">${prefillData?.description || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group form-group-full">
                            <label class="form-label">專案識別標籤</label>
                            <input type="text" class="form-input" id="projectTag" 
                                   placeholder="例如：王小姐、ABC公司"
                                   value="${prefillData?.projectTag || ''}">
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
        
        // 初始化優先級顯示
        setTimeout(() => {
            if (this.selectedPriority > 0) {
                this.setPriority(this.selectedPriority);
            }
        }, 50);
        
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
        // 如果點擊已選中的優先級，則取消選擇
        if (this.selectedPriority === level) {
            this.selectedPriority = 0;
        } else {
            this.selectedPriority = level;
        }
        
        // 更新原點樣式
        const dots = document.querySelectorAll('.priority-dot');
        dots.forEach(dot => {
            const dotLevel = parseInt(dot.dataset.priority);
            if (dotLevel <= this.selectedPriority) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // 兼容星星樣式（如果存在）
        const stars = document.querySelectorAll('.priority-star');
        stars.forEach(star => {
            const starLevel = parseInt(star.dataset.priority);
            if (starLevel <= this.selectedPriority) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
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
        // 直接返回欄位ID作為狀態，因為新設計中狀態名稱與欄位ID一致
        return columnId || 'unorganized';
    }

    async saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            this.showToast('請輸入任務標題', 'error');
            return;
        }
        
        if (this.editingTask) {
            // 編輯模式：更新現有任務
            const taskIndex = this.todos.findIndex(t => t.id === this.editingTask.id);
            if (taskIndex !== -1) {
                this.todos[taskIndex] = {
                    ...this.todos[taskIndex],
                    title,
                    description: document.getElementById('taskDesc').value.trim(),
                    priority: this.selectedPriority || 0,
                    tags: this.selectedTag ? [this.selectedTag] : [],
                    projectTag: document.getElementById('projectTag').value.replace('#', '').trim(),
                    dueDate: document.getElementById('dueDate').value,
                    updatedAt: new Date().toISOString()
                };
                
                await this.saveData();
                this.closeDialog();
                this.render(this.currentUser.uuid);
                this.showToast('任務更新成功', 'success');
            }
        } else {
            // 新增模式：創建新任務
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
    }

    // 編輯任務

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
        task.status = columnId;
        task.updatedAt = new Date().toISOString();
        
        // 特殊處理完成狀態
        if (columnId === 'completed') {
            task.completedAt = new Date().toISOString();
        } else {
            delete task.completedAt;
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
        if (event.target.closest('.task-checkbox') || event.target.closest('.task-btn') || event.target.closest('.expanded-btn')) {
            return;
        }
        
        // Ctrl/Cmd + Click 多選
        if (event.ctrlKey || event.metaKey) {
            this.toggleTaskSelection(taskId);
            return;
        }
        
        // 檢查螢幕寶度，手機版使用展開/折疊，桌面版顯示詳情對話框
        if (window.innerWidth <= 768) {
            this.toggleTaskExpanded(taskId);
        } else {
            this.showTaskDetails(taskId);
        }
    }
    
    // 新增方法：切換任務卡片展開/折疊狀態
    toggleTaskExpanded(taskId) {
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskCard) return;
        
        // 先收起其他展開的卡片
        document.querySelectorAll('.task-card.expanded').forEach(card => {
            if (card !== taskCard) {
                card.classList.remove('expanded');
            }
        });
        
        // 切換當前卡片狀態
        taskCard.classList.toggle('expanded');
    }
    
    // 顯示任務詳情
    showTaskDetails(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (!task) return;
        
        const tagInfo = this.quickTags.find(t => t.id === task.tags?.[0]);
        const isOverdue = false; // 關閉過期檢查功能
        
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
            this.showAddDialog(null, task);
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

    // 新增的簡化方法

    // 搜尋處理
    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        this.refreshTodosList();
    }

    // 刷新任務清單
    refreshTodosList() {
        let displayTodos = this.todos;
        
        // 搜尋過濾
        if (this.searchTerm) {
            displayTodos = displayTodos.filter(todo => 
                todo.title.toLowerCase().includes(this.searchTerm) ||
                (todo.description && todo.description.toLowerCase().includes(this.searchTerm)) ||
                (todo.category && todo.category.toLowerCase().includes(this.searchTerm))
            );
        }

        const todosList = document.getElementById('todosList');
        if (todosList) {
            todosList.innerHTML = displayTodos.length === 0 && this.searchTerm ? 
                `<div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="var(--text-light)" stroke-width="2"/>
                            <path d="m21 21-4.35-4.35" stroke="var(--text-light)" stroke-width="2"/>
                        </svg>
                    </div>
                    <p class="empty-text">找不到符合的任務</p>
                    <p class="empty-hint">試試其他關鍵字</p>
                </div>` : 
                displayTodos.map(todo => this.getSimpleTaskCard(todo)).join('');
        }
    }

    // 切換任務完成狀態
    async toggleTaskComplete(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (!task) return;

        task.status = task.status === 'completed' ? 'pending' : 'completed';
        task.completedAt = task.status === 'completed' ? new Date().toISOString() : null;
        task.updatedAt = new Date().toISOString();

        await this.saveData();
        this.refreshTodosList();
    }

    // 刪除任務
    async deleteTask(taskId) {
        if (!confirm('確定要刪除這個任務嗎？')) return;

        this.todos = this.todos.filter(t => t.id !== taskId);
        await this.saveData();
        this.refreshTodosList();
        this.showToast('任務已刪除', 'success');
    }

    // 簡化的拖拽處理
    handleDragStart(event, taskId) {
        this.draggedItem = taskId;
        event.dataTransfer.effectAllowed = 'move';
        event.target.style.opacity = '0.5';
    }

    // 覆寫原本的刷新方法
    refreshView() {
        this.refreshTodosList();
    }
}

// ES6 模組匯出
export { TodosModule };