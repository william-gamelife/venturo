#!/bin/bash
echo "=== 測試 SSH 連線到 GitHub ==="
ssh -T git@github.com

echo -e "\n=== 檢查 Git 設定 ==="
git config --list | grep -E "user|credential"

echo -e "\n=== 檢查遠端設定 ==="
git remote -v

echo -e "\n=== 檢查本地狀態 ==="
git status

echo -e "\n=== 嘗試推送 ==="
git push origin main
