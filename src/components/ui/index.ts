/**
 * UI 組件統一導出
 * 所有基礎 UI 組件從這裡導出
 */

// 通知組件
export { default as Notifications } from './Notifications'
export * from './Notifications'

// 標籤組件
export { Badge } from './badge'
export * from './badge'

// 按鈕組件
export { Button } from './button'
export * from './button'

// 卡片組件
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export * from './card'

// 折疊組件
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
export * from './collapsible'

// 輸入框組件
export { Input } from './input'
export * from './input'

// 標籤組件
export { Label } from './label'
export * from './label'

// 文字區域組件
export { Textarea } from './textarea'
export * from './textarea'

/**
 * 組件使用說明：
 * 
 * 1. Button - 按鈕組件
 *    用途：各種交互按鈕
 *    使用：8 次
 * 
 * 2. Card - 卡片組件
 *    用途：內容容器
 *    使用：4 次
 * 
 * 3. Badge - 標籤組件
 *    用途：狀態標示
 *    使用：4 次
 * 
 * 4. Input - 輸入框組件
 *    用途：表單輸入
 *    使用：3 次
 * 
 * 5. Collapsible - 折疊組件
 *    用途：可折疊內容
 *    使用：2 次
 * 
 * 6. Label - 標籤組件
 *    用途：表單標籤
 *    使用：2 次
 * 
 * 7. Notifications - 通知組件
 *    用途：系統通知
 *    使用：1 次
 * 
 * 8. Textarea - 文字區域組件
 *    用途：多行文本輸入
 *    使用：1 次
 */
