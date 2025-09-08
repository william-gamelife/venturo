// 這是您需要在 layout.tsx 中整合的部分

import { DashboardHeader } from './header-update'
import { Icons } from '@/components/icons'

// 側邊欄導航項目更新
const navigation = [
  { name: '總覽', href: '/dashboard', icon: Icons.dashboard },
  { name: '待辦事項', href: '/dashboard/todos', icon: Icons.todos },
  { name: '專案管理', href: '/dashboard/projects', icon: Icons.projects },
  { name: '時間盒', href: '/dashboard/timebox', icon: Icons.timebox },
  { name: '財務管理', href: '/dashboard/finance', icon: Icons.finance },
  { name: '行事曆', href: '/dashboard/calendar', icon: Icons.calendar },
  { name: '設定', href: '/dashboard/settings', icon: Icons.settings },
  { name: '用戶管理', href: '/dashboard/users', icon: Icons.users }
]

// 在 layout 中使用
<div className="dashboard-layout">
  <DashboardHeader />
  
  <div className="layout-body">
    <aside className="sidebar">
      {navigation.map((item) => (
        <Link key={item.name} href={item.href} className="nav-item">
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.name}</span>
        </Link>
      ))}
    </aside>
    
    <main className="main-content">
      {children}
    </main>
  </div>
</div>