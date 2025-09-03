/**
 * GameLife 權限系統核心 - AuthBridge
 * 統一認證入口，無複雜依賴，快速啟動
 */

class AuthBridge {
    constructor() {
        this.currentUser = null;
        this.permissionHelper = null;
        this.ready = false;
        this.initialized = false;
        
        // 立即同步初始化
        this.init();
    }

    init() {
        try {
            // 直接使用瀏覽器權限助手
            if (window.permissionHelper) {
                this.permissionHelper = window.permissionHelper;
                console.log('🔗 AuthBridge: 瀏覽器權限系統已連接');
            } else {
                console.warn('⚠️ AuthBridge: 權限助手尚未載入，將重試...');
                // 如果權限助手未載入，等待一下再重試
                setTimeout(() => this.init(), 100);
                return;
            }
            
            // 從 localStorage 恢復登入狀態
            this.restoreLoginState();
            
            this.ready = true;
            this.initialized = true;
            console.log('🌉 AuthBridge 初始化完成');
            
        } catch (error) {
            console.error('❌ AuthBridge 初始化失敗:', error);
            this.initialized = false;
        }
    }

    // 恢復登入狀態
    restoreLoginState() {
        try {
            const stored = localStorage.getItem('gamelife_auth');
            if (stored) {
                const authData = JSON.parse(stored);
                
                // 檢查是否過期
                if (authData.expireTime && authData.expireTime > Date.now()) {
                    this.currentUser = authData;
                    console.log('🔄 已恢復登入狀態:', authData.username);
                } else {
                    // 清除過期資料
                    localStorage.removeItem('gamelife_auth');
                    console.log('🕐 登入狀態已過期，已清除');
                }
            }
        } catch (error) {
            console.warn('⚠️ 恢復登入狀態失敗:', error);
            localStorage.removeItem('gamelife_auth');
        }
    }

    // 等待初始化完成
    async waitForInit() {
        let attempts = 0;
        while (!this.initialized && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (!this.initialized) {
            throw new Error('AuthBridge 初始化超時');
        }
    }

    // =============  核心認證方法 =============

    async login(username, password) {
        await this.waitForInit();
        
        if (!this.permissionHelper) {
            throw new Error('權限系統未載入');
        }
        
        const user = this.permissionHelper.validateUser(username, password);
        if (user) {
            // 建立完整的登入資料
            const loginData = {
                uuid: user.uuid,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                permissions: user.permissions,
                loginTime: Date.now(),
                expireTime: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7天過期
            };
            
            this.currentUser = loginData;
            
            // 保存到 localStorage
            localStorage.setItem('gamelife_auth', JSON.stringify(loginData));
            
            console.log('✅ 登入成功:', username);
            return true;
        }
        
        console.log('❌ 登入失敗:', username);
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('gamelife_auth');
        sessionStorage.clear();
        console.log('👋 使用者已登出');
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // =============  權限檢查方法 =============

    canAccessModule(moduleName) {
        if (!this.initialized || !this.currentUser || !this.permissionHelper) {
            return false;
        }

        return this.permissionHelper.canAccessModule(this.currentUser.uuid, moduleName);
    }

    canModifyModule(moduleName) {
        if (!this.initialized || !this.currentUser || !this.permissionHelper) {
            return false;
        }

        return this.permissionHelper.canModifyModule(this.currentUser.uuid, moduleName);
    }

    canDeleteFromModule(moduleName) {
        if (!this.initialized || !this.currentUser || !this.permissionHelper) {
            return false;
        }

        return this.permissionHelper.canDeleteFromModule(this.currentUser.uuid, moduleName);
    }

    canUsePackageFeature() {
        if (!this.initialized || !this.currentUser || !this.permissionHelper) {
            return false;
        }

        return this.permissionHelper.canUsePackageFeature(this.currentUser.uuid);
    }

    getVisibleModules() {
        if (!this.initialized || !this.currentUser || !this.permissionHelper) {
            return [];
        }

        return this.permissionHelper.getVisibleModules(this.currentUser.uuid);
    }

    getUserRole() {
        if (!this.currentUser) return null;
        
        if (this.permissionHelper) {
            return this.permissionHelper.getUserRole(this.currentUser.uuid);
        }
        
        return {
            role: this.currentUser.role,
            displayName: this.currentUser.displayName
        };
    }

    // =============  角色檢查方法 =============

    isSuperAdmin() {
        return this.currentUser && this.currentUser.role === 'SUPER_ADMIN';
    }

    isBusinessAdmin() {
        return this.currentUser && this.currentUser.role === 'BUSINESS_ADMIN';
    }

    isGeneralUser() {
        return this.currentUser && this.currentUser.role === 'GENERAL_USER';
    }

    // =============  除錯資訊 =============

    getDebugInfo() {
        return {
            initialized: this.initialized,
            ready: this.ready,
            hasUser: !!this.currentUser,
            hasPermissionHelper: !!this.permissionHelper,
            currentUser: this.currentUser ? {
                username: this.currentUser.username,
                role: this.currentUser.role
            } : null
        };
    }
}

// 建立全域單例
window.authBridge = new AuthBridge();

// 全域除錯函數
window.getAuthDebug = () => window.authBridge.getDebugInfo();

console.log('🚀 AuthBridge 已載入並初始化');