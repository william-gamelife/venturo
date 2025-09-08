/**
 * 團號/訂單號等流水號生成系統
 * 移植自 CornerERP
 */

// 模擬用的記憶體儲存（開發階段不依賴資料庫）
const memoryStorage: Record<string, number> = {};

/**
 * 取得下一個流水號
 * @param key - 前綴字串（如 'GRP', 'ORD', 'INV'）
 * @param pad - 補零位數
 * @returns 格式化後的編號
 */
export async function getNextNumber(key: string, pad: number = 3): Promise<string> {
  // 開發階段：使用記憶體儲存
  if (!memoryStorage[key]) {
    memoryStorage[key] = 0;
  }
  
  memoryStorage[key]++;
  const number = memoryStorage[key];
  
  return `${key}${number.toString().padStart(pad, '0')}`;
}

/**
 * 取得當前最大號碼（不遞增）
 */
export async function getCurrentNumber(key: string): Promise<number> {
  return memoryStorage[key] || 0;
}

/**
 * 重置流水號（測試用）
 */
export function resetNumbers(): void {
  Object.keys(memoryStorage).forEach(key => {
    delete memoryStorage[key];
  });
}

// 常用的編號類型
export const NumberTypes = {
  GROUP: 'GRP',      // 團號
  ORDER: 'ORD',      // 訂單號
  INVOICE: 'INV',    // 請款單號
  RECEIPT: 'RCP',    // 收款單號
  CUSTOMER: 'CUS',   // 客戶編號
  SUPPLIER: 'SUP',   // 供應商編號
} as const;
