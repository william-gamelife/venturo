# 🎮 遊戲人生 - Claude 開發指南

## 專案資訊
- **專案路徑**: `/Users/williamchien/Desktop/Gamelife/GAMELIFE`
- **主要檔案**: `index.html`, `dashboard.html`
- **配置檔案**: `config.js`, `vercel.json`
- **模組目錄**: `modules/`

## Claude 開發設定

### 1. 使用 Claude 編輯器
```bash
# 在專案目錄開啟 Claude
cd /Users/williamchien/Desktop/Gamelife/GAMELIFE
```

### 2. 專案結構
```
GAMELIFE/
├── index.html          # 登入頁面
├── dashboard.html      # 主要儀表板
├── config.js          # 配置檔案
├── modules/           # 功能模組
│   ├── auth.js       # 認證模組
│   ├── sync.js       # 同步模組
│   └── ...           # 其他模組
├── dev-server.js     # Node.js 開發伺服器
├── dev-server.py     # Python 開發伺服器
└── vercel.json       # Vercel 部署配置
```

## 快速開發命令

### 啟動本地伺服器
```bash
# Python 版本（推薦）
python3 -m http.server 8000

# 或使用我們的開發伺服器
python3 dev-server.py
```

### 訪問網站
- **本地開發**: http://localhost:8000
- **直接開啟**: file:///Users/williamchien/Desktop/Gamelife/GAMELIFE/index.html

## Claude 專用提示詞

當你要讓 Claude 幫你寫程式時，可以使用這個提示詞：

```
我正在開發一個名為「遊戲人生」的管理系統。
專案位置：/Users/williamchien/Desktop/Gamelife/GAMELIFE

目前的技術棧：
- 純 HTML/CSS/JavaScript（無框架）
- Supabase 作為後端
- 模組化設計
- 枯山水主題 UI

請幫我 [你的需求]
```

## 常用 Claude 命令

### 查看檔案
```
請查看 /Users/williamchien/Desktop/Gamelife/GAMELIFE/[檔案名稱]
```

### 修改檔案
```
請修改 [檔案名稱]，[具體需求]
```

### 創建新功能
```
請在 modules/ 目錄下創建一個新的 [功能名稱] 模組
```

## 測試帳號資訊
- **William** (管理員): pass1234
- **Carson** (工程師): pass1234
- **KAI** (使用者): pass1234

## Git 部署
```bash
# 使用現有的部署腳本
sh push.sh
```

## 問題排查

### CORS 錯誤
- 使用本地伺服器而非直接開啟檔案
- 或修改 Supabase CORS 設定

### 登入問題
- 檢查 localStorage/sessionStorage
- 確認 Supabase 連線

### 模組載入失敗
- 檢查檔案路徑
- 確認模組匯出格式

---

## Claude 協作提示

1. **告訴 Claude 專案路徑**
   - 總是提供完整路徑：`/Users/williamchien/Desktop/Gamelife/GAMELIFE`

2. **使用檔案系統功能**
   - 讓 Claude 直接讀取和修改檔案
   - 不需要複製貼上程式碼

3. **保持上下文**
   - 告訴 Claude 你正在做什麼功能
   - 提供相關的背景資訊

4. **測試和驗證**
   - 讓 Claude 幫你創建測試案例
   - 要求 Claude 檢查程式碼品質

## 範例對話

```
Claude，我的專案在 /Users/williamchien/Desktop/Gamelife/GAMELIFE
請幫我：
1. 查看 dashboard.html 的結構
2. 新增一個待辦事項功能
3. 使用枯山水主題風格
4. 整合到現有的模組系統
```

---

準備好了！現在你可以直接告訴 Claude 你想要開發什麼功能了。
