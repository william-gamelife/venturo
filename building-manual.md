
# 🏢 角落大樓營運規範手冊

## 一、大樓架構總覽

### 建築結構
```
地上建築：
├── index.html (大樓入口 - 員工選擇與密碼驗證)
├── dashboard.html (電梯大廳 - 選擇樓層)
├── modules/ (各樓層店家)
│   ├── auth.js (門禁系統 - 驗證身分)
│   ├── todos.js (圖書館 - 待辦事項)
│   ├── users.js (戶政事務所 - 管理身分證)
│   ├── settings.js (管理室 - 系統設定)
│   └── sync.js (管委會 - 資料運送)
└── README.md (招商公告)

地下設施：
└── Supabase (地下倉庫 - 資料儲存)
    ├── users 表 (身分證資料庫)
    └── user_data 表 (各店家貨物儲存區)
```

### 📦 大樓譬喻
```
想像一棟智慧大樓：
- 大門有臉部辨識（密碼驗證）
- 電梯會記住你常去的樓層（URL hash）
- 每層樓有不同店家（模組）
- 地下有超大倉庫（Supabase）
- 管委會負責搬貨（sync.js）
```

### 人員編制與職責對照
| 系統元件 | 大樓角色 | 實際功能 |
|---------|---------|---------|
| auth.js | 門禁警衛 | 檢查密碼、發放通行證 |
| sync.js | 管委會 | 倉庫存取、貨物運送 |
| users.js | 戶政事務所 | 管理住戶資料 |
| UUID | 身分證 | 唯一識別碼 |
| sessionStorage | 臨時通行證 | 當日有效、關閉即失效 |

## 二、住戶使用流程

### 桌面版流程
1. **進入大樓** (index.html)
   - 看到所有員工卡片（動態從 Supabase 讀取）
   - 選擇自己的卡片
   - 輸入密碼驗證
   - 取得 UUID 身分證（存在 sessionStorage）

2. **搭電梯** (dashboard.html)
   - 檢查 UUID 身分證
   - 電梯大廳顯示可用樓層
   - 選擇要去的樓層（店家）

3. **使用服務**
   - 每個店家提供獨立服務
   - UUID 識別使用者身分
   - 資料自動存到個人倉庫區

### 手機版流程
1. **底部導航** - 樓層切換在螢幕底部
2. **滑動切換** - 左右滑動切換樓層群組
3. **觸控優化** - 按鈕放大，間距加寬

### 📦 使用流程譬喻
```
桌面版 = 搭電梯
- 側邊有樓層按鈕
- 按了就到

手機版 = 手扶梯
- 底部選擇樓層
- 像百貨公司APP
- 滑動看更多選項
```

## 三、店家入駐規範

### 檔案結構要求
```javascript
// 檔案位置：modules/店家名稱.js
// 命名規則：全小寫英文，無空格

// 必須使用 ES6 模組
export { ModuleName };
```

### 店家招牌詳細說明 (moduleInfo)

#### 必填欄位
| 欄位 | 類型 | 說明 | 範例 |
|------|------|------|------|
| name | string | 模組中文名稱 | '待辦事項' |
| subtitle | string | 簡短功能說明 | '智慧任務管理與專案追蹤' |
| icon | string | SVG 圖示程式碼 | '<svg>...</svg>' |

#### 選用欄位
| 欄位 | 類型 | 說明 | 範例 |
|------|------|------|------|
| description | string | 詳細功能說明，會在副標題下方顯示 | '支援四欄位看板管理、專案分組...' |
| version | string | 版本號 | '1.0.0' |
| author | string | 開發者 | 'william' |
| themeSupport | boolean | 是否支援主題切換 | true |
| mobileSupport | boolean | 是否支援手機版 | true |

#### description 使用指南
- **何時使用**：當模組功能複雜，需要更詳細說明時
- **建議長度**：50-150 字
- **內容建議**：
  - 列出主要功能特色
  - 說明適用場景
  - 強調獨特優勢
- **顯示效果**：
  - 字體較小 (0.85rem)
  - 淺色顯示 (--text-muted)
  - 出現在副標題下方

#### 完整範例
```javascript
static moduleInfo = {
  name: '待辦事項',
  subtitle: '智慧任務管理與專案追蹤',
  description: '支援四欄位看板管理、專案分組、批量操作及智慧篩選功能。專為旅行社業務流程設計，整合報價、行程、簡報等工作標籤。',
  icon: '<svg>...</svg>',
  version: '2.0.0',
  author: 'william',
  themeSupport: true,
  mobileSupport: true
};
```

