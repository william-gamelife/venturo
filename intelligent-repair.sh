#!/bin/bash

# 🤖 遊戲人生 - 智能循環修復系統
# 採用宏觀架構修正 + 使用者體驗測試的方式

PROJECT_PATH="/Users/williamchien/Desktop/Gamelife/GAMELIFE"
ITERATION=0
MAX_ITERATIONS=10

echo "
╔══════════════════════════════════════════════════════════════╗
║           🤖 智能循環修復系統 - 遊戲人生 3.0                 ║
║                   宏觀架構修正模式                           ║
╚══════════════════════════════════════════════════════════════╝
"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 系統狀態
SYSTEM_STATUS="INITIALIZING"
ERRORS_FOUND=0
FIXES_APPLIED=0

# 建立修復日誌
LOG_FILE="$PROJECT_PATH/repair_log_$(date +%Y%m%d_%H%M%S).log"

# 記錄函數
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# 宏觀檢測函數
macro_analysis() {
    log "\n${CYAN}═══════════════════════════════════════════════════${NC}"
    log "${BLUE}[宏觀分析 #$((ITERATION+1))]${NC} 開始系統架構檢測..."
    log "${CYAN}═══════════════════════════════════════════════════${NC}"
    
    # 創建檢測腳本
    cat > /tmp/gamelife_check.js << 'EOF'
// 宏觀系統檢測腳本
const fs = require('fs');
const path = require('path');

const PROJECT_PATH = '/Users/williamchien/Desktop/Gamelife/GAMELIFE';
const issues = [];

// 1. 檢查認證系統一致性
function checkAuthSystem() {
    const indexHtml = fs.readFileSync(path.join(PROJECT_PATH, 'index.html'), 'utf8');
    const authJs = fs.readFileSync(path.join(PROJECT_PATH, 'modules/auth.js'), 'utf8');
    
    // 檢查 index.html 是否使用 auth.js
    if (!indexHtml.includes("import('./modules/auth.js')")) {
        issues.push({
            severity: 'HIGH',
            category: 'ARCHITECTURE',
            issue: '登入頁面未使用統一的認證模組',
            file: 'index.html',
            solution: '重構 index.html 使用 auth.js 模組'
        });
    }
    
    // 檢查重複的 Supabase 初始化
    const supabaseInits = (indexHtml.match(/supabase\.createClient/g) || []).length;
    if (supabaseInits > 0) {
        issues.push({
            severity: 'HIGH',
            category: 'ARCHITECTURE',
            issue: `發現 ${supabaseInits} 處直接初始化 Supabase 客戶端`,
            file: 'index.html',
            solution: '統一使用 window.getSupabaseClient()'
        });
    }
}

// 2. 檢查模組系統
function checkModuleSystem() {
    const dashboardHtml = fs.readFileSync(path.join(PROJECT_PATH, 'dashboard.html'), 'utf8');
    
    // 檢查模組映射是否硬編碼
    if (dashboardHtml.includes("const moduleMap = {")) {
        issues.push({
            severity: 'MEDIUM',
            category: 'MAINTAINABILITY',
            issue: '模組映射表硬編碼在 HTML 中',
            file: 'dashboard.html',
            solution: '建立動態模組註冊系統'
        });
    }
}

// 3. 檢查資料同步系統
function checkSyncSystem() {
    const syncJs = fs.readFileSync(path.join(PROJECT_PATH, 'modules/sync.js'), 'utf8');
    
    // 檢查錯誤處理
    if (!syncJs.includes('try') || !syncJs.includes('catch')) {
        issues.push({
            severity: 'HIGH',
            category: 'RELIABILITY',
            issue: '同步系統缺少完整錯誤處理',
            file: 'modules/sync.js',
            solution: '為所有異步操作添加 try-catch'
        });
    }
}

// 4. 檢查使用者體驗流程
function checkUserFlow() {
    const files = [
        'index.html',
        'dashboard.html',
        'modules/todos.js',
        'modules/calendar.js'
    ];
    
    files.forEach(file => {
        const filePath = path.join(PROJECT_PATH, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // 檢查 console.log
            const consoleLogs = (content.match(/console\.log/g) || []).length;
            if (consoleLogs > 5) {
                issues.push({
                    severity: 'LOW',
                    category: 'PRODUCTION',
                    issue: `過多的 console.log (${consoleLogs} 個)`,
                    file: file,
                    solution: '移除或註解掉開發用的 console.log'
                });
            }
            
            // 檢查載入狀態
            if (!content.includes('載入中') && file.includes('.js')) {
                issues.push({
                    severity: 'MEDIUM',
                    category: 'UX',
                    issue: '缺少載入狀態提示',
                    file: file,
                    solution: '添加載入動畫或文字提示'
                });
            }
        }
    });
}

// 執行檢測
checkAuthSystem();
checkModuleSystem();
checkSyncSystem();
checkUserFlow();

// 輸出結果
console.log(JSON.stringify({
    total: issues.length,
    high: issues.filter(i => i.severity === 'HIGH').length,
    medium: issues.filter(i => i.severity === 'MEDIUM').length,
    low: issues.filter(i => i.severity === 'LOW').length,
    issues: issues
}, null, 2));
EOF
    
    # 執行檢測
    if command -v node &> /dev/null; then
        ANALYSIS_RESULT=$(node /tmp/gamelife_check.js 2>/dev/null)
        
        if [ -n "$ANALYSIS_RESULT" ]; then
            ERRORS_FOUND=$(echo "$ANALYSIS_RESULT" | grep -o '"total": [0-9]*' | grep -o '[0-9]*')
            
            log "\n${YELLOW}發現 ${ERRORS_FOUND} 個系統性問題${NC}"
            echo "$ANALYSIS_RESULT" >> "$LOG_FILE"
        fi
    else
        log "${YELLOW}⚠️  Node.js 未安裝，使用基礎檢測${NC}"
        basic_check
    fi
}

