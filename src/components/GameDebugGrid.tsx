'use client'

import { useState, useEffect } from 'react'

interface GameDebugGridProps {
  isEnabled: boolean
  onToggle: () => void
}

export function GameDebugGrid({ isEnabled, onToggle }: GameDebugGridProps) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [gridSize, setGridSize] = useState(20)
  const [showMeasurements, setShowMeasurements] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [draggedElement, setDraggedElement] = useState<Element | null>(null)
  const [savedConfigs, setSavedConfigs] = useState<any[]>([])
  const [currentConfig, setCurrentConfig] = useState('')
  const [elementPositions, setElementPositions] = useState<Record<string, {x: number, y: number}>>({})
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)
  const [resizeMode, setResizeMode] = useState(false)

  // 載入存檔配置
  useEffect(() => {
    const saved = localStorage.getItem('gamelife_debug_configs')
    if (saved) {
      setSavedConfigs(JSON.parse(saved))
    }
    
    // 載入元素位置
    const savedPositions = localStorage.getItem('gamelife_element_positions')
    if (savedPositions) {
      setElementPositions(JSON.parse(savedPositions))
    }

    // 載入元素大小
    const savedSizes = localStorage.getItem('gamelife_element_sizes')
    if (savedSizes) {
      const sizeData = JSON.parse(savedSizes)
      Object.entries(sizeData).forEach(([selector, size]: [string, any]) => {
        const element = document.querySelector(`[data-debug-pos="${selector}"]`) as HTMLElement
        if (element && size) {
          element.style.width = size.width
          element.style.height = size.height
        }
      })
    }
  }, [])

  // 網格對齊功能
  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y }
    
    const snappedX = Math.round(x / gridSize) * gridSize
    const snappedY = Math.round(y / gridSize) * gridSize
    return { x: snappedX, y: snappedY }
  }

  // 應用元素位置和調整大小功能
  useEffect(() => {
    if (!isEnabled) {
      // 清除所有編輯模式的效果
      document.querySelectorAll('[data-debug-pos]').forEach(el => {
        const element = el as HTMLElement
        element.style.pointerEvents = ''
        element.style.outline = ''
        element.style.outlineOffset = ''
        const handle = element.querySelector('.resize-handle')
        if (handle) handle.remove()
      })
      return
    }

    // 禁用或啟用點擊功能
    if (editMode) {
      // 編輯模式：禁用所有可點擊元素的功能，但保留拖拽所需的互動
      document.querySelectorAll('.stats-card, .nav-link, .sidebar-logo, .mode-switcher, .debug-grid-btn, .logout-btn-sidebar, .page-header').forEach(el => {
        const element = el as HTMLElement
        // 阻止原本的點擊事件，但保留拖拽事件
        element.addEventListener('click', preventClick, { capture: true })
      })
      
      // 重新啟用調試面板的功能
      document.querySelectorAll('.debug-control-panel button, .debug-control-panel input, .floating-debug-btn').forEach(el => {
        const element = el as HTMLElement
        element.style.pointerEvents = 'auto'
        element.removeEventListener('click', preventClick, { capture: true })
      })
    } else {
      // 非編輯模式：恢復所有點擊功能
      document.querySelectorAll('.stats-card, .nav-link, .sidebar-logo, .mode-switcher, .debug-grid-btn, .logout-btn-sidebar, .page-header').forEach(el => {
        const element = el as HTMLElement
        element.style.pointerEvents = ''
        element.removeEventListener('click', preventClick, { capture: true })
      })
    }

    function preventClick(e: Event) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
    }

    // 應用位置和大小調整
    const allElements = document.querySelectorAll('[data-debug-pos]')
    allElements.forEach(el => {
      const element = el as HTMLElement
      const selector = element.getAttribute('data-debug-pos')!
      const position = elementPositions[selector] || { x: 0, y: 0 }
      
      element.style.position = 'relative'
      element.style.transform = `translate(${position.x}px, ${position.y}px)`
      element.style.zIndex = editMode ? '1000' : ''
      
      // 添加調整大小模式的視覺提示
      if (editMode && resizeMode) {
        element.style.outline = '2px dashed #ff6600'
        element.style.outlineOffset = '4px'
        element.style.pointerEvents = 'auto' // 調整大小時需要能點擊
        
        // 添加調整大小把手
        if (!element.querySelector('.resize-handle')) {
          const handle = document.createElement('div')
          handle.className = 'resize-handle'
          handle.innerHTML = '↘'
          handle.style.cssText = `
            position: absolute;
            bottom: -8px;
            right: -8px;
            width: 16px;
            height: 16px;
            background: #ff6600;
            color: white;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: se-resize;
            border-radius: 3px;
            z-index: 10001;
            user-select: none;
            pointer-events: auto;
          `
          element.appendChild(handle)
        }
      } else if (editMode && !resizeMode) {
        // 拖拽模式
        element.style.outline = '2px dashed #00ff00'
        element.style.outlineOffset = '4px'
        element.style.pointerEvents = 'auto' // 拖拽時需要能點擊
        element.style.cursor = 'grab'
        
        // 移除調整大小把手
        const handle = element.querySelector('.resize-handle')
        if (handle) handle.remove()
      } else {
        // 非編輯模式
        element.style.outline = ''
        element.style.outlineOffset = ''
        element.style.cursor = ''
        
        // 移除調整大小把手
        const handle = element.querySelector('.resize-handle')
        if (handle) handle.remove()
      }
    })
  }, [elementPositions, isEnabled, editMode, resizeMode])

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault()
        onToggle()
      }
      if (isEnabled && e.ctrlKey) {
        if (e.key === '=') {
          e.preventDefault()
          setZoomLevel(prev => Math.min(prev + 10, 200))
        }
        if (e.key === '-') {
          e.preventDefault()
          setZoomLevel(prev => Math.max(prev - 10, 50))
        }
        if (e.key === '0') {
          e.preventDefault()
          setZoomLevel(100)
        }
        if (e.key === 's') {
          e.preventDefault()
          saveCurrentConfig()
        }
        if (e.key === 'e') {
          e.preventDefault()
          setEditMode(!editMode)
        }
        if (e.key === 'r' && editMode) {
          e.preventDefault()
          setResizeMode(!resizeMode)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEnabled, onToggle, editMode])

  // 元素拖拽和調整大小功能 - 畫面鎖定版本
  useEffect(() => {
    if (!isEnabled || !editMode) return

    let dragOffset = { x: 0, y: 0 }
    let originalElementPosition = { x: 0, y: 0 }
    let originalElementRect: DOMRect | null = null
    let isDragging = false
    let isResizing = false
    let resizeStart = { width: 0, height: 0 }
    let dragStartTime = 0
    let hasMoved = false
    let frozenSnapshot: { element: HTMLElement, rect: DOMRect, styles: CSSStyleDeclaration }[] = []
    let overlayLayer: HTMLDivElement | null = null

    // 創建凍結畫面覆蓋層
    const createFrozenOverlay = () => {
      if (overlayLayer) return overlayLayer

      // 創建覆蓋層
      overlayLayer = document.createElement('div')
      overlayLayer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10000;
        pointer-events: none;
        background: rgba(0, 0, 0, 0.02);
      `
      
      // 凍結所有可拖拽元素的當前狀態，防止響應式布局變化
      frozenSnapshot = []
      document.querySelectorAll('[data-debug-pos]').forEach(el => {
        const element = el as HTMLElement
        const rect = element.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(element)
        
        // 保存原始狀態
        frozenSnapshot.push({
          element,
          rect,
          styles: computedStyle
        })
        
        // 強制固定尺寸和位置，防止響應式變化
        const originalPosition = element.style.position
        const originalWidth = element.style.width
        const originalHeight = element.style.height
        const originalMinWidth = element.style.minWidth
        const originalMinHeight = element.style.minHeight
        const originalMaxWidth = element.style.maxWidth
        const originalMaxHeight = element.style.maxHeight
        
        // 記住原始樣式以便恢復
        element.setAttribute('data-frozen-original-position', originalPosition || '')
        element.setAttribute('data-frozen-original-width', originalWidth || '')
        element.setAttribute('data-frozen-original-height', originalHeight || '')
        element.setAttribute('data-frozen-original-minwidth', originalMinWidth || '')
        element.setAttribute('data-frozen-original-minheight', originalMinHeight || '')
        element.setAttribute('data-frozen-original-maxwidth', originalMaxWidth || '')
        element.setAttribute('data-frozen-original-maxheight', originalMaxHeight || '')
        
        // 強制固定當前尺寸，防止縮放
        element.style.width = `${rect.width}px`
        element.style.height = `${rect.height}px`
        element.style.minWidth = `${rect.width}px`
        element.style.minHeight = `${rect.height}px`
        element.style.maxWidth = `${rect.width}px`
        element.style.maxHeight = `${rect.height}px`
        element.style.flex = 'none' // 防止 flexbox 調整
        element.style.overflow = 'hidden' // 防止內容溢出
      })
      
      // 暫時禁用窗口調整大小事件
      document.body.style.overflow = 'hidden'
      
      document.body.appendChild(overlayLayer)
      return overlayLayer
    }

    // 移除凍結覆蓋層
    const removeFrozenOverlay = () => {
      if (overlayLayer) {
        document.body.removeChild(overlayLayer)
        overlayLayer = null
      }
      
      // 恢復所有元素的原始樣式
      document.querySelectorAll('[data-debug-pos]').forEach(el => {
        const element = el as HTMLElement
        
        // 恢復原始樣式
        const originalPosition = element.getAttribute('data-frozen-original-position')
        const originalWidth = element.getAttribute('data-frozen-original-width')
        const originalHeight = element.getAttribute('data-frozen-original-height')
        const originalMinWidth = element.getAttribute('data-frozen-original-minwidth')
        const originalMinHeight = element.getAttribute('data-frozen-original-minheight')
        const originalMaxWidth = element.getAttribute('data-frozen-original-maxwidth')
        const originalMaxHeight = element.getAttribute('data-frozen-original-maxheight')
        
        if (originalPosition !== null) {
          element.style.position = originalPosition
          element.style.width = originalWidth || ''
          element.style.height = originalHeight || ''
          element.style.minWidth = originalMinWidth || ''
          element.style.minHeight = originalMinHeight || ''
          element.style.maxWidth = originalMaxWidth || ''
          element.style.maxHeight = originalMaxHeight || ''
          element.style.flex = '' // 恢復 flexbox
          element.style.overflow = '' // 恢復溢出設定
          
          // 清除凍結屬性
          element.removeAttribute('data-frozen-original-position')
          element.removeAttribute('data-frozen-original-width')
          element.removeAttribute('data-frozen-original-height')
          element.removeAttribute('data-frozen-original-minwidth')
          element.removeAttribute('data-frozen-original-minheight')
          element.removeAttribute('data-frozen-original-maxwidth')
          element.removeAttribute('data-frozen-original-maxheight')
        }
      })
      
      // 恢復窗口滾動
      document.body.style.overflow = ''
      
      frozenSnapshot = []
    }

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element
      
      // 檢查是否點擊調整大小把手
      if (target.classList.contains('resize-handle') && resizeMode) {
        e.preventDefault()
        e.stopPropagation()
        isResizing = true
        
        const draggableElement = target.closest('[data-debug-pos]') as HTMLElement
        if (draggableElement) {
          setDraggedElement(draggableElement)
          
          const rect = draggableElement.getBoundingClientRect()
          resizeStart = {
            width: rect.width,
            height: rect.height
          }
          
          // 創建凍結層
          createFrozenOverlay()
          
          draggableElement.style.cursor = 'se-resize'
          draggableElement.style.opacity = '0.8'
          draggableElement.style.zIndex = '10001'
        }
        return
      }
      
      // 正常拖拽
      const draggableElement = target.closest('[data-debug-pos]')
      
      if (draggableElement && !resizeMode) {
        e.preventDefault()
        e.stopPropagation() // 防止事件冒泡干擾其他元素
        setDraggedElement(draggableElement)
        
        // 記錄拖拽開始時間和位置
        dragStartTime = Date.now()
        hasMoved = false
        
        // 記錄元素的原始位置資訊
        originalElementRect = draggableElement.getBoundingClientRect()
        const debugPos = draggableElement.getAttribute('data-debug-pos')!
        const currentPosition = elementPositions[debugPos] || { x: 0, y: 0 }
        originalElementPosition = { ...currentPosition }
        
        // 計算滑鼠相對於元素的偏移
        dragOffset = {
          x: e.clientX - originalElementRect.left,
          y: e.clientY - originalElementRect.top
        }
        
        // 為正常拖拽也創建凍結層，防止響應式布局干擾
        createFrozenOverlay()
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedElement) return
      
      const element = draggedElement as HTMLElement
      
      if (isResizing) {
        // 調整大小邏輯
        const rect = element.getBoundingClientRect()
        const newWidth = Math.max(100, resizeStart.width + (e.clientX - rect.right))
        const newHeight = Math.max(50, resizeStart.height + (e.clientY - rect.bottom))
        
        element.style.width = `${newWidth}px`
        element.style.height = `${newHeight}px`
        element.style.minWidth = '100px'
        element.style.minHeight = '50px'
        
      } else if (!isDragging && !hasMoved) {
        // 檢查是否真的開始拖拽（滑鼠移動一定距離才算拖拽）
        const moveThreshold = 5 // 5px 門檻
        if (!originalElementRect) return
        
        const deltaX = Math.abs(e.clientX - (originalElementRect.left + dragOffset.x))
        const deltaY = Math.abs(e.clientY - (originalElementRect.top + dragOffset.y))
        
        if (deltaX > moveThreshold || deltaY > moveThreshold) {
          // 開始真正的拖拽
          isDragging = true
          hasMoved = true
          
          // 設置拖拽樣式
          element.style.cursor = 'grabbing'
          element.style.opacity = '0.8'
          element.style.zIndex = '10001'
          element.style.position = 'fixed'
          element.style.pointerEvents = 'none'
          
          // 立即定位到滑鼠位置
          element.style.left = `${e.clientX - dragOffset.x}px`
          element.style.top = `${e.clientY - dragOffset.y}px`
          element.style.transform = 'none'
        }
      } else if (isDragging) {
        // 持續拖拽邏輯
        hasMoved = true
        let newLeft = e.clientX - dragOffset.x
        let newTop = e.clientY - dragOffset.y
        
        // 限制拖拽範圍在視窗內
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 200))
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - 100))
        
        // 網格對齊
        if (snapToGrid) {
          const snapped = snapToGridPosition(newLeft, newTop)
          newLeft = snapped.x
          newTop = snapped.y
        }
        
        element.style.left = `${newLeft}px`
        element.style.top = `${newTop}px`
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!draggedElement) return
      
      const element = draggedElement as HTMLElement
      const debugPos = draggedElement.getAttribute('data-debug-pos')!
      
      if (isResizing) {
        // 完成調整大小
        isResizing = false
        
        // 保存大小到 localStorage
        const sizeData = JSON.parse(localStorage.getItem('gamelife_element_sizes') || '{}')
        sizeData[debugPos] = {
          width: element.style.width,
          height: element.style.height
        }
        localStorage.setItem('gamelife_element_sizes', JSON.stringify(sizeData))
        
        element.style.cursor = ''
        element.style.opacity = ''
        element.style.zIndex = ''
        
      } else if (isDragging && hasMoved && originalElementRect) {
        // 只有真正拖拽過才保存位置
        isDragging = false
        
        // 計算拖拽的實際偏移量
        const currentLeft = parseInt(element.style.left)
        const currentTop = parseInt(element.style.top)
        
        // 計算相對於原始位置的偏移（真正的偏移量）
        const deltaX = currentLeft - originalElementRect.left
        const deltaY = currentTop - originalElementRect.top
        
        // 新的相對位置 = 原本的相對位置 + 拖拽偏移量
        let newRelativeX = originalElementPosition.x + deltaX
        let newRelativeY = originalElementPosition.y + deltaY
        
        // 網格對齊最終位置
        if (snapToGrid) {
          const snapped = snapToGridPosition(newRelativeX, newRelativeY)
          newRelativeX = snapped.x
          newRelativeY = snapped.y
        }
        
        // 保存新位置
        const newPositions = {
          ...elementPositions,
          [debugPos]: { x: newRelativeX, y: newRelativeY }
        }
        setElementPositions(newPositions)
        localStorage.setItem('gamelife_element_positions', JSON.stringify(newPositions))
        
        // 恢復元素樣式並使用相對定位
        element.style.position = 'relative'
        element.style.left = ''
        element.style.top = ''
        element.style.transform = `translate(${newRelativeX}px, ${newRelativeY}px)`
        element.style.cursor = ''
        element.style.opacity = ''
        element.style.zIndex = ''
        element.style.pointerEvents = ''
        
      } else if (draggedElement && !hasMoved) {
        // 只是點擊，沒有拖拽 - 只清除臨時樣式，保持原本位置
        const currentTransform = element.style.transform
        
        element.style.position = ''
        element.style.left = ''
        element.style.top = ''
        element.style.cursor = ''
        element.style.opacity = ''
        element.style.zIndex = ''
        element.style.pointerEvents = ''
        
        // 保持原本的 transform 不變
        if (currentTransform && currentTransform.includes('translate')) {
          element.style.transform = currentTransform
        }
      }
      
      // 移除凍結覆蓋層（無論是拖拽還是調整大小都需要清除）
      removeFrozenOverlay()
      
      // 重置所有狀態變數
      isDragging = false
      isResizing = false
      hasMoved = false
      originalElementRect = null
      originalElementPosition = { x: 0, y: 0 }
      dragOffset = { x: 0, y: 0 }
      setDraggedElement(null)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && draggedElement) {
        // ESC 取消拖拽
        const element = draggedElement as HTMLElement
        element.style.position = 'relative'
        element.style.left = ''
        element.style.top = ''
        element.style.cursor = ''
        element.style.opacity = ''
        element.style.zIndex = ''
        element.style.pointerEvents = ''
        
        // 移除凍結覆蓋層
        removeFrozenOverlay()
        
        // 重置所有狀態變數
        setDraggedElement(null)
        isDragging = false
        isResizing = false
        hasMoved = false
        originalElementRect = null
        originalElementPosition = { x: 0, y: 0 }
        dragOffset = { x: 0, y: 0 }
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isEnabled, editMode, draggedElement, elementPositions, snapToGrid, gridSize])

  const saveCurrentConfig = () => {
    const configName = currentConfig || `配置_${new Date().toLocaleString()}`
    const config = {
      name: configName,
      timestamp: Date.now(),
      zoomLevel,
      gridSize,
      showMeasurements,
      snapToGrid,
      url: window.location.pathname,
      elementPositions: elementPositions,
      elements: Array.from(document.querySelectorAll('[data-debug-pos]')).map(el => ({
        selector: el.getAttribute('data-debug-pos'),
        position: el.getBoundingClientRect(),
        styles: el.getAttribute('style') || ''
      }))
    }

    const newConfigs = [...savedConfigs, config]
    setSavedConfigs(newConfigs)
    localStorage.setItem('gamelife_debug_configs', JSON.stringify(newConfigs))
    setCurrentConfig('')
    alert(`✅ 配置已儲存: ${configName}`)
  }

  const loadConfig = (config: any) => {
    setZoomLevel(config.zoomLevel)
    setGridSize(config.gridSize)
    setShowMeasurements(config.showMeasurements)
    
    if (config.snapToGrid !== undefined) {
      setSnapToGrid(config.snapToGrid)
    }
    
    if (config.elementPositions) {
      setElementPositions(config.elementPositions)
      localStorage.setItem('gamelife_element_positions', JSON.stringify(config.elementPositions))
    }
    
    alert(`🎮 已載入配置: ${config.name}`)
  }

  const exportConfig = () => {
    const configData = {
      timestamp: Date.now(),
      configs: savedConfigs,
      currentState: {
        zoomLevel,
        gridSize,
        showMeasurements,
        url: window.location.pathname
      }
    }
    
    const dataStr = JSON.stringify(configData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `gamelife_debug_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const shareWithClaude = () => {
    const configData = {
      timestamp: Date.now(),
      configs: savedConfigs,
      currentState: {
        zoomLevel,
        gridSize,
        showMeasurements,
        url: window.location.pathname
      }
    }
    
    // 儲存到特殊的共享 key
    localStorage.setItem('gamelife_claude_share', JSON.stringify(configData))
    
    const message = `🤖 配置已準備好讓 Claude 讀取！

請告訴 Claude：
"請讀取我的調試配置並幫我優化"

或者複製這段配置給 Claude：
\`\`\`json
${JSON.stringify(configData, null, 2)}
\`\`\`

配置包含：
- 當前縮放: ${zoomLevel}%
- 網格大小: ${gridSize}px  
- 測量線: ${showMeasurements ? '開啟' : '關閉'}
- 頁面: ${window.location.pathname}
- 存檔數量: ${savedConfigs.length}`

    // 創建一個模態框顯示訊息
    const modal = document.createElement('div')
    modal.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); 
        display: flex; align-items: center; justify-content: center; 
        z-index: 99999;
        font-family: monospace;
      ">
        <div style="
          background: rgba(0,0,0,0.95); 
          color: white; 
          padding: 24px; 
          border-radius: 12px; 
          max-width: 600px; 
          border: 2px solid #00ffff;
          box-shadow: 0 0 40px rgba(0,255,255,0.3);
        ">
          <pre style="white-space: pre-wrap; font-size: 12px; line-height: 1.4;">${message}</pre>
          <button onclick="this.closest('div').parentElement.remove()" style="
            margin-top: 16px; 
            background: #00ffff; 
            color: black; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 6px; 
            cursor: pointer;
            font-weight: bold;
          ">關閉</button>
        </div>
      </div>
    `
    document.body.appendChild(modal)
    
    // 自動複製到剪貼簿
    navigator.clipboard.writeText(JSON.stringify(configData, null, 2)).catch(() => {})
  }

  // 應用縮放效果到 body
  useEffect(() => {
    if (isEnabled) {
      document.body.style.transform = `scale(${zoomLevel / 100})`
      document.body.style.transformOrigin = 'top left'
      document.body.style.width = `${100 / (zoomLevel / 100)}%`
      document.body.style.height = `${100 / (zoomLevel / 100)}%`
    } else {
      document.body.style.transform = ''
      document.body.style.transformOrigin = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }

    return () => {
      document.body.style.transform = ''
      document.body.style.transformOrigin = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }
  }, [isEnabled, zoomLevel])

  if (!isEnabled) return null

  return (
    <>
      {/* 網格覆蓋層 */}
      <div className="game-debug-grid">
        <div 
          className="grid-overlay"
          style={{
            backgroundSize: `${gridSize}px ${gridSize}px`
          }}
        />
        
        {/* 測量線 */}
        {showMeasurements && (
          <>
            <div className="ruler horizontal" />
            <div className="ruler vertical" />
          </>
        )}
      </div>

      {/* 調試控制面板 */}
      <div className="debug-control-panel" style={{ display: isMinimized ? 'none' : 'block' }}>
        <div className="debug-header">
          <h3>🎮 遊戲調試模式</h3>
          <div className="header-buttons">
            <button 
              onClick={() => setIsMinimized(true)} 
              className="minimize-btn"
              title="最小化面板"
            >
              −
            </button>
            <button onClick={onToggle} className="close-btn" title="關閉調試">×</button>
          </div>
        </div>
        
        <div className="debug-controls">
          {/* 編輯模式切換 */}
          <div className="control-group">
            <button 
              className={`edit-mode-btn ${editMode ? 'active' : ''}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? '🎯 編輯模式 ON' : '✋ 編輯模式 OFF'}
            </button>
          </div>

          {editMode && (
            <div className="control-group">
              <button 
                className={`resize-mode-btn ${resizeMode ? 'active' : ''}`}
                onClick={() => setResizeMode(!resizeMode)}
              >
                {resizeMode ? '📏 調整大小 ON' : '📦 調整大小 OFF'}
              </button>
            </div>
          )}

          <div className="control-group">
            <label>縮放比例: {zoomLevel}%</label>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="zoom-slider"
            />
            <div className="zoom-buttons">
              <button onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}>-</button>
              <button onClick={() => setZoomLevel(100)}>重置</button>
              <button onClick={() => setZoomLevel(prev => Math.min(prev + 10, 200))}>+</button>
            </div>
          </div>

          <div className="control-group">
            <label>網格大小: {gridSize}px</label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="grid-slider"
            />
          </div>

          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showMeasurements}
                onChange={(e) => setShowMeasurements(e.target.checked)}
              />
              顯示測量線
            </label>
          </div>

          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
              />
              自動對齊網格
            </label>
          </div>

          {/* 存檔系統 */}
          <div className="control-group save-section">
            <div className="save-input-group">
              <input
                type="text"
                placeholder="輸入配置名稱..."
                value={currentConfig}
                onChange={(e) => setCurrentConfig(e.target.value)}
                className="config-name-input"
              />
              <button onClick={saveCurrentConfig} className="save-btn">💾 存檔</button>
            </div>
            
            {savedConfigs.length > 0 && (
              <div className="saved-configs">
                <label>已存檔配置:</label>
                {savedConfigs.map((config, index) => (
                  <div key={index} className="config-item">
                    <span className="config-name">{config.name}</span>
                    <div className="config-actions">
                      <button onClick={() => loadConfig(config)} className="load-btn">載入</button>
                      <button 
                        onClick={() => {
                          const newConfigs = savedConfigs.filter((_, i) => i !== index)
                          setSavedConfigs(newConfigs)
                          localStorage.setItem('gamelife_debug_configs', JSON.stringify(newConfigs))
                        }}
                        className="delete-btn"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="export-buttons">
              <button onClick={shareWithClaude} className="share-claude-btn">🤖 分享給 Claude</button>
              <button onClick={exportConfig} className="export-btn">📤 匯出檔案</button>
            </div>

            <button 
              onClick={() => {
                setElementPositions({})
                localStorage.removeItem('gamelife_element_positions')
                // 重置所有元素位置
                document.querySelectorAll('[data-debug-pos]').forEach(el => {
                  const element = el as HTMLElement
                  element.style.position = ''
                  element.style.transform = ''
                  element.style.zIndex = ''
                })
                alert('🔄 所有元素位置已重置')
              }}
              className="reset-positions-btn"
            >
              🔄 重置所有位置
            </button>
          </div>
        </div>

        <div className="debug-info">
          <div className="info-item">
            <span>快捷鍵:</span>
            <div className="shortcuts">
              <kbd>Ctrl + G</kbd> 開關網格
              <kbd>Ctrl + E</kbd> 編輯模式
              <kbd>Ctrl + R</kbd> 調整大小
              <kbd>Ctrl + S</kbd> 快速存檔
              <kbd>Ctrl + +/-</kbd> 縮放
              <kbd>Ctrl + 0</kbd> 重置
              <kbd>ESC</kbd> 取消操作
            </div>
          </div>
          <div className="info-item">
            <span>當前頁面:</span>
            <span>{window.location.pathname}</span>
          </div>
          <div className="info-item">
            <span>視窗尺寸:</span>
            <span>{window.innerWidth} × {window.innerHeight}</span>
          </div>
        </div>
      </div>

      {/* 最小化時的懸浮按鈕 */}
      {isMinimized && (
        <div className="floating-debug-btn" onClick={() => setIsMinimized(false)}>
          🎮
        </div>
      )}

      <style jsx>{`
        .game-debug-grid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
        }

        .grid-overlay {
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(to right, rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 255, 0.3) 1px, transparent 1px);
          position: relative;
        }

        .ruler {
          position: absolute;
          background: rgba(255, 0, 0, 0.8);
        }

        .ruler.horizontal {
          top: 50%;
          left: 0;
          width: 100%;
          height: 2px;
          transform: translateY(-50%);
        }

        .ruler.vertical {
          left: 50%;
          top: 0;
          width: 2px;
          height: 100%;
          transform: translateX(-50%);
        }

        .debug-control-panel {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 380px;
          max-height: 90vh;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.95);
          color: white;
          border-radius: 12px;
          padding: 20px;
          font-size: 14px;
          pointer-events: auto;
          z-index: 10000;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(0, 255, 255, 0.5);
          box-shadow: 0 10px 40px rgba(0, 255, 255, 0.3);
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header-buttons {
          display: flex;
          gap: 8px;
        }

        .debug-header h3 {
          margin: 0;
          color: #00ffff;
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn, .minimize-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 0, 0, 0.3);
          border-color: rgba(255, 0, 0, 0.5);
        }

        .minimize-btn:hover {
          background: rgba(255, 165, 0, 0.3);
          border-color: rgba(255, 165, 0, 0.5);
        }

        .floating-debug-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 255, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          z-index: 10001;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          animation: float 3s ease-in-out infinite;
        }

        .floating-debug-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .debug-controls {
          margin-bottom: 16px;
        }

        .control-group {
          margin-bottom: 16px;
        }

        .control-group label {
          display: block;
          margin-bottom: 8px;
          color: #00ffff;
          font-weight: 500;
        }

        .zoom-slider, .grid-slider {
          width: 100%;
          margin-bottom: 8px;
          accent-color: #00ffff;
        }

        .zoom-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .zoom-buttons button {
          background: rgba(0, 255, 255, 0.2);
          border: 1px solid rgba(0, 255, 255, 0.5);
          color: #00ffff;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .zoom-buttons button:hover {
          background: rgba(0, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          accent-color: #00ffff;
        }

        .debug-info {
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .info-item span:first-child {
          color: #00ffff;
          font-weight: 500;
        }

        .shortcuts {
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-end;
        }

        .edit-mode-btn {
          width: 100%;
          padding: 12px;
          background: rgba(255, 165, 0, 0.1);
          color: #ffa500;
          border: 2px solid rgba(255, 165, 0, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .edit-mode-btn.active {
          background: rgba(255, 165, 0, 0.3);
          border-color: #ffa500;
          box-shadow: 0 0 20px rgba(255, 165, 0, 0.4);
          animation: pulse 2s infinite;
        }

        .resize-mode-btn {
          width: 100%;
          padding: 12px;
          background: rgba(102, 255, 255, 0.1);
          color: #66ffff;
          border: 2px solid rgba(102, 255, 255, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .resize-mode-btn.active {
          background: rgba(102, 255, 255, 0.3);
          border-color: #66ffff;
          box-shadow: 0 0 20px rgba(102, 255, 255, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .save-section {
          margin-top: 16px;
          padding: 16px;
          background: rgba(0, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 255, 0.2);
        }

        .save-input-group {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .config-name-input {
          flex: 1;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          font-size: 12px;
        }

        .config-name-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .save-btn, .load-btn, .delete-btn, .export-btn {
          padding: 8px 12px;
          border: 1px solid;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .save-btn, .export-btn {
          background: rgba(0, 255, 0, 0.1);
          color: #00ff00;
          border-color: rgba(0, 255, 0, 0.3);
        }

        .save-btn:hover, .export-btn:hover {
          background: rgba(0, 255, 0, 0.2);
          transform: translateY(-1px);
        }

        .load-btn {
          background: rgba(0, 150, 255, 0.1);
          color: #0096ff;
          border-color: rgba(0, 150, 255, 0.3);
        }

        .load-btn:hover {
          background: rgba(0, 150, 255, 0.2);
        }

        .delete-btn {
          background: rgba(255, 0, 0, 0.1);
          color: #ff4444;
          border-color: rgba(255, 0, 0, 0.3);
        }

        .delete-btn:hover {
          background: rgba(255, 0, 0, 0.2);
        }

        .saved-configs {
          margin: 12px 0;
        }

        .config-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          margin-bottom: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }

        .config-name {
          flex: 1;
          font-size: 12px;
          color: #00ffff;
        }

        .config-actions {
          display: flex;
          gap: 6px;
        }

        .export-buttons {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .export-btn, .share-claude-btn {
          flex: 1;
        }

        .share-claude-btn {
          background: rgba(255, 165, 0, 0.1);
          color: #ffa500;
          border-color: rgba(255, 165, 0, 0.3);
          font-weight: 600;
        }

        .share-claude-btn:hover {
          background: rgba(255, 165, 0, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(255, 165, 0, 0.3);
        }

        .reset-positions-btn {
          width: 100%;
          margin-top: 8px;
          padding: 10px 12px;
          background: rgba(255, 255, 0, 0.1);
          color: #ffff00;
          border: 1px solid rgba(255, 255, 0, 0.3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .reset-positions-btn:hover {
          background: rgba(255, 255, 0, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 255, 0, 0.3);
        }

        kbd {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .debug-control-panel {
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            width: auto;
            font-size: 12px;
          }
          
          .shortcuts {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 4px;
          }
        }
      `}</style>
    </>
  )
}