### 程式碼架構規範
```javascript
class 店家名稱Module {
  // 靜態資訊（必填）- 店家招牌
  static moduleInfo = {
    name: '中文名稱',        // 顯示名稱
    subtitle: '功能說明',    // 副標題
    description: '詳細功能說明', // 選用 - 詳細說明，會在副標題下方顯示
    icon: '<svg>...</svg>',  // SVG 圖示（禁用 Emoji）
    version: '1.0.0',        // 版本號
    author: 'william',       // 開發者
    themeSupport: true,      // 是否支援主題
    mobileSupport: true      // 是否支援手機
  };

  constructor() {
    // 不需要參數
    this.syncManager = null;
    this.currentUser = null;
  }
  
  async render(uuid) {
    // 必須實作 - 接收 UUID 參數
    
    // 動態載入管委會
    const syncModule = await import('./sync.js');
    this.syncManager = new syncModule.SyncManager();
    
    // 載入個人資料
    await this.loadData(uuid);
    
    // 渲染介面
    const moduleContainer = document.getElementById('moduleContainer');
    moduleContainer.innerHTML = this.getHTML();
    
    // 綁定事件
    this.bindEvents();
  }
  
  // 互動方法（按鈕需要）
  showAddDialog() {
    // 新增功能 - 必須實作
  }
  
  // 清理方法（切換模組時呼叫）
  destroy() {
    // 關燈 - 移除事件監聽
    // 關冷氣 - 清理計時器
    // 鎖門 - 釋放資源
  }
}
```

### 📦 店家規範譬喻
```
開店必備：
- 招牌（moduleInfo）- 讓人知道你是誰
  - name: 店名
  - subtitle: 簡短介紹
  - description: 詳細說明（選用，可讓客人更了解服務）
- 開門（render）- 客人能進來
- 收銀（showAddDialog）- 基本服務
- 打烊（destroy）- 關店程序

就像租百貨公司櫃位：
- 要有統一招牌格式
- 營業時間要配合
- 打烊要關燈關冷氣
- 不能用大聲公（alert）
```

## 四、倉庫管理規則 (Supabase)

### 倉庫結構
```sql
-- user_data 表結構
CREATE TABLE user_data (
  id BIGSERIAL PRIMARY KEY,          -- 貨物編號
  user_id UUID NOT NULL,             -- 誰的貨物
  module TEXT NOT NULL,              -- 哪個店家
  data JSONB NOT NULL,               -- 貨物內容
  created_at TIMESTAMPTZ,            -- 入庫時間
  updated_at TIMESTAMPTZ,            -- 更新時間
  
  -- 選用欄位（特殊服務）
  version INTEGER DEFAULT 1,         -- 版本號
  tags TEXT[],                       -- 快速分類標籤
  priority INTEGER,                  -- 優先級
  expires_at TIMESTAMPTZ,            -- 過期時間
  shared_with UUID[],                -- 可分享對象
  project_id TEXT,                   -- 專案群組
  metadata JSONB,                    -- 額外資料
  
  -- 唯一約束（重要！）
  CONSTRAINT user_data_unique UNIQUE (user_id, module)
);
```

### 📦 倉庫譬喻
```
地下倉庫規則：
- 每人每店只有一個儲物格（唯一約束）
- 貨物要貼標籤（user_id + module）
- 箱子可大可小（JSONB 彈性）
- 管委會只管搬運，不管內容

特殊服務（選用）：
- 版本控制 = 保留歷史貨物
- 標籤系統 = 快速找貨
- 過期管理 = 自動清理
- 分享功能 = 授權他人取貨
```

### 存取規則與範例

| 欄位 | 用途 | 使用情境 | 譬喻 |
|------|------|---------|------|
| version | 版本控制 | 文件編輯歷史 | 像 Git 版本 |
| tags[] | 快速篩選 | 分類待辦事項 | 像貨物標籤 |
| priority | 排序顯示 | 重要性排序 | 像快遞急件 |
| expires_at | 過期管理 | 臨時資料 | 像生鮮食品 |
| shared_with[] | 分享控制 | 協作專案 | 像共用保險箱 |
| project_id | 專案群組 | 團隊任務 | 像專案資料夾 |

