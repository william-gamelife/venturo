-- 全自動化修復控制腳本
on run
    -- 關閉所有終端機視窗
    tell application "Terminal"
        close windows
    end tell
    delay 2
    
    -- 開啟新的終端機並執行修復
    tell application "Terminal"
        activate
        
        -- 創建新視窗
        set repairWindow to do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE"
        delay 1
        
        -- 顯示開始訊息
        do script "clear" in repairWindow
        do script "echo '🤖 啟動全自動化修復系統...'" in repairWindow
        do script "echo '📂 專案: /Users/williamchien/Desktop/Gamelife/GAMELIFE'" in repairWindow
        do script "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'" in repairWindow
        delay 1
        
        -- 檢查 Claude Code
        do script "which claude" in repairWindow
        delay 1
        
        -- 如果 Claude Code 存在，使用最強模式
        do script "if command -v claude &> /dev/null; then" in repairWindow
        do script "  echo '✅ Claude Code 已安裝，使用完全自動化模式'" in repairWindow
        do script "  claude --dangerously-skip-permissions" in repairWindow
        do script "else" in repairWindow
        do script "  echo '⚠️  Claude Code 未安裝'" in repairWindow
        do script "  echo '正在嘗試安裝...'" in repairWindow
        do script "  npm install -g @anthropic/claude-code" in repairWindow
        do script "fi" in repairWindow
        delay 5
        
        -- 等待 Claude 載入
        delay 8
        
        -- 輸入完整修復指令
        do script "請執行完整的宏觀架構修復，採用循環修復模式：

【第一輪：系統架構修復】
1. 統一認證系統
   - 重構 index.html 使用 modules/auth.js
   - 移除所有重複的 Supabase 初始化
   - 統一使用 window.getSupabaseClient()

2. 修復模組載入系統
   - 建立動態模組註冊
   - 改善錯誤處理
   - 添加載入重試機制

【第二輪：資料同步修復】
3. 統一資料欄位命名
   - 實作 toDatabase() 和 fromDatabase() 轉換
   - 統一錯誤處理模式
   - 優化本地快取策略

4. 修復所有模組的同步問題
   - todos.js 使用 syncManager.save()
   - calendar.js 事件同步
   - 所有模組統一同步模式

【第三輪：使用者體驗優化】
5. 添加完整的載入狀態
6. 實作操作回饋系統
7. 優化錯誤訊息顯示

【測試流程】
執行每輪修復後：
- 測試登入功能
- 測試模組載入
- 測試資料同步
- 檢查 Console 錯誤

持續循環直到沒有錯誤為止。
生成完整修復報告。" in repairWindow
        
        delay 60 -- 等待第一輪修復
        
        -- 啟動測試伺服器
        do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in repairWindow
        do script "python3 -m http.server 8000 &" in repairWindow
        delay 3
        
        -- 執行第二輪檢測和修復
        do script "echo ''" in repairWindow
        do script "echo '🔄 第二輪檢測...'" in repairWindow
        do script "echo '檢查修復結果並繼續優化'" in repairWindow
        
        delay 60 -- 等待第二輪
        
        -- 開啟瀏覽器測試
        do script "open http://localhost:8000" in repairWindow
    end tell
    
    -- 顯示完成通知
    delay 5
    display notification "自動化修復正在執行中..." with title "🤖 遊戲人生系統" subtitle "請在終端機查看進度"
end run