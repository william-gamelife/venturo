/**
 * 同步管理器 - 遊戲人生 3.0
 * 真正的 Supabase 雲端同步系統，使用 UUID 隔離
 */

class SyncManager {
    
    // Toast 通知系統
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">
                    ${type === 'success' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' : type === 'error' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' : 'ⓘ'}
                </span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // 添加樣式（如果尚未存在）
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    min-width: 300px;
                    padding: 12px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    animation: toastSlideIn 0.3s ease;
                }
                .toast-info { background: #e3f2fd; border-left: 4px solid #2196f3; color: #1976d2; }
                .toast-success { background: #e8f5e8; border-left: 4px solid #4caf50; color: #2e7d32; }
                .toast-error { background: #ffebee; border-left: 4px solid #f44336; color: #c62828; }
                .toast-content { display: flex; align-items: center; gap: 8px; }
                .toast-close { background: none; border: none; font-size: 18px; cursor: pointer; margin-left: auto; }
                @keyframes toastSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // 自動移除
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
        
        return toast;
    }

    // Toast 確認對話框
    showConfirm(message, onConfirm, onCancel = null) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-content">
                    <h3>確認操作</h3>
                    <p>${message}</p>
                    <div class="confirm-actions">
                        <button class="btn btn-secondary cancel-btn">取消</button>
                        <button class="btn btn-primary confirm-btn">確定</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加樣式
        if (!document.getElementById('confirm-styles')) {
            const style = document.createElement('style');
            style.id = 'confirm-styles';
            style.textContent = `
                .confirm-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); z-index: 10001;
                    display: flex; align-items: center; justify-content: center;
                }
                .confirm-dialog {
                    background: white; border-radius: 12px; padding: 24px;
                    min-width: 320px; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                }
                .confirm-content h3 { margin: 0 0 16px; color: #333; }
                .confirm-content p { margin: 0 0 24px; color: #666; line-height: 1.5; }
                .confirm-actions { display: flex; gap: 12px; justify-content: flex-end; }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
        
        // 事件處理
        overlay.querySelector('.cancel-btn').onclick = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };
        
        overlay.querySelector('.confirm-btn').onclick = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        };
    }

    constructor() {
        // 使用全域單例 Supabase 客戶端
        this.supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
        
        if (!this.supabase) {
            console.warn('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 全域 Supabase 客戶端未找到，將僅使用本地儲存');
        window.activeModule = this;
        } else {
            console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> SyncManager 已連接到全域 Supabase 客戶端');
        }
        
        // localStorage 作為快取
        this.localStorage = window.localStorage;
    }

    /**
     * 儲存資料到 Supabase user_data 表
     * @param {string} userId - 使用者 UUID
     * @param {string} module - 模組名稱
     * @param {any} data - 要儲存的資料
     */
    async save(userId, module, data) {
        try {
            if (!this.supabase) {
                console.warn('Supabase 未初始化，僅儲存到本地快取');
                return this.saveToLocalStorage(userId, module, data);
            }

            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 正在儲存到雲端: ${module} (${userId.substring(0, 8)}...)`);

            // 準備要儲存的資料
            const saveData = {
                user_id: userId,
                module: module,
                data: data,
                updated_at: new Date().toISOString()
            };

            // 使用 upsert 來插入或更新資料
            const { data: result, error } = await this.supabase
                .from('user_data')
                .upsert(saveData, {
                    onConflict: 'user_id,module'
                })
                .select();

            if (error) {
                console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> Supabase 儲存失敗:', error);
                // 如果雲端失敗，至少儲存到本地快取
                this.saveToLocalStorage(userId, module, data);
                return { success: false, error: error.message };
            }

            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 雲端儲存成功: ${module} (${userId.substring(0, 8)}...)`);
            
            // 同時儲存到本地快取
            this.saveToLocalStorage(userId, module, data);
            
            return { success: true, data: result };
            
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 儲存過程發生錯誤:', error);
            // 錯誤時至少儲存到本地快取
            this.saveToLocalStorage(userId, module, data);
            return { success: false, error: error.message };
        }
    }

    /**
     * 從 Supabase 載入資料
     * @param {string} userId - 使用者 UUID
     * @param {string} module - 模組名稱
     * @returns {any} 載入的資料
     */
    async load(userId, module) {
        try {
            if (!this.supabase) {
                console.warn('Supabase 未初始化，從本地快取讀取');
                return this.loadFromLocalStorage(userId, module);
            }

            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 正在從雲端載入: ${module} (${userId.substring(0, 8)}...)`);

            const { data, error } = await this.supabase
                .from('user_data')
                .select('data, updated_at')
                .eq('user_id', userId)
                .eq('module', module)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // 資料不存在，這是正常情況
                    console.log(`📂 雲端無資料: ${module} (${userId.substring(0, 8)}...)`);
                    return null;
                }
                
                console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> Supabase 讀取失敗:', error);
                // 如果雲端失敗，嘗試從本地快取讀取
                console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4v6h-6"/><polyline points="1 20v-6h6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg> 嘗試從本地快取讀取...');
                return this.loadFromLocalStorage(userId, module);
            }

            if (data && data.data) {
                console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 雲端載入成功: ${module} (${userId.substring(0, 8)}...)`);
                
                // 同時更新本地快取
                this.saveToLocalStorage(userId, module, data.data);
                
                return data.data;
            }

            return null;
            
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 載入過程發生錯誤:', error);
            // 錯誤時嘗試從本地快取讀取
            console.log('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4v6h-6"/><polyline points="1 20v-6h6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg> 嘗試從本地快取讀取...');
            return this.loadFromLocalStorage(userId, module);
        }
    }

    /**
     * 刪除雲端資料
     * @param {string} userId - 使用者 UUID
     * @param {string} module - 模組名稱
     */
    async delete(userId, module) {
        try {
            if (!this.supabase) {
                console.warn('Supabase 未初始化，僅從本地快取刪除');
                return this.deleteFromLocalStorage(userId, module);
            }

            console.log(`🗑️ 正在從雲端刪除: ${module} (${userId.substring(0, 8)}...)`);

            const { error } = await this.supabase
                .from('user_data')
                .delete()
                .eq('user_id', userId)
                .eq('module', module);

            if (error) {
                console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> Supabase 刪除失敗:', error);
                return { success: false, error: error.message };
            }

            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 雲端刪除成功: ${module} (${userId.substring(0, 8)}...)`);
            
            // 同時從本地快取刪除
            this.deleteFromLocalStorage(userId, module);
            
            return { success: true };
            
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 刪除過程發生錯誤:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 清除特定使用者的所有雲端資料
     * @param {string} userId - 使用者 UUID
     */
    async clearUserData(userId) {
        try {
            if (!this.supabase) {
                console.warn('Supabase 未初始化，僅清除本地快取');
                return this.clearUserDataFromLocalStorage(userId);
            }

            console.log(`🧹 正在清除使用者雲端資料: (${userId.substring(0, 8)}...)`);

            const { data, error } = await this.supabase
                .from('user_data')
                .delete()
                .eq('user_id', userId)
                .select();

            if (error) {
                console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 清除雲端資料失敗:', error);
                return { success: false, error: error.message };
            }

            const deletedCount = data ? data.length : 0;
            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> 已清除 ${deletedCount} 項雲端資料 (${userId.substring(0, 8)}...)`);
            
            // 同時清除本地快取
            this.clearUserDataFromLocalStorage(userId);
            
            return { success: true, deletedItems: deletedCount };
            
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 清除資料過程發生錯誤:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 列出使用者的所有模組（從雲端）
     * @param {string} userId - 使用者 UUID
     * @returns {Array} 模組列表
     */
    async listModules(userId) {
        try {
            if (!this.supabase) {
                console.warn('Supabase 未初始化，從本地快取列出');
                return this.listModulesFromLocalStorage(userId);
            }

            const { data, error } = await this.supabase
                .from('user_data')
                .select('module')
                .eq('user_id', userId);

            if (error) {
                console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 列出模組失敗:', error);
                return this.listModulesFromLocalStorage(userId);
            }

            return data ? data.map(row => row.module) : [];
            
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> 列出模組過程發生錯誤:', error);
            return this.listModulesFromLocalStorage(userId);
        }
    }

    /**
     * 測試 Supabase 連線
     */
    async testConnection() {
        try {
            if (!this.supabase) {
                return { success: false, message: 'Supabase 客戶端未初始化' };
            }

            // 嘗試查詢 user_data 表來測試連線
            const { data, error } = await this.supabase
                .from('user_data')
                .select('count')
                .limit(1);

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, message: 'Supabase 連線正常' };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =================== 本地快取輔助方法 ===================

    /**
     * 儲存到本地 localStorage（作為快取）
     */
    saveToLocalStorage(userId, module, data) {
        try {
            const key = `gamelife_${userId}_${module}`;
            const serializedData = JSON.stringify({
                data: data,
                timestamp: new Date().toISOString(),
                version: '3.0'
            });
            
            this.localStorage.setItem(key, serializedData);
            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 本地快取已儲存: ${module} (${userId.substring(0, 8)}...)`);
            
            return { success: true };
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 本地快取儲存失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 從本地 localStorage 載入（快取）
     */
    loadFromLocalStorage(userId, module) {
        try {
            const key = `gamelife_${userId}_${module}`;
            const serializedData = this.localStorage.getItem(key);
            
            if (!serializedData) {
                console.log(`📂 本地快取無資料: ${module} (${userId.substring(0, 8)}...)`);
                return null;
            }
            
            const parsed = JSON.parse(serializedData);
            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 本地快取已載入: ${module} (${userId.substring(0, 8)}...)`);
            
            return parsed.data;
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 本地快取載入失敗:', error);
            return null;
        }
    }

    /**
     * 從本地 localStorage 刪除
     */
    deleteFromLocalStorage(userId, module) {
        try {
            const key = `gamelife_${userId}_${module}`;
            this.localStorage.removeItem(key);
            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 本地快取已刪除: ${module} (${userId.substring(0, 8)}...)`);
            
            return { success: true };
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 本地快取刪除失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 清除使用者的所有本地快取
     */
    clearUserDataFromLocalStorage(userId) {
        try {
            const keysToRemove = [];
            const prefix = `gamelife_${userId}_`;
            
            for (let i = 0; i < this.localStorage.length; i++) {
                const key = this.localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                this.localStorage.removeItem(key);
            });
            
            console.log(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 已清除本地快取: ${keysToRemove.length} 項目 (${userId.substring(0, 8)}...)`);
            
            return { success: true, deletedItems: keysToRemove.length };
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 清除本地快取失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 列出使用者的所有本地模組
     */
    listModulesFromLocalStorage(userId) {
        try {
            const modules = [];
            const prefix = `gamelife_${userId}_`;
            
            for (let i = 0; i < this.localStorage.length; i++) {
                const key = this.localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const module = key.replace(prefix, '');
                    modules.push(module);
                }
            }
            
            return modules;
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 列出本地模組失敗:', error);
            return [];
        }
    }

    /**
     * 檢查本地儲存是否可用
     */
    isLocalStorageAvailable() {
        try {
            const testKey = 'gamelife_storage_test';
            this.localStorage.setItem(testKey, 'test');
            this.localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.error('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> 本地儲存不可用:', error);
            return false;
        }
    }
}

export { SyncManager 
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