## 五、同步機制規範

### 管委會職責 (sync.js)
```javascript
class SyncManager {
  // 必須連接 Supabase
  constructor() {
    this.supabase = window.supabase.createClient(URL, KEY);
  }
  
  // 核心功能
  async save(uuid, module, data) {
    // 1. 存到 Supabase（主要）
    // 2. 存到 localStorage（快取）
  }
  
  async load(uuid, module) {
    // 1. 從 Supabase 讀取（主要）
    // 2. 失敗時從 localStorage（備用）
  }
}
```

### 同步流程
```
正常流程：
寫入：店家 → 管委會 → Supabase + localStorage
讀取：店家 ← 管委會 ← Supabase（優先）

異常處理：
斷網：存 localStorage → 標記待同步 → 網路恢復後上傳
錯誤：顯示 Toast 提示 → 記錄錯誤 → 提供重試
```

### 📦 同步機制譬喻
```
管委會送貨系統：
正常：直接送到地下倉庫
斷網：先放大樓儲藏室
錯誤：通知店家重新打包

像便利商店物流：
- 正常：貨車直送總倉
- 塞車：先放轉運站
- 損壞：通知補貨
```

## 六、驗證與安全

### 門禁系統 (auth.js)
```javascript
// 登入驗證流程
1. 使用者選擇身分 → 輸入密碼
2. 查詢 Supabase users 表
3. 驗證成功 → 發放 UUID（sessionStorage）
4. 驗證失敗 → 顯示錯誤

// 安全原則
- 密碼永不存儲（只做驗證）
- UUID 只存 sessionStorage（關閉即清除）
- 每個頁面都要檢查登入狀態
```

### 📦 安全譬喻
```
三種通行證比較：

localStorage = 永久居留證
- 永遠有效（危險）
- 可能被偷用

sessionStorage = 一日通行證  
- 當日有效（安全）
- 離開就失效

記憶體 = 臨時訪客證
- 立即有效
- 轉身就沒了
```

### 權限控制層級

| 角色 | 權限 | 可進入樓層 | 大樓譬喻 |
|------|------|-----------|---------|
| admin | 最高 | 所有樓層 | 持有萬能鑰匙 |
| user | 標準 | 開放樓層 | 一般住戶 |
| guest | 訪客 | 大廳only | 訪客證 |

## 七、介面設計規範

### 禁止事項 ❌
1. **禁用 Emoji** - 保持專業質感
2. **禁用 alert()** - 使用自訂提示
3. **禁用過度動畫** - 簡潔優雅

### 📦 設計規範譬喻
```
像高級百貨 vs 夜市：

禁止（夜市風）：
- 🎉 Emoji 滿天飛 = 霓虹燈亂閃
- alert() = 大聲公叫賣
- 狂閃動畫 = 招牌亂轉

要求（百貨風）：
- 簡潔文字 = 優雅標示
- Toast 提示 = 輕柔廣播
- 平滑過渡 = 手扶梯順暢
```

### 必要支援 ✅

**響應式設計**
```css
/* 桌面版 */
@media (min-width: 769px) {
  .sidebar { display: block; }  /* 側邊電梯 */
}

/* 手機版 */
@media (max-width: 768px) {
  .sidebar { display: none; }        /* 隱藏側邊 */
  .mobile-bottom-nav { display: flex; } /* 底部導航 */
}
```

### 色彩系統
```css
:root {
  /* 原木風（預設）- 像 MUJI */
  --bg: #e8e5e0;
  --primary: #8b7355;
  
  /* 夜間模式 - 像深夜的大樓 */
  --dark-bg: #1a1a1a;
  --dark-primary: #d4af37;
  
  /* 海洋藍 - 像海邊度假村 */
  --ocean-bg: #e0f2fe;
  --ocean-primary: #0369a1;
}
```

## 八、錯誤處理規範

### 統一錯誤提示
```javascript
// ❌ 錯誤：使用 alert
alert('錯誤訊息');

// ✅ 正確：使用 Toast
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}
```

### 📦 錯誤處理譬喻
```
錯誤分級像醫院：

致命錯誤 = 急診（紅色）
- 系統崩潰
- 立即處理

一般錯誤 = 門診（黃色）
- 功能異常
- 可以重試

提示訊息 = 健檢（藍色）
- 操作成功
- 純粹通知
```

