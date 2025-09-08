'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface User {
  id: string
  username: string
  display_name: string
  title: string
  role: 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'GENERAL_USER'
  created_at: string
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

export default function HomePage() {
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
      // 不再使用測試資料，直接顯示錯誤
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setPassword('')
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
      <div className="test">Hello GAME-T!</div>
      {/* Aurora Background - 直接內嵌 */}
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-zinc-50 text-slate-950 dark:bg-zinc-900"
        )}
      >
        {/* Aurora 效果層 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            "--aurora": "repeating-linear-gradient(100deg,#3b82f6_10%,#a5b4fc_15%,#93c5fd_20%,#ddd6fe_25%,#60a5fa_30%)",
            "--dark-gradient": "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
            "--white-gradient": "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",
            "--blue-300": "#93c5fd",
            "--blue-400": "#60a5fa", 
            "--blue-500": "#3b82f6",
            "--indigo-300": "#a5b4fc",
            "--violet-200": "#ddd6fe",
            "--black": "#000",
            "--white": "#fff",
            "--transparent": "transparent",
          } as React.CSSProperties}
        >
          <div
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-50 blur-[10px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          />
        </div>

        {/* 主要內容 */}
        <div className="text-center text-white z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-between py-8">
          {/* 標題區 */}
          <div className="flex-1 flex flex-col justify-center">

            {/* 用戶卡片區域 - 動態調整列數 */}
            <div className={`gap-6 mx-auto ${
              users.length === 1 ? 'flex justify-center' :
              users.length === 2 ? 'grid grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              users.length === 3 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl' :
              users.length === 4 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl' :
              'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl'
            }`}>
              {isLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="text-white text-opacity-70 mt-2">載入用戶列表中...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-white text-opacity-70">尚未有註冊用戶</p>
                  <p className="text-white text-opacity-50 text-sm mt-2">請聯絡管理員創建用戶帳戶</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="h-[40rem] w-full flex items-center justify-center">
                    <PinContainer
                      title="LOGIN"
                      onClick={() => handleUserSelect(user)}
                      containerClassName="w-full max-w-sm"
                    >
                      <div className="flex flex-col p-0 tracking-tight w-[18rem] h-[20rem] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-cyan-500/20">
                        {/* 照片區域框 - 科技風格 */}
                        <div className="h-[15.625rem] bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-cyan-900/50 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-cyan-500/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white">
                              {user.display_name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          {/* 科技感裝飾線 */}
                          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400/50" />
                          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-blue-400/50" />
                        </div>
                        
                        {/* 文字資訊區域 */}
                        <div className="h-[4.375rem] px-4 bg-white flex flex-col items-center justify-center border-t border-gray-200">
                          <h3 className="text-lg font-bold text-black text-center">
                            {user.title || user.display_name}
                          </h3>
                        </div>
                      </div>
                    </PinContainer>
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
        </div>
      )}
    </main>
  )
}