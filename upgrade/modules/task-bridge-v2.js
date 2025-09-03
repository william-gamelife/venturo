/**
 * 任務橋接器 V2 - 升級版
 * 負責連接待辦事項與專案管理
 * 實現雙向同步與資料轉換
 */

class TaskBridgeV2 {
    constructor() {
        this.syncManager = null;
        this.initSyncManager();
    }

    async initSyncManager() {
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
    }

    /**
     * 從待辦事項建立專案
     * @param {Array} todos - 選中的待辦事項
     * @param {string} projectName - 專案名稱
     * @param {string} userId - 使用者 ID
     */
    async createProjectFromTodos(todos, projectName, userId) {
        if (!this.syncManager) await this.initSyncManager();
        
        // 載入現有專案
        const projectData = await this.syncManager.load(userId, 'projects-v2') || { projects: [] };
        
        // 智慧分類任務
        const categorized = this.categorizeTasks(todos);
        
        // 建立專案結構
        const project = {
            id: Date.now().toString(),
            name: projectName,
            icon: this.guessProjectIcon(projectName),
            color: this.generateProjectColor(),
            tasks: this.buildProjectStructure(categorized, todos),
            created_at: new Date().toISOString(),
            created_from_todos: true,
            source_todo_ids: todos.map(t => t.id),
            owner: userId,
            status: 'active'
        };
        
        // 加入專案列表
        projectData.projects.unshift(project);
        
        // 儲存專案
        await this.syncManager.save(userId, 'projects-v2', projectData);
        
        // 更新待辦事項狀態（標記已轉為專案）
        await this.markTodosAsProject(todos, project.id, userId);
        
        return project;
    }

