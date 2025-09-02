# 遊戲人生 3.0 🎮

> 極簡化個人管理系統 - 純雲端架構 · 定時同步 · UUID 隔離

## 🌟 特色功能

- **🎨 枯山水主題** - 寧靜優雅的視覺設計
- **👥 可愛登入介面** - 員工選擇卡片設計
- **🔐 安全認證系統** - UUID 隔離 + sessionStorage
- **📋 四欄待辦事項** - 待處理 / 今日 / 本週 / 完成
- **👤 人員管理** - 權限控制與使用者管理
- **⚙️ 個人化設定** - 主題、語言、通知設定

## 🚀 快速開始

### 本地開發
```bash
# 使用 Python HTTP 伺服器
python3 -m http.server 8000

# 或使用 Node.js
npm start
```

開啟瀏覽器並前往 `http://localhost:8000`

### 📱 登入資訊
| 使用者 | 密碼 | 權限 | 職稱 |
|--------|------|------|------|
| William | `pass1234` | 管理員 | IT主管 |
| Carson | `pass1234` | 管理員 | 工程師 |
| Jess | `pass1234` | 一般使用者 | 專案經理 |

## 🛡️ 安全特性

- **UUID 隔離** - 每個使用者資料完全分離
- **sessionStorage** - 關閉瀏覽器自動登出
- **權限控制** - 基於 UUID 的功能存取權限
- **密碼保護** - 密碼永不儲存於瀏覽器

## 📁 專案結構

```
WEB/
├── index.html          # 登入頁面
├── dashboard.html      # 主控制台
├── modules/           
│   ├── auth.js        # 認證模組
│   ├── todos.js       # 待辦事項模組
│   ├── users.js       # 人員管理模組
│   ├── settings.js    # 系統設定模組
│   └── sync.js        # 資料同步模組
├── package.json       # 專案配置
└── README.md         # 說明文件
```

## 🎯 核心功能

### 🔑 登入系統
- 可愛的員工選擇介面（emoji 頭像）
- 點選使用者後顯示密碼輸入框
- 支援 Enter 鍵快速登入
- 登入狀態存於 sessionStorage

### 📋 待辦事項管理
- **四欄看板設計**：待處理 / 今日執行 / 本週規劃 / 已完成
- 優先級標示（高/中/低）
- 到期日期管理
- 拖拉排序功能

### 👥 人員管理
- 使用者卡片設計
- 角色權限管理
- 線上狀態顯示
- 權限等級控制

### ⚙️ 系統設定
- 主題切換（枯山水/深色/明亮/爵士咖啡）
- 多語言支援（繁中/簡中/英文/日文）
- 同步間隔設定
- 通知偏好設定

## 💾 資料儲存

使用 localStorage 搭配 UUID 前綴進行資料隔離：
- 格式：`gamelife_{UUID}_{module}`
- 自動時間戳記
- 版本控制支援

## 🔧 技術架構

- **前端**：純 Vanilla JavaScript + ES6 Modules
- **樣式**：CSS Custom Properties + 響應式設計
- **儲存**：localStorage + sessionStorage
- **架構**：模組化設計 + UUID 隔離
- **部署**：靜態網站託管

## 🌐 部署選項

### GitHub Pages
1. 推送到 GitHub 倉庫
2. 設定 Pages 指向 `main` 分支
3. 訪問 `https://username.github.io/repository-name/`

### Netlify/Vercel
1. 連接 Git 倉庫
2. 設定建構命令：`npm run build`
3. 發布目錄：`./`

### 傳統主機
直接上傳所有檔案到網頁伺服器根目錄

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 文件

---

**遊戲人生 V3.0** - 極簡化個人管理系統 (最後更新: 2025/9/2 - Build #003)

## 🔗 線上版本
- 正式環境：https://gamelife-corner.vercel.app
- GitHub：https://github.com/williamchiencorner-dot/gamelife-v2

### 最新功能
- ✨ 優雅月曆模組 - 莫蘭迪美學設計
- 🎯 待辦事項大改版 - 增強互動功能
- 🎨 INDEX 智能稱謂系統
- 📐 統一設計規範手冊