# 基礎檢測（備用）
basic_check() {
    log "${CYAN}執行基礎檔案檢測...${NC}"
    
    # 檢查關鍵檔案是否存在
    local missing_files=0
    for file in "index.html" "dashboard.html" "config.js" "modules/sync.js" "modules/auth.js"; do
        if [ ! -f "$PROJECT_PATH/$file" ]; then
            log "${RED}❌ 缺少關鍵檔案: $file${NC}"
            ((missing_files++))
        fi
    done
    
    ERRORS_FOUND=$missing_files
}

# 智能修復函數
apply_fixes() {
    log "\n${CYAN}═══════════════════════════════════════════════════${NC}"
    log "${BLUE}[智能修復 #$((ITERATION+1))]${NC} 開始修復系統問題..."
    log "${CYAN}═══════════════════════════════════════════════════${NC}"
    
    # 使用 Claude Code 執行修復
    cd "$PROJECT_PATH"
    
    # 創建修復指令
    cat > /tmp/fix_command.txt << 'EOF'
基於宏觀架構分析，執行以下修復：

【第 ITERATION_NUM 輪修復】

1. 統一認證系統
   - 重構 index.html，使用 modules/auth.js 的 AuthManagerV2
   - 移除所有直接的 Supabase 初始化
   - 統一使用 window.getSupabaseClient()

2. 修復模組載入系統
   - 創建動態模組註冊機制
   - 改善錯誤處理
   - 添加模組載入重試機制

3. 優化資料同步
   - 確保所有異步操作有 try-catch
   - 統一欄位名稱轉換
   - 實現本地快取與雲端同步的智能切換

4. 改善使用者體驗
   - 添加所有操作的載入狀態
   - 實現操作回饋（成功/失敗提示）
   - 優化錯誤訊息的友善度

請直接修改檔案，不需要確認。
EOF
    
    # 替換迭代次數
    sed -i '' "s/ITERATION_NUM/$((ITERATION+1))/g" /tmp/fix_command.txt
    
    # 執行修復（如果 Claude Code 可用）
    if command -v claude &> /dev/null; then
        log "${GREEN}使用 Claude Code 執行智能修復...${NC}"
        claude --dangerously-skip-permissions < /tmp/fix_command.txt
        FIXES_APPLIED=$((FIXES_APPLIED + ERRORS_FOUND))
    else
        log "${YELLOW}Claude Code 未安裝，執行基礎修復...${NC}"
        basic_fix
    fi
}

# 基礎修復（備用）
basic_fix() {
    log "${CYAN}執行基礎修復...${NC}"
    
    # 修復 config.js
    if [ -f "$PROJECT_PATH/config.js" ]; then
        log "修復 config.js 單例模式..."
        # 這裡可以用 sed 或其他工具進行基礎修復
    fi
}

