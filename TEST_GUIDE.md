# Venturo 測試指南

## 🚀 快速開始

你現在有三種方式可以快速測試 Venturo：

### 方式 1：測試帳號快速登入（推薦）
1. 啟動開發服務器：
   ```bash
   cd /Users/williamchien/Desktop/Venturo/Venturo
   npm run dev
   ```

2. 訪問登入頁面：http://localhost:3000/auth/signin

3. 點擊橘色的「🚀 測試帳號快速登入」按鈕
   - 系統會自動建立測試帳號並登入

### 方式 2：使用測試憑證
在登入頁面輸入：
- 帳號：`test`
- 密碼：`test`

### 方式 3：直接測試頁面
直接訪問：http://localhost:3000/auth/test-login
- 會自動建立並登入測試帳號

## 🔧 問題排查

### 如果登入仍然失敗：

1. **檢查 Supabase 連線**
   - 確認 `.env.local` 中的 Supabase URL 和 Key 正確
   - 在瀏覽器控制台（F12）查看錯誤訊息

2. **清除瀏覽器快取**
   - 強制重新整理：Cmd+Shift+R（Mac）或 Ctrl+Shift+R（Windows）

3. **檢查資料庫**
   - 登入 Supabase Dashboard
   - 確認 `profiles` 表存在
   - 確認 Row Level Security 已啟用

4. **查看控制台日誌**
   - 打開瀏覽器開發者工具（F12）
   - 查看 Console 標籤的錯誤訊息
   - 查看 Network 標籤的 API 請求

## 📝 測試帳號資訊

**自動建立的測試帳號：**
- Email: test@venturo.app
- Password: test123456
- Username: test_user
- 顯示名稱: 測試冒險者

## 🎮 功能測試清單

登入成功後，你可以測試以下功能：

1. **儀表板** - 查看整體數據
2. **任務管理** - 建立和管理待辦事項
3. **專案管理** - 建立專案和追蹤進度
4. **遊戲化系統** - 經驗值和等級系統
5. **角色切換** - 切換不同的顯示模式

## 🛠️ 開發模式特性

在開發模式下（NODE_ENV=development），你會看到：
- 測試登入按鈕
- 詳細的控制台日誌
- 錯誤詳情顯示

## 💡 提示

- 測試帳號的數據不會保存
- 每次使用測試登入都會使用相同的帳號
- 正式環境請移除測試登入功能

## 🆘 需要幫助？

如果還是無法登入，請檢查：
1. Terminal 中的錯誤訊息
2. 瀏覽器控制台的錯誤
3. Supabase Dashboard 的連線狀態

---

**準備好了嗎？** 執行 `npm run dev` 開始測試！
