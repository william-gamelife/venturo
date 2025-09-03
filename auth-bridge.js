/**
 * 認證橋接器 - 整合舊系統與新權限系統
 * 確保向後相容性的同時啟用新的權限控制
 */

class AuthBridge {
    constructor() {
        this.permissionHelper = null;
        this.currentUser = null;
        this.legacyMode = false;
        this.initialized = false;
        
        // 延遲初始化，避免阻塞頁面載入
        setTimeout(() => this.initializeSystem(), 0);
    }

    async initializeSystem() {
        try {
            // 嘗試載入新權限系統
            if (typeof require !== 'undefined') {
                const { getPermissionHelper } = require('./permission-helper.js');
                this.permissionHelper = getPermissionHelper();
                console.log('🔗 AuthBridge: 新權限系統已連接');
            } else {
                // 瀏覽器環境，直接使用 permission-helper-browser.js
                if (window.permissionHelper) {
                    this.permissionHelper = window.permissionHelper;
                    console.log('🔗 AuthBridge: 瀏覽器權限系統已連接');
                } else {
                    throw new Error('瀏覽器權限系統未載入');
                }
            }
        } catch (error) {
            console.warn('⚠️ AuthBridge: 回退到舊版認證系統', error.message);
            this.legacyMode = true;
            this.initializeLegacyMode();
        }
        
        this.initialized = true;
        console.log('🌉 AuthBridge 初始化完成');
    }


    initializeLegacyMode() {
        // 回退到原有的使用者資料
        this.users = [
            {
                uuid: '550e8400-e29b-41d4-a716-446655440000',
                username: 'william',
                displayName: '威廉',
                password: 'pass1234',
                role: 'SUPER_ADMIN'
            },
            {
                uuid: '550e8400-e29b-41d4-a716-446655440001', 
                username: 'carson',
                displayName: 'Carson',
                password: 'pass1234',
                role: 'BUSINESS_ADMIN'
            },
            {
                uuid: 'user-kai-001',
                username: 'kai',
                displayName: 'KAI', 
                password: 'pass1234',
                role: 'GENERAL_USER'
            }
        ];
        console.log('🔄 AuthBridge: 舊版模式已啟用');
    }

    // 等待初始化完成
    async waitForInitialization() {
        while (!this.initialized) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    // =============  認證方法 =============

    async validateLogin(username, password) {
        await this.waitForInitialization();
        if (this.permissionHelper && !this.legacyMode) {
            // 使用新權限系統
            return this.permissionHelper.validateUser(username, password);
        } else {
            // 使用內建資料
            const user = this.users.find(u => u.username === username);
            if (user && user.password === password) {
                return {
                    uuid: user.uuid,
                    username: user.username,
                    displayName: user.displayName,
                    role: user.role
                };
            }
            return null;
        }
    }

    getCurrentUser() {
        // 從 sessionStorage 取得當前使用者
        try {
            const stored = sessionStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
                return this.currentUser;
            }
        } catch (error) {
            console.warn('無法取得當前使用者:', error);
        }
        return null;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
    }

    // =============  權限檢查方法 =============

    canAccessModule(moduleName) {
        if (!this.initialized) return false; // 未初始化時禁止存取
        const user = this.getCurrentUser();
        if (!user) return false;

        if (this.permissionHelper && !this.legacyMode) {
            return this.permissionHelper.canAccessModule(user.uuid, moduleName);
        } else {
            // 舊版邏輯
            return this.legacyPermissionCheck(user.role, moduleName, 'read');
        }
    }

    canModifyModule(moduleName) {
        const user = this.getCurrentUser();
        if (!user) return false;

        if (this.permissionHelper && !this.legacyMode) {
            return this.permissionHelper.canModifyModule(user.uuid, moduleName);
        } else {
            return this.legacyPermissionCheck(user.role, moduleName, 'write');
        }
    }

