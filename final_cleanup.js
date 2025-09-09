#!/usr/bin/env node

/**
 * 🧹 完全清理 ERP 模組的錯誤程式碼
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 完全清理錯誤程式碼...\n');

const PROJECT_ROOT = '/Users/williamchien/Desktop/Venturo/Venturo';
const MODULES = ['groups', 'orders', 'receipts', 'invoices', 'quotations'];

function cleanModule(moduleName) {
  console.log(`清理 ${moduleName}...`);
  
  const modulePath = path.join(PROJECT_ROOT, `src/app/dashboard/${moduleName}/page.tsx`);
  
  if (!fs.existsSync(modulePath)) {
    console.log(`  ⚠️  檔案不存在`);
    return;
  }
  
  let content = fs.readFileSync(modulePath, 'utf8');
  
  // 移除所有殘留的 onMouseEnter 和 onMouseLeave
  content = content.replace(/ e\.currentTarget\.style\.background[^}]+}/g, '');
  content = content.replace(/ onMouseEnter={[^}]+}/g, '');
  content = content.replace(/ onMouseLeave={[^}]+}/g, '');
  
  // 移除錯誤的 style 屬性
  content = content.replace(/ style={{ transition: "all 0\.3s ease" }}/g, '');
  
  // 清理多餘的空格和換行
  content = content.replace(/>\s+e\./g, '>');
  content = content.replace(/className="hover:bg-primary-light"/g, 'className="hover:bg-gray-50"');
  
  // 確保 tr 標籤格式正確
  content = content.replace(/<tr([^>]+)>\s*>/g, '<tr$1>');
  content = content.replace(/<tr([^>]+)>>/g, '<tr$1>');
  
  fs.writeFileSync(modulePath, content);
  console.log(`  ✅ 已清理`);
}

// 清理所有模組
MODULES.forEach(cleanModule);

console.log('\n✅ 所有錯誤程式碼已清理完成！');
console.log('🎯 現在 ERP 模組應該可以正常運作了');
