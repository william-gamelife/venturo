# 🔧 Venturo 管理員初始化指南

## 📋 系統部署步驟

### Step 1: 執行 Supabase Schema
在 Supabase Dashboard 的 SQL Editor 中執行 `supabase_schema.sql`：

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的 Venturo 專案
3. 點擊左側選單的 "SQL Editor"
4. 複製 `supabase_schema.sql` 的內容並執行
5. 確認所有表格和政策都已成功創建

### Step 2: 創建初始管理員帳號
在 Supabase Dashboard 中手動創建第一個管理員：

#### 2.1 創建 Auth 用戶
```sql
-- 在 SQL Editor 中執行（使用你的實際 email 和密碼）
-- 注意：這個操作需要 service_role 權限
```

或者在 Authentication 頁面：
1. 點擊 "Authentication" → "Users"
2. 點擊 "Add user" 
3. 輸入管理員 Email（例如：admin@yourcompany.com）
4. 設定密碼
5. 確認創建

#### 2.2 創建用戶資料
複製創建的用戶 ID，然後執行：

```sql
-- 將 'USER_ID_HERE' 替換為實際的用戶 ID
INSERT INTO user_profiles (id, email, real_name, display_name, role, permissions, created_at, updated_at)
VALUES (
  'USER_ID_HERE'::uuid,
  'admin@yourcompany.com',
  'System Administrator', 
  'System Administrator',
  'SUPER_ADMIN',
  '{
    "users": {"read": true, "write": true, "delete": true, "admin": true},
    "todos": {"read": true, "write": true, "delete": true, "admin": true, "packaging": true},
    "projects": {"read": true, "write": true, "delete": true, "admin": true},
    "calendar": {"read": true, "write": true, "delete": true, "admin": true},
    "finance": {"read": true, "write": true, "delete": true, "admin": true},
    "timebox": {"read": true, "write": true, "delete": true, "admin": true},
    "life-simulator": {"read": true, "write": true, "delete": true, "admin": true},
    "pixel-life": {"read": true, "write": true, "delete": true, "admin": true},
    "travel-pdf": {"read": true, "write": true, "delete": true, "admin": true},
    "themes": {"read": true, "write": true, "delete": true, "admin": true},
    "sync": {"read": true, "write": true, "delete": true, "admin": true},
    "settings": {"read": true, "write": true, "delete": true, "admin": true}
  }'::jsonb,
  NOW(),
  NOW()
);
```

### Step 3: 測試管理員登入
1. 使用創建的管理員 email 和密碼登入系統
2. 確認可以進入 Dashboard
3. 檢查 `/dashboard/users` 頁面是否可訪問

### Step 4: 創建團隊成員帳號
登入後，進入 `/dashboard/users` 頁面：

1. 點擊 "新增使用者"
2. 填寫用戶資料：
   - **使用者名稱**：員工的 email
   - **顯示名稱**：員工真實姓名
   - **職稱**：選填
   - **角色**：選擇適當權限
     - `GENERAL_USER`：一般員工
     - `BUSINESS_ADMIN`：業務主管
     - `CORNER_EMPLOYEE`：角落員工（特殊模式）
   - **密碼**：系統預設 `pass1234`

3. 建議首次登入後要求員工修改密碼

## 🔐 角色權限說明

### SUPER_ADMIN (超級管理員)
- ✅ 所有功能完整權限
- ✅ 用戶管理
- ✅ 系統設定

### BUSINESS_ADMIN (業務主管)
- ✅ 待辦事項（含打包）
- ✅ 專案管理
- ✅ 行事曆
- ✅ 財務管理
- ✅ 時間管理
- ❌ 用戶管理

### GENERAL_USER (一般用戶)
- ✅ 基本待辦事項
- ✅ 行事曆
- ✅ 時間管理
- ✅ 人生模擬器（只讀）
- ❌ 專案管理
- ❌ 財務管理

### CORNER_EMPLOYEE (角落員工)
- ✅ 待辦事項（含打包）
- ✅ 行事曆
- ✅ 旅行 PDF
- ✅ 角落模式特殊功能
- ❌ 其他模組

## 🚨 安全注意事項

1. **密碼政策**：
   - 預設密碼：`pass1234`
   - 要求首次登入修改密碼
   - 建議使用強密碼

2. **權限管理**：
   - 定期檢查用戶權限
   - 及時移除離職員工帳號
   - 管理員帳號不要共用

3. **資料安全**：
   - 定期備份資料
   - 監控系統使用情況
   - 保護 Supabase 憑證

## 🛠️ 故障排除

### 登入問題
- 檢查 Supabase 連線狀態
- 確認 user_profiles 表格有對應資料
- 檢查 RLS 政策是否正確

### 權限問題
- 確認用戶角色設定正確
- 檢查 permissions 欄位內容
- 重新登入刷新權限

### 用戶管理問題
- 確認當前用戶是 SUPER_ADMIN
- 檢查 Supabase Auth 和 user_profiles 資料一致性

## 📞 技術支援

如需技術協助，請提供：
1. 錯誤訊息截圖
2. 瀏覽器控制台錯誤
3. 操作步驟描述
4. 使用環境資訊

---

**部署完成後**，系統將以管理員統一管理模式運行，所有新帳號都需要由管理員建立！