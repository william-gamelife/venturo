/**
 * 總覽模組 - 統一格式版本
 */

class OverviewModule {
    // SignageHost 招牌資料
    static signage = {
        title: '系統總覽',
        subtitle: '歡迎使用遊戲人生管理系統',
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9v9H3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
        actions: []
    };

    static moduleInfo = {
        name: '系統總覽',
        subtitle: '歡迎使用遊戲人生管理系統',
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
                icon: `<svg viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="brownToGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                <stop offset="30%" style="stop-color:#8b6914;stop-opacity:1" />
                                <stop offset="60%" style="stop-color:#4a6b4a;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="url(#brownToGreen)" opacity="0.3"/>
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#4a6b4a" stroke-width="2"/>
                        <path d="M9 11l3 3L20 5" fill="none" stroke="#355e3b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                       </svg>`,
                color: 'rgba(139, 115, 85, 0.1)',
                module: 'todos'
            },
            {
                name: '行事曆',
                desc: '時間管理規劃',
                icon: `<svg viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="brownToGreen2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <rect x="3" y="4" width="18" height="18" rx="2" fill="url(#brownToGreen2)" opacity="0.3"/>
                        <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="#4a6b4a" stroke-width="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="#4a6b4a" stroke-width="2" stroke-linecap="round"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="#4a6b4a" stroke-width="2" stroke-linecap="round"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="#4a6b4a" stroke-width="2"/>
                        <circle cx="12" cy="16" r="2" fill="#355e3b"/>
                       </svg>`,
                color: 'rgba(122, 139, 116, 0.1)',
                module: 'calendar'
            },
            {
                name: '箱型時間',
                desc: '視覺化時間規劃',
                icon: `<svg viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="brownToGreen3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <circle cx="12" cy="12" r="10" fill="url(#brownToGreen3)" opacity="0.3"/>
                        <circle cx="12" cy="12" r="10" fill="none" stroke="#4a6b4a" stroke-width="2"/>
                        <polyline points="12 6 12 12 16 14" fill="none" stroke="#355e3b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="1.5" fill="#355e3b"/>
                       </svg>`,
                color: 'rgba(107, 142, 159, 0.1)',
                module: 'timebox'
            },
            {
                name: '財務管理',
                desc: '收支記帳管理',
                icon: `<svg viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="brownToGreen4" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <circle cx="12" cy="12" r="10" fill="url(#brownToGreen4)" opacity="0.3"/>
                        <circle cx="12" cy="12" r="10" fill="none" stroke="#4a6b4a" stroke-width="2"/>
                        <path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5" 
                              fill="none" stroke="#355e3b" stroke-width="2" stroke-linecap="round"/>
                       </svg>`,
                color: 'rgba(212, 165, 116, 0.1)',
                module: 'finance'
            },
            {
                name: '專案管理',
                desc: '專案進度追蹤',
                icon: `<svg viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="brownToGreen5" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                              fill="url(#brownToGreen5)" opacity="0.3"/>
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                              fill="none" stroke="#4a6b4a" stroke-width="2"/>
                        <line x1="7" y1="13" x2="17" y2="13" stroke="#355e3b" stroke-width="1" opacity="0.5"/>
                        <line x1="7" y1="16" x2="14" y2="16" stroke="#355e3b" stroke-width="1" opacity="0.5"/>
                       </svg>`,
                color: 'rgba(184, 125, 139, 0.1)',
                module: 'projects'
            },
            {
                name: '人員管理',
                desc: '管理團隊成員',
                icon: `<svg viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="lightBrownToGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#deb887;stop-opacity:1" />
                                <stop offset="50%" style="stop-color:#8b6914;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#4a6b4a;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <circle cx="9" cy="7" r="4" fill="url(#lightBrownToGreen)" opacity="0.3"/>
                        <circle cx="9" cy="7" r="4" fill="none" stroke="#4a6b4a" stroke-width="2"/>
                        <path d="M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" fill="url(#lightBrownToGreen)" opacity="0.2"/>
                        <path d="M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" fill="none" stroke="#4a6b4a" stroke-width="2"/>
                        <circle cx="17" cy="7" r="3" fill="none" stroke="#8fbc8f" stroke-width="1.5" opacity="0.5"/>
                        <path d="M23 21v-2a3 3 0 0 0-2.5-2.95" stroke="#8fbc8f" stroke-width="1.5" opacity="0.5"/>
                       </svg>`,
                color: 'rgba(139, 157, 195, 0.1)',
                module: 'users'
            },
            {
                name: '系統設定',
                desc: '個人化設定',
                icon: `<svg viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="brownToGreen6" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" 
                              fill="url(#brownToGreen6)" opacity="0.3"/>
                        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" 
                              fill="none" stroke="#4a6b4a" stroke-width="2"/>
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
                            <svg viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                                <circle cx="12" cy="12" r="10" fill="url(#clockGradient)" opacity="0.3"/>
                                <circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2"/>
                                <polyline points="12,6 12,12 16,14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="12" r="1.5" fill="white"/>
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
                            <svg viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#deb887;stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                                <circle cx="12" cy="12" r="5" fill="url(#sunGradient)"/>
                                <line x1="12" y1="1" x2="12" y2="3" stroke="white" stroke-width="2"/>
                                <line x1="12" y1="21" x2="12" y2="23" stroke="white" stroke-width="2"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="white" stroke-width="2"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="white" stroke-width="2"/>
                                <line x1="1" y1="12" x2="3" y2="12" stroke="white" stroke-width="2"/>
                                <line x1="21" y1="12" x2="23" y2="12" stroke="white" stroke-width="2"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="white" stroke-width="2"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="white" stroke-width="2"/>
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
                            <svg viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id="noteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="url(#noteGradient)" opacity="0.8"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
                            <svg viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id="pomodoroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#cd853f;stop-opacity:1" />
                                        <stop offset="50%" style="stop-color:#8b6914;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#355e3b;stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                                <circle cx="12" cy="12" r="10" fill="url(#pomodoroGradient)" opacity="0.4"/>
                                <circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2"/>
                                <polyline points="12,6 12,12 16,14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="12" r="1.5" fill="white"/>
                                <circle cx="12" cy="12" r="6" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
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
