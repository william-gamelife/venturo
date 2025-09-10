'use client'

interface VersionIndicatorProps {
  page: string
  authSystem: 'venturoAuth' | 'authManager' | 'localAuth' | 'mixed'
  version: string
  status?: 'working' | 'loading' | 'error'
}

export function VersionIndicator({ 
  page, 
  authSystem, 
  version, 
  status = 'working' 
}: VersionIndicatorProps) {
  const getAuthColor = () => {
    switch (authSystem) {
      case 'venturoAuth': return '#10b981' // 綠色 - 新系統
      case 'authManager': return '#f59e0b'  // 黃色 - 混合系統  
      case 'localAuth': return '#ef4444'    // 紅色 - 舊系統
      case 'mixed': return '#8b5cf6'        // 紫色 - 混合使用
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'working': return '#10b981'
      case 'loading': return '#f59e0b' 
      case 'error': return '#ef4444'
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 9999,
        minWidth: '120px'
      }}
    >
      <div style={{ marginBottom: '2px', fontWeight: 'bold' }}>
        📄 {page}
      </div>
      <div style={{ marginBottom: '2px' }}>
        🔐 <span style={{ color: getAuthColor() }}>{authSystem}</span>
      </div>
      <div style={{ marginBottom: '2px' }}>
        📦 v{version}
      </div>
      <div>
        ⚡ <span style={{ color: getStatusColor() }}>{status}</span>
      </div>
    </div>
  )
}