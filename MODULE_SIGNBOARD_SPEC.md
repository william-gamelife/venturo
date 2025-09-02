# 模組招牌系統規範 📋

## 概述
模組招牌系統是遊戲人生 3.0 的統一介面框架，類似「固定招牌大小」的概念：
- **儀表板**提供固定的招牌框架
- **模組**只需要填入內容，遵循規範即可

## 🏗️ 架構設計

### 儀表板框架（dashboard.html）
```html
<!-- 固定招牌框架 -->
<div class="welcome-card" id="moduleSignboard">
    <div class="welcome-content">
        <!-- 主要區域 -->
        <div class="module-header">
            <div class="module-info">...</div>
            <div class="module-actions">...</div>
        </div>
        <!-- 篩選區域 -->
        <div class="module-filters">...</div>
    </div>
</div>
```

### 模組填空系統
每個模組只需要定義 `static moduleInfo` 即可：

```javascript
class YourModule {
    static moduleInfo = {
        name: '模組名稱',
        subtitle: '簡短描述',
        icon: 'SVG圖標或emoji',
        // 其他選項...
    };
}
```

## 📝 完整規範

### 1. 基本資訊（必填）
```javascript
static moduleInfo = {
    // 模組名稱（顯示在大標題）
    name: '待辦事項',
    
    // 副標題（顯示在名稱下方）
    subtitle: '智慧任務管理與專案追蹤',
    
    // 圖標（SVG代碼或emoji）
    icon: `<svg viewBox="0 0 24 24">...</svg>`, // 或 '📝'
    
    // 招牌說明（可選，顯示在副標題下方）
    description: '這是一個功能詳細的說明文字，可以介紹模組的主要用途和特色功能。',
    
    // 其他元資訊（可選）
    version: '2.0.0',
    author: 'william',
    themeSupport: true,
    mobileSupport: true
}
```

### 2. 統計資訊（可選）
```javascript
stats: [
    { 
        label: '25 個任務', 
        highlight: false  // 是否高亮顯示
    },
    { 
        label: '已選取 3 個', 
        highlight: true,
        title: '滑鼠懸停提示'  // 可選
    }
]
```

### 3. 動作按鈕（可選）
```javascript
actions: [
    {
        label: '新增任務',
        onClick: 'window.activeModule.showAddDialog',  // 函數名稱
        primary: true,  // 是否為主要按鈕（藍色背景）
        icon: '<svg>...</svg>',  // 可選圖標
        disabled: false,  // 是否禁用
        title: '建立新的任務項目'  // 懸停提示
    },
    {
        label: '批量操作',
        onClick: 'window.activeModule.batchAction',
        primary: false,  // 次要按鈕（灰色背景）
        disabled: true   // 可根據狀態動態設定
    }
]
```

### 4. 篩選器（可選）
```javascript
filters: [
    {
        id: 'all',
        label: '全部',
        active: true,    // 是否為當前選中
        onClick: 'window.activeModule.setFilter',  // 點擊回調
        title: '顯示所有項目'
    },
    {
        id: 'pending',
        label: '待處理',
        active: false,
        onClick: 'window.activeModule.setFilter'
    }
],

// 搜尋按鈕（可選）
searchButton: {
    label: '搜尋',
    onClick: 'window.activeModule.showSearch'
}
```

## 🎯 實作步驟

### Step 1: 定義模組資訊
```javascript
class TodosModule {
    static moduleInfo = {
        name: '待辦事項',
        subtitle: '智慧任務管理與專案追蹤',
        icon: `<svg viewBox="0 0 24 24">...</svg>`,
        version: '2.0.0',
        author: 'william'
    };
}
```

### Step 2: 實作招牌更新函數
```javascript
updateSignboard() {
    const moduleInfo = {
        ...TodosModule.moduleInfo,
        stats: [
            { label: `${this.todos.length} 個任務` }
        ],
        actions: [
            { 
                label: '新增任務', 
                onClick: 'window.activeModule.showAddDialog', 
                primary: true 
            }
        ],
        filters: [
            { id: 'all', label: '全部', active: this.currentFilter === 'all', onClick: 'window.activeModule.setFilter' }
        ]
    };

    if (typeof updateModuleSignboard === 'function') {
        updateModuleSignboard(moduleInfo);
    }
}
```

