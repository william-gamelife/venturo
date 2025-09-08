import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化日期
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  })
}

// 檢查是否過期
export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

// 生成唯一 ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`
}

// 延遲函數
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 去除 HTML 標籤
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// 截斷文字
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substr(0, length) + '...'
}