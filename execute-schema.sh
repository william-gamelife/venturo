#!/bin/bash

# 簡化的 Schema 部署腳本
# 適用於已經有 Supabase 專案的情況

echo "🔧 Venturo Schema 部署工具"
echo ""

# 檢查環境
if [ ! -f ".env.local" ]; then
    echo "❌ 找不到 .env.local 文件"
    exit 1
fi

source .env.local

# 顯示 Supabase Dashboard 連結
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/.*\/\/\(.*\)\.supabase\.co/\1/')
DASHBOARD_URL="https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"

echo "📊 請在 Supabase Dashboard 中執行 SQL Schema："
echo ""
echo "1. 開啟 SQL Editor: $DASHBOARD_URL"
echo "2. 複製以下文件的內容並執行："
echo "   📄 supabase_schema.sql"
echo ""
echo "3. 執行完成後，回來運行完整部署腳本："
echo "   ./deploy-supabase.sh"
echo ""

# 自動開啟瀏覽器（如果是 macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 自動為你開啟 Supabase Dashboard..."
    open "$DASHBOARD_URL"
fi

echo ""
echo "💡 提示：執行 Schema 後，可以在 Database > Tables 中看到創建的表格"