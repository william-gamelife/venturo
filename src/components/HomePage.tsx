'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import PreviewBanner from './PreviewBanner'

interface User {
  id: string
  username: string
  display_name: string
  title: string
  role: 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'GENERAL_USER'
  created_at: string
}

interface HomePageProps {
  isPreview: boolean;
}

// 內嵌 3D Pin 組件
const PinContainer = ({
  children,
  title,
  className,
  containerClassName,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
}) => {
  const [transform, setTransform] = useState(
    "translate(-50%,-50%) rotateX(0deg)"
  );

  const onMouseEnter = () => {
    setTransform("translate(-50%,-50%) rotateX(40deg) scale(0.8)");
  };
  const onMouseLeave = () => {
    setTransform("translate(-50%,-50%) rotateX(0deg) scale(1)");
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "relative group/pin z-50 cursor-pointer",
        containerClassName
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
    >
      <div
        style={{
          perspective: "1000px",
          transform: "rotateX(70deg) translateZ(0deg)",
        }}
        className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          style={{
            transform: transform,
          }}
          className="absolute left-1/2 p-4 top-1/2 flex justify-start items-start rounded-2xl shadow-[0_8px_16px_rgb(0_0_0/0.4)] bg-black border border-white/[0.1] group-hover/pin:border-white/[0.2] transition duration-700 overflow-hidden"
        >
          <div className={cn("relative z-50", className)}>{children}</div>
        </div>
      </div>
      <PinPerspective title={title} />
    </div>
  );
};

const PinPerspective = ({ title }: { title?: string }) => {
  return (
    <motion.div className="pointer-events-none w-96 h-80 flex items-center justify-center opacity-0 group-hover/pin:opacity-100 z-[60] transition duration-500">
      <div className="w-full h-full -mt-7 flex-none inset-0">
        <div className="absolute top-0 inset-x-0 flex justify-center">
          <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-4 px-12 ring-1 ring-white/10">
            <span className="relative z-20 text-white text-5xl font-bold inline-block py-0.5">
              {title}
            </span>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover/btn:opacity-40"></span>
          </div>
        </div>

        <div
          style={{
            perspective: "1000px",
            transform: "rotateX(70deg) translateZ(0)",
          }}
          className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
            animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
            transition={{ duration: 6, repeat: Infinity, delay: 0 }}
            className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
            animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
            className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
            animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
            transition={{ duration: 6, repeat: Infinity, delay: 4 }}
            className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
          />
        </div>

        <motion.div className="absolute right-1/2 bottom-1/2 bg-gradient-to-b from-transparent to-cyan-500 translate-y-[14px] w-px h-20 group-hover/pin:h-40 blur-[2px]" />
        <motion.div className="absolute right-1/2 bottom-1/2 bg-gradient-to-b from-transparent to-cyan-500 translate-y-[14px] w-px h-20 group-hover/pin:h-40" />
        <motion.div className="absolute right-1/2 translate-x-[1.5px] bottom-1/2 bg-cyan-600 translate-y-[14px] w-[4px] h-[4px] rounded-full z-40 blur-[3px]" />
        <motion.div className="absolute right-1/2 translate-x-[0.5px] bottom-1/2 bg-cyan-300 translate-y-[14px] w-[2px] h-[2px] rounded-full z-40" />
      </div>
    </motion.div>
  );
};

