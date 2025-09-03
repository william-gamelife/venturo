#!/bin/bash

# 🚀 遊戲人生系統 - 終極自動化腳本
# 基於 Claude Code 的完全自動化修復工具

PROJECT_PATH="/Users/williamchien/Desktop/Gamelife/GAMELIFE"
MODEL="claude-opus-4-1-20250805"

echo "╔══════════════════════════════════════════════════════╗"
echo "║     🤖 Claude Code 終極自動化 - 遊戲人生系統         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "📂 專案路徑: $PROJECT_PATH"
echo "🔧 使用模型: $MODEL"
echo ""

# 檢查 Claude Code 是否已安裝
check_claude() {
    if command -v claude &> /dev/null; then
        echo "✅ Claude Code 已安裝"
        claude --version
        return 0
    else
        echo "⚠️  Claude Code 未安裝"
        echo ""
        echo "請先安裝 Claude Code："
        echo "1. npm install -g @anthropic/claude-code"
        echo "2. 或訪問: https://docs.anthropic.com/en/docs/claude-code"
        return 1
    fi
}

# 主選單
echo "請選擇執行模式："
echo ""
echo "1) 🚀 完全自動化模式 [推薦] (--dangerously-skip-permissions)"
echo "   完全不需要任何確認，適合大量修改"
echo ""
echo "2) 🔒 安全模式 (使用 Shift+Tab)"
echo "   保留部分控制權，可隨時介入"
echo ""
echo "3) 📝 Session 模式 (選擇 2)"
echo "   首次確認後，整個 session 都自動"
echo ""
echo "4) 🛠️ 終極修復模式 (修復所有已知問題)"
echo "   自動診斷並修復所有問題"
echo ""
echo "5) 🔍 檢查安裝狀態"
echo ""
echo "6) 退出"
echo ""
read -p "請選擇 [1-6]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 啟動完全自動化模式..."
        cd "$PROJECT_PATH"
        claude --dangerously-skip-permissions
        ;;
    
    2)
        echo ""
        echo "🔒 啟動安全模式..."
        echo "提示：啟動後按 Shift+Tab 切換到 auto-accept 模式"
        cd "$PROJECT_PATH"
        claude
        ;;
    
    3)
        echo ""
        echo "📝 啟動 Session 模式..."
        echo "提示：第一次確認時選擇 2 (Allow all edits during this session)"
        cd "$PROJECT_PATH"
        claude
        ;;
    
    4)
        echo ""
        echo "🛠️ 啟動終極修復模式..."
        cd "$PROJECT_PATH"
        
        # 創建修復指令檔案
        cat > /tmp/fix_gamelife.txt << 'EOF'
執行完整系統修復，不需要任何確認：

【基礎架構修復】
1. 修復所有 Supabase 相關問題
   - 檢查 CDN 載入狀態
   - 確保 syncManager 正確初始化
   - 修復欄位名稱轉換（駝峰式與底線式）

【模組系統修復】
2. 修復所有模組載入問題
   - 檢查 import/export 語法
   - 確保模組路徑正確
   - 修復相依性問題

【UI 一致性修復】
3. 統一所有介面元素
   - 修正歡迎卡片高度
   - 統一按鈕樣式
   - 修正響應式設計

【功能完整性修復】
4. 修復所有功能缺陷
   - todos.js 同步問題
   - users.js 刪除功能
   - calendar.js 事件編輯
   - 登入狀態維持

【效能優化】
5. 優化系統效能
   - 實施延遲載入
   - 優化資源載入
   - 清理未使用程式碼

完成後生成修復報告。
EOF
        
        # 使用完全自動化模式執行修復
        claude --dangerously-skip-permissions < /tmp/fix_gamelife.txt
        
        # 清理暫存檔案
        rm /tmp/fix_gamelife.txt
        
        echo ""
        echo "✅ 修復完成！"
        ;;
    
    5)
        check_claude
        ;;
    
    6)
        echo "👋 再見！"
        exit 0
        ;;
    
    *)
        echo "❌ 無效選擇"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "提示：如需啟動本地伺服器，請執行："
echo "python3 -m http.server 8000"
echo ""
echo "然後訪問：http://localhost:8000"