/**
 * 待辦事項模組 V2 - 升級版
 * 主要升級：動態欄位、智慧標籤、批量操作、改良拖放
 */

class TodosModuleV2 {
    static moduleInfo = {
        name: '待辦事項 2.0',
        subtitle: '智慧任務管理系統',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
        </svg>`,
        version: '2.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.todos = {};
        this.draggedItems = [];
        this.columns = this.loadColumnConfig();
        this.smartTags = this.loadSmartTags();
    }

    // 載入欄位配置（可自訂）
    loadColumnConfig() {
        const saved = localStorage.getItem('todos_columns_v2');
        if (saved) {
            return JSON.parse(saved);
        }
        // 預設五欄
        return [
            { id: 'pending', name: '待處理', color: '#94a3b8', items: [] },
            { id: 'today', name: '今日執行', color: '#60a5fa', items: [] },
            { id: 'week', name: '本週規劃', color: '#a78bfa', items: [] },
            { id: 'waiting', name: '等待回應', color: '#fbbf24', items: [] },
            { id: 'completed', name: '最近完成', color: '#34d399', items: [] }
        ];
    }

    // 載入智慧標籤系統
    loadSmartTags() {
        const saved = localStorage.getItem('smart_tags_v2');
        if (saved) {
            return JSON.parse(saved);
        }
        // 預設標籤群組
        return {
            '旅遊': {
                color: '#3b82f6',
                icon: '✈️',
                related: ['機票', '飯店', '簽證', '行程', '保險']
            },
            '商務': {
                color: '#10b981',
                icon: '💼',
                related: ['報價', '合約', '會議', '簡報', '發票']
            },
            '專案': {
                color: '#8b5cf6',
                icon: '📊',
                related: ['規劃', '執行', '追蹤', '結案', '檢討']
            },
            '緊急': {
                color: '#ef4444',
                icon: '🚨',
                related: ['立即', '今日', '優先', '急件', '趕工']
            }
        };
    }

    async render(uuid) {
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        
        // 動態載入同步管理器
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 載入資料
        await this.loadData(uuid);
        
        // 渲染介面
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 綁定事件
        this.bindEvents();
        this.initDragAndDrop();
        this.initKeyboardShortcuts();
        
        // 自動儲存
        this.startAutoSave();
    }

    getHTML() {
        return `
            <div class="todos-v2-container">
                <!-- 頂部工具列 -->
                <div class="todos-header">
                    <div class="header-left">
                        <h2>待辦事項 2.0</h2>
                        <span class="version-badge">升級版</span>
                    </div>
                    <div class="header-tools">
                        <button onclick="window.activeModule.showColumnSettings()" class="btn-tool">
                            欄位設定
                        </button>
                        <button onclick="window.activeModule.showSmartTags()" class="btn-tool">
                            標籤管理
                        </button>
                        <button onclick="window.activeModule.showBatchActions()" class="btn-tool">
                            批量操作
                        </button>
                        <button onclick="window.activeModule.exportTasks()" class="btn-tool">
                            匯出
                        </button>
                    </div>
                </div>

                <!-- 快速新增區 -->
                <div class="quick-add-section">
                    <input type="text" 
                           id="quickAddInput" 
                           placeholder="按 Enter 快速新增任務，輸入 # 觸發智慧標籤..."
                           class="quick-add-input">
                    <div id="tagSuggestions" class="tag-suggestions"></div>
                </div>

                <!-- 看板主體 -->
                <div class="kanban-board" id="kanbanBoard">
                    ${this.columns.map(col => this.renderColumn(col)).join('')}
                    
                    <!-- 新增欄位按鈕 -->
                    <div class="add-column-btn" onclick="window.activeModule.addNewColumn()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>新增欄位</span>
                    </div>
                </div>

                <!-- 批量操作面板 -->
                <div id="batchPanel" class="batch-panel hidden">
                    <div class="batch-info">
                        已選擇 <span id="selectedCount">0</span> 個項目
                    </div>
                    <div class="batch-actions">
                        <button onclick="window.activeModule.batchMove()">移動到...</button>
                        <button onclick="window.activeModule.batchTag()">加標籤</button>
                        <button onclick="window.activeModule.batchProject()">轉為專案</button>
                        <button onclick="window.activeModule.batchDelete()" class="btn-danger">刪除</button>
                    </div>
                </div>
            </div>

            <style>
                .todos-v2-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 20px;
                }

