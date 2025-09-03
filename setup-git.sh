#!/bin/bash

# 顏色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 兩台電腦 Git 設定指南 ===${NC}\n"

# 檢查當前用戶
CURRENT_USER=$(whoami)
echo -e "${YELLOW}當前用戶：${NC}$CURRENT_USER"

# 檢查 SSH key 是否存在
echo -e "\n${YELLOW}檢查 SSH Key...${NC}"
if [ -f ~/.ssh/id_ed25519.pub ]; then
    echo -e "${GREEN}✓ SSH Key 已存在${NC}"
    echo "Public Key:"
    cat ~/.ssh/id_ed25519.pub
else
    echo -e "${RED}✗ SSH Key 不存在${NC}"
    echo -e "${YELLOW}建議執行：${NC}"
    echo "ssh-keygen -t ed25519 -C \"your-email@example.com\""
    echo "然後將公鑰加入 GitHub：Settings → SSH and GPG keys"
fi

# 檢查 Git 全域設定
echo -e "\n${YELLOW}Git 全域設定：${NC}"
USER_NAME=$(git config --global user.name)
USER_EMAIL=$(git config --global user.email)

if [ -z "$USER_NAME" ]; then
    echo -e "${RED}✗ 未設定 user.name${NC}"
    echo "建議執行：git config --global user.name \"你的名字\""
else
    echo -e "${GREEN}✓ user.name: $USER_NAME${NC}"
fi

if [ -z "$USER_EMAIL" ]; then
    echo -e "${RED}✗ 未設定 user.email${NC}"
    echo "建議執行：git config --global user.email \"your-email@example.com\""
else
    echo -e "${GREEN}✓ user.email: $USER_EMAIL${NC}"
fi

# 測試 GitHub SSH 連線
echo -e "\n${YELLOW}測試 GitHub SSH 連線...${NC}"
ssh -T git@github.com 2>&1 | while IFS= read -r line; do
    if [[ $line == *"successfully authenticated"* ]]; then
        echo -e "${GREEN}✓ SSH 認證成功！${NC}"
    else
        echo "$line"
    fi
done

# 檢查專案狀態
echo -e "\n${YELLOW}專案狀態：${NC}"
cd /Users/williamchien/Desktop/FINAL-gamrlife/WEB
git status --short

# 顯示建議
echo -e "\n${GREEN}=== 建議設定 ===${NC}"
echo "1. 如果這是 williamchien 的電腦，設定："
echo "   git config --global user.name \"William Chien\""
echo "   git config --global user.email \"你的email\""
echo ""
echo "2. 確保兩台電腦都有各自的 SSH key"
echo "3. 兩台電腦的 SSH key 都要加到 GitHub"
echo ""
echo "4. 使用相同的 repository，這樣兩台電腦都能推送"