### 錯誤分級處理

| 等級 | 顏色 | 處理方式 | 範例 |
|------|------|---------|------|
| 致命 | 紅色 | 返回登入頁 | 登入失效 |
| 一般 | 黃色 | 顯示重試按鈕 | 網路錯誤 |
| 提示 | 藍色 | 3秒後消失 | 儲存成功 |

## 九、效能優化規範

### 載入優化
```javascript
// ❌ 全部載入（慢）
import * as allModules from './modules';

// ✅ 動態載入（快）
const module = await import('./modules/todos.js');
```

### 📦 效能優化譬喻
```
載入策略像餐廳：

全部載入 = 自助餐
- 所有菜都準備好（浪費）
- 客人不一定都吃

動態載入 = 點餐
- 點什麼做什麼（效率）
- 不浪費資源

懶載入 = 外送
- 需要時才送來
- 圖片捲動到才載入
```

### 快取策略

| 策略 | 用途 | 時機 | 譬喻 |
|------|------|------|------|
| localStorage 快取 | 離線可用 | 網路斷線 | 冰箱存糧 |
| sessionStorage | 臨時資料 | 當次使用 | 購物車 |
| 記憶體快取 | 頻繁存取 | 即時資料 | CPU 快取 |

## 十、測試檢查清單

### 新店家上架前檢查
- [ ] 無 Emoji 使用（檢查霓虹燈）
- [ ] 無 alert() 呼叫（檢查大聲公）
- [ ] 支援三種主題（檢查裝潢彈性）
- [ ] 手機版正常顯示（檢查手機入口）
- [ ] **容器佈局符合規範（左右必須貼合）**
- [ ] 按鈕方法都實作（檢查服務完整）
- [ ] 資料能存到 Supabase（檢查倉庫連線）
- [ ] 錯誤處理完善（檢查異常處理）
- [ ] destroy() 方法實作（檢查打烊程序）
- [ ] 無記憶體洩漏（檢查資源回收）

### 📦 測試檢查譬喻
```
像開店前總檢：

外觀檢查：
- 招牌有沒有違規（Emoji）
- 音量會不會太大（alert）

功能檢查：
- 收銀機能用嗎（按鈕功能）
- 倉庫連得上嗎（Supabase）

安全檢查：
- 打烊會關門嗎（destroy）
- 會不會漏水（記憶體洩漏）
```

### 品質標準

| 項目 | 標準 | 測試方法 | 不及格後果 |
|------|------|---------|-----------|
| 載入時間 | < 2秒 | Performance API | 優化程式碼 |
| Console 錯誤 | 0個 | F12 檢查 | 修復錯誤 |
| 記憶體洩漏 | 無 | Chrome DevTools | 清理資源 |
| 離線操作 | 可用 | 斷網測試 | 加強快取 |

## 十一、未來擴充預留

### 協作功能預留
```javascript
// 共享專案結構
{
  project_id: 'tokyo-5d',        // 專案識別
  shared_with: ['uuid1', 'uuid2'], // 成員名單
  permissions: {                   // 權限設定
    'uuid1': 'admin',
    'uuid2': 'viewer'
  }
}
```

### 📦 未來擴充譬喻
```
預留空間像建築：

協作功能 = 預留會議室
- 5樓還空著
- 未來改裝成會議室
- 管線都預留好

國際化 = 預留指標位置
- 牆上留了掛勾
- 未來掛各國語言指標

即時同步 = 預留網路管線
- 地下預埋管道
- 未來拉光纖
- 不用重新施工
```

### 擴充計畫時程表

| 階段 | 功能 | 預計時間 | 準備工作 |
|------|------|---------|---------|
| Phase 1 | 基礎協作 | 2024 Q1 | 資料表結構 |
| Phase 2 | 即時同步 | 2024 Q2 | WebSocket |
| Phase 3 | 國際化 | 2024 Q3 | i18n 框架 |
| Phase 4 | AI 助手 | 2024 Q4 | API 整合 |

## 十二、緊急應變手冊

### 系統異常處理

**倉庫連不上（Supabase 錯誤）**
```javascript
// 應變措施
1. 啟用 localStorage 備援
2. 顯示離線模式提示
3. 佇列待同步資料
4. 恢復後自動同步
```

