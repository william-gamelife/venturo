# VENTURO 專案開發規範
**重要：所有 AI 助手和開發者必須遵循這些規範**

## 🎯 核心原則
1. **UI 系統**：使用 Venturo 設計系統（莫蘭迪色系）
2. **架構**：Next.js 14 App Router
3. **狀態管理**：Zustand
4. **樣式**：venturo.css（禁用 Tailwind）

## 📐 UI 開發規範

### 必須遵循
- ✅ 使用 `/src/app/venturo.css` 的類別系統
- ✅ 所有組件前綴 `v-` (如 v-button, v-card)
- ✅ SVG 圖標，ViewBox 24x24，stroke-width="2"
- ✅ 莫蘭迪色系配色

### 絕對禁止
- ❌ 使用 Emoji 圖標
- ❌ 使用 Tailwind 類別
- ❌ 行內樣式（除非必要）
- ❌ Material-UI 組件

## 🧩 標準組件
1. **Toggle** - 模式切換
2. **Button** - 按鈕（6種變體）
3. **Dialog** - 彈窗（3種尺寸）
4. **Input** - 輸入框
5. **Card** - 卡片（4種變體）
6. **Menu** - 選單
7. **Form Controls** - 搜尋/篩選/排序

詳細規範：`/UI-DESIGN-SYSTEM.md`

## 🚀 開發流程
1. 查看設計系統：`/design-system`
2. 使用既定組件
3. 新組件須符合規範
4. PR 前檢查一致性

## 💡 AI 助手指引
當使用 AI 協助開發時：
1. 提醒 AI 讀取此檔案
2. 要求遵循 Venturo UI 規範
3. 禁止使用其他 UI 框架

## 📦 檔案結構
```
src/
├── app/
│   ├── venturo.css      # 核心樣式
│   ├── globals.css       # 全域樣式
│   └── (dashboard)/      # 功能模組
├── components/
│   ├── ui/              # 基礎組件
│   └── modules/          # 業務組件
```

## ⚠️ 重要提醒
**這是 Venturo 專案，不是 Corner**
- Venturo = 簡潔現代的使用者介面
- Corner = 企業級複雜系統（參考用）

---
最後更新：2024-01-27
版本：1.0