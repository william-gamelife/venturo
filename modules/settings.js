/**
 * 系統設定模組 - 遊戲人生 3.0
 * 純雲端架構，個人化設定與偏好，UUID隔離
 */

class SettingsModule {
    constructor() {
        this.syncManager = null;
        this.userId = null;
        this.settings = {};
        this.themes = {
            'zen': '枯山水',
            'dark': '深色模式',
            'light': '明亮模式',
            'jazz': '爵士咖啡'
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
        this.userId = userId;
        
        // 動態導入 sync manager
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 載入資料
        await this.loadData();
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = `
            <div class="settings-container" style="height: 100%; min-height: 500px;">
                <!-- 設定區塊 - 不需要標題，dashboard已有 -->

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
                                <option value="zen">枯山水（預設）</option>
                                <option value="dark">深色模式</option>
                                <option value="light">明亮模式</option>
                                <option value="jazz">爵士咖啡</option>
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

                    <!-- 同步設定 -->
                    <div class="setting-section" style="background: var(--card); border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                        <h3 style="margin: 0 0 16px 0; color: var(--accent); font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            同步設定
                        </h3>
                        
                        <div class="setting-item" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text); font-size: 14px;">同步間隔</label>
                            <select id="syncIntervalSelect" onchange="window.activeModule.updateSetting('sync_interval', parseInt(this.value))"
                                    style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: white;">
                                <option value="15">15秒（快速）</option>
                                <option value="30">30秒（預設）</option>
                                <option value="60">1分鐘</option>
                                <option value="300">5分鐘</option>
                            </select>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: var(--text-light);">設定資料與雲端同步的頻率</p>
                        </div>

                        <div class="setting-item">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" id="autoSave" onchange="window.activeModule.updatePreference('auto_save', this.checked)"
                                       style="width: 16px; height: 16px; accent-color: var(--primary);" checked>
                                <label for="autoSave" style="font-weight: 500; color: var(--text); font-size: 14px; cursor: pointer;">自動儲存</label>
                            </div>
                            <p style="margin: 8px 0 0 28px; font-size: 12px; color: var(--text-light);">變更時立即儲存到雲端</p>
                        </div>
                    </div>

                    <!-- 通知設定 -->
                    <div class="setting-section" style="background: var(--card); border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                        <h3 style="margin: 0 0 16px 0; color: var(--text); font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            通知設定
                        </h3>
                        
                        <div class="setting-item" style="margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" id="browserNotifications" onchange="window.activeModule.updateNotification('browser', this.checked)"
                                       style="width: 16px; height: 16px; accent-color: var(--primary);" checked>
                                <label for="browserNotifications" style="font-weight: 500; color: var(--text); font-size: 14px; cursor: pointer;">瀏覽器通知</label>
                            </div>
                            <p style="margin: 8px 0 0 28px; font-size: 12px; color: var(--text-light);">在瀏覽器中顯示通知訊息</p>
                        </div>

                        <div class="setting-item" style="margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" id="soundNotifications" onchange="window.activeModule.updateNotification('sound', this.checked)"
                                       style="width: 16px; height: 16px; accent-color: var(--primary);" checked>
                                <label for="soundNotifications" style="font-weight: 500; color: var(--text); font-size: 14px; cursor: pointer;">音效提醒</label>
                            </div>
                            <p style="margin: 8px 0 0 28px; font-size: 12px; color: var(--text-light);">操作時播放提示音效</p>
                        </div>

                        <div class="setting-item">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" id="desktopNotifications" onchange="window.activeModule.updateNotification('desktop', this.checked)"
                                       style="width: 16px; height: 16px; accent-color: var(--primary);">
                                <label for="desktopNotifications" style="font-weight: 500; color: var(--text); font-size: 14px; cursor: pointer;">桌面通知</label>
                            </div>
                            <p style="margin: 8px 0 0 28px; font-size: 12px; color: var(--text-light);">即使在其他應用程式中也顯示通知</p>
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
                                <span>同步：</span><span id="currentSyncInterval">30秒</span>
                                <span>使用者ID：</span><span style="font-family: monospace; font-size: 11px;" id="userUUID">${this.userId}</span>
                                <span>最後同步：</span><span id="lastSyncTime">尚未同步</span>
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

                <!-- 底部資訊 -->
                <div class="settings-footer" style="margin-top: 32px; padding: 20px; background: rgba(139, 115, 85, 0.05); border-radius: 12px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: var(--text-light);">
                        設定會自動儲存到雲端，並在所有裝置間同步<br>
                        變更會立即生效，無需重新載入頁面
                    </p>
                </div>
            </div>

            <style>
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
            </style>
        `;
        
        this.attachEventListeners();
        this.renderSettings();
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
                console.log(`切換主題: ${this.themes[value]}`);
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
        if (!confirm('確定要重置所有設定為預設值嗎？此操作無法復原。')) {
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
        alert('設定已重置為預設值！');
    }

    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveSettings();
            }
        });
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export { SettingsModule };