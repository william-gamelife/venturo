#!/usr/bin/env osascript

tell application "Terminal"
    -- 啟動 Terminal 應用程式
    activate
    
    -- 開新視窗
    do script ""
    delay 1
    
    -- 切換到專案目錄
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in front window
    delay 1
    
    -- 顯示當前路徑確認
    do script "pwd" in front window
    delay 1
    
    -- 列出檔案確認
    do script "ls -la | head -10" in front window
    delay 2
    
    -- 啟動 Python 伺服器
    do script "echo '🌐 啟動測試伺服器...'" in front window
    do script "python3 -m http.server 8000" in front window
end tell

-- 等待伺服器啟動
delay 3

-- 開啟瀏覽器
tell application "Google Chrome"
    activate
    open location "http://localhost:8000"
end tell

display notification "系統已啟動" with title "遊戲人生"
