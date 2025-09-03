#!/bin/bash

# 遊戲人生開發環境啟動腳本
# 自動檢測並使用可用的開發伺服器

echo "🎮 準備啟動遊戲人生開發環境..."
echo ""

# 切換到專案目錄
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)
echo "📂 專案目錄: $PROJECT_DIR"
echo ""

# 檢查是否有 Python 3
if command -v python3 &> /dev/null; then
    echo "✅ 找到 Python 3，使用 Python 伺服器"
    echo ""
    python3 dev-server.py
    
# 檢查是否有 Node.js
elif command -v node &> /dev/null; then
    echo "✅ 找到 Node.js，使用 Node 伺服器"
    echo ""
    node dev-server.js
    
# 使用內建的 Python HTTP 伺服器（macOS 預裝）
else
    echo "📦 使用系統內建的簡易伺服器"
    echo ""
    echo "🎮 遊戲人生開發伺服器已啟動！"
    echo "📍 訪問地址: http://localhost:8000"
    echo "📂 根目錄: $PROJECT_DIR"
    echo ""
    echo "✨ 正在自動開啟瀏覽器..."
    echo "按 Ctrl+C 停止伺服器"
    echo "─────────────────────────────────────────────────"
    
    # 開啟瀏覽器
    open http://localhost:8000
    
    # 啟動 Python 內建伺服器
    python3 -m http.server 8000
fi