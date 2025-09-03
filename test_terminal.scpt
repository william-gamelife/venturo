#!/usr/bin/env osascript

tell application "Terminal"
    activate
    set testWindow to do script "echo '🤖 Claude 正在測試終端機控制'"
    delay 1
    do script "echo '📂 切換到專案目錄...'" in testWindow
    do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE" in testWindow
    delay 1
    do script "pwd" in testWindow
    delay 1
    do script "echo '✅ 終端機測試成功！'" in testWindow
    do script "echo ''" in testWindow
    do script "echo '現在可以執行 Claude Code 或其他命令'" in testWindow
end tell

display notification "終端機已開啟" with title "測試成功"
