/**
 * 系統設定模組 - 遊戲人生 3.0
 * 純雲端架構，個人化設定與偏好，UUID隔離
 * 符合 building-manual 規範
 */

class SettingsModule {
    // SignageHost 招牌資料 - 新版招牌格式（支援主題）
    static getSignage() {
        return {
            name: '系統設定',
            tagline: 'System Settings',
            description: '個人化設定與偏好管理',
            version: '3.0.0',
            author: 'william',
            themeSupport: true,
            mobileSupport: true,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
            primaryActions: [
                { 
                    id: 'export', 
                    label: '匯出設定',
                    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
                    onclick: 'activeModule.exportSettings()'
                }
            ],
            secondaryActions: [
                { 
                    id: 'reset', 
                    label: '重置設定',
                    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
                    onclick: 'activeModule.resetSettings()'
                },
                { 
                    id: 'permissions', 
                    label: '權限管理',
                    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
                    onclick: 'activeModule.showPermissionManager()'
                }
            ]
        };
    }

    constructor() {
        this.syncManager = null;
        this.userId = null;
        this.settings = {};
        this.moduleOrder = [];
        this.themes = {
            'zen': '枯山水',
            'ivory-charcoal': '象牙炭灰'
        };
        this.languages = {
            'zh-TW': '繁體中文',
            'zh-CN': '簡體中文',
            'en': 'English',
            'ja': '日本語'
        };
        this.syncIntervals = {
            15: '15秒 (快速)',
            30: '30秒 (預設)',
            60: '1分鐘',
            300: '5分鐘'
        };
    }

