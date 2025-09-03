#!/usr/bin/env osascript

-- 直接執行：開啟終端機並啟動伺服器
tell application "Terminal"
    activate
    
    -- 創建新視窗啟動伺服器
    set serverWindow to do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE && python3 -m http.server 8000"
    
    delay 3
    
    -- 再開一個視窗執行 Claude Code
    tell application "Terminal"
        do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE"
    end tell
end tell

-- 等伺服器啟動
delay 3

-- 開啟瀏覽器
tell application "Google Chrome"
    activate
    open location "http://localhost:8000"
end tell

display notification "伺服器已啟動" with title "遊戲人生系統"
