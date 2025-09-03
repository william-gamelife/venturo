#!/usr/bin/env osascript

-- 全自動化修復 + 使用者權限系統
on run
    display dialog "準備執行全自動化修復系統" & return & return & "這將會：" & return & "1. 開啟終端機" & return & "2. 設定專案路徑" & return & "3. 執行 Claude Code 修復" & return & "4. 實作使用者權限系統" buttons {"開始", "取消"} default button "開始" with title "🤖 遊戲人生自動化系統"
    
    if button returned of result is "開始" then
        
        -- 步驟1: 關閉並重新開啟終端機
        tell application "Terminal"
            close windows
            delay 1
            activate
        end tell
        
        delay 2
        
        -- 步驟2: 開啟新終端機並設定路徑
        tell application "Terminal"
            -- 創建新視窗
            set repairWindow to do script ""
            delay 1
            
            -- 清空畫面
            do script "clear" in repairWindow
            delay 0.5
            
            -- 顯示標題
            do script "echo '╔══════════════════════════════════════════════════════════╗'" in repairWindow
            do script "echo '║     🤖 遊戲人生 - 全自動化修復系統 v3.0                  ║'" in repairWindow
            do script "echo '╚══════════════════════════════════════════════════════════╝'" in repairWindow
            do script "echo ''" in repairWindow
            delay 1
            
            -- 步驟3: 切換到專案目錄
            do script "echo '📂 步驟 1/5: 設定專案路徑...'" in repairWindow
            do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in repairWindow
            delay 1
            do script "pwd" in repairWindow
            delay 1
            
            -- 步驟4: 檢查 Claude Code
            do script "echo ''" in repairWindow
            do script "echo '🔍 步驟 2/5: 檢查 Claude Code...'" in repairWindow
            do script "which claude" in repairWindow
            delay 2
            
            -- 步驟5: 啟動 Claude Code（最強模式）
            do script "echo ''" in repairWindow
            do script "echo '🚀 步驟 3/5: 啟動 Claude Code 完全自動化模式...'" in repairWindow
            do script "claude --dangerously-skip-permissions" in repairWindow
            
            -- 等待 Claude 完全載入（關鍵！）
            delay 10
            
            -- 步驟6: 輸入修復指令
            do script "echo ''" in repairWindow
            do script "echo '📝 步驟 4/5: 執行智能修復...'" in repairWindow
            delay 2
            
            -- 發送完整修復指令給 Claude
            tell application "System Events"
                -- 輸入完整的修復指令
                keystroke "執行完整的宏觀架構修復和使用者權限系統實作："
                keystroke return
                delay 0.5
                
                keystroke "【第一部分：使用者權限系統】"
                keystroke return
                
                keystroke "1. 創建 modules/permissions.js 權限管理模組"
                keystroke return
                keystroke "   - 定義角色: super_admin, admin, manager, user"
                keystroke return
                keystroke "   - William 是 super_admin（可以管理使用者）"
                keystroke return
                keystroke "   - 其他 admin 不能看到使用者管理"
                keystroke return
                keystroke "   - 根據角色動態顯示/隱藏模組"
                keystroke return
                delay 0.5
                
                keystroke "2. 修改 dashboard.html 實作權限控制"
                keystroke return
                keystroke "   - 載入時檢查使用者角色"
                keystroke return
                keystroke "   - 動態顯示導航選單"
                keystroke return
                keystroke "   - 隱藏無權限的模組"
                keystroke return
                delay 0.5
                
                keystroke "【第二部分：核心架構修復】"
                keystroke return
                
                keystroke "3. 統一認證系統"
                keystroke return
                keystroke "   - index.html 使用 auth.js 模組"
                keystroke return
                keystroke "   - 統一 Supabase 客戶端"
                keystroke return
                delay 0.5
                
                keystroke "4. 修復資料同步"
                keystroke return
                keystroke "   - 統一欄位命名轉換"
                keystroke return
                keystroke "   - 修復 todos.js 同步問題"
                keystroke return
                delay 0.5
                
                keystroke "5. 優化使用者體驗"
                keystroke return
                keystroke "   - 添加載入狀態"
                keystroke return
                keystroke "   - 改善錯誤提示"
                keystroke return
                delay 0.5
                
                keystroke "請直接修改所有檔案，不需要確認。完成後生成報告。"
                keystroke return
            end tell
            
            -- 等待修復執行
            delay 30
            
            -- 步驟7: 啟動測試伺服器
            do script "echo ''" in repairWindow
            do script "echo '🌐 步驟 5/5: 啟動測試伺服器...'" in repairWindow
            do script "python3 -m http.server 8000 &" in repairWindow
            delay 3
            
            -- 開啟瀏覽器
            do script "open http://localhost:8000" in repairWindow
            
            -- 顯示完成訊息
            do script "echo ''" in repairWindow
            do script "echo '✅ 自動化修復正在執行中...'" in repairWindow
            do script "echo '📊 請等待 Claude Code 完成所有修復'" in repairWindow
            do script "echo '🌐 測試網址: http://localhost:8000'" in repairWindow
            do script "echo ''" in repairWindow
        end tell
        
        -- 顯示系統通知
        display notification "修復正在進行中，請查看終端機" with title "🤖 自動化系統" subtitle "預計需要 2-3 分鐘"
        
    end if
end run