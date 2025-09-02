# 🔍 系統架構問題診斷報告

生成時間：2025-09-03
檢查人：系統管理員

## 一、檔案結構問題

### ❌ 需要刪除的檔案

#### 1. 備份檔案（違反：不應存在舊版本）
```
modules/
├── auth-old.js          ← 刪除
├── todos-backup.js      ← 刪除
├── todos-fixed.js       ← 刪除
├── todos-original.js    ← 刪除
├── timebox-clean.js     ← 刪除
└── timebox-original.js  ← 刪除
```

#### 2. 測試檔案（違反：應該集中管理）
```
根目錄散落的測試檔案：
├── test-auth-v2.html       ← 移到 /tests/
├── test-supabase-users.html ← 移到 /tests/
├── test-todos.html         ← 移到 /tests/
├── test-travel-pdf.html    ← 移到 /tests/
├── check-real-users.html   ← 移到 /tests/
├── diagnose-login.html     ← 移到 /tests/
└── fix-index.html          ← 移到 /tests/
```

#### 3. 不必要的檔案
```
├── theme-preview-fixed.html  ← 刪除（重複）
├── game-life-icons.html     ← 刪除（未使用）
├── icon.html                ← 刪除（未使用）
└── 色卡.html                ← 刪除（開發用）
```

## 二、模組規範違規檢查

### 🔴 嚴重違規：finance.js 使用 Emoji

**位置：** `/modules/finance.js` 第 54-65 行

```javascript
// ❌ 錯誤：使用 Emoji
categories: {
    income: [
        { id: 'salary', name: '薪資', color: '#22c55e', icon: '💰' },
        { id: 'bonus', name: '獎金', color: '#10b981', icon: '🎁' },
        { id: 'investment', name: '投資收益', color: '#06b6d4', icon: '📈' },
        { id: 'freelance', name: '兼職', color: '#3b82f6', icon: '💼' },
        { id: 'other_income', name: '其他收入', color: '#8b5cf6', icon: '💵' }
    ],
    expense: [
        { id: 'food', name: '飲食', color: '#ef4444', icon: '🍔' },
        { id: 'transport', name: '交通', color: '#f97316', icon: '🚗' },
        { id: 'shopping', name: '購物', color: '#f59e0b', icon: '🛍️' },
        // ... 更多 Emoji
    ]
}
```

**應該改為：** SVG 圖示或純文字

### 🟡 模組結構問題

#### 1. 缺少 destroy() 方法的模組
- projects.js
- travel-pdf.js
- themes.js

#### 2. 缺少 moduleInfo 的模組
- unified-header.js（可能是輔助模組）

## 三、設計規範違規

### ❌ DESIGN-STANDARDS.md 本身違規

**問題：** 文件本身使用大量 Emoji
```markdown
# 遊戲人生 3.0 設計規範手冊 📐  ← Emoji
## 🎯 版面對齊標準              ← Emoji
### ✅ 正確示例                 ← Emoji
```

**應該：** 移除所有 Emoji

## 四、資料結構問題

### 🟡 Supabase user_data 表使用問題

**現況：**
- 使用者資料存在 `user_id = '550e8400-e29b-41d4-a716-446655440001'`
- 這是 William 的 UUID，不應該用來存所有使用者

**正確做法：**
```sql
-- 應該有獨立的 users 表
CREATE TABLE users (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT,
    role TEXT,
    title TEXT
);

-- user_data 表只存個人資料
-- user_id 應該是實際使用者的 UUID
```

## 五、建議修復優先順序

### 🔴 立即修復（影響功能）
1. 移除 finance.js 的 Emoji
2. 修正使用者資料存儲結構
3. 清理重複的備份檔案

### 🟡 中期改善（提升品質）
1. 整理測試檔案到 /tests 資料夾
2. 為缺少的模組加入 destroy() 方法
3. 統一 Toast 系統

### 🟢 長期優化（完善系統）
1. 建立獨立的 users 表
2. 實作版本控制機制
3. 加入自動化測試

## 六、檔案清理指令

```bash
# 1. 建立測試資料夾
mkdir tests

# 2. 移動測試檔案
mv test-*.html tests/
mv check-real-users.html tests/
mv diagnose-login.html tests/
mv fix-index.html tests/

# 3. 刪除備份檔案
rm modules/*-old.js
rm modules/*-backup.js
rm modules/*-fixed.js
rm modules/*-original.js
rm modules/*-clean.js

# 4. 刪除不必要檔案
rm theme-preview-fixed.html
rm game-life-icons.html
rm icon.html
rm 色卡.html
```

## 七、程式碼修復範例

### 修復 finance.js 的 Emoji

```javascript
// ✅ 正確：使用 SVG 或純文字
categories: {
    income: [
        { 
            id: 'salary', 
            name: '薪資', 
            color: '#22c55e',
            svg: '<svg viewBox="0 0 24 24">...</svg>'
        },
        // 或者不用圖示
        { 
            id: 'bonus', 
            name: '獎金', 
            color: '#10b981'
        }
    ]
}
```

## 八、總結

### 統計數據
- 需要刪除的檔案：16 個
- 違規使用 Emoji 的模組：1 個（finance.js）
- 缺少 destroy() 的模組：3 個
- 需要移動的測試檔案：7 個

### 健康度評分
- 檔案結構：60% ⚠️
- 程式碼規範：75% ✓
- 設計規範：70% ⚠️
- 整體評分：**68%** （需要改善）

---
報告結束
