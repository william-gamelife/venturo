# Aceternity UI 效果安裝指令集

這個檔案收集了所有 Aceternity UI 效果的安裝指令，供 GameLife 3.0 專案使用。

## 🎨 背景效果

### 1. Background Gradient Animation (漸層背景動畫)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/background-gradient-animation.json
```
- 已安裝 ✅
- 用途：登入頁面動態背景

### 2. Wavy Background (波浪背景)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/wavy-background.json
```
- 效果：流動的波浪背景

### 3. Sparkles (閃爍效果)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/sparkles.json
```
- 效果：星星閃爍動畫

## 🧩 布局組件

### 4. Bento Grid (網格布局)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/bento-grid.json
```
- 用途：Dashboard 卡片布局

### 5. Layout Grid (佈局網格)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/layout-grid.json
```
- 用途：響應式網格系統

## 🎯 卡片效果

### 6. Cards Demo (卡片組件)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/cards-demo-1.json https://ui.aceternity.com/registry/cards-demo-2.json
```
- 用途：多種卡片樣式

### 7. Card Hover Effect (卡片懸停效果)  
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/card-hover-effect.json
```
- 用途：卡片懸停動畫

### 8. Infinite Moving Cards (無限移動卡片)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/infinite-moving-cards.json
```
- 用途：輪播展示效果

## 🎭 特殊效果

### 9. Text Hover Effect (文字懸停效果)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/text-hover-effect.json
```
- 已安裝 ✅
- 用途：登入頁面 "GAMELIFE" 文字效果

### 10. Typewriter Effect (打字機效果)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/typewriter-effect.json
```
- 用途：動態文字打字效果

### 11. Glowing Effect (發光效果)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/glowing-effect.json
```
- 用途：元素發光動畫

### 12. Lamp (燈光效果)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/lamp.json
```
- 用途：聚光燈效果

### 13. SVG Mask Effect (SVG 遮罩效果)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/svg-mask-effect.json
```
- 用途：SVG 動態遮罩

## 🧭 導航組件

### 14. Floating Navbar (浮動導航欄)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/floating-navbar.json
```
- 用途：懸浮式導航欄

### 15. Sidebar (側邊欄)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/sidebar.json
```
- 用途：折疊式側邊欄

## 🎪 動畫效果

### 16. Container Scroll Animation (容器滾動動畫)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/container-scroll-animation.json
```
- 用途：滾動觸發動畫

### 17. Hero Parallax (英雄視差效果)
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/hero-parallax.json
```
- 用途：首頁英雄區塊

---

## 📋 使用建議

- **登入頁面**：Background Gradient Animation + Text Hover Effect ✅
- **Dashboard**：Bento Grid + Card Hover Effect
- **導航**：Floating Navbar 或 Sidebar
- **特殊頁面**：Sparkles + Glowing Effect

## 🎯 顏色主題配置

GameLife 3.0 使用枯山水主題色彩：
- Primary: `201, 169, 97` (金色)
- Primary Light: `228, 212, 168` 
- Primary Dark: `139, 115, 85`
- Accent: `122, 139, 116` (綠色)
- Background: `244, 241, 235`

這些顏色可以直接用於 Aceternity UI 組件的顏色配置。