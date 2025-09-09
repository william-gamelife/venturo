#!/bin/bash

echo "🚨 緊急修復：切換到 Supabase"
echo "============================"

cd /Users/william/Desktop/Venturo/Venturo

echo "📦 安裝 Supabase..."
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

echo "🧹 移除舊的本地存儲文件..."
rm -f src/lib/local-storage.ts
rm -f src/lib/database.ts
rm -f src/lib/local-auth.ts

echo "✅ 修復完成！現在重新啟動："
echo "npm run dev"

echo ""
echo "🎯 新系統特點："
echo "- ✅ 真正的 Email/密碼註冊"
echo "- ✅ Supabase 雲端存儲" 
echo "- ✅ 新用戶自動設為冒險模式"
echo "- ✅ 本名必填"
echo ""
echo "🔧 下一步："
echo "1. 重新啟動 npm run dev"
echo "2. 前往 http://localhost:3002"
echo "3. 點擊「註冊」建立新帳號"
echo "4. 或用管理員帳號登入（雙擊版本號）"
