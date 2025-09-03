/**
 * 主題管理系統 - 遊戲人生 3.0
 * 支援動態主題切換與CSS變數覆蓋
 */

class ThemeManager {
    
    // Toast 通知系統
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">
                    ${type === 'success' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' : type === 'error' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' : 'ⓘ'}
                </span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // 添加樣式（如果尚未存在）
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    min-width: 300px;
                    padding: 12px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    animation: toastSlideIn 0.3s ease;
                }
                .toast-info { background: #e3f2fd; border-left: 4px solid #2196f3; color: #1976d2; }
                .toast-success { background: #e8f5e8; border-left: 4px solid #4caf50; color: #2e7d32; }
                .toast-error { background: #ffebee; border-left: 4px solid #f44336; color: #c62828; }
                .toast-content { display: flex; align-items: center; gap: 8px; }
                .toast-close { background: none; border: none; font-size: 18px; cursor: pointer; margin-left: auto; }
                @keyframes toastSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // 自動移除
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
        
        return toast;
    }

    // Toast 確認對話框
    showConfirm(message, onConfirm, onCancel = null) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-content">
                    <h3>確認操作</h3>
                    <p>${message}</p>
                    <div class="confirm-actions">
                        <button class="btn btn-secondary cancel-btn">取消</button>
                        <button class="btn btn-primary confirm-btn">確定</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加樣式
        if (!document.getElementById('confirm-styles')) {
            const style = document.createElement('style');
            style.id = 'confirm-styles';
            style.textContent = `
                .confirm-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); z-index: 10001;
                    display: flex; align-items: center; justify-content: center;
                }
                .confirm-dialog {
                    background: white; border-radius: 12px; padding: 24px;
                    min-width: 320px; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                }
                .confirm-content h3 { margin: 0 0 16px; color: #333; }
                .confirm-content p { margin: 0 0 24px; color: #666; line-height: 1.5; }
                .confirm-actions { display: flex; gap: 12px; justify-content: flex-end; }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
        
        // 事件處理
        overlay.querySelector('.cancel-btn').onclick = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };
        
        overlay.querySelector('.confirm-btn').onclick = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        };
    }

    constructor() {
        window.activeModule = this;
        
        this.themes = {
            'zen': {
                name: '枯山水（預設）',
                description: '原有的日系禪意風格，金棕色配青苔綠',
                cssFile: null, // 使用現有CSS
                gradient: 'linear-gradient(135deg, #c9a961 0%, #7a8b74 100%)'
            },
            'midnight-blue': {
                name: '午夜藍調',
                description: '莫蘭迪深色系，低對比護眼金屬質感',
                cssFile: './themes/midnight-blue.css',
                gradient: 'linear-gradient(135deg, #2C3339 0%, #B4A69A 100%)'
            },
            'moss-path': {
                name: '青苔石徑',
                description: '日式侘寂自然質感，和紙般的溫潤手感',
                cssFile: './themes/moss-path.css',
                gradient: 'linear-gradient(135deg, #DDE0D7 0%, #6B7261 100%)'
            },
            'fog-tea': {
                name: '霧灰茶韻',
                description: '極簡線條美學，毛玻璃效果暖灰配色',
                cssFile: './themes/fog-tea.css',
                gradient: 'linear-gradient(135deg, #E8E2DB 0%, #7A6F65 100%)'
            },
            'ivory-charcoal': {
                name: '象牙炭灰',
                description: '溫潤與深沉的永恆優雅，象牙白配炭灰',
                cssFile: './themes/ivory-charcoal.css',
                gradient: 'linear-gradient(135deg, #f5deb3 0%, #696969 100%)'
            },
            'desert-oasis': {
                name: '沙漠綠洲',
                description: '沙漠金與綠洲藍的經典配色',
                cssFile: './themes/desert-oasis.css',
                gradient: 'linear-gradient(135deg, #D4B896 0%, #6B8E7F 100%)'
            },
            'autumn-golden': {
                name: '秋日金輝',
                description: '溫暖的秋日金黃色調',
                cssFile: './themes/autumn-golden.css',
                gradient: 'linear-gradient(135deg, #D4A574 0%, #8B6F47 100%)'
            }
        };
        
        this.currentTheme = localStorage.getItem('selected-theme') || 'zen';
        this.loadedThemeLinks = new Map(); // 追蹤已載入的主題CSS
    }

    /**
     * 載入指定主題
     * @param {string} themeId 主題ID
     */
    async loadTheme(themeId) {
        if (!this.themes[themeId]) {
            console.error(`主題 ${themeId} 不存在`);
            return false;
        }

        try {
            // 移除舊的主題CSS（保留預設樣式）
            this.removeThemeCSS();

            // 設定HTML根元素的data-theme屬性
            document.documentElement.setAttribute('data-theme', themeId);
            document.body.setAttribute('data-theme', themeId);

            // 如果是非預設主題，載入對應的CSS檔案
            if (this.themes[themeId].cssFile) {
                await this.loadThemeCSS(themeId);
            }

            // 儲存主題選擇
            localStorage.setItem('selected-theme', themeId);
            this.currentTheme = themeId;

            // 觸發主題變更事件
            this.dispatchThemeChangeEvent(themeId);

            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 主題已切換至: ${this.themes[themeId].name}`);
            return true;

        } catch (error) {
            console.error('載入主題失敗:', error);
            return false;
        }
    }

    /**
     * 載入主題CSS檔案
     * @param {string} themeId 主題ID
     */
    async loadThemeCSS(themeId) {
        const theme = this.themes[themeId];
        if (!theme.cssFile) return;

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.id = `theme-css-${themeId}`;
            link.rel = 'stylesheet';
            link.href = theme.cssFile;
            
            link.onload = () => {
                this.loadedThemeLinks.set(themeId, link);
                resolve();
            };
            
            link.onerror = () => {
                reject(new Error(`無法載入主題CSS: ${theme.cssFile}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * 移除所有主題CSS（保留預設樣式）
     */
    removeThemeCSS() {
        // 移除所有主題CSS連結
        this.loadedThemeLinks.forEach((link, themeId) => {
            if (link && link.parentNode) {
                link.parentNode.removeChild(link);
            }
        });
        this.loadedThemeLinks.clear();

        // 也移除可能存在的舊式CSS連結
        const existingThemeLink = document.getElementById('theme-css');
        if (existingThemeLink) {
            existingThemeLink.remove();
        }
    }

    /**
     * 觸發主題變更事件
     * @param {string} themeId 主題ID
     */
    dispatchThemeChangeEvent(themeId) {
        const theme = this.themes[themeId];
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { 
                themeId, 
                themeName: theme.name,
                themeDescription: theme.description,
                gradient: theme.gradient
            } 
        }));
    }

    /**
     * 獲取當前主題
     * @returns {string} 當前主題ID
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 獲取當前主題資訊
     * @returns {Object} 主題資訊物件
     */
    getCurrentThemeInfo() {
        return this.themes[this.currentTheme];
    }

    /**
     * 獲取所有可用主題
     * @returns {Object} 主題物件
     */
    getThemes() {
        return this.themes;
    }

    /**
     * 獲取可用的主題列表（用於下拉選單）
     * @returns {Array} 主題選項陣列
     */
    getThemeOptions() {
        return Object.entries(this.themes).map(([id, theme]) => ({
            value: id,
            label: theme.name,
            description: theme.description,
            gradient: theme.gradient
        }));
    }

    /**
     * 初始化主題系統（頁面載入時調用）
     */
    async init() {
        try {
            await this.loadTheme(this.currentTheme);
            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> 主題系統初始化完成，當前主題: ${this.themes[this.currentTheme].name}`);
        } catch (error) {
            console.error('主題系統初始化失敗:', error);
            // 如果載入失敗，回退到預設主題
            if (this.currentTheme !== 'zen') {
                console.log('回退到預設主題...');
                await this.loadTheme('zen');
            }
        }
    }

    /**
     * 預載入主題CSS（可選，用於提升切換速度）
     * @param {Array} themeIds 要預載入的主題ID陣列
     */
    async preloadThemes(themeIds = []) {
        const promises = themeIds
            .filter(id => this.themes[id] && this.themes[id].cssFile)
            .map(async (id) => {
                if (!this.loadedThemeLinks.has(id)) {
                    try {
                        await this.loadThemeCSS(id);
                        console.log(`📦 預載入主題: ${this.themes[id].name}`);
                    } catch (error) {
                        console.warn(`預載入主題失敗 ${id}:`, error);
                    }
                }
            });
        
        await Promise.all(promises);
    }

    /**
     * 切換到下一個主題（用於快捷鍵或測試）
     */
    async switchToNextTheme() {
        const themeIds = Object.keys(this.themes);
        const currentIndex = themeIds.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeIds.length;
        const nextThemeId = themeIds[nextIndex];
        
        await this.loadTheme(nextThemeId);
    }
}

// 匯出主題管理器
export { ThemeManager };

// 如果在非模組環境中使用，將其附加到全域物件
if (typeof window !== 'undefined') {
    window.ThemeManager = ThemeManager;

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

export { ThemesModule };