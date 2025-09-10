#!/bin/bash

# Venturo Supabase 部署腳本
# 自動化執行資料庫 Schema 和管理員創建

set -e  # 遇到錯誤就停止

echo "🚀 開始 Venturo Supabase 部署流程..."
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查必要工具
echo -e "${BLUE}📋 檢查部署環境...${NC}"

# 檢查 .env.local 文件
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ 找不到 .env.local 文件${NC}"
    exit 1
fi

# 檢查環境變數
source .env.local
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Supabase 環境變數未設定${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 環境變數檢查完成${NC}"
echo "   Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# 步驟 1: 部署資料庫 Schema
echo -e "${YELLOW}📊 步驟 1: 部署 Supabase Schema${NC}"
echo "請在 Supabase Dashboard 中執行以下操作："
echo ""
echo "1. 開啟 Supabase Dashboard: https://supabase.com/dashboard/project/$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/.*\/\/\(.*\)\.supabase\.co/\1/')/"
echo "2. 點擊左側選單的 'SQL Editor'"
echo "3. 複製並執行 supabase_schema.sql 的內容"
echo ""
echo -e "${BLUE}按 Enter 繼續，當你完成 Schema 部署後...${NC}"
read -p ""

# 步驟 2: 創建管理員帳號
echo -e "${YELLOW}👤 步驟 2: 創建初始管理員帳號${NC}"
echo ""
echo "請提供管理員帳號資訊："
read -p "管理員 Email: " ADMIN_EMAIL
read -s -p "管理員密碼: " ADMIN_PASSWORD
echo ""
read -p "管理員姓名 (預設: System Administrator): " ADMIN_NAME
ADMIN_NAME=${ADMIN_NAME:-"System Administrator"}

echo ""
echo -e "${BLUE}正在創建管理員帳號...${NC}"

# 使用 curl 調用 Supabase API 創建用戶
ADMIN_USER_RESPONSE=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"real_name\": \"${ADMIN_NAME}\"
    }
  }")

# 檢查創建結果
if echo "$ADMIN_USER_RESPONSE" | grep -q '"id"'; then
    ADMIN_USER_ID=$(echo "$ADMIN_USER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ 管理員 Auth 用戶創建成功${NC}"
    echo "   User ID: $ADMIN_USER_ID"
    
    # 創建用戶資料
    echo -e "${BLUE}正在創建用戶資料...${NC}"
    
    PROFILE_RESPONSE=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_profiles" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/json" \
      -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Prefer: return=representation" \
      -d "{
        \"id\": \"${ADMIN_USER_ID}\",
        \"email\": \"${ADMIN_EMAIL}\",
        \"real_name\": \"${ADMIN_NAME}\",
        \"display_name\": \"${ADMIN_NAME}\",
        \"role\": \"SUPER_ADMIN\",
        \"permissions\": {
          \"users\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"todos\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true, \"packaging\": true},
          \"projects\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"calendar\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"finance\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"timebox\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"life-simulator\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"pixel-life\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"travel-pdf\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"themes\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"sync\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true},
          \"settings\": {\"read\": true, \"write\": true, \"delete\": true, \"admin\": true}
        }
      }")
    
    if echo "$PROFILE_RESPONSE" | grep -q '"id"'; then
        echo -e "${GREEN}✅ 管理員資料創建成功${NC}"
    else
        echo -e "${RED}❌ 管理員資料創建失敗${NC}"
        echo "Response: $PROFILE_RESPONSE"
        exit 1
    fi
else
    echo -e "${RED}❌ 管理員創建失敗${NC}"
    echo "Response: $ADMIN_USER_RESPONSE"
    exit 1
fi

# 步驟 3: 測試連線
echo ""
echo -e "${YELLOW}🔧 步驟 3: 測試系統連線${NC}"

echo -e "${BLUE}正在測試 Supabase 連線...${NC}"

# 測試資料庫連線
TEST_RESPONSE=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_profiles?select=id&limit=1" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}")

if echo "$TEST_RESPONSE" | grep -q '\['; then
    echo -e "${GREEN}✅ 資料庫連線正常${NC}"
else
    echo -e "${RED}❌ 資料庫連線失敗${NC}"
    echo "Response: $TEST_RESPONSE"
fi

# 步驟 4: 啟動本地開發伺服器
echo ""
echo -e "${YELLOW}🚀 步驟 4: 啟動開發伺服器${NC}"

echo -e "${BLUE}正在安裝相依套件...${NC}"
npm install

echo -e "${BLUE}正在啟動 Next.js 開發伺服器...${NC}"
echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "管理員帳號資訊："
echo "  Email: $ADMIN_EMAIL"
echo "  密碼: [已設定]"
echo "  角色: SUPER_ADMIN"
echo ""
echo "接下來請："
echo "1. 等待開發伺服器啟動"
echo "2. 開啟 http://localhost:3000"
echo "3. 使用管理員帳號登入"
echo "4. 前往 /dashboard/users 創建團隊成員帳號"
echo ""
echo -e "${BLUE}開發伺服器啟動中...${NC}"

# 啟動開發伺服器
npm run dev