#!/usr/bin/env node
/**
 * 權限系統測試工具
 */

const { getPermissionHelper } = require('./permission-helper.js');

async function testPermissions() {
    console.log('🧪 開始權限系統測試...\n');

    const helper = getPermissionHelper();

    // 測試登入驗證
    console.log('1️⃣ 測試登入驗證:');
    const williamLogin = helper.validateUser('william', 'pass1234');
    const carsonLogin = helper.validateUser('carson', 'pass1234');
    const kaiLogin = helper.validateUser('kai', 'pass1234');
    
    console.log(`威廉登入: ${williamLogin ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`Carson登入: ${carsonLogin ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`KAI登入: ${kaiLogin ? '✅ 成功' : '❌ 失敗'}\n`);

    if (!williamLogin || !carsonLogin || !kaiLogin) {
        console.error('❌ 登入測試失敗，請檢查種子資料');
        return;
    }

    // 測試模組存取權限
    console.log('2️⃣ 測試模組存取權限:');
    
    const testModules = ['users', 'projects', 'todos', 'calendar'];
    const testUsers = [
        { name: '威廉(超級)', uuid: williamLogin.uuid, role: 'SUPER_ADMIN' },
        { name: 'Carson(商務)', uuid: carsonLogin.uuid, role: 'BUSINESS_ADMIN' },
        { name: 'KAI(一般)', uuid: kaiLogin.uuid, role: 'GENERAL_USER' }
    ];

    testUsers.forEach(user => {
        console.log(`\n${user.name} 的模組權限:`);
        testModules.forEach(module => {
            const canAccess = helper.canAccessModule(user.uuid, module);
            const canModify = helper.canModifyModule(user.uuid, module);
            const canDelete = helper.canDeleteFromModule(user.uuid, module);
            
            console.log(`  ${module}: 存取${canAccess ? '✅' : '❌'} 修改${canModify ? '✅' : '❌'} 刪除${canDelete ? '✅' : '❌'}`);
        });
    });

    // 測試特殊功能權限
    console.log('\n3️⃣ 測試特殊功能權限:');
    
    testUsers.forEach(user => {
        const canPackage = helper.canUsePackageFeature(user.uuid);
        const isSuperAdmin = helper.isSuperAdmin(user.uuid);
        
        console.log(`${user.name}: 打包功能${canPackage ? '✅' : '❌'} 超級管理員${isSuperAdmin ? '✅' : '❌'}`);
    });

    // 測試可見模組列表
    console.log('\n4️⃣ 測試可見模組列表:');
    
    testUsers.forEach(user => {
        const visibleModules = helper.getVisibleModules(user.uuid);
        console.log(`${user.name} 可見模組: ${visibleModules.join(', ')}`);
    });

    // 測試角色資訊
    console.log('\n5️⃣ 測試角色資訊:');
    
    testUsers.forEach(user => {
        const roleInfo = helper.getUserRole(user.uuid);
        console.log(`${user.name}:`);
        console.log(`  角色: ${roleInfo.roleInfo.name}`);
        console.log(`  等級: ${roleInfo.roleInfo.level}`);
        console.log(`  描述: ${roleInfo.roleInfo.description}`);
    });

    console.log('\n✅ 權限系統測試完成！');
}

// 執行測試
if (require.main === module) {
    testPermissions().catch(console.error);
}

module.exports = { testPermissions };