/**
 * 主題管理系統 - 遊戲人生 3.0
 * 支援動態主題切換與CSS變數覆蓋
 */

class ThemeManager {
    constructor() {
        this.themes = {
            'zen': {
                name: '枯山水（預設）',
                description: '原有的日系禪意風格，金棕色配青苔綠',
                cssFile: null, // 使用現有CSS
                gradient: 'linear-gradient(135deg, #c9a961 0%, #7a8b74 100%)'
            },
            'desert-oasis': {
                name: '沙漠綠洲',
                description: '溫暖與清新的完美融合，沙橙配深森綠',
                cssFile: './themes/desert-oasis.css',
                gradient: 'linear-gradient(135deg, #f4a460 0%, #2f4f2f 100%)'
            },
            'ivory-charcoal': {
                name: '象牙炭灰',
                description: '溫潤與深沉的永恆優雅，象牙白配炭灰',
                cssFile: './themes/ivory-charcoal.css',
                gradient: 'linear-gradient(135deg, #f5deb3 0%, #696969 100%)'
            },
            'autumn-golden': {
                name: '秋日黃金',
                description: '溫暖的秋日黃金配深綠，如同秋葉與森林的完美融合',
                cssFile: './themes/autumn-golden.css',
                gradient: 'linear-gradient(135deg, #cd853f 0%, #355e3b 100%)'
            },
            'dark': {
                name: '深色模式',
                description: '適合夜晚使用的深色主題',
                cssFile: null // 待實現
            },
            'light': {
                name: '明亮模式',
                description: '清爽明亮的白色主題',
                cssFile: null // 待實現
            },
            'jazz': {
                name: '爵士咖啡',
                description: '溫暖的咖啡色調主題',
                cssFile: null // 待實現
            }
        };
        
        this.currentTheme = localStorage.getItem('selected-theme') || 'autumn-golden';
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

            console.log(`✅ 主題已切換至: ${this.themes[themeId].name}`);
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
            console.log(`🎨 主題系統初始化完成，當前主題: ${this.themes[this.currentTheme].name}`);
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
}
