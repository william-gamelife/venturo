#!/bin/bash

# 🧪 遊戲人生系統 - 完整測試腳本
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           🧪 遊戲人生系統測試                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_PATH="/Users/williamchien/Desktop/Gamelife/GAMELIFE"
cd "$PROJECT_PATH"

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 測試結果
PASS=0
FAIL=0

echo "📂 專案路徑: $PROJECT_PATH"
echo ""

# 1. 檢查關鍵檔案
echo "🔍 檢查關鍵檔案..."
echo "─────────────────────────────"

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1 缺失"
        ((FAIL++))
    fi
}

check_file "index.html"
check_file "dashboard.html"
check_file "config.js"
check_file "modules/auth.js"
check_file "modules/sync.js"
check_file "modules/permissions.js"
check_file "modules/todos.js"
check_file "modules/calendar.js"

echo ""

# 2. 檢查伺服器狀態
echo "🌐 檢查伺服器狀態..."
echo "─────────────────────────────"

if curl -s http://localhost:8000 > /dev/null; then
    echo -e "${GREEN}✓${NC} 伺服器運行中 (http://localhost:8000)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} 伺服器未運行，正在啟動..."
    python3 -m http.server 8000 > /dev/null 2>&1 &
    sleep 3
    if curl -s http://localhost:8000 > /dev/null; then
        echo -e "${GREEN}✓${NC} 伺服器已啟動"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} 伺服器啟動失敗"
        ((FAIL++))
    fi
fi

echo ""

# 3. 檢查權限系統
echo "🔐 檢查權限系統..."
echo "─────────────────────────────"

if [ -f "modules/permissions.js" ]; then
    # 檢查權限定義
    if grep -q "super_admin" modules/permissions.js; then
        echo -e "${GREEN}✓${NC} super_admin 角色已定義"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} super_admin 角色未定義"
        ((FAIL++))
    fi
    
    if grep -q "william.*super_admin" modules/permissions.js; then
        echo -e "${GREEN}✓${NC} William 設定為 super_admin"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} William 未設定為 super_admin"
        ((FAIL++))
    fi
    
    if grep -q "canManageUsers" modules/permissions.js; then
        echo -e "${GREEN}✓${NC} 使用者管理權限已實作"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} 使用者管理權限未實作"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗${NC} 權限系統模組不存在"
    ((FAIL++))
fi

echo ""

# 4. 檢查認證系統
echo "🔑 檢查認證系統..."
echo "─────────────────────────────"

# 檢查 index.html 是否使用 auth 模組
if grep -q "window.getSupabaseClient" index.html; then
    echo -e "${GREEN}✓${NC} index.html 使用統一的 Supabase 客戶端"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} index.html 可能未使用統一客戶端"
fi

# 檢查 config.js
if grep -q "window.getSupabaseClient" config.js; then
    echo -e "${GREEN}✓${NC} 全域 Supabase 客戶端已定義"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 全域 Supabase 客戶端未定義"
    ((FAIL++))
fi

echo ""

# 5. 生成測試報告
echo "📊 測試報告"
echo "═══════════════════════════════════════════"
echo -e "通過測試: ${GREEN}$PASS${NC}"
echo -e "失敗測試: ${RED}$FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 系統狀態良好！${NC}"
    echo ""
    echo "🎯 建議測試步驟："
    echo "1. 訪問 http://localhost:8000"
    echo "2. 使用 William 登入（應該能看到使用者管理）"
    echo "3. 登出後使用 Carson 登入（不應該看到使用者管理）"
    echo "4. 測試待辦事項的新增和同步"
else
    echo ""
    echo -e "${YELLOW}⚠️  發現 $FAIL 個問題需要修復${NC}"
    echo ""
    echo "🔧 建議修復方案："
    echo "1. 執行 ./ULTIMATE_FIX.sh"
    echo "2. 或使用 Claude Code 修復"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "測試完成時間: $(date '+%Y-%m-%d %H:%M:%S')"
echo "日誌保存至: $PROJECT_PATH/test_report.log"

# 保存報告
{
    echo "遊戲人生系統測試報告"
    echo "測試時間: $(date)"
    echo "通過: $PASS"
    echo "失敗: $FAIL"
} > test_report.log