# Venturo ERP System

## 🚨 給 AI 的重要提醒
**請先閱讀 `AI_INSTRUCTIONS.md` - 這是專門為 AI 準備的完整規範**

```bash
# AI 必讀檔案優先級
1. AI_INSTRUCTIONS.md    # 🔴 最重要 - AI 專用指令
2. PROJECT_RULES.md      # 📋 開發規範
3. UI-DESIGN-SYSTEM.md   # 🎨 UI 詳細規範
```

## 🎯 專案識別關鍵字
- **這是 Venturo** (不是 Corner)
- **使用 v- 前綴** (不是 mui- 或其他)
- **莫蘭迪色系** (不是 Material Design)
- **venturo.css** (不是 Tailwind)

## ⚡ 快速 AI 指令

### 給 Claude/ChatGPT：
```
這是 Venturo 專案，請遵循 AI_INSTRUCTIONS.md
```

### 給 Claude Code/Cursor：
```
Venturo: v-組件, venturo.css, 禁止emoji/MUI/Tailwind
```

## 🚀 快速開始

```bash
# 安裝
npm install

# 開發
npm run dev

# 訪問
http://localhost:3002

# 查看 UI 規範
http://localhost:3002/design-system
```

## 📦 核心技術

| 類別 | 技術 | 版本 |
|------|------|------|
| 框架 | Next.js | 14.2.32 |
| UI | Venturo Design System | 1.0 |
| 狀態 | Zustand | 5.0.8 |
| 資料庫 | Supabase | 2.57.4 |
| 樣式 | venturo.css | - |

## 🏗️ 專案結構

```
Venturo-ERP/
├── 📄 AI_INSTRUCTIONS.md    # AI 必讀
├── 📋 PROJECT_RULES.md      # 開發規範
├── 🎨 UI-DESIGN-SYSTEM.md   # UI 規範
├── 🔧 .ai-config.json       # AI 配置
└── src/
    ├── app/
    │   ├── venturo.css      # 核心樣式
    │   └── (dashboard)/      # 功能模組
    └── components/
        └── ui/               # v- 前綴組件
```

## ✅ 正確範例

```typescript
// ✅ 正確
<button className="v-button variant-primary">
<svg viewBox="0 0 24 24" stroke="currentColor">

// ❌ 錯誤
<Button variant="contained">  // MUI
<button className="bg-blue-500">  // Tailwind
<span>📅</span>  // Emoji
```

## 🔍 AI 自我檢查清單

生成程式碼前確認：
- [ ] 讀取了 AI_INSTRUCTIONS.md
- [ ] 使用 v- 前綴命名
- [ ] 使用 venturo.css 類別
- [ ] 沒有 Material-UI
- [ ] 沒有 Tailwind
- [ ] 沒有 Emoji

---

**版本**: 2.0 | **更新**: 2024-01-27 | **狀態**: 🟢 生效中

**記住：這是 Venturo，優雅簡潔是我們的理念**