#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class ComprehensiveAudit {
    constructor() {
        this.issues = {
            architecture: [],
            fileExistence: [],
            imports: [],
            exports: [],
            domReferences: [],
            eventListeners: [],
            apiCalls: [],
            styling: [],
            unused: [],
            legacy: []
        };
        
        this.fileMap = new Map();
        this.importGraph = new Map();
        this.exportMap = new Map();
        this.usageMap = new Map();
    }

    log(category, message, type = 'info') {
        const colorMap = {
            error: colors.red,
            warning: colors.yellow,
            success: colors.green,
            info: colors.cyan
        };
        
        const color = colorMap[type] || colors.reset;
        console.log(`${color}[${category.toUpperCase()}] ${message}${colors.reset}`);
    }

    async scanProject() {
        this.log('scan', '🔍 Starting comprehensive project audit...', 'info');
        
        const projectRoot = path.resolve(__dirname);
        
        // Phase 1: File Discovery
        await this.discoverFiles(projectRoot);
        
        // Phase 2: Analyze Architecture
        await this.analyzeArchitecture();
        
        // Phase 3: Check File References
        await this.checkFileReferences();
        
        // Phase 4: Analyze Module System
        await this.analyzeModuleSystem();
        
        // Phase 5: Check DOM References
        await this.checkDOMReferences();
        
        // Phase 6: Check Event Listeners
        await this.checkEventListeners();
        
        // Phase 7: Check API Calls
        await this.checkAPICalls();
        
        // Phase 8: Find Unused Files
        await this.findUnusedFiles();
        
        // Phase 9: Identify Legacy Code
        await this.identifyLegacyCode();
        
        // Generate Report
        await this.generateReport();
    }

    async discoverFiles(dir, baseDir = dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            
            if (entry.isDirectory()) {
                if (!['node_modules', '.git', '.claude'].includes(entry.name)) {
                    await this.discoverFiles(fullPath, baseDir);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (['.js', '.html', '.css', '.json'].includes(ext)) {
                    this.fileMap.set(relativePath, {
                        path: fullPath,
                        type: ext,
                        name: entry.name,
                        content: null,
                        imports: [],
                        exports: [],
                        references: [],
                        isUsed: false
                    });
                }
            }
        }
    }

    async analyzeArchitecture() {
        this.log('architecture', '🏗️ Analyzing project architecture...', 'info');
        
        // Check for duplicate module systems
        const moduleFiles = Array.from(this.fileMap.keys()).filter(f => 
            f.includes('modules/') || f.includes('module')
        );
        
        // Check for conflicting naming patterns
        const namingPatterns = new Map();
        for (const file of moduleFiles) {
            const basename = path.basename(file, path.extname(file));
            const pattern = basename.replace(/[-_]/g, '').toLowerCase();
            
            if (!namingPatterns.has(pattern)) {
                namingPatterns.set(pattern, []);
            }
            namingPatterns.set(pattern, [...namingPatterns.get(pattern), file]);
        }
        
        for (const [pattern, files] of namingPatterns) {
            if (files.length > 1) {
                this.issues.architecture.push({
                    type: 'duplicate_modules',
                    pattern,
                    files,
                    severity: 'warning'
                });
            }
        }

        // Check for orphaned files
        const htmlFiles = Array.from(this.fileMap.keys()).filter(f => f.endsWith('.html'));
        for (const htmlFile of htmlFiles) {
            if (htmlFile.includes('-old') || htmlFile.includes('test')) {
                this.issues.legacy.push({
                    type: 'potential_legacy',
                    file: htmlFile,
                    reason: 'Filename suggests legacy or test code'
                });
            }
        }
    }

    async checkFileReferences() {
        this.log('references', '📁 Checking file references...', 'info');
        
        for (const [relPath, fileInfo] of this.fileMap) {
            if (fileInfo.type === '.js' || fileInfo.type === '.html') {
                const content = await fs.readFile(fileInfo.path, 'utf-8');
                fileInfo.content = content;
                
                // Check for file references
                const scriptTags = content.matchAll(/<script[^>]+src=["']([^"']+)["']/g);
                const imports = content.matchAll(/import\s+.*?\s+from\s+["']([^"']+)["']/g);
                const dynamicImports = content.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g);
                const requires = content.matchAll(/require\s*\(\s*["']([^"']+)["']\s*\)/g);
                
                const references = [
                    ...Array.from(scriptTags, m => m[1]),
                    ...Array.from(imports, m => m[1]),
                    ...Array.from(dynamicImports, m => m[1]),
                    ...Array.from(requires, m => m[1])
                ];
                
                for (const ref of references) {
                    // Clean up the reference
                    const cleanRef = ref.replace(/^\.\//, '').replace(/\.js$/, '');
                    
                    // Check if file exists
                    const possiblePaths = [
                        cleanRef,
                        `${cleanRef}.js`,
                        `modules/${cleanRef}`,
                        `modules/${cleanRef}.js`,
                        `shared/${cleanRef}`,
                        `shared/${cleanRef}.js`
                    ];
                    
                    let found = false;
                    for (const possiblePath of possiblePaths) {
                        if (this.fileMap.has(possiblePath)) {
                            found = true;
                            const targetFile = this.fileMap.get(possiblePath);
                            targetFile.isUsed = true;
                            fileInfo.references.push(possiblePath);
                            break;
                        }
                    }
                    
                    if (!found && !ref.startsWith('http') && !ref.includes('supabase')) {
                        this.issues.fileExistence.push({
                            type: 'missing_file',
                            file: relPath,
                            reference: ref,
                            severity: 'error'
                        });
                    }
                }
            }
        }
    }

    async analyzeModuleSystem() {
        this.log('modules', '📦 Analyzing module system...', 'info');
        
        for (const [relPath, fileInfo] of this.fileMap) {
            if (fileInfo.type === '.js' && fileInfo.content) {
                // Check exports
                const exportMatches = [
                    ...fileInfo.content.matchAll(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g),
                    ...fileInfo.content.matchAll(/export\s+\{([^}]+)\}/g),
                    ...fileInfo.content.matchAll(/window\.(\w+)\s*=/g)
                ];
                
                for (const match of exportMatches) {
                    if (match[1]) {
                        const exports = match[1].split(',').map(e => e.trim());
                        fileInfo.exports.push(...exports);
                    }
                }
                
                // Check imports
                const importMatches = [
                    ...fileInfo.content.matchAll(/import\s+(?:\{([^}]+)\}|(\w+))\s+from/g)
                ];
                
                for (const match of importMatches) {
                    if (match[1] || match[2]) {
                        const imports = (match[1] || match[2]).split(',').map(i => i.trim());
                        fileInfo.imports.push(...imports);
                    }
                }
            }
        }
        
        // Check for export/import mismatches
        for (const [relPath, fileInfo] of this.fileMap) {
            for (const ref of fileInfo.references) {
                const targetFile = this.fileMap.get(ref);
                if (targetFile) {
                    for (const imp of fileInfo.imports) {
                        if (!targetFile.exports.includes(imp)) {
                            this.issues.imports.push({
                                type: 'import_mismatch',
                                file: relPath,
                                import: imp,
                                targetFile: ref,
                                severity: 'error'
                            });
                        }
                    }
                }
            }
        }
    }

    async checkDOMReferences() {
        this.log('dom', '🎯 Checking DOM references...', 'info');
        
        const domSelectors = new Set();
        const htmlElements = new Set();
        
        // Collect all IDs and classes from HTML files
        for (const [relPath, fileInfo] of this.fileMap) {
            if (fileInfo.type === '.html' && fileInfo.content) {
                const ids = fileInfo.content.matchAll(/id=["']([^"']+)["']/g);
                const classes = fileInfo.content.matchAll(/class=["']([^"']+)["']/g);
                
                for (const match of ids) {
                    htmlElements.add(`#${match[1]}`);
                }
                
                for (const match of classes) {
                    const classList = match[1].split(/\s+/);
                    for (const cls of classList) {
                        htmlElements.add(`.${cls}`);
                    }
                }
            }
        }
        
        // Check JavaScript files for DOM references
        for (const [relPath, fileInfo] of this.fileMap) {
            if (fileInfo.type === '.js' && fileInfo.content) {
                const selectors = [
                    ...fileInfo.content.matchAll(/getElementById\s*\(\s*["']([^"']+)["']\s*\)/g),
                    ...fileInfo.content.matchAll(/querySelector\s*\(\s*["']([^"']+)["']\s*\)/g),
                    ...fileInfo.content.matchAll(/querySelectorAll\s*\(\s*["']([^"']+)["']\s*\)/g)
                ];
                
                for (const match of selectors) {
                    const selector = match[1];
                    domSelectors.add(selector);
                    
                    // Check if element exists in HTML
                    if (selector.startsWith('#')) {
                        if (!htmlElements.has(selector)) {
                            this.issues.domReferences.push({
                                type: 'missing_element',
                                file: relPath,
                                selector,
                                severity: 'warning'
                            });
                        }
                    }
                }
            }
        }
    }

    async checkEventListeners() {
        this.log('events', '🎧 Checking event listeners...', 'info');
        
        for (const [relPath, fileInfo] of this.fileMap) {
            if (fileInfo.type === '.js' && fileInfo.content) {
                const addListeners = fileInfo.content.matchAll(/addEventListener\s*\(\s*["'](\w+)["']\s*,\s*([^,)]+)/g);
                const removeListeners = fileInfo.content.matchAll(/removeEventListener\s*\(\s*["'](\w+)["']\s*,\s*([^,)]+)/g);
                
                const added = new Map();
                const removed = new Map();
                
                for (const match of addListeners) {
                    const event = match[1];
                    const handler = match[2].trim();
                    if (!added.has(event)) {
                        added.set(event, []);
                    }
                    added.get(event).push(handler);
                }
                
                for (const match of removeListeners) {
                    const event = match[1];
                    const handler = match[2].trim();
                    if (!removed.has(event)) {
                        removed.set(event, []);
                    }
                    removed.get(event).push(handler);
                }
                
                // Check for unpaired listeners
                for (const [event, handlers] of added) {
                    const removedHandlers = removed.get(event) || [];
                    for (const handler of handlers) {
                        if (!removedHandlers.includes(handler)) {
                            this.issues.eventListeners.push({
                                type: 'unpaired_listener',
                                file: relPath,
                                event,
                                handler,
                                severity: 'warning'
                            });
                        }
                    }
                }
            }
        }
    }

    async checkAPICalls() {
        this.log('api', '🌐 Checking API calls...', 'info');
        
        for (const [relPath, fileInfo] of this.fileMap) {
            if (fileInfo.type === '.js' && fileInfo.content) {
                // Check for Supabase references
                const supabaseRefs = fileInfo.content.matchAll(/supabase\.\w+/g);
                const fetchCalls = fileInfo.content.matchAll(/fetch\s*\(\s*["']([^"']+)["']/g);
                
                for (const match of supabaseRefs) {
                    // Check if supabase is imported
                    if (!fileInfo.content.includes('import') && 
                        !fileInfo.content.includes('supabase.js')) {
                        this.issues.apiCalls.push({
                            type: 'missing_supabase_import',
                            file: relPath,
                            severity: 'error'
                        });
                    }
                }
                
                for (const match of fetchCalls) {
                    const url = match[1];
                    if (url.includes('localhost') || url.includes('127.0.0.1')) {
                        this.issues.apiCalls.push({
                            type: 'hardcoded_localhost',
                            file: relPath,
                            url,
                            severity: 'warning'
                        });
                    }
                }
            }
        }
    }

    async findUnusedFiles() {
        this.log('unused', '🗑️ Finding unused files...', 'info');
        
        // Mark entry points as used
        const entryPoints = ['index.html', 'dashboard.html', 'config.js', 'system-init.js'];
        for (const entry of entryPoints) {
            if (this.fileMap.has(entry)) {
                this.fileMap.get(entry).isUsed = true;
            }
        }
        
        // Find unused files
        for (const [relPath, fileInfo] of this.fileMap) {
            if (!fileInfo.isUsed && 
                !relPath.includes('test') && 
                !relPath.includes('fix') &&
                !relPath.includes('verify') &&
                !relPath.includes('audit')) {
                
                this.issues.unused.push({
                    type: 'unused_file',
                    file: relPath,
                    severity: 'info'
                });
            }
        }
    }

    async identifyLegacyCode() {
        this.log('legacy', '📜 Identifying legacy code...', 'info');
        
        const legacyPatterns = [
            { pattern: /-old\./i, reason: 'Old version suffix' },
            { pattern: /backup/i, reason: 'Backup file' },
            { pattern: /temp-/i, reason: 'Temporary file' },
            { pattern: /test-/i, reason: 'Test file' },
            { pattern: /fix-/i, reason: 'Fix script' }
        ];
        
        for (const [relPath, fileInfo] of this.fileMap) {
            for (const { pattern, reason } of legacyPatterns) {
                if (pattern.test(relPath)) {
                    this.issues.legacy.push({
                        type: 'legacy_file',
                        file: relPath,
                        reason,
                        severity: 'info'
                    });
                }
            }
        }
    }

    async generateReport() {
        this.log('report', '📊 Generating comprehensive report...', 'success');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: this.fileMap.size,
                totalIssues: Object.values(this.issues).flat().length,
                criticalIssues: Object.values(this.issues).flat().filter(i => i.severity === 'error').length,
                warnings: Object.values(this.issues).flat().filter(i => i.severity === 'warning').length
            },
            issues: this.issues,
            recommendations: [],
            filesToRemove: []
        };

        // Generate recommendations
        if (this.issues.architecture.length > 0) {
            report.recommendations.push({
                category: 'Architecture',
                action: 'Consolidate duplicate module systems and establish clear naming conventions'
            });
        }

        if (this.issues.fileExistence.length > 0) {
            report.recommendations.push({
                category: 'File References',
                action: 'Fix missing file references or remove broken imports'
            });
        }

        if (this.issues.unused.length > 0) {
            report.filesToRemove = this.issues.unused.map(i => i.file);
        }

        if (this.issues.legacy.length > 0) {
            report.filesToRemove.push(...this.issues.legacy.map(i => i.file));
        }

        // Remove duplicates from files to remove
        report.filesToRemove = [...new Set(report.filesToRemove)];

        // Write report to file
        await fs.writeFile(
            path.join(__dirname, 'audit-report.json'),
            JSON.stringify(report, null, 2)
        );

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log(`${colors.cyan}📊 AUDIT SUMMARY${colors.reset}`);
        console.log('='.repeat(60));
        
        console.log(`\n${colors.yellow}Total Files Scanned:${colors.reset} ${report.summary.totalFiles}`);
        console.log(`${colors.red}Critical Issues:${colors.reset} ${report.summary.criticalIssues}`);
        console.log(`${colors.yellow}Warnings:${colors.reset} ${report.summary.warnings}`);
        console.log(`${colors.blue}Total Issues:${colors.reset} ${report.summary.totalIssues}`);
        
        // Print issues by category
        for (const [category, issues] of Object.entries(this.issues)) {
            if (issues.length > 0) {
                console.log(`\n${colors.magenta}[${category.toUpperCase()}] ${issues.length} issues found${colors.reset}`);
                
                // Show first 3 issues as examples
                const examples = issues.slice(0, 3);
                for (const issue of examples) {
                    const severityColor = issue.severity === 'error' ? colors.red :
                                         issue.severity === 'warning' ? colors.yellow :
                                         colors.blue;
                    console.log(`  ${severityColor}• ${issue.type}: ${issue.file || issue.pattern}${colors.reset}`);
                }
                
                if (issues.length > 3) {
                    console.log(`  ${colors.cyan}... and ${issues.length - 3} more${colors.reset}`);
                }
            }
        }
        
        // Print files to remove
        if (report.filesToRemove.length > 0) {
            console.log(`\n${colors.red}FILES TO REMOVE (${report.filesToRemove.length} files):${colors.reset}`);
            for (const file of report.filesToRemove.slice(0, 10)) {
                console.log(`  ${colors.yellow}• ${file}${colors.reset}`);
            }
            if (report.filesToRemove.length > 10) {
                console.log(`  ${colors.cyan}... and ${report.filesToRemove.length - 10} more${colors.reset}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`${colors.green}✅ Full report saved to: audit-report.json${colors.reset}`);
        console.log('='.repeat(60) + '\n');
    }
}

// Run the audit
const audit = new ComprehensiveAudit();
audit.scanProject().catch(console.error);
