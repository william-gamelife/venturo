// Claude 讀取用戶調試配置的工具
// 使用方法：在瀏覽器開發者工具中執行 window.readDebugConfig()

window.readDebugConfig = function() {
  try {
    // 讀取共享配置
    const sharedConfig = localStorage.getItem('gamelife_claude_share')
    const allConfigs = localStorage.getItem('gamelife_debug_configs')
    
    const result = {
      timestamp: new Date().toISOString(),
      shared: sharedConfig ? JSON.parse(sharedConfig) : null,
      allConfigs: allConfigs ? JSON.parse(allConfigs) : [],
      currentUrl: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
    
    console.log('🤖 Claude Debug Config Reader')
    console.log('==============================')
    console.log('配置已讀取，請複製以下 JSON 給 Claude：')
    console.log('')
    console.log(JSON.stringify(result, null, 2))
    console.log('')
    console.log('==============================')
    
    // 自動複製到剪貼簿
    navigator.clipboard.writeText(JSON.stringify(result, null, 2)).then(() => {
      console.log('✅ 配置已自動複製到剪貼簿')
    }).catch(() => {
      console.log('⚠️ 請手動複製上方 JSON')
    })
    
    return result
  } catch (error) {
    console.error('❌ 讀取配置失敗:', error)
    return null
  }
}

console.log('🤖 Debug Config Reader 已載入')
console.log('執行 readDebugConfig() 來讀取用戶配置')