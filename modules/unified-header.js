/**
 * 統一歡迎卡片樣式模板
 * 所有模組都應該使用這個結構
 */

// 統一的歡迎卡片 HTML 結構
function getUnifiedHeaderHTML(moduleInfo, buttonsHTML = '') {
    return `
        <div class="module-header" style="
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
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        ">
            <!-- 左側：圖示和文字 -->
            <div style="
                display: flex;
                align-items: center;
                gap: 16px;
            ">
                <!-- 圖示容器 -->
                <div class="module-icon" style="
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border-radius: 12px;
                    color: white;
                    flex-shrink: 0;
                ">
                    ${moduleInfo.icon}
                </div>
                
                <!-- 文字容器 -->
                <div>
                    <h2 style="
                        margin: 0;
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: var(--text);
                        line-height: 1.4;
                    ">${moduleInfo.name}</h2>
                    <p style="
                        margin: 0;
                        font-size: 0.875rem;
                        color: var(--text-light);
                        line-height: 1.4;
                    ">${moduleInfo.subtitle}</p>
                </div>
            </div>
            
            <!-- 右側：按鈕區 -->
            <div class="module-actions" style="
                display: flex;
                align-items: center;
                gap: 12px;
            ">
                ${buttonsHTML}
            </div>
        </div>
    `;
}

// 統一的按鈕樣式
function getUnifiedButtonStyle() {
    return `
        padding: 8px 16px;
        background: white;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text);
        height: 36px;
    `;
}

// 統一的主按鈕樣式
function getUnifiedPrimaryButtonStyle() {
    return `
        padding: 8px 16px;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: white;
        height: 36px;
        font-weight: 500;
    `;
}

export { getUnifiedHeaderHTML, getUnifiedButtonStyle, getUnifiedPrimaryButtonStyle 
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

export { UnifiedHeaderModule };