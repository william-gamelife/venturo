# 🚨 AI 必讀指令 - VENTURO 專案規範
**THIS FILE IS MANDATORY FOR ALL AI ASSISTANTS**

## 🎯 專案識別
- **專案名稱**: Venturo ERP (不是 Corner)
- **專案路徑**: /Venturo-ERP
- **設計系統**: Venturo Design System
- **主要樣式**: /src/app/venturo.css

## ⚡ 快速指令範本
當你需要 AI 協助時，使用以下指令：

### 對 Claude/ChatGPT：
```
這是 Venturo 專案，請遵循 AI_INSTRUCTIONS.md
```

### 對 Claude Code/Cursor/Copilot：
```
Venturo 專案：使用 v- 組件，venturo.css 樣式，lucide-react 圖示，禁止 emoji/MUI/Tailwind
```

## 📚 必讀文檔優先級
1. **AI_INSTRUCTIONS.md** - AI 專用指令（本檔案）
2. **LAYOUT-GUIDE.md** - Layout 三大區塊規範 🆕
3. **UI-DESIGN-SYSTEM.md** - UI 組件規範
4. **PROJECT_RULES.md** - 開發規範

## 🏗️ Layout 架構（重要！）

### **三大區塊定義**
1. **左側側邊欄** - 導航
2. **右側 Header** - 模組標題與操作
3. **右側主畫面** - 功能內容

### **主畫面核心規範**
```
✅ 正確：內容直接開始，無額外容器
❌ 錯誤：白框套白框，多層容器

記住：主畫面就像白紙，內容直接寫上去，不要加框框
```

詳細規範請看 **LAYOUT-GUIDE.md**

## 📐 核心規範（優先級由高到低）

### 🔴 絕對禁止 (NEVER DO)
```typescript
// ❌ 絕對不要使用
import { Button } from '@mui/material'     // 禁止 Material-UI
import { Button } from '@/components/ui'   // 錯誤路徑
import { FaCalendar } from 'react-icons'   // 禁止其他圖示庫
import { Birthday } from 'lucide-react'    // 不存在的圖示
className="bg-blue-500 p-4"                // 禁止 Tailwind
<span>📅</span>                           // 禁止 Emoji
style={{ color: 'red' }}                   // 避免行內樣式

// ❌ Layout 錯誤
<div style={{ background: 'white', padding: 24, borderRadius: 16 }}>
  // 禁止主畫面加額外容器
</div>
```

### 🟢 必須使用 (ALWAYS DO)
```typescript
// ✅ 正確做法
import { Calendar, Users, Cake } from 'lucide-react'  // 使用 lucide-react
className="v-button variant-primary"                  // 使用 v- 前綴
import venturo.css                                    // 使用 Venturo 樣式
<Calendar className="w-5 h-5" />                      // lucide 圖示

// ✅ Layout 正確
<div className="v-main-content">
  // 內容直接開始，無額外容器
</div>
```

## 📦 組件命名規範

### 類別命名 (CSS Classes)
```css
.v-[component]              /* 主要組件 */
.v-[component]-[element]    /* 子元素 */
.variant-[name]             /* 變體 */
.size-[size]                /* 尺寸 */

/* 範例 */
.v-button
.v-button-icon
.variant-primary
.size-lg
```

### 檔案命名 (File Names)
```
/components/
  /ui/
    VButton.tsx           /* 組件檔案 */
    VButton.module.css    /* 樣式檔案 */
  /modules/
    OrderTable.tsx        /* 業務組件 */
```

## 🎨 設計系統速查

### 色彩（只能用這些）
```css
--primary: #D4C4A0;      /* 莫蘭迪金 */
--secondary: #C4A4A7;    /* 灰玫瑰 */
--sage-green: #9CAF88;   /* 鼠尾草綠 */
--fog-blue: #8B95A7;     /* 霧藍 */
--danger: #C48B8B;       /* 褪紅 */
```

### 間距（統一系統）
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
```

### 圓角（固定值）
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
```

## 🏗️ 專案結構規範

### 新增頁面（遵循 Layout 規範）
```typescript
// 路徑: /src/app/(dashboard)/[module-name]/page.tsx
'use client'

import { ModuleLayout } from '@/components/ModuleLayout'
import { Calendar, Users } from 'lucide-react'

export default function ModulePage() {
  return (
    <ModuleLayout
      header={{
        title: "模組名稱",
        subtitle: "副標題",
        actions: <button className="v-button">按鈕</button>
      }}
    >
      {/* 主畫面內容 - 無額外容器 */}
      <div className="v-table">
        {/* 內容 */}
      </div>
    </ModuleLayout>
  )
}
```

