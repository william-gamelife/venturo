#!/bin/bash

# 🤖 遊戲人生 - Claude 自動化開發腳本
# 自動開啟終端機、設定路徑、啟動 Claude 並執行檢測

echo "🚀 啟動自動化開發環境..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 設定專案路徑
PROJECT_PATH="/Users/williamchien/Desktop/Gamelife/GAMELIFE"

# 創建 AppleScript 來控制終端機
osascript <<EOF
tell application "Terminal"
    -- 開啟新的終端機視窗
    activate
    
    -- 創建新的標籤頁
    tell application "System Events" to keystroke "t" using command down
    delay 1
    
    -- 在新標籤頁執行命令
    set currentTab to do script "cd '$PROJECT_PATH'" in window 1
    delay 1
    
    -- 顯示當前位置
    do script "echo '📂 已切換到專案目錄:' && pwd" in currentTab
    delay 1
    
    -- 啟動 Claude（假設已安裝 Claude CLI）
    do script "echo '🤖 正在啟動 Claude...'" in currentTab
    delay 1
    
    -- 嘗試啟動 Claude
    do script "claude" in currentTab
    delay 3
    
    -- 輸入檢測指令
    do script "echo '🔍 開始全面檢測錯誤...'" in currentTab
    delay 1
    
    -- 發送檢測錯誤的指令給 Claude
    tell application "System Events"
        keystroke "請全面檢測 /Users/williamchien/Desktop/Gamelife/GAMELIFE 專案中的所有錯誤，包括："
        key code 36 -- Enter
        delay 0.5
        keystroke "1. HTML 語法錯誤"
        key code 36 -- Enter
        delay 0.5
        keystroke "2. JavaScript 錯誤和警告"
        key code 36 -- Enter
        delay 0.5
        keystroke "3. CSS 問題"
        key code 36 -- Enter
        delay 0.5
        keystroke "4. 模組載入問題"
        key code 36 -- Enter
        delay 0.5
        keystroke "5. API 連接問題"
        key code 36 -- Enter
        delay 0.5
        keystroke "6. 檔案路徑錯誤"
        key code 36 -- Enter
        delay 0.5
        keystroke "請提供詳細的錯誤報告和修復建議。"
        key code 36 -- Enter
    end tell
    
    -- 將終端機視窗置於前台
    activate
end tell
EOF

echo ""
echo "✅ 自動化腳本執行完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 已執行的操作："
echo "   1. ✓ 開啟終端機"
echo "   2. ✓ 切換到專案目錄"
echo "   3. ✓ 啟動 Claude"
echo "   4. ✓ 等待 3 秒"
echo "   5. ✓ 輸入全面錯誤檢測指令"
echo ""
echo "💡 提示：如果 Claude 未安裝，請先安裝 Claude CLI"
echo "   安裝方法：訪問 https://claude.ai/cli"