    async render(userId) {
        // <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg> 必須：第一行設定 activeModule
        window.activeModule = this;
        
        this.userId = userId;
        
        // 動態導入 sync manager
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 載入資料
        await this.loadData();
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = `
            <div class="settings-container" style="height: 100%; min-height: 500px;">
                <!-- 歡迎卡片 -->
                <div class="welcome-card" style="min-height: 120px; max-height: 120px; display: flex; align-items: center; padding: 24px; overflow: hidden; margin-bottom: 24px; background: var(--card); border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                    <div style="flex: 1; text-align: center;">
                        <h2 style="margin: 0 0 4px 0; color: var(--text); font-size: 1.8rem; line-height: 1.2;">系統設定</h2>
                        <p style="margin: 0; color: var(--text-light); font-size: 1rem; line-height: 1.3; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">控制中心｜個人化設定與偏好管理</p>
                    </div>
                </div>

                <!-- 設定區塊 -->
                <div class="settings-sections" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
                    
                    <!-- 外觀設定 -->
                    <div class="setting-section" style="background: var(--card); border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                        <h3 style="margin: 0 0 16px 0; color: var(--primary); font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="13.5" cy="6.5" r=".5"></circle>
                                <circle cx="17.5" cy="10.5" r=".5"></circle>
                                <circle cx="8.5" cy="7.5" r=".5"></circle>
                                <circle cx="6.5" cy="12.5" r=".5"></circle>
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
                            </svg>
                            外觀設定
                        </h3>
                        
                        <div class="setting-item" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text); font-size: 14px;">主題樣式</label>
                            <select id="themeSelect" onchange="window.activeModule.updateSetting('theme', this.value)" 
                                    style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white;">
                                ${Object.entries(this.themes).map(([key, name]) => `
                                    <option value="${key}">${name}</option>
                                `).join('')}
                            </select>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: var(--text-light);">選擇您喜歡的視覺風格</p>
                        </div>

                        <div class="setting-item" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text); font-size: 14px;">語言設定</label>
                            <select id="languageSelect" onchange="window.activeModule.updateSetting('language', this.value)"
                                    style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white;">
                                <option value="zh-TW">繁體中文</option>
                                <option value="zh-CN">簡體中文</option>
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                            </select>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: var(--text-light);">切換介面語言</p>
                        </div>

                        <div class="setting-item">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" id="compactMode" onchange="window.activeModule.updatePreference('compact_mode', this.checked)"
                                       style="width: 16px; height: 16px; accent-color: var(--primary);">
                                <label for="compactMode" style="font-weight: 500; color: var(--text); font-size: 14px; cursor: pointer;">緊湊模式</label>
                            </div>
                            <p style="margin: 8px 0 0 28px; font-size: 12px; color: var(--text-light);">減少介面元素間距，顯示更多內容</p>
                        </div>
                    </div>



                    <!-- 模組排序 -->
                    <div class="setting-section" style="background: var(--card); border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                        <h3 style="margin: 0 0 16px 0; color: var(--primary); font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                            模組排序
                        </h3>
                        
                        <p style="margin: 0 0 16px 0; font-size: 13px; color: var(--text-light);">拖拽調整導航列中模組的顯示順序（僅影響個人視圖）</p>
                        
                        <div id="moduleOrderList" class="module-order-list">
                            <!-- 動態載入模組清單 -->
                        </div>
                        
                        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border);">
                            <button onclick="window.activeModule.resetModuleOrder()" 
                                    style="background: transparent; color: var(--text-light); border: 1px solid var(--border); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                恢復預設順序
                            </button>
                        </div>
                    </div>

                    <!-- 系統資訊 -->
                    <div class="setting-section" style="background: var(--card); border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                        <h3 style="margin: 0 0 16px 0; color: var(--text-light); font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            系統資訊
                        </h3>
                        
                        <div class="system-info" style="font-size: 13px; line-height: 1.6; color: var(--text-light);">
                            <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px;">
                                <span>版本：</span><span style="font-weight: 600; color: var(--text);">遊戲人生 3.0</span>
                                <span>架構：</span><span>純雲端 + UUID隔離</span>
                                <span>部署時間：</span><span id="deploymentTime">${this.getDeploymentTime()}</span>
                                <span>使用者ID：</span><span style="font-family: monospace; font-size: 11px;" id="userUUID">${this.userId}</span>
                                <span>資料同步：</span><span id="lastSyncTime">尚未同步</span>
                                <span>儲存狀態：</span><span style="color: var(--accent); font-weight: 600;">雲端已同步</span>
                            </div>
                        </div>

                        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">
                            <button onclick="window.activeModule.exportSettings()" 
                                    style="background: linear-gradient(135deg, var(--accent), var(--primary)); color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; margin-right: 12px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                匯出設定
                            </button>
                            <button onclick="window.activeModule.resetSettings()" 
                                    style="background: transparent; color: var(--text-light); border: 1px solid var(--border); padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="1 4 1 10 7 10"></polyline>
                                    <polyline points="23 20 23 14 17 14"></polyline>
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                重置設定
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 人員管理 (僅管理員可見) -->
                ${this.isAdmin() ? `
                <div class="setting-section" style="background: var(--card); border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow); margin-top: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: var(--primary); font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        人員管理
                    </h3>
                    
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: var(--text-light);">管理系統用戶權限和模組存取控制</p>
                    
                    <div id="userManagementContent">
                        <!-- 用戶管理內容將動態載入 -->
                    </div>
                    
                    <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                        <button onclick="window.activeModule.loadUserList()" 
                                style="background: linear-gradient(135deg, var(--accent), var(--primary)); color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            載入用戶清單
                        </button>
                        <button onclick="window.activeModule.showPermissionMatrix()" 
                                style="background: transparent; color: var(--text); border: 1px solid var(--border); padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            權限矩陣
                        </button>
                    </div>
                </div>
                ` : ''}

                <!-- 底部資訊 -->
                <div class="settings-footer" style="margin-top: 24px; padding: 20px; background: rgba(139, 115, 85, 0.05); border-radius: 12px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: var(--text-light);">
                        設定會自動儲存到雲端，並在所有裝置間同步<br>
                        變更會立即生效，無需重新載入頁面
                    </p>
                </div>
            </div>

            <style>
            .welcome-card {
                transition: all 0.3s ease;
            }
            
            .welcome-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            }
            
            .setting-section:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                transition: all 0.3s ease;
            }

            .setting-item {
                transition: all 0.2s ease;
            }

            .setting-item:hover {
                background: rgba(139, 115, 85, 0.02);
                border-radius: 8px;
                padding: 8px;
                margin: -8px;
            }

            select:focus, input:focus {
                outline: 2px solid var(--primary);
                outline-offset: 2px;
            }

            input[type="checkbox"]:checked {
                accent-color: var(--primary);
            }

            @media (max-width: 768px) {
                .settings-sections {
                    grid-template-columns: 1fr;
                }
            }
            .module-order-list {
                border: 1px solid var(--border);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .module-order-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: white;
                border-bottom: 1px solid var(--border);
                cursor: move;
                transition: all 0.2s;
            }
            
            .module-order-item:last-child {
                border-bottom: none;
            }
            
            .module-order-item:hover {
                background: var(--bg);
            }
            
            .module-order-item.dragging {
                opacity: 0.5;
                transform: scale(0.95);
            }
            
            .module-drag-handle {
                margin-right: 12px;
                color: var(--text-light);
                cursor: move;
            }
            
            .module-info {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .module-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--primary);
            }
            
            .module-details h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 500;
                color: var(--text);
            }
            
            .module-details p {
                margin: 2px 0 0 0;
                font-size: 12px;
                color: var(--text-light);
            }
            </style>
        `;
        
        this.attachEventListeners();
        this.renderSettings();
        this.loadModuleOrder();
    }