### Step 3: 在 render 方法中調用
```javascript
async render(userId) {
    // 載入資料...
    // 渲染界面...
    
    // 更新招牌（最後調用）
    this.updateSignboard();
}
```

## 🎨 樣式系統

### 自動樣式類別
框架會自動套用以下 CSS 類別：

```css
/* 模組圖標 */
.module-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    border-radius: 10px;
}

/* 統計標籤 */
.stat-badge {
    font-size: 0.85rem;
    padding: 4px 8px;
    border-radius: 12px;
}

.stat-badge.highlight {
    color: var(--primary);
    background: var(--primary-light);
}

/* 動作按鈕 */
.module-btn.primary {
    background: var(--primary);
    color: white;
}

.module-btn.secondary {
    background: var(--bg);
    border: 1px solid var(--border);
}
```

## 📱 響應式設計

框架自動處理響應式：
- **桌面版**：水平排列
- **手機版**：垂直堆疊，按鈕重新排列

## ✅ 最佳實踐

### 1. 按鈕設計原則
- **主要動作**：使用 `primary: true`（新增、儲存等）
- **次要動作**：使用 `primary: false`（批量操作、匯出等）
- **危險動作**：考慮在模組內部實作確認對話框

### 2. 統計資訊原則
- 保持簡潔：最多 3-4 個統計項目
- 使用 `highlight` 標示重要資訊
- 動態更新：反映當前模組狀態

### 3. 篩選器原則
- 常用篩選：放在招牌區域
- 進階篩選：放在模組內部
- 最多 6-8 個篩選標籤，避免擁擠

### 4. 效能考量
- 只在必要時調用 `updateSignboard()`
- 避免在頻繁更新的地方調用（如滾動事件）
- 使用函數檢查：`if (typeof updateModuleSignboard === 'function')`

## 🚀 範例實作

完整的模組範例：

```javascript
class ExampleModule {
    static moduleInfo = {
        name: '範例模組',
        subtitle: '展示招牌系統的完整功能',
        description: '這個模組展示了如何使用招牌系統的所有功能，包括動態統計、按鈕狀態管理和篩選器系統。適合作為新模組開發的參考範本。',
        icon: '📋',
        version: '1.0.0',
        author: 'developer'
    };

    constructor() {
        this.items = [];
        this.selectedItems = new Set();
        this.currentFilter = 'all';
    }

    async render(userId) {
        // 載入資料和渲染界面...
        this.updateSignboard();
    }

    updateSignboard() {
        const moduleInfo = {
            ...ExampleModule.moduleInfo,
            stats: [
                { label: `${this.items.length} 個項目` },
                ...(this.selectedItems.size > 0 ? [{ label: `已選取 ${this.selectedItems.size} 個`, highlight: true }] : [])
            ],
            actions: [
                { 
                    label: '新增項目', 
                    onClick: 'window.activeModule.showAddDialog', 
                    primary: true,
                    icon: '➕'
                },
                { 
                    label: '批量操作', 
                    onClick: 'window.activeModule.showBatchActions', 
                    disabled: this.selectedItems.size === 0 
                }
            ],
            filters: [
                { id: 'all', label: '全部', active: this.currentFilter === 'all', onClick: 'window.activeModule.setFilter' },
                { id: 'active', label: '進行中', active: this.currentFilter === 'active', onClick: 'window.activeModule.setFilter' },
                { id: 'completed', label: '已完成', active: this.currentFilter === 'completed', onClick: 'window.activeModule.setFilter' }
            ],
            searchButton: {
                label: '搜尋',
                onClick: 'window.activeModule.showSearchDialog'
            }
        };

        if (typeof updateModuleSignboard === 'function') {
            updateModuleSignboard(moduleInfo);
        }
    }

    // 處理篩選變更時更新招牌
    setFilter(filterId) {
        this.currentFilter = filterId;
        this.applyFilter();
        this.updateSignboard(); // 重要：更新招牌狀態
    }
}
```

---

## 📞 技術支援

如果在實作過程中遇到問題：
1. 檢查 `moduleInfo` 格式是否正確
2. 確認函數名稱拼寫無誤
3. 查看瀏覽器控制台是否有錯誤訊息
4. 參考現有模組的實作（todos.js, users.js）

**記住**：這個系統的設計理念是「簡單填空」，讓開發者專注於模組邏輯，而不是界面框架！✨