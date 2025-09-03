#!/usr/bin/env osascript

-- 直接控制終端機執行全自動化修復
tell application "Terminal"
    -- 關閉現有視窗
    close windows
    delay 1
    
    -- 啟動終端機
    activate
    
    -- 創建新視窗並執行命令
    set mainWindow to do script "echo '🤖 正在啟動遊戲人生自動化修復系統...'"
    delay 1
    
    -- 設定路徑
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in mainWindow
    delay 1
    
    -- 顯示當前路徑
    do script "pwd" in mainWindow
    delay 1
    
    -- 清空畫面並顯示標題
    do script "clear" in mainWindow
    delay 0.5
    
    do script "echo '╔══════════════════════════════════════════════════════════╗'" in mainWindow
    do script "echo '║     🤖 遊戲人生 - 全自動化修復系統                       ║'" in mainWindow
    do script "echo '╚══════════════════════════════════════════════════════════╝'" in mainWindow
    do script "echo ''" in mainWindow
    do script "echo '📂 專案路徑: /Users/williamchien/Desktop/Gamelife/GAMELIFE'" in mainWindow
    do script "echo ''" in mainWindow
    delay 2
    
    -- 檢查 Claude Code 是否安裝
    do script "echo '🔍 檢查 Claude Code 安裝狀態...'" in mainWindow
    do script "which claude" in mainWindow
    delay 2
    
    -- 啟動 Claude Code（完全自動化模式）
    do script "echo ''" in mainWindow
    do script "echo '🚀 啟動 Claude Code 完全自動化模式...'" in mainWindow
    do script "echo '⚠️  使用 --dangerously-skip-permissions 參數'" in mainWindow
    do script "echo ''" in mainWindow
    delay 1
    
    -- 執行 Claude Code
    do script "claude --dangerously-skip-permissions" in mainWindow
    
    -- 等待 Claude Code 完全載入（重要！）
    delay 10
    
    -- 現在開始輸入修復命令
    do script "echo '📝 輸入修復指令...'" in mainWindow
    delay 2
end tell

-- 等待一下讓終端機穩定
delay 3

-- 使用 System Events 輸入完整的修復指令
tell application "System Events"
    tell process "Terminal"
        -- 確保 Terminal 在前面
        set frontmost to true
        delay 1
        
        -- 輸入完整的修復指令
        keystroke "執行完整的宏觀架構修復，專案路徑：/Users/williamchien/Desktop/Gamelife/GAMELIFE"
        key code 36 -- Enter
        delay 1
        
        keystroke "【優先修復：使用者權限系統】"
        key code 36
        delay 0.5
        
        keystroke "1. 創建 modules/permissions.js"
        key code 36
        keystroke "   - William (super_admin) 是唯一能看到使用者管理的人"
        key code 36
        keystroke "   - Carson (admin) 看不到使用者管理模組"
        key code 36
        keystroke "   - 其他人根據角色限制模組可見性"
        key code 36
        delay 0.5
        
        keystroke "2. 修改 dashboard.html"
        key code 36
        keystroke "   - import PermissionManager"
        key code 36
        keystroke "   - 在 init() 中初始化權限"
        key code 36
        keystroke "   - 根據權限隱藏/顯示導航項目"
        key code 36
        delay 0.5
        
        keystroke "【核心架構修復】"
        key code 36
        
        keystroke "3. 統一認證系統"
        key code 36
        keystroke "   - index.html 改用 auth.js 模組"
        key code 36
        keystroke "   - 移除重複的 Supabase 初始化"
        key code 36
        delay 0.5
        
        keystroke "4. 修復資料同步"
        key code 36
        keystroke "   - sync.js 添加欄位轉換方法"
        key code 36
        keystroke "   - todos.js 使用 syncManager"
        key code 36
        delay 0.5
        
        keystroke "5. 優化使用者體驗"
        key code 36
        keystroke "   - 添加載入狀態"
        key code 36
        keystroke "   - 統一錯誤處理"
        key code 36
        delay 0.5
        
        keystroke "直接修改所有檔案，不需要確認。完成後啟動測試伺服器。"
        key code 36
    end tell
end tell

-- 等待修復執行
delay 60

-- 啟動測試伺服器
tell application "Terminal"
    set mainWindow to front window
    
    do script "echo ''" in mainWindow
    do script "echo '🌐 啟動測試伺服器...'" in mainWindow
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in mainWindow
    do script "python3 -m http.server 8000" in mainWindow
end tell

-- 等待伺服器啟動
delay 5

-- 開啟瀏覽器測試
tell application "Google Chrome"
    activate
    open location "http://localhost:8000"
end tell

-- 顯示完成通知
display notification "自動化修復已啟動，請查看終端機和瀏覽器" with title "🤖 遊戲人生系統" sound name "Glass"