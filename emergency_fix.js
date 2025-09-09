#!/usr/bin/env node

/**
 * 🔧 緊急修復所有 ERP 模組的變數名稱錯誤
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 緊急修復變數錯誤...\n');

const PROJECT_ROOT = '/Users/williamchien/Desktop/Venturo/Venturo';

// 每個模組的正確變數名稱
const MODULE_CONFIGS = {
  'groups': { variable: 'group', key: 'groupCode' },
  'orders': { variable: 'order', key: 'orderNumber' },
  'receipts': { variable: 'receipt', key: 'receiptNumber' },
  'invoices': { variable: 'invoice', key: 'invoiceNumber' },
  'quotations': { variable: 'quotation', key: 'id' }
};

function fixModule(moduleName) {
  console.log(`修復 ${moduleName}...`);
  
  const config = MODULE_CONFIGS[moduleName];
  if (!config) {
    console.log(`  ⚠️  未知模組`);
    return;
  }
  
  const modulePath = path.join(PROJECT_ROOT, `src/app/dashboard/${moduleName}/page.tsx`);
  
  if (!fs.existsSync(modulePath)) {
    console.log(`  ⚠️  檔案不存在`);
    return;
  }
  
  let content = fs.readFileSync(modulePath, 'utf8');
  let fixed = false;
  
  // 修復錯誤的 key 屬性
  // 找到 map 函數來確定正確的變數名稱
  const mapRegex = new RegExp(`\\.map\\(\\(${config.variable}\\)`, 'g');
  if (content.match(mapRegex)) {
    // 修復 tr 標籤中錯誤的 key
    const wrongKeyRegex = /<tr key={group\.groupCode}/g;
    if (content.match(wrongKeyRegex)) {
      content = content.replace(
        wrongKeyRegex,
        `<tr key={${config.variable}.${config.key}}`
      );
      fixed = true;
    }
    
    // 移除多餘的 style 和事件處理器
    const complexTrRegex = /<tr key={[^}]+} className="hover:bg-primary-light" style={[^}]+} onMouseEnter={[^}]+} onMouseLeave={[^}]+}>/g;
    if (content.match(complexTrRegex)) {
      content = content.replace(
        complexTrRegex,
        (match) => {
          // 提取正確的 key
          const keyMatch = match.match(/key={([^}]+)}/);
          if (keyMatch) {
            return `<tr key={${keyMatch[1]}} className="hover:bg-gray-50">`;
          }
          return `<tr key={${config.variable}.${config.key}} className="hover:bg-gray-50">`;
        }
      );
      fixed = true;
    }
    
    // 簡單的 hover 樣式版本
    const simpleTrRegex = new RegExp(`<tr key={${config.variable}\\.${config.key}} className="hover:bg-gray-50">`, 'g');
    if (!content.match(simpleTrRegex)) {
      // 確保使用正確的簡單版本
      const anyTrRegex = /<tr key={[^}]+}[^>]*>/g;
      content = content.replace(anyTrRegex, (match) => {
        if (match.includes(config.variable)) {
          return `<tr key={${config.variable}.${config.key}} className="hover:bg-gray-50">`;
        }
        return match;
      });
      fixed = true;
    }
  }
  
  if (fixed) {
    fs.writeFileSync(modulePath, content);
    console.log(`  ✅ 已修復`);
  } else {
    console.log(`  ℹ️  無需修復`);
  }
}

// 修復所有模組
Object.keys(MODULE_CONFIGS).forEach(fixModule);

console.log('\n✅ 所有變數錯誤已修復！');
console.log('🔄 請重新整理瀏覽器查看效果');