                .todos-header {
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

                .header-tools {
                    display: flex;
                    gap: 10px;
                }

                .btn-tool {
                    padding: 6px 12px;
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-tool:hover {
                    background: var(--hover);
                    transform: translateY(-1px);
                }

                .quick-add-section {
                    position: relative;
                }

                .quick-add-input {
                    width: 100%;
                    padding: 12px;
                    font-size: 16px;
                    border: 2px solid var(--border);
                    border-radius: 8px;
                    background: var(--card);
                }

                .tag-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    display: none;
                }

                .tag-suggestion {
                    padding: 8px 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tag-suggestion:hover {
                    background: var(--hover);
                }

                .kanban-board {
                    display: flex;
                    gap: 20px;
                    flex: 1;
                    overflow-x: auto;
                    padding-bottom: 20px;
                }

                .kanban-column {
                    min-width: 300px;
                    background: var(--card);
                    border-radius: 12px;
                    padding: 15px;
                    height: fit-content;
                }

                .column-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid;
                }

                .column-title {
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .column-count {
                    background: rgba(0,0,0,0.1);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }

                .column-items {
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .todo-item {
                    background: white;
                    border-radius: 8px;
                    padding: 12px;
                    border-left: 4px solid var(--primary);
                    cursor: grab;
                    transition: all 0.2s;
                    user-select: none;
                    position: relative;
                }

                .todo-item:hover {
                    transform: translateX(2px);
                    box-shadow: var(--shadow);
                }

                .todo-item.selected {
                    background: var(--primary-light);
                    border-left-color: var(--primary-dark);
                }

                .todo-item.dragging {
                    opacity: 0.5;
                    transform: rotate(5deg);
                }

                .todo-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }

                .todo-checkbox {
                    margin-top: 2px;
                }

                .todo-text {
                    flex: 1;
                    line-height: 1.4;
                }

                .todo-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 6px;
                }

                .todo-tag {
                    font-size: 11px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    color: white;
                    font-weight: 500;
                }

                .todo-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .add-column-btn {
                    min-width: 200px;
                    height: 100px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: var(--card);
                    border: 2px dashed var(--border);
                    border-radius: 12px;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }

                .add-column-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: var(--primary-light);
                }

