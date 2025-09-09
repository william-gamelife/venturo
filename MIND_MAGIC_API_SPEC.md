# 光影1320測驗系統 - API規格書

## 📊 系統概述

- **測驗題數**: 60題
- **人格組合**: 1320種唯一模式
- **代號格式**: `A3K-Q25-M7X` （加密，用戶看不出規律）
- **實際編號**: 0-1319 （後台使用，對應1320種組合）

## 🎯 核心邏輯

### Step 1: 收集答案
```typescript
// 用戶完成60題，每題5選項（0/25/50/75/100）
const answers: number[] = [25, 50, 75, 0, 100, ...] // 60個數字
```

### Step 2: 計算12神分數
```typescript
import { calculateResult } from '@/data/mind-magic-questions'

const result = calculateResult(answers);
// 返回:
// {
//   threeHighs: [{code: 'ATH', value: 85}, {code: 'HER', value: 72}, ...],
//   twoLows: [{code: 'FRE', value: 23}, {code: 'LOK', value: 31}],
//   rawScores: { ath: 85, her: 72, ... },
//   patternId: 'A3K-Q25-M7X' // 加密代號
// }
```

### Step 3: 生成加密代號
```typescript
// 已在 calculateResult 中自動生成
// 格式: XYZ-QNN-ABC
// X = 主神首字母 (A=ATH, H=HER, I=ISI...)
// YZ = 隨機字符
// QNN = 加密的編號
// ABC = 校驗碼 + 強度 + 隨機
```

## 🔧 工程師工具

### 代號解析（後台使用）
```typescript
import { PatternCodeUtils } from '@/data/mind-magic-questions'

// 解析代號
const analysis = PatternCodeUtils.analyzeCode('A3K-Q25-M7X');
console.log(analysis);
// {
//   isValid: true,
//   id1320: 847,
//   threeHighs: ['理性之神', '行動之神', '創造之神'],
//   rawPattern: ['ATH', 'HER', 'PRO'],
//   encryptedCode: 'A3K-Q25-M7X'
// }

// 驗證代號有效性
const { isValid } = PatternCodeUtils.decryptCode('A3K-Q25-M7X');
```

## 📡 API 接口設計

### 1. 提交測驗結果
```http
POST /api/mind-magic/submit
Content-Type: application/json

{
  "answers": [25, 50, 75, 0, 100, ...], // 60個數字
  "userId": "optional-user-id"
}
```

**回應:**
```json
{
  "success": true,
  "data": {
    "code": "A3K-Q25-M7X",
    "preview": {
      "threeHighs": ["理性之神", "行動之神", "創造之神"],
      "twoLows": ["療癒之神", "自由之神"]
    },
    "testId": "uuid-here"
  }
}
```

### 2. 查詢測驗結果
```http
GET /api/mind-magic/result/{code}
```

**回應:**
```json
{
  "success": true,
  "data": {
    "code": "A3K-Q25-M7X",
    "threeHighs": ["理性之神", "行動之神", "創造之神"],
    "twoLows": ["療癒之神", "自由之神"],
    "moonWhisper": "你總是替世界找答案。今晚，替自己留一個空白。",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. 管理員解析接口（後台）
```http
GET /api/admin/mind-magic/decode/{code}
Authorization: Bearer admin-token
```

**回應:**
```json
{
  "success": true,
  "data": {
    "encryptedCode": "A3K-Q25-M7X",
    "id1320": 847,
    "rawPattern": ["ATH", "HER", "PRO"],
    "isValid": true
  }
}
```

## 💾 資料庫設計

### 測驗結果表
```sql
CREATE TABLE mind_magic_results (
  id VARCHAR(36) PRIMARY KEY, -- UUID
  encrypted_code VARCHAR(20) UNIQUE NOT NULL, -- A3K-Q25-M7X
  pattern_id INT NOT NULL, -- 0-1319
  raw_answers TEXT NOT NULL, -- JSON array of 60 numbers
  three_highs JSON NOT NULL, -- ["ATH:85", "HER:72", "PRO:62"]
  two_lows JSON NOT NULL, -- ["FRE:23", "LOK:31"]
  user_id VARCHAR(36), -- 可選，如果有用戶系統
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_code (encrypted_code),
  INDEX idx_pattern (pattern_id),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at)
);
```

### 使用範例
```sql
-- 儲存結果
INSERT INTO mind_magic_results (
  id, encrypted_code, pattern_id, raw_answers, 
  three_highs, two_lows, user_id
) VALUES (
  UUID(), 'A3K-Q25-M7X', 847, 
  '[25,50,75,0,100,...]',
  '["ATH:85","HER:72","PRO:62"]',
  '["FRE:23","LOK:31"]',
  'user-uuid'
);

-- 查詢結果
SELECT * FROM mind_magic_results WHERE encrypted_code = 'A3K-Q25-M7X';
```

## 🚀 實作步驟

### Phase 1: 基本功能
1. ✅ 完成60題測驗系統
2. ✅ 實作1320編號生成
3. ✅ 實作代號加密/解密
4. ⏳ 建立 API 接口
5. ⏳ 建立資料庫表

### Phase 2: 擴充功能（未來）
1. 預建1320個英靈描述
2. 代號直接對應英靈資料
3. 自動生成完整人格報告

## 🔍 測試範例

```typescript
// 測試代號生成
import { calculateResult, PatternCodeUtils } from '@/data/mind-magic-questions'

const testAnswers = new Array(60).fill(0).map((_, i) => 
  [0, 25, 50, 75, 100][Math.floor(Math.random() * 5)]
);

const result = calculateResult(testAnswers);
console.log('生成代號:', result.patternId);

const analysis = PatternCodeUtils.analyzeCode(result.patternId);
console.log('解析結果:', analysis);
```

## 📋 檢查清單

- [x] 60題測驗題目完成
- [x] 12神原型系統定義
- [x] 1320組合計算邏輯
- [x] 代號加密系統
- [x] 代號解密工具
- [ ] API 接口實作
- [ ] 資料庫建置
- [ ] 前端整合測試
- [ ] 後台管理功能

---

## 🎯 給工程師的重點提醒

1. **所有核心邏輯都在 `mind-magic-questions.ts` 裡**
2. **直接使用 `calculateResult()` 函數計算結果**
3. **用 `PatternCodeUtils` 工具解析代號**
4. **代號格式固定：XXX-QYY-ZZZ**
5. **用戶只看代號，後台可解析真實組合**