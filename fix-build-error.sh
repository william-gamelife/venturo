#!/bin/bash

echo "🔧 修復 Venturo 建置錯誤..."
echo ""

# 停止所有 Next.js 進程
echo "1. 停止 Next.js 進程..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

# 清理 Next.js 快取
echo "2. 清理 Next.js 快取..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# 清理其他快取
echo "3. 清理其他快取..."
rm -rf .swc 2>/dev/null || true
rm -f tsconfig.tsbuildinfo 2>/dev/null || true

# 確認檔案已刪除
echo "4. 確認已刪除的檔案..."
echo "   GameDebugGrid.tsx: $([ -f src/components/GameDebugGrid.tsx ] && echo '❌ 還存在' || echo '✅ 已刪除')"
echo "   PreviewBanner.tsx: $([ -f src/components/PreviewBanner.tsx ] && echo '❌ 還存在' || echo '✅ 已刪除')"
echo "   demo 資料夾: $([ -d src/app/demo ] && echo '❌ 還存在' || echo '✅ 已刪除')"

echo ""
echo "5. 重新啟動開發伺服器..."
echo "===================="
echo "🚀 Venturo 正在重新啟動..."
echo ""

# 重新啟動
npm run dev
