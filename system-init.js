#!/usr/bin/env node
/**
 * GameLife 系統初始化工具
 * 解決雞生蛋問題：先建立系統管理員，再啟動權限管理
 */

class SystemInitializer {
    constructor() {
        this.SYSTEM_ADMIN_UUID = '550e8400-e29b-41d4-a716-446655440000'; // 威廉的固定UUID
        this.BUSINESS_ADMIN_UUID = '550e8400-e29b-41d4-a716-446655440001'; // 預留商務管理員
    }

    async initialize() {
        console.log('🚀 開始 GameLife 系統初始化...\n');

        try {
            // 1. 檢查是否首次啟動
            const isFirstRun = await this.checkFirstRun();
            
            if (isFirstRun) {
                console.log('📦 首次啟動，建立基礎架構...');
                await this.createSystemFoundation();
            } else {
                console.log('🔄 系統已初始化，檢查完整性...');
                await this.validateSystemIntegrity();
            }

            console.log('✅ 系統初始化完成！');
            
        } catch (error) {
            console.error('❌ 初始化失敗:', error);
            throw error;
        }
    }

    async createSystemFoundation() {
        // 1. 建立預設管理員資料（種子資料）
        await this.createSeedUsers();
        
        // 2. 建立權限角色定義
        await this.createRoleDefinitions();
        
        // 3. 建立模組可見性規則
        await this.createModuleRules();
        
        // 4. 標記系統已初始化
        await this.markAsInitialized();
    }

    async createSeedUsers() {
        console.log('👤 建立種子使用者...');
        
        const seedUsers = [
            {
                uuid: this.SYSTEM_ADMIN_UUID,
                username: 'william',
                displayName: '威廉',
                password: 'pass1234', // 實際應該加密
                role: 'SUPER_ADMIN',
                permissions: ['*'], // 全部權限
                isSystemUser: true,
                createdAt: new Date().toISOString()
            },
            {
                uuid: this.BUSINESS_ADMIN_UUID,
                username: 'carson',
                displayName: 'Carson',
                password: 'pass1234',
                role: 'BUSINESS_ADMIN',
                permissions: ['business.*'],
                isSystemUser: false,
                createdAt: new Date().toISOString()
            },
            {
                uuid: 'user-kai-001',
                username: 'kai',
                displayName: 'KAI',
                password: 'pass1234',
                role: 'GENERAL_USER',
                permissions: ['general.*'],
                isSystemUser: false,
                createdAt: new Date().toISOString()
            }
        ];

        // 寫入種子資料到本地，供系統使用
        this.saveSeedData('users', seedUsers);
        console.log('  ✓ 種子使用者已建立');
    }

    async createRoleDefinitions() {
        console.log('🔐 建立權限角色定義...');
        
        const roleDefinitions = {
            'SUPER_ADMIN': {
                name: '超級管理員',
                description: '系統最高權限，可管理所有功能和使用者',
                level: 100,
                modules: {
                    // 核心管理模組
                    'users': { read: true, write: true, delete: true },
                    'settings': { read: true, write: true, delete: true },
                    'permissions': { read: true, write: true, delete: true },
                    
                    // 業務模組
                    'todos': { read: true, write: true, delete: true, package: true },
                    'projects': { read: true, write: true, delete: true },
                    'calendar': { read: true, write: true, delete: true },
                    'finance': { read: true, write: true, delete: true },
                    'timebox': { read: true, write: true, delete: true },
                    
                    // 其他模組
                    'overview': { read: true, write: true, delete: true },
                    'life-simulator': { read: true, write: true, delete: true },
                    'pixel-life': { read: true, write: true, delete: true },
                    'travel-pdf': { read: true, write: true, delete: true },
                    'themes': { read: true, write: true, delete: true },
                    'sync': { read: true, write: true, delete: true }
                }
            },
            
            'BUSINESS_ADMIN': {
                name: '商務管理員',
                description: '業務功能管理權限，除人員管理外的所有功能',
                level: 50,
                modules: {
                    // 排除人員管理
                    'settings': { read: true, write: true, delete: false },
                    
                    // 完整業務功能
                    'todos': { read: true, write: true, delete: true, package: true },
                    'projects': { read: true, write: true, delete: true },
                    'calendar': { read: true, write: true, delete: true },
                    'finance': { read: true, write: true, delete: true },
                    'timebox': { read: true, write: true, delete: true },
                    
                    // 其他模組
                    'overview': { read: true, write: true, delete: true },
                    'life-simulator': { read: true, write: true, delete: true },
                    'pixel-life': { read: true, write: true, delete: true },
                    'travel-pdf': { read: true, write: true, delete: true },
                    'themes': { read: true, write: false, delete: false },
                    'sync': { read: true, write: false, delete: false }
                }
            },
            
            'GENERAL_USER': {
                name: '一般使用者',
                description: '基本功能使用權限',
                level: 10,
                modules: {
                    // 基本功能（排除專案和打包）
                    'todos': { read: true, write: true, delete: true, package: false },
                    'calendar': { read: true, write: true, delete: true },
                    'finance': { read: true, write: true, delete: true },
                    'timebox': { read: true, write: true, delete: true },
                    
                    // 唯讀功能
                    'overview': { read: true, write: false, delete: false },
                    'life-simulator': { read: true, write: true, delete: false },
                    'pixel-life': { read: true, write: true, delete: false },
                    'travel-pdf': { read: true, write: true, delete: false },
                    'themes': { read: true, write: false, delete: false },
                    'sync': { read: true, write: false, delete: false }
                }
            }
        };

        this.saveSeedData('roles', roleDefinitions);
        console.log('  ✓ 權限角色定義已建立');
    }

