class PerformanceMonitor {
  private static metrics = new Map<string, number[]>()
  private static enabled = process.env.NODE_ENV === 'development'

  static startTimer(name: string): string {
    if (!this.enabled) return ''
    
    const id = `${name}_${Date.now()}_${Math.random()}`
    const start = performance.now()
    
    // 儲存開始時間
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(`perf_${id}`, start.toString())
    }
    
    return id
  }

  static endTimer(id: string, operation?: string) {
    if (!this.enabled || !id) return
    
    const startTime = typeof window !== 'undefined' 
      ? window.sessionStorage.getItem(`perf_${id}`)
      : null
      
    if (!startTime) return
    
    const end = performance.now()
    const duration = end - parseFloat(startTime)
    
    // 清理儲存
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(`perf_${id}`)
    }
    
    // 記錄到指標中
    const name = id.split('_')[0]
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    this.metrics.get(name)!.push(duration)
    
    // 開發環境下輸出到 console
    if (operation) {
      console.log(`⏱️ ${operation}: ${duration.toFixed(2)}ms`)
    }
    
    // 如果超過閾值則警告
    if (duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
    }
  }

  static measureAPICall<T>(
    name: string, 
    apiCall: () => Promise<T>
  ): Promise<T> {
    if (!this.enabled) return apiCall()
    
    const timerId = this.startTimer(`api_${name}`)
    
    return apiCall()
      .finally(() => {
        this.endTimer(timerId, `API: ${name}`)
      })
  }

  static getMetrics() {
    if (!this.enabled) return {}
    
    const result: Record<string, {
      count: number
      avg: number
      min: number
      max: number
      total: number
    }> = {}
    
    this.metrics.forEach((durations, name) => {
      const total = durations.reduce((sum, d) => sum + d, 0)
      result[name] = {
        count: durations.length,
        avg: total / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        total
      }
    })
    
    return result
  }

  static clearMetrics() {
    this.metrics.clear()
  }

  static logSummary() {
    if (!this.enabled) return
    
    console.group('📊 Performance Summary')
    const metrics = this.getMetrics()
    
    Object.entries(metrics).forEach(([name, stats]) => {
      console.log(`${name}:`, {
        calls: stats.count,
        average: `${stats.avg.toFixed(2)}ms`,
        total: `${stats.total.toFixed(2)}ms`,
        range: `${stats.min.toFixed(2)}ms - ${stats.max.toFixed(2)}ms`
      })
    })
    
    console.groupEnd()
  }
}

// 包裝 API 呼叫的輔助函數
export function withPerformanceTracking<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  return PerformanceMonitor.measureAPICall(name, operation)
}

// React Hook for component rendering performance
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') return { startRender: () => '', endRender: () => {} }
  
  const startRender = () => PerformanceMonitor.startTimer(`render_${componentName}`)
  const endRender = (id: string) => PerformanceMonitor.endTimer(id, `Render: ${componentName}`)
  
  return { startRender, endRender }
}

export { PerformanceMonitor }