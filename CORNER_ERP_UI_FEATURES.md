# Corner ERP UI 設計特色記錄

## 📋 左側欄位收合設計

### 🎯 核心概念
Corner ERP 的左側導航欄具有專業的收合功能，包含三種狀態：
- **展開狀態** (open: true) - 完整顯示導航選單
- **收合狀態** (open: false) - 隱藏側邊欄
- **折疊狀態** (foldedOpen) - 只顯示圖示的迷你模式

### 🔧 技術實現

#### 1. Redux 狀態管理
```typescript
// navbarSlice.ts - 側邊欄狀態管理
type initialStateProps = {
  open: boolean;        // 主要開關
  mobileOpen: boolean;  // 手機版開關
  foldedOpen: boolean; // 折疊模式開關
};

// 提供的 Actions
navbarToggleFolded()    // 切換折疊模式
navbarOpenFolded()      // 打開折疊模式
navbarCloseFolded()     // 關閉折疊模式
navbarToggleMobile()    // 切換手機版
navbarToggle()          // 切換主要狀態
```

#### 2. CSS 動畫效果
```typescript
// NavbarStyle1.tsx - 動畫實現
const StyledNavBar = styled('div')<StyledNavBarProps>(({ theme }) => ({
  minWidth: navbarWidth,    // 280px
  width: navbarWidth,
  maxWidth: navbarWidth,
  variants: [
    {
      // 收合時的動畫
      props: ({ open }) => !open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.leavingScreen
        })
      }
    },
    {
      // 左側收合：負邊距隱藏
      props: ({ open, position }) => !open && position === 'left',
      style: {
        marginLeft: `-${navbarWidth}px`  // -280px
      }
    }
  ]
}));
```

#### 3. 響應式設計
```typescript
// 手機版使用 SwipeableDrawer
const StyledNavBarMobile = styled(SwipeableDrawer)(() => ({
  '& .MuiDrawer-paper': {
    minWidth: navbarWidth,  // 280px
    width: navbarWidth,
    maxWidth: navbarWidth
  }
}));
```

### 🎨 設計特色

#### A. 三種模式支援
1. **桌面展開模式** - 完整側邊欄 (280px)
2. **桌面收合模式** - 完全隱藏 (margin: -280px)
3. **手機滑動模式** - SwipeableDrawer 覆蓋層

#### B. 平滑過渡效果
- 使用 Material-UI 的 transitions.create
- easeOut 緩動效果
- 分別控制進入和離開的動畫時間

#### C. 狀態持久化
- Redux 狀態管理，頁面刷新後保持狀態
- 支援手機和桌面不同的狀態記憶

#### D. 可滑動內容區域
```typescript
// NavbarStyle1Content.tsx - 內容區域
<StyledContent
  className="flex min-h-0 flex-1 flex-col"
  option={{ suppressScrollX: true, wheelPropagation: false }}
>
  <Navigation layout="vertical" />
</StyledContent>
```

### 💡 整合到 Venturo 的考量

#### 要學習的重點：
1. **Redux 狀態管理模式** - 統一的 navbar slice
2. **CSS-in-JS 動畫實現** - styled-components 的 variants 模式
3. **響應式切換邏輯** - 桌面版 vs 手機版的不同行為
4. **平滑過渡效果** - Material-UI transitions 的使用

#### 實施優先順序：
1. 🎯 **高優先** - Redux 狀態管理架構
2. 🎯 **高優先** - 基礎收合動畫效果
3. 🔄 **中優先** - 折疊模式 (foldedOpen)
4. 🔄 **中優先** - 手機版滑動抽屜
5. ⚡ **低優先** - 進階過渡效果優化

### 🔗 相關檔案位置
```
cornerERP/src/components/theme-layouts/
├── components/navbar/navbarSlice.ts           # 狀態管理
├── layout1/components/navbar/style-1/
│   ├── NavbarStyle1.tsx                       # 主要組件
│   └── NavbarStyle1Content.tsx                # 內容區域
└── components/navigation/                     # 導航組件
```

---

## 📝 其他 Corner ERP UI 特色 (待補充)

### 🎯 需要學習的其他功能：
- [ ] 企業級表格設計 (DataTable)
- [ ] 專業表單佈局
- [ ] 模組化頁面結構
- [ ] Material-UI 主題系統
- [ ] 響應式設計模式

---

**記錄時間**: 2025-01-11  
**用途**: Venturo × Corner ERP 整合參考