    async loadData() {
        try {
            const data = await this.syncManager.load(this.userId, 'settings');
            if (data && typeof data === 'object') {
                this.settings = data;
            } else {
                // 載入預設設定
                this.settings = {
                    id: this.generateUUID(),
                    user_id: this.userId,
                    theme: 'zen',
                    language: 'zh-TW',
                    sync_interval: 30,
                    notifications: {
                        browser: true,
                        sound: true,
                        desktop: false
                    },
                    preferences: {
                        auto_save: true,
                        show_stats: true,
                        compact_mode: false,
                        dark_sidebar: false
                    },
                    module_order: ['overview', 'todos', 'calendar', 'finance', 'projects', 'life-simulator', 'timebox', 'settings'],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('載入設定失敗:', error);
            // 載入預設設定
            this.settings = {
                id: this.generateUUID(),
                user_id: this.userId,
                theme: 'zen',
                language: 'zh-TW',
                sync_interval: 30,
                notifications: {
                    browser: true,
                    sound: true,
                    desktop: false
                },
                preferences: {
                    auto_save: true,
                    show_stats: true,
                    compact_mode: false,
                    dark_sidebar: false
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }
    }

    renderSettings() {
        setTimeout(() => {
            const themeSelect = document.getElementById('themeSelect');
            const languageSelect = document.getElementById('languageSelect');
            const syncIntervalSelect = document.getElementById('syncIntervalSelect');
            const compactMode = document.getElementById('compactMode');
            const autoSave = document.getElementById('autoSave');
            const browserNotifications = document.getElementById('browserNotifications');
            const soundNotifications = document.getElementById('soundNotifications');
            const desktopNotifications = document.getElementById('desktopNotifications');
            const currentSyncInterval = document.getElementById('currentSyncInterval');
            const lastSyncTime = document.getElementById('lastSyncTime');

            if (themeSelect) themeSelect.value = this.settings.theme || 'zen';
            if (languageSelect) languageSelect.value = this.settings.language || 'zh-TW';
            if (syncIntervalSelect) syncIntervalSelect.value = this.settings.sync_interval || 30;
            if (compactMode) compactMode.checked = this.settings.preferences?.compact_mode || false;
            if (autoSave) autoSave.checked = this.settings.preferences?.auto_save !== false;
            if (browserNotifications) browserNotifications.checked = this.settings.notifications?.browser !== false;
            if (soundNotifications) soundNotifications.checked = this.settings.notifications?.sound !== false;
            if (desktopNotifications) desktopNotifications.checked = this.settings.notifications?.desktop || false;
            
            if (currentSyncInterval) {
                const interval = this.settings.sync_interval || 30;
                currentSyncInterval.textContent = this.syncIntervals[interval] || `${interval}秒`;
            }
            
            if (lastSyncTime) {
                lastSyncTime.textContent = this.settings.updated_at ? 
                    new Date(this.settings.updated_at).toLocaleTimeString() : '尚未同步';
            }
        }, 100);
    }

    async updateSetting(key, value) {
        this.settings[key] = value;
        this.settings.updated_at = new Date().toISOString();
        
        await this.saveSettings();
        this.applySettings(key, value);
        
        console.log(`設定已更新: ${key} = ${value}`);
    }

    async updatePreference(key, value) {
        if (!this.settings.preferences) {
            this.settings.preferences = {};
        }
        this.settings.preferences[key] = value;
        this.settings.updated_at = new Date().toISOString();
        
        await this.saveSettings();
        this.applySettings(`preferences.${key}`, value);
        
        console.log(`偏好設定已更新: ${key} = ${value}`);
    }

    async updateNotification(key, value) {
        if (!this.settings.notifications) {
            this.settings.notifications = {};
        }
        this.settings.notifications[key] = value;
        this.settings.updated_at = new Date().toISOString();
        
        await this.saveSettings();
        
        if (key === 'desktop' && value) {
            this.requestNotificationPermission();
        }
        
        console.log(`通知設定已更新: ${key} = ${value}`);
    }

    async saveSettings() {
        try {
            await this.syncManager.save(this.userId, 'settings', this.settings);
            const lastSyncTime = document.getElementById('lastSyncTime');
            if (lastSyncTime) {
                lastSyncTime.textContent = new Date().toLocaleTimeString();
            }
        } catch (error) {
            console.error('儲存設定失敗:', error);
        }
    }

    applySettings(key, value) {
        switch (key) {
            case 'sync_interval':
                const syncInterval = document.getElementById('currentSyncInterval');
                if (syncInterval) {
                    syncInterval.textContent = this.syncIntervals[value] || `${value}秒`;
                }
                break;
            
            case 'theme':
                if (window.themeManager) {
                    window.themeManager.loadTheme(value);
                    console.log(`切換主題: ${this.themes[value]}`);
                } else {
                    console.log('主題管理器未載入');
                }
                break;
            
            case 'preferences.compact_mode':
                document.body.classList.toggle('compact-mode', value);
                break;
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification('遊戲人生', {
                    body: '桌面通知已啟用！',
                    icon: '/favicon.ico'
                });
            }
        }
    }

    exportSettings() {
        const exportData = {
            version: '3.0',
            exported_at: new Date().toISOString(),
            user_id: this.userId,
            settings: this.settings
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gamelife-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('設定已匯出');
    }

    async resetSettings() {
        if (!this.showConfirm('確定要重置所有設定為預設值嗎？此操作無法復原。', () => {})) {
            return;
        }

        this.settings = {
            ...this.settings,
            theme: 'zen',
            language: 'zh-TW',
            sync_interval: 30,
            notifications: {
                browser: true,
                sound: true,
                desktop: false
            },
            preferences: {
                auto_save: true,
                show_stats: true,
                compact_mode: false,
                dark_sidebar: false
            },
            updated_at: new Date().toISOString()
        };

        await this.saveSettings();
        this.renderSettings();
        
        console.log('設定已重置為預設值');
        this.showToast('設定已重置為預設值！', 'info');
    }

    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveSettings();
            }
        });
    }

