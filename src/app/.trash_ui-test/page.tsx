import Link from 'next/link'

export default function UITestIndex() {
  const tests = [
    { 
      name: 'Dashboard 儀表板混搭', 
      path: '/ui-test/dashboard-mix',
      desc: 'Lamp + Bento Grid + Glowing'
    },
    { 
      name: '任務管理混搭', 
      path: '/ui-test/task-mix',
      desc: 'Resizable Sidebar + Floating Dock + Glowing'
    },
    { 
      name: '專案展示混搭', 
      path: '/ui-test/project-mix',
      desc: 'Lamp Spotlight + Bento + Resizable Panel'
    }
  ]
  
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>UI 元件混搭測試</h1>
      <p>測試 Aceternity UI 元件的不同組合方式</p>
      
      <div style={{ marginTop: '40px', display: 'grid', gap: '20px' }}>
        {tests.map(test => (
          <Link 
            key={test.path}
            href={test.path}
            style={{
              display: 'block',
              padding: '24px',
              background: 'linear-gradient(135deg, #f8f8f8, #fff)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#333',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#c9a961' }}>{test.name}</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{test.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}