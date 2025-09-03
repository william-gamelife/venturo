/**
 * 瀏覽器版本的權限檢查輔助工具
 * 直接嵌入種子資料，無需檔案載入
 */

class PermissionHelperBrowser {
    constructor() {
        // 直接內嵌種子資料
        this.users = [
            {
                "uuid": "550e8400-e29b-41d4-a716-446655440000",
                "username": "william",
                "displayName": "威廉",
                "password": "pass1234",
                "role": "SUPER_ADMIN",
                "permissions": ["*"],
                "isSystemUser": true,
                "createdAt": "2025-09-03T18:23:07.193Z"
            },
            {
                "uuid": "550e8400-e29b-41d4-a716-446655440001",
                "username": "carson",
                "displayName": "Carson",
                "password": "pass1234",
                "role": "BUSINESS_ADMIN",
                "permissions": ["business.*"],
                "isSystemUser": false,
                "createdAt": "2025-09-03T18:23:07.195Z"
            },
            {
                "uuid": "user-kai-001",
                "username": "kai",
                "displayName": "KAI",
                "password": "pass1234",
                "role": "GENERAL_USER",
                "permissions": ["general.*"],
                "isSystemUser": false,
                "createdAt": "2025-09-03T18:23:07.195Z"
            }
        ];

        this.roles = {
            "SUPER_ADMIN": {
                "name": "超級管理員",
                "description": "系統最高權限，可管理所有功能和使用者",
                "level": 100,
                "modules": {
                    "users": { "read": true, "write": true, "delete": true },
                    "settings": { "read": true, "write": true, "delete": true },
                    "permissions": { "read": true, "write": true, "delete": true },
                    "todos": { "read": true, "write": true, "delete": true, "package": true },
                    "projects": { "read": true, "write": true, "delete": true },
                    "calendar": { "read": true, "write": true, "delete": true },
                    "finance": { "read": true, "write": true, "delete": true },
                    "timebox": { "read": true, "write": true, "delete": true },
                    "overview": { "read": true, "write": true, "delete": true },
                    "life-simulator": { "read": true, "write": true, "delete": true },
                    "pixel-life": { "read": true, "write": true, "delete": true },
                    "travel-pdf": { "read": true, "write": true, "delete": true },
                    "themes": { "read": true, "write": true, "delete": true },
                    "sync": { "read": true, "write": true, "delete": true }
                }
            },
            "BUSINESS_ADMIN": {
                "name": "商務管理員",
                "description": "業務功能管理權限，除人員管理外的所有功能",
                "level": 50,
                "modules": {
                    "settings": { "read": true, "write": true, "delete": false },
                    "todos": { "read": true, "write": true, "delete": true, "package": true },
                    "projects": { "read": true, "write": true, "delete": true },
                    "calendar": { "read": true, "write": true, "delete": true },
                    "finance": { "read": true, "write": true, "delete": true },
                    "timebox": { "read": true, "write": true, "delete": true },
                    "overview": { "read": true, "write": true, "delete": true },
                    "life-simulator": { "read": true, "write": true, "delete": true },
                    "pixel-life": { "read": true, "write": true, "delete": true },
                    "travel-pdf": { "read": true, "write": true, "delete": true },
                    "themes": { "read": true, "write": false, "delete": false },
                    "sync": { "read": true, "write": false, "delete": false }
                }
            },
            "GENERAL_USER": {
                "name": "一般使用者",
                "description": "基本功能使用權限",
                "level": 10,
                "modules": {
                    "todos": { "read": true, "write": true, "delete": true, "package": false },
                    "calendar": { "read": true, "write": true, "delete": true },
                    "finance": { "read": true, "write": true, "delete": true },
                    "timebox": { "read": true, "write": true, "delete": true },
                    "overview": { "read": true, "write": false, "delete": false },
                    "life-simulator": { "read": true, "write": true, "delete": false },
                    "pixel-life": { "read": true, "write": true, "delete": false },
                    "travel-pdf": { "read": true, "write": true, "delete": false },
                    "themes": { "read": true, "write": false, "delete": false },
                    "sync": { "read": true, "write": false, "delete": false }
                }
            }
        };

        console.log('✅ 瀏覽器權限系統已載入');
    }

    // 所有方法與 permission-helper.js 相同
    getUserByUUID(uuid) {
        return this.users.find(user => user.uuid === uuid);
    }

    getUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }

    validateUser(username, password) {
        const user = this.getUserByUsername(username);
        if (!user) return null;
        
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

    canAccessModule(userUUID, moduleName) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return false;

        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.read;
    }

    canModifyModule(userUUID, moduleName) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return false;

        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.write;
    }

    canDeleteFromModule(userUUID, moduleName) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return false;

        const modulePermission = roleConfig.modules[moduleName];
        return modulePermission && modulePermission.delete;
    }

    canUsePackageFeature(userUUID) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return false;

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return false;

        const todosPermission = roleConfig.modules['todos'];
        return todosPermission && todosPermission.package;
    }

    getVisibleModules(userUUID) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return [];

        const roleConfig = this.roles[user.role];
        if (!roleConfig) return [];

        return Object.keys(roleConfig.modules).filter(moduleName => 
            roleConfig.modules[moduleName].read
        );
    }

    getUserRole(userUUID) {
        const user = this.getUserByUUID(userUUID);
        if (!user) return null;

        return {
            role: user.role,
            roleInfo: this.roles[user.role],
            displayName: user.displayName
        };
    }

    isSuperAdmin(userUUID) {
        const user = this.getUserByUUID(userUUID);
        return user && user.role === 'SUPER_ADMIN';
    }

    isBusinessAdmin(userUUID) {
        const user = this.getUserByUUID(userUUID);
        return user && user.role === 'BUSINESS_ADMIN';
    }

    isGeneralUser(userUUID) {
        const user = this.getUserByUUID(userUUID);
        return user && user.role === 'GENERAL_USER';
    }
}

// 建立全域實例
window.permissionHelper = new PermissionHelperBrowser();

// 全域函數
window.getPermissionHelper = () => window.permissionHelper;
window.validateLogin = (username, password) => window.permissionHelper.validateUser(username, password);
window.checkModuleAccess = (userUUID, moduleName) => window.permissionHelper.canAccessModule(userUUID, moduleName);

console.log('🌉 瀏覽器權限系統已就緒');