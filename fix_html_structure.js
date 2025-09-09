#!/usr/bin/env node

/**
 * 🏗️ 修復所有 ERP 模組的 HTML 結構問題
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️ 修復 HTML 結構問題...\n');

const PROJECT_ROOT = '/Users/williamchien/Desktop/Venturo/Venturo';
const MODULES = ['groups', 'orders', 'receipts', 'invoices', 'quotations'];

function fixModule(moduleName) {
  console.log(`修復 ${moduleName}...`);
  
  const modulePath = path.join(PROJECT_ROOT, `src/app/dashboard/${moduleName}/page.tsx`);
  
  if (!fs.existsSync(modulePath)) {
    console.log(`  ⚠️  檔案不存在`);
    return;
  }
  
  let content = fs.readFileSync(modulePath, 'utf8');
  
  // 修復表格結構問題
  // 找到有問題的 tr 結構（缺少開始的 td）
  content = content.replace(
    /<tr key={[^}]+} className="hover:bg-gray-50">\s*<\/td>/g,
    (match) => {
      const keyMatch = match.match(/key={([^}]+)}/);
      const key = keyMatch ? keyMatch[1] : 'item.id';
      return `<tr key={${key}} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {${key.split('.')[0]}.${getFirstField(moduleName)}}
                    </td>`;
    }
  );
  
  // 修復缺少第一個 td 的問題
  const tableRowRegex = /<tr key={([^}]+)} className="hover:bg-gray-50">\s*<td/g;
  if (!content.match(tableRowRegex)) {
    // 如果沒有正確的 td 開始標籤
    content = content.replace(
      /<tr key={([^}]+)} className="hover:bg-gray-50">/g,
      (match, key) => {
        const varName = key.split('.')[0];
        const field = getFirstField(moduleName);
        return `<tr key={${key}} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {${varName}.${field}}`;
      }
    );
  }
  
  // 移除多餘的 div 包裹
  // 檢查是否有正確的結構
  if (content.includes('<div style={{ background: \'linear-gradient')) {
    // 確保 ModuleLayout 在 div 內部
    if (!content.includes('</ModuleLayout>\n    </div>')) {
      // 需要修復結構
      content = content.replace(
        /<div style={{ background:[^}]+}}>\s*\n\s*<ModuleLayout>/,
        '<ModuleLayout>'
      );
      
      // 移除多餘的結束 div
      content = content.replace(/\n\s*<\/div>\s*\);/, '\n  );');
    }
  }
  
  fs.writeFileSync(modulePath, content);
  console.log(`  ✅ 已修復`);
}

// 取得每個模組的第一個欄位名稱
function getFirstField(moduleName) {
  const fields = {
    'groups': 'groupCode',
    'orders': 'orderNumber', 
    'receipts': 'receiptNumber',
    'invoices': 'invoiceNumber',
    'quotations': 'id'
  };
  return fields[moduleName] || 'id';
}

// 修復所有模組
MODULES.forEach(fixModule);

console.log('\n✅ HTML 結構修復完成！');
