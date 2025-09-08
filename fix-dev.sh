#!/bin/bash

echo "🔧 Venturo 開發環境修復工具"
echo "=============================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步驟 1: 停止可能運行的 Next.js 進程
echo -e "${YELLOW}步驟 1: 停止現有的 Next.js 進程...${NC}"
pkill -f "next dev" 2>/dev/null || true
sleep 1

# 步驟 2: 清理快取
echo -e "${YELLOW}步驟 2: 清理快取和建置檔案...${NC}"
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .swc 2>/dev/null || true

# 步驟 3: 檢查 node_modules
echo -e "${YELLOW}步驟 3: 檢查依賴套件...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${RED}找不到 node_modules，正在安裝依賴...${NC}"
    npm install
else
    echo -e "${GREEN}✓ node_modules 存在${NC}"
fi

# 步驟 4: 檢查必要檔案
echo -e "${YELLOW}步驟 4: 檢查必要檔案...${NC}"
if [ ! -f "src/app/layout.tsx" ]; then
    echo -e "${RED}✗ 找不到 layout.tsx${NC}"
    exit 1
else
    echo -e "${GREEN}✓ layout.tsx 存在${NC}"
fi

if [ ! -f "src/app/page.tsx" ]; then
    echo -e "${RED}✗ 找不到 page.tsx${NC}"
    exit 1
else
    echo -e "${GREEN}✓ page.tsx 存在${NC}"
fi

# 步驟 5: 檢查端口占用
echo -e "${YELLOW}步驟 5: 檢查端口 3000...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}端口 3000 被占用，嘗試關閉...${NC}"
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t) 2>/dev/null || true
    sleep 1
fi

# 步驟 6: 啟動開發伺服器
echo -e "${GREEN}步驟 6: 啟動開發伺服器...${NC}"
echo -e "${GREEN}=============================="
echo -e "🚀 Venturo 正在啟動..."
echo -e "📍 訪問 http://localhost:3000"
echo -e "=============================="
echo ""

# 啟動 Next.js
npm run dev
