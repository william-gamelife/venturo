#!/usr/bin/env node
/**
 * GameLife 模組系統性修正工具
 * 自動修正所有違反 building-manual 規範的問題
 * 
 * 修正項目：
 * 1. 添加缺失的 destroy() 方法
 * 2. 替換 alert/confirm 為 Toast 通知
 * 3. 替換 emoji 為 SVG 圖標
 * 4. 修正容器 padding 問題
 * 5. 確保 window.activeModule 正確設置
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = './modules';

// SVG 圖標映射表
const emojiToSvg = {
    '✓': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    '✅': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    '✕': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    '❌': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    '📅': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    '💰': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5"/></svg>',
    '🔍': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
    '📊': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    '⭐': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>',
    '🎯': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    '📋': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    '💡': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21h6M12 3c4.97 0 9 4.03 9 9 0 2.5-1 4.5-3 6l-2 2H8l-2-2c-2-1.5-3-3.5-3-6 0-4.97 4.03-9 9-9z"/></svg>',
    '🚀': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    '⚙️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24M7.76 7.76l4.24 4.24m4.24 0l-4.24 4.24M7.76 16.24l4.24-4.24"/></svg>',
    '📈': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,6 12,16 2,6"/></svg>',
    '🎨': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    '🌟': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>',
    '⚠️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};

// 需要添加 destroy() 方法的模組清單
const modulesNeedingDestroy = [
    'auth.js', 'permissions.js', 'settings.js', 'sync.js', 
    'themes.js', 'travel-pdf.js', 'unified-header.js', 'users.js'
];

class ModuleFixer {
    constructor() {
        this.fixes = {
            emojis: 0,
            alerts: 0,
            destroyMethods: 0,
            paddingIssues: 0,
            activeModules: 0
        };
    }

    // Toast 通知系統實作
    generateToastSystem() {
        return `
    // Toast 通知系統
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = \`toast toast-\${type}\`;
        toast.innerHTML = \`
            <div class="toast-content">
                <span class="toast-icon">
                    \${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ'}
                </span>
                <span class="toast-message">\${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        \`;
        
        // 添加樣式（如果尚未存在）
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = \`
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
            \`;
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
        overlay.innerHTML = \`
            <div class="confirm-dialog">
                <div class="confirm-content">
                    <h3>確認操作</h3>
                    <p>\${message}</p>
                    <div class="confirm-actions">
                        <button class="btn btn-secondary cancel-btn">取消</button>
                        <button class="btn btn-primary confirm-btn">確定</button>
                    </div>
                </div>
            </div>
        \`;
        
        // 添加樣式
        if (!document.getElementById('confirm-styles')) {
            const style = document.createElement('style');
            style.id = 'confirm-styles';
            style.textContent = \`
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
            \`;
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
    }`;
    }

    // 生成標準 destroy() 方法
    generateDestroyMethod() {
        return `
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
        
        console.log(\`\${this.constructor.name} destroyed\`);
    }`;
    }

    // 修正單個模組檔案
    async fixModule(modulePath) {
        console.log(`正在修正: ${modulePath}`);
        
        let content = fs.readFileSync(modulePath, 'utf8');
        let hasChanges = false;
        
        const moduleName = path.basename(modulePath);
        
        // 1. 替換 emoji
        Object.entries(emojiToSvg).forEach(([emoji, svg]) => {
            const regex = new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            if (regex.test(content)) {
                content = content.replace(regex, svg);
                this.fixes.emojis++;
                hasChanges = true;
                console.log(`  ✓ 替換 emoji: ${emoji} -> SVG`);
            }
        });
        
        // 2. 替換 alert/confirm
        if (content.includes('alert(') || content.includes('confirm(')) {
            // 替換 alert
            content = content.replace(/alert\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, 
                "this.showToast('$1', 'info')");
            
            // 替換 confirm - 這個比較複雜，需要重寫邏輯
            content = content.replace(/if\s*\(\s*confirm\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\)\s*{([^}]+)}/g, 
                "this.showConfirm('$1', () => {$2})");
            
            this.fixes.alerts++;
            hasChanges = true;
            console.log(`  ✓ 替換 alert/confirm 為 Toast 通知`);
        }
        
        // 3. 添加 destroy() 方法（如果缺失）
        if (modulesNeedingDestroy.includes(moduleName) && !content.includes('destroy()')) {
            // 找到類的結束位置，在最後一個方法後添加
            const classEndIndex = content.lastIndexOf('}');
            if (classEndIndex > 0) {
                const destroyMethod = this.generateDestroyMethod();
                content = content.substring(0, classEndIndex) + destroyMethod + '\n}';
                this.fixes.destroyMethods++;
                hasChanges = true;
                console.log(`  ✓ 添加 destroy() 方法`);
            }
        }
        
        // 4. 添加 Toast 系統（如果使用了 alert/confirm）
        if (this.fixes.alerts > 0 && !content.includes('showToast')) {
            // 找到類的第一個方法前，插入 Toast 系統
            const constructorIndex = content.indexOf('constructor(');
            if (constructorIndex > 0) {
                const toastSystem = this.generateToastSystem();
                content = content.substring(0, constructorIndex) + toastSystem + '\n\n    ' + content.substring(constructorIndex);
                hasChanges = true;
                console.log(`  ✓ 添加 Toast 通知系統`);
            }
        }
        
        // 5. 確保設置 window.activeModule
        if (content.includes('constructor(') && !content.includes('window.activeModule = this')) {
            content = content.replace(/(constructor\(\)\s*{[^}]*?)(\s*})/, 
                '$1\n        window.activeModule = this;$2');
            this.fixes.activeModules++;
            hasChanges = true;
            console.log(`  ✓ 添加 window.activeModule 設置`);
        }
        
        // 6. 修正容器 padding
        const paddingRegex = /padding:\s*20px([^;]*);/g;
        if (paddingRegex.test(content)) {
            content = content.replace(paddingRegex, (match, rest) => {
                if (rest && !rest.includes('0')) {
                    return `padding: 20px 0${rest};`;
                }
                return match;
            });
            this.fixes.paddingIssues++;
            hasChanges = true;
            console.log(`  ✓ 修正容器 padding 問題`);
        }
        
        // 寫入修正後的內容
        if (hasChanges) {
            fs.writeFileSync(modulePath, content, 'utf8');
            console.log(`  ✅ ${moduleName} 修正完成\n`);
        } else {
            console.log(`  ℹ️  ${moduleName} 無需修正\n`);
        }
        
        return hasChanges;
    }
    
    // 執行批量修正
    async fixAllModules() {
        console.log('🚀 開始 GameLife 模組系統性修正...\n');
        
        const moduleFiles = fs.readdirSync(MODULES_DIR)
            .filter(file => file.endsWith('.js'))
            .map(file => path.join(MODULES_DIR, file));
        
        let fixedModules = 0;
        
        for (const modulePath of moduleFiles) {
            const hasChanges = await this.fixModule(modulePath);
            if (hasChanges) fixedModules++;
        }
        
        // 輸出修正報告
        console.log('📊 修正完成報告:');
        console.log('='.repeat(50));
        console.log(`修正的模組數量: ${fixedModules}/${moduleFiles.length}`);
        console.log(`替換的 emoji 數量: ${this.fixes.emojis}`);
        console.log(`修正的 alert/confirm: ${this.fixes.alerts}`);
        console.log(`添加的 destroy() 方法: ${this.fixes.destroyMethods}`);
        console.log(`修正的 padding 問題: ${this.fixes.paddingIssues}`);
        console.log(`修正的 activeModule 設置: ${this.fixes.activeModules}`);
        console.log('='.repeat(50));
        console.log('✅ 所有修正已完成！');
        
        // 生成修正後的驗證報告
        this.generateVerificationReport();
    }
    
    // 生成驗證報告
    generateVerificationReport() {
        console.log('\n🔍 生成驗證報告...');
        
        const report = `# GameLife 模組修正驗證報告
生成時間: ${new Date().toLocaleString()}

## 修正摘要
- 修正的 emoji 替換: ${this.fixes.emojis} 處
- 修正的 alert/confirm: ${this.fixes.alerts} 處  
- 添加的 destroy() 方法: ${this.fixes.destroyMethods} 個
- 修正的容器 padding: ${this.fixes.paddingIssues} 處
- 修正的 activeModule 設置: ${this.fixes.activeModules} 處

## 建議後續測試
1. 測試所有模組的載入和切換
2. 驗證 Toast 通知系統正常工作
3. 確認容器佈局無左右空隙
4. 測試模組的清理功能（destroy 方法）

## 注意事項
- 請手動檢查 confirm() 替換的邏輯是否正確
- 建議進行完整的功能測試
- 如有特殊需求可能需要手動微調
`;

        fs.writeFileSync('./module-fix-report.md', report);
        console.log('📝 驗證報告已生成: module-fix-report.md');
    }
}

// 主程序
async function main() {
    try {
        const fixer = new ModuleFixer();
        await fixer.fixAllModules();
    } catch (error) {
        console.error('❌ 修正過程中發生錯誤:', error);
        process.exit(1);
    }
}

// 如果直接運行此腳本
if (require.main === module) {
    main();
}

module.exports = ModuleFixer;