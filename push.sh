#!/bin/bash
# 快速部署腳本
git add .
git commit -m "${1:-更新}"
git push origin main
echo "✅ 已推送到 GitHub，Vercel 正在自動部署..."
