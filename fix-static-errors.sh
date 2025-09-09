#!/bin/bash

echo "🔧 修復靜態生成錯誤"
echo "==================="
echo ""

cd /Users/william/Desktop/Venturo/Venturo

echo "📝 提交修改..."
git add -A
git commit -m "fix: Force dynamic rendering to avoid static generation errors

- Added dynamic = 'force-dynamic' to root layout
- This prevents static generation errors for all pages
- All pages will now be rendered on-demand
- Fixes authentication and localStorage issues during build"

echo ""
echo "📤 推送到 GitHub..."
git push origin main

echo ""
echo "🚀 部署到 Vercel..."
vercel --prod --yes

echo ""
echo "✅ 完成！"
echo ""
echo "這次應該不會有靜態生成錯誤了，因為所有頁面都會動態渲染。"
