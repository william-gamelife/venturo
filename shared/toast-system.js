/**
 * Toast 通知系統
 * 替換所有 alert() 和 confirm() 使用
 * 符合遊戲人生框架規範
 */

class ToastSystem {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        if (document.getElementById('toast-container')) {
            return; // 已初始化
        }

        // 創建容器
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);

        // 添加樣式
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }

            .toast {
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid rgba(155, 139, 126, 0.2);
                border-radius: 8px;
                padding: 16px 20px;
                max-width: 400px;
                min-width: 300px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(8px);
                pointer-events: auto;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: flex-start;
                gap: 12px;
                position: relative;
                overflow: hidden;
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .toast::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: var(--toast-color);
            }

            .toast-icon {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                margin-top: 1px;
                color: var(--toast-color);
            }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: 500;
                font-size: 14px;
                margin: 0 0 4px 0;
                color: #4a4a4a;
            }

            .toast-message {
                font-size: 13px;
                line-height: 1.4;
                color: #666;
                margin: 0;
            }

            .toast-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .toast-button {
                padding: 6px 12px;
                border: 1px solid rgba(155, 139, 126, 0.3);
                border-radius: 4px;
                background: transparent;
                color: #9B8B7E;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .toast-button:hover {
                background: rgba(155, 139, 126, 0.1);
            }

            .toast-button.primary {
                background: #9B8B7E;
                color: white;
                border-color: #9B8B7E;
            }

            .toast-button.primary:hover {
                background: #8A7A6D;
            }

            .toast-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                width: 24px;
                height: 24px;
                cursor: pointer;
                opacity: 0.5;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .toast-close:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.1);
            }

            /* Toast 類型顏色 */
            .toast.info { --toast-color: #3b82f6; }
            .toast.success { --toast-color: #10b981; }
            .toast.warning { --toast-color: #f59e0b; }
            .toast.error { --toast-color: #ef4444; }
            .toast.confirm { --toast-color: #8b5cf6; }

            /* 響應式設計 */
            @media (max-width: 480px) {
                .toast-container {
                    left: 16px;
                    right: 16px;
                    top: 16px;
                }
                
                .toast {
                    min-width: unset;
                    max-width: unset;
                }
            }

            /* 暗色主題支援 */
            [data-theme="dark"] .toast {
                background: rgba(40, 40, 40, 0.95);
                border-color: rgba(155, 139, 126, 0.3);
            }

            [data-theme="dark"] .toast-title {
                color: #e5e5e5;
            }

            [data-theme="dark"] .toast-message {
                color: #b3b3b3;
            }
        `;
        document.head.appendChild(style);
    }

    // 獲取圖標 SVG
    getIcon(type) {
        const icons = {
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M12 2L2 22h20L12 2z"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            confirm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>'
        };
        return icons[type] || icons.info;
    }

    // 顯示 Toast 通知
    show(message, type = 'info', options = {}) {
        const {
            title = this.getDefaultTitle(type),
            duration = this.getDefaultDuration(type),
            closable = true,
            actions = []
        } = options;

        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;

        // 創建內容
        let actionsHTML = '';
        if (actions.length > 0) {
            actionsHTML = `
                <div class="toast-actions">
                    ${actions.map((action, index) => 
                        `<button class="toast-button ${action.primary ? 'primary' : ''}" data-action="${index}">
                            ${action.label}
                        </button>`
                    ).join('')}
                </div>
            `;
        }

        toast.innerHTML = `
            <div class="toast-icon">${this.getIcon(type)}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
                ${actionsHTML}
            </div>
            ${closable ? '<button class="toast-close">✕</button>' : ''}
        `;

        // 添加到容器
        this.container.appendChild(toast);

        // 綁定事件
        this.bindToastEvents(toast, toastId, actions);

        // 顯示動畫
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 自動關閉
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toastId);
            }, duration);
        }

        // 儲存引用
        this.toasts.set(toastId, toast);

        return toastId;
    }

    // 綁定 Toast 事件
    bindToastEvents(toast, toastId, actions) {
        // 關閉按鈕
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(toastId);
            });
        }

        // 動作按鈕
        const actionButtons = toast.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const actionIndex = parseInt(e.target.dataset.action);
                const action = actions[actionIndex];
                if (action && action.handler) {
                    action.handler();
                }
                this.hide(toastId);
            });
        });
    }

    // 隱藏 Toast
    hide(toastId) {
        const toast = this.toasts.get(toastId);
        if (!toast) return;

        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    // 清除所有 Toast
    clear() {
        this.toasts.forEach((toast, id) => {
            this.hide(id);
        });
    }

    // 取得預設標題
    getDefaultTitle(type) {
        const titles = {
            info: '提示',
            success: '成功',
            warning: '警告',
            error: '錯誤',
            confirm: '確認'
        };
        return titles[type] || '通知';
    }

    // 取得預設持續時間
    getDefaultDuration(type) {
        const durations = {
            info: 4000,
            success: 3000,
            warning: 5000,
            error: 6000,
            confirm: 0 // 不自動關閉
        };
        return durations[type] || 4000;
    }

    // 便捷方法
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    // 確認對話框 (替代 confirm())
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const {
                title = '確認操作',
                confirmText = '確認',
                cancelText = '取消'
            } = options;

            this.show(message, 'confirm', {
                title,
                duration: 0, // 不自動關閉
                closable: false,
                actions: [
                    {
                        label: cancelText,
                        handler: () => resolve(false)
                    },
                    {
                        label: confirmText,
                        primary: true,
                        handler: () => resolve(true)
                    }
                ]
            });
        });
    }
}

// 全域實例
window.toastSystem = window.toastSystem || new ToastSystem();

// 為模組提供的便捷方法
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastSystem;
}

// 全域方法（向後相容）
window.showToast = (message, type, options) => {
    return window.toastSystem.show(message, type, options);
};

window.showConfirm = (message, options) => {
    return window.toastSystem.confirm(message, options);
};