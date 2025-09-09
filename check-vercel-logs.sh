#!/bin/bash

echo "📋 查看 Vercel 部署日誌"
echo "====================="
echo ""

cd /Users/william/Desktop/Venturo/Venturo

echo "獲取最近的部署..."
echo ""

# 列出最近的部署
echo "最近 3 次部署："
vercel ls --limit 3

echo ""
echo "---"
echo ""

# 查看最新部署的日誌
echo "查看最新部署的詳細日誌："
echo "(這會顯示構建過程中的所有輸出和錯誤)"
echo ""

vercel logs --output raw

echo ""
echo "---"
echo ""
echo "如果要查看特定部署的日誌，可以使用："
echo "vercel logs [deployment-url]"