                .batch-panel {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--card);
                    padding: 15px 20px;
                    border-radius: 12px;
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    z-index: 1000;
                }

                .batch-panel.hidden {
                    display: none;
                }

                .batch-actions {
                    display: flex;
                    gap: 10px;
                }

                .batch-actions button {
                    padding: 6px 12px;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .batch-actions button:hover {
                    background: var(--hover);
                }

                .btn-danger {
                    background: #ef4444 !important;
                    color: white !important;
                    border-color: #dc2626 !important;
                }

                .btn-danger:hover {
                    background: #dc2626 !important;
                }

                /* 拖放視覺回饋 */
                .drop-zone {
                    border: 2px dashed var(--primary);
                    background: var(--primary-light);
                }

                .drag-preview {
                    position: fixed;
                    pointer-events: none;
                    z-index: 1000;
                    background: white;
                    border-radius: 8px;
                    padding: 8px;
                    box-shadow: var(--shadow-lg);
                    transform: rotate(3deg);
                }

                /* 響應式 */
                @media (max-width: 768px) {
                    .kanban-board {
                        flex-direction: column;
                    }
                    
                    .kanban-column {
                        min-width: unset;
                    }
                    
                    .header-tools {
                        flex-wrap: wrap;
                    }
                }
            </style>
        `;
    }

    // 渲染單一欄位
    renderColumn(column) {
        const items = this.todos[column.id] || [];
        return `
            <div class="kanban-column" data-column="${column.id}">
                <div class="column-header" style="border-color: ${column.color}">
                    <div class="column-title" style="color: ${column.color}">
                        <span>${column.name}</span>
                        <span class="column-count">${items.length}</span>
                    </div>
                    <button onclick="window.activeModule.editColumn('${column.id}')" class="btn-tool">
                        ⋯
                    </button>
                </div>
                <div class="column-items" ondrop="window.activeModule.handleDrop(event)" ondragover="window.activeModule.handleDragOver(event)">
                    ${items.map(item => this.renderTodoItem(item)).join('')}
                    <div class="add-todo-btn" onclick="window.activeModule.addTodo('${column.id}')">
                        + 新增任務
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染待辦事項
    renderTodoItem(item) {
        const tags = (item.tags || []).map(tag => {
            const tagInfo = this.getTagInfo(tag);
            return `<span class="todo-tag" style="background: ${tagInfo.color}">${tagInfo.icon} ${tag}</span>`;
        }).join('');

        return `
            <div class="todo-item" 
                 data-id="${item.id}"
                 draggable="true"
                 onclick="window.activeModule.selectItem(this, event)"
                 ondragstart="window.activeModule.handleDragStart(event)">
                <div class="todo-content">
                    <input type="checkbox" class="todo-checkbox" ${item.completed ? 'checked' : ''} 
                           onchange="window.activeModule.toggleComplete('${item.id}')">
                    <div class="todo-text">${item.text}</div>
                </div>
                ${tags ? `<div class="todo-tags">${tags}</div>` : ''}
                <div class="todo-meta">
                    <span>${new Date(item.created).toLocaleDateString()}</span>
                    <span>${item.priority || 'normal'}</span>
                </div>
            </div>
        `;
    }

    // 獲取標籤資訊
    getTagInfo(tagName) {
        for (let category in this.smartTags) {
            if (this.smartTags[category].related.includes(tagName)) {
                return {
                    color: this.smartTags[category].color,
                    icon: this.smartTags[category].icon
                };
            }
        }
        return { color: '#6b7280', icon: '📌' };
    }

    // 綁定事件
    bindEvents() {
        // 快速新增
        const quickInput = document.getElementById('quickAddInput');
        quickInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && quickInput.value.trim()) {
                this.quickAddTodo(quickInput.value.trim());
                quickInput.value = '';
            }
        });

        // 智慧標籤建議
        quickInput.addEventListener('input', (e) => {
            if (e.target.value.includes('#')) {
                this.showTagSuggestions(e.target.value);
            } else {
                this.hideTagSuggestions();
            }
        });
    }

    // 初始化拖放功能
    initDragAndDrop() {
        // 多選拖放支援將在這裡實現
        this.selectedItems = new Set();
    }

    // 初始化快速鍵
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+A 全選
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.selectAllItems();
            }
            // Delete 刪除選中項目
            if (e.key === 'Delete' && this.selectedItems.size > 0) {
                this.deleteSelectedItems();
            }
            // Escape 取消選擇
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }

    // 自動儲存
    startAutoSave() {
        setInterval(() => {
            this.saveTodos();
        }, 30000); // 30秒自動儲存
    }

    // 快速新增待辦事項
    quickAddTodo(text) {
        const item = {
            id: this.generateId(),
            text: text,
            created: Date.now(),
            completed: false,
            tags: this.extractTags(text),
            priority: 'normal'
        };

        // 預設加入第一欄
        const firstColumn = this.columns[0].id;
        if (!this.todos[firstColumn]) this.todos[firstColumn] = [];
        this.todos[firstColumn].push(item);

        this.saveTodos();
        this.render(this.currentUser.uuid);
    }

    // 提取標籤
    extractTags(text) {
        const matches = text.match(/#(\w+)/g);
        return matches ? matches.map(tag => tag.substring(1)) : [];
    }

    // 顯示標籤建議
    showTagSuggestions(inputValue) {
        const suggestions = document.getElementById('tagSuggestions');
        const allTags = [];
        
        // 收集所有相關標籤
        Object.values(this.smartTags).forEach(category => {
            allTags.push(...category.related);
        });

        const filtered = allTags.filter(tag => 
            tag.toLowerCase().includes(inputValue.split('#').pop().toLowerCase())
        );

        if (filtered.length > 0) {
            suggestions.innerHTML = filtered.slice(0, 8).map(tag => {
                const tagInfo = this.getTagInfo(tag);
                return `
                    <div class="tag-suggestion" onclick="window.activeModule.insertTag('${tag}')">
                        <span>${tagInfo.icon}</span>
                        <span>${tag}</span>
                    </div>
                `;
            }).join('');
            suggestions.style.display = 'block';
        }
    }

    hideTagSuggestions() {
        document.getElementById('tagSuggestions').style.display = 'none';
    }

    insertTag(tag) {
        const input = document.getElementById('quickAddInput');
        const value = input.value;
        const lastHashIndex = value.lastIndexOf('#');
        
        if (lastHashIndex !== -1) {
            input.value = value.substring(0, lastHashIndex + 1) + tag + ' ';
        }
        
        this.hideTagSuggestions();
        input.focus();
    }

    // 載入資料
    async loadData(uuid) {
        if (this.syncManager) {
            this.todos = await this.syncManager.load(uuid, 'todos-v2') || {};
        }
    }

    // 儲存資料
    async saveTodos() {
        if (this.syncManager) {
            await this.syncManager.save(this.currentUser.uuid, 'todos-v2', this.todos);
        }
    }

    // 生成 ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // 選擇項目（支援多選）
    selectItem(element, event) {
        const id = element.dataset.id;
        
        if (event.ctrlKey || event.metaKey) {
            // 多選模式
            if (this.selectedItems.has(id)) {
                this.selectedItems.delete(id);
                element.classList.remove('selected');
            } else {
                this.selectedItems.add(id);
                element.classList.add('selected');
            }
        } else {
            // 單選模式
            this.clearSelection();
            this.selectedItems.add(id);
            element.classList.add('selected');
        }

        this.updateBatchPanel();
    }

    // 清除選擇
    clearSelection() {
        this.selectedItems.clear();
        document.querySelectorAll('.todo-item.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.updateBatchPanel();
    }

    // 全選
    selectAllItems() {
        this.clearSelection();
        document.querySelectorAll('.todo-item').forEach(el => {
            const id = el.dataset.id;
            this.selectedItems.add(id);
            el.classList.add('selected');
        });
        this.updateBatchPanel();
    }

    // 更新批量操作面板
    updateBatchPanel() {
        const panel = document.getElementById('batchPanel');
        const count = document.getElementById('selectedCount');
        
        if (this.selectedItems.size > 0) {
            panel.classList.remove('hidden');
            count.textContent = this.selectedItems.size;
        } else {
            panel.classList.add('hidden');
        }
    }

    // 拖放處理
    handleDragStart(event) {
        const item = event.target;
        const id = item.dataset.id;
        
        // 如果拖拽的項目已選中，拖拽所有選中項目
        if (this.selectedItems.has(id)) {
            this.draggedItems = Array.from(this.selectedItems);
        } else {
            this.draggedItems = [id];
        }
        
        event.dataTransfer.setData('text/plain', '');
        item.classList.add('dragging');
        
        // 創建拖拽預覽
        this.createDragPreview(event);
    }

    handleDragOver(event) {
        event.preventDefault();
        const column = event.currentTarget.closest('.kanban-column');
        column.classList.add('drop-zone');
    }

    handleDrop(event) {
        event.preventDefault();
        const column = event.currentTarget.closest('.kanban-column');
        const targetColumn = column.dataset.column;
        
        // 移動項目
        this.moveItemsToColumn(this.draggedItems, targetColumn);
        
        // 清理
        column.classList.remove('drop-zone');
        document.querySelectorAll('.dragging').forEach(el => {
            el.classList.remove('dragging');
        });
        
        this.draggedItems = [];
        this.render(this.currentUser.uuid);
    }

    // 創建拖拽預覽
    createDragPreview(event) {
        if (this.draggedItems.length > 1) {
            const preview = document.createElement('div');
            preview.className = 'drag-preview';
            preview.innerHTML = `拖拽 ${this.draggedItems.length} 個項目`;
            preview.style.left = event.clientX + 10 + 'px';
            preview.style.top = event.clientY + 10 + 'px';
            document.body.appendChild(preview);
            
            // 跟隨鼠標移動
            const movePreview = (e) => {
                preview.style.left = e.clientX + 10 + 'px';
                preview.style.top = e.clientY + 10 + 'px';
            };
            
            document.addEventListener('mousemove', movePreview);
            document.addEventListener('dragend', () => {
                document.removeEventListener('mousemove', movePreview);
                document.body.removeChild(preview);
            }, { once: true });
        }
    }

    // 移動項目到欄位
    moveItemsToColumn(itemIds, targetColumn) {
        itemIds.forEach(id => {
            // 從所有欄位中找到並移除項目
            for (let columnId in this.todos) {
                const columnItems = this.todos[columnId] || [];
                const itemIndex = columnItems.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    const item = columnItems.splice(itemIndex, 1)[0];
                    
                    // 移動到目標欄位
                    if (!this.todos[targetColumn]) this.todos[targetColumn] = [];
                    this.todos[targetColumn].push(item);
                    break;
                }
            }
        });
        
        this.saveTodos();
    }

    // 批量操作方法
    batchMove() {
        // 顯示欄位選擇對話框
        const columns = this.columns.map(col => 
            `<option value="${col.id}">${col.name}</option>`
        ).join('');
        
        const targetColumn = prompt(`選擇目標欄位:\n${this.columns.map((col, i) => `${i+1}. ${col.name}`).join('\n')}`);
        if (targetColumn) {
            const columnId = this.columns[parseInt(targetColumn) - 1]?.id;
            if (columnId) {
                this.moveItemsToColumn(Array.from(this.selectedItems), columnId);
                this.clearSelection();
                this.render(this.currentUser.uuid);
            }
        }
    }

    batchTag() {
        const tag = prompt('輸入要添加的標籤:');
        if (tag) {
            this.selectedItems.forEach(id => {
                // 找到項目並添加標籤
                for (let columnId in this.todos) {
                    const item = this.todos[columnId].find(item => item.id === id);
                    if (item) {
                        if (!item.tags) item.tags = [];
                        if (!item.tags.includes(tag)) {
                            item.tags.push(tag);
                        }
                        break;
                    }
                }
            });
            
            this.saveTodos();
            this.clearSelection();
            this.render(this.currentUser.uuid);
        }
    }

    batchProject() {
        // 轉為專案功能 - 需要與 projects-v2 模組整合
        if (confirm(`將選中的 ${this.selectedItems.size} 個任務轉為專案？`)) {
            // TODO: 整合專案模組
            alert('專案轉換功能將在專案模組中實現');
        }
    }

    batchDelete() {
        if (confirm(`確定要刪除選中的 ${this.selectedItems.size} 個項目？`)) {
            this.deleteSelectedItems();
        }
    }

    deleteSelectedItems() {
        this.selectedItems.forEach(id => {
            for (let columnId in this.todos) {
                const index = this.todos[columnId].findIndex(item => item.id === id);
                if (index !== -1) {
                    this.todos[columnId].splice(index, 1);
                    break;
                }
            }
        });
        
        this.saveTodos();
        this.clearSelection();
        this.render(this.currentUser.uuid);
    }

    // 欄位管理
    addNewColumn() {
        const name = prompt('新欄位名稱:');
        if (name) {
            const id = name.toLowerCase().replace(/\s+/g, '_');
            const color = prompt('欄位顏色 (hex):', '#6b7280');
            
            this.columns.push({
                id: id,
                name: name,
                color: color,
                items: []
            });
            
            this.saveColumnConfig();
            this.render(this.currentUser.uuid);
        }
    }

    editColumn(columnId) {
        const column = this.columns.find(col => col.id === columnId);
        if (column) {
            const newName = prompt('修改欄位名稱:', column.name);
            if (newName) {
                column.name = newName;
                const newColor = prompt('修改欄位顏色:', column.color);
                if (newColor) column.color = newColor;
                
                this.saveColumnConfig();
                this.render(this.currentUser.uuid);
            }
        }
    }

    saveColumnConfig() {
        localStorage.setItem('todos_columns_v2', JSON.stringify(this.columns));
    }

    // 匯出功能
    exportTasks() {
        const data = {
            columns: this.columns,
            todos: this.todos,
            smartTags: this.smartTags,
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos-v2-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 顯示設定面板（佔位符方法）
    showColumnSettings() {
        alert('欄位設定面板開發中...');
    }

    showSmartTags() {
        alert('智慧標籤管理面板開發中...');
    }

    showBatchActions() {
        alert('批量操作選項開發中...');
    }

    // 其他待辦事項操作
    addTodo(columnId) {
        const text = prompt('新增任務:');
        if (text) {
            const item = {
                id: this.generateId(),
                text: text,
                created: Date.now(),
                completed: false,
                tags: this.extractTags(text),
                priority: 'normal'
            };

            if (!this.todos[columnId]) this.todos[columnId] = [];
            this.todos[columnId].push(item);

            this.saveTodos();
            this.render(this.currentUser.uuid);
        }
    }

    toggleComplete(itemId) {
        for (let columnId in this.todos) {
            const item = this.todos[columnId].find(item => item.id === itemId);
            if (item) {
                item.completed = !item.completed;
                this.saveTodos();
                break;
            }
        }
    }

    cleanup() {
        // 清理事件監聽器和定時器
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }

    destroy() {
        // 清理資源
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        // 最後儲存
        if (this.saveData) {
            this.saveData();
        }
        
        // 移除全域事件監聽
        const handlers = ['keydown', 'click', 'dragstart', 'dragend', 'dragover', 'drop'];
        handlers.forEach(event => {
            document.removeEventListener(event, null, true);
        });
        
        // 清空引用
        this.todos = null;
        this.columns = null;
        this.smartTags = null;
        this.draggedItems = null;
        this.syncManager = null;
        this.currentUser = null;
        
        // 清除 activeModule
        if (window.activeModule === this) {
            window.activeModule = null;
        }
        
        console.log('TodosModuleV2 已銷毀');
    }
}

// 導出模組
window.TodosModuleV2 = TodosModuleV2;
export { TodosModuleV2 };