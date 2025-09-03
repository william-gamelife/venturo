/**
 * 認證模組 V2 - 真正連接 Supabase
 * 取代原本寫死的 auth.js
 */

// Supabase 配置
const SUPABASE_URL = 'https://jjazipnkoccgmbpccalf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqYXppcG5rb2NjZ21icGNjYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDMxOTIsImV4cCI6MjA3MTk3OTE5Mn0.jHH2Jf-gbx0UKqvUgxG-Nx2f_QwVqZBOFqtbAxzYvnY';

// 統一使用系統管理員UUID來存儲所有使用者資料
const SYSTEM_ADMIN_UUID = '550e8400-e29b-41d4-a716-446655440000'; // 系統專用UUID
const USERS_STORAGE_UUID = SYSTEM_ADMIN_UUID;

class AuthManagerV2 {
    constructor() {
        // 使用全域單例 Supabase 客戶端
        this.supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
        
        if (!this.supabase) {
            console.warn('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> AuthManager: 全域 Supabase 客戶端未找到');
        window.activeModule = this;
        } else {
            console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> AuthManager 已連接到全域 Supabase 客戶端');
        }
        
        this.cachedUsers = null;
    }

    /**
     * 從 Supabase 載入真實的使用者資料
     */
    async loadUsers() {
        if (!this.supabase) {
            console.error('Supabase 未初始化');
            // 返回備用資料
            return [
                {
                    uuid: this.generateUUID(),
                    username: 'william',
                    display_name: 'William',
                    password: 'pass1234',
                    role: 'admin',
                    title: 'IT主管'
                },
                {
                    uuid: this.generateUUID(),
                    username: 'carson',
                    display_name: 'Carson',
                    password: 'pass1234',
                    role: 'admin',
                    title: '工程師'
                },
                {
                    uuid: this.generateUUID(),
                    username: 'KAI',
                    display_name: 'KAI',
                    password: 'pass1234',
                    role: 'user',
                    title: '使用者'
                }
            ];
        }

        try {
            console.log('從 Supabase 載入使用者...');
            
            // 使用你現有的存儲方式
            const { data, error } = await this.supabase
                .from('user_data')
                .select('*')
                .eq('user_id', USERS_STORAGE_UUID)
                .eq('module', 'users')
                .single();

            if (error) {
                console.error('載入使用者失敗:', error);
                return this.getDefaultUsers();
            }

            if (data && Array.isArray(data.data)) {
                console.log('成功載入使用者:', data.data.length, '位');
                
                // 確保每個使用者都有完整資料
                const users = data.data.map(user => this.ensureUserComplete(user));
                this.cachedUsers = users;
                return users;
            }

            return this.getDefaultUsers();
            
        } catch (error) {
            console.error('載入使用者發生錯誤:', error);
            return this.getDefaultUsers();
        }
    }

    /**
     * 確保使用者資料完整
     */
    ensureUserComplete(user) {
        // 生成缺少的 UUID
        if (!user.uuid) {
            user.uuid = this.generateUUID();
            console.log(`為 ${user.username} 生成 UUID: ${user.uuid}`);
        }

        // 確保有顯示名稱
        if (!user.display_name) {
            user.display_name = user.username ? 
                user.username.charAt(0).toUpperCase() + user.username.slice(1) : 
                '使用者';
        }

        // 確保有密碼（預設）
        if (!user.password) {
            user.password = 'pass1234';
        }

        // 確保有角色
        if (!user.role) {
            user.role = 'user';
        }

        // 確保有職稱
        if (!user.title) {
            user.title = user.role === 'super_admin' ? '超級管理員' : 
                        user.role === 'admin' ? '管理員' : '使用者';
        }

        return user;
    }

