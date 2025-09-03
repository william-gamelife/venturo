#!/bin/bash

# 🚀 遊戲人生 - 一鍵終極修復腳本
# 基於文檔的最強自動化設定

PROJECT_PATH="/Users/williamchien/Desktop/Gamelife/GAMELIFE"

echo "
╔══════════════════════════════════════════════════════════════╗
║                 🚀 終極自動化修復系統                         ║
║                    遊戲人生管理系統                           ║
╚══════════════════════════════════════════════════════════════╝
"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 步驟 1: 環境檢查
echo -e "${BLUE}[1/6]${NC} 檢查環境..."

# 檢查 Claude Code
if ! command -v claude &> /dev/null; then
    echo -e "${YELLOW}⚠️  Claude Code 未安裝${NC}"
    echo "正在嘗試安裝..."
    npm install -g @anthropic/claude-code 2>/dev/null || {
        echo -e "${RED}❌ 無法自動安裝，請手動執行：${NC}"
        echo "npm install -g @anthropic/claude-code"
        exit 1
    }
fi

# 檢查 Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 未安裝${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 環境檢查完成${NC}"

# 步驟 2: 停止所有相關進程
echo -e "${BLUE}[2/6]${NC} 清理環境..."
pkill -f "python3 -m http.server" 2>/dev/null
pkill -f "claude" 2>/dev/null
sleep 2
echo -e "${GREEN}✅ 環境清理完成${NC}"

# 步驟 3: 備份專案
echo -e "${BLUE}[3/6]${NC} 備份專案..."
BACKUP_DIR="/Users/williamchien/Desktop/Gamelife_Backup_$(date +%Y%m%d_%H%M%S)"
cp -r "$PROJECT_PATH" "$BACKUP_DIR"
echo -e "${GREEN}✅ 備份完成：$BACKUP_DIR${NC}"

# 步驟 4: 執行終極修復
echo -e "${BLUE}[4/6]${NC} 執行終極修復..."

cd "$PROJECT_PATH"

# 使用最強模式執行修復
claude --dangerously-skip-permissions << 'ULTIMATE_FIX'
執行終極修復，無論遇到什麼問題都要解決：

【第一階段：完整診斷】
掃描 /Users/williamchien/Desktop/Gamelife/GAMELIFE 的所有檔案：
- 找出所有 JavaScript 錯誤
- 檢查所有 import/export 問題
- 驗證所有 API 連接
- 分析所有相依性

【第二階段：核心修復】

1. Supabase 問題
   如果 CDN 載入失敗：
   - 嘗試 unpkg.com
   - 嘗試 jsdelivr.net
   - 嘗試 cdnjs.cloudflare.com
   - 最後下載到本地 /libs/supabase.min.js

2. SyncManager 問題
   確保 sync.js 正確處理：
   - 駝峰式轉底線式（createdAt → created_at）
   - 底線式轉駝峰式（created_at → createdAt）
   - 所有錯誤都有 try-catch

3. 模組載入問題
   檢查每個模組：
   - auth.js
   - todos.js
   - calendar.js
   - finance.js
   - timebox.js
   - projects.js
   - users.js
   - settings.js
   確保都正確 export 和 import

4. UI 一致性
   統一所有模組的：
   - 歡迎卡片高度（100px）
   - 按鈕樣式
   - 色彩主題
   - 響應式斷點

5. 功能修復
   - todos.js: 使用 syncManager.saveToSupabase
   - users.js: 修復 deleteUser 方法
   - calendar.js: 修復跨日事件顯示
   - 登入: 確保 sessionStorage 和 localStorage 同步

【第三階段：優化】
- 壓縮所有 JavaScript
- 優化圖片載入
- 實施延遲載入
- 加入錯誤邊界

【第四階段：驗證】
- 測試登入功能（使用者：William）
- 測試每個模組載入
- 測試資料同步
- 確認無 Console 錯誤

持續執行直到沒有任何錯誤為止。
生成完整報告。
ULTIMATE_FIX

echo -e "${GREEN}✅ 修復執行完成${NC}"

# 等待修復完成
echo -e "${YELLOW}⏳ 等待修復生效（60秒）...${NC}"
for i in {60..1}; do
    echo -ne "\r剩餘 $i 秒..."
    sleep 1
done
echo ""

# 步驟 5: 啟動測試伺服器
echo -e "${BLUE}[5/6]${NC} 啟動測試伺服器..."
cd "$PROJECT_PATH"
python3 -m http.server 8000 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3
echo -e "${GREEN}✅ 伺服器已啟動 (PID: $SERVER_PID)${NC}"

# 步驟 6: 開啟瀏覽器測試
echo -e "${BLUE}[6/6]${NC} 開啟瀏覽器..."
open "http://localhost:8000"
echo -e "${GREEN}✅ 瀏覽器已開啟${NC}"

# 顯示完成訊息
echo "
╔══════════════════════════════════════════════════════════════╗
║                    ✅ 修復完成！                              ║
╠══════════════════════════════════════════════════════════════╣
║  伺服器地址：http://localhost:8000                           ║
║  測試帳號：William (第一個卡片)                              ║
║  備份位置：$BACKUP_DIR                                       ║
║                                                              ║
║  按 Ctrl+C 停止伺服器                                        ║
╚══════════════════════════════════════════════════════════════╝
"

# 播放完成音效
afplay /System/Library/Sounds/Glass.aiff 2>/dev/null

# 保持腳本運行
trap "kill $SERVER_PID 2>/dev/null; echo '伺服器已停止'" EXIT
wait $SERVER_PID