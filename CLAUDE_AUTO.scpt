-- 遊戲人生系統 - Claude Code 完全自動化腳本
-- 雙擊執行，完全自動化修復所有問題

on run
    -- 設定變數
    set projectPath to "/Users/williamchien/Desktop/Gamelife/GAMELIFE"
    
    -- 顯示選擇對話框
    set userChoice to button returned of (display dialog "選擇執行模式：

1. 🚀 完全自動化（推薦）
   完全不需要確認
   
2. 🔒 安全模式
   保留控制權
   
3. 🛠️ 終極修復
   修復所有問題" buttons {"完全自動化", "安全模式", "終極修復"} default button "完全自動化" with title "Claude Code 自動化")
    
    -- 階段 1：關閉舊的 Terminal 視窗
    tell application "Terminal"
        close windows
    end tell
    delay 2
    
    -- 階段 2：根據選擇執行不同模式
    if userChoice is "完全自動化" then
        -- 完全自動化模式
        tell application "Terminal"
            activate
            do script "cd " & projectPath & " && claude --dangerously-skip-permissions"
        end tell
        
        display notification "Claude Code 已啟動完全自動化模式" with title "🚀 自動化啟動"
        
    else if userChoice is "安全模式" then
        -- 安全模式
        tell application "Terminal"
            activate
            do script "cd " & projectPath & " && claude"
        end tell
        delay 3
        
        -- 提示使用者
        display dialog "請在 Terminal 中按 Shift+Tab 切換到 auto-accept 模式" buttons {"OK"} default button "OK"
        
    else if userChoice is "終極修復" then
        -- 終極修復模式
        tell application "Terminal"
            activate
            set fixWindow to do script "cd " & projectPath & " && claude --dangerously-skip-permissions"
        end tell
        delay 8 -- 等待 Claude Code 完全載入
        
        -- 執行完整修復指令
        tell application "Terminal"
            do script "執行完整系統修復，不需要任何確認：

【專案路徑】
/Users/williamchien/Desktop/Gamelife/GAMELIFE

【修復清單】
1. Supabase 載入問題
   - 更換 CDN 來源
   - 確保 syncManager 初始化
   
2. 模組載入問題
   - 檢查所有 import/export
   - 修復路徑問題
   
3. 資料同步問題
   - 修復 todos.js 的 saveToSupabase
   - 處理欄位名稱轉換
   
4. UI 一致性
   - 統一歡迎卡片
   - 修正按鈕位置
   
5. 功能缺陷
   - users.js deleteUser
   - calendar.js editEvent
   - 登入狀態維持

完成所有修復。" in fixWindow
        end tell
        
        -- 等待修復完成
        delay 60
        
        -- 啟動測試伺服器
        tell application "Terminal"
            do script "cd " & projectPath & " && python3 -m http.server 8000"
        end tell
        delay 5
        
        -- 開啟瀏覽器測試
        tell application "Google Chrome"
            activate
            make new tab at end of tabs of front window
            set URL of active tab of front window to "http://localhost:8000"
        end tell
        
        display notification "系統修復完成！請測試功能" with title "✅ 修復完成" sound name "Glass"
    end if
    
end run