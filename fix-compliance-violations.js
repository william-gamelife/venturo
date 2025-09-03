#!/usr/bin/env node

/**
 * 遊戲人生框架規範自動修正工具
 * 修正所有模組的規範違反問題
 */

const fs = require('fs');
const path = require('path');

class ComplianceFixTool {
    constructor() {
        this.modulesDir = path.join(__dirname, 'modules');
        this.violations = [];
        this.fixed = [];
    }

    // 1. 修正按鈕綁定問題
    fixButtonBindings(content) {
        // 修正 onclick 綁定到 window.activeModule
        const buttonPatterns = [
            // 普通方法調用
            /onclick\s*=\s*['"]([\w.]+)\(/g,
            // this方法調用
            /onclick\s*=\s*['"]this\.([\w.]+)\(/g,
            // 直接方法名
            /onclick\s*=\s*['"]([a-zA-Z_$][\w$]*)\(/g
        ];

        let fixedContent = content;
        buttonPatterns.forEach(pattern => {
            fixedContent = fixedContent.replace(pattern, (match, methodName) => {
                if (methodName.includes('window.activeModule')) {
                    return match; // 已經正確
                }
                if (methodName.startsWith('this.')) {
                    methodName = methodName.substring(5);
                }
                return match.replace(methodName, `window.activeModule.${methodName}`);
            });
        });

        return fixedContent;
    }

    // 2. 修正容器 padding
    fixContainerPadding(content) {
        return content.replace(
            /(\.(module-container|facility-container|calendar-container|finance-container|todos-container)[^}]*padding:\s*)20px;/g,
            '$1 20px 0;'
        );
    }

    // 3. 添加 destroy 方法
    addDestroyMethod(content, className) {
        if (content.includes('destroy()')) {
            return content; // 已存在
        }

        const insertPoint = content.lastIndexOf('}');
        if (insertPoint === -1) return content;

        const destroyMethod = `
    /**
     * 清理模組資源 - 符合規範要求
     */
    destroy() {
        // 清理事件監聽器
        if (this.eventListeners) {
            this.eventListeners.forEach(listener => {
                listener.element.removeEventListener(listener.type, listener.handler);
            });
            this.eventListeners = [];
        }

        // 清理定時器
        if (this.timers) {
            this.timers.forEach(timer => clearTimeout(timer));
            this.timers = [];
        }

        // 清理 interval
        if (this.intervals) {
            this.intervals.forEach(interval => clearInterval(interval));
            this.intervals = [];
        }

        // 清理其他資源
        this.syncManager = null;
        this.currentUser = null;
        
        // 清理 DOM 引用
        const container = document.getElementById('moduleContainer');
        if (container) {
            container.innerHTML = '';
        }

        // 清理 activeModule 引用
        if (window.activeModule === this) {
            window.activeModule = null;
        }

        console.log('[${className}] Module destroyed and resources cleaned');
    }
`;

        return content.slice(0, insertPoint) + destroyMethod + '\n' + content.slice(insertPoint);
    }

    // 4. 移除 emoji 使用
    removeEmojis(content) {
        // 常見的 emoji 替換映射
        const emojiReplacements = {
            '✓': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>',
            '✕': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>',
            '📅': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
            '💰': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5"/></svg>',
            '⚠️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M12 2L2 22h20L12 2z"/></svg>',
            '🔥': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
        };

        let fixedContent = content;
        Object.entries(emojiReplacements).forEach(([emoji, svg]) => {
            fixedContent = fixedContent.replaceAll(emoji, svg);
        });

        // 移除其他常見 emoji
        fixedContent = fixedContent.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

        return fixedContent;
    }

    // 5. 替換 alert/confirm
    replaceAlertConfirm(content) {
        // 替換 alert
        content = content.replace(/alert\s*\(\s*(['"`])(.*?)\1\s*\)/g, (match, quote, message) => {
            return `this.showToast('${message.replace(/'/g, "\\'")}', 'info')`;
        });

        // 替換 confirm
        content = content.replace(/confirm\s*\(\s*(['"`])(.*?)\1\s*\)/g, (match, quote, message) => {
            return `await this.showConfirm('${message.replace(/'/g, "\\'")}')`;
        });

        return content;
    }

    // 6. 檢查並添加 static facilityInfo (如果缺失)
    ensureFacilityInfo(content, fileName) {
        if (content.includes('static facilityInfo')) {
            return content; // 已存在
        }

        const className = this.extractClassName(content);
        if (!className) return content;

        const facilityCode = fileName.replace('.js', '');
        const facilityName = this.getFacilityName(facilityCode);

        const facilityInfo = `
    // 符合規範的設施資訊
    static facilityInfo = {
        code: '${facilityCode}',
        name: '${facilityName}',
        subtitle: '${facilityName}管理系統',
        description: '${facilityName}功能模組',
        version: '3.0.0',
        author: 'GameLife Team',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>',
        theme: 'default',
        color: '#9B8B7E',
        support: {
            theme: true,
            mobile: true,
            offline: true
        },
        permissions: {
            public: false,
            allowedUsers: [],
            requireAuth: true
        }
    };
`;

        // 插入到 class 開始後
        const classMatch = content.match(new RegExp(`class\\s+${className}\\s*{`));
        if (classMatch) {
            const insertIndex = classMatch.index + classMatch[0].length;
            return content.slice(0, insertIndex) + facilityInfo + content.slice(insertIndex);
        }

        return content;
    }

    // 輔助方法
    extractClassName(content) {
        const match = content.match(/class\s+(\w+)/);
        return match ? match[1] : null;
    }

    getFacilityName(code) {
        const names = {
            'todos': '待辦事項',
            'calendar': '行事曆',
            'finance': '財務管理',
            'projects': '專案管理',
            'timebox': '時間盒子',
            'overview': '總覽',
            'settings': '設定',
            'users': '使用者管理',
            'themes': '主題',
            'sync': '同步',
            'auth': '認證'
        };
        return names[code] || code;
    }

    // 主修正方法
    async fixModule(filePath) {
        const fileName = path.basename(filePath);
        console.log(`\n🔧 修正模組: ${fileName}`);

        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;

            const className = this.extractClassName(content);
            if (!className) {
                console.log(`   ⚠️ 無法識別類別名稱，跳過`);
                return;
            }

            // 執行各項修正
            content = this.fixButtonBindings(content);
            content = this.fixContainerPadding(content);
            content = this.addDestroyMethod(content, className);
            content = this.removeEmojis(content);
            content = this.replaceAlertConfirm(content);
            content = this.ensureFacilityInfo(content, fileName);

            // 檢查是否有變更
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content);
                this.fixed.push(fileName);
                console.log(`   ✅ 修正完成`);
            } else {
                console.log(`   ✅ 無需修正`);
            }

        } catch (error) {
            console.error(`   ❌ 修正失敗: ${error.message}`);
            this.violations.push(`${fileName}: ${error.message}`);
        }
    }

    // 執行修正
    async fixAllModules() {
        console.log('🚀 開始修正所有模組...\n');

        if (!fs.existsSync(this.modulesDir)) {
            console.error('❌ modules 目錄不存在');
            return;
        }

        const files = fs.readdirSync(this.modulesDir)
            .filter(file => file.endsWith('.js'))
            .filter(file => !file.includes('sync.js') && !file.includes('auth.js')); // 跳過系統模組

        for (const file of files) {
            await this.fixModule(path.join(this.modulesDir, file));
        }

        this.printSummary();
    }

    printSummary() {
        console.log('\n📊 修正摘要');
        console.log('='.repeat(50));
        console.log(`✅ 成功修正: ${this.fixed.length} 個模組`);
        if (this.fixed.length > 0) {
            this.fixed.forEach(file => console.log(`   - ${file}`));
        }
        
        console.log(`❌ 修正失敗: ${this.violations.length} 個`);
        if (this.violations.length > 0) {
            this.violations.forEach(violation => console.log(`   - ${violation}`));
        }

        console.log('\n🎉 修正完成！建議執行測試驗證功能。');
    }
}

// 執行修正
if (require.main === module) {
    const fixer = new ComplianceFixTool();
    fixer.fixAllModules().catch(console.error);
}

module.exports = ComplianceFixTool;