**店家載入失敗（模組錯誤）**
```javascript
// 處理流程
1. 顯示友善錯誤訊息
2. 提供重試按鈕
3. 記錄錯誤日誌
4. 降級到基本功能
```

### 📦 緊急應變譬喻
```
像大樓緊急預案：

停電（斷網）：
- 啟動發電機（localStorage）
- 點蠟燭（離線模式）
- 等電來（網路恢復）

電梯故障（模組錯誤）：
- 走樓梯（降級功能）
- 貼公告（錯誤提示）
- 叫修理（錯誤回報）

火災（系統崩潰）：
- 啟動灑水（自動備份）
- 疏散（登出所有用戶）
- 重建（從備份恢復）
```

## 十三、開發者備忘錄

### 常見錯誤與解決

| 錯誤訊息 | 原因 | 解決方法 | 預防措施 |
|---------|------|---------|---------|
| Cannot read 'showAddDialog' | activeModule 未設定 | 設定 window.activeModule | 載入時檢查 |
| UUID is null | 未登入或過期 | 重新登入 | 每頁檢查 |
| Supabase 400 | 缺少唯一約束 | 加入 UNIQUE | 初始化檢查 |
| Memory leak | 未清理資源 | 實作 destroy() | 程式碼審查 |

### 📦 最終提醒
```
記住大樓三原則：

1. 質感第一
   不是夜市是百貨公司

2. 使用者體驗
   住戶舒適最重要

3. 可維護性
   今天的偷懶是明天的災難
```

## 十四、實作細節規範（必讀！）

以下是規範書遺漏但**極度重要**的實作細節，所有開發者必須遵守：

### 1️⃣ 模組初始化規範

```javascript
class XXXModule {
  async render(uuid) {
    // ⭐ 必須：第一行設定 activeModule
    window.activeModule = this;
    
    // ⭐ 必須：儲存當前使用者
    this.currentUser = uuid;
    
    // ⭐ 必須：動態載入 sync.js
    const syncModule = await import('./sync.js');
    this.syncManager = new syncModule.SyncManager();
    
    // 載入資料（必須 await）
    await this.loadData(uuid);
    
    // 渲染介面
    const moduleContainer = document.getElementById('moduleContainer');
    moduleContainer.innerHTML = this.getHTML();
    
    // 綁定事件（最後執行）
    this.bindEvents();
  }
}
```

### 2️⃣ 按鈕綁定規範

**HTML 按鈕必須這樣寫：**
```html
<!-- ✅ 正確：透過 window.activeModule -->
<button onclick="window.activeModule.showAddDialog()">新增</button>
<button onclick="window.activeModule.deleteItem(${id})">刪除</button>

<!-- ❌ 錯誤：直接呼叫 -->
<button onclick="showAddDialog()">新增</button>
<button onclick="this.showAddDialog()">新增</button>
```

**所有互動方法必須實作：**
```javascript
// ⭐ 必須實作的基本方法
showAddDialog() {
  if (!this.currentUser) {
    showToast('請先登入', 'error');
    return;
  }
  // 實作內容
}

// ⭐ 有參數的方法
deleteItem(id) {
  if (!id) return;
  // 實作內容
}

// ⭐ 編輯方法
editItem(id) {
  if (!id) return;
  // 實作內容
}
```

### 3️⃣ 資料存取規範

**必須使用 async/await：**
```javascript
// ✅ 正確：完整錯誤處理
async saveData(data) {
  try {
    await this.syncManager.save(
      this.currentUser, 
      'module_name',  // 模組名稱要一致
      data
    );
    showToast('儲存成功', 'success');
  } catch (error) {
    console.error('儲存失敗:', error);
    // localStorage 備援
    localStorage.setItem(
      `gamelife_module_name_${this.currentUser}`,
      JSON.stringify(data)
    );
    showToast('已儲存到本地', 'warning');
  }
}

// ✅ 正確：載入資料
async loadData(uuid) {
  try {
    const data = await this.syncManager.load(uuid, 'module_name');
    this.data = data || this.getDefaultData();
  } catch (error) {
    // 從 localStorage 讀取
    const localData = localStorage.getItem(
      `gamelife_module_name_${uuid}`
    );
    this.data = localData ? JSON.parse(localData) : this.getDefaultData();
  }
}
```

### 4️⃣ 生命週期管理

