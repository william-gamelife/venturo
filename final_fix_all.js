#!/usr/bin/env node

/**
 * 🛠️ 最終修復 - 移除所有錯誤的 div 包裹
 */

const fs = require('fs');
const path = require('path');

console.log('🛠️ 最終修復所有模組...\n');

const PROJECT_ROOT = '/Users/williamchien/Desktop/Venturo/Venturo';
const MODULES = ['groups', 'orders', 'receipts', 'invoices', 'quotations'];

function finalFix(moduleName) {
  console.log(`修復 ${moduleName}...`);
  
  const modulePath = path.join(PROJECT_ROOT, `src/app/dashboard/${moduleName}/page.tsx`);
  
  if (!fs.existsSync(modulePath)) {
    console.log(`  ⚠️  檔案不存在`);
    return;
  }
  
  let content = fs.readFileSync(modulePath, 'utf8');
  let fixed = false;
  
  // 移除錯誤的背景 div 包裹
  // Pattern 1: div with style before ModuleLayout
  if (content.includes('<div style={{ background: \'linear-gradient')) {
    content = content.replace(
      /return \(\s*<div style={{ background: 'linear-gradient[^}]+}}>\s*\n\s*<ModuleLayout>/g,
      'return (\n    <ModuleLayout>'
    );
    fixed = true;
  }
  
  // Pattern 2: div with style before another div
  content = content.replace(
    /return \(\s*<div style={{ background: 'linear-gradient[^}]+}}>\s*\n\s*<div/g,
    'return (\n    <div'
  );
  
  // Pattern 3: 移除結尾多餘的 </div>
  content = content.replace(
    /<\/ModuleLayout>\s*<\/div>\s*\);\s*}/g,
    '</ModuleLayout>\n  );\n}'
  );
  
  // Pattern 4: 修復可能的雙 div 問題
  content = content.replace(
    /<div style={{ background: 'linear-gradient[^}]+}}>\s*\n/g,
    ''
  );
  
  // 確保沒有孤立的 </div>
  const openDivCount = (content.match(/<div/g) || []).length;
  const closeDivCount = (content.match(/<\/div>/g) || []).length;
  
  if (closeDivCount > openDivCount) {
    // 移除多餘的 </div>
    const diff = closeDivCount - openDivCount;
    for (let i = 0; i < diff; i++) {
      // 從結尾開始移除多餘的 </div>
      content = content.replace(/\s*<\/div>\s*\);\s*}$/, '\n  );\n}');
      if (content.includes('</ModuleLayout>\n    </div>')) {
        content = content.replace('</ModuleLayout>\n    </div>', '</ModuleLayout>');
      }
    }
    fixed = true;
  }
  
  if (fixed) {
    fs.writeFileSync(modulePath, content);
    console.log(`  ✅ 已修復`);
  } else {
    console.log(`  ℹ️  無需修復`);
  }
}

// 修復所有模組
MODULES.forEach(finalFix);

console.log('\n✅ 最終修復完成！');
console.log('🎯 請重新整理瀏覽器');
