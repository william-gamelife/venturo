#!/bin/bash

# 🚀 一鍵啟動 Claude 開發環境
# 最簡單的自動化腳本

PROJECT_PATH="/Users/williamchien/Desktop/Gamelife/GAMELIFE"

echo "🤖 正在啟動 Claude 自動化開發環境..."
echo "📂 專案: $PROJECT_PATH"
echo ""

# 使用 AppleScript 控制終端機
osascript <<'SCRIPT'
-- 設定變數
set projectPath to "/Users/williamchien/Desktop/Gamelife/GAMELIFE"
set checkCommand to "請全面檢測這個專案的錯誤：/Users/williamchien/Desktop/Gamelife/GAMELIFE，包括 HTML、JavaScript、CSS、模組載入、API 連接等所有問題，並提供修復建議"

tell application "Terminal"
    -- 啟動終端機
    activate
    
    -- 創建新視窗
    set newTab to do script ""
    
    -- 切換到專案目錄
    do script "cd " & projectPath in newTab
    delay 1
    
    -- 清空畫面
    do script "clear" in newTab
    delay 0.5
    
    -- 顯示標題
    do script "echo '🤖 Claude 開發助手已啟動'" in newTab
    do script "echo '📂 專案目錄: " & projectPath & "'" in newTab
    do script "echo '──────────────────────────────────────────────'" in newTab
    delay 1
    
    -- 啟動 Claude（嘗試使用 claude 命令）
    do script "claude" in newTab
    
    -- 等待 3 秒讓 Claude 載入
    delay 3
    
    -- 輸入錯誤檢測命令
    tell application "System Events"
        -- 輸入檢測指令
        keystroke checkCommand
        
        -- 按 Enter 發送
        key code 36
    end tell
    
    -- 保持終端機在前台
    activate
end tell

-- 顯示完成提示
delay 2
display notification "Claude 已啟動並開始檢測專案" with title "🤖 自動化完成" subtitle "遊戲人生專案"
SCRIPT

echo "✅ 腳本執行完成！"
echo ""
echo "📝 已執行："
echo "   1. ✓ 開啟終端機"
echo "   2. ✓ 切換到專案目錄" 
echo "   3. ✓ 啟動 Claude"
echo "   4. ✓ 等待 3 秒"
echo "   5. ✓ 輸入錯誤檢測指令"
echo ""
echo "⚠️  注意：如果 Claude CLI 未安裝，請到 https://claude.ai 使用網頁版"