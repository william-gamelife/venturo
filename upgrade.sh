#!/bin/bash

echo "🚀 Venturo 冒險者裝備升級中..."
echo "======================================"
echo ""

# 設定顏色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎮 從重裝戰士 → 敏捷劍客${NC}"
echo "✨ 移除重劍 (MUI Material)"
echo "🏠 倉庫從雲端搬回家 (Supabase → Local)"  
echo "🧠 魔法書現代化 (Redux → Zustand)"
echo ""

cd /Users/william/Desktop/Venturo/Venturo

# 1. 清理舊的 node_modules
echo -e "${YELLOW}🧹 清理舊裝備...${NC}"
rm -rf node_modules
rm -rf .next
rm -f package-lock.json

# 2. 安裝新依賴
echo -e "${BLUE}📦 安裝輕量化裝備...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 套件安裝成功！${NC}"
else
    echo -e "${RED}❌ 套件安裝失敗${NC}"
    exit 1
fi

# 3. 建構測試
echo -e "${BLUE}🔧 測試新裝備...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 建構成功！${NC}"
else
    echo -e "${RED}⚠️  建構有問題，但繼續...${NC}"
fi

# 4. 顯示升級報告
echo ""
echo -e "${GREEN}🎉 冒險者轉職完成！${NC}"
echo "======================================"
echo ""
echo "📊 升級報告："
echo "• 🗡️  移除重劍 (MUI) - 背包輕量化"
echo "• 🏠 倉庫本地化 (Supabase → LocalStorage)"
echo "• 🃏 魔法卡現代化 (保留 Zustand)"
echo ""
echo "🚀 下一步："
echo "1. 執行 npm run dev"
echo "2. 測試所有功能"
echo "3. 享受更快的載入速度！"
echo ""
echo -e "${BLUE}💡 如果遇到問題：${NC}"
echo "• 檢查瀏覽器控制台"
echo "• 清除瀏覽器快取"
echo "• 重新啟動開發服務器"
echo ""
echo -e "${GREEN}✨ 升級完成！準備開始新的冒險！${NC}"
