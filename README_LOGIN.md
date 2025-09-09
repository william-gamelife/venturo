# Venturo 登入系統說明

## 🎯 目前登入模式

專案目前使用**角色選擇登入模式**（開發測試版）

### 訪問方式
- **主要入口**：http://localhost:3000/
- 選擇角色 → 點擊「立即登入」即可進入系統

### 預設角色
1. **管理者** 👨‍💼
   - 角色 ID：admin-001
   - 權限：SUPER_ADMIN（所有系統權限）
   
2. **好朋友** 🧑‍🎨
   - 角色 ID：friend-001
   - 權限：GENERAL_USER（一般使用者）

### 自訂角色
- 點擊「建立新角色」卡片
- 設定頭像、暱稱、角色類型
- 建立後即可使用

## 🔧 技術實現

### 開發模式運作原理
1. 選擇角色後，系統會在 localStorage 設定：
   - `dev_mode`: "true"
   - `dev_user`: 包含角色資訊的 JSON 物件
   
2. 儀表板會檢查開發模式標記，直接使用儲存的角色資訊

3. 無需 Supabase 認證，適合快速開發測試

### 檔案結構
```
/src/app/
├── page.tsx              # 角色選擇頁面（主入口）
├── dashboard/            # 儀表板
│   └── page.tsx         # 支援開發模式
└── auth_backup/         # 已備份的舊登入頁面
    ├── signin/
    ├── signup/
    └── test-login/
```

## 📝 注意事項

1. **這是開發測試版本**
   - 無密碼驗證
   - 資料存在 localStorage
   - 不適合生產環境

2. **舊登入頁面已備份**
   - 位置：`/src/app/auth_backup/`
   - 如需恢復：將 `auth_backup` 改名為 `auth`

3. **Supabase 設定**
   - 如需使用 Supabase，請到 Dashboard 關閉郵件驗證
   - 環境變數已設定在 `.env.local`

## 🚀 快速開始

1. 啟動開發伺服器
```bash
npm run dev
```

2. 訪問 http://localhost:3000/

3. 選擇角色並登入

## 💡 提示

- 角色資訊會保存，下次可快速選擇
- 最後使用的角色會被記住
- 可建立多個自訂角色切換使用