    canUsePackageFeature() {
        const user = this.getCurrentUser();
        if (!user) return false;

        if (this.permissionHelper && !this.legacyMode) {
            return this.permissionHelper.canUsePackageFeature(user.uuid);
        } else {
            return user.role === 'SUPER_ADMIN' || user.role === 'BUSINESS_ADMIN';
        }
    }

    getVisibleModules() {
        if (!this.initialized) return []; // 未初始化時返回空陣列
        const user = this.getCurrentUser();
        if (!user) return [];

        if (this.permissionHelper && !this.legacyMode) {
            return this.permissionHelper.getVisibleModules(user.uuid);
        } else {
            // 舊版邏輯
            return this.getLegacyVisibleModules(user.role);
        }
    }

    // =============  舊版相容性方法 =============

    legacyPermissionCheck(role, moduleName, action) {
        const permissions = {
            'SUPER_ADMIN': {
                // 所有模組的所有權限
                '*': ['read', 'write', 'delete']
            },
            'BUSINESS_ADMIN': {
                'todos': ['read', 'write', 'delete'],
                'projects': ['read', 'write', 'delete'],
                'calendar': ['read', 'write', 'delete'],
                'finance': ['read', 'write', 'delete'],
                'timebox': ['read', 'write', 'delete'],
                'overview': ['read', 'write'],
                'settings': ['read', 'write'],
                'themes': ['read'],
                'sync': ['read']
            },
            'GENERAL_USER': {
                'todos': ['read', 'write', 'delete'],
                'calendar': ['read', 'write', 'delete'], 
                'finance': ['read', 'write', 'delete'],
                'timebox': ['read', 'write', 'delete'],
                'overview': ['read'],
                'life-simulator': ['read', 'write'],
                'pixel-life': ['read', 'write']
            }
        };

        const rolePermissions = permissions[role];
        if (!rolePermissions) return false;

        // 超級管理員有全部權限
        if (rolePermissions['*']) return true;

        const modulePermissions = rolePermissions[moduleName];
        return modulePermissions && modulePermissions.includes(action);
    }

    getLegacyVisibleModules(role) {
        const moduleMap = {
            'SUPER_ADMIN': [
                'users', 'overview', 'todos', 'calendar', 'finance', 
                'projects', 'timebox', 'life-simulator', 'pixel-life',
                'travel-pdf', 'settings', 'themes', 'sync'
            ],
            'BUSINESS_ADMIN': [
                'overview', 'todos', 'calendar', 'finance', 
                'projects', 'timebox', 'life-simulator', 'pixel-life',
                'travel-pdf', 'settings', 'themes', 'sync'
            ],
            'GENERAL_USER': [
                'overview', 'todos', 'calendar', 'finance', 
                'timebox', 'life-simulator', 'pixel-life', 'travel-pdf'
            ]
        };

        return moduleMap[role] || [];
    }

    // =============  公用方法 =============

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }

    isSuperAdmin() {
        return this.getUserRole() === 'SUPER_ADMIN';
    }

    isBusinessAdmin() {
        return this.getUserRole() === 'BUSINESS_ADMIN';
    }

    getUserInfo() {
        return this.getCurrentUser();
    }

    // =============  相容性 API =============

    // 提供與舊 auth.js 相同的介面
    async login(username, password) {
        const user = await this.validateLogin(username, password);
        if (user) {
            this.setCurrentUser(user);
            return true;
        }
        return false;
    }
}

// 建立全域實例
window.authBridge = new AuthBridge();

// 提供舊版相容 API
window.getCurrentUser = () => window.authBridge.getCurrentUser();
window.isLoggedIn = () => window.authBridge.isLoggedIn();
window.logout = () => window.authBridge.logout();
window.canAccessModule = (module) => window.authBridge.canAccessModule(module);
window.canModifyModule = (module) => window.authBridge.canModifyModule(module);
window.getVisibleModules = () => window.authBridge.getVisibleModules();

console.log('🌉 AuthBridge 已初始化，提供向後相容的認證服務');