#!/usr/bin/env node
/**
 * GameLife 最終清理工具
 * 處理所有剩餘的 emoji 和 alert/confirm 問題
 */

const fs = require('fs');
const path = require('path');

// 更完整的 emoji 映射表
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
    '⚠️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    
    // 新增更多 emoji
    '🔔': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    '📝': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>',
    '⚡': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>',
    '😊': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    '🏠': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
    '🛏️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/></svg>',
    '📺': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    '💻': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    '🛋️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v9"/></svg>',
    '🍳': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
    '🎮': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="7" cy="12" r="1"/><circle cx="17" cy="10" r="1"/><circle cx="17" cy="14" r="1"/></svg>',
    '👤': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    '🎉': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="14.77 6.23L14.77 6.23L11.19 9.81 9.55 8.17L5.97 11.75L5.97 11.75L8.4 14.18L12.61 9.97L18.18 15.54 18.18 15.54 15.77 18.1L13.17 15.5 11.53 17.14L14.13 19.74 16.74 17.13 19.35 19.74 21.96 17.13 19.35 14.52 21.96 11.91 19.35 9.3 16.74 11.91 14.13 9.3 11.52 11.91 14.13 14.52 14.77 6.23L14.77 6.23Z"/></svg>',
    '🛍️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1ZM10 6a2 2 0 0 1 4 0v1h-4V6Zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10Z"/></svg>',
    '🆕': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/></svg>',
    '☁️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    '💾': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>',
    '🔄': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4v6h-6"/><polyline points="1 20v-6h6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>'
};

class FinalCleanup {
    constructor() {
        this.fixes = {
            emojis: 0,
            alerts: 0,
            confirms: 0
        };
    }

    cleanModule(filePath) {
        const moduleName = path.basename(filePath);
        console.log(`🧹 清理 ${moduleName}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;

        // 1. 更徹底的 emoji 替換
        Object.entries(emojiToSvg).forEach(([emoji, svg]) => {
            // 使用更強的正則表達式
            const regex = new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = content.match(regex);
            if (matches) {
                content = content.replace(regex, svg);
                this.fixes.emojis += matches.length;
                hasChanges = true;
                console.log(`  ✓ 替換 ${matches.length} 個 ${emoji} emoji`);
            }
        });

        // 2. 處理剩餘的 confirm 調用
        if (content.includes('confirm(')) {
            // 尋找所有 confirm 使用並替換為 showConfirm
            const confirmMatches = content.match(/confirm\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
            if (confirmMatches) {
                confirmMatches.forEach(match => {
                    const messageMatch = match.match(/['"`]([^'"`]+)['"`]/);
                    if (messageMatch) {
                        const message = messageMatch[1];
                        const replacement = `this.showConfirm('${message}', () => {})`;
                        content = content.replace(match, replacement);
                        this.fixes.confirms++;
                        hasChanges = true;
                        console.log(`  ✓ 替換 confirm: ${message}`);
                    }
                });
            }
        }

        // 3. 確保所有模組都有 Toast 系統（如果需要）
        if ((this.fixes.alerts > 0 || this.fixes.confirms > 0) && !content.includes('showToast')) {
            const toastSystem = `
    // Toast 通知系統
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = \`toast toast-\${type}\`;
        toast.innerHTML = \`
            <div class="toast-content">
                <span class="toast-message">\${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        \`;
        
        // 添加基本樣式
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = \`
                .toast { position: fixed; top: 20px; right: 20px; padding: 12px; border-radius: 8px; z-index: 10000; }
                .toast-info { background: #e3f2fd; color: #1976d2; }
                .toast-success { background: #e8f5e8; color: #2e7d32; }
                .toast-error { background: #ffebee; color: #c62828; }
            \`;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    showConfirm(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        overlay.innerHTML = \`
            <div style="background: white; border-radius: 8px; padding: 20px; min-width: 300px;">
                <p>\${message}</p>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
                    <button class="cancel-btn" style="padding: 8px 16px; border: 1px solid #ccc; background: white;">取消</button>
                    <button class="confirm-btn" style="padding: 8px 16px; background: #007bff; color: white; border: none;">確定</button>
                </div>
            </div>
        \`;
        
        document.body.appendChild(overlay);
        
        overlay.querySelector('.cancel-btn').onclick = () => overlay.remove();
        overlay.querySelector('.confirm-btn').onclick = () => { overlay.remove(); onConfirm(); };
    }

`;

            // 在 constructor 後插入
            const constructorMatch = content.match(/(constructor\(\)\s*{[^}]*})/);
            if (constructorMatch) {
                const insertPoint = content.indexOf(constructorMatch[0]) + constructorMatch[0].length;
                content = content.substring(0, insertPoint) + toastSystem + content.substring(insertPoint);
                hasChanges = true;
                console.log(`  ✓ 新增 Toast 系統`);
            }
        }

        // 4. 寫入修改
        if (hasChanges) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ ${moduleName} 清理完成\n`);
        } else {
            console.log(`  ℹ️  ${moduleName} 無需清理\n`);
        }

        return hasChanges;
    }

    async run() {
        console.log('🧹 開始最終清理作業...\n');
        
        const moduleFiles = fs.readdirSync('./modules')
            .filter(file => file.endsWith('.js'))
            .map(file => path.join('./modules', file));

        let cleanedFiles = 0;
        
        for (const moduleFile of moduleFiles) {
            if (this.cleanModule(moduleFile)) {
                cleanedFiles++;
            }
        }

        console.log('📊 清理完成報告:');
        console.log('='.repeat(40));
        console.log(`清理的檔案數量: ${cleanedFiles}/${moduleFiles.length}`);
        console.log(`替換的 emoji: ${this.fixes.emojis} 個`);
        console.log(`修正的 confirm: ${this.fixes.confirms} 個`);
        console.log('='.repeat(40));
        console.log('✅ 最終清理完成！');
    }
}

// 主程序
async function main() {
    try {
        const cleaner = new FinalCleanup();
        await cleaner.run();
    } catch (error) {
        console.error('❌ 清理過程中發生錯誤:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = FinalCleanup;