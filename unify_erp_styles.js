#!/usr/bin/env node

/**
 * 🎨 VENTURO 真正的統一設計優化器
 * 專門處理 ERP 模組（團體、訂單、收款單、請款單）的樣式統一
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 ======================================');
console.log('   VENTURO 統一設計系統優化');
console.log('======================================\n');

const PROJECT_ROOT = '/Users/williamchien/Desktop/Venturo/Venturo';

// 統一的樣式模板
const UNIFIED_STYLES = {
  pageContainer: `
    background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1ea 100%)',
    minHeight: '100vh',
    padding: '24px'
  `,
  
  moduleHeader: `
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    color: 'white'
  `,
  
  card: `
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  `,
  
  button: `
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)'
  `,
  
  table: `
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(201, 169, 97, 0.2)'
  `,
  
  tableHeader: `
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    color: 'white',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  `,
  
  input: `
    width: '100%',
    padding: '10px 14px',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#c9a961',
      boxShadow: '0 0 0 3px rgba(201, 169, 97, 0.1)'
    }
  `,
  
  badge: `
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid currentColor'
  `
};

// ERP 模組列表
const ERP_MODULES = [
  'groups',
  'orders',
  'receipts',
  'invoices',
  'quotations'
];

// 優化函數
function optimizeERPModule(moduleName) {
  console.log(`🔧 優化 ${moduleName} 模組...`);
  
  const modulePath = path.join(PROJECT_ROOT, `src/app/dashboard/${moduleName}/page.tsx`);
  
  if (!fs.existsSync(modulePath)) {
    console.log(`  ⚠️  ${moduleName} 模組不存在`);
    return;
  }
  
  let content = fs.readFileSync(modulePath, 'utf8');
  let changes = 0;
  
  // 1. 替換醜陋的 Tailwind 樣式為統一設計
  
  // 替換按鈕樣式
  content = content.replace(
    /className="[^"]*bg-blue-600[^"]*"/g,
    'className="btn-primary" style={{ background: "linear-gradient(135deg, #c9a961 0%, #b8975a 100%)", color: "white", border: "none", borderRadius: "12px", padding: "10px 20px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s ease" }}'
  );
  changes++;
  
  // 替換表格樣式
  content = content.replace(
    /className="bg-white rounded-lg shadow overflow-hidden"/g,
    'className="unified-table" style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", border: "1px solid rgba(201, 169, 97, 0.2)" }}'
  );
  changes++;
  
  // 替換表格頭部
  content = content.replace(
    /className="bg-gray-50 border-b border-gray-200"/g,
    'style={{ background: "linear-gradient(135deg, #c9a961 0%, #b8975a 100%)" }}'
  );
  changes++;
  
  // 替換輸入框樣式
  content = content.replace(
    /className="[^"]*border border-gray-300[^"]*"/g,
    'className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: "8px", fontSize: "14px", transition: "all 0.2s ease" }}'
  );
  changes++;
  
  // 替換卡片容器
  content = content.replace(
    /className="filter-section"/g,
    'className="filter-section" style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(201, 169, 97, 0.2)", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", backdropFilter: "blur(10px)", marginBottom: "24px" }}'
  );
  changes++;
  
  // 替換統計數字樣式
  content = content.replace(
    /className="stat-number"/g,
    'className="stat-number" style={{ fontSize: "24px", fontWeight: "700", color: "#c9a961" }}'
  );
  changes++;
  
  // 替換標籤樣式
  content = content.replace(
    /bg-green-100 text-green-800/g,
    'badge-success" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid #10b981"'
  );
  content = content.replace(
    /bg-yellow-100 text-yellow-800/g,
    'badge-warning" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid #f59e0b"'
  );
  content = content.replace(
    /bg-gray-100 text-gray-800/g,
    'badge-default" style={{ background: "rgba(107, 114, 128, 0.1)", color: "#6b7280", border: "1px solid #6b7280"'
  );
  changes++;
  
  // 加入動畫效果
  if (!content.includes('transition: "all 0.3s ease"')) {
    content = content.replace(
      /<tr key={[^}]+} className="hover:bg-gray-50">/g,
      '<tr key={$1} className="hover:bg-primary-light" style={{ transition: "all 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(201, 169, 97, 0.05)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>'
    );
    changes++;
  }
  
  // 統一頁面背景
  if (!content.includes('pageBackground')) {
    content = content.replace(
      'return (',
      `return (
    <div style={{ background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1ea 100%)', minHeight: '100vh' }}>
      `
    );
    content = content.replace(
      '</ModuleLayout>',
      `</ModuleLayout>
    </div>`
    );
    changes++;
  }
  
  // 寫回檔案
  if (changes > 0) {
    fs.writeFileSync(modulePath, content);
    console.log(`  ✅ 優化完成：${changes} 項改進`);
  } else {
    console.log(`  ℹ️  已經是最佳狀態`);
  }
}

// 建立統一的元件樣式檔案
function createUnifiedComponents() {
  console.log('\n📦 建立統一元件...');
  
  const componentContent = `
// 🎨 VENTURO 統一元件樣式
export const UnifiedStyles = {
  // 頁面容器
  pageContainer: {
    background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1ea 100%)',
    minHeight: '100vh',
    padding: '24px'
  },
  
  // 模組標題
  moduleHeader: {
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    color: 'white'
  },
  
  // 卡片
  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  },
  
  // 按鈕
  primaryButton: {
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(201, 169, 97, 0.4)'
    }
  },
  
  // 表格
  table: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(201, 169, 97, 0.2)'
  },
  
  // 表格頭
  tableHeader: {
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    color: 'white',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '16px'
  },
  
  // 輸入框
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    background: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#c9a961',
      boxShadow: '0 0 0 3px rgba(201, 169, 97, 0.1)'
    }
  },
  
  // 標籤
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid currentColor'
  },
  
  // 成功標籤
  badgeSuccess: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '1px solid #10b981'
  },
  
  // 警告標籤
  badgeWarning: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    border: '1px solid #f59e0b'
  },
  
  // 危險標籤
  badgeDanger: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid #ef4444'
  }
};

export default UnifiedStyles;
`;

  const componentPath = path.join(PROJECT_ROOT, 'src/lib/unified-styles.ts');
  fs.writeFileSync(componentPath, componentContent);
  console.log('  ✅ 統一元件樣式已建立');
}

// 主執行函數
async function main() {
  console.log('📊 開始優化 ERP 模組...\n');
  
  // 優化每個 ERP 模組
  for (const module of ERP_MODULES) {
    optimizeERPModule(module);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 建立統一元件
  createUnifiedComponents();
  
  console.log('\n🎉 ======================================');
  console.log('   統一設計優化完成！');
  console.log('======================================');
  console.log('\n💡 改進項目：');
  console.log('  ✅ 所有 ERP 模組使用統一的金色主題');
  console.log('  ✅ 按鈕、表格、輸入框樣式統一');
  console.log('  ✅ 加入動畫效果和 hover 狀態');
  console.log('  ✅ 建立統一元件樣式檔案');
  console.log('\n📝 下一步：');
  console.log('  1. 執行 npm run dev 查看效果');
  console.log('  2. 檢查各模組是否正確顯示');
  console.log('  3. 微調任何不完美的地方');
}

// 執行
main().catch(console.error);