    /**
     * 智慧分類任務
     */
    categorizeTasks(todos) {
        const categories = {
            '合約文件': [],
            '交通安排': [],
            '住宿餐飲': [],
            '行程活動': [],
            '財務相關': [],
            '其他事項': []
        };
        
        const keywords = {
            '合約文件': ['合約', '報價', '簽約', '文件', '協議', '合同'],
            '交通安排': ['機票', '火車', '接送', '交通', '航班', '高鐵'],
            '住宿餐飲': ['飯店', '住宿', '餐廳', '用餐', '訂房', '民宿'],
            '行程活動': ['景點', '活動', '參觀', '導覽', '體驗', '行程'],
            '財務相關': ['付款', '發票', '收據', '費用', '預算', '報帳']
        };
        
        todos.forEach(todo => {
            let categorized = false;
            
            // 根據標籤和標題關鍵字分類
            for (const [category, keys] of Object.entries(keywords)) {
                if (this.matchKeywords(todo, keys)) {
                    categories[category].push(todo);
                    categorized = true;
                    break;
                }
            }
            
            if (!categorized) {
                categories['其他事項'].push(todo);
            }
        });
        
        // 移除空分類
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });
        
        return categories;
    }

    /**
     * 檢查關鍵字匹配
     */
    matchKeywords(todo, keywords) {
        const text = (todo.title + ' ' + (todo.tags || []).join(' ')).toLowerCase();
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    /**
     * 建立專案結構
     */
    buildProjectStructure(categorized, originalTodos) {
        const structure = [];
        
        for (const [category, todos] of Object.entries(categorized)) {
            if (todos.length === 0) continue;
            
            const group = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: category,
                subtasks: todos.map(todo => ({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: todo.title,
                    completed: todo.status === 'completed',
                    completed_at: todo.completed_at || null,
                    assignee: todo.assignee || null,
                    due_date: todo.due_date || null,
                    mergedFromTodos: todo.id,  // 關聯原始待辦 ID
                    tags: todo.tags || []
                }))
            };
            
            structure.push(group);
        }
        
        return structure;
    }

    /**
     * 標記待辦事項已轉為專案
     */
    async markTodosAsProject(todos, projectId, userId) {
        const todosData = await this.syncManager.load(userId, 'todos-v2') || {};
        
        // 從各欄位中移除這些待辦事項
        Object.keys(todosData.todos || {}).forEach(column => {
            if (todosData.todos[column]) {
                todosData.todos[column] = todosData.todos[column].filter(
                    t => !todos.find(selected => selected.id === t.id)
                );
            }
        });
        
        // 加入專案標記（可選：保留在特殊欄位供追溯）
        if (!todosData.projectized) {
            todosData.projectized = [];
        }
        
        todos.forEach(todo => {
            todosData.projectized.push({
                ...todo,
                projectId: projectId,
                projectized_at: new Date().toISOString()
            });
        });
        
        await this.syncManager.save(userId, 'todos-v2', todosData);
    }

    /**
     * 同步任務狀態（專案 → 待辦）
     */
    async syncTaskStatus(todoId, completed, userId) {
        const todosData = await this.syncManager.load(userId, 'todos-v2') || {};
        
        // 在 projectized 中更新狀態
        if (todosData.projectized) {
            const todo = todosData.projectized.find(t => t.id === todoId);
            if (todo) {
                todo.status = completed ? 'completed' : 'pending';
                todo.completed_at = completed ? new Date().toISOString() : null;
                await this.syncManager.save(userId, 'todos-v2', todosData);
            }
        }
    }

    /**
     * 還原專案為待辦事項
     */
    async restoreProjectToTodos(projectId, userId) {
        // 載入專案資料
        const projectData = await this.syncManager.load(userId, 'projects-v2') || { projects: [] };
        const project = projectData.projects.find(p => p.id === projectId);
        
        if (!project || !project.created_from_todos) {
            throw new Error('此專案無法還原為待辦事項');
        }
        
        // 載入待辦資料
        const todosData = await this.syncManager.load(userId, 'todos-v2') || {};
        
        // 從 projectized 還原到 pending
        if (todosData.projectized && project.source_todo_ids) {
            const toRestore = todosData.projectized.filter(
                t => project.source_todo_ids.includes(t.id)
            );
            
            if (!todosData.todos) todosData.todos = {};
            if (!todosData.todos.pending) todosData.todos.pending = [];
            
            toRestore.forEach(todo => {
                delete todo.projectId;
                delete todo.projectized_at;
                todosData.todos.pending.unshift(todo);
            });
            
            // 從 projectized 中移除
            todosData.projectized = todosData.projectized.filter(
                t => !project.source_todo_ids.includes(t.id)
            );
        }
        
        // 移除專案
        projectData.projects = projectData.projects.filter(p => p.id !== projectId);
        
        // 儲存變更
        await this.syncManager.save(userId, 'todos-v2', todosData);
        await this.syncManager.save(userId, 'projects-v2', projectData);
        
        return true;
    }

    /**
     * 猜測專案圖示
     */
    guessProjectIcon(projectName) {
        const iconMap = {
            '旅': '✈',
            '遊': '🗺',
            '會議': '👥',
            '開發': '💻',
            '設計': '🎨',
            '行銷': '📢',
            '財務': '💰',
            '合約': '📄'
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (projectName.includes(key)) {
                return icon;
            }
        }
        
        return '📁';
    }

    /**
     * 產生專案顏色
     */
    generateProjectColor() {
        const colors = [
            '#3b82f6', // 藍
            '#10b981', // 綠
            '#8b5cf6', // 紫
            '#f59e0b', // 橙
            '#ef4444', // 紅
            '#14b8a6', // 青
            '#f97316', // 橘
            '#06b6d4'  // 天藍
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 取得專案統計
     */
    async getProjectStats(userId) {
        const projectData = await this.syncManager.load(userId, 'projects-v2') || { projects: [] };
        const todosData = await this.syncManager.load(userId, 'todos-v2') || {};
        
        return {
            totalProjects: projectData.projects.length,
            fromTodos: projectData.projects.filter(p => p.created_from_todos).length,
            projectizedTodos: todosData.projectized?.length || 0,
            activeProjects: projectData.projects.filter(p => p.status === 'active').length,
            completedProjects: projectData.projects.filter(p => {
                if (!p.tasks) return false;
                const progress = this.calculateProjectProgress(p.tasks);
                return progress === 100;
            }).length
        };
    }

    /**
     * 計算專案進度
     */
    calculateProjectProgress(tasks) {
        let total = 0;
        let completed = 0;
        
        const countTasks = (taskList) => {
            taskList.forEach(task => {
                if (task.subtasks && task.subtasks.length > 0) {
                    countTasks(task.subtasks);
                } else {
                    total++;
                    if (task.completed) completed++;
                }
            });
        };
        
        countTasks(tasks);
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }
}

// ES6 模組匯出
export { TaskBridgeV2 };