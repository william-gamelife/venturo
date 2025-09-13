# Venturo UI 設計系統規範 v1.0

## 🎨 核心理念
基於莫蘭迪色系的優雅設計系統，強調簡潔、一致、易用。

## 📦 組件清單

### 1. Toggle 模式切換組件
- 用途：切換不同模式或視圖
- 變體：標準、小型、純圖標
- 使用場景：冒險/角落模式切換

### 2. Button 按鈕組件
- 變體：primary, secondary, sage, fog, danger, ghost
- 尺寸：sm (32px), md (40px), lg (48px)
- 狀態：normal, hover, disabled, loading

### 3. Dialog 彈窗組件
- 尺寸：sm (400px), md (600px), lg (800px)
- 特性：點擊背景關閉、淡入動畫

### 4. Input 輸入組件
- 類型：text, email, password, number, textarea, select
- 狀態：normal, focus, error, disabled
- 特性：必填標記、錯誤提示、提示文字

### 5. Card 卡片組件
- 變體：default, hoverable, gradient, glass
- 結構：header, content, footer
- 特性：懸浮動畫效果

### 6. Menu 選單組件
- 類型：dropdown, context
- 位置：left, right
- 特性：分隔線、禁用項、圖標支援

### 7. 表單控制組件
- 搜尋列：圖標、清除按鈕、自動完成
- 篩選器：多條件篩選、日期範圍
- 排序：升降序、多欄位排序
- 工具列：整合搜尋、篩選、視圖切換

## 🎨 色彩系統

```css
/* 莫蘭迪色系 */
--primary: #D4C4A0;        /* 莫蘭迪金 */
--secondary: #C4A4A7;       /* 灰玫瑰 */
--sage-green: #9CAF88;      /* 鼠尾草綠 */
--fog-blue: #8B95A7;        /* 霧藍 */
--danger: #C48B8B;          /* 褪紅 */
```

## 📏 間距系統

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
```

## 🚫 禁止事項

1. **禁止使用 Emoji** - 所有圖標必須使用 lucide-react
2. **禁止使用其他圖示庫** - 不要用 react-icons、heroicons 等
3. **禁止使用不存在的圖示** - 如 Birthday、Holiday 等
4. **禁止使用 Tailwind 類** - 使用 venturo.css
5. **禁止行內樣式** - 除非絕對必要

## 📐 圖示使用規範

### **統一使用 Lucide React**

```typescript
// ✅ 正確：使用 lucide-react
import { Calendar, CheckSquare, Users } from 'lucide-react'

// ❌ 錯誤：自己寫 SVG 或使用其他圖示庫
import { FaCalendar } from 'react-icons/fa'
```

### **圖示對應表**

| 功能 | Lucide 圖示名稱 | 用途 |
|------|----------------|------|
| 行事曆 | `Calendar` | 日期相關功能 |
| 待辦事項 | `CheckSquare` | 任務、待辦 |
| 用戶 | `Users` | 人員管理 |
| 團體 | `Users` | 團體管理 |
| 訂單 | `FileText` | 文件類 |
| 報價單 | `FileSpreadsheet` | 試算表類 |
| 財務 | `DollarSign` | 金錢相關 |
| 設定 | `Settings` | 系統設定 |
| 登出 | `LogOut` | 登出系統 |
| 生日 | `Cake` | 生日提醒（不要用 Birthday） |
| 假期 | `Palmtree` | 假期標記 |
| 會議 | `Users` 或 `Video` | 會議事件 |

### **使用規範**

1. **統一來源**: 所有圖示必須來自 lucide-react
2. **尺寸設定**: 統一使用 size={20} 或 className="w-5 h-5"
3. **顏色控制**: 使用 className 控制顏色，不用 color prop
4. **檢查方式**: 開發前先到 https://lucide.dev 確認圖示存在

### **程式碼範例**

```tsx
// 側邊欄圖示
<Calendar className="w-5 h-5" />

// 帶顏色的圖示
<CheckSquare className="w-5 h-5 text-green-500" />

// 按鈕內的圖示
<button className="v-button">
  <Plus className="w-4 h-4 mr-2" />
  新增
</button>
```

## 💻 使用方式

### 引入 CSS
```html
<link rel="stylesheet" href="/styles/venturo.css">
```

### 使用組件
```html
<!-- Button -->
<button class="v-button variant-primary size-md">按鈕</button>

<!-- Card -->
<div class="v-card">
  <div class="v-card-content">內容</div>
</div>
```

## 📚 參考連結

- [線上預覽](/design-system)
- [組件範例](/design-system/examples)
- [程式碼片段](/design-system/snippets)

## 🔄 版本歷史

- v1.0 (2024-01) - 初始版本，7個核心組件
- v1.1 (2024-01) - 新增 lucide-react 圖示規範

---

最後更新：2024年1月
維護者：Venturo 團隊
