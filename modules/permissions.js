/**
 * 權限管理系統
 * 控制不同角色的使用者可以看到和操作的功能
 */

class PermissionManager {
    constructor() {
        // 角色定義
        this.roles = {
            'super_admin': {
                name: '超級管理員',
                level: 100,
                permissions: {
                    users: { read: true, write: true, delete: true },      // 使用者管理
                    todos: { read: true, write: true, delete: true },      // 待辦事項
                    calendar: { read: true, write: true, delete: true },   // 行事曆
                    finance: { read: true, write: true, delete: true },    // 財務
                    projects: { read: true, write: true, delete: true },   // 專案
                    timebox: { read: true, write: true, delete: true },    // 時間箱
                    settings: { read: true, write: true, delete: true },   // 設定
                    'life-simulator': { read: true, write: true, delete: true } // 人生模擬器
                },
                canManageUsers: true,
                canViewAllData: true
            },
            'admin': {
                name: '管理員',
                level: 80,
                permissions: {
                    users: { read: false, write: false, delete: false },   // 不能管理使用者！
                    todos: { read: true, write: true, delete: true },
                    calendar: { read: true, write: true, delete: true },
                    finance: { read: true, write: true, delete: false },   // 可看財務但不能刪除
                    projects: { read: true, write: true, delete: true },
                    timebox: { read: true, write: true, delete: true },
                    settings: { read: true, write: true, delete: false },
                    'life-simulator': { read: true, write: true, delete: true }
                },
                canManageUsers: false,
                canViewAllData: false
            },
            'manager': {
                name: '經理',
                level: 60,
                permissions: {
                    users: { read: false, write: false, delete: false },
                    todos: { read: true, write: true, delete: true },
                    calendar: { read: true, write: true, delete: true },
                    finance: { read: true, write: false, delete: false },  // 只能看財務報表
                    projects: { read: true, write: true, delete: false },
                    timebox: { read: true, write: true, delete: false },
                    settings: { read: true, write: false, delete: false },
                    'life-simulator': { read: true, write: true, delete: false }
                },
                canManageUsers: false,
                canViewAllData: false
            },
            'user': {
                name: '一般使用者',
                level: 20,
                permissions: {
                    users: { read: false, write: false, delete: false },
                    todos: { read: true, write: true, delete: true },      // 自己的待辦
                    calendar: { read: true, write: true, delete: true },   // 自己的行事曆
                    finance: { read: false, write: false, delete: false }, // 不能看財務
                    projects: { read: true, write: false, delete: false }, // 只能看專案
                    timebox: { read: true, write: true, delete: true },
                    settings: { read: true, write: false, delete: false }, // 只能看設定
                    'life-simulator': { read: true, write: true, delete: false }
                },
                canManageUsers: false,
                canViewAllData: false
            }
        };

        // 特定使用者的角色映射
        this.userRoles = {
            'william': 'super_admin',  // William 是超級管理員
            'carson': 'admin',          // Carson 是管理員但不能管理使用者
            'jess': 'manager',          // Jess 是經理
            'kai': 'user'               // KAI 是一般使用者
        };
    }

    /**
     * 取得使用者的角色
     */
    getUserRole(username) {
        if (!username) return 'user';
        
        // 轉小寫比對
        const lowerUsername = username.toLowerCase();
        return this.userRoles[lowerUsername] || 'user';
    }

    /**
     * 檢查使用者是否有特定模組的權限
     */
    hasModuleAccess(username, module, action = 'read') {
        const role = this.getUserRole(username);
        const roleConfig = this.roles[role];
        
        if (!roleConfig) return false;
        
        // super_admin 有所有權限
        if (role === 'super_admin') return true;
        
        // 檢查特定模組和操作的權限
        const modulePerms = roleConfig.permissions[module];
        if (!modulePerms) return false;
        
        return modulePerms[action] === true;
    }

    /**
     * 取得使用者可見的模組列表
     */
    getVisibleModules(username) {
        const role = this.getUserRole(username);
        const roleConfig = this.roles[role];
        
        if (!roleConfig) return [];
        
        const visibleModules = [];
        
        // 遍歷所有權限，找出有讀取權限的模組
        Object.entries(roleConfig.permissions).forEach(([module, perms]) => {
            if (perms.read) {
                visibleModules.push(module);
            }
        });
        
        return visibleModules;
    }

    /**
     * 檢查是否可以管理使用者
     */
    canManageUsers(username) {
        const role = this.getUserRole(username);
        const roleConfig = this.roles[role];
        
        return roleConfig?.canManageUsers === true;
    }

    /**
     * 應用權限到導航選單
     */
    applyNavigationPermissions(username) {
        console.log(`應用權限給使用者: ${username}`);
        
        const visibleModules = this.getVisibleModules(username);
        const canManageUsers = this.canManageUsers(username);
        
        // 隱藏無權限的導航項目
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const link = item.querySelector('a[onclick*="loadModule"]');
            if (link) {
                const onclick = link.getAttribute('onclick');
                
                // 提取模組名稱
                const match = onclick.match(/loadModule\(['"]([^'"]+)['"]/);
                if (match) {
                    const moduleName = match[1];
                    
                    // 特殊處理使用者管理模組
                    if (moduleName === 'users') {
                        item.style.display = canManageUsers ? 'block' : 'none';
                    } 
                    // 檢查其他模組權限
                    else if (!visibleModules.includes(moduleName) && moduleName !== 'dashboard') {
                        item.style.display = 'none';
                    } else {
                        item.style.display = 'block';
                    }
                }
            }
        });
        
        console.log(`${username} 可見模組:`, visibleModules);
        console.log(`可以管理使用者: ${canManageUsers}`);
    }

    /**
     * 檢查資料存取權限
     */
    canAccessData(username, dataOwnerId) {
        const role = this.getUserRole(username);
        const roleConfig = this.roles[role];
        
        // super_admin 可以看所有資料
        if (roleConfig?.canViewAllData) {
            return true;
        }
        
        // 其他人只能看自己的資料
        // 這裡需要比對 UUID 或使用者名稱
        return username === dataOwnerId;
    }

    /**
     * 取得角色顯示名稱
     */
    getRoleDisplayName(username) {
        const role = this.getUserRole(username);
        const roleConfig = this.roles[role];
        return roleConfig?.name || '使用者';
    }

    /**
     * 初始化權限系統
     */
    init() {
        // 從 sessionStorage 取得當前使用者
        const username = sessionStorage.getItem('username');
        
        if (username) {
            console.log('初始化權限系統，使用者:', username);
            
            // 應用導航權限
            this.applyNavigationPermissions(username);
            
            // 更新角色顯示
            const roleDisplay = document.getElementById('currentUserRole');
            if (roleDisplay) {
                roleDisplay.textContent = this.getRoleDisplayName(username);
            }
            
            // 如果不是 super_admin，確保使用者管理被隱藏
            if (!this.canManageUsers(username)) {
                // 從側邊欄移除使用者管理
                const userNavItems = document.querySelectorAll('a[onclick*="users"]');
                userNavItems.forEach(item => {
                    const parent = item.closest('.nav-item');
                    if (parent) {
                        parent.style.display = 'none';
                    }
                });
            }
        }
        
        return this;
    }
}

// 匯出權限管理器
export { PermissionManager };