'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { localAuth } from '@/lib/local-auth'

// 預設角色
const DEFAULT_CHARACTERS = [
  {
    id: 'admin-001',
    avatar: '👨‍💼',
    nickname: '管理者',
    role: 'SUPER_ADMIN',
    description: '擁有所有權限，可管理系統設定',
    lastLogin: null,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'friend-001',
    avatar: '🧑‍🎨',
    nickname: '好朋友',
    role: 'GENERAL_USER',
    description: '一起探索 Venturo 的好夥伴',
    lastLogin: null,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
]

export default function CharacterSelectPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState<any[]>(DEFAULT_CHARACTERS) // 初始化為預設角色
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [isClient, setIsClient] = useState(false) // 追蹤是否在客戶端
  
  // 新角色表單
  const [newCharacter, setNewCharacter] = useState({
    avatar: '👤',
    nickname: '',
    roleType: 'personal',
    bio: ''
  })
  const [selectedAvatar, setSelectedAvatar] = useState('👤')

  // 可選頭像
  const avatarOptions = ['👤', '👨', '👩', '🧑‍💻', '🦸', '🧙', '🎨', '🚀', '🌟', '💫']

  useEffect(() => {
    // 標記為客戶端
    setIsClient(true)
    
    // 載入角色列表
    try {
      const savedCharacters = localStorage.getItem('venturo_characters')
      if (savedCharacters) {
        const parsed = JSON.parse(savedCharacters)
        // 合併預設角色和已儲存角色
        const merged = [...DEFAULT_CHARACTERS]
        parsed.forEach((char: any) => {
          if (!merged.find(c => c.id === char.id)) {
            merged.push(char)
          }
        })
        setCharacters(merged)
      } else {
        // 第一次使用，儲存預設角色
        localStorage.setItem('venturo_characters', JSON.stringify(DEFAULT_CHARACTERS))
        setCharacters(DEFAULT_CHARACTERS)
      }
    } catch (error) {
      console.error('載入角色失敗，使用預設角色:', error)
      setCharacters(DEFAULT_CHARACTERS)
    }
  }, [])

  // 選擇角色
  const handleSelectCharacter = (characterId: string) => {
    setSelectedCharacter(characterId)
  }

  // 登入 - 簡化版本，直接使用開發模式
  const handleLogin = async () => {
    if (!selectedCharacter) return
    
    setIsLoading(true)
    
    try {
      const character = characters.find(c => c.id === selectedCharacter)
      if (!character) return
      
      // 使用本地認證系統
      console.log('🚀 角色登入:', character.nickname)
      
      const result = localAuth.loginWithRole(character)
      
      if (!result.success) {
        throw new Error(result.error || '登入失敗')
      }
      
      // 更新最後登入時間
      const updatedCharacters = characters.map(c => 
        c.id === selectedCharacter 
          ? { ...c, lastLogin: new Date().toISOString() }
          : c
      )
      localStorage.setItem('venturo_characters', JSON.stringify(updatedCharacters))
      
      // 記住最後使用的角色
      localStorage.setItem('venturo_last_character', selectedCharacter)
      
      console.log('✅ 登入成功！')
      
      // 跳轉到儀表板
      router.push('/dashboard')
      
    } catch (error) {
      console.error('登入失敗:', error)
      // 不使用 alert，改用更優雅的提示
      console.log('❌ 登入失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // 建立新角色
  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCharacter.nickname.trim()) {
      alert('請輸入暱稱')
      return
    }
    
    const character = {
      id: `user_${Date.now()}`,
      avatar: selectedAvatar,
      nickname: newCharacter.nickname,
      role: newCharacter.roleType === 'business' ? 'BUSINESS_ADMIN' : 'GENERAL_USER',
      description: newCharacter.bio || '新加入的夥伴',
      lastLogin: null,
      createdAt: new Date().toISOString()
    }
    
    // 儲存新角色
    const updatedCharacters = [...characters, character]
    setCharacters(updatedCharacters)
    localStorage.setItem('venturo_characters', JSON.stringify(updatedCharacters))
    
    // 關閉 Modal 並自動選擇新角色
    setShowRegisterModal(false)
    setSelectedCharacter(character.id)
    
    // 重置表單
    setNewCharacter({
      avatar: '👤',
      nickname: '',
      roleType: 'personal',
      bio: ''
    })
    setSelectedAvatar('👤')
  }

  // 格式化時間
  const formatLastLogin = (dateStr: string | null) => {
    if (!dateStr) return '首次使用'
    
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小時前`
    return '剛剛'
  }

  // 取得角色標籤顏色
  const getRoleColor = (role: string) => {
    switch(role) {
      case 'SUPER_ADMIN': return '#c9a961'
      case 'BUSINESS_ADMIN': return '#8b7355'
      default: return '#6d685f'
    }
  }

  // 取得角色標籤文字
  const getRoleText = (role: string) => {
    switch(role) {
      case 'SUPER_ADMIN': return '系統管理員'
      case 'BUSINESS_ADMIN': return '業務管理'
      default: return '一般使用者'
    }
  }

  // 如果還沒到客戶端，顯示載入畫面
  if (!isClient) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #c9a961, #e4c661)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '20px'
          }}>
            VENTURO
          </div>
          <div style={{ fontSize: '18px', color: '#6d685f' }}>
            系統載入中...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f4f1eb 0%, #e8e2d5 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        animation: 'fadeIn 0.6s ease'
      }}>
        {/* 標題 */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #c9a961, #e4c661)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px'
          }}>
            VENTURO
          </h1>
          <p style={{ fontSize: '18px', color: '#6d685f' }}>
            選擇您的角色
          </p>
        </div>

        {/* 角色網格 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {characters.map(character => (
            <div
              key={character.id}
              onClick={() => handleSelectCharacter(character.id)}
              style={{
                background: selectedCharacter === character.id 
                  ? 'linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(255, 255, 255, 0.95))'
                  : 'white',
                borderRadius: '16px',
                padding: '25px',
                border: selectedCharacter === character.id 
                  ? '3px solid #c9a961'
                  : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: selectedCharacter === character.id
                  ? '0 10px 30px rgba(201, 169, 97, 0.2)'
                  : '0 2px 10px rgba(0, 0, 0, 0.05)',
                position: 'relative' as const,
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (selectedCharacter !== character.id) {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCharacter !== character.id) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              {/* 頭像 */}
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 15px',
                background: 'linear-gradient(135deg, #c9a961, #e4c661)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                position: 'relative' as const
              }}>
                {character.avatar}
                {selectedCharacter === character.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    width: '28px',
                    height: '28px',
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}>
                    ✓
                  </div>
                )}
              </div>

              {/* 名稱 */}
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2d2d2d',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                {character.nickname}
              </div>

              {/* 角色標籤 */}
              <div style={{
                fontSize: '12px',
                color: getRoleColor(character.role),
                textAlign: 'center',
                padding: '4px 12px',
                background: `${getRoleColor(character.role)}20`,
                borderRadius: '20px',
                marginBottom: '12px'
              }}>
                {getRoleText(character.role)}
              </div>

              {/* 描述 */}
              <div style={{
                fontSize: '13px',
                color: '#6d685f',
                textAlign: 'center',
                lineHeight: '1.5'
              }}>
                {character.description}
              </div>

              {/* 最後登入 */}
              <div style={{
                fontSize: '11px',
                color: '#a09b8c',
                textAlign: 'center',
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(201, 169, 97, 0.1)'
              }}>
                上次登入：{formatLastLogin(character.lastLogin)}
              </div>
            </div>
          ))}

          {/* 新增角色卡片 */}
          <div
            onClick={() => setShowRegisterModal(true)}
            style={{
              background: 'rgba(201, 169, 97, 0.05)',
              borderRadius: '16px',
              padding: '25px',
              border: '2px dashed rgba(201, 169, 97, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '250px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#c9a961'
              e.currentTarget.style.background = 'rgba(201, 169, 97, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201, 169, 97, 0.3)'
              e.currentTarget.style.background = 'rgba(201, 169, 97, 0.05)'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(201, 169, 97, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: '#c9a961',
              marginBottom: '12px'
            }}>
              +
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#c9a961',
              marginBottom: '8px'
            }}>
              建立新角色
            </div>
            <div style={{
              fontSize: '13px',
              color: '#6d685f'
            }}>
              創建您的個人角色
            </div>
          </div>
        </div>

        {/* 登入按鈕 */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleLogin}
            disabled={!selectedCharacter || isLoading}
            style={{
              padding: '14px 32px',
              background: selectedCharacter 
                ? 'linear-gradient(135deg, #c9a961, #e4c661)'
                : '#ddd',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: selectedCharacter ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              boxShadow: selectedCharacter 
                ? '0 4px 20px rgba(201, 169, 97, 0.3)'
                : 'none',
              minWidth: '160px',
              opacity: selectedCharacter ? 1 : 0.5
            }}
          >
            {isLoading ? '登入中...' : selectedCharacter ? '立即登入' : '選擇角色後登入'}
          </button>
        </div>

        {/* 快速操作提示 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(228, 198, 97, 0.05))',
          borderLeft: '4px solid #c9a961',
          padding: '16px 20px',
          borderRadius: '8px',
          marginTop: '40px',
          maxWidth: '600px',
          margin: '40px auto 0'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#c9a961', marginBottom: '8px' }}>
            ⚡ 快速開始
          </div>
          <div style={{ fontSize: '13px', color: '#6d685f', lineHeight: '1.6' }}>
            • 點選角色卡片 → 點擊「立即登入」即可進入系統<br/>
            • 管理者角色：擁有所有系統權限<br/>
            • 一般使用者：適合日常使用<br/>
            • 可隨時建立新角色，自訂頭像和暱稱
          </div>
        </div>
      </div>

      {/* 註冊 Modal */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '480px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                建立新角色
              </h2>
              <p style={{ color: '#6d685f', fontSize: '14px' }}>
                設定您的個人角色資訊
              </p>
            </div>

            <form onSubmit={handleCreateCharacter}>
              {/* 頭像選擇 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2d2d2d',
                  marginBottom: '8px'
                }}>
                  選擇頭像
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '10px'
                }}>
                  {avatarOptions.map(avatar => (
                    <div
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #c9a961, #e4c661)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        cursor: 'pointer',
                        border: selectedAvatar === avatar
                          ? '3px solid #c9a961'
                          : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedAvatar === avatar
                          ? '0 0 0 3px rgba(201, 169, 97, 0.2)'
                          : 'none'
                      }}
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
              </div>

              {/* 暱稱 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2d2d2d',
                  marginBottom: '8px'
                }}>
                  暱稱
                </label>
                <input
                  type="text"
                  value={newCharacter.nickname}
                  onChange={(e) => setNewCharacter({...newCharacter, nickname: e.target.value})}
                  placeholder="輸入您想要的暱稱"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(201, 169, 97, 0.3)',
                    borderRadius: '10px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c9a961'
                    e.target.style.boxShadow = '0 0 0 3px rgba(201, 169, 97, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(201, 169, 97, 0.3)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* 角色類型 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2d2d2d',
                  marginBottom: '8px'
                }}>
                  角色類型
                </label>
                <select
                  value={newCharacter.roleType}
                  onChange={(e) => setNewCharacter({...newCharacter, roleType: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(201, 169, 97, 0.3)',
                    borderRadius: '10px',
                    fontSize: '16px',
                    background: 'white',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="personal">個人使用（冒險模式）</option>
                  <option value="business">商務使用（角落模式）</option>
                  <option value="both">兩者都要</option>
                </select>
              </div>

              {/* 簡介 */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2d2d2d',
                  marginBottom: '8px'
                }}>
                  個人簡介（選填）
                </label>
                <input
                  type="text"
                  value={newCharacter.bio}
                  onChange={(e) => setNewCharacter({...newCharacter, bio: e.target.value})}
                  placeholder="一句話介紹自己"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(201, 169, 97, 0.3)',
                    borderRadius: '10px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* 按鈕 */}
              <div style={{
                display: 'flex',
                gap: '15px'
              }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #c9a961, #e4c661)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  建立角色
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'white',
                    color: '#c9a961',
                    border: '2px solid rgba(201, 169, 97, 0.3)',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
