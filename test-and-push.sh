#!/bin/bash

echo "🚀 測試 SSH 連線並推送..."
echo ""

# 測試 SSH 連線
echo "1. 測試 GitHub SSH 連線..."
ssh -T git@github.com

echo ""
echo "2. 檢查待推送的更新..."
cd /Users/williamchien/Desktop/FINAL-gamrlife/WEB
git status

echo ""
echo "3. 推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo "🎉 Vercel 正在自動部署..."
    echo ""
    echo "可以到這裡查看部署狀態："
    echo "https://vercel.com/william-gamelife/gamelife-corner"
else
    echo ""
    echo "❌ 推送失敗，請確認 SSH key 已正確設定"
fi