### 新增組件
```typescript
// 路徑: /src/components/ui/VComponentName.tsx
export function VComponentName({ className = '', ...props }) {
  return (
    <div className={`v-component ${className}`} {...props}>
      {/* 內容 */}
    </div>
  )
}
```

## 🔍 檢查清單 (AI Self-Check)

在生成程式碼前，AI 必須確認：
- [ ] 沒有使用 Material-UI
- [ ] 沒有使用 Tailwind 類別
- [ ] 沒有使用 Emoji
- [ ] 使用 v- 前綴命名
- [ ] 引用 venturo.css 的類別
- [ ] 圖示必須來自 lucide-react
- [ ] 圖示名稱先查 https://lucide.dev
- [ ] **主畫面沒有額外容器** 🆕
- [ ] **Layout 遵循三區塊架構** 🆕

## 📝 標準回應模板

### 建立新模組時
```typescript
/**
 * Venturo [模組名稱] Module
 * 遵循 Venturo Design System
 * Layout: 三區塊架構（側邊欄、Header、主畫面）
 * 圖示: lucide-react
 */

import { Calendar, CheckSquare } from 'lucide-react'

// ✅ 使用 Venturo 組件
// ✅ 主畫面無額外容器
// ✅ 使用 lucide-react
// ❌ 禁止 MUI/Tailwind/Emoji
```

### 修改現有程式碼時
```typescript
// 檢查點：
// 1. 保持 v- 前綴
// 2. 使用既有樣式系統
// 3. 不引入新的 UI 框架
// 4. 主畫面不要白框套白框
// 5. 圖示來自 lucide-react
```

## 🚀 常用程式碼片段

### 模組頁面結構
```tsx
import { Calendar, Users, FileText } from 'lucide-react'

<ModuleLayout
  header={{
    icon: <Calendar className="w-5 h-5" />,
    title: "模組名稱",
    subtitle: "說明文字",
    actions: (
      <>
        <button className="v-button variant-primary">新增</button>
      </>
    )
  }}
>
  {/* 主畫面 - 直接開始，無容器 */}
  <div className="v-filters">...</div>
  <table className="v-table">...</table>
</ModuleLayout>
```

### 按鈕
```html
<button className="v-button variant-primary size-md">按鈕文字</button>
```

### 卡片
```html
<div className="v-card">
  <div className="v-card-header">
    <h3 className="v-card-title">標題</h3>
  </div>
  <div className="v-card-content">內容</div>
</div>
```

### 輸入框
```html
<div className="v-input-group">
  <label className="v-input-label">標籤</label>
  <input type="text" className="v-input" />
</div>
```

### Lucide 圖示使用
```tsx
import { Calendar, CheckSquare, Users, Cake, FileText } from 'lucide-react'

// 生日事件用 Cake（不要用 Birthday - 不存在）
<Cake className="w-5 h-5 text-pink-500" />

// 行事曆用 Calendar
<Calendar className="w-5 h-5" />

// 團體/用戶用 Users
<Users className="w-5 h-5" />
```

## ⚠️ 常見錯誤與修正

| 錯誤 | 正確 |
|------|------|
| `@mui/material` | 使用 `v-button` |
| `react-icons/fa` | 使用 `lucide-react` |
| `<Birthday />` | 使用 `<Cake />` |
| `className="flex"` | 使用 `className="v-flex"` |
| `🔍` emoji | 使用 lucide-react 圖示 |
| `<Button>` | `<button className="v-button">` |
| `style={{}}` | 使用 className |
| 主畫面加白框 | 內容直接開始 |
| 多層容器 | 單層結構 |

## 📊 優先級規則

1. **最高**: 此檔案 (AI_INSTRUCTIONS.md)
2. **高**: LAYOUT-GUIDE.md 🆕
3. **高**: PROJECT_RULES.md
4. **中**: UI-DESIGN-SYSTEM.md
5. **低**: README.md

## 🔄 版本
- 版本: 2.2
- 更新: 2024-01-28
- 狀態: 生效中
- 新增: lucide-react 圖示規範

---

**記住：你是在開發 Venturo，不是 Corner。遵循 Venturo 的簡潔優雅理念。**
**主畫面原則：像白紙一樣，內容直接寫上去，不要加框框。**
**圖示原則：所有圖示必須來自 lucide-react，使用前先查 https://lucide.dev。**