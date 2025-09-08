# Venturo 最終實作指南

> Your Life, Your Adventure - 但不過度遊戲化的生活管理平台

## 設計理念

### 核心哲學：適度的遊戲化
Venturo 不是要把生活變成遊戲，而是借用遊戲的**激勵機制**來讓生活更有動力。我們理解：
- 用戶需要的是**真實的成就感**，不是虛擬的滿足
- 遊戲化是**手段**，提升生活品質才是**目的**
- 保持**專業與趣味的平衡**，不過度幼稚化

### 設計原則
1. **實用優先** - 功能性永遠優於娛樂性
2. **隱性遊戲化** - 機制存在但不突兀
3. **數據驅動** - 用數據說話，不是徽章
4. **現實連結** - 虛擬成就對應真實價值

## 系統現況盤點

### ✅ 已完成部分
- [x] 基礎框架（Next.js + TypeScript）
- [x] 認證系統（Supabase Auth）
- [x] 路由結構
- [x] 基本頁面框架

### 🚧 待完成部分

#### 第一優先：核心功能
- [ ] **待辦事項模組** - 缺少角落模式的快速建立功能
- [ ] **資料庫結構** - 需要設計完整的 Schema
- [ ] **API 路由** - 各模組的 CRUD 操作
- [ ] **狀態管理** - 實作 Zustand/Redux

#### 第二優先：角落模式
- [ ] **快速建立卡片** - 待辦事項的擴展介面
- [ ] **資料連動邏輯** - 待辦→專案/訂單/請款的關聯
- [ ] **權限系統** - 區分一般/角落/管理員

#### 第三優先：進階功能
- [ ] **PDF 生成** - 報價單、行程表輸出
- [ ] **經驗值系統** - 任務完成獎勵機制
- [ ] **儀表板小工具** - 可自訂的數據卡片

## 立即實作計畫（今日可完成）

### Step 1: 資料庫設計（2小時）
```sql
-- 核心資料表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT, -- 'admin' | 'corner' | 'user'
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  created_at TIMESTAMP
);

CREATE TABLE todos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  description TEXT,
  status TEXT, -- 'pending' | 'in_progress' | 'completed'
  priority TEXT, -- 'low' | 'medium' | 'high'
  type TEXT, -- 'task' | 'project' | 'invoice' | 'order'
  related_id UUID, -- 關聯到其他模組
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  description TEXT,
  status TEXT,
  created_at TIMESTAMP
);

-- 其他表格待補充...
```

### Step 2: API 基礎建設（2小時）
```typescript
// /app/api/todos/route.ts
export async function GET(request: Request) {
  // 獲取待辦事項列表
}

export async function POST(request: Request) {
  // 建立新待辦事項
  // 角落模式：判斷 type 並建立關聯
}

export async function PUT(request: Request) {
  // 更新待辦事項
}

export async function DELETE(request: Request) {
  // 刪除待辦事項
}
```

### Step 3: 前端整合（3小時）
1. 修正 `/dashboard/todos` 頁面
2. 實作基礎 CRUD 操作
3. 加入角落模式的條件顯示
4. 連接 Supabase

### Step 4: 快速測試（1小時）
- 建立測試帳號
- 測試基本流程
- 修正明顯 bug

## 明日計畫（Phase 2）

### Day 2: 角落模式擴展
- [ ] 快速建立卡片 UI
- [ ] 專案/訂單/請款模組基礎
- [ ] 資料連動邏輯

### Day 3: 使用體驗優化
- [ ] 載入狀態處理
- [ ] 錯誤提示
- [ ] 響應式設計調整

### Day 4: 經驗值系統
- [ ] 任務完成獎勵計算
- [ ] 等級提升機制
- [ ] 簡單的進度條顯示

### Day 5: 部署上線
- [ ] Vercel 部署設定
- [ ] 環境變數配置
- [ ] 基礎監控設置

## 技術債務管理

### 可延後處理
1. **完整的錯誤處理** - 先有基本功能
2. **單元測試** - MVP 後補充
3. **效能優化** - 有用戶後再說
4. **複雜動畫** - 不影響核心功能

### 絕不妥協
1. **資料安全** - 必須做好權限控制
2. **基本 UX** - 至少要能順暢使用
3. **資料備份** - Supabase 自動處理

## 關鍵決策點

### 1. 遊戲化程度
**決定**：輕度遊戲化
- ✅ 經驗值、等級（數字呈現）
- ✅ 任務完成提示（簡單動畫）
- ❌ 複雜的虛擬角色
- ❌ 過度的遊戲介面

### 2. 視覺風格
**決定**：專業但不無聊
- 主要使用卡片式設計
- 色彩適度活潑（不全是灰色）
- 圖標輔助理解（不過度可愛）

### 3. 功能優先級
**決定**：實用功能優先
1. 先完成工作相關（角落模式）
2. 再加入生活管理（財務、時間）
3. 最後才是趣味功能（像素人生）

## 實作檢查清單

### 今日必完成 ✅
- [ ] 建立 Supabase 專案
- [ ] 設計基礎資料表
- [ ] 實作 todos CRUD API
- [ ] 修正 todos 前端頁面
- [ ] 測試基本流程

### 明日啟動 📅
- [ ] 角落模式快速建立
- [ ] 權限系統實作
- [ ] 其他模組基礎框架

### 本週目標 🎯
- [ ] MVP 版本完成
- [ ] 內部測試開始
- [ ] 收集回饋意見

## 部署準備

### 環境變數
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=your_database_url
```

### Vercel 設定
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"], // 亞洲區域
  "functions": {
    "app/api/*": {
      "maxDuration": 10
    }
  }
}
```

## 成功標準

### MVP 成功指標
1. **功能完整性** - 基本 CRUD 可運作
2. **穩定性** - 無重大 bug
3. **可用性** - 內部員工能理解使用

### 不追求的
1. **完美** - 有缺陷可接受
2. **全功能** - 核心功能即可
3. **高流量** - 先服務內部用戶

## 風險與對策

| 風險 | 可能性 | 對策 |
|------|--------|------|
| 時間不足 | 高 | 削減功能範圍 |
| 技術卡關 | 中 | 使用現成方案 |
| 需求變更 | 中 | 保持架構彈性 |
| 效能問題 | 低 | 暫不優化 |

## 結語

Venturo 的核心是**讓生活更有條理**，遊戲化只是讓這個過程不那麼無聊的調味料。我們不是在做下一個 Pokemon GO，而是在做一個真正能幫助 CornerTravel 員工（以及未來更多用戶）管理生活的工具。

**記住**：
- 實用 > 有趣
- 簡單 > 複雜  
- 完成 > 完美

現在，讓我們開始建造這個務實但不無聊的生活管理平台。

---

*準備好了嗎？讓我們從建立資料庫開始！*

## 下一步行動

1. **立即執行**：打開 Supabase，建立專案
2. **複製 Schema**：使用上方的 SQL 建立資料表
3. **開始編碼**：從 todos API 開始

有問題隨時問我，我們一步步來完成這個專案！
