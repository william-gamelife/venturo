/**
 * 權限檢查輔助工具
 * 提供簡單的 API 來檢查使用者權限
 */

class PermissionHelper {
    constructor() {
        this.loadPermissionData();
    }

    loadPermissionData() {
        try {
            const fs = require('fs');
            
            this.users = JSON.parse(fs.readFileSync('./seed-data/users.json', 'utf8'));
            this.roles = JSON.parse(fs.readFileSync('./seed-data/roles.json', 'utf8'));
            this.moduleRules = JSON.parse(fs.readFileSync('./seed-data/moduleRules.json', 'utf8'));
            
            console.log('✓ 權限資料載入成功');
        } catch (error) {
            console.error('❌ 無法載入權限資料，請先執行 system-init.js');
            this.users = [];
            this.roles = {};
            this.moduleRules = {};
        }
    }

    // 根據 UUID 取得使用者
    getUserByUUID(uuid) {
        return this.users.find(user => user.uuid === uuid);
    }

    // 根據用戶名取得使用者
    getUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }

    // 驗證登入
    validateUser(username, password) {
        const user = this.getUserByUsername(username);
        if (!user) return null;
        
        // 簡單密碼驗證（實際應該加密）
        if (user.password === password) {
            return {
                uuid: user.uuid,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                permissions: user.permissions
            };
        }
        return null;
    }

    // 檢查使用者是否可以存取模組
    canAccessModule(userUUID, moduleName) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return false;

        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.read;
    }

    // 檢查使用者是否可以修改模組
    canModifyModule(userUUID, moduleName) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return false;

        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.write;
    }

    // 檢查使用者是否可以刪除模組內容
    canDeleteFromModule(userUUID, moduleName) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return false;

        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.delete;
    }

    // 檢查是否可以使用打包功能
    canUsePackageFeature(userUUID) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return false;

        const todosPermission = roleConfig.modules['todos'];
        return todosPermission && todosPermission.package;
    }

    // 取得使用者可見的模組列表
    getVisibleModules(userUUID) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return [];

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return [];

        return Object.keys(roleConfig.modules).filter(moduleName => 
            roleConfig.modules[moduleName].read
        );
    }

    // 取得使用者角色資訊
    getUserRole(userUUID) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return null;

        return {
            role: user.role,
            roleInfo: this.roles[user.role],
            displayName: user.displayName
        };
    }

    // 檢查是否為超級管理員
    isSuperAdmin(userUUID) {
        const user = this.getUserByUUID(userUUID);
        return user && user.role === 'SUPER_ADMIN';
    }

    // 檢查是否為商務管理員
    isBusinessAdmin(userUUID) {
        const user = this.getUserByUUID(userUUID);
        return user && user.role === 'BUSINESS_ADMIN';
    }

    // 檢查是否為一般使用者
    isGeneralUser(userUUID) {
        const user = this.getUserByUUID(userUUID);
        return user && user.role === 'GENERAL_USER';
    }

    // 取得所有使用者（僅超級管理員可用）
    getAllUsers(requestingUserUUID) {
        if (!this.isSuperAdmin(requestingUserUUID)) {
            throw new Error('權限不足：僅超級管理員可以查看所有使用者');
        }
        
        return this.users.map(user => ({
            uuid: user.uuid,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            isSystemUser: user.isSystemUser,
            createdAt: user.createdAt
        }));
    }

    // 動態檢查權限
    hasPermission(userUUID, permission) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        // 超級管理員擁有所有權限
        if (user.permissions.includes('*')) return true;

        // 檢查特定權限
        return user.permissions.some(p => 
            p === permission || 
            (p.endsWith('.*') && permission.startsWith(p.replace('.*', '')))
        );
    }
}

// 建立全域實例
let permissionHelper = null;

function getPermissionHelper() {
    if (!permissionHelper) {
        permissionHelper = new PermissionHelper();
    }
    return permissionHelper;
}

// 便捷函數
function checkModuleAccess(userUUID, moduleName) {
    return getPermissionHelper().canAccessModule(userUUID, moduleName);
}

function checkModuleModify(userUUID, moduleName) {
    return getPermissionHelper().canModifyModule(userUUID, moduleName);
}

function validateLogin(username, password) {
    return getPermissionHelper().validateUser(username, password);
}

function getUserVisibleModules(userUUID) {
    return getPermissionHelper().getVisibleModules(userUUID);
}

// 匯出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PermissionHelper,
        getPermissionHelper,
        checkModuleAccess,
        checkModuleModify,
        validateLogin,
        getUserVisibleModules
    };
}

// 瀏覽器全域變數
if (typeof window !== 'undefined') {
    window.PermissionHelper = PermissionHelper;
    window.getPermissionHelper = getPermissionHelper;
    window.checkModuleAccess = checkModuleAccess;
    window.checkModuleModify = checkModuleModify;
}