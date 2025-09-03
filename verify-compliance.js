#!/usr/bin/env node
/**
 * GameLife 合規性快速驗證工具
 * 用於持續監控系統是否符合 building-manual 規範
 */

const fs = require('fs');
const path = require('path');

class ComplianceChecker {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.moduleCount = 0;
    }

    // 檢查單個模組
    checkModule(filePath) {
        const moduleName = path.basename(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        console.log(`🔍 檢查 ${moduleName}...`);
        
        // 1. 檢查 emoji 使用
        const emojiRegex = /[✓✅✕❌📅💰🔍📊⭐🎯📋💡🚀⚙️📈🎨🌟⚠️]/g;
        const emojiMatches = content.match(emojiRegex);
        if (emojiMatches) {
            this.issues.push(`❌ ${moduleName}: 發現 ${emojiMatches.length} 個 emoji 使用`);
        }

        // 2. 檢查 alert/confirm 使用
        if (content.includes('alert(') || content.includes('confirm(')) {
            const alertCount = (content.match(/alert\(/g) || []).length;
            const confirmCount = (content.match(/confirm\(/g) || []).length;
            this.issues.push(`❌ ${moduleName}: 發現 ${alertCount} 個 alert, ${confirmCount} 個 confirm`);
        }

        // 3. 檢查 destroy() 方法
        if (!content.includes('destroy()')) {
            // 檢查是否為系統模組（可能不需要 destroy）
            if (!moduleName.includes('unified-header') && !moduleName.includes('config')) {
                this.warnings.push(`⚠️  ${moduleName}: 缺少 destroy() 方法`);
            }
        }

        // 4. 檢查 window.activeModule 設置
        if (content.includes('class ') && !content.includes('window.activeModule = this')) {
            this.warnings.push(`⚠️  ${moduleName}: 可能缺少 window.activeModule = this 設置`);
        }

        // 5. 檢查 Toast 系統實現
        if (content.includes('alert(') || content.includes('confirm(')) {
            if (!content.includes('showToast') && !content.includes('showConfirm')) {
                this.issues.push(`❌ ${moduleName}: 使用 alert/confirm 但未實現 Toast 系統`);
            }
        }

        // 6. 語法檢查
        try {
            // 簡單的語法檢查 - 檢查大括號匹配
            const openBraces = (content.match(/{/g) || []).length;
            const closeBraces = (content.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
                this.issues.push(`❌ ${moduleName}: 大括號不匹配 (${openBraces} vs ${closeBraces})`);
            }
        } catch (error) {
            this.issues.push(`❌ ${moduleName}: 語法錯誤 - ${error.message}`);
        }

        this.moduleCount++;
    }

    // 生成報告
    generateReport() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 GameLife 合規性檢查報告');
        console.log('='.repeat(50));
        console.log(`檢查時間: ${new Date().toLocaleString()}`);
        console.log(`檢查模組: ${this.moduleCount} 個`);
        
        console.log('\n🚨 嚴重問題:');
        if (this.issues.length === 0) {
            console.log('✅ 無嚴重問題發現！');
        } else {
            this.issues.forEach(issue => console.log(issue));
        }

        console.log('\n⚠️  警告項目:');
        if (this.warnings.length === 0) {
            console.log('✅ 無警告項目！');
        } else {
            this.warnings.forEach(warning => console.log(warning));
        }

        console.log('\n📈 合規度評分:');
        const totalChecks = this.moduleCount * 6; // 每個模組6項檢查
        const failedChecks = this.issues.length + (this.warnings.length * 0.5);
        const score = Math.max(0, ((totalChecks - failedChecks) / totalChecks * 100));
        
        console.log(`總體合規度: ${score.toFixed(1)}%`);
        
        if (score >= 95) {
            console.log('🎉 優秀！系統高度符合規範');
        } else if (score >= 85) {
            console.log('👍 良好！系統基本符合規範，建議修正警告項目');
        } else if (score >= 70) {
            console.log('⚠️  尚可！需要處理部分問題');
        } else {
            console.log('🚨 需要改進！存在多個合規性問題');
        }

        return score;
    }

    // 執行檢查
    async run() {
        console.log('🚀 開始 GameLife 合規性檢查...\n');
        
        try {
            const modulesDir = './modules';
            const moduleFiles = fs.readdirSync(modulesDir)
                .filter(file => file.endsWith('.js'))
                .map(file => path.join(modulesDir, file));

            for (const moduleFile of moduleFiles) {
                this.checkModule(moduleFile);
            }

            const score = this.generateReport();
            
            // 生成簡短的狀態文件
            const statusReport = {
                timestamp: new Date().toISOString(),
                score: score,
                issues: this.issues.length,
                warnings: this.warnings.length,
                modules: this.moduleCount,
                status: score >= 95 ? 'excellent' : score >= 85 ? 'good' : score >= 70 ? 'acceptable' : 'needs_improvement'
            };

            fs.writeFileSync('./compliance-status.json', JSON.stringify(statusReport, null, 2));
            console.log('\n💾 合規狀態已儲存到 compliance-status.json');

            return score >= 85; // 返回是否通過基本合規要求

        } catch (error) {
            console.error('❌ 檢查過程發生錯誤:', error);
            return false;
        }
    }
}

// 主程序
async function main() {
    const checker = new ComplianceChecker();
    const passed = await checker.run();
    
    if (passed) {
        console.log('\n✅ 合規性檢查通過！');
        process.exit(0);
    } else {
        console.log('\n❌ 合規性檢查未通過，請修正上述問題。');
        process.exit(1);
    }
}

// 如果直接運行此腳本
if (require.main === module) {
    main();
}

module.exports = ComplianceChecker;