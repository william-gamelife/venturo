'use client'

import { useState, useEffect } from 'react'

export function SimpleGridHelper({ isEnabled, onToggle }: { isEnabled: boolean; onToggle: () => void }) {
  const [gridSize, setGridSize] = useState(20)
  const [opacity, setOpacity] = useState(30)
  
  // 快捷鍵支援
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault()
        onToggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggle])
  
  if (!isEnabled) return null

  return (
    <>
      {/* 純視覺網格 - 不影響任何操作 */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // 關鍵：讓滑鼠可以穿透
        zIndex: 9999
      }}>
        {/* 網格背景 */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(to right, rgba(0,255,255,${opacity/100}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,255,255,${opacity/100}) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`
        }} />
        
        {/* 中心十字線 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '2px',
          background: 'rgba(255,0,0,0.5)',
          transform: 'translateY(-50%)'
        }} />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '2px',
          height: '100%',
          background: 'rgba(255,0,0,0.5)',
          transform: 'translateX(-50%)'
        }} />
      </div>

      {/* 控制面板 */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        zIndex: 10000,
        minWidth: '280px',
        border: '2px solid rgba(0,255,255,0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <h3 style={{ margin: 0, color: '#00ffff' }}>
            📐 視覺網格
          </h3>
          <button onClick={onToggle} style={{
            background: 'rgba(255,0,0,0.2)',
            border: '1px solid rgba(255,0,0,0.5)',
            color: '#ff4444',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}>
            ×
          </button>
        </div>
        
        <p style={{ 
          fontSize: '12px', 
          color: '#ff6600', 
          margin: '0 0 15px 0',
          padding: '8px',
          background: 'rgba(255,102,0,0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(255,102,0,0.2)'
        }}>
          ⚠️ 純視覺參考網格，不會改變任何元素位置
        </p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#00ffff' }}>
            網格大小: {gridSize}px
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            style={{ 
              width: '100%', 
              accentColor: '#00ffff'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#00ffff' }}>
            透明度: {opacity}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            style={{ 
              width: '100%', 
              accentColor: '#00ffff'
            }}
          />
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          fontSize: '11px', 
          color: '#888',
          padding: '8px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '4px'
        }}>
          <div style={{ marginBottom: '5px', color: '#00ffff' }}>💡 使用說明：</div>
          <div>• 網格交叉點 = 元素錨點參考</div>
          <div>• 紅線 = 畫面中心對齊線</div>
          <div>• 這只是視覺輔助工具</div>
          <div>• 實際位置會響應式調整</div>
          <div style={{ marginTop: '8px', color: '#00ffff' }}>
            <kbd style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '2px 6px', 
              borderRadius: '3px',
              fontSize: '10px'
            }}>Ctrl + G</kbd> 快速開關
          </div>
        </div>
      </div>
    </>
  )
}