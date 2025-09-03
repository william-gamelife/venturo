/**
 * 人員管理模組 - 遊戲人生 3.0
 * 純雲端架構，角色權限管理，UUID隔離
 */

class UsersModule {
    // SignageHost 招牌資料
    static signage = {
        title: '人員管理',
        subtitle: '戶政事務所｜成員名冊與權限',
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" stroke="currentColor" stroke-width="2"/></svg>',
        actions: [
            { id: 'addUser', label: '新增人員', kind: 'primary', onClick: 'showAddDialog' },
            { id: 'hrChange', label: '人事異動', kind: 'secondary', onClick: 'openHRChangeDialog' }
        ]
    };

    // 靜態資訊（必填）- 店家招牌
    static moduleInfo = {
        name: '人員管理',
        subtitle: '團隊成員管理與權限控制',
        description: '提供完整的使用者帳戶管理功能，支援角色權限控制、個人資料編輯及登入狀態追蹤。僅限管理員存取。',
        icon: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="currentColor" stroke-width="2"/>
               </svg>`,
        version: '1.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.userId = null;
        this.users = [];
        
        // 動態載入 auth 權限檢查
        this.authManager = null;
    }

    async render(userId) {
        // <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg> 必須：第一行設定 activeModule
        window.activeModule = this;
        
        this.userId = userId;
        
        // 動態載入權限檢查
        const authModule = await import('./auth.js');
        this.authManager = authModule;
        
        // 檢查權限 - 使用新的權限系統
        if (!this.authManager.checkPermission('user_management')) {
            const moduleContainer = document.getElementById('moduleContainer');
            moduleContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-light);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 20px;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <h2 style="margin: 0 0 8px 0; color: var(--text); font-size: 1.5rem;">權限不足</h2>
                    <p style="margin: 0; color: var(--text-light);">您沒有權限查看人員管理功能</p>
                    <p style="margin: 8px 0 0 0; color: var(--text-light); font-size: 0.9rem;">需要管理員權限</p>
                </div>
            `;
            return;
        }
        
        // 動態導入 sync manager
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 載入資料
        await this.loadData();
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = `
            <div class="users-container" style="height: 100%; min-height: 500px;">
                <!-- 使用者列表 -->
                <div class="users-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                    <!-- 使用者卡片將動態生成 -->
                </div>

                <!-- 新增使用者對話框 -->
                <div id="addUserModal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                    <div class="modal-content" style="background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                        <h3 style="margin: 0 0 16px 0; color: var(--text);">新增使用者</h3>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">使用者名稱</label>
                            <input type="text" id="userUsername" placeholder="輸入登入用的使用者名稱" 
                                   style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px;">
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">顯示名稱</label>
                            <input type="text" id="userDisplayName" placeholder="輸入顯示的姓名" 
                                   style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px;">
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">職稱</label>
                            <input type="text" id="userTitle" placeholder="輸入職稱" 
                                   style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px;">
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">密碼</label>
                            <input type="password" id="userPassword" placeholder="輸入登入密碼" value="pass1234"
                                   style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px;">
                            <small style="color: var(--text-light); font-size: 12px;">預設: pass1234</small>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">角色</label>
                            <select id="userRole" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px;">
                                <option value="user">一般使用者</option>
                                <option value="project_manager">專案經理</option>
                                <option value="admin">管理員</option>
                                <option value="super_admin">超級管理員</option>
                            </select>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 12px;">
                            <button onclick="window.activeModule.hideAddDialog()" 
                                    style="padding: 10px 20px; border: 1px solid var(--border); background: white; border-radius: 8px; cursor: pointer;">
                                取消
                            </button>
                            <button onclick="window.activeModule.saveUser()" 
                                    style="padding: 10px 20px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                儲存
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
            .welcome-card {
                transition: all 0.3s ease;
            }
            
            .welcome-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            }
            
            .add-user-btn:hover {
                transform: translateY(-2px);
            }

            .user-card {
                background: var(--card);
                border-radius: 16px;
                padding: 20px;
                border: 1px solid var(--border);
                transition: all 0.3s ease;
                position: relative;
                box-shadow: var(--shadow);
            }

            .user-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 40px rgba(0,0,0,0.15);
            }

            .role-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .role-super_admin { background: rgba(168,85,247,0.15); color: #a855f7; }
            .role-admin { background: rgba(239,68,68,0.1); color: #ef4444; }
            .role-project_manager { background: rgba(34,197,94,0.1); color: #22c55e; }
            .role-user { background: rgba(59,130,246,0.1); color: #3b82f6; }

            .user-actions {
                position: absolute;
                top: 16px;
                right: 16px;
                display: flex;
                gap: 4px;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .user-card:hover .user-actions {
                opacity: 1;
            }

            .action-btn {
                width: 28px;
                height: 28px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: all 0.2s;
            }

            .modal-overlay {
                display: none !important;
            }

            .modal-overlay.show {
                display: flex !important;
            }

            @media (max-width: 768px) {
                .users-grid {
                    grid-template-columns: 1fr;
                }
            }
            </style>
        `;
        
