/**
 * 專案 API
 * 統一的 API 端點定義
 */

import { APIClient } from '../client'
import type { ApiResponse, Project, ProjectStatus, QueryParams } from '@/types'

export interface ProjectQueryParams extends QueryParams {
  status?: ProjectStatus
  member?: string
  startDate?: string
  endDate?: string
}

export interface ProjectStats {
  total: number
  active: number
  completed: number
  archived: number
  averageProgress: number
  averageTasksPerProject: number
}

/**
 * Projects API 類別
 */
export class ProjectsAPI extends APIClient {
  constructor() {
    super('/api')
  }
  
  /**
   * 取得所有專案
   */
  async getProjects(params?: ProjectQueryParams): Promise<ApiResponse<Project[]>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return this.get<Project[]>(`/projects${queryString}`)
  }
  
  /**
   * 取得單一專案
   */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.get<Project>(`/projects/${id}`)
  }
  
  /**
   * 取得用戶的專案
   */
  async getUserProjects(userId: string, params?: ProjectQueryParams): Promise<ApiResponse<Project[]>> {
    const queryString = params ? `&${new URLSearchParams(params as any).toString()}` : ''
    return this.get<Project[]>(`/projects?user_id=${userId}${queryString}`)
  }
  
  /**
   * 建立新專案
   */
  async createProject(data: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.post<Project>('/projects', data)
  }
  
  /**
   * 更新專案
   */
  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.put<Project>(`/projects/${id}`, data)
  }
  
  /**
   * 更新專案狀態
   */
  async updateProjectStatus(id: string, status: ProjectStatus): Promise<ApiResponse<Project>> {
    return this.patch<Project>(`/projects/${id}/status`, { status })
  }
  
  /**
   * 更新專案進度
   */
  async updateProjectProgress(id: string, progress: number): Promise<ApiResponse<Project>> {
    return this.patch<Project>(`/projects/${id}/progress`, { progress })
  }
  
  /**
   * 刪除專案
   */
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/projects/${id}`)
  }
  
  /**
   * 歸檔專案
   */
  async archiveProject(id: string): Promise<ApiResponse<Project>> {
    return this.patch<Project>(`/projects/${id}/archive`)
  }
  
  /**
   * 取消歸檔專案
   */
  async unarchiveProject(id: string): Promise<ApiResponse<Project>> {
    return this.patch<Project>(`/projects/${id}/unarchive`)
  }
  
  /**
   * 新增專案成員
   */
  async addProjectMember(id: string, memberId: string): Promise<ApiResponse<Project>> {
    return this.post<Project>(`/projects/${id}/members`, { memberId })
  }
  
  /**
   * 移除專案成員
   */
  async removeProjectMember(id: string, memberId: string): Promise<ApiResponse<Project>> {
    return this.delete<Project>(`/projects/${id}/members/${memberId}`)
  }
  
  /**
   * 取得專案統計
   */
  async getProjectStats(userId?: string): Promise<ApiResponse<ProjectStats>> {
    const query = userId ? `?userId=${userId}` : ''
    return this.get<ProjectStats>(`/projects/stats${query}`)
  }
  
  /**
   * 複製專案
   */
  async duplicateProject(id: string, name: string): Promise<ApiResponse<Project>> {
    return this.post<Project>(`/projects/${id}/duplicate`, { name })
  }
  
  /**
   * 取得專案模板
   */
  async getProjectTemplates(): Promise<ApiResponse<Project[]>> {
    return this.get<Project[]>('/projects/templates')
  }
}

// 匯出單例
export const projectsAPI = new ProjectsAPI()

// 匯出預設
export default projectsAPI
