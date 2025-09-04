// 修復 todos.js 中的 hasProjectPermission 函數
// 這個檔案應該被引入到 todos.js 的開頭部分

/**
 * 檢查使用者是否有專案打包權限
 * @returns {Promise<boolean>}
 */
async function hasProjectPermission() {
    try {
        // 使用全域的 authBridge 而非載入 auth.js
        if (window.authBridge && window.authBridge.initialized) {
            const canUsePackage = window.authBridge.canUsePackageFeature();
            console.log('專案打包權限檢查:', canUsePackage);
            return canUsePackage;
        }
        
        // 備用方案：檢查角色
        const currentUser = window.authBridge?.getCurrentUser();
        if (currentUser) {
            const allowedRoles = ['SUPER_ADMIN', 'BUSINESS_ADMIN'];
            return allowedRoles.includes(currentUser.role);
        }
        
        console.warn('無法確認專案打包權限，使用預設值');
        return false;
        
    } catch (error) {
        console.error('權限檢查錯誤:', error);
        // 失敗時返回 false，不顯示專案打包功能
        return false;
    }
}

// 匯出給 todos.js 使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { hasProjectPermission };
}
