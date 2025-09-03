#!/usr/bin/env osascript

-- 簡單直接：開終端機，執行 Claude Code，等回報
tell application "Terminal"
    -- 關閉舊視窗
    close windows
    delay 1
    
    -- 開啟終端機
    activate
    
    -- 創建新視窗
    set cmdWindow to do script ""
    delay 1
    
    -- 切換到專案目錄
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in cmdWindow
    delay 1
    
    -- 執行 Claude Code
    do script "claude" in cmdWindow
    delay 5
    
    -- 讓 Claude Code 檢測問題
    do script "檢查這個專案的所有錯誤並回報" in cmdWindow
end tell