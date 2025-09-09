#!/bin/bash
# Venturo Supabase 遷移腳本

echo "🚀 Venturo Supabase 遷移開始..."

# 檢查是否提供了新的 Supabase 資訊
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ 請提供 Supabase URL 和 ANON KEY"
    echo "使用方法: ./migrate-to-supabase.sh <SUPABASE_URL> <ANON_KEY> [SERVICE_ROLE_KEY]"
    exit 1
fi

SUPABASE_URL=$1
ANON_KEY=$2
SERVICE_ROLE_KEY=${3:-""}

# 備份現有的 .env.local
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup
    echo "✅ 已備份現有的 .env.local"
fi

# 更新 .env.local
echo "🔧 更新環境變數..."
sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env.local
sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY|" .env.local

if [ ! -z "$SERVICE_ROLE_KEY" ]; then
    sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|" .env.local
fi

# 確保 AUTH_MODE 設為 supabase
sed -i '' "s|AUTH_MODE=.*|AUTH_MODE=supabase|" .env.local

echo "✅ 環境變數已更新"

# 更新 TypeScript 類型
echo "🔧 更新 TypeScript 類型定義..."
cp src/lib/supabase/updated-types.ts src/lib/supabase/types.ts
echo "✅ TypeScript 類型已更新"

# 重新啟動開發伺服器
echo "🔄 重新啟動開發伺服器..."
pkill -f "next dev"
sleep 2

# 測試連線
echo "🧪 測試 Supabase 連線..."
npm run dev &
DEV_PID=$!

# 等待伺服器啟動
sleep 5

# 檢查連線 (如果有 curl)
if command -v curl &> /dev/null; then
    echo "Testing connection to $SUPABASE_URL..."
    if curl -s -I "$SUPABASE_URL" | head -n 1 | grep -q "200\|404"; then
        echo "✅ Supabase URL 可訪問"
    else
        echo "⚠️  無法訪問 Supabase URL，請確認 URL 是否正確"
    fi
fi

echo ""
echo "🎉 遷移完成！"
echo ""
echo "請執行以下步驟完成設置："
echo "1. 前往 Supabase SQL Editor"
echo "2. 執行 database/schema.sql"
echo "3. 執行 database/finance_schema.sql"
echo "4. 檢查開發伺服器是否正常運行在 http://localhost:3002"
echo ""
echo "如果需要回復，請執行："
echo "mv .env.local.backup .env.local"

# 保持開發伺服器運行
wait $DEV_PID