        this.attachEventListeners();
        this.renderUsers();

        // 更新招牌
        this.updateSignboard();
    }

    updateSignboard() {
        // 動態更新招牌內容
        const moduleInfo = {
            ...UsersModule.moduleInfo,
            stats: [
                { label: `${this.users.length} 位使用者`, highlight: false }
            ],
            actions: [
                { 
                    label: '新增使用者', 
                    onClick: 'window.activeModule.showAddDialog', 
                    primary: true,
                    icon: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
                }
            ],
            filters: [],
            searchButton: null
        };

        // 更新儀表板招牌
        if (typeof updateModuleSignboard === 'function') {
            updateModuleSignboard(moduleInfo);
        }
    }

    async loadData() {
        try {
            // 直接從 Supabase 載入，不使用本地快取
            // 因為人員管理是多人共用的資料
            if (!this.syncManager.supabase) {
                console.warn('🚨 Supabase 未初始化，使用預設資料');
                this.initDefaultUsers();
                return;
            }

            console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 正在從雲端載入人員資料...');
            
            // 使用系統管理員UUID來存取使用者資料（統一管理）
            const SYSTEM_ADMIN_UUID = '550e8400-e29b-41d4-a716-446655440000';
            const { data, error } = await this.syncManager.supabase
                .from('user_data')
                .select('data')
                .eq('user_id', SYSTEM_ADMIN_UUID)
                .eq('module', 'users')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // 資料不存在，初始化預設資料
                    console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/></svg> 雲端無資料，初始化預設使用者');
                    this.initDefaultUsers();
                    await this.saveUsersToCloud();
                } else {
                    console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 載入失敗:', error);
                    this.initDefaultUsers();
                }
            } else if (data && data.data) {
                this.users = data.data;
                console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 從雲端載入使用者資料:', this.users.length, '筆');
                console.log('使用者列表:', this.users.map(u => u.username));
                
                // 檢查是否缺少使用者，如果少於4個就重新初始化
                if (this.users.length < 4) {
                    console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 使用者數量不足，強制重新初始化');
                    await this.forceReinitUsers();
                } else {
                    // 檢查是否缺少特定使用者
                    const expectedUsers = ['william', 'carson', 'jess', 'KAI'];
                    const existingUsers = this.users.map(u => u.username.toLowerCase());
                    const missingUsers = expectedUsers.filter(u => !existingUsers.includes(u.toLowerCase()));
                    
                    if (missingUsers.length > 0) {
                        console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 缺少使用者:', missingUsers);
                        await this.forceReinitUsers();
                    }
                }
                
                // 清除本地快取（如果存在）
                this.clearLocalCache();
            } else {
                console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/></svg> 雲端資料為空，初始化預設使用者');
                this.initDefaultUsers();
                await this.saveUsersToCloud();
            }
        } catch (error) {
            console.error('載入使用者資料失敗:', error);
            this.initDefaultUsers();
        }
    }

    // 初始化預設使用者
    initDefaultUsers() {
        this.users = [
            {
                uuid: '550e8400-e29b-41d4-a716-446655440001',
                username: 'william',
                display_name: 'William',
                title: 'IT主管',
                role: 'super_admin',
                created_at: '2024-01-01T00:00:00Z',
                last_login_at: new Date().toISOString()
            },
            {
                uuid: '550e8400-e29b-41d4-a716-446655440002',
                username: 'carson',
                display_name: 'Carson',
                title: '工程師',
                role: 'admin',
                created_at: '2024-01-01T00:00:00Z',
                last_login_at: new Date().toISOString()
            },
            {
                uuid: '550e8400-e29b-41d4-a716-446655440003',
                username: 'jess',
                display_name: 'Jess',
                title: '專案經理',
                role: 'project_manager',
                created_at: '2024-01-01T00:00:00Z',
                last_login_at: new Date().toISOString()
            },
            {
                uuid: '550e8400-e29b-41d4-a716-446655440004',
                username: 'KAI',
                display_name: 'KAI',
                title: '使用者',
                role: 'user',
                created_at: '2024-01-01T00:00:00Z',
                last_login_at: new Date().toISOString()
            }
        ];
    }

    // 直接儲存到雲端，不使用本地快取
    async saveUsersToCloud() {
        try {
            if (!this.syncManager.supabase) {
                console.warn('🚨 Supabase 未初始化，無法儲存');
                return;
            }

            console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 正在儲存人員資料到雲端...');
            
            const SYSTEM_ADMIN_UUID = '550e8400-e29b-41d4-a716-446655440000';
            const saveData = {
                user_id: SYSTEM_ADMIN_UUID,
                module: 'users',
                data: this.users,
                updated_at: new Date().toISOString()
            };

            // 直接存到 Supabase，不使用 sync.js
            const { data: result, error } = await this.syncManager.supabase
                .from('user_data')
                .upsert(saveData, {
                    onConflict: 'user_id,module'
                })
                .select();

            if (error) {
                console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 儲存失敗:', error);
            } else {
                console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 人員資料已儲存到雲端');
                // 清除本地快取
                this.clearLocalCache();
            }
        } catch (error) {
            console.error('儲存過程發生錯誤:', error);
        }
    }

    // 清除本地快取
    clearLocalCache() {
        try {
            const key = `gamelife_${this.userId}_users`;
            localStorage.removeItem(key);
            
            // 也清除系統管理員的快取
            const systemKey = 'gamelife_550e8400-e29b-41d4-a716-446655440000_users';
            localStorage.removeItem(systemKey);
            
            console.log('🧹 已清除人員管理本地快取');
        } catch (error) {
            console.error('清除本地快取失敗:', error);
        }
    }

    // 強制重新初始化使用者資料
    async forceReinitUsers() {
        console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4v6h-6"/><polyline points="1 20v-6h6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg> 強制重新初始化使用者資料...');
        
        // 清除所有快取
        this.clearLocalCache();
        
        // 重新初始化預設使用者
        this.initDefaultUsers();
        
        // 強制儲存到雲端
        await this.saveUsersToCloud();
        
        console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 使用者資料已重新初始化');
        return true;
    }

    renderUsers() {
        const grid = document.querySelector('.users-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.users.forEach(user => {
            const userCard = this.createUserCard(user);
            grid.appendChild(userCard);
        });

        this.updateStats();
    }

    createUserCard(user) {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.dataset.userId = user.uuid;

        const lastLogin = user.last_login_at ? 
            new Date(user.last_login_at).toLocaleString() : '從未登入';
        
        const isOnline = user.last_login_at && 
            (Date.now() - new Date(user.last_login_at).getTime()) < 300000; // 5分鐘內為在線

        div.innerHTML = `
            <div class="user-actions">
                <button class="action-btn" style="background: #3b82f6; color: white;" onclick="window.activeModule.editUser('${user.uuid}')" title="編輯">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M8.5 1L11 3.5 4 10.5H1.5V8L8.5 1z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    </svg>
                </button>
                ${user.uuid !== this.userId ? `
                <button class="action-btn" style="background: #ef4444; color: white;" onclick="window.activeModule.deleteUser('${user.uuid}')" title="刪除">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                ` : ''}
            </div>
            
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                    ${user.display_name.charAt(0).toUpperCase()}
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text);">${this.escapeHtml(user.display_name)}</h4>
                    <p style="margin: 0; font-size: 13px; color: var(--text-light);">@${this.escapeHtml(user.username)}</p>
                </div>
                <div class="status-indicator" style="width: 8px; height: 8px; border-radius: 50%; background: ${isOnline ? '#22c55e' : '#6b7280'};"></div>
            </div>

            <div style="margin-bottom: 16px;">
                <span class="role-badge role-${user.role}">
                    ${this.getRoleDisplayName(user.role)}
                </span>
            </div>

            <div style="font-size: 13px; color: var(--text-light); line-height: 1.4;">
                <p style="margin: 0 0 4px 0;">職稱: ${user.title || '未設定職稱'}</p>
                <p style="margin: 0 0 4px 0;">註冊: ${new Date(user.created_at).toLocaleDateString()}</p>
                <p style="margin: 0;">最後登入: ${lastLogin}</p>
            </div>

            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-light);">
                    <span>權限等級</span>
                    <span style="font-weight: 600;">${this.getPermissionLevel(user.role)}</span>
                </div>
            </div>
        `;

        return div;
    }

    showAddDialog() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            document.getElementById('userUsername').value = '';
            document.getElementById('userDisplayName').value = '';
            document.getElementById('userTitle').value = '';
            document.getElementById('userRole').value = 'user';
            
            modal.classList.add('show');
            document.getElementById('userUsername').focus();
        }
    }

    hideAddDialog() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    async saveUser() {
        const username = document.getElementById('userUsername').value.trim();
        const displayName = document.getElementById('userDisplayName').value.trim();
        const title = document.getElementById('userTitle').value.trim();
        const password = document.getElementById('userPassword').value.trim();
        const role = document.getElementById('userRole').value;

        if (!username || !displayName) {
            this.showToast('請填寫使用者名稱和顯示名稱', 'error');
            return;
        }
        
        if (!password) {
            this.showToast('請輸入密碼', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showToast('使用者名稱已存在', 'error');
            return;
        }

        const userData = {
            uuid: this.generateUUID(),
            username: username,
            display_name: displayName,
            password: password,  // 加入密碼
            title: title,
            role: role,
            created_at: new Date().toISOString(),
            last_login_at: null
        };

        try {
            console.log('新增使用者:', userData);
            this.users.push(userData);
            
            // 儲存到雲端（不使用本地快取）
            await this.saveUsersToCloud();
            console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 使用者已新增並儲存到雲端');
            
            this.renderUsers();
            this.hideAddDialog();
            this.showToast('使用者已新增', 'success');
        } catch (error) {
            console.error('新增使用者失敗:', error);
            this.showToast('新增使用者失敗，請稍後再試', 'error');
            this.users.pop(); // 移除失敗的項目
        }
    }

    editUser(userUuid) {
        const user = this.users.find(u => u.uuid === userUuid);
        if (!user) {
            console.error('找不到使用者:', userUuid);
            return;
        }

        console.log('正在編輯使用者:', user);
        // 顯示編輯對話框
        this.showEditDialog(user);
    }

    async deleteUser(userUuid) {
        if (userUuid === this.userId) {
            this.showToast('不能刪除自己的帳戶', 'error');
            return;
        }

        const user = this.users.find(u => u.uuid === userUuid);
        if (!user) return;

        if (!await this.showConfirm(`確定要刪除使用者 "${user.display_name}" 嗎？`)) return;

        const index = this.users.findIndex(u => u.uuid === userUuid);
        if (index === -1) return;

        const removed = this.users.splice(index, 1);

        try {
            await this.saveUsersToCloud();
            this.renderUsers();
            console.log('🗑️ 使用者已刪除');
        } catch (error) {
            console.error('刪除使用者失敗:', error);
            this.users.splice(index, 0, ...removed); // 恢復
        }
    }

    updateStats() {
        // 統計功能已移除 - 簡化介面設計
        // 不再顯示使用者數量統計資訊
    }

    attachEventListeners() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAddDialog();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAddDialog();
            }
        });
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getRoleDisplayName(role) {
        const roleMap = {
            'super_admin': '超級管理員',
            'admin': '管理員',
            'project_manager': '專案經理',
            'user': '使用者'
        };
        return roleMap[role] || '使用者';
    }

    getPermissionLevel(role) {
        const levels = {
            'super_admin': '超級',
            'admin': '最高',
            'project_manager': '進階',
            'user': '標準'
        };
        return levels[role] || '未知';
    }

    // Toast 提示系統
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${
                type === 'error' ? '#ef4444' : 
                type === 'success' ? '#22c55e' : 
                '#3b82f6'
            };
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 確認對話框
    async showConfirm(message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
            `;
            
            dialog.innerHTML = `
                <p style="margin: 0 0 20px 0; color: var(--text);">${message}</p>
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="confirmCancel" style="padding: 8px 16px; border: 1px solid var(--border); background: white; border-radius: 8px; cursor: pointer;">取消</button>
                    <button id="confirmOK" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer;">確定</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            document.getElementById('confirmCancel').onclick = () => {
                overlay.remove();
                resolve(false);
            };
            
            document.getElementById('confirmOK').onclick = () => {
                overlay.remove();
                resolve(true);
            };
        });
    }

    // 編輯對話框
    showEditDialog(user) {
        console.log('開啟編輯對話框，使用者資料:', user);
        
        // 先檢查是否已有其他對話框
        const existingDialog = document.querySelector('.edit-dialog-overlay');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'edit-dialog-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 16px 0; color: var(--text);">編輯使用者</h3>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">顯示名稱</label>
                <input type="text" id="editDisplayName" value="${this.escapeHtml(user.display_name)}" 
                       style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px;">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">職稱</label>
                <input type="text" id="editTitle" value="${this.escapeHtml(user.title || '')}" 
                       style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px;">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">角色</label>
                <select id="editRole" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px;">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>一般使用者</option>
                    <option value="project_manager" ${user.role === 'project_manager' ? 'selected' : ''}>專案經理</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理員</option>
                    <option value="super_admin" ${user.role === 'super_admin' ? 'selected' : ''}>超級管理員</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500; color: var(--text);">密碼</label>
                <input type="password" id="editPassword" placeholder="輸入新密碼（留空則不修改）" 
                       style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px;">
                <small style="color: var(--text-light); font-size: 12px;">目前密碼: ${user.password ? '已設定' : '未設定'}</small>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button id="editCancel" style="padding: 10px 20px; border: 1px solid var(--border); background: white; border-radius: 8px; cursor: pointer;">
                    取消
                </button>
                <button id="editSave" style="padding: 10px 20px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; border: none; border-radius: 8px; cursor: pointer;">
                    儲存
                </button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 綁定事件 - 使用 setTimeout 確保 DOM 已經準備好
        setTimeout(() => {
            const cancelBtn = document.getElementById('editCancel');
            const saveBtn = document.getElementById('editSave');
            
            if (!cancelBtn || !saveBtn) {
                console.error('無法找到編輯對話框按鈕');
                return;
            }
            
            cancelBtn.onclick = () => {
                console.log('取消編輯');
                overlay.remove();
            };
        
            saveBtn.onclick = async () => {
                console.log('儲存編輯開始');
                console.log('編輯前的使用者資料:', JSON.parse(JSON.stringify(user)));
                
                const newDisplayName = document.getElementById('editDisplayName').value.trim();
                const newTitle = document.getElementById('editTitle').value.trim();
                const newRole = document.getElementById('editRole').value;
                const newPassword = document.getElementById('editPassword').value.trim();
                
                console.log('新的資料:', { newDisplayName, newTitle, newRole });
                
                if (!newDisplayName) {
                    this.showToast('顯示名稱不能為空', 'error');
                    return;
                }
                
                // 找到並更新使用者資料
                const userIndex = this.users.findIndex(u => u.uuid === user.uuid);
                if (userIndex !== -1) {
                    this.users[userIndex].display_name = newDisplayName;
                    this.users[userIndex].title = newTitle;
                    this.users[userIndex].role = newRole;
                    
                    // 如果有輸入新密碼，則更新密碼
                    if (newPassword) {
                        this.users[userIndex].password = newPassword;
                        console.log('密碼已更新');
                    }
                    
                    this.users[userIndex].updated_at = new Date().toISOString();
                    
                    console.log('更新後的使用者資料:', this.users[userIndex]);
                    console.log('所有使用者資料:', this.users);
                    
                    try {
                        // 儲存到雲端（不使用本地快取）
                        await this.saveUsersToCloud();
                        console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 已儲存到 Supabase');
                        
                        // 重新渲染列表
                        this.renderUsers();
                        this.showToast('使用者資料已更新', 'success');
                        overlay.remove();
                    } catch (error) {
                        console.error('更新失敗:', error);
                        this.showToast('更新失敗，請稍後再試', 'error');
                    }
                } else {
                    console.error('找不到要更新的使用者');
                    this.showToast('找不到要更新的使用者', 'error');
                }
            };
        }, 100);
    }

    // SignageHost 按鈕方法：人事異動對話框
    openHRChangeDialog() {
        // TODO: 實現新增/調職/停用成員的對話框
        console.log('人事異動功能待實現');
        
        // 可以在這裡實現：
        // 1. 顯示人事異動選項對話框（新增/調職/停用）
        // 2. 根據選項顯示相應的表單
        // 3. 處理人員資料的變更
        // 4. 更新權限和狀態
        
        // 暫時顯示提示
        this.showToast('人事異動功能開發中...', 'info');
    }
}

export { UsersModule 
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