#!/bin/bash
# 直接控制 Mac 終端機

osascript <<'EOF'
tell application "Terminal"
    activate
    
    -- 創建新視窗
    set mainWindow to do script "echo '🤖 Claude AI 系統控制'"
    delay 1
    
    -- 切換目錄
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in mainWindow
    delay 1
    
    -- 顯示當前位置
    do script "pwd" in mainWindow
    delay 1
    
    -- 列出檔案
    do script "echo '📁 專案檔案：'" in mainWindow
    do script "ls -la | head -20" in mainWindow
    delay 2
    
    -- 啟動 Claude Code
    do script "echo ''" in mainWindow
    do script "echo '🚀 啟動 Claude Code...'" in mainWindow
    do script "claude" in mainWindow
end tell

display notification "終端機已啟動，Claude Code 準備就緒" with title "系統控制"
EOF
