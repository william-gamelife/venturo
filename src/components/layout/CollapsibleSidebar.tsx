'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { authManager } from '@/lib/auth'

interface MenuItem {
  title: string
  icon: React.ReactNode
  href: string
  role?: string[]
  color: string
}

interface CollapsibleSidebarProps {
  userRole: string
}

export default function CollapsibleSidebar({ userRole }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  const handleLogout = async () => {
    await authManager.logout()
  }

  const menuItems: MenuItem[] = [
    {
      title: '系統總覽',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      href: '/dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: '待辦事項',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      href: '/dashboard/todos',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '專案管理',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      href: '/dashboard/projects',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: '時間盒',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/dashboard/timebox',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'API 測試',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      href: '/dashboard/api-test',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: '用戶管理',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      href: '/dashboard/users',
      role: ['SUPER_ADMIN', 'BUSINESS_ADMIN'],
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: '系統設定',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/dashboard/settings',
      color: 'from-gray-500 to-gray-600'
    }
  ]

  const filteredItems = menuItems.filter(item => 
    !item.role || item.role.includes(userRole)
  )

  return (
    <>
      <aside 
        className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-100 transition-all duration-300 ease-in-out z-40 ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-4 top-8 bg-white border-2 border-gray-100 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <svg className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg">GameLife</h2>
                <p className="text-sm text-gray-500">遊戲人生管理系統</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group relative flex items-center rounded-xl transition-all duration-200 overflow-hidden ${
                      isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
                    } ${isActive ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
                    title={isCollapsed ? item.title : undefined}
                  >
                    {/* Background gradient for active state */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}`} />
                    
                    {/* Icon container */}
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : `bg-gradient-to-br ${item.color} text-white group-hover:scale-110`
                    }`}>
                      {item.icon}
                    </div>
                    
                    {!isCollapsed && (
                      <span className="relative z-10 font-semibold text-base transition-all duration-200">
                        {item.title}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className={`group relative w-full flex items-center rounded-xl transition-all duration-200 overflow-hidden ${
              isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
            } text-red-600 hover:text-white`}
            title={isCollapsed ? '登出' : undefined}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
            
            {/* Icon container */}
            <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white transition-transform duration-200 group-hover:scale-110">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            
            {!isCollapsed && (
              <span className="relative z-10 font-semibold text-base">登出系統</span>
            )}
          </button>
        </div>
      </aside>

      {/* Content spacer */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-72'}`} />
    </>
  )
}