#!/usr/bin/env osascript

-- 直接執行的 AppleScript
tell application "Terminal"
    activate
    
    -- 創建新視窗
    set newWindow to do script ""
    delay 1
    
    -- 切換到專案目錄
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in newWindow
    delay 1
    
    -- 清空畫面並顯示資訊
    do script "clear" in newWindow
    delay 0.5
    
    do script "echo '🤖 Claude 自動化開發環境'" in newWindow
    do script "echo '📂 專案: /Users/williamchien/Desktop/Gamelife/GAMELIFE'" in newWindow
    do script "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'" in newWindow
    delay 1
    
    -- 啟動 Claude
    do script "claude" in newWindow
    delay 3
    
    -- 模擬鍵盤輸入檢測命令
    tell application "System Events"
        keystroke "請全面檢測 /Users/williamchien/Desktop/Gamelife/GAMELIFE 專案的所有錯誤"
        keystroke return
    end tell
end tell