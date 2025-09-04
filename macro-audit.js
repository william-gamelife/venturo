#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// 定義專案架構和已知問題
const PROJECT_ISSUES = {
    // === 架構治理問題 ===
    architecture: {
        duplicateSystems: [
            'auth-bridge.js vs auth-bridge-old.js',
            'dashboard.html vs dashboard-old.html',
            'Multiple fix scripts without documentation'
        ],
        namingInconsistency: [
            'Mixed naming: kebab-case (life-simulator.js) vs no-separator (timebox.js)',
            'File suffixes: -old, -test, temp-'
        ],
        noGovernance: 'No clear architecture documentation or module structure rules'
    },

    // === 檔案存在性問題 ===
    fileExistence: {
        missing404: [],  // 將從掃描中填充
        brokenImports: [],
        orphanedFiles: []
    },

    // === 模組系統問題 ===
    moduleSystem: {
        exportMismatches: [],
        importErrors: [],
        circularDependencies: []
    },

    // === DOM 參考問題 ===
    domReferences: {
        missingElements: [],
        duplicateIds: [],
        invalidSelectors: []
    },

    // === 事件監聽器問題 ===
    eventListeners: {
        unpairedListeners: [],
        memoryLeaks: [],
        missingHandlers: []
    },

    // === API 呼叫問題 ===
    apiCalls: {
        hardcodedUrls: [],
        missingErrorHandling: [],
        unauthorizedEndpoints: []
    },

    // === 待移除檔案 ===
    filesToRemove: {
        legacy: [
            'dashboard-old.html',
            'auth-bridge-old.js',
            'user-experience-test.html'
        ],
        tempFiles: [],
        fixScripts: [
            'fix-all-modules.js',
            'fix-compliance-violations.js', 
            'fix-modules-systematic.js',
            'final-cleanup.js',
            'temp-expand.js'
        ],
        testFiles: [
            'test-permissions.js'
        ]
    }
};

class MacroAudit {
    constructor() {
        this.files = new Map();
        this.issues = [];
        this.stats = {
            totalFiles: 0,
            jsFiles: 0,
            htmlFiles: 0,
            jsonFiles: 0,
            cssFiles: 0
        };
    }

    // 掃描所有檔案
    async scanFiles(dir, baseDir = dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            
            if (entry.isDirectory()) {
                if (!['node_modules', '.git', '.claude'].includes(entry.name)) {
                    await this.scanFiles(fullPath, baseDir);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (['.js', '.html', '.css', '.json'].includes(ext)) {
                    this.stats.totalFiles++;
                    this.stats[ext.slice(1) + 'Files']++;
                    
                    const content = await fs.readFile(fullPath, 'utf-8');
                    this.files.set(relativePath, {
                        path: fullPath,
                        content,
                        type: ext,
                        imports: [],
                        exports: [],
                        references: []
                    });
                }
            }
        }
    }

    // 檢查檔案引用
    async checkFileReferences() {
        for (const [filePath, fileData] of this.files) {
            const content = fileData.content;
            
            // 檢查 script 標籤
            const scriptMatches = content.matchAll(/<script[^>]+src=["']([^"']+)["']/g);
            for (const match of scriptMatches) {
                const src = match[1];
                if (!src.startsWith('http') && !src.includes('cdn')) {
                    const cleanSrc = src.replace(/^\.\//, '');
                    if (!this.fileExists(cleanSrc)) {
                        this.issues.push({
                            type: 'MISSING_FILE',
                            file: filePath,
                            reference: src,
                            severity: 'ERROR'
                        });
                    }
                }
            }
            
            // 檢查 import 語句
            const importMatches = content.matchAll(/import\s+.*?\s+from\s+["']([^"']+)["']/g);
            for (const match of importMatches) {
                const importPath = match[1];
                if (!importPath.startsWith('http') && !importPath.includes('@')) {
                    const cleanPath = this.resolveImportPath(filePath, importPath);
                    if (!this.fileExists(cleanPath)) {
                        this.issues.push({
                            type: 'BROKEN_IMPORT',
                            file: filePath,
                            import: importPath,
                            severity: 'ERROR'
                        });
                    }
                }
            }
        }
    }

    // 檢查 DOM 參考
    async checkDOMReferences() {
        const htmlFiles = Array.from(this.files.entries())
            .filter(([path]) => path.endsWith('.html'));
        const jsFiles = Array.from(this.files.entries())
            .filter(([path]) => path.endsWith('.js'));
        
        // 收集所有 HTML 元素 ID
        const elementIds = new Set();
        for (const [path, data] of htmlFiles) {
            const idMatches = data.content.matchAll(/id=["']([^"']+)["']/g);
            for (const match of idMatches) {
                elementIds.add(match[1]);
            }
        }
        
        // 檢查 JS 檔案中的 DOM 查詢
        for (const [path, data] of jsFiles) {
            const getByIdMatches = data.content.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g);
            for (const match of getByIdMatches) {
                if (!elementIds.has(match[1])) {
                    this.issues.push({
                        type: 'MISSING_DOM_ELEMENT',
                        file: path,
                        elementId: match[1],
                        severity: 'WARNING'
                    });
                }
            }
        }
    }

