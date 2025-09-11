# VENTURO 專案開發模板

## 📋 專案概述
**專案名稱**: Venturo - 智能生活管理平台  
**技術棧**: Next.js 14 + TypeScript + Supabase + TailwindCSS  
**主題風格**: 莫蘭迪質感 | 狼域孤寂 | 星球科技  
**開發端口**: 3002  

---

## 🏗️ 專案架構

### 核心目錄結構
```
src/
├── app/                    # Next.js App Router 頁面
│   ├── layout.tsx          # 全域佈局
│   ├── page.tsx            # 首頁
│   └── dashboard/          # 儀表板頁面
├── components/             # React 組件
│   ├── ui/                 # 基礎 UI 組件
│   ├── layout/             # 佈局組件
│   └── widgets/            # 功能小工具
├── lib/                    # 工具函數庫
├── types/                  # TypeScript 類型定義
└── styles/                 # 全域樣式
```

### 開發規範

#### 🎨 組件開發規範
1. **檔案命名**: PascalCase (如 `DashboardPage.tsx`)
2. **組件結構**:
   ```tsx
   'use client' // 客戶端組件必須聲明
   
   import { useState, useEffect } from 'react'
   import { useRouter } from 'next/navigation'
   
   interface ComponentProps {
     // 定義 props 類型
   }
   
   export default function Component({ ...props }: ComponentProps) {
     // 組件邏輯
     return (
       <div className="component-wrapper">
         {/* JSX 內容 */}
         <style jsx>{`
           /* 組件樣式 */
         `}</style>
       </div>
     )
   }
   ```

#### 🎨 樣式系統
```tsx
// 主要色彩變數
const colors = {
  morandi: {
    primary: '#c9a961',
    secondary: '#e4d4a8',
    background: '#f5f4f2'
  },
  wolf: {
    primary: '#4a5568',
    secondary: '#718096',
    background: '#1a202c'
  },
  planet: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#0f0f23'
  }
}

// 組件內樣式
<style jsx>{`
  .component-wrapper {
    background: var(--background);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
  }
`}</style>
```

#### 📱 響應式設計
```css
/* 斷點規範 */
@media (max-width: 768px) {
  /* 手機版樣式 */
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* 平板版樣式 */
}

@media (min-width: 1025px) {
  /* 桌面版樣式 */
}
```

---

## 🔧 開發工具與腳本

### 常用指令
```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 代碼檢查
npm run lint

# 清理專案
npm run cleanup
```

### 資料庫管理
```bash
# 執行 Supabase 遷移
./deploy-supabase.sh

# 執行 Schema 更新
./execute-schema.sh

# 系統診斷
./diagnose.sh
```

---

## 📦 核心功能模組

### 1. 認證系統
- **位置**: `src/lib/auth.ts`
- **功能**: 登入、註冊、權限管理
- **角色**: SUPER_ADMIN | BUSINESS_ADMIN | USER

### 2. 儀表板系統
- **位置**: `src/components/DashboardPage.tsx`
- **功能**: 系統總覽、小工具展示
- **特色**: 動態載入、權限控制

### 3. 主題切換
- **位置**: `src/lib/theme.tsx`
- **支援主題**: 莫蘭迪質感、狼域孤寂、星球科技
- **特色**: 即時切換、本地存儲

### 4. 數據管理
- **資料庫**: Supabase PostgreSQL
- **ORM**: Supabase Client
- **類型**: 自動生成 TypeScript 類型

---

## 🎯 組件模板

### 基礎頁面組件
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PageProps {
  // 定義頁面 props
}

export default function Page({ ...props }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 頁面初始化邏輯
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">頁面標題</h1>
      </div>
      
      <div className="page-content">
        {/* 頁面內容 */}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .page-header {
          margin-bottom: 32px;
        }
        
        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}
```

### 小工具卡片組件
```tsx
interface WidgetCardProps {
  title: string
  icon: React.ReactNode
  value: string | number
  description: string
  onClick?: () => void
}

export default function WidgetCard({ 
  title, icon, value, description, onClick 
}: WidgetCardProps) {
  return (
    <div className="widget-card" onClick={onClick}>
      <div className="widget-header">
        <div className="widget-icon">{icon}</div>
        <h3>{title}</h3>
      </div>
      
      <div className="widget-content">
        <div className="stat-number">{value}</div>
        <div className="stat-label">{description}</div>
      </div>

      <style jsx>{`
        .widget-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          transition: all 0.3s ease;
          cursor: ${onClick ? 'pointer' : 'default'};
        }
        
        .widget-card:hover {
          transform: ${onClick ? 'translateY(-2px)' : 'none'};
          box-shadow: ${onClick ? '0 20px 60px rgba(0, 0, 0, 0.12)' : 'none'};
        }
        
        .widget-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .widget-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}
```

---

## 🚀 部署指南

### 本地開發
1. 安裝依賴: `npm install`
2. 設定環境變數: `.env.local`
3. 啟動開發伺服器: `npm run dev`
4. 訪問: `http://localhost:3002`

### 生產部署
1. 建置專案: `npm run build`
2. 檢查代碼: `npm run lint`
3. 部署至 Vercel 或其他平台

### 環境變數範本
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 其他配置
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## 📝 開發檢查清單

### 新功能開發
- [ ] 創建類型定義 (`src/types/`)
- [ ] 實作核心邏輯 (`src/lib/`)
- [ ] 開發 UI 組件 (`src/components/`)
- [ ] 創建頁面 (`src/app/`)
- [ ] 添加樣式與響應式設計
- [ ] 測試功能完整性
- [ ] 代碼檢查與格式化

### 發布前檢查
- [ ] 建置無錯誤 (`npm run build`)
- [ ] 代碼檢查通過 (`npm run lint`)
- [ ] 響應式設計正常
- [ ] 所有主題切換正常
- [ ] 權限控制正確
- [ ] 資料庫連接正常

---

## 🔍 常見問題解決

### 建置錯誤
```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 主題切換問題
```bash
# 檢查主題提供器
# 確認 CSS 變數正確載入
# 驗證本地存儲功能
```

### 認證問題
```bash
# 檢查 Supabase 連接
# 驗證環境變數
# 確認用戶權限設定
```

---

**📅 建立日期**: 2025-01-10  
**🔄 最後更新**: 2025-01-10  
**👤 維護者**: Venturo 開發團隊  

> 💡 **提示**: 遵循此模板規範，確保代碼品質與專案一致性。如有疑問，請參考現有組件實作範例。