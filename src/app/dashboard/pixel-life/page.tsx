'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'

export default function PixelLifePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [playerLevel] = useState(5)
  const [playerExp] = useState(1250)
  const [playerExpMax] = useState(1500)
  const [playerGold] = useState(8472)
  const [currentLocation] = useState('冒險者村莊')
  const [showBuildingModal, setShowBuildingModal] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)
  const [spiritData, setSpiritData] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authManager.getCurrentUser()
        if (!user) {
          router.push('/')
          return
        }
        setCurrentUser(user)
        
        // 檢查是否有心靈魔法結果
        const savedSpirit = localStorage.getItem('mind_magic_spirit')
        if (savedSpirit) {
          setSpiritData(JSON.parse(savedSpirit))
        }
      } catch (error) {
        console.error('載入用戶失敗:', error)
        router.push('/')
      }
    }
    
    loadUser()
  }, [router])

  const handleBuildingClick = (building: string) => {
    setSelectedBuilding(building)
    
    // 根據建築物進行路由
    switch(building) {
      case 'bank':
        router.push('/dashboard/finance')
        break
      case 'guild':
        router.push('/dashboard/projects')
        break
      case 'magic-tower':
        router.push('/dashboard/mind-magic')
        break
      case 'time-keeper':
        router.push('/dashboard/timebox')
        break
      case 'mail':
        router.push('/dashboard/todos')
        break
      case 'calendar':
        router.push('/dashboard/calendar')
        break
      case 'shop':
      case 'inn':
        setShowBuildingModal(true)
        break
      default:
        setShowBuildingModal(true)
    }
  }

  // 創建像素英靈角色
  const createPixelSpirit = (spiritType = 'default') => {
    // 根據心靈魔法結果或預設創建不同的像素圖案
    let spiritPattern = []
    let colors = []
    
    if (spiritData && spiritData.threeHighs) {
      // 根據主要神祇創建不同的像素英靈
      const mainGod = spiritData.threeHighs[0]
      if (mainGod.includes('理性')) {
        // 雅典娜系 - 藍色調
        spiritPattern = [
          [0,0,1,1,1,0,0],
          [0,1,2,2,2,1,0],
          [1,2,3,2,3,2,1],
          [1,2,2,4,2,2,1],
          [1,1,2,2,2,1,1],
          [0,1,5,1,5,1,0],
          [0,0,1,0,1,0,0]
        ]
        colors = ['transparent', '#4682B4', '#87CEEB', '#FFF', '#000', '#32CD32']
      } else if (mainGod.includes('愛')) {
        // 阿芙蘿黛蒂系 - 粉色調
        spiritPattern = [
          [0,0,1,1,1,0,0],
          [0,1,2,2,2,1,0],
          [1,2,3,2,3,2,1],
          [1,2,2,4,2,2,1],
          [1,1,2,2,2,1,1],
          [0,1,5,1,5,1,0],
          [0,0,1,0,1,0,0]
        ]
        colors = ['transparent', '#FF69B4', '#FFB6C1', '#FFF', '#000', '#32CD32']
      } else {
        // 預設 - 棕色調
        spiritPattern = [
          [0,0,1,1,1,0,0],
          [0,1,2,2,2,1,0],
          [1,2,3,2,3,2,1],
          [1,2,2,4,2,2,1],
          [1,1,2,2,2,1,1],
          [0,1,5,1,5,1,0],
          [0,0,1,0,1,0,0]
        ]
        colors = ['transparent', '#8B4513', '#F4A460', '#FFF', '#000', '#32CD32']
      }
    } else {
      // 預設英靈
      spiritPattern = [
        [0,0,1,1,1,0,0],
        [0,1,2,2,2,1,0],
        [1,2,3,2,3,2,1],
        [1,2,2,4,2,2,1],
        [1,1,2,2,2,1,1],
        [0,1,5,1,5,1,0],
        [0,0,1,0,1,0,0]
      ]
      colors = ['transparent', '#8B4513', '#F4A460', '#FFF', '#000', '#32CD32']
    }
    
    return spiritPattern.map((row, i) => (
      <div key={i} className="pixel-row">
        {row.map((pixel, j) => (
          <div key={j} className="pixel" style={{backgroundColor: colors[pixel]}} />
        ))}
      </div>
    ))
  }

  if (!currentUser) {
    return (
      <div className="loading">
        <div className="pixel-loading">
          <div className="pixel-spinner"></div>
          <div className="loading-text">正在載入像素世界...</div>
        </div>
      </div>
    )
  }

  return (
    <ModuleLayout
      header={{
        icon: () => <div style={{fontSize: '20px'}}>🎮</div>,
        title: "🏰 像素人生",
        subtitle: `歡迎來到像素世界，勇者 ${currentUser.display_name || currentUser.username}`,
        actions: (
          <div className="rpg-status-bar">
            <div className="status-item">
              <span className="status-label">等級</span>
              <span className="status-value">{playerLevel}</span>
            </div>
            <div className="status-item">
              <span className="status-label">經驗</span>
              <span className="status-value">{playerExp}/{playerExpMax}</span>
            </div>
            <div className="status-item">
              <span className="status-label">金幣</span>
              <span className="status-value gold">{playerGold.toLocaleString()}</span>
            </div>
          </div>
        )
      }}
    >
      {/* RPG村莊地圖 */}
      <div className="village-container">
        {/* 玩家信息面板 */}
        <div className="player-info-panel">
          <div className="player-avatar">
            <div className="pixel-character">
              {createPixelSpirit()}
            </div>
          </div>
          <div className="player-stats">
            <div className="player-name">勇者 {currentUser.display_name}</div>
            <div className="level-info">
              <span>Lv.{playerLevel}</span>
              <div className="exp-bar">
                <div className="exp-fill" style={{width: `${(playerExp/playerExpMax)*100}%`}}></div>
              </div>
            </div>
            <div className="location-info">📍 {currentLocation}</div>
            {spiritData && (
              <div className="spirit-info">
                <div className="spirit-name">🔮 {spiritData.threeHighs?.[0] || '神秘英靈'}</div>
              </div>
            )}
          </div>
        </div>

        {/* 村莊地圖網格 */}
        <div className="village-map">
          <div className="village-grid">
            {/* 第一排 */}
            <div className="village-row">
              <div className="building-slot">
                <div className="building bank" onClick={() => handleBuildingClick('bank')}>
                  <div className="building-icon">🏦</div>
                  <div className="building-name">村莊銀行</div>
                  <div className="building-desc">管理金庫</div>
                </div>
              </div>
              <div className="building-slot">
                <div className="building guild" onClick={() => handleBuildingClick('guild')}>
                  <div className="building-icon">🏛️</div>
                  <div className="building-name">任務工會</div>
                  <div className="building-desc">專案管理</div>
                </div>
              </div>
              <div className="building-slot">
                <div className="building magic-tower" onClick={() => handleBuildingClick('magic-tower')}>
                  <div className="building-icon">🔮</div>
                  <div className="building-name">魔法塔</div>
                  <div className="building-desc">心靈魔法</div>
                </div>
              </div>
            </div>

            {/* 第二排 */}
            <div className="village-row">
              <div className="building-slot">
                <div className="building time-keeper" onClick={() => handleBuildingClick('time-keeper')}>
                  <div className="building-icon">⏰</div>
                  <div className="building-name">時之守護</div>
                  <div className="building-desc">時間盒子</div>
                </div>
              </div>
              <div className="building-slot central">
                <div className="building fountain">
                  <div className="building-icon fountain-icon">⛲</div>
                  <div className="building-name">村莊中央</div>
                  <div className="fountain-glow"></div>
                </div>
              </div>
              <div className="building-slot">
                <div className="building mail" onClick={() => handleBuildingClick('mail')}>
                  <div className="building-icon">📮</div>
                  <div className="building-name">信使小屋</div>
                  <div className="building-desc">待辦事項</div>
                </div>
              </div>
            </div>

            {/* 第三排 */}
            <div className="village-row">
              <div className="building-slot">
                <div className="building calendar" onClick={() => handleBuildingClick('calendar')}>
                  <div className="building-icon">📅</div>
                  <div className="building-name">時間神殿</div>
                  <div className="building-desc">行事曆</div>
                </div>
              </div>
              <div className="building-slot">
                <div className="building shop" onClick={() => handleBuildingClick('shop')}>
                  <div className="building-icon">🏪</div>
                  <div className="building-name">道具商店</div>
                  <div className="building-desc">即將開放</div>
                </div>
              </div>
              <div className="building-slot">
                <div className="building inn" onClick={() => handleBuildingClick('inn')}>
                  <div className="building-icon">🏠</div>
                  <div className="building-name">冒險者小屋</div>
                  <div className="building-desc">休息據點</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 每日任務面板 */}
        <div className="daily-quests">
          <div className="quest-header">
            <span className="quest-title">📜 今日任務</span>
          </div>
          <div className="quest-list">
            <div className="quest-item">
              <span className="quest-icon">⚔️</span>
              <span className="quest-text">完成3個待辦事項</span>
              <span className="quest-reward">+50 EXP</span>
            </div>
            <div className="quest-item">
              <span className="quest-icon">💰</span>
              <span className="quest-text">記錄一筆收支</span>
              <span className="quest-reward">+25 EXP</span>
            </div>
            <div className="quest-item completed">
              <span className="quest-icon">🎯</span>
              <span className="quest-text">登入遊戲</span>
              <span className="quest-reward">✅ 已完成</span>
            </div>
            {!spiritData && (
              <div className="quest-item important">
                <span className="quest-icon">🔮</span>
                <span className="quest-text">完成心靈魔法召喚英靈</span>
                <span className="quest-reward">+200 EXP</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 建築說明彈窗 */}
      {showBuildingModal && (
        <div className="modal-overlay" onClick={() => setShowBuildingModal(false)}>
          <div className="modal-content rpg-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏰 建築資訊</h3>
              <button 
                className="close-button"
                onClick={() => setShowBuildingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="building-detail">
                <div className="building-large-icon">
                  {selectedBuilding === 'shop' && '🏪'}
                  {selectedBuilding === 'inn' && '🏠'}
                </div>
                <div className="building-info">
                  {selectedBuilding === 'shop' && (
                    <>
                      <h4>道具商店</h4>
                      <p>使用經驗值購買虛擬裝飾品和道具，讓您的冒險更加精彩！</p>
                      <div className="coming-soon">🚧 即將開放</div>
                    </>
                  )}
                  {selectedBuilding === 'inn' && (
                    <>
                      <h4>冒險者小屋</h4>
                      <p>您的專屬空間，展示成就、裝飾房間，與其他冒險者互動。</p>
                      <div className="coming-soon">🚧 即將開放</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="primary" onClick={() => setShowBuildingModal(false)}>
                了解
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* RPG 像素風格載入 */
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: var(--text-secondary);
          font-size: 16px;
        }

        .pixel-loading {
          text-align: center;
        }

        .pixel-spinner {
          width: 32px;
          height: 32px;
          background: #8B4513;
          margin: 0 auto 16px;
          animation: pixel-spin 1s steps(4) infinite;
        }

        @keyframes pixel-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          font-family: 'Courier New', monospace;
          font-weight: bold;
        }

        /* RPG 狀態欄 */
        .rpg-status-bar {
          display: flex;
          gap: 16px;
          align-items: center;
          font-family: 'Courier New', monospace;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .status-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: bold;
        }

        .status-value {
          font-size: 14px;
          font-weight: bold;
          color: var(--text-primary);
        }

        .status-value.gold {
          color: #FFD700;
        }

        /* 村莊容器 */
        .village-container {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 24px;
          min-height: 600px;
          font-family: 'Courier New', monospace;
        }

        /* 玩家信息面板 */
        .player-info-panel {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(160, 82, 45, 0.05));
          border: 3px solid #8B4513;
          border-radius: 12px;
          padding: 20px;
          height: fit-content;
        }

        .player-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .pixel-character {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          animation: character-glow 3s ease-in-out infinite alternate;
        }

        @keyframes character-glow {
          0% { box-shadow: 0 0 5px rgba(139, 69, 19, 0.3); }
          100% { box-shadow: 0 0 15px rgba(139, 69, 19, 0.6); }
        }

        .pixel-row {
          display: flex;
          gap: 1px;
        }

        .pixel {
          width: 8px;
          height: 8px;
          border-radius: 1px;
        }

        .player-stats {
          text-align: center;
        }

        .player-name {
          font-size: 16px;
          font-weight: bold;
          color: #8B4513;
          margin-bottom: 8px;
        }

        .level-info {
          margin-bottom: 12px;
        }

        .level-info span {
          font-size: 14px;
          font-weight: bold;
          color: #4A90E2;
        }

        .exp-bar {
          width: 100%;
          height: 8px;
          background: #DDD;
          border-radius: 4px;
          margin-top: 4px;
          overflow: hidden;
        }

        .exp-fill {
          height: 100%;
          background: linear-gradient(90deg, #4A90E2, #7EC8E3);
          transition: width 0.3s ease;
        }

        .location-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }

        .spirit-info {
          margin-top: 8px;
        }

        .spirit-name {
          font-size: 12px;
          color: #9932CC;
          font-weight: bold;
        }

        /* 村莊地圖 */
        .village-map {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .village-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 500px;
        }

        .village-row {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .building-slot {
          width: 140px;
          height: 140px;
        }

        .building {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(244, 164, 96, 0.9), rgba(222, 184, 135, 0.8));
          border: 3px solid #D2691E;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .building:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 25px rgba(210, 105, 30, 0.4);
          border-color: #B8860B;
        }

        .building-icon {
          font-size: 32px;
          margin-bottom: 8px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        .fountain-icon {
          animation: fountain-glow 2s ease-in-out infinite alternate;
        }

        @keyframes fountain-glow {
          0% { filter: drop-shadow(0 0 5px rgba(135, 206, 235, 0.5)); }
          100% { filter: drop-shadow(0 0 15px rgba(135, 206, 235, 0.8)); }
        }

        .building-name {
          font-size: 12px;
          font-weight: bold;
          color: #8B4513;
          margin-bottom: 4px;
        }

        .building-desc {
          font-size: 10px;
          color: #A0522D;
          opacity: 0.8;
        }

        .building.fountain {
          background: linear-gradient(135deg, rgba(135, 206, 235, 0.9), rgba(176, 196, 222, 0.8));
          border-color: #4682B4;
          cursor: default;
        }

        .building.fountain:hover {
          transform: none;
          box-shadow: 0 0 20px rgba(135, 206, 235, 0.6);
        }

        .building.central {
          width: 140px;
          height: 140px;
        }

        /* 每日任務面板 */
        .daily-quests {
          background: linear-gradient(135deg, rgba(34, 139, 34, 0.1), rgba(85, 107, 47, 0.05));
          border: 3px solid #228B22;
          border-radius: 12px;
          padding: 20px;
          height: fit-content;
        }

        .quest-header {
          margin-bottom: 16px;
          text-align: center;
        }

        .quest-title {
          font-size: 16px;
          font-weight: bold;
          color: #228B22;
        }

        .quest-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quest-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .quest-item:hover {
          border-color: #90EE90;
          background: rgba(255, 255, 255, 0.8);
        }

        .quest-item.completed {
          background: rgba(144, 238, 144, 0.3);
          border-color: #90EE90;
        }

        .quest-item.important {
          background: rgba(255, 215, 0, 0.2);
          border-color: #FFD700;
          animation: quest-pulse 2s ease-in-out infinite alternate;
        }

        @keyframes quest-pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.02); }
        }

        .quest-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .quest-text {
          flex: 1;
          font-size: 13px;
          color: #333;
        }

        .quest-reward {
          font-size: 11px;
          color: #FFD700;
          font-weight: bold;
        }

        /* 彈窗樣式 */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content.rpg-modal {
          background: linear-gradient(135deg, #F5DEB3, #DEB887);
          border: 4px solid #8B4513;
          border-radius: 16px;
          max-width: 400px;
          width: 90%;
          font-family: 'Courier New', monospace;
        }

        .modal-header {
          padding: 20px 24px 16px;
          border-bottom: 2px solid #8B4513;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(139, 69, 19, 0.1);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
          color: #8B4513;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #8B4513;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: rgba(139, 69, 19, 0.2);
        }

        .modal-body {
          padding: 24px;
          text-align: center;
        }

        .building-detail {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .building-large-icon {
          font-size: 48px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }

        .building-info h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #8B4513;
        }

        .building-info p {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #A0522D;
          line-height: 1.4;
        }

        .coming-soon {
          padding: 8px 16px;
          background: rgba(255, 215, 0, 0.2);
          border: 2px solid #FFD700;
          border-radius: 8px;
          color: #B8860B;
          font-weight: bold;
          font-size: 12px;
        }

        .modal-footer {
          padding: 16px 24px 20px;
          display: flex;
          justify-content: center;
          border-top: 2px solid #8B4513;
          background: rgba(139, 69, 19, 0.05);
        }

        /* 響應式設計 */
        @media (max-width: 1200px) {
          .village-container {
            grid-template-columns: 240px 1fr 240px;
            gap: 16px;
          }
          
          .building-slot {
            width: 120px;
            height: 120px;
          }
          
          .building-icon {
            font-size: 28px;
          }
          
          .building-name {
            font-size: 11px;
          }
          
          .building-desc {
            font-size: 9px;
          }
        }

        @media (max-width: 768px) {
          .village-container {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .player-info-panel,
          .daily-quests {
            order: 2;
          }
          
          .village-map {
            order: 1;
          }
          
          .village-grid {
            max-width: 400px;
          }
          
          .building-slot {
            width: 100px;
            height: 100px;
          }
          
          .building-icon {
            font-size: 24px;
          }
          
          .building-name {
            font-size: 10px;
          }
          
          .building-desc {
            font-size: 8px;
          }
          
          .rpg-status-bar {
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .status-item {
            min-width: 60px;
          }
        }

        @media (max-width: 480px) {
          .village-row {
            gap: 8px;
          }
          
          .building-slot {
            width: 80px;
            height: 80px;
          }
          
          .building-icon {
            font-size: 20px;
            margin-bottom: 4px;
          }
          
          .building-name {
            font-size: 9px;
            margin-bottom: 2px;
          }
          
          .building-desc {
            font-size: 7px;
          }
          
          .player-info-panel,
          .daily-quests {
            padding: 16px;
          }
          
          .quest-item {
            padding: 8px;
          }
          
          .quest-text {
            font-size: 12px;
          }
          
          .quest-reward {
            font-size: 10px;
          }
        }
      `}</style>
    </ModuleLayout>
  )
}