    /**
     * 取得預設使用者（備用）
     */
    getDefaultUsers() {
        console.log('使用預設使用者資料');
        return [
            {
                uuid: '550e8400-e29b-41d4-a716-446655440001',
                username: 'william',
                display_name: 'William',
                password: 'pass1234',
                role: 'super_admin', // William 是 Super Admin
                title: 'IT主管'
            },
            {
                uuid: '550e8400-e29b-41d4-a716-446655440002',
                username: 'carson',
                display_name: 'Carson',
                password: 'pass1234',
                role: 'admin',
                title: '工程師'
            },
            {
                uuid: '550e8400-e29b-41d4-a716-446655440003',
                username: 'jess',
                display_name: 'Jess',
                password: 'pass1234',
                role: 'project_manager',
                title: '專案經理'
            },
            {
                uuid: '550e8400-e29b-41d4-a716-446655440004',
                username: 'KAI',
                display_name: 'KAI',
                password: 'pass1234',
                role: 'user',
                title: '使用者'
            }
        ];
    }

    /**
     * 驗證登入
     */
    async validateLogin(username, password) {
        // 載入最新的使用者資料
        const users = await this.loadUsers();
        
        // 尋找使用者（不分大小寫）
        const user = users.find(u => 
            u.username && u.username.toLowerCase() === username.toLowerCase()
        );
        
        if (!user) {
            return { 
                success: false, 
                message: '找不到此使用者' 
            };
        }
        
        // 驗證密碼
        if (user.password !== password) {
            return { 
                success: false, 
                message: '密碼錯誤' 
            };
        }
        
        try {
            // 準備登入資料
            const loginData = {
                uuid: user.uuid,
                display_name: user.display_name,
                role: user.role,
                username: user.username,
                title: user.title,
                loginTime: Date.now(),
                expireTime: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7天
            };
            
            // 儲存到 localStorage（持久）
            localStorage.setItem('gamelife_auth', JSON.stringify(loginData));
            
            // 儲存到 sessionStorage（相容舊版）
            sessionStorage.setItem('user_uuid', user.uuid);
            sessionStorage.setItem('display_name', user.display_name);
            sessionStorage.setItem('role', user.role);
            sessionStorage.setItem('username', user.username);
            sessionStorage.setItem('title', user.title);
            
            console.log('登入成功:', user.username, '(UUID:', user.uuid, ')');
            
            return { 
                success: true, 
                user: loginData 
            };
            
        } catch (error) {
            console.error('儲存登入資料失敗:', error);
            return { 
                success: false, 
                message: '登入失敗，請稍後再試' 
            };
        }
    }

    /**
     * 儲存使用者資料回 Supabase
     */
    async saveUsers(users) {
        if (!this.supabase) {
            console.error('無法儲存：Supabase 未初始化');
            return false;
        }

        try {
            console.log('儲存使用者到 Supabase...');
            
            const { data, error } = await this.supabase
                .from('user_data')
                .upsert({
                    user_id: USERS_STORAGE_UUID,
                    module: 'users',
                    data: users,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,module'
                });

            if (error) {
                console.error('儲存失敗:', error);
                return false;
            }

            console.log('使用者資料已儲存');
            this.cachedUsers = users;
            return true;
            
        } catch (error) {
            console.error('儲存發生錯誤:', error);
            return false;
        }
    }

    /**
     * 新增使用者
     */
    async addUser(userData) {
        const users = await this.loadUsers();
        
        // 檢查使用者名稱是否已存在
        if (users.find(u => u.username === userData.username)) {
            return { 
                success: false, 
                message: '使用者名稱已存在' 
            };
        }
        
        // 建立完整的使用者資料
        const newUser = this.ensureUserComplete({
            ...userData,
            uuid: this.generateUUID()
        });
        
        users.push(newUser);
        
        // 儲存回 Supabase
        const saved = await this.saveUsers(users);
        
        return {
            success: saved,
            message: saved ? '使用者新增成功' : '儲存失敗',
            user: newUser
        };
    }

    /**
     * 刪除使用者
     */
    async removeUser(username) {
        const users = await this.loadUsers();
        const filtered = users.filter(u => u.username !== username);
        
        if (filtered.length === users.length) {
            return {
                success: false,
                message: '找不到該使用者'
            };
        }
        
        const saved = await this.saveUsers(filtered);
        
        return {
            success: saved,
            message: saved ? '使用者已刪除' : '刪除失敗'
        };
    }

