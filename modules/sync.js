/**
 * 同步管理器 - 遊戲人生 3.0
 * 真正的 Supabase 雲端同步系統，使用 UUID 隔離
 */

class SyncManager {
    constructor() {
        // Supabase 配置
        this.SUPABASE_URL = 'https://jjazipnkoccgmbpccalf.supabase.co';
        this.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqYXppcG5rb2NjZ21icGNjYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDMxOTIsImV4cCI6MjA3MTk3OTE5Mn0.jHH2Jf-gbx0UKqvUgxG-Nx2f_QwVqZBOFqtbAxzYvnY';
        
        // 初始化 Supabase 客戶端
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase 客戶端未載入，請確認已引入 Supabase JavaScript 客戶端');
            this.supabase = null;
        } else {
            this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
            console.log('☁️ Supabase 同步管理器已初始化');
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

            console.log(`☁️ 正在儲存到雲端: ${module} (${userId.substring(0, 8)}...)`);

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
                console.error('☁️ Supabase 儲存失敗:', error);
                // 如果雲端失敗，至少儲存到本地快取
                this.saveToLocalStorage(userId, module, data);
                return { success: false, error: error.message };
            }

            console.log(`✅ 雲端儲存成功: ${module} (${userId.substring(0, 8)}...)`);
            
            // 同時儲存到本地快取
            this.saveToLocalStorage(userId, module, data);
            
            return { success: true, data: result };
            
        } catch (error) {
            console.error('☁️ 儲存過程發生錯誤:', error);
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

            console.log(`☁️ 正在從雲端載入: ${module} (${userId.substring(0, 8)}...)`);

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
                
                console.error('☁️ Supabase 讀取失敗:', error);
                // 如果雲端失敗，嘗試從本地快取讀取
                console.log('🔄 嘗試從本地快取讀取...');
                return this.loadFromLocalStorage(userId, module);
            }

            if (data && data.data) {
                console.log(`✅ 雲端載入成功: ${module} (${userId.substring(0, 8)}...)`);
                
                // 同時更新本地快取
                this.saveToLocalStorage(userId, module, data.data);
                
                return data.data;
            }

            return null;
            
        } catch (error) {
            console.error('☁️ 載入過程發生錯誤:', error);
            // 錯誤時嘗試從本地快取讀取
            console.log('🔄 嘗試從本地快取讀取...');
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
                console.error('☁️ Supabase 刪除失敗:', error);
                return { success: false, error: error.message };
            }

            console.log(`✅ 雲端刪除成功: ${module} (${userId.substring(0, 8)}...)`);
            
            // 同時從本地快取刪除
            this.deleteFromLocalStorage(userId, module);
            
            return { success: true };
            
        } catch (error) {
            console.error('☁️ 刪除過程發生錯誤:', error);
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
                console.error('☁️ 清除雲端資料失敗:', error);
                return { success: false, error: error.message };
            }

            const deletedCount = data ? data.length : 0;
            console.log(`✅ 已清除 ${deletedCount} 項雲端資料 (${userId.substring(0, 8)}...)`);
            
            // 同時清除本地快取
            this.clearUserDataFromLocalStorage(userId);
            
            return { success: true, deletedItems: deletedCount };
            
        } catch (error) {
            console.error('☁️ 清除資料過程發生錯誤:', error);
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
                console.error('☁️ 列出模組失敗:', error);
                return this.listModulesFromLocalStorage(userId);
            }

            return data ? data.map(row => row.module) : [];
            
        } catch (error) {
            console.error('☁️ 列出模組過程發生錯誤:', error);
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
            console.log(`💾 本地快取已儲存: ${module} (${userId.substring(0, 8)}...)`);
            
            return { success: true };
        } catch (error) {
            console.error('💾 本地快取儲存失敗:', error);
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
            console.log(`💾 本地快取已載入: ${module} (${userId.substring(0, 8)}...)`);
            
            return parsed.data;
        } catch (error) {
            console.error('💾 本地快取載入失敗:', error);
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
            console.log(`💾 本地快取已刪除: ${module} (${userId.substring(0, 8)}...)`);
            
            return { success: true };
        } catch (error) {
            console.error('💾 本地快取刪除失敗:', error);
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
            
            console.log(`💾 已清除本地快取: ${keysToRemove.length} 項目 (${userId.substring(0, 8)}...)`);
            
            return { success: true, deletedItems: keysToRemove.length };
        } catch (error) {
            console.error('💾 清除本地快取失敗:', error);
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
            console.error('💾 列出本地模組失敗:', error);
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
            console.error('💾 本地儲存不可用:', error);
            return false;
        }
    }
}

export { SyncManager };