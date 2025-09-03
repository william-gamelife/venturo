#!/usr/bin/env osascript

-- 直接控制終端機並與 Claude Code 對話
on run
    tell application "Terminal"
        -- 關閉所有視窗重新開始
        close windows
        delay 1
        
        -- 激活終端機（讓它顯示在最前面）
        activate
        
        -- 創建新視窗
        set aiWindow to do script "echo '🤖 Claude AI 自動控制系統啟動'"
        delay 1
        
        -- 切換到專案目錄
        do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in aiWindow
        delay 1
        
        -- 清空畫面
        do script "clear" in aiWindow
        delay 0.5
        
        -- 啟動 Claude Code
        do script "echo '🚀 啟動 Claude Code...'" in aiWindow
        do script "claude" in aiWindow
        
        -- 等待 Claude Code 完全啟動
        delay 8
        
        -- 發送修復指令
        do script "請執行完整系統診斷和修復：

1. 檢查 index.html 登入功能
2. 檢查 dashboard.html 模組載入
3. 驗證權限系統 (modules/permissions.js)
4. 測試資料同步功能
5. 修復所有發現的問題

直接修改檔案，不需要確認。完成後給我詳細報告。" in aiWindow
    end tell
end run
