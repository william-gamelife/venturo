#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// 要移除的檔案清單
const filesToRemove = [
    // 舊版檔案
    'dashboard-old.html',
    'auth-bridge-old.js',
    'user-experience-test.html',
    
    // 臨時修復腳本
    'fix-all-modules.js',
    'fix-compliance-violations.js',
    'fix-modules-systematic.js',
    'final-cleanup.js',
    'temp-expand.js',
    
    // 測試檔案
    'test-permissions.js',
    
    // 驗證腳本
    'verify-compliance.js',
    
    // 審計腳本（完成後移除）
    'comprehensive-audit.js',
    'macro-audit.js'
];

async function cleanProject() {
    console.log('🧹 開始清理專案...\n');
    
    let removedCount = 0;
    let failedCount = 0;
    
    for (const file of filesToRemove) {
        const filePath = path.join(__dirname, file);
        
        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
            console.log(`✅ 已移除: ${file}`);
            removedCount++;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`⏭️  已不存在: ${file}`);
            } else {
                console.log(`❌ 無法移除: ${file} (${error.message})`);
                failedCount++;
            }
        }
    }
    
    console.log('\n' + '='.repeat(40));
    console.log(`清理完成！`);
    console.log(`✅ 成功移除: ${removedCount} 個檔案`);
    if (failedCount > 0) {
        console.log(`❌ 失敗: ${failedCount} 個檔案`);
    }
    console.log('='.repeat(40) + '\n');
    
    console.log('💡 建議後續行動：');
    console.log('1. 統一所有模組命名為 kebab-case');
    console.log('2. 為每個模組添加 destroy() 方法清理事件');
    console.log('3. 建立 docs/architecture.md 文檔');
    console.log('4. 實施 ESLint 程式碼規範');
}

// 執行清理
cleanProject().catch(console.error);
