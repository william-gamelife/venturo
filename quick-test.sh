#!/bin/bash

echo "🚀 Venturo 快速測試設定"
echo "========================"
echo ""
echo "此腳本將幫助你快速設定測試環境"
echo ""

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：需要安裝 Node.js"
    echo "請訪問 https://nodejs.org 下載安裝"
    exit 1
fi

# 檢查 npm 是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤：需要安裝 npm"
    exit 1
fi

echo "✅ 環境檢查通過"
echo ""

# 安裝依賴（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安裝依賴..."
    npm install
fi

echo ""
echo "🔧 測試登入方式："
echo "=================="
echo ""
echo "方式 1：測試帳號快速登入"
echo "------------------------"
echo "1. 啟動開發服務器：npm run dev"
echo "2. 訪問：http://localhost:3000/auth/signin"
echo "3. 點擊橘色的「🚀 測試帳號快速登入」按鈕"
echo ""
echo "方式 2：使用測試憑證"
echo "--------------------"
echo "1. 在登入頁面輸入："
echo "   帳號：test"
echo "   密碼：test"
echo ""
echo "方式 3：直接測試頁面"
echo "--------------------"
echo "訪問：http://localhost:3000/auth/test-login"
echo "（會自動建立並登入測試帳號）"
echo ""
echo "=================="
echo ""

# 詢問是否立即啟動
read -p "是否立即啟動開發服務器？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 啟動 Venturo..."
    npm run dev
else
    echo "稍後可使用 'npm run dev' 啟動服務器"
fi