    async createModuleRules() {
        console.log('📱 建立模組可見性規則...');
        
        const moduleRules = {
            // 核心管理模組（只有超級管理員可見）
            coreModules: ['users', 'permissions'],
            
            // 業務模組（超級和商務管理員可見）
            businessModules: ['projects', 'todos-package'],
            
            // 一般模組（所有人可見，但功能受限）
            generalModules: ['todos', 'calendar', 'finance', 'timebox', 'overview'],
            
            // 娛樂模組（所有人可見）
            entertainmentModules: ['life-simulator', 'pixel-life'],
            
            // 系統模組（根據權限決定）
            systemModules: ['settings', 'themes', 'sync', 'travel-pdf'],
            
            // 動態顯示邏輯
            visibility: {
                'SUPER_ADMIN': '*', // 所有模組
                'BUSINESS_ADMIN': '!coreModules', // 除了核心管理模組
                'GENERAL_USER': 'generalModules,entertainmentModules,systemModules' // 限定模組
            }
        };

        this.saveSeedData('moduleRules', moduleRules);
        console.log('  ✓ 模組可見性規則已建立');
    }

    saveSeedData(type, data) {
        const seedDir = './seed-data';
        if (!require('fs').existsSync(seedDir)) {
            require('fs').mkdirSync(seedDir);
        }
        
        require('fs').writeFileSync(
            `${seedDir}/${type}.json`, 
            JSON.stringify(data, null, 2)
        );
    }

    async checkFirstRun() {
        const flagFile = './seed-data/initialized.flag';
        return !require('fs').existsSync(flagFile);
    }

    async markAsInitialized() {
        const seedDir = './seed-data';
        if (!require('fs').existsSync(seedDir)) {
            require('fs').mkdirSync(seedDir);
        }
        
        require('fs').writeFileSync('./seed-data/initialized.flag', JSON.stringify({
            initializedAt: new Date().toISOString(),
            version: '3.1.0',
            adminUUID: this.SYSTEM_ADMIN_UUID
        }, null, 2));
    }

    async validateSystemIntegrity() {
        console.log('🔍 檢查系統完整性...');
        
        // 檢查必要檔案是否存在
        const requiredFiles = [
            './seed-data/users.json',
            './seed-data/roles.json', 
            './seed-data/moduleRules.json'
        ];
        
        for (const file of requiredFiles) {
            if (!require('fs').existsSync(file)) {
                console.log(`  ⚠️  缺少檔案: ${file}，重新建立...`);
                await this.createSystemFoundation();
                return;
            }
        }
        
        console.log('  ✓ 系統完整性檢查通過');
    }
}

// 權限檢查工具類
class PermissionChecker {
    constructor() {
        this.roles = this.loadSeedData('roles');
        this.moduleRules = this.loadSeedData('moduleRules');
    }

    loadSeedData(type) {
        try {
            const data = require('fs').readFileSync(`./seed-data/${type}.json`, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn(`無法載入 ${type} 資料，使用預設值`);
            return {};
        }
    }

    canAccessModule(userRole, moduleName) {
        const roleConfig = this.roles[userRole];
        if (!roleConfig) return false;
        
        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.read;
    }

    canModifyModule(userRole, moduleName) {
        const roleConfig = this.roles[userRole];
        if (!roleConfig) return false;
        
        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.write;
    }

    canDeleteFromModule(userRole, moduleName) {
        const roleConfig = this.roles[userRole];
        if (!roleConfig) return false;
        
        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.delete;
    }

    canUsePackageFeature(userRole) {
        const roleConfig = this.roles[userRole];
        if (!roleConfig) return false;
        
        const todosPermission = roleConfig.modules['todos'];
        return todosPermission && todosPermission.package;
    }

    getVisibleModules(userRole) {
        const roleConfig = this.roles[userRole];
        if (!roleConfig) return [];
        
        return Object.keys(roleConfig.modules).filter(moduleName => 
            roleConfig.modules[moduleName].read
        );
    }
}

// 主程序
async function main() {
    const initializer = new SystemInitializer();
    await initializer.initialize();
    
    console.log('\n📋 系統資訊:');
    console.log(`管理員 UUID: ${initializer.SYSTEM_ADMIN_UUID}`);
    console.log('種子資料位置: ./seed-data/');
    console.log('\n下一步: 修改 auth.js 使用種子資料進行驗證');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { SystemInitializer, PermissionChecker };