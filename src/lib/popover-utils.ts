interface PopoverPosition {
  x: number
  y: number
  placement: 'left' | 'right' | 'top' | 'bottom'
}

interface PopoverOptions {
  width?: number
  height?: number
  margin?: number
  preferredPlacement?: 'left' | 'right' | 'top' | 'bottom'
}

export function calculatePopoverPosition(
  targetRect: DOMRect,
  options: PopoverOptions = {}
): PopoverPosition {
  const {
    width = 380,
    height = 500,
    margin = 20,
    preferredPlacement = 'right'
  } = options

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  let x = 0
  let y = 0
  let placement = preferredPlacement

  // 水平定位邏輯
  if (preferredPlacement === 'right') {
    x = targetRect.right + 8
    if (x + width > windowWidth - margin) {
      // 右邊空間不夠，嘗試左邊
      placement = 'left'
      x = targetRect.left - width - 8
      if (x < margin) {
        // 左邊也不夠，強制在螢幕內
        x = margin
        placement = 'right'
      }
    }
  } else if (preferredPlacement === 'left') {
    x = targetRect.left - width - 8
    if (x < margin) {
      // 左邊空間不夠，嘗試右邊
      placement = 'right'
      x = targetRect.right + 8
      if (x + width > windowWidth - margin) {
        // 右邊也不夠，強制在螢幕內
        x = windowWidth - width - margin
      }
    }
  }

  // 垂直定位邏輯
  if (preferredPlacement === 'top' || preferredPlacement === 'bottom') {
    // 垂直彈出的邏輯
    if (preferredPlacement === 'bottom') {
      y = targetRect.bottom + 8
      if (y + height > windowHeight - margin) {
        placement = 'top'
        y = targetRect.top - height - 8
      }
    } else {
      y = targetRect.top - height - 8
      if (y < margin) {
        placement = 'bottom'
        y = targetRect.bottom + 8
      }
    }
    
    // 水平居中
    x = targetRect.left + (targetRect.width - width) / 2
    if (x < margin) x = margin
    if (x + width > windowWidth - margin) x = windowWidth - width - margin
  } else {
    // 水平彈出時的垂直定位
    y = targetRect.top - 10
    
    // 垂直邊界檢查
    if (y + height > windowHeight - margin) {
      y = windowHeight - height - margin
    }
    if (y < margin) {
      y = margin
    }
  }

  return { x, y, placement }
}