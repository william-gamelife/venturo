'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { authManager } from '@/lib/auth'

interface MenuItem {
  title: string
  icon: React.ReactNode
  href: string
  role?: string[]
  badge?: string | number
}

interface EnhancedSidebarProps {
  userRole: string
}

export default function EnhancedSidebar({ userRole }: EnhancedSidebarProps) {
  // 三種狀態：展開(expanded)、折疊(collapsed)、懸停展開(hover-expanded)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [autoExpand, setAutoExpand] = useState(true) // 是否啟用懸停自動展開
  
  const pathname = usePathname()
  const router = useRouter()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()

  // 讀取儲存的設定
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    const savedAutoExpand = localStorage.getItem('sidebarAutoExpand')
    
    if (savedCollapsed) {
      setIsCollapsed(JSON.parse(savedCollapsed))
    }
    if (savedAutoExpand) {
      setAutoExpand(JSON.parse(savedAutoExpand))
    }
  }, [])

  // 切換折疊狀態
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  // 切換自動展開功能
  const toggleAutoExpand = () => {
    const newState = !autoExpand
    setAutoExpand(newState)
    localStorage.setItem('sidebarAutoExpand', JSON.stringify(newState))
  }

  // 滑鼠進入側邊欄
  const handleMouseEnter = () => {
    if (!autoExpand || !isCollapsed) return
    
    // 延遲 200ms 展開，避免誤觸
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true)
    }, 200)
  }

  // 滑鼠離開側邊欄
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current)