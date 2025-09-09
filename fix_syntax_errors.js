#!/usr/bin/env node

/**
 * 🔧 修復 ERP 模組語法錯誤
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修復語法錯誤...\n');

const PROJECT_ROOT = '/Users/williamchien/Desktop/Venturo/Venturo';
const ERP_MODULES = ['groups', 'orders', 'receipts', 'invoices', 'quotations'];

function fixModule(moduleName) {
  console.log(`修復 ${moduleName}...`);
  
  const modulePath = path.join(PROJECT_ROOT, `src/app/dashboard/${moduleName}/page.tsx`);
  
  if (!fs.existsSync(modulePath)) {
    console.log(`  ⚠️  ${moduleName} 不存在`);
    return;
  }
  
  let content = fs.readFileSync(modulePath, 'utf8');
  
  // 修復錯誤的 key={$1} 語法
  content = content.replace(
    /<tr key={\$1}/g,
    '<tr key={group.groupCode}'
  );
  
  // 移除錯誤的 style 和事件處理
  content = content.replace(
    /<tr key={[^}]+} className="hover:bg-primary-light" style={{ transition: "all 0\.3s ease" }} onMouseEnter[^>]+onMouseLeave[^>]+>/g,
    (match) => {
      // 提取原始的 key
      const keyMatch = match.match(/key={([^}]+)}/);
      const key = keyMatch ? keyMatch[1] : 'item.id';
      return `<tr key={${key}} className="hover:bg-gray-50">`;
    }
  );
  
  // 修復未閉合的 div
  const openDivCount = (content.match(/<div/g) || []).length;
  const closeDivCount = (content.match(/<\/div>/g) || []).length;
  
  if (openDivCount > closeDivCount) {
    // 在檔案結尾補充缺少的 </div>
    const missingDivs = openDivCount - closeDivCount;
    for (let i = 0; i < missingDivs; i++) {
      content = content.replace('</ModuleLayout>', '</div>\n</ModuleLayout>');
    }
  }
  
  fs.writeFileSync(modulePath, content);
  console.log(`  ✅ 完成`);
}

// 修復所有模組
ERP_MODULES.forEach(fixModule);

console.log('\n✅ 所有語法錯誤已修復！');
