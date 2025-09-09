#!/bin/bash

# Venturo 本地化系統檢查腳本

echo "🔍 Venturo 系統檢查開始..."
echo "================================"

# 1. 檢查 Supabase 引用
echo "📌 檢查 Supabase 引用..."
if grep -r "from '@/lib/supabase" src/ --exclude-dir=node_modules --exclude-dir=.next --exclude="*.bak" 2>/dev/null; then
    echo "❌ 發現 Supabase 引用！請修正以上檔案"
else
    echo "✅ 沒有 Supabase 引用"
fi

echo ""

# 2. 檢查環境變數
echo "📌 檢查環境變數..."
if [ -f ".env.local" ]; then
    if grep -q "SUPABASE" .env.local; then
        echo "⚠️  .env.local 仍包含 SUPABASE 變數（已不使用）"
    else
        echo "✅ 環境變數已清理"
    fi
else
    echo "❌ 找不到 .env.local"
fi

echo ""

# 3. 檢查本地認證系統
echo "📌 檢查本地認證系統..."
if [ -f "src/lib/local-auth.ts" ]; then
    echo "✅ local-auth.ts 存在"
else
    echo "❌ local-auth.ts 不存在"
fi

if [ -f "src/lib/api-manager.ts" ]; then
    echo "✅ api-manager.ts 存在"
else
    echo "❌ api-manager.ts 不存在"
fi

echo ""

# 4. 列出備份檔案
echo "📌 備份檔案："
ls -la src/lib/*.bak 2>/dev/null || echo "沒有備份檔案"
ls -la src/lib/*_backup 2>/dev/null || echo "沒有備份資料夾"
ls -la src/app/auth_backup 2>/dev/null || echo "沒有 auth 備份"

echo ""
echo "================================"
echo "✨ 檢查完成！"
echo ""
echo "下一步："
echo "1. npm run dev - 啟動開發伺服器"
echo "2. 訪問 http://localhost:3000 - 主頁（角色選擇）"
echo "3. 訪問 http://localhost:3000/api-test - API 測試"
