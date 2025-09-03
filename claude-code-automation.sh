#!/bin/bash

# 🤖 Claude Code 自動化檢測腳本
# 使用 Claude Code CLI 進行專案分析

PROJECT_PATH="/Users/williamchien/Desktop/Gamelife/GAMELIFE"

echo "╔══════════════════════════════════════════════════════╗"
echo "║     🤖 Claude Code 專案檢測 - 遊戲人生系統           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "📂 專案路徑: $PROJECT_PATH"
echo "🔧 使用模型: claude-opus-4-1-20250805"
echo ""

# 檢查 Claude Code 是否已安裝
check_claude_code() {
    if command -v claude &> /dev/null; then
        echo "✅ Claude Code 已安裝"
        claude --version
        return 0
    else
        echo "⚠️  Claude Code 未安裝"
        echo ""
        echo "請先安裝 Claude Code："
        echo "1. 訪問: https://docs.anthropic.com/en/docs/claude-code"
        echo "2. 按照官方指南安裝"
        echo ""
        read -p "是否要開啟安裝文檔？[y/n] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "https://docs.anthropic.com/en/docs/claude-code"
        fi
        return 1
    fi
}

# 創建檢測任務檔案
create_task_file() {
    cat > "$PROJECT_PATH/claude-task.md" << 'EOF'
# 🔍 專案全面檢測任務

## 專案資訊
- **專案名稱**: 遊戲人生管理系統
- **專案路徑**: /Users/williamchien/Desktop/Gamelife/GAMELIFE
- **技術棧**: HTML, CSS, JavaScript, Supabase

## 檢測要求

請執行以下檢測任務：

### 1. 程式碼品質檢查
- [ ] HTML 語法驗證
- [ ] JavaScript 錯誤和警告
- [ ] CSS 語法和最佳實踐
- [ ] 檔案結構和命名規範

### 2. 功能完整性
- [ ] 模組載入機制
- [ ] API 連接狀態
- [ ] 認證流程
- [ ] 資料同步機制

### 3. 安全性審查
- [ ] API 金鑰管理
- [ ] XSS 漏洞
- [ ] CSRF 防護
- [ ] 敏感資料處理

### 4. 效能分析
- [ ] 載入時間
- [ ] 資源優化
- [ ] 快取策略
- [ ] 程式碼分割

### 5. 相容性檢查
- [ ] 瀏覽器相容性
- [ ] 響應式設計
- [ ] 無障礙功能

## 輸出要求

請提供：
1. **問題清單** - 按優先級排序
2. **修復建議** - 具體的解決方案
3. **程式碼範例** - 修正後的程式碼片段
4. **最佳實踐** - 改進建議

## 檔案列表

主要檔案：
- index.html (登入頁面)
- dashboard.html (儀表板)
- config.js (配置)
- modules/*.js (功能模組)

請開始檢測並提供詳細報告。
EOF
    echo "✅ 檢測任務檔案已創建"
}

# 執行 Claude Code 檢測
run_claude_code() {
    echo "🚀 啟動 Claude Code..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 切換到專案目錄
    cd "$PROJECT_PATH"
    
    # 使用 Claude Code 執行檢測
    # 注意：實際命令可能需要根據 Claude Code 的具體語法調整
    claude code \
        --model claude-opus-4-1-20250805 \
        --task "請檢測這個專案的所有錯誤並提供修復建議" \
        --context . \
        --output claude-report.md
}

# 使用 AppleScript 自動化終端機操作
automate_terminal() {
    osascript <<EOF
tell application "Terminal"
    activate
    
    -- 創建新視窗
    set newWindow to do script ""
    delay 0.5
    
    -- 切換到專案目錄
    do script "cd '$PROJECT_PATH'" in newWindow
    delay 0.5
    
    -- 清空畫面
    do script "clear" in newWindow
    delay 0.5
    
    -- 顯示標題
    do script "echo '🤖 Claude Code 專案檢測'" in newWindow
    do script "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'" in newWindow
    delay 0.5
    
    -- 執行 Claude Code（根據實際命令調整）
    do script "claude code --help" in newWindow
    delay 2
    
    -- 執行檢測命令
    -- 實際命令需要根據 Claude Code 文檔調整
    do script "echo '開始執行專案檢測...'" in newWindow
    do script "# claude code analyze . --comprehensive" in newWindow
    
    -- 保持視窗在前台
    set frontmost to true
end tell
EOF
}

# 主選單
show_menu() {
    echo ""
    echo "請選擇操作："
    echo "1) 檢查 Claude Code 安裝狀態"
    echo "2) 創建檢測任務檔案"
    echo "3) 執行自動化檢測（終端機）"
    echo "4) 查看 Claude Code 文檔"
    echo "5) 退出"
    echo ""
    read -p "選擇 [1-5]: " choice
    
    case $choice in
        1)
            check_claude_code
            ;;
        2)
            create_task_file
            echo "📄 任務檔案已保存至: $PROJECT_PATH/claude-task.md"
            ;;
        3)
            if check_claude_code; then
                automate_terminal
            fi
            ;;
        4)
            echo "🌐 開啟 Claude Code 文檔..."
            open "https://docs.anthropic.com/en/docs/claude-code"
            ;;
        5)
            echo "👋 再見！"
            exit 0
            ;;
        *)
            echo "❌ 無效選擇"
            show_menu
            ;;
    esac
}

# 執行主程式
main() {
    show_menu
    
    # 循環選單
    while true; do
        echo ""
        read -p "按 Enter 返回選單，或按 q 退出: " -n 1 input
        if [[ $input == "q" ]]; then
            echo -e "\n👋 再見！"
            break
        fi
        show_menu
    done
}

# 開始執行
main