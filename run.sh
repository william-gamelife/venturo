#!/bin/bash

# 直接控制 Terminal - 開啟並執行 Claude Code
osascript -e 'tell application "Terminal" to activate' \
         -e 'tell application "Terminal" to do script "cd /Users/williamchien/Desktop/Gamelife/GAMELIFE"' \
         -e 'delay 1' \
         -e 'tell application "Terminal" to do script "pwd" in front window' \
         -e 'delay 1' \
         -e 'tell application "Terminal" to do script "claude" in front window'

echo "✅ Terminal 已開啟，Claude Code 正在啟動"