    /**
     * 更新使用者
     */
    async updateUser(username, updates) {
        const users = await this.loadUsers();
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: '找不到該使用者'
            };
        }
        
        users[userIndex] = {
            ...users[userIndex],
            ...updates
        };
        
        const saved = await this.saveUsers(users);
        
        return {
            success: saved,
            message: saved ? '使用者已更新' : '更新失敗',
            user: users[userIndex]
        };
    }

    /**
     * 取得目前登入的使用者
     */
    getCurrentUser() {
        try {
            // 先檢查 localStorage
            const authData = localStorage.getItem('gamelife_auth');
            if (authData) {
                const data = JSON.parse(authData);
                
                // 檢查是否過期
                if (data.expireTime && Date.now() < data.expireTime) {
                    return data;
                } else {
                    localStorage.removeItem('gamelife_auth');
                }
            }
            
            // 檢查 sessionStorage
            const uuid = sessionStorage.getItem('user_uuid');
            if (uuid) {
                return {
                    uuid: uuid,
                    display_name: sessionStorage.getItem('display_name'),
                    role: sessionStorage.getItem('role'),
                    username: sessionStorage.getItem('username'),
                    title: sessionStorage.getItem('title')
                };
            }
            
            return null;
        } catch (error) {
            console.error('取得目前使用者失敗:', error);
            return null;
        }
    }

    /**
     * 檢查是否已登入
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    /**
     * 登出
     */
    logout() {
        localStorage.removeItem('gamelife_auth');
        sessionStorage.clear();
        window.location.href = './index.html';
    }

    /**
     * 檢查使用者權限
     */
    checkPermission(user, permission) {
        if (!user || !user.role) return false;
        
        const permissions = {
            'super_admin': ['user_management', 'system_settings', 'all_projects', 'admin_functions'],
            'admin': ['user_management', 'system_settings', 'all_projects'],
            'project_manager': ['project_management', 'team_collaboration'],
            'user': ['basic_access']
        };
        
        return permissions[user.role]?.includes(permission) || false;
    }

    /**
     * 檢查是否為管理員
     */
    isAdmin(user = null) {
        const currentUser = user || this.getCurrentUser();
        return currentUser && ['super_admin', 'admin'].includes(currentUser.role);
    }

    /**
     * 檢查是否為超級管理員
     */
    isSuperAdmin(user = null) {
        const currentUser = user || this.getCurrentUser();
        return currentUser && currentUser.role === 'super_admin';
    }

    /**
     * 生成 UUID
     */
    generateUUID() {
        if (crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // 備用方法
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// 建立全域實例
const authManager = new AuthManagerV2();

// 匯出功能（相容舊版）
// 相容舊版的函數
export async function validateLogin(username, password) {
    return await authManager.validateLogin(username, password);
}

export function getCurrentUser() {
    return authManager.getCurrentUser();
}

export function isLoggedIn() {
    return authManager.isLoggedIn();
}

export function logout() {
    return authManager.logout();
}

// 新增的功能
export async function loadUsers() {
    return await authManager.loadUsers();
}

export async function addUser(userData) {
    return await authManager.addUser(userData);
}

export async function removeUser(username) {
    return await authManager.removeUser(username);
}

export async function updateUser(username, updates) {
    return await authManager.updateUser(username, updates);
}

// 權限檢查函數
export function checkPermission(permission) {
    return authManager.checkPermission(authManager.getCurrentUser(), permission);
}

export function isAdmin() {
    return authManager.isAdmin();
}

export function isSuperAdmin() {
    return authManager.isSuperAdmin();

    // 模組清理方法 - 符合規範要求
    destroy() {
        // 清理事件監聽器
        if (this.eventListeners) {
            this.eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners = [];
        }
        
        // 清理定時器
        if (this.intervals) {
            this.intervals.forEach(id => clearInterval(id));
            this.intervals = [];
        }
        if (this.timeouts) {
            this.timeouts.forEach(id => clearTimeout(id));
            this.timeouts = [];
        }
        
        // 清理資料
        this.data = null;
        this.currentUser = null;
        
        // 重置 activeModule
        if (window.activeModule === this) {
            window.activeModule = null;
        }
        
        console.log(`${this.constructor.name} destroyed`);
    }
}

export { getCurrentUser, isLoggedIn, logout, AuthModule };