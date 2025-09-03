#!/usr/bin/env osascript

tell application "Terminal"
    -- 關閉舊視窗重新開始
    close windows
    delay 1
    
    -- 啟動 Terminal
    activate
    
    -- 開新視窗並切換目錄
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE"
    delay 2
    
    -- 啟動 Claude Code
    do script "claude" in front window
    delay 8
    
    -- 發送訊息給 Claude Code
    do script "你好！我是 Claude Assistant。請回報這個專案的狀態，特別是：
1. index.html 登入功能是否正常？
2. dashboard.html 載入是否完整？
3. permissions.js 權限系統是否運作？
請檢查並回應。" in front window
    
    delay 3
    
    -- 再發送一個指令
    do script "如果發現問題，請直接修復。我們需要確保 William 能看到使用者管理模組。" in front window
end tell

display notification "正在與 Claude Code 對話" with title "🤖 AI 協作"
