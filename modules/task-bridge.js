/**
 * 任務橋接管理器 - 遊戲人生 3.0
 * 負責待辦事項模組和專案管理模組之間的資料連動
 * 
 * 核心功能：
 * 1. 任務狀態同步
 * 2. 跨模組任務查詢
 * 3. 任務歸屬管理
 * 4. 指派同步機制
 */

class TaskBridge {
    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.taskMappings = new Map(); // 儲存任務在兩模組間的映射關係
        this.observers = []; // 觀察者模式，監聽任務變化
    }

    async initialize(uuid, syncManager) {
        this.currentUser = { uuid };
        this.syncManager = syncManager;
        await this.loadTaskMappings();
    }

    // 載入任務映射關係
    async loadTaskMappings() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'task_mappings');
            if (data && data.mappings) {
                this.taskMappings = new Map(Object.entries(data.mappings));
            }
        } catch (error) {
            console.error('載入任務映射失敗:', error);
            this.taskMappings = new Map();
        }
    }

    // 儲存任務映射關係
    async saveTaskMappings() {
        try {
            const mappingsObject = Object.fromEntries(this.taskMappings);
            await this.syncManager.save(this.currentUser.uuid, 'task_mappings', {
                mappings: mappingsObject,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('儲存任務映射失敗:', error);
        }
    }

    // 註冊任務映射（當任務從待辦轉移到專案時）
    async registerTaskMapping(todoTaskId, projectId, categoryId, projectTaskId) {
        const mapping = {
            todoTaskId,
            projectId,
            categoryId,
            projectTaskId,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        this.taskMappings.set(todoTaskId, mapping);
        await this.saveTaskMappings();
        
        // 通知觀察者
        this.notifyObservers('task_mapped', mapping);
    }

    // 同步任務狀態變化
    async syncTaskStatus(sourceModule, taskId, newStatus, additionalData = {}) {
        const mapping = this.taskMappings.get(taskId);
        if (!mapping) return;

        try {
            if (sourceModule === 'todos') {
                // 待辦事項模組的變化，同步到專案模組
                await this.updateProjectTask(mapping, newStatus, additionalData);
            } else if (sourceModule === 'projects') {
                // 專案模組的變化，同步到待辦事項模組
                await this.updateTodoTask(mapping, newStatus, additionalData);
            }

            // 通知觀察者
            this.notifyObservers('task_synced', { mapping, newStatus, additionalData });
        } catch (error) {
            console.error('任務狀態同步失敗:', error);
        }
    }

    // 更新專案任務
    async updateProjectTask(mapping, newStatus, additionalData) {
        try {
            const projectData = await this.syncManager.load(this.currentUser.uuid, 'projects');
            if (!projectData || !projectData.projects) return;

            const project = projectData.projects.find(p => p.id === mapping.projectId);
            if (!project) return;

            const category = project.categories.find(c => c.id === mapping.categoryId);
            if (!category) return;

            const task = category.tasks.find(t => t.id === mapping.projectTaskId);
            if (!task) return;

            // 更新任務狀態
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            
            // 合併額外資料
            Object.assign(task, additionalData);

            // 更新專案時間戳
            project.updatedAt = new Date().toISOString();

            // 儲存更新
            await this.syncManager.save(this.currentUser.uuid, 'projects', projectData);
        } catch (error) {
            console.error('更新專案任務失敗:', error);
        }
    }

    // 更新待辦任務
    async updateTodoTask(mapping, newStatus, additionalData) {
        try {
            const todoData = await this.syncManager.load(this.currentUser.uuid, 'todos');
            if (!todoData || !todoData.todos) return;

            const task = todoData.todos.find(t => t.id === mapping.todoTaskId);
            if (!task) return;

            // 更新任務狀態
            task.status = newStatus === 'completed' ? 'completed' : 'project';
            task.updatedAt = new Date().toISOString();
            
            // 合併額外資料
            Object.assign(task, additionalData);

            // 儲存更新
            await this.syncManager.save(this.currentUser.uuid, 'todos', todoData);
        } catch (error) {
            console.error('更新待辦任務失敗:', error);
        }
    }

    // 查詢任務歸屬
    getTaskLocation(taskId) {
        const mapping = this.taskMappings.get(taskId);
        if (mapping) {
            return {
                type: 'project',
                projectId: mapping.projectId,
                categoryId: mapping.categoryId,
                projectTaskId: mapping.projectTaskId
            };
        }
        return { type: 'todo' };
    }

    // 獲取專案相關的所有待辦任務ID
    getProjectTodoTasks(projectId) {
        const todoTasks = [];
        for (const [todoTaskId, mapping] of this.taskMappings.entries()) {
            if (mapping.projectId === projectId && mapping.status === 'active') {
                todoTasks.push(todoTaskId);
            }
        }
        return todoTasks;
    }

    // 獲取用戶的指派任務
    async getUserAssignedTasks(userId) {
        try {
            const [todoData, projectData] = await Promise.all([
                this.syncManager.load(this.currentUser.uuid, 'todos'),
                this.syncManager.load(this.currentUser.uuid, 'projects')
            ]);

            const assignedTasks = [];

            // 從待辦事項中找指派任務
            if (todoData && todoData.todos) {
                todoData.todos.forEach(task => {
                    if (task.assignedTo === userId && task.status !== 'project') {
                        assignedTasks.push({
                            ...task,
                            source: 'todos',
                            location: this.getTaskLocation(task.id)
                        });
                    }
                });
            }

            // 從專案中找指派任務
            if (projectData && projectData.projects) {
                projectData.projects.forEach(project => {
                    project.categories.forEach(category => {
                        category.tasks.forEach(task => {
                            if (task.assignedTo === userId) {
                                assignedTasks.push({
                                    ...task,
                                    source: 'projects',
                                    projectName: project.name,
                                    categoryName: category.name,
                                    location: {
                                        type: 'project',
                                        projectId: project.id,
                                        categoryId: category.id
                                    }
                                });
                            }
                        });
                    });
                });
            }

            return assignedTasks;
        } catch (error) {
            console.error('獲取指派任務失敗:', error);
            return [];
        }
    }

    // 註冊觀察者
    addObserver(callback) {
        this.observers.push(callback);
    }

    // 移除觀察者
    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    // 通知所有觀察者
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('觀察者通知失敗:', error);
            }
        });
    }

    // 清理映射關係（當專案被刪除時）
    async clearProjectMappings(projectId) {
        const toDelete = [];
        for (const [taskId, mapping] of this.taskMappings.entries()) {
            if (mapping.projectId === projectId) {
                toDelete.push(taskId);
            }
        }

        toDelete.forEach(taskId => this.taskMappings.delete(taskId));
        await this.saveTaskMappings();

        // 通知觀察者
        this.notifyObservers('mappings_cleared', { projectId, deletedMappings: toDelete });
    }

    // 獲取統計資料
    getStatistics() {
        const stats = {
            totalMappings: this.taskMappings.size,
            activeProjects: new Set(),
            mappedTasks: 0
        };

        for (const mapping of this.taskMappings.values()) {
            if (mapping.status === 'active') {
                stats.activeProjects.add(mapping.projectId);
                stats.mappedTasks++;
            }
        }

        stats.activeProjectsCount = stats.activeProjects.size;
        return stats;
    }
}

// 建立全域實例
let taskBridgeInstance = null;

// 取得單例實例的工廠函數
export async function getTaskBridge() {
    if (!taskBridgeInstance) {
        taskBridgeInstance = new TaskBridge();
    }
    return taskBridgeInstance;
}

export { TaskBridge };