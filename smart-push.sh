#!/bin/bash

echo "嘗試使用 SSH 推送..."
git push origin main

if [ $? -ne 0 ]; then
    echo ""
    echo "SSH 推送失敗，嘗試 HTTPS 方式..."
    echo "請輸入你的 GitHub 用戶名和 Personal Access Token"
    echo ""
    
    # 改為 HTTPS
    git remote set-url origin https://github.com/william-gamelife/gamelife-corner.git
    
    # 設定快取認證
    git config --global credential.helper 'cache --timeout=7200'
    
    # 再次推送
    git push origin main
    
    # 改回 SSH（下次用）
    git remote set-url origin git@github.com:william-gamelife/gamelife-corner.git
fi

echo ""
echo "✅ 推送完成！"
