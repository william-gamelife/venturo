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

1. **禁止使用 Emoji** - 所有圖標必須使用 SVG
2. **禁止使用 Tailwind 類** - 使用 venturo.css
3. **禁止行內樣式** - 除非絕對必要

## 📐 SVG 圖標規範

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="...">
</svg>
```

- ViewBox: 24x24
- Stroke Width: 2
- Color: currentColor

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

---

最後更新：2024年1月
維護者：Venturo 團隊
