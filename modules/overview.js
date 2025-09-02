/**
 * 總覽模組 - 統一格式版本
 */

class OverviewModule {
    // SignageHost 招牌資料
    static signage = {
        title: '系統總覽',
        subtitle: '歡迎使用遊戲人生 3.0 管理系統',
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9v9H3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
        actions: []
    };

    static moduleInfo = {
        name: '系統總覽',
        subtitle: '歡迎使用遊戲人生 3.0 管理系統',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
               </svg>`,
        version: '1.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
    }

    async render(uuid) {
        window.activeModule = this;
        this.currentUser = { uuid };
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        // 啟動時鐘更新
        this.startClock();
    }

    getHTML() {
        return `
            <div class="overview-container">
                <!-- 快速小工具 -->
                <div class="quick-tools">
                    ${this.getQuickTools()}
                </div>

                <!-- 功能卡片網格 -->
                <div class="modules-grid">
                    ${this.getModuleCards()}
                </div>
            </div>

            ${this.getStyles()}
        `;
    }

    getModuleCards() {
        const modules = [
            {
                name: '待辦事項',
                desc: '管理日常任務',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                       </svg>`,
                color: 'rgba(139, 115, 85, 0.1)',
                module: 'todos'
            },
            {
                name: '行事曆',
                desc: '時間管理規劃',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                       </svg>`,
                color: 'rgba(122, 139, 116, 0.1)',
                module: 'calendar'
            },
            {
                name: '箱型時間',
                desc: '視覺化時間規劃',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <path d="M3 9h18M9 3v18"/>
                       </svg>`,
                color: 'rgba(107, 142, 159, 0.1)',
                module: 'timebox'
            },
            {
                name: '財務管理',
                desc: '收支記帳管理',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                       </svg>`,
                color: 'rgba(212, 165, 116, 0.1)',
                module: 'finance'
            },
            {
                name: '專案管理',
                desc: '專案進度追蹤',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                       </svg>`,
                color: 'rgba(184, 125, 139, 0.1)',
                module: 'projects'
            },
            {
                name: '人員管理',
                desc: '管理團隊成員',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                       </svg>`,
                color: 'rgba(139, 157, 195, 0.1)',
                module: 'users'
            },
            {
                name: '系統設定',
                desc: '個人化設定',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M18.36 5.64l4.24 4.24"/>
                       </svg>`,
                color: 'rgba(160, 196, 160, 0.1)',
                module: 'settings'
            }
        ];

        return modules.map(mod => `
            <div class="module-card" onclick="window.loadModule('${mod.module}')" style="background: ${mod.color};">
                <div class="module-card-icon">
                    ${mod.icon}
                </div>
                <div class="module-card-name">${mod.name}</div>
                <div class="module-card-desc">${mod.desc}</div>
            </div>
        `).join('');
    }

    getStyles() {
        return `
            <style>
                /* 統一歡迎卡片樣式 */
                .module-welcome-card {
                    height: 100px;
                    background: var(--card);
                    border-radius: 16px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid var(--border);
                    margin-bottom: 20px;
                    backdrop-filter: blur(20px);
                }
                
                .welcome-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .module-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border-radius: 12px;
                    color: white;
                    flex-shrink: 0;
                }
                
                .module-icon-wrapper svg {
                    width: 24px;
                    height: 24px;
                }
                
                .module-text {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .module-title {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text);
                    line-height: 1.4;
                }
                
                .module-subtitle {
                    margin: 0;
                    font-size: 0.875rem;
                    color: var(--text-light);
                    line-height: 1.4;
                }

                /* 快速小工具 */
                .quick-tools {
                    margin-bottom: 30px;
                }

                .tools-section h3 {
                    margin: 0 0 16px 0;
                    color: var(--text);
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .tools-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .tool-card {
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.2s;
                }

                .tool-card.clickable {
                    cursor: pointer;
                }

                .tool-card.clickable:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow);
                    border-color: var(--primary);
                }

                .tool-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .tool-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .tool-content {
                    flex: 1;
                }

                .tool-title {
                    font-size: 0.85rem;
                    color: var(--text-light);
                    margin-bottom: 2px;
                }

                .tool-value {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text);
                }

                /* 功能卡片 */
                .modules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                }

                .module-card {
                    padding: 24px;
                    border-radius: 16px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid transparent;
                }

                .module-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--primary);
                    box-shadow: var(--shadow);
                }

                .module-card-icon {
                    margin-bottom: 12px;
                }

                .module-card-icon svg {
                    width: 32px;
                    height: 32px;
                }

                .module-card-name {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: var(--text);
                }

                .module-card-desc {
                    color: var(--text-light);
                    font-size: 0.875rem;
                }
            </style>
        `;
    }

    getQuickTools() {
        return `
            <div class="tools-section">
                <h3>快速小工具</h3>
                <div class="tools-grid">
                    <!-- 時鐘 -->
                    <div class="tool-card">
                        <div class="tool-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                        </div>
                        <div class="tool-content">
                            <div class="tool-title">當前時間</div>
                            <div class="tool-value" id="currentTime">${this.getCurrentTime()}</div>
                        </div>
                    </div>

                    <!-- 天氣 -->
                    <div class="tool-card">
                        <div class="tool-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        </div>
                        <div class="tool-content">
                            <div class="tool-title">天氣</div>
                            <div class="tool-value">晴朝 25°C</div>
                        </div>
                    </div>

                    <!-- 快速記事 -->
                    <div class="tool-card clickable" onclick="window.activeModule.openQuickNote()">
                        <div class="tool-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </div>
                        <div class="tool-content">
                            <div class="tool-title">快速記事</div>
                            <div class="tool-value">點擊新增</div>
                        </div>
                    </div>

                    <!-- 番茄鐘 -->
                    <div class="tool-card clickable" onclick="window.activeModule.startPomodoro()">
                        <div class="tool-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                        </div>
                        <div class="tool-content">
                            <div class="tool-title">番茄鐘</div>
                            <div class="tool-value">開始專注</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('zh-TW', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    openQuickNote() {
        // 快速開啟待辦事項模組並新增任務
        if (window.loadModule) {
            window.loadModule('todos');
            setTimeout(() => {
                if (window.activeModule && window.activeModule.showAddDialog) {
                    window.activeModule.showAddDialog();
                }
            }, 500);
        }
    }

    startPomodoro() {
        // 快速開啟箱型時間模組並啟動番茄鐘
        if (window.loadModule) {
            window.loadModule('timebox');
            setTimeout(() => {
                if (window.activeModule && window.activeModule.startTimer) {
                    window.activeModule.togglePomodoroPanel();
                    setTimeout(() => {
                        window.activeModule.startTimer();
                    }, 300);
                }
            }, 500);
        }
    }

    startClock() {
        // 更新時鐘顯示
        const updateTime = () => {
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = this.getCurrentTime();
            }
        };
        
        // 立即更新一次
        updateTime();
        
        // 每分鐘更新
        this.timeInterval = setInterval(updateTime, 60000);
    }

    destroy() {
        // 清理時鐘
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }
}

export { OverviewModule };
