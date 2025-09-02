/**
 * 專案管理系統 - 遊戲人生 3.0
 * 符合 building-manual 規範
 * 
 * 核心功能：
 * 1. 專案建立與模板套用
 * 2. 抽屜式展開結構顯示
 * 3. 任務管理與狀態追蹤
 * 4. 指派與協作功能
 * 5. 進度管控與統計
 * 6. 交接功能與報告匯出
 */

class ProjectsModule {
    // 靜態資訊（必填）- 店家招牌
    static moduleInfo = {
        name: '專案管理',
        subtitle: '智慧專案協作與進度追蹤',
        icon: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.5 9.5L21 3M10.5 14.5L21 21M3.5 6l10.5 6.5M3.5 18l10.5-6.5" stroke="currentColor" stroke-width="1" opacity="0.5"/>
               </svg>`,
        version: '3.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.projects = [];
        this.expandedProjects = new Set();
        this.expandedCategories = new Set();
        this.selectedTasks = new Set();
        
        // 預設人員清單
        this.teamMembers = [
            { id: 'william', name: 'William', role: '專案經理' },
            { id: 'carson', name: 'Carson', role: '副經理' },
            { id: 'amy', name: '小美', role: '專案助理' },
            { id: 'john', name: '小明', role: '業務專員' },
            { id: 'lisa', name: '小麗', role: '行政助理' }
        ];
        
        // 專案模板
        this.projectTemplates = [
            {
                id: 'travel-basic',
                name: '旅行社基礎模板',
                categories: [
                    { 
                        id: 'contract', 
                        name: '合約類', 
                        icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z',
                        tasks: [
                            '合約簽署確認',
                            '付款條件討論',
                            '服務條款確認'
                        ]
                    },
                    { 
                        id: 'flight', 
                        name: '機票類', 
                        icon: 'M12 19l7-7 3 3-7 7-3-3zM5 4l3 3-3 7 3-3 7 3-3-3z',
                        tasks: [
                            '機票價格查詢',
                            '航班時間確認',
                            '機票預訂'
                        ]
                    },
                    { 
                        id: 'hotel', 
                        name: '住宿類', 
                        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 3v18M5 9h14M5 13h14',
                        tasks: [
                            '飯店選擇與比較',
                            '房型確認',
                            '住宿預訂'
                        ]
                    },
                    { 
                        id: 'transport', 
                        name: '交通類', 
                        icon: 'M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M5 17H3v-6l2-5h9l4 5v6h-2',
                        tasks: [
                            '當地交通安排',
                            '接送服務確認',
                            '交通路線規劃'
                        ]
                    }
                ]
            },
            {
                id: 'travel-full',
                name: '旅行社完整模板',
                categories: [
                    { 
                        id: 'contract', 
                        name: '合約類', 
                        icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z',
                        tasks: [
                            '合約簽署確認', '付款條件討論', '服務條款確認', '保險條款確認'
                        ]
                    },
                    { 
                        id: 'flight', 
                        name: '機票類', 
                        icon: 'M12 19l7-7 3 3-7 7-3-3zM5 4l3 3-3 7 3-3 7 3-3-3z',
                        tasks: [
                            '機票價格查詢', '航班時間確認', '機票預訂', '座位安排'
                        ]
                    },
                    { 
                        id: 'hotel', 
                        name: '住宿類', 
                        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 3v18M5 9h14M5 13h14',
                        tasks: [
                            '飯店選擇與比較', '房型確認', '住宿預訂', '特殊需求安排'
                        ]
                    },
                    { 
                        id: 'transport', 
                        name: '交通類', 
                        icon: 'M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M5 17H3v-6l2-5h9l4 5v6h-2',
                        tasks: [
                            '當地交通安排', '接送服務確認', '交通路線規劃', '緊急交通備案'
                        ]
                    },
                    { 
                        id: 'activity', 
                        name: '活動類', 
                        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                        tasks: [
                            '景點門票預訂', '導遊安排', '活動行程確認'
                        ]
                    },
                    { 
                        id: 'meal', 
                        name: '餐飲類', 
                        icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
                        tasks: [
                            '餐廳預約', '特殊飲食安排', '團體用餐安排'
                        ]
                    }
                ]
            },
            {
                id: 'blank',
                name: '空白專案',
                categories: [
                    { 
                        id: 'general', 
                        name: '一般任務', 
                        icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z',
                        tasks: []
                    }
                ]
            }
        ];
    }

    async render(uuid) {
        this.currentUser = { uuid };
        
        // 載入同步管理器
        try {
            const syncModule = await import('./sync.js');
            this.syncManager = new syncModule.SyncManager();
        } catch (error) {
            console.error('同步管理器載入失敗:', error);
            this.showToast('系統初始化失敗', 'error');
            return;
        }
        
        // 載入資料
        await this.loadData();
        
        // 渲染介面
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 綁定事件
        this.bindEvents();
        
        // 設定全域方法
        window.activeModule = this;
    }

    getHTML() {
        const activeProjects = this.projects.filter(p => p.status === 'active');
        const completedProjects = this.projects.filter(p => p.status === 'completed');
        const allTasks = this.getAllTasks();
        const pendingTasks = allTasks.filter(t => t.status === 'pending');
        
        return `
            <div class="projects-container">
                <!-- 頂部工具列 -->
                <div class="projects-header">
                    <div class="projects-title">
                        <h2>專案管理系統</h2>
                        <span class="projects-count">${this.projects.length} 個專案</span>
                    </div>
                    
                    <div class="projects-actions">
                        <button class="btn-primary" onclick="activeModule.showCreateProjectDialog()">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            建立專案
                        </button>
                        
                        <button class="btn-secondary" onclick="activeModule.showExportDialog()">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                            匯出報告
                        </button>
                    </div>
                </div>

                <!-- 專案統計 -->
                <div class="projects-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="10" fill="var(--primary)" opacity="0.2"/>
                                <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" stroke-width="2"/>
                                <path d="M9 12l2 2 4-4" stroke="var(--primary)" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${activeProjects.length}</div>
                            <div class="stat-label">進行中專案</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.2"/>
                                <circle cx="12" cy="12" r="10" fill="none" stroke="#22c55e" stroke-width="2"/>
                                <path d="M8 12l2 2 4-4" stroke="#22c55e" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${completedProjects.length}</div>
                            <div class="stat-label">已完成專案</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="10" fill="#f59e0b" opacity="0.2"/>
                                <circle cx="12" cy="12" r="10" fill="none" stroke="#f59e0b" stroke-width="2"/>
                                <path d="M12 8v4M12 16h.01" stroke="#f59e0b" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${pendingTasks.length}</div>
                            <div class="stat-label">待處理任務</div>
                        </div>
                    </div>
                </div>

                <!-- 專案列表 -->
                <div class="projects-list">
                    ${this.projects.length === 0 ? this.getEmptyState() : this.projects.map(project => this.getProjectHTML(project)).join('')}
                </div>
            </div>

            <style>
                .projects-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                    gap: 20px;
                }