    // 載入模組順序
    loadModuleOrder() {
        const modules = [
            { id: 'overview', name: '總覽', subtitle: '儀表板｜快速掌握整體狀況', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
            { id: 'todos', name: '待辦事項', subtitle: '任務管理｜五欄位容器系統', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
            { id: 'calendar', name: '行事曆', subtitle: '時間管理｜日程安排與提醒', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z' },
            { id: 'finance', name: '金流', subtitle: '財務管理｜收支記錄與分析', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
            { id: 'projects', name: '專案管理', subtitle: '市政廳｜容器、報表與總覽', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
            { id: 'life-simulator', name: '人生模擬器', subtitle: '遊戲化任務｜經營你的虛擬人生', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 11.25c0-.69.56-1.25 1.25-1.25S11.5 10.56 11.5 11.25 10.94 12.5 10.25 12.5 9 11.94 9 11.25zM15 11.25c0-.69.56-1.25 1.25-1.25S17.5 10.56 17.5 11.25 16.94 12.5 16.25 12.5 15 11.94 15 11.25zM8 14s1.5 2 4 2 4-2 4-2' },
            { id: 'timebox', name: '時間盒', subtitle: '時間區塊｜專注力管理工具', icon: 'M12 2v20m8-8H4' },
            { id: 'settings', name: '系統設定', subtitle: '控制中心｜個人化設定與偏好管理', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z' }
        ];

        const currentOrder = this.settings.module_order || ['overview', 'todos', 'calendar', 'finance', 'projects', 'life-simulator', 'timebox', 'settings'];
        const container = document.getElementById('moduleOrderList');
        
        if (!container) return;

        container.innerHTML = currentOrder.map(moduleId => {
            const module = modules.find(m => m.id === moduleId);
            if (!module) return '';
            
            return `
                <div class="module-order-item" data-module-id="${module.id}" draggable="true">
                    <div class="module-drag-handle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="5" r="1"/>
                            <circle cx="9" cy="12" r="1"/>
                            <circle cx="9" cy="19" r="1"/>
                            <circle cx="15" cy="5" r="1"/>
                            <circle cx="15" cy="12" r="1"/>
                            <circle cx="15" cy="19" r="1"/>
                        </svg>
                    </div>
                    <div class="module-info">
                        <div class="module-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="${module.icon}"/>
                            </svg>
                        </div>
                        <div class="module-details">
                            <h4>${module.name}</h4>
                            <p>${module.subtitle}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.initializeDragAndDrop();
    }

    // 初始化拖拽功能
    initializeDragAndDrop() {
        const container = document.getElementById('moduleOrderList');
        if (!container) return;

        let draggedElement = null;

        container.addEventListener('dragstart', (e) => {
            draggedElement = e.target.closest('.module-order-item');
            if (draggedElement) {
                draggedElement.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        container.addEventListener('dragend', (e) => {
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                draggedElement = null;
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const afterElement = this.getDragAfterElement(container, e.clientY);
            if (draggedElement && draggedElement !== afterElement) {
                if (afterElement == null) {
                    container.appendChild(draggedElement);
                } else {
                    container.insertBefore(draggedElement, afterElement);
                }
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            this.saveModuleOrder();
        });
    }

    // 計算拖拽位置
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.module-order-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // 保存模組順序
    async saveModuleOrder() {
        const items = document.querySelectorAll('.module-order-item');
        const newOrder = Array.from(items).map(item => item.dataset.moduleId);
        
        this.settings.module_order = newOrder;
        this.settings.updated_at = new Date().toISOString();
        
        await this.saveSettings();
        
        // 通知儀表板更新模組順序
        if (window.dashboardManager && window.dashboardManager.reorderModules) {
            window.dashboardManager.reorderModules(newOrder);
        }
        
        console.log('模組順序已更新:', newOrder);
    }

    // 重置模組順序
    async resetModuleOrder() {
        if (!this.showConfirm('確定要重置模組順序為預設值嗎？', () => {})) return;
        
        const defaultOrder = ['overview', 'todos', 'calendar', 'finance', 'projects', 'life-simulator', 'timebox', 'settings'];
        this.settings.module_order = defaultOrder;
        this.settings.updated_at = new Date().toISOString();
        
        await this.saveSettings();
        this.loadModuleOrder();
        
        // 通知儀表板更新模組順序
        if (window.dashboardManager && window.dashboardManager.reorderModules) {
            window.dashboardManager.reorderModules(defaultOrder);
        }
        
        console.log('模組順序已重置為預設值');
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // 取得部署時間（系統建置時間）
    getDeploymentTime() {
        // 設定為當前時間（每次部署都會更新）
        const buildTime = new Date('2025-09-03T23:30:00+08:00'); // 最新部署時間
        const now = new Date();
        const diffMinutes = Math.floor((now - buildTime) / (1000 * 60));
        
        if (diffMinutes < 60) {
            return `${diffMinutes} 分鐘前`;
        } else if (diffMinutes < 1440) { // 24小時
            const hours = Math.floor(diffMinutes / 60);
            return `${hours} 小時前`;
        } else {
            const days = Math.floor(diffMinutes / 1440);
            return `${days} 天前`;
        }
    }

    // 檢查是否為管理員
    isAdmin() {
        // William的UUID和其他已知管理員UUID
        const adminUUIDs = [
            '550e8400-e29b-41d4-a716-446655440001', // William
            // 可以在這裡加入Carson的UUID
        ];
        
        console.log('權限檢查 - userId:', this.userId); // 調試用
        const isUserAdmin = adminUUIDs.includes(this.userId);
        console.log('是否為管理員:', isUserAdmin); // 調試用
        return isUserAdmin;
    }

    // 載入用戶清單
    async loadUserList() {
        const container = document.getElementById('userManagementContent');
        if (!container) return;
        
        container.innerHTML = `
            <div style="margin: 16px 0; padding: 16px; background: var(--bg); border-radius: 8px; border-left: 4px solid var(--primary);">
                <h4 style="margin: 0 0 12px 0; color: var(--text); font-size: 14px;">已知用戶</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 6px; border: 1px solid var(--border);">
                        <div>
                            <span style="font-weight: 500; color: var(--text);">William (管理員)</span>
                            <div style="font-size: 12px; color: var(--text-light);">完整權限 - 所有模組</div>
                        </div>
                        <span style="color: var(--accent); font-size: 12px; font-weight: 600;">ADMIN</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 6px; border: 1px solid var(--border);">
                        <div>
                            <span style="font-weight: 500; color: var(--text);">Carson (管理員)</span>
                            <div style="font-size: 12px; color: var(--text-light);">完整權限 - 所有模組</div>
                        </div>
                        <span style="color: var(--accent); font-size: 12px; font-weight: 600;">ADMIN</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 顯示權限矩陣
    async showPermissionMatrix() {
        const container = document.getElementById('userManagementContent');
        if (!container) return;
        
        const modules = [
            { id: 'overview', name: '總覽', basic: true },
            { id: 'todos', name: '待辦事項', basic: true },
            { id: 'calendar', name: '行事曆', basic: true },
            { id: 'finance', name: '金流', basic: true },
            { id: 'projects', name: '專案管理', basic: false, advanced: true },
            { id: 'life-simulator', name: '人生模擬器', basic: true },
            { id: 'timebox', name: '時間盒', basic: true },
            { id: 'settings', name: '系統設定', basic: true }
        ];
        
        container.innerHTML = `
            <div style="margin: 16px 0; padding: 16px; background: var(--bg); border-radius: 8px; border-left: 4px solid var(--accent);">
                <h4 style="margin: 0 0 16px 0; color: var(--text); font-size: 14px;">權限控制建議</h4>
                
                <div style="margin-bottom: 16px;">
                    <h5 style="margin: 0 0 8px 0; font-size: 13px; color: var(--primary);">用戶群組概念：</h5>
                    
                    <div style="display: grid; gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid var(--border);">
                            <div style="font-weight: 500; color: var(--text); margin-bottom: 4px;">👑 管理員 (William, Carson)</div>
                            <div style="font-size: 12px; color: var(--text-light);">所有模組 + 人員管理權限</div>
                        </div>
                        
                        <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid var(--border);">
                            <div style="font-weight: 500; color: var(--text); margin-bottom: 4px;">💼 專案用戶</div>
                            <div style="font-size: 12px; color: var(--text-light);">包含專案管理和打包功能</div>
                            <div style="font-size: 11px; color: var(--text-light); margin-top: 4px;">模組：${modules.filter(m => m.basic || m.advanced).map(m => m.name).join('、')}</div>
                        </div>
                        
                        <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid var(--border);">
                            <div style="font-weight: 500; color: var(--text); margin-bottom: 4px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 一般用戶</div>
                            <div style="font-size: 12px; color: var(--text-light);">基本功能，不包含專案管理</div>
                            <div style="font-size: 11px; color: var(--text-light); margin-top: 4px;">模組：${modules.filter(m => m.basic && !m.advanced).map(m => m.name).join('、')}</div>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 12px; background: rgba(139, 115, 85, 0.1); border-radius: 6px; border: 1px solid rgba(139, 115, 85, 0.2);">
                    <div style="font-size: 13px; color: var(--text); font-weight: 500; margin-bottom: 8px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21h6M12 3c4.97 0 9 4.03 9 9 0 2.5-1 4.5-3 6l-2 2H8l-2-2c-2-1.5-3-3.5-3-6 0-4.97 4.03-9 9-9z"/></svg> 實作建議：</div>
                    <div style="font-size: 12px; color: var(--text-light); line-height: 1.5;">
                        • 在 settings.js 中為每個用戶設定 available_modules 陣列<br>
                        • 一般用戶移除 'projects' 模組，直接看不到專案功能<br>
                        • 專案模組內部也可檢查權限，隱藏特定功能按鈕<br>
                        • 使用 user_id 判斷用戶類型和可用功能
                    </div>
                </div>
            </div>
        `;
    }
}

export { SettingsModule 
    // 模組清理方法 - 符合規範要求
    destroy() {
        // 清理事件監聽器
        if (this.eventListeners) {
            this.eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners = [];
        }
        
        // 清理定時器
        if (this.intervals) {
            this.intervals.forEach(id => clearInterval(id));
            this.intervals = [];
        }
        if (this.timeouts) {
            this.timeouts.forEach(id => clearTimeout(id));
            this.timeouts = [];
        }
        
        // 清理資料
        this.data = null;
        this.currentUser = null;
        
        // 重置 activeModule
        if (window.activeModule === this) {
            window.activeModule = null;
        }
        
        console.log(`${this.constructor.name} destroyed`);
    }
}

export { SettingsModule };