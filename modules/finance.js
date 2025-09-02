/**
 * 財務管理模組 - 遊戲人生 3.0
 * 符合 building-manual 規範
 */

class FinanceModule {
    // 靜態資訊（必填）
    static moduleInfo = {
        name: '財務管理',
        subtitle: '個人財務規劃與記錄',
        icon: `<svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="url(#warmGradient)" opacity="0.3"/>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5" 
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
               </svg>`,
        version: '1.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.transactions = [];
    }

    async render(uuid) {
        // ⭐ 必須：第一行設定 activeModule
        window.activeModule = this;
        
        this.currentUser = { uuid };
        
        // 動態載入管委會
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 載入個人資料
        await this.loadData();
        
        // 渲染介面
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 綁定事件
        this.attachEventListeners();
    }

    getHTML() {
        return `
            <div class="finance-container" style="height: 100%; padding: 20px;">
                <!-- 歡迎卡片 -->
                <div class="welcome-card" style="min-height: 120px; max-height: 120px; display: flex; align-items: center; padding: 24px; overflow: hidden; text-align: center; margin-bottom: 30px; background: var(--card); border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                    <div style="flex: 1;">
                        <h2 style="margin: 0 0 4px 0; color: var(--text); font-size: 1.8rem; line-height: 1.2;">財務管理</h2>
                        <p style="margin: 0; color: var(--text-light); font-size: 1rem; line-height: 1.3; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">掌握您的財務狀況，規劃美好未來</p>
                    </div>
                </div>

                <!-- 功能區域 -->
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="background: var(--card); border-radius: 20px; padding: 40px; text-align: center; backdrop-filter: blur(20px); border: 1px solid var(--border);">
                        <svg style="width: 64px; height: 64px; margin: 0 auto 20px auto; display: block;" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="var(--primary)" opacity="0.2"/>
                            <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" stroke-width="2"/>
                            <path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5" 
                                  fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <h3 style="margin-bottom: 16px; color: var(--text);">財務管理功能</h3>
                        <p style="color: var(--text-light); margin-bottom: 24px;">這個模組正在開發中，將包含收支記錄、預算管理、投資追蹤等功能。</p>
                        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                            <button onclick="window.activeModule.showFeature('income')" 
                                    style="background: linear-gradient(135deg, #22c55e, #16a34a); 
                                           color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                                           cursor: pointer; font-weight: 500;">
                                收入記錄
                            </button>
                            <button onclick="window.activeModule.showFeature('expense')" 
                                    style="background: linear-gradient(135deg, #ef4444, #dc2626); 
                                           color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                                           cursor: pointer; font-weight: 500;">
                                支出記錄
                            </button>
                            <button onclick="window.activeModule.showFeature('budget')" 
                                    style="background: linear-gradient(135deg, var(--primary), var(--accent)); 
                                           color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                                           cursor: pointer; font-weight: 500;">
                                預算管理
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'finance');
            this.transactions = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('載入財務資料失敗:', error);
            this.transactions = [];
        }
    }

    showFeature(type) {
        const featureNames = {
            income: '收入記錄',
            expense: '支出記錄', 
            budget: '預算管理'
        };
        
        this.showToast(`${featureNames[type]}功能開發中，敬請期待！`, 'info');
    }

    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.finance-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'finance-toast';
        
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
        console.log('財務管理事件監聽器已綁定');
    }

    destroy() {
        const existingToast = document.querySelector('.finance-toast');
        if (existingToast) {
            existingToast.remove();
        }
        console.log('財務管理模組已清理');
    }
}

export { FinanceModule };