                /* 頂部工具列 */
                .projects-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--card);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                }

                .projects-title h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .projects-count {
                    font-size: 0.9rem;
                    color: var(--text-light);
                    margin-left: 12px;
                }

                .projects-actions {
                    display: flex;
                    gap: 12px;
                }

                .btn-primary, .btn-secondary {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 16px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                }

                .btn-secondary {
                    background: white;
                    color: var(--text);
                    border: 1px solid var(--border);
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }

                .btn-secondary:hover {
                    background: var(--bg);
                }

                /* 統計卡片 */
                .projects-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .stat-card {
                    background: var(--card);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-number {
                    font-size: 2rem;
                    font-weight: bold;
                    color: var(--text);
                    line-height: 1;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: var(--text-light);
                    margin-top: 4px;
                }

                /* 專案列表 */
                .projects-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    overflow-y: auto;
                }

                /* 專案卡片 */
                .project-card {
                    background: var(--card);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    overflow: hidden;
                    transition: all 0.2s;
                }

                .project-card:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow);
                }

                .project-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                }

                .project-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .project-name {
                    font-weight: 600;
                    color: var(--text);
                    font-size: 1.1rem;
                }

                .project-id {
                    font-size: 0.8rem;
                    color: var(--text-light);
                    background: var(--bg);
                    padding: 2px 8px;
                    border-radius: 4px;
                }

                .project-progress {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    color: var(--text-light);
                }

                .progress-bar {
                    width: 100px;
                    height: 6px;
                    background: var(--bg);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: var(--primary);
                    transition: width 0.3s;
                }

                .expand-toggle {
                    padding: 4px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .expand-toggle:hover {
                    background: var(--bg);
                }

                .expand-toggle.expanded {
                    transform: rotate(180deg);
                }

                /* 專案內容 */
                .project-content {
                    display: none;
                    padding: 20px;
                    background: var(--bg);
                }

                .project-content.expanded {
                    display: block;
                }

                /* 類別區塊 */
                .category-block {
                    margin-bottom: 24px;
                }

                .category-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    cursor: pointer;
                    margin-bottom: 8px;
                }

                .category-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .category-icon {
                    width: 16px;
                    height: 16px;
                }

                .category-name {
                    font-weight: 500;
                    color: var(--text);
                }

                .category-count {
                    background: var(--primary-light);
                    color: var(--primary-dark);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .category-tasks {
                    display: none;
                    padding-left: 16px;
                }

                .category-tasks.expanded {
                    display: block;
                }

                /* 任務項目 */
                .task-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid var(--border);
                    margin-bottom: 8px;
                    transition: all 0.2s;
                }

                .task-item:hover {
                    background: var(--card);
                }

                .task-checkbox {
                    width: 16px;
                    height: 16px;
                    margin-right: 12px;
                    cursor: pointer;
                }

                .task-content {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .task-title {
                    font-size: 0.9rem;
                    color: var(--text);
                }

                .task-completed .task-title {
                    text-decoration: line-through;
                    color: var(--text-light);
                }

                .task-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    color: var(--text-light);
                }

                .task-assignee {
                    background: var(--primary-light);
                    color: var(--primary-dark);
                    padding: 2px 8px;
                    border-radius: 4px;
                }

                .add-task-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: none;
                    border: 1px dashed var(--border);
                    border-radius: 6px;
                    color: var(--text-light);
                    cursor: pointer;
                    font-size: 0.9rem;
                    margin-top: 8px;
                    margin-left: 16px;
                    transition: all 0.2s;
                }

                .add-task-btn:hover {
                    background: var(--card);
                    border-color: var(--primary);
                    color: var(--primary);
                }

                /* 空狀態 */
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-light);
                }

                .empty-state svg {
                    width: 64px;
                    height: 64px;
                    margin-bottom: 20px;
                    opacity: 0.5;
                }

                /* 對話框樣式 */
                .modal-overlay {
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

                .modal-content {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-lg);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .modal-header h3 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .modal-close {
                    padding: 4px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 0.9rem;
                    color: var(--text);
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

                .template-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .template-option {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .template-option:hover {
                    background: var(--card);
                }

                .template-option input[type="radio"] {
                    margin-right: 8px;
                }

                .modal-footer {
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

                .btn.btn-primary {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .btn.btn-primary:hover {
                    background: var(--primary-dark);
                }

                /* 手機版響應式 */
                @media (max-width: 768px) {
                    .projects-container {
                        padding: 12px;
                    }

                    .projects-header {
                        flex-direction: column;
                        gap: 12px;
                        align-items: stretch;
                    }

                    .projects-actions {
                        flex-direction: column;
                    }

                    .projects-stats {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" opacity="0.3"/>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>還沒有專案</h3>
                <p>從待辦事項合併建立第一個專案，或直接建立新專案</p>
                <button class="btn-primary" onclick="activeModule.showCreateProjectDialog()" style="margin-top: 16px;">
                    建立第一個專案
                </button>
            </div>
        `;
    }

    getProjectHTML(project) {
        const isExpanded = this.expandedProjects.has(project.id);
        const tasks = this.getProjectTasks(project);
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        return `
            <div class="project-card">
                <div class="project-header" onclick="activeModule.toggleProject('${project.id}')">
                    <div class="project-info">
                        <div>
                            <div class="project-name">${project.name}</div>
                            <div class="project-id">${project.id}</div>
                        </div>
                    </div>
                    
                    <div class="project-progress">
                        <span>${progress}%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <button class="expand-toggle ${isExpanded ? 'expanded' : ''}">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4 6l4 4 4-4"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="project-content ${isExpanded ? 'expanded' : ''}">
                    ${project.categories.map(category => this.getCategoryHTML(project.id, category)).join('')}
                </div>
            </div>
        `;
    }

    getCategoryHTML(projectId, category) {
        const categoryKey = `${projectId}-${category.id}`;
        const isExpanded = this.expandedCategories.has(categoryKey);
        const tasks = category.tasks || [];

        return `
            <div class="category-block">
                <div class="category-header" onclick="activeModule.toggleCategory('${categoryKey}')">
                    <div class="category-info">
                        <svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="${category.icon}"/>
                        </svg>
                        <span class="category-name">${category.name}</span>
                        <span class="category-count">${tasks.length}</span>
                    </div>
                    
                    <button class="expand-toggle ${isExpanded ? 'expanded' : ''}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4 6l4 4 4-4"/>
                        </svg>
                    </button>
                </div>
                
                <div class="category-tasks ${isExpanded ? 'expanded' : ''}">
                    ${tasks.map(task => this.getTaskHTML(projectId, category.id, task)).join('')}
                    <button class="add-task-btn" onclick="activeModule.showAddTaskDialog('${projectId}', '${category.id}')">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 2v12M2 8h12"/>
                        </svg>
                        新增任務
                    </button>
                </div>
            </div>
        `;
    }

    getTaskHTML(projectId, categoryId, task) {
        const assignee = this.teamMembers.find(m => m.id === task.assignedTo);

        return `
            <div class="task-item ${task.status === 'completed' ? 'task-completed' : ''}">
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${task.status === 'completed' ? 'checked' : ''}
                       onchange="activeModule.toggleTaskStatus('${projectId}', '${categoryId}', '${task.id}')">
                
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    
                    <div class="task-meta">
                        ${assignee ? `<span class="task-assignee">${assignee.name}</span>` : ''}
                        ${task.dueDate ? `<span>到期：${this.formatDate(task.dueDate)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // 資料管理
    async loadData() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'projects');
            this.projects = data?.projects || [];
        } catch (error) {
            console.error('載入專案資料失敗:', error);
            this.projects = [];
        }
    }

    async saveData() {
        try {
            await this.syncManager.save(this.currentUser.uuid, 'projects', {
                projects: this.projects,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('儲存專案資料失敗:', error);
            this.showToast('資料儲存失敗', 'error');
        }
    }

    // 主要功能方法
    showCreateProjectDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>建立新專案</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12 4L4 12M4 4l8 8"/>
                        </svg>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">專案名稱 <span style="color: red;">*</span></label>
                        <input type="text" class="form-input" id="projectName" placeholder="例如：王小姐曼谷團">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">選擇模板</label>
                        <div class="template-options">
                            ${this.projectTemplates.map(template => `
                                <label class="template-option">
                                    <input type="radio" name="template" value="${template.id}" ${template.id === 'travel-basic' ? 'checked' : ''}>
                                    <div>
                                        <div style="font-weight: 500;">${template.name}</div>
                                        <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 4px;">
                                            ${template.categories.length} 個類別，${template.categories.reduce((sum, cat) => sum + cat.tasks.length, 0)} 個預設任務
                                        </div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn btn-primary" onclick="activeModule.createProject()">建立專案</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 聚焦到專案名稱輸入框
        setTimeout(() => {
            document.getElementById('projectName').focus();
        }, 100);
    }

    async createProject() {
        const projectName = document.getElementById('projectName').value.trim();
        const selectedTemplate = document.querySelector('input[name="template"]:checked').value;
        
        if (!projectName) {
            this.showToast('請輸入專案名稱', 'error');
            return;
        }
        
        // 生成專案編號
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const sequence = String(this.projects.length + 1).padStart(3, '0');
        const projectId = `P${dateStr}${sequence}`;
        
        // 獲取模板
        const template = this.projectTemplates.find(t => t.id === selectedTemplate);
        
        // 創建專案
        const project = {
            id: projectId,
            name: projectName,
            template: selectedTemplate,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            categories: template.categories.map(category => ({
                ...category,
                tasks: category.tasks.map((taskTitle, index) => ({
                    id: `task_${Date.now()}_${index}`,
                    title: taskTitle,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    assignedTo: null,
                    dueDate: null,
                    description: ''
                }))
            }))
        };
        
        this.projects.push(project);
        await this.saveData();
        
        // 關閉對話框
        document.querySelector('.modal-overlay').remove();
        
        this.showToast(`專案「${projectName}」建立成功`, 'success');
        this.render(this.currentUser.uuid);
    }

    toggleProject(projectId) {
        if (this.expandedProjects.has(projectId)) {
            this.expandedProjects.delete(projectId);
        } else {
            this.expandedProjects.add(projectId);
        }
        this.render(this.currentUser.uuid);
    }

    toggleCategory(categoryKey) {
        if (this.expandedCategories.has(categoryKey)) {
            this.expandedCategories.delete(categoryKey);
        } else {
            this.expandedCategories.add(categoryKey);
        }
        this.render(this.currentUser.uuid);
    }

    showAddTaskDialog(projectId, categoryId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>新增任務</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12 4L4 12M4 4l8 8"/>
                        </svg>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">任務標題 <span style="color: red;">*</span></label>
                        <input type="text" class="form-input" id="taskTitle" placeholder="輸入任務標題">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">任務描述</label>
                        <textarea class="form-textarea" id="taskDescription" placeholder="詳細描述（選填）" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">指派給</label>
                        <select class="form-select" id="assignedTo">
                            <option value="">未指派</option>
                            ${this.teamMembers.map(member => `
                                <option value="${member.id}">${member.name} (${member.role})</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">到期日</label>
                        <input type="date" class="form-input" id="dueDate" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn btn-primary" onclick="activeModule.addTask('${projectId}', '${categoryId}')">新增任務</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => document.getElementById('taskTitle').focus(), 100);
    }

    async addTask(projectId, categoryId) {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            this.showToast('請輸入任務標題', 'error');
            return;
        }
        
        const project = this.projects.find(p => p.id === projectId);
        const category = project.categories.find(c => c.id === categoryId);
        
        const task = {
            id: `task_${Date.now()}`,
            title: title,
            description: document.getElementById('taskDescription').value.trim(),
            status: 'pending',
            assignedTo: document.getElementById('assignedTo').value || null,
            dueDate: document.getElementById('dueDate').value || null,
            createdAt: new Date().toISOString()
        };
        
        category.tasks.push(task);
        project.updatedAt = new Date().toISOString();
        
        await this.saveData();
        document.querySelector('.modal-overlay').remove();
        this.showToast('任務新增成功', 'success');
        this.render(this.currentUser.uuid);
    }

    async toggleTaskStatus(projectId, categoryId, taskId) {
        const project = this.projects.find(p => p.id === projectId);
        const category = project.categories.find(c => c.id === categoryId);
        const task = category.tasks.find(t => t.id === taskId);
        
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        task.completedAt = task.status === 'completed' ? new Date().toISOString() : null;
        project.updatedAt = new Date().toISOString();
        
        await this.saveData();
        this.render(this.currentUser.uuid);
    }

    showExportDialog() {
        this.showToast('匯出報告功能開發中', 'info');
    }

    // 工具方法
    getAllTasks() {
        const tasks = [];
        this.projects.forEach(project => {
            project.categories.forEach(category => {
                if (category.tasks) {
                    tasks.push(...category.tasks);
                }
            });
        });
        return tasks;
    }

    getProjectTasks(project) {
        const tasks = [];
        project.categories.forEach(category => {
            if (category.tasks) {
                tasks.push(...category.tasks);
            }
        });
        return tasks;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            </div>
        `;
        
        // 添加樣式
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 2000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // 自動移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    bindEvents() {
        // ESC 關閉對話框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    modal.remove();
                }
            }
        });
    }

    destroy() {
        // 清理全域參考
        if (window.activeModule === this) {
            window.activeModule = null;
        }
        
        // 移除對話框
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        
        // 移除 Toast
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(toast => toast.remove());
    }
}

export { ProjectsModule };