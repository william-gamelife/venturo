import { BaseAPI, ApiResponse } from '@/lib/base-api'
import { Project, ProjectTask } from '@/lib/types'

export class ProjectAPI {
  private static MODULE = 'projects'
  
  static async getAll(userId: string): Promise<Project[]> {
    return BaseAPI.loadData<Project>(this.MODULE, userId, [])
  }
  
  static async getById(userId: string, id: string): Promise<Project | null> {
    const projects = await this.getAll(userId)
    return projects.find(p => p.id === id) || null
  }
  
  static async create(userId: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return BaseAPI.create<Project>(this.MODULE, userId, data)
  }
  
  static async update(userId: string, id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return BaseAPI.update<Project>(this.MODULE, userId, id, data)
  }
  
  static async delete(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete(this.MODULE, userId, id)
  }
  
  static async bulkUpdate(userId: string, updates: Array<{ id: string; data: Partial<Project> }>): Promise<ApiResponse<Project[]>> {
    const projects = await this.getAll(userId)
    const updatedProjects = projects.map(project => {
      const update = updates.find(u => u.id === project.id)
      if (update) {
        return { ...project, ...update.data, updatedAt: new Date().toISOString() }
      }
      return project
    })
    
    const saved = await BaseAPI.saveData(this.MODULE, userId, updatedProjects)
    return {
      success: saved,
      data: updatedProjects
    }
  }
  
  // 專案特有方法
  static async updateProgress(userId: string, projectId: string): Promise<ApiResponse<Project>> {
    const projects = await this.getAll(userId)
    const project = projects.find(p => p.id === projectId)
    
    if (project && project.tasks) {
      const completed = project.tasks.filter(t => t.status === 'done').length
      const progress = project.tasks.length > 0 
        ? Math.round((completed / project.tasks.length) * 100)
        : 0
      return this.update(userId, projectId, { progress })
    }
    
    return { success: false, error: 'Project not found' }
  }
  
  static async addTask(userId: string, projectId: string, task: Partial<ProjectTask>): Promise<ApiResponse<Project>> {
    const project = await this.getById(userId, projectId)
    if (!project) {
      return { success: false, error: 'Project not found' }
    }
    
    const newTask: ProjectTask = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      projectId,
      title: task.title || '',
      status: task.status || 'todo',
      assignee: task.assignee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedTasks = [...(project.tasks || []), newTask]
    return this.update(userId, projectId, { tasks: updatedTasks })
  }
  
  static async updateTask(userId: string, projectId: string, taskId: string, taskData: Partial<ProjectTask>): Promise<ApiResponse<Project>> {
    const project = await this.getById(userId, projectId)
    if (!project || !project.tasks) {
      return { success: false, error: 'Project or tasks not found' }
    }
    
    const updatedTasks = project.tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
        : task
    )
    
    const result = await this.update(userId, projectId, { tasks: updatedTasks })
    if (result.success) {
      // 更新專案進度
      await this.updateProgress(userId, projectId)
    }
    return result
  }
  
  static async deleteTask(userId: string, projectId: string, taskId: string): Promise<ApiResponse<Project>> {
    const project = await this.getById(userId, projectId)
    if (!project || !project.tasks) {
      return { success: false, error: 'Project or tasks not found' }
    }
    
    const updatedTasks = project.tasks.filter(task => task.id !== taskId)
    const result = await this.update(userId, projectId, { tasks: updatedTasks })
    if (result.success) {
      // 更新專案進度
      await this.updateProgress(userId, projectId)
    }
    return result
  }
  
  static async updateOrder(userId: string, projectIds: string[]): Promise<ApiResponse<Project[]>> {
    const projects = await this.getAll(userId)
    const orderedProjects = projectIds.map((id, index) => {
      const project = projects.find(p => p.id === id)
      if (project) {
        return { ...project, order: index }
      }
      return null
    }).filter(Boolean) as Project[]
    
    const saved = await BaseAPI.saveData(this.MODULE, userId, orderedProjects)
    return {
      success: saved,
      data: orderedProjects
    }
  }
}