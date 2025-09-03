#!/bin/bash

# 🚀 立即執行全自動化修復
echo "╔══════════════════════════════════════════════════════════╗"
echo "║      🤖 遊戲人生 - 全自動化修復系統啟動                   ║"
echo "╚══════════════════════════════════════════════════════════╝"

cd /Users/williamchien/Desktop/Gamelife/GAMELIFE

# 方案1: 如果有 Claude Code
if command -v claude &> /dev/null; then
    echo "✅ 使用 Claude Code 完全自動化模式"
    
    # 執行完整修復
    claude --dangerously-skip-permissions << 'AUTOFIX'
執行完整的宏觀架構修復，不需要任何確認：

【宏觀分析】
分析 /Users/williamchien/Desktop/Gamelife/GAMELIFE 的整體架構問題

【發現的系統性問題】
1. 認證系統分裂 - index.html 沒有使用統一的 auth.js
2. Supabase 客戶端重複初始化
3. 模組載入系統硬編碼
4. 資料同步欄位命名不一致
5. 缺少完整錯誤處理

【第一輪修復：核心架構】
✅ 重構 index.html：
   - 移除直接的 Supabase 操作
   - 改用 import { AuthManagerV2 } from './modules/auth.js'
   - 使用 authManager.validateLogin() 處理登入

✅ 統一 Supabase 客戶端：
   - 所有地方使用 window.getSupabaseClient()
   - 移除重複的 createClient 呼叫

✅ 建立模組註冊系統：
   - 創建 modules/registry.js
   - 動態載入和註冊模組

【第二輪修復：資料同步】
✅ 統一欄位命名轉換：
   - 在 sync.js 添加 toDatabase() 方法（駝峰轉底線）
   - 在 sync.js 添加 fromDatabase() 方法（底線轉駝峰）
   - 所有模組使用這些轉換方法

✅ 修復 todos.js：
   - 使用 syncManager.save() 而非直接操作
   - 處理欄位轉換

【第三輪修復：使用者體驗】
✅ 添加載入狀態到所有模組
✅ 實作統一的錯誤提示系統
✅ 優化所有非同步操作的回饋

【測試每輪修復】
- 測試登入流程
- 測試每個模組載入
- 測試資料儲存和讀取
- 確認沒有 Console 錯誤

持續修復直到系統完全正常。
AUTOFIX

else
    echo "⚠️  Claude Code 未安裝"
    echo "正在使用備用方案..."
    
    # 方案2: 手動修復關鍵問題
    echo "執行基礎修復..."
    
    # 修復 index.html
    cat > /tmp/fix_index.js << 'EOF'
const fs = require('fs');
const path = '/Users/williamchien/Desktop/Gamelife/GAMELIFE/index.html';
let content = fs.readFileSync(path, 'utf8');

// 移除直接的 Supabase 初始化
content = content.replace(
    'const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;',
    'const sb = window.getSupabaseClient ? window.getSupabaseClient() : null;'
);

fs.writeFileSync(path, content);
console.log('✅ 修復 index.html 完成');
EOF
    
    if command -v node &> /dev/null; then
        node /tmp/fix_index.js
    fi
fi

# 啟動測試伺服器
echo ""
echo "🌐 啟動測試伺服器..."
pkill -f "python3 -m http.server"
cd /Users/williamchien/Desktop/Gamelife/GAMELIFE
python3 -m http.server 8000 &

sleep 3

# 開啟瀏覽器
echo "🌐 開啟瀏覽器測試..."
open http://localhost:8000

echo ""
echo "✅ 自動化修復已啟動"
echo "📝 請查看終端機的 Claude Code 輸出"
echo "🌐 測試網址: http://localhost:8000"