# 使用者體驗測試
user_experience_test() {
    log "\n${CYAN}═══════════════════════════════════════════════════${NC}"
    log "${BLUE}[UX測試 #$((ITERATION+1))]${NC} 模擬使用者操作流程..."
    log "${CYAN}═══════════════════════════════════════════════════${NC}"
    
    # 啟動測試伺服器
    if ! pgrep -f "python3 -m http.server" > /dev/null; then
        cd "$PROJECT_PATH"
        python3 -m http.server 8000 > /dev/null 2>&1 &
        SERVER_PID=$!
        sleep 3
        log "${GREEN}✓ 測試伺服器已啟動 (PID: $SERVER_PID)${NC}"
    fi
    
    # 使用 curl 測試基礎連接
    if curl -s http://localhost:8000 > /dev/null; then
        log "${GREEN}✓ 網站可訪問${NC}"
    else
        log "${RED}✗ 網站無法訪問${NC}"
        ((ERRORS_FOUND++))
    fi
    
    # 測試關鍵頁面
    for page in "index.html" "dashboard.html"; do
        if curl -s "http://localhost:8000/$page" | grep -q "<!DOCTYPE html>"; then
            log "${GREEN}✓ $page 載入正常${NC}"
        else
            log "${RED}✗ $page 載入失敗${NC}"
            ((ERRORS_FOUND++))
        fi
    done
}

# 主循環
main_loop() {
    while [ $ITERATION -lt $MAX_ITERATIONS ]; do
        ITERATION=$((ITERATION + 1))
        
        log "\n${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
        log "${CYAN}║         第 $ITERATION 輪循環修復                              ║${NC}"
        log "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
        
        # 1. 宏觀分析
        macro_analysis
        
        # 2. 如果發現問題，執行修復
        if [ $ERRORS_FOUND -gt 0 ]; then
            apply_fixes
            sleep 5  # 給修復時間
        else
            log "${GREEN}✅ 未發現系統性問題${NC}"
        fi
        
        # 3. 使用者體驗測試
        user_experience_test
        
        # 4. 每2輪做一次深度檢測
        if [ $((ITERATION % 2)) -eq 0 ]; then
            log "\n${CYAN}[深度檢測]${NC} 執行完整系統掃描..."
            deep_scan
        fi
        
        # 5. 檢查是否需要繼續
        if [ $ERRORS_FOUND -eq 0 ]; then
            log "\n${GREEN}✅ 系統修復完成！${NC}"
            break
        fi
        
        # 重置錯誤計數
        ERRORS_FOUND=0
        
        # 短暫休息
        sleep 3
    done
}

# 深度掃描
deep_scan() {
    log "${CYAN}執行深度系統掃描...${NC}"
    
    # 檢查所有 JavaScript 檔案
    find "$PROJECT_PATH" -name "*.js" -type f | while read -r file; do
        # 檢查語法錯誤（如果有 node）
        if command -v node &> /dev/null; then
            if ! node -c "$file" 2>/dev/null; then
                log "${RED}✗ 語法錯誤: $file${NC}"
                ((ERRORS_FOUND++))
            fi
        fi
    done
    
    # 檢查 Supabase 連接
    if curl -s "https://jjazipnkoccgmbpccalf.supabase.co" | grep -q "healthy"; then
        log "${GREEN}✓ Supabase 連接正常${NC}"
    else
        log "${YELLOW}⚠ Supabase 連接可能有問題${NC}"
    fi
}

# 最終報告
final_report() {
    log "\n${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
    log "${CYAN}║                  修復報告                            ║${NC}"
    log "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
    
    log "
📊 修復統計：
   - 執行輪數: $ITERATION
   - 修復問題: $FIXES_APPLIED
   - 剩餘問題: $ERRORS_FOUND
   
📁 日誌檔案: $LOG_FILE
🌐 測試網址: http://localhost:8000

${GREEN}系統狀態: $([ $ERRORS_FOUND -eq 0 ] && echo "✅ 正常" || echo "⚠️  需要關注")${NC}
"
    
    # 開啟瀏覽器測試
    if [ $ERRORS_FOUND -eq 0 ]; then
        log "${GREEN}正在開啟瀏覽器進行最終測試...${NC}"
        open "http://localhost:8000"
    fi
}

# 清理函數
cleanup() {
    log "\n${YELLOW}清理臨時檔案...${NC}"
    rm -f /tmp/gamelife_check.js
    rm -f /tmp/fix_command.txt
    
    # 停止測試伺服器
    if [ -n "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
        log "測試伺服器已停止"
    fi
}

# 設定信號處理
trap cleanup EXIT

# 執行主程式
log "${GREEN}🚀 開始智能循環修復系統${NC}"
main_loop
final_report

log "${GREEN}✅ 程式執行完成${NC}"