    // 檢查事件監聽器配對
    async checkEventListeners() {
        for (const [path, data] of this.files) {
            if (path.endsWith('.js')) {
                const addListeners = [...data.content.matchAll(/addEventListener\s*\(\s*["'](\w+)["']\s*,\s*([^,)]+)/g)];
                const removeListeners = [...data.content.matchAll(/removeEventListener\s*\(\s*["'](\w+)["']\s*,\s*([^,)]+)/g)];
                
                const addedMap = new Map();
                const removedMap = new Map();
                
                for (const match of addListeners) {
                    const event = match[1];
                    const handler = match[2].trim();
                    if (!addedMap.has(event)) addedMap.set(event, []);
                    addedMap.get(event).push(handler);
                }
                
                for (const match of removeListeners) {
                    const event = match[1];
                    const handler = match[2].trim();
                    if (!removedMap.has(event)) removedMap.set(event, []);
                    removedMap.get(event).push(handler);
                }
                
                // 檢查未配對的監聽器
                for (const [event, handlers] of addedMap) {
                    const removed = removedMap.get(event) || [];
                    for (const handler of handlers) {
                        if (!removed.includes(handler)) {
                            this.issues.push({
                                type: 'UNPAIRED_LISTENER',
                                file: path,
                                event,
                                handler,
                                severity: 'WARNING'
                            });
                        }
                    }
                }
            }
        }
    }

    // 檢查 API 呼叫
    async checkAPICalls() {
        for (const [path, data] of this.files) {
            if (path.endsWith('.js')) {
                // 檢查硬編碼的 localhost
                const localhostMatches = data.content.matchAll(/["'](https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?[^"']*/g);
                for (const match of localhostMatches) {
                    this.issues.push({
                        type: 'HARDCODED_LOCALHOST',
                        file: path,
                        url: match[0],
                        severity: 'WARNING'
                    });
                }
                
                // 檢查 Supabase 呼叫但無導入
                if (data.content.includes('supabase.') && 
                    !data.content.includes('import') && 
                    !data.content.includes('supabase-js')) {
                    this.issues.push({
                        type: 'MISSING_SUPABASE_IMPORT',
                        file: path,
                        severity: 'ERROR'
                    });
                }
            }
        }
    }

    // 輔助函數
    fileExists(path) {
        return this.files.has(path) || 
               this.files.has(path + '.js') || 
               this.files.has('modules/' + path) ||
               this.files.has('modules/' + path + '.js');
    }

    resolveImportPath(fromFile, importPath) {
        if (importPath.startsWith('./')) {
            const dir = path.dirname(fromFile);
            return path.join(dir, importPath.slice(2));
        }
        return importPath;
    }

    // 生成報告
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            statistics: this.stats,
            knownIssues: PROJECT_ISSUES,
            detectedIssues: this.issues,
            summary: {
                criticalErrors: this.issues.filter(i => i.severity === 'ERROR').length,
                warnings: this.issues.filter(i => i.severity === 'WARNING').length,
                totalIssues: this.issues.length
            },
            filesToRemove: [
                ...PROJECT_ISSUES.filesToRemove.legacy,
                ...PROJECT_ISSUES.filesToRemove.fixScripts,
                ...PROJECT_ISSUES.filesToRemove.testFiles
            ]
        };
        
        return report;
    }

    // 打印報告
    printReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 宏觀檢測報告 - GameLife 專案');
        console.log('='.repeat(60));
        
        console.log('\n📊 檔案統計:');
        console.log(`  總檔案數: ${report.statistics.totalFiles}`);
        console.log(`  JavaScript: ${report.statistics.jsFiles}`);
        console.log(`  HTML: ${report.statistics.htmlFiles}`);
        console.log(`  JSON: ${report.statistics.jsonFiles}`);
        console.log(`  CSS: ${report.statistics.cssFiles}`);
        
        console.log('\n⚠️ 問題摘要:');
        console.log(`  嚴重錯誤: ${report.summary.criticalErrors}`);
        console.log(`  警告: ${report.summary.warnings}`);
        console.log(`  總問題數: ${report.summary.totalIssues}`);
        
        console.log('\n🏗️ 架構治理問題:');
        console.log('  重複系統:', report.knownIssues.architecture.duplicateSystems);
        console.log('  命名不一致:', report.knownIssues.architecture.namingInconsistency);
        
        console.log('\n🔴 嚴重錯誤 (需立即修復):');
        const errors = report.detectedIssues.filter(i => i.severity === 'ERROR');
        for (const error of errors.slice(0, 5)) {
            console.log(`  [${error.type}] ${error.file}`);
            if (error.reference) console.log(`    -> 引用: ${error.reference}`);
            if (error.import) console.log(`    -> 導入: ${error.import}`);
        }
        if (errors.length > 5) {
            console.log(`  ... 還有 ${errors.length - 5} 個錯誤`);
        }
        
        console.log('\n🗑️ 建議移除的檔案:');
        for (const file of report.filesToRemove) {
            console.log(`  ❌ ${file}`);
        }
        
        console.log('\n💡 建議行動:');
        console.log('  1. 立即移除所有標記為移除的檔案');
        console.log('  2. 修復所有檔案引用錯誤');
        console.log('  3. 統一命名規範 (建議使用 kebab-case)');
        console.log('  4. 清理未配對的事件監聽器');
        console.log('  5. 建立架構文檔和模組規範');
        
        console.log('\n' + '='.repeat(60));
    }
}

// 執行審計
async function runAudit() {
    console.log('🚀 開始宏觀檢測...\n');
    
    const audit = new MacroAudit();
    const projectRoot = path.resolve(__dirname);
    
    try {
        // 執行各項檢查
        await audit.scanFiles(projectRoot);
        await audit.checkFileReferences();
        await audit.checkDOMReferences();
        await audit.checkEventListeners();
        await audit.checkAPICalls();
        
        // 生成並打印報告
        const report = audit.generateReport();
        audit.printReport(report);
        
        // 保存詳細報告
        await fs.writeFile(
            path.join(projectRoot, 'macro-audit-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('\n✅ 詳細報告已保存到: macro-audit-report.json');
        
        // 詢問是否自動移除檔案
        console.log('\n是否要自動移除建議刪除的檔案? (需手動確認)');
        console.log('執行: node macro-audit.js --remove-files');
        
    } catch (error) {
        console.error('❌ 審計過程出錯:', error);
    }
}

// 處理命令行參數
if (process.argv.includes('--remove-files')) {
    console.log('⚠️ 準備移除檔案...');
    const filesToRemove = [
        ...PROJECT_ISSUES.filesToRemove.legacy,
        ...PROJECT_ISSUES.filesToRemove.fixScripts,
        ...PROJECT_ISSUES.filesToRemove.testFiles
    ];
    
    filesToRemove.forEach(async (file) => {
        const fullPath = path.join(__dirname, file);
        try {
            await fs.unlink(fullPath);
            console.log(`  ✅ 已移除: ${file}`);
        } catch (err) {
            console.log(`  ⚠️ 無法移除: ${file} (${err.message})`);
        }
    });
} else {
    runAudit();
}