**必須實作 destroy 方法：**
```javascript
destroy() {
  // ⭐ 清理事件監聽器
  if (this.clickHandler) {
    document.removeEventListener('click', this.clickHandler);
  }
  
  // ⭐ 清理計時器
  if (this.autoSaveTimer) {
    clearInterval(this.autoSaveTimer);
  }
  
  // ⭐ 清理 DOM 參照
  this.currentUser = null;
  this.syncManager = null;
  this.data = null;
  
  // ⭐ 清理 activeModule
  if (window.activeModule === this) {
    window.activeModule = null;
  }
}
```

### 5️⃣ 常見錯誤檢查表

| 錯誤訊息 | 原因 | 必須修正 |
|---------|------|----------|
| Cannot read 'showAddDialog' of undefined | 沒設定 window.activeModule | 在 render() 第一行加入 |
| Cannot read 'save' of undefined | syncManager 未初始化 | 確認 import 和 new |
| 資料沒存進去 | 沒寫 await | 所有 save/load 加 await |
| 按兩次執行兩次 | 事件重複綁定 | destroy() 要清理 |
| 切換模組資料還在 | 沒清理舊資料 | destroy() 清理 this.data |

### 6️⃣ 完整模組範本

```javascript
// ⭐ 這是標準範本，直接複製使用
class StandardModule {
  static moduleInfo = {
    name: '模組名稱',
    subtitle: '功能說明',
    icon: '<svg>...</svg>',
    version: '1.0.0',
    author: 'william',
    themeSupport: true,
    mobileSupport: true
  };

  constructor() {
    this.syncManager = null;
    this.currentUser = null;
    this.data = null;
  }

  async render(uuid) {
    // 必須：設定 activeModule
    window.activeModule = this;
    this.currentUser = uuid;
    
    // 載入 sync
    const syncModule = await import('./sync.js');
    this.syncManager = new syncModule.SyncManager();
    
    // 載入資料
    await this.loadData(uuid);
    
    // 渲染
    const moduleContainer = document.getElementById('moduleContainer');
    moduleContainer.innerHTML = this.getHTML();
    
    // 綁定事件
    this.bindEvents();
  }
  
  getHTML() {
    return `
      <div class="module-content">
        <button onclick="window.activeModule.showAddDialog()">
          新增
        </button>
      </div>
    `;
  }
  
  bindEvents() {
    // 事件綁定
  }
  
  showAddDialog() {
    if (!this.currentUser) return;
    // 實作
  }
  
  async saveData(data) {
    try {
      await this.syncManager.save(
        this.currentUser,
        'module_name',
        data
      );
    } catch (e) {
      console.error(e);
    }
  }
  
  async loadData(uuid) {
    try {
      this.data = await this.syncManager.load(uuid, 'module_name');
    } catch (e) {
      this.data = {};
    }
  }
  
  destroy() {
    this.currentUser = null;
    this.syncManager = null;
    this.data = null;
    if (window.activeModule === this) {
      window.activeModule = null;
    }
  }
}

export { StandardModule };
```

### 7️⃣ Dashboard 切換規範

```javascript
// dashboard.html 必須這樣實作
async function loadModule(moduleName) {
  // ⭐ 先清理舊模組
  if (window.activeModule && typeof window.activeModule.destroy === 'function') {
    window.activeModule.destroy();
    window.activeModule = null;
  }
  
  try {
    // 動態載入
    const module = await import(`./modules/${moduleName}.js`);
    const ModuleClass = module[Object.keys(module)[0]];
    
    // 建立實例
    const instance = new ModuleClass();
    
    // 渲染（會自動設定 activeModule）
    await instance.render(currentUser);
    
  } catch (error) {
    console.error('模組載入失敗:', error);
    showToast('模組載入失敗', 'error');
  }
}
```

**重要提醒：** 以上所有標記 ⭐ 的項目都是**必須實作**的，缺一不可！

---
更新日期：2025-09-03
版本：4.0 (加入實作細節版)
編撰：角落大樓管委會

## 二、住戶使用流程

1. **進入大樓** (index.html)
   - 看到所有員工卡片（動態從 Supabase 讀取）
   - 選擇自己的卡片
   - 輸入密碼驗證
   - 取得 UUID 身分證（存在 sessionStorage）

2. **搭電梯** (dashboard.html)
   - 檢查 UUID 身分證
   - 電梯大廳顯示可用樓層
   - 選擇要去的樓層（店家）

