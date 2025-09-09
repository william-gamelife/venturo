#!/bin/bash

echo "🔄 觸發 Vercel 重新部署（包含環境變數）"
echo "======================================="
echo ""

cd /Users/william/Desktop/Venturo/Venturo

echo "創建空提交來觸發部署..."
git commit --allow-empty -m "chore: Trigger redeployment with environment variables

- Added Supabase environment variables in Vercel Dashboard
- This should fix 'supabaseUrl is required' errors
- All pages should now render correctly"

echo ""
echo "推送到 GitHub..."
git push origin main

echo ""
echo "✅ 已觸發重新部署！"
echo ""
echo "請確認你已在 Vercel Dashboard 添加環境變數："
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY" 
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- AUTH_MODE"
