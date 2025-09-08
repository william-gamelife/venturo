#!/bin/bash

echo "🔍 Venturo 診斷工具"
echo "==================="
echo ""

# 檢查當前目錄
echo "📁 當前目錄："
pwd
echo ""

# 檢查 Node 版本
echo "📦 Node.js 版本："
node --version
echo ""

# 檢查 npm 版本
echo "📦 npm 版本："
npm --version
echo ""

# 檢查 package.json 是否存在
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
else
    echo "❌ package.json 不存在"
    exit 1
fi
echo ""

# 檢查 node_modules
if [ -d "node_modules" ]; then
    echo "✅ node_modules 已安裝"
else
    echo "⚠️ node_modules 未安裝"
    echo "執行: npm install"
    npm install
fi
echo ""

# 檢查 .env.local
if [ -f ".env.local" ]; then
    echo "✅ .env.local 存在"
    echo "Supabase URL 設定："
    grep "NEXT_PUBLIC_SUPABASE_URL" .env.local
else
    echo "❌ .env.local 不存在"
fi
echo ""

# 檢查端口
echo "🔍 檢查 3000 端口..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ 端口 3000 已被佔用"
    echo "佔用的程序："
    lsof -i :3000
    echo ""
    echo "要關閉它嗎？(y/n)"
    read -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill -9 $(lsof -t -i:3000)
        echo "✅ 已關閉佔用端口的程序"
    fi
else
    echo "✅ 端口 3000 可用"
fi
echo ""

# 嘗試啟動
echo "🚀 嘗試啟動 Venturo..."
echo "==================="
echo ""
echo "執行: npm run dev"
echo ""
echo "如果啟動成功，你會看到："
echo "  ▲ Next.js"
echo "  - Local: http://localhost:3000"
echo ""
echo "然後訪問: http://localhost:3000/auth/signin"
echo "點擊橘色的「測試帳號快速登入」按鈕"
echo ""
echo "==================="
echo ""

npm run dev
