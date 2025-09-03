#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 模組目錄
const modulesDir = path.join(__dirname, '..', 'modules');

// 需要修正的模組列表
const modules = [
    { file: 'todos.js', className: 'TodosModule' },
    { file: 'finance.js', className: 'FinanceModule' },
    { file: 'calendar.js', className: 'CalendarModule' },
    { file: 'projects.js', className: 'ProjectsModule' },
    { file: 'timebox.js', className: 'TimeboxModule' },
    { file: 'overview.js', className: 'OverviewModule' },
    { file: 'settings.js', className: 'SettingsModule' },
    { file: 'users.js', className: 'UsersModule' },
    { file: 'themes.js', className: 'ThemesModule' },
    { file: 'life-simulator.js', className: 'LifeSimulatorModule' },
    { file: 'pixel-life.js', className: 'PixelLifeModule' },
    { file: 'travel-pdf.js', className: 'TravelPdfModule' },
    { file: 'unified-header.js', className: 'UnifiedHeaderModule' },
    { file: 'permissions.js', className: 'PermissionsModule' }
];

// 系統模組（特殊處理）
const systemModules = [
    { file: 'auth.js', exports: ['getCurrentUser', 'isLoggedIn', 'logout', 'AuthModule'] },
    { file: 'sync.js', exports: ['SyncManager'] }
];

console.log('🔧 開始修正模組導出問題...\n');

let fixedCount = 0;
let errorCount = 0;

// 修正一般模組
modules.forEach(module => {
    const filePath = path.join(modulesDir, module.file);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${module.file} - 檔案不存在，跳過`);
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 檢查是否已經有導出語句
        const hasExport = content.includes(`export { ${module.className} }`);
        
        if (hasExport) {
            console.log(`✅ ${module.file} - 已有正確導出`);
            return;
        }
        
        // 移除可能存在的錯誤導出（如果有的話）
        content = content.replace(/\nexport\s*{\s*\w+Module\s*}\s*;?\s*$/m, '');
        content = content.replace(/\nexport\s+default\s+\w+Module\s*;?\s*$/m, '');
        
        // 添加正確的導出語句到檔案末尾
        if (!content.endsWith('\n')) {
            content += '\n';
        }
        content += `\nexport { ${module.className} };`;
        
        // 寫回檔案
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${module.file} - 已添加導出語句`);
        fixedCount++;
        
    } catch (error) {
        console.error(`❌ ${module.file} - 修正失敗:`, error.message);
        errorCount++;
    }
});

// 修正系統模組
systemModules.forEach(module => {
    const filePath = path.join(modulesDir, module.file);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${module.file} - 檔案不存在，跳過`);
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 對於 auth.js，檢查特定的導出
        if (module.file === 'auth.js') {
            const exportStatement = `export { ${module.exports.join(', ')} };`;
            if (!content.includes(exportStatement)) {
                // 移除舊的導出（如果有）
                content = content.replace(/\nexport\s*{[^}]+}\s*;?\s*$/m, '');
                
                // 添加新的導出
                if (!content.endsWith('\n')) {
                    content += '\n';
                }
                content += '\n' + exportStatement;
                
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ ${module.file} - 已更新導出語句`);
                fixedCount++;
            } else {
                console.log(`✅ ${module.file} - 導出正確`);
            }
        }
        
        // 對於 sync.js
        if (module.file === 'sync.js') {
            const exportStatement = `export { ${module.exports.join(', ')} };`;
            if (!content.includes(exportStatement)) {
                // 移除舊的導出（如果有）
                content = content.replace(/\nexport\s*{[^}]+}\s*;?\s*$/m, '');
                
                // 添加新的導出
                if (!content.endsWith('\n')) {
                    content += '\n';
                }
                content += '\n' + exportStatement;
                
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ ${module.file} - 已更新導出語句`);
                fixedCount++;
            } else {
                console.log(`✅ ${module.file} - 導出正確`);
            }
        }
        
    } catch (error) {
        console.error(`❌ ${module.file} - 修正失敗:`, error.message);
        errorCount++;
    }
});

console.log('\n========================================');
console.log('📊 修正結果統計：');
console.log(`✅ 成功修正: ${fixedCount} 個檔案`);
console.log(`❌ 修正失敗: ${errorCount} 個檔案`);
console.log(`📁 總處理檔案: ${modules.length + systemModules.length} 個`);
console.log('========================================\n');

if (errorCount === 0) {
    console.log('🎉 所有模組導出問題已修正完成！');
    console.log('📝 請重新載入頁面測試模組是否能正常載入。');
} else {
    console.log('⚠️  有部分檔案修正失敗，請手動檢查。');
}