export default function HomePage({ isPreview }: HomePageProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [password, setPassword] = useState('')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isPasswordError, setIsPasswordError] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      console.log('📥 載入用戶列表...')
      
      if (!authManager.isReady()) {
        console.log('⏳ authManager 尚未初始化，等待中...')
        setTimeout(loadUsers, 1000)
        return
      }

      const userList = await authManager.getUsers()
      console.log('🔍 獲取的用戶列表:', userList)
      setUsers(userList)
      console.log(`✅ 載入了 ${userList.length} 個用戶`)
    } catch (error) {
      console.error('❌ 載入用戶失敗:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    // 嘗試從 localStorage 讀取記憶的密碼
    const savedPassword = localStorage.getItem(`password_${user.username}`)
    setPassword(savedPassword || '')
    setIsLoginModalOpen(true)
  }

  const handleLogin = async () => {
    if (!selectedUser || !password) {
      setIsPasswordError(true)
      setTimeout(() => setIsPasswordError(false), 1500)
      return
    }

    const result = await authManager.login(selectedUser.username, password)
    if (result.success) {
      // 強制記憶密碼到 localStorage
      localStorage.setItem(`password_${selectedUser.username}`, password)
      router.push('/dashboard')
    } else {
      setIsPasswordError(true)
      setTimeout(() => {
        setPassword('')
        setIsPasswordError(false)
      }, 1500)
    }
  }

  const handleModalClose = () => {
    setIsLoginModalOpen(false)
    setSelectedUser(null)
    setPassword('')
    setIsPasswordError(false)
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '超級管理員'
      case 'BUSINESS_ADMIN':
        return '業務管理員'
      default:
        return '一般使用者'
    }
  }

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl mx-auto">
          {/* 標題區 */}
          <div className="flex-1 flex flex-col justify-center">
            {/* 用戶卡片區域 - 動態調整列數 [即時更新測試] */}
            <div className={`gap-6 mx-auto ${
              users.length === 1 ? 'flex justify-center' :
              users.length === 2 ? 'grid grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              users.length === 3 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl' :
              users.length === 4 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl' :
              'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl'
            }`}>
              {isLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-gray-600 mt-2">載入用戶列表中...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">尚未有註冊用戶</p>
                  <p className="text-gray-500 text-sm mt-2">請聯絡管理員創建用戶帳戶</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="w-full max-w-sm mx-auto">
                    <div 
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border hover:scale-105"
                      onClick={() => handleUserSelect(user)}
                    >
                      {/* 用戶頭像 */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                          {user.display_name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      
                      {/* 用戶資訊 */}
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {user.title || user.display_name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {getRoleText(user.role)}
                        </p>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                          登入
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 密碼輸入界面 - 全屏黑背景動態格子特效 */}
      {isLoginModalOpen && selectedUser && (
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center z-50"
          onClick={handleModalClose}
        >
          <div 
            className="text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 動態密碼格子 */}
            <motion.div 
              className="flex gap-4 mb-8 min-h-[4rem] items-center justify-center"
              animate={isPasswordError ? { x: [-25, 25, -20, 20, -15, 15, -10, 10, 0] } : { x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {password.length > 0 && password.split('').map((char, index) => (
                <motion.div
                  key={`filled-${index}-${password.length}-${isPasswordError}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-16 h-16 border-2 rounded-xl bg-white bg-opacity-10 flex items-center justify-center transition-all duration-300 ${
                    isPasswordError 
                      ? 'border-red-500 border-opacity-80 bg-red-500 bg-opacity-20' 
                      : 'border-white border-opacity-30'
                  }`}
                >
                  <span className={`text-3xl font-bold ${isPasswordError ? 'text-red-400' : 'text-black'}`}>●</span>
                </motion.div>
              ))}
              {/* 當前輸入框 - 只在有輸入時顯示 */}
              {password.length > 0 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-16 h-16 border-2 rounded-xl bg-white bg-opacity-20 flex items-center justify-center transition-all duration-300 ${
                    isPasswordError 
                      ? 'border-red-500 border-opacity-80 bg-red-500 bg-opacity-20' 
                      : 'border-white border-opacity-50'
                  }`}
                >
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1 h-8 bg-white" 
                  />
                </motion.div>
              )}
            </motion.div>
            {/* 初始提示 - 只在沒有輸入時顯示 */}
            {password.length === 0 && (
              <div className="text-white text-opacity-50 text-lg">
                請輸入密碼
              </div>
            )}
          </div>
          
          {/* 隱藏的輸入框 */}
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && password.length >= 1) {
                handleLogin();
              }
              if (e.key === 'Escape') {
                handleModalClose();
              }
            }}
            className="opacity-0 absolute top-0 left-0 w-full h-full"
            autoFocus
            style={{ zIndex: -1 }}
          />
        </div>
      )}
    </main>
  )
}