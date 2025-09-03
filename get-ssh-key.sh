#!/bin/bash

echo "=== 獲取正確的 SSH 公鑰 ==="
echo ""

# 檢查各種可能的 SSH key
if [ -f ~/.ssh/id_ed25519.pub ]; then
    echo "找到 ED25519 key："
    echo "---複製以下內容（完整一行）---"
    cat ~/.ssh/id_ed25519.pub
    echo "---複製以上內容---"
elif [ -f ~/.ssh/id_rsa.pub ]; then
    echo "找到 RSA key："
    echo "---複製以下內容（完整一行）---"
    cat ~/.ssh/id_rsa.pub
    echo "---複製以上內容---"
else
    echo "❌ 找不到 SSH 公鑰！"
    echo ""
    echo "請執行以下命令生成新的 SSH key："
    echo "ssh-keygen -t ed25519 -C \"your-email@example.com\""
fi

echo ""
echo "📋 複製提示："
echo "1. 用滑鼠選取從 'ssh-' 開頭到 email 結尾的整行"
echo "2. 按 Cmd+C 複製"
echo "3. 確保沒有多餘的空格或換行"
echo ""
echo "格式應該像這樣："
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB... your@email.com"
