/**
 * 專案管理模組 - 遊戲人生 3.0
 * 符合 building-manual 規範
 */

class ProjectsModule {
    // 靜態資訊（必填）
    static moduleInfo = {
        name: '專案管理',
        subtitle: '追蹤專案進度與任務分配',
        icon: `<svg viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                      fill="url(#warmGradient)" opacity="0.3"/>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                      fill="none" stroke="currentColor" stroke-width="2"/>
                <line x1="7" y1="13" x2="17" y2="13" stroke="currentColor" stroke-width="1" opacity="0.5"/>
                <line x1="7" y1="16" x2="14" y2="16" stroke="currentColor" stroke-width="1" opacity="0.5"/>
               </svg>`,
        version: '1.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.projects = [];
    }

    async render(uuid) {
        this.currentUser = { uuid };
        
        try {
            // 動態載入管委會
            const syncModule = await import('./sync.js');
            this.syncManager = new syncModule.SyncManager();
            
            // 載入個人資料
            await this.loadData();
        } catch (error) {
            console.error('載入同步管理器失敗:', error);
            // 繼續渲染，但不載入資料
        }
        
        // 渲染介面
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 綁定事件
        this.attachEventListeners();
    }

    getHTML() {
        return `
            <div class="projects-container" style="height: 100%; padding: 20px;">
                <!-- 標題區域 -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="margin-bottom: 16px; color: var(--text); font-size: 2rem;">專案管理</h2>
                    <p style="color: var(--text-light); margin-bottom: 24px;">追蹤專案進度，提升工作效率</p>
                </div>

                <!-- 專案概覽 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: var(--card); padding: 25px; border-radius: 16px; text-align: center; border: 1px solid var(--border);">
                        <svg style="width: 48px; height: 48px; margin: 0 auto 15px auto; display: block;" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="var(--primary)" opacity="0.2"/>
                            <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" stroke-width="2"/>
                            <path d="M9 12l2 2 4-4" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h3 style="margin-bottom: 8px; color: var(--text);">進行中專案</h3>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">3</div>
                        <div style="color: var(--text-light); font-size: 14px;">個專案</div>
                    </div>

                    <div style="background: var(--card); padding: 25px; border-radius: 16px; text-align: center; border: 1px solid var(--border);">
                        <svg style="width: 48px; height: 48px; margin: 0 auto 15px auto; display: block;" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.2"/>
                            <circle cx="12" cy="12" r="10" fill="none" stroke="#22c55e" stroke-width="2"/>
                            <path d="M8 12l2 2 4-4" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h3 style="margin-bottom: 8px; color: var(--text);">已完成</h3>
                        <div style="font-size: 2rem; font-weight: bold; color: #22c55e;">12</div>
                        <div style="color: var(--text-light); font-size: 14px;">個專案</div>
                    </div>

                    <div style="background: var(--card); padding: 25px; border-radius: 16px; text-align: center; border: 1px solid var(--border);">
                        <svg style="width: 48px; height: 48px; margin: 0 auto 15px auto; display: block;" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="#f59e0b" opacity="0.2"/>
                            <circle cx="12" cy="12" r="10" fill="none" stroke="#f59e0b" stroke-width="2"/>
                            <path d="M12 8v4M12 16h.01" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h3 style="margin-bottom: 8px; color: var(--text);">待處理任務</h3>
                        <div style="font-size: 2rem; font-weight: bold; color: #f59e0b;">8</div>
                        <div style="color: var(--text-light); font-size: 14px;">個任務</div>
                    </div>
                </div>

                <!-- 功能區域 -->
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="background: var(--card); border-radius: 20px; padding: 40px; text-align: center; backdrop-filter: blur(20px); border: 1px solid var(--border);">
                        <svg style="width: 64px; height: 64px; margin: 0 auto 20px auto; display: block;" viewBox="0 0 24 24">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                                  fill="var(--primary)" opacity="0.2"/>
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                                  fill="none" stroke="var(--primary)" stroke-width="2"/>
                        </svg>
                        <h3 style="margin-bottom: 16px; color: var(--text);">專案管理功能</h3>
                        <p style="color: var(--text-light); margin-bottom: 24px;">完整的專案管理系統正在開發中，將包含任務追蹤、進度管理、團隊協作等功能。</p>
                        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                            <button onclick="window.activeModule.showCreateProject()" 
                                    style="background: linear-gradient(135deg, var(--primary), var(--accent)); 
                                           color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                                           cursor: pointer; font-weight: 500;">
                                建立專案
                            </button>
                            <button onclick="window.activeModule.showTasks()" 
                                    style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                                           color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                                           cursor: pointer; font-weight: 500;">
                                任務管理
                            </button>
                            <button onclick="window.activeModule.showReports()" 
                                    style="background: linear-gradient(135deg, #22c55e, #16a34a); 
                                           color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                                           cursor: pointer; font-weight: 500;">
                                進度報告
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'projects');
            this.projects = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('載入專案資料失敗:', error);
            this.projects = [];
        }
    }

    showCreateProject() {
        this.showToast('建立專案功能開發中，敬請期待！', 'info');
    }

    showTasks() {
        this.showToast('任務管理功能開發中，敬請期待！', 'info');
    }

    showReports() {
        this.showToast('進度報告功能開發中，敬請期待！', 'info');
    }

    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.projects-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'projects-toast';
        
        const colors = {
            success: { bg: '#22c55e', text: 'white' },
            error: { bg: '#ef4444', text: 'white' },
            info: { bg: '#3b82f6', text: 'white' }
        };
        
        const color = colors[type] || colors.info;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            font-size: 14px;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    attachEventListeners() {
        console.log('專案管理事件監聽器已綁定');
    }

    destroy() {
        const existingToast = document.querySelector('.projects-toast');
        if (existingToast) {
            existingToast.remove();
        }
        console.log('專案管理模組已清理');
    }
}

export { ProjectsModule };