3. **使用服務**
   - 每個店家提供獨立服務
   - UUID 識別使用者身分
   - 資料自動存到個人倉庫區

## 三、店家入駐規範

### 基本要求
每個店家（模組）必須：
1. 接受UUID身分證驗證
2. 透過管委會存取倉庫
3. 提供 render() 入口函數

### 標準店家範本
```javascript
class 店家名稱Module {
  constructor() {
    // 不需要參數
  }
  
  async render(uuid) {
    // 接收 UUID 參數
    
    // 動態載入管委會
    const syncModule = await import('./sync.js');
    this.syncManager = new syncModule.SyncManager();
    
    // 載入個人資料
    await this.loadData(uuid);
    
    // 返回店面介面
    const moduleContainer = document.getElementById('moduleContainer');
    moduleContainer.innerHTML = `<div>您的店面設計</div>`;
  }
  
  // 互動方法（按鈕需要）
  showAddDialog() {
    // 新增功能
  }
  
  async saveData(uuid, data) {
    // 透過管委會存到倉庫
    await this.syncManager.save(uuid, '店家名稱', data);
  }
  
  async loadData(uuid) {
    // 透過管委會從倉庫取貨
    return await this.syncManager.load(uuid, '店家名稱');
  }
}

// ES6 模組匯出
export { 店家名稱Module };
```

### 複雜店家配置
如果店家業務複雜（如圖書館），可自配樓層管理員：

```javascript
class 圖書館Module {
  constructor() {
    this.syncManager = window.syncManager;
    this.smartManager = new 圖書館管理員(); // 自配管理員
  }
  
  // 處理協作任務
  assignTask(fromUser, toUser, task) {
    this.smartManager.handleAssignment(fromUser, toUser, task);
  }
}
```

## 四、倉庫管理規則 (Supabase)

### 倉庫結構
地下倉庫只有一個大房間，用標籤分類：

```
user_data 表：
├── id (貨物編號 - 自動產生)
├── user_id (誰的貨物 - UUID)
├── module (來自哪個店家)
├── data (貨物內容 - JSON格式)
└── updated_at (入庫時間)
```

### 存取規則
1. **個人區域** - 每個UUID有獨立儲存區
2. **模組分類** - 同一店家的貨物放一起
3. **自由格式** - data欄位不限內容

### 未來擴充
- **共用區** - shared/project/專案名稱
- **協作區** - 跨使用者的任務指派

## 五、管委會職責 (sync.js)

### 基本服務
1. **身分驗證** - 確認UUID有效
2. **貨物運送** - 倉庫存取服務
3. **離線暫存** - 網路斷線時暫存
4. **同步通知** - 操作時順便通知更新

### 服務原則
- 不檢查貨物內容
- 不翻譯資料格式
- 只負責可靠運送

## 六、特殊規定

### 戶政事務所 (users.js)
- 唯一的公共區域
- 只有管理員(william, carson)可進入
- 管理所有身分證

### 圖書館 (todos.js)
- 最複雜的店家
- 有自己的樓層管理員
- 未來支援協作功能

## 七、開發者注意事項

### 命名規範
- 模組檔案：`功能名稱.js`
- 類別名稱：`功能名稱Module`
- 存儲鍵值：`gamelife_模組名稱_userId`

### 必要檔案
```
WEB/
├── index.html      [必要]
├── dashboard.html  [必要]
├── modules/
│   ├── sync.js     [必要]
│   └── *.js        [各店家模組]
```

### 可刪除檔案
- app.js (已整合到 dashboard)
- schema.js (不需要統一規範)
- database-setup.sql (倉庫已建好)

## 八、常見問題與解決

### 問題1：按鈕無法點擊
```
錯誤：Cannot read properties of undefined (reading 'showAddDialog')
原因：window.activeModule 未設定或方法未定義

解決：
1. 確認 dashboard.html 有設定 window.activeModule = currentModule
2. 確認模組有實作互動方法（showAddDialog 等）
```

### 問題2：模組載入失敗
```
錯誤：Failed to import module
原因：ES6 模組匯出格式錯誤

解決：
1. 確認模組有 export { ModuleName }
2. 確認 import 路徑正確（./modules/xxx.js）
```

### 問題3：UUID 遺失
```
錯誤：使用者未登入
原因：sessionStorage 被清空

解決：
1. 關閉瀏覽器會清空 sessionStorage
2. 需要重新登入取得 UUID
```

