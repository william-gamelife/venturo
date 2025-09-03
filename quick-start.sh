#!/bin/bash
# 快速啟動腳本 - 使用 Python 內建伺服器

cd /Users/williamchien/Desktop/Gamelife/GAMELIFE
echo "🎮 啟動遊戲人生開發環境..."
echo "📍 訪問地址: http://localhost:8000"
echo "按 Ctrl+C 停止伺服器"
echo ""

# 在背景啟動 Python 伺服器
python3 -m http.server 8000 &
SERVER_PID=$!

# 等待一秒讓伺服器啟動
sleep 1

# 開啟瀏覽器
open http://localhost:8000

# 等待用戶按 Ctrl+C
echo "伺服器運行中... (PID: $SERVER_PID)"
echo "按 Enter 鍵停止伺服器"
read

# 停止伺服器
kill $SERVER_PID 2>/dev/null
echo "✅ 伺服器已停止"