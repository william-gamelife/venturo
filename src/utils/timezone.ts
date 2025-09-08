/**
 * 時區和日期工具函數
 */

/**
 * 將日期範圍格式化為 API 需要的格式
 */
export function formatDateRangeForAPI(startDate: Date | null, endDate: Date | null) {
  if (!startDate || !endDate) {
    return { start: null, end: null };
  }

  return {
    start: startDate.toISOString().split('T')[0], // YYYY-MM-DD
    end: endDate.toISOString().split('T')[0]     // YYYY-MM-DD
  };
}

/**
 * 格式化日期為本地字符串
 */
export function formatDate(date: Date | string | null, locale: string = 'zh-TW') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * 格式化日期時間為本地字符串
 */
export function formatDateTime(date: Date | string | null, locale: string = 'zh-TW') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}