# 🎨 Venturo 純 CSS 設計系統指南

> **Venturo 設計系統** - 純 CSS 解決方案，零依賴框架

## 📋 目錄

- [架構概覽](#架構概覽)
- [色彩系統](#色彩系統)
- [組件使用](#組件使用)
- [工具類別](#工具類別)
- [最佳實踐](#最佳實踐)

---

## 🏗️ 架構概覽

### 樣式架構
```
1. CSS 變數系統 (設計令牌)
2. 基礎樣式重置
3. 組件類別系統
4. 工具類別系統
5. 主題系統
```

### 使用優先順序
1. **Venturo 組件類別** - 用於業務組件 (.btn, .card 等)
2. **工具類別** - 用於快速布局和間距 (.flex, .gap-4 等)
3. **CSS 變數** - 用於自訂樣式和色彩

---

## 🎨 色彩系統

### 主要色彩 (莫蘭迪色系)

```tsx
// Tailwind 類別
className="bg-primary text-white"
className="bg-primary-100 text-primary-900"

// CSS 變數
style={{ backgroundColor: 'var(--primary)' }}
```

#### 可用色彩
- **Primary**: `#D4C4A0` (莫蘭迪金)
- **Secondary**: `#C4A4A7` (灰玫瑰)
- **Sage**: `#9CAF88` (鼠尾草綠)
- **Warm**: `#B8B0A0` (暖灰)
- **Fog**: `#8B95A7` (霧藍)
- **Terracotta**: `#C4866B` (赤陶色)

#### 功能色彩
- **Success**: `#8FA68E` (苔綠)
- **Warning**: `#D4A574` (琥珀)
- **Danger**: `#C48B8B` (褪紅)
- **Info**: `#8B9DC3` (灰藍)

### 使用範例

```tsx
// 主色按鈕
<button className="btn-primary">確認</button>

// 莫蘭迪色系按鈕
<button className="btn-sage">保存</button>
<button className="btn-fog">取消</button>

// 狀態色彩
<span className="text-success">成功</span>
<span className="text-danger">錯誤</span>

// 背景色
<div className="bg-sage-light p-lg">淡綠背景</div>

// 使用 CSS 變數
<div style={{ backgroundColor: 'var(--sage-green)' }}>自訂樣式</div>
```

---

## 🧩 組件使用

### 按鈕組件

```tsx
// 主要按鈕
<button className="btn btn-primary">主要動作</button>

// 次要按鈕
<button className="btn btn-secondary">次要動作</button>

// 透明按鈕
<button className="btn btn-ghost">輔助動作</button>

// 莫蘭迪色系按鈕
<button className="btn btn-sage">鼠尾草</button>
<button className="btn btn-fog">霧藍</button>
<button className="btn btn-terracotta">赤陶</button>
<button className="btn btn-warm">暖灰</button>
```

### 卡片組件

```tsx
// 基礎卡片
<div className="card">
  <h3>卡片標題</h3>
  <p>卡片內容</p>
</div>

// 漸變卡片 (AssetManagement 風格)
<div className="gradient-card">
  <h3>漸變卡片</h3>
  <p>具有優雅漸變背景</p>
</div>

// 卡片變體
<div className="gradient-card-subtle">微妙漸變</div>
<div className="gradient-card-warm">溫暖漸變</div>
<div className="gradient-card-soft">柔和漸變</div>
```

### 輸入框組件

```tsx
// 統一輸入框樣式
<input className="input" placeholder="請輸入內容" />

// 或使用 unified-input (兼容舊組件)
<input className="unified-input" placeholder="請輸入內容" />
```

### 表格組件

```tsx
// 統一表格樣式
<div className="table">
  <table>
    <thead>
      <tr>
        <th>標題 1</th>
        <th>標題 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>內容 1</td>
        <td>內容 2</td>
      </tr>
    </tbody>
  </table>
</div>

// 或使用 unified-table (兼容舊組件)
<div className="unified-table">
  <!-- 表格內容 -->
</div>
```

### 徽章組件

```tsx
// 狀態徽章
<span className="badge badge-success">成功</span>
<span className="badge badge-warning">警告</span>
<span className="badge badge-danger">錯誤</span>
<span className="badge badge-info">資訊</span>
<span className="badge badge-primary">主要</span>
```

---

## 🛠️ 工具類別

### 間距系統

```tsx
// Venturo 設計令牌間距
<div className="p-md m-sm">設計令牌間距</div>

// 可用間距: xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px)

// CSS 變數使用
<div style={{ padding: 'var(--spacing-lg)' }}>大間距</div>
```

### 陰影系統

```tsx
// Venturo 陰影類別
<div className="shadow-sm">小陰影</div>
<div className="shadow-md">中等陰影</div>
<div className="shadow-lg">大陰影</div>

// 漸變卡片專用陰影
<div className="gradient-card">漸變卡片陰影</div>
```

### 圓角系統

```tsx
// Venturo 圓角類別
<div className="rounded-sm">小圓角</div>
<div className="rounded-md">中等圓角</div>
<div className="rounded-lg">大圓角</div>
<div className="rounded-full">全圓角</div>
```

### 特效類別

```tsx
// 玻璃效果
<div className="glass-effect p-4">毛玻璃背景</div>

// 動畫效果
<div className="animate-fade-in">淡入動畫</div>
<div className="animate-slide-in">滑入動畫</div>
<div className="animate-pulse-slow">慢脈衝動畫</div>
```

---

## 📝 最佳實踐

### 1. 組件開發指南

```tsx
// ✅ 推薦：使用 Venturo 類別組合
function MyComponent() {
  return (
    <div className="flex items-center gap-4 p-md">
      <button className="btn btn-primary">
        確認
      </button>
      <button className="btn btn-secondary">
        取消
      </button>
    </div>
  );
}

// ✅ 推薦：混合使用類別和 CSS 變數
function MyComponent() {
  return (
    <div className="card" style={{ 
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--surface)'
    }}>
      內容
    </div>
  );
}
```

### 2. 色彩使用指南

```tsx
// ✅ 推薦：使用語義化色彩
<span className="text-success">操作成功</span>
<span className="text-danger">操作失敗</span>

// ✅ 推薦：使用設計系統色彩
<div className="bg-primary text-white">主要區域</div>

// ✅ 推薦：使用 CSS 變數自訂
<div style={{ color: 'var(--sage-green)' }}>自訂色彩</div>

// ❌ 避免：使用硬編碼顏色值
<div style={{ background: '#3b82f6' }}><!-- 不符合設計系統 --></div>
```

### 3. 響應式設計

```tsx
// ✅ 推薦：使用 CSS 媒體查詢
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

// ✅ 推薦：結合 Venturo 響應式工具
<div className="card responsive-grid">
  <!-- CSS 中定義響應式行為 -->
</div>
```

### 4. 組件組合

```tsx
// ✅ 推薦：組合使用 Venturo 組件類別
function ProjectCard({ project }) {
  return (
    <div className="gradient-card">
      <div className="flex items-center justify-end gap-2" 
           style={{ marginBottom: 'var(--spacing-md)' }}>
        <h3 className="flex-1 font-semibold text-primary">
          {project.name}
        </h3>
        <span className="badge badge-success">
          {project.status}
        </span>
      </div>
      <p className="text-muted" 
         style={{ marginBottom: 'var(--spacing-md)' }}>
        {project.description}
      </p>
      <div className="flex gap-2">
        <button className="btn btn-primary flex-1">
          查看詳情
        </button>
        <button className="btn btn-secondary">
          編輯
        </button>
      </div>
    </div>
  );
}
```

---

## 🔧 開發工具

### VS Code 擴展推薦
- **CSS Peek** - 快速查看 CSS 定義
- **IntelliSense for CSS class names** - CSS 類別名稱自動補全
- **Color Highlight** - 顏色值高亮顯示

### 建構指令
```bash
# 開發模式
npm run dev

# 建構生產版本
npm run build

# 檢查語法錯誤
npm run lint
```

### 調試技巧
```tsx
// 檢查 CSS 變數值
console.log(getComputedStyle(document.documentElement).getPropertyValue('--primary'));

// 動態切換主題
document.body.classList.add('theme-morandi');
document.body.classList.add('dark-theme');

// 檢查可用的 CSS 變數
const computedStyle = getComputedStyle(document.documentElement);
console.log('主色:', computedStyle.getPropertyValue('--primary'));
console.log('間距:', computedStyle.getPropertyValue('--spacing-md'));
```

---

## 📋 更新日誌

- **v3.1** - 移除 Tailwind 依賴，採用純 Venturo CSS 設計系統
- **v3.0** - ~~整合 Tailwind CSS 與 Venturo 設計系統~~ (已移除)
- **v2.0** - 新增莫蘭迪色系擴展
- **v1.0** - 建立基礎設計系統

---

## 🤝 貢獻指南

1. 新增色彩時，請在 `venturo.css` 的 CSS 變數區域中定義
2. 組件樣式在 `venturo.css` 的組件樣式區域中定義
3. 工具類別在工具類別區域中定義
4. 保持與現有設計語言的一致性
5. 優先使用 CSS 變數而非硬編碼值

---

## 🎯 快速參考

### 常用組件類別
```css
.btn, .btn-primary, .btn-secondary, .btn-ghost
.btn-sage, .btn-fog, .btn-terracotta, .btn-warm
.card, .gradient-card, .gradient-card-subtle
.input, .unified-input
.table, .unified-table
.badge, .badge-primary, .badge-success, .badge-warning
```

### 常用工具類別
```css
.flex, .items-center, .justify-center, .gap-2, .gap-4
.p-sm, .p-md, .p-lg, .m-sm, .m-md, .m-lg
.text-center, .font-medium, .font-semibold
.shadow-sm, .shadow-md, .shadow-lg
.rounded-sm, .rounded-md, .rounded-lg, .rounded-full
```

### 常用 CSS 變數
```css
var(--primary), var(--secondary), var(--sage-green)
var(--spacing-sm), var(--spacing-md), var(--spacing-lg)
var(--shadow-sm), var(--shadow-md), var(--shadow-lg)
var(--radius-sm), var(--radius-md), var(--radius-lg)
```

---

**享受使用 Venturo 純 CSS 設計系統！** 🎨✨