## 九、大樓設計規範（店家裝潢守則）

### 統一設計原則
角落大樓以**質感**為主要訴求，所有店家必須遵守以下規範：

### 禁止事項 ❌
1. **禁用 Emoji** - 不准在介面中使用表情符號
   ```
   錯誤：「📋 待辦事項」
   正確：「待辦事項」
   ```

2. **禁用 alert()** - 不准使用系統原生彈跳視窗
   ```javascript
   // ❌ 錯誤
   alert('新增成功！');
   
   // ✅ 正確：使用自訂提示
   showToast('新增成功');
   ```

3. **禁用過度動畫** - 保持穩重質感
   ```
   不要：彈跳、旋轉、閃爍
   要：淡入淡出、平滑過渡
   ```

### 色彩規範（大樓統一色系）

每個店家必須使用 CSS 變數，配合大樓主題：

```css
/* 必須使用的顏色變數 */
:root {
  --bg: #e8e5e0;        /* 背景：米白 */
  --primary: #8b7355;    /* 主色：棕金 */
  --accent: #6b7c65;     /* 強調：橄欖綠 */
  --text: #3a3833;       /* 文字：深灰 */
  --card: rgba(255,255,255,0.7); /* 卡片：半透明白 */
}
```

### 店家招牌規範

每個模組必須提供：
1. **模組名稱** - 中文正式名稱
2. **模組副標** - 功能簡述
3. **模組圖示** - SVG 向量圖（不是 Emoji）

```javascript
class 店家Module {
  // 必須提供的資訊
  static moduleInfo = {
    name: '待辦事項',
    subtitle: '管理您的日常任務',
    icon: '<svg>...</svg>', // 不是 emoji
    themeSupport: true      // 支援主題切換
  };
}
```

### 主題切換支援

所有店家必須支援至少三種主題：

1. **原木風（預設）** - 溫暖米色系
2. **夜間模式** - 深色護眼
3. **海洋藍** - 清新藍色系

```javascript
// 店家必須監聽主題變更
window.addEventListener('themeChange', (e) => {
  this.updateTheme(e.detail.theme);
});
```

### 容器佈局規範（重要！）

**統一容器規格**
```css
/* 所有店家必須遵守 - 確保左右完全貼合 */
.module-container {
  height: 100%;           /* 撐滿高度 */
  min-height: 500px;      /* 最小高度 */
  padding: 20px 0;        /* 只有上下內距，左右歸零 */
  /* ❌ 禁止 padding: 20px - 會造成左右空隙 */
}

/* 內部卡片才能有左右間距 */
.content-card {
  margin: 0 20px;         /* 卡片內縮 */
  padding: 20px;          /* 卡片內距 */
}
```

### 📦 佈局規範譬喻
```
像商場店面規格：

錯誤做法 = 店家自己內縮
- 玻璃櫥窗不貼合走道
- 浪費黃金店面空間
- 每間店大小不一

正確做法 = 店面滿版
- 櫥窗完全貼合走道邊界
- 商品展示架才內縮
- 充分利用每寸空間
- 所有店家統一規格
```

### 佈局檢查清單
- [ ] 容器高度設定 100%
- [ ] 最小高度 500px
- [ ] 左右 padding 必須為 0
- [ ] 內部元素使用 margin 控制間距
- [ ] 響應式斷點正確設定

### 介面元素規範

**按鈕**
```css
/* 統一按鈕樣式 */
.btn {
  border-radius: 8px;     /* 圓角統一 */
  padding: 10px 20px;     /* 內距統一 */
  transition: all 0.2s;   /* 過渡統一 */
  /* 不准用 emoji 當按鈕文字 */
}
```

**卡片**
```css
/* 統一卡片樣式 */
.card {
  background: var(--card);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid var(--border);
}
```

**提示訊息**
```javascript
// 統一使用 Toast 提示
showToast('訊息', 'success');  // ✅
alert('訊息');                  // ❌
```

### 違規處罰

違反設計規範的店家：
1. 第一次：警告並限期改善
2. 第二次：暫停營業（模組停用）
3. 第三次：逐出大樓（移除模組）

### 設計審查流程

新店家入駐前必須：
1. 提交設計稿
2. 通過質感審查
3. 確認無 Emoji
4. 確認無 alert()
5. 支援主題切換

---
更新日期：2025-09-03
版本：2.1