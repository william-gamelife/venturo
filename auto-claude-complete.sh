#!/bin/bash

# 🤖 Claude 自動化開發助手
# 完整版 - 包含錯誤檢測和自動修復

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 專案路徑
PROJECT_PATH="/Users/williamchien/Desktop/Gamelife/GAMELIFE"

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🤖 Claude 自動化開發助手 - 遊戲人生專案        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# 檢查 Claude CLI 是否已安裝
check_claude() {
    if command -v claude &> /dev/null; then
        echo -e "${GREEN}✅ Claude CLI 已安裝${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Claude CLI 未安裝${NC}"
        echo -e "${YELLOW}   請先安裝：https://claude.ai/cli${NC}"
        echo ""
        echo "是否要繼續使用替代方案？(使用網頁版 Claude) [y/n]"
        read -r response
        if [[ "$response" == "y" ]]; then
            use_web_claude
        else
            exit 1
        fi
    fi
}

# 使用網頁版 Claude（備用方案）
use_web_claude() {
    echo -e "${BLUE}🌐 開啟網頁版 Claude...${NC}"
    
    # 創建檢測報告
    create_error_report
    
    # 開啟 Claude 網頁和專案
    osascript <<EOF
tell application "Google Chrome"
    activate
    
    -- 開啟 Claude
    set claudeTab to make new tab in window 1 with properties {URL:"https://claude.ai/new"}
    delay 3
    
    -- 開啟專案文件夾
    tell application "Finder"
        activate
        open POSIX file "$PROJECT_PATH"
    end tell
    
    -- 提示用戶
    display dialog "Claude 已開啟！請將 error-report.md 檔案拖曳到 Claude 對話框中" buttons {"OK"} default button "OK"
end tell
EOF
}

# 創建錯誤檢測報告
create_error_report() {
    REPORT_FILE="$PROJECT_PATH/error-report.md"
    
    echo -e "${YELLOW}📝 正在生成錯誤檢測報告...${NC}"
    
    cat > "$REPORT_FILE" << 'EOL'
# 🔍 遊戲人生專案 - 錯誤檢測請求

## 專案資訊
- **專案路徑**: `/Users/williamchien/Desktop/Gamelife/GAMELIFE`
- **檢測時間**: DATE_PLACEHOLDER
- **檢測類型**: 全面錯誤掃描

## 請檢測以下內容

### 1. HTML 檔案檢測
- [ ] index.html - 語法錯誤
- [ ] dashboard.html - 結構問題
- [ ] 標籤閉合問題
- [ ] 屬性錯誤

### 2. JavaScript 檢測
- [ ] 語法錯誤
- [ ] 未定義的變數
- [ ] 函數呼叫錯誤
- [ ] 非同步處理問題
- [ ] 模組載入錯誤

### 3. CSS 檢測
- [ ] 語法錯誤
- [ ] 選擇器問題
- [ ] 屬性值錯誤
- [ ] 響應式設計問題

### 4. 整合問題
- [ ] Supabase 連接錯誤
- [ ] API 呼叫問題
- [ ] CORS 錯誤
- [ ] 認證流程問題

### 5. 檔案結構
- [ ] 缺失的檔案
- [ ] 錯誤的路徑引用
- [ ] 模組依賴問題

## 需要的輸出

請提供：
1. **錯誤清單** - 所有發現的問題
2. **嚴重程度** - 錯誤的優先級
3. **修復建議** - 具體的解決方案
4. **程式碼範例** - 修正後的程式碼

## 專案檔案列表

### 主要檔案
- index.html
- dashboard.html
- config.js
- vercel.json

### 模組檔案 (modules/)
請檢查 modules 目錄下的所有 .js 檔案

## 執行指令

請執行以下檢測：
```bash
cd /Users/williamchien/Desktop/Gamelife/GAMELIFE
# 檢測所有檔案
```

---
請開始全面檢測並提供詳細報告。
EOL
    
    # 替換日期
    sed -i '' "s/DATE_PLACEHOLDER/$(date '+%Y-%m-%d %H:%M:%S')/g" "$REPORT_FILE"
    
    echo -e "${GREEN}✅ 錯誤報告已生成：$REPORT_FILE${NC}"
}

# 主要執行流程（使用 CLI）
run_with_cli() {
    echo -e "${BLUE}🚀 使用 Claude CLI 執行自動化檢測${NC}"
    
    # 創建 AppleScript
    osascript <<EOF
tell application "Terminal"
    activate
    
    -- 創建新視窗
    set newWindow to do script ""
    delay 0.5
    
    -- 切換到專案目錄
    do script "cd '$PROJECT_PATH'" in newWindow
    delay 0.5
    
    do script "clear" in newWindow
    delay 0.5
    
    -- 顯示歡迎訊息
    do script "echo '🤖 Claude 自動化開發助手'" in newWindow
    do script "echo '📂 專案: $PROJECT_PATH'" in newWindow
    do script "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'" in newWindow
    delay 1
    
    -- 啟動 Claude
    do script "claude" in newWindow
    delay 3
    
    -- 輸入檢測命令（模擬鍵盤輸入）
    tell application "System Events"
        -- 第一行：請求檢測
        keystroke "我需要你幫我全面檢測專案錯誤。專案路徑是 /Users/williamchien/Desktop/Gamelife/GAMELIFE"
        keystroke return
        delay 1
        
        -- 第二行：詳細要求
        keystroke "請檢測：1) HTML語法 2) JavaScript錯誤 3) CSS問題 4) 模組載入 5) API連接 6) 檔案路徑"
        keystroke return
        delay 1
        
        -- 第三行：輸出格式
        keystroke "請提供詳細的錯誤報告，包含錯誤位置、嚴重程度和修復建議"
        keystroke return
    end tell
    
    -- 將視窗置前
    set frontmost of newWindow to true
end tell
EOF
}

# 執行選單
show_menu() {
    echo -e "${BLUE}請選擇執行方式：${NC}"
    echo "1) 自動執行（使用 Claude CLI）"
    echo "2) 使用網頁版 Claude"
    echo "3) 只生成錯誤報告"
    echo "4) 退出"
    echo ""
    echo -n "請選擇 [1-4]: "
    read -r choice
    
    case $choice in
        1)
            check_claude
            if command -v claude &> /dev/null; then
                run_with_cli
            fi
            ;;
        2)
            use_web_claude
            ;;
        3)
            create_error_report
            echo -e "${GREEN}✅ 報告已生成！${NC}"
            ;;
        4)
            echo -e "${YELLOW}👋 再見！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}無效選擇！${NC}"
            show_menu
            ;;
    esac
}

# 完成訊息
finish_message() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  ✅ 執行完成！                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}已完成的操作：${NC}"
    echo "   ✓ 開啟終端機/瀏覽器"
    echo "   ✓ 設定專案路徑"
    echo "   ✓ 啟動 Claude"
    echo "   ✓ 輸入檢測指令"
    echo ""
    echo -e "${YELLOW}💡 提示：${NC}"
    echo "   - Claude 正在分析您的專案"
    echo "   - 請等待分析結果"
    echo "   - 可以追加更多問題"
}

# 主程式
main() {
    show_menu
    finish_message
}

# 執行主程式
main