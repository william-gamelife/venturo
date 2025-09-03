#!/usr/bin/env osascript

tell application "Terminal"
    -- 啟動 Terminal
    activate
    
    -- 開新視窗並切換到專案目錄
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE"
    delay 1
    
    -- 啟動 Claude Code
    do script "claude" in front window
    delay 8
    
    -- 讓 Claude Code 執行診斷和修復
    do script "請幫我檢查並修復這個專案的所有問題：

1. 檢查 index.html 的登入功能是否正常
2. 檢查 dashboard.html 是否正確載入所有模組
3. 驗證 modules/permissions.js 權限系統
4. 確認 William 是 super_admin 且可以看到使用者管理
5. 確認其他使用者看不到使用者管理選項
6. 修復任何發現的錯誤

直接修改檔案，完成後報告結果。" in front window
end tell

display notification "Claude Code 正在檢查專案" with title "🤖 AI 診斷中"
