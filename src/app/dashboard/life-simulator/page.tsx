'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'

interface Character {
  name: string
  age: number
  stage: 'birth' | 'childhood' | 'teenager' | 'adult' | 'middle_age' | 'elderly'
  attributes: {
    health: number
    wealth: number
    knowledge: number
    happiness: number
    fame: number
  }
  education: string
  career: string
  achievements: string[]
  gameYear: number
}

interface Event {
  id: string
  title: string
  description: string
  choices: {
    text: string
    effects: {
      health?: number
      wealth?: number
      knowledge?: number
      happiness?: number
      fame?: number
    }
    requirements?: {
      minAge?: number
      maxAge?: number
      minWealth?: number
      minKnowledge?: number
    }
  }[]
}

export default function LifeSimulatorPage() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start')
  const [character, setCharacter] = useState<Character | null>(null)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [gameLog, setGameLog] = useState<string[]>([])

  // 遊戲事件資料庫
  const events: Event[] = [
    {
      id: 'education_choice',
      title: '教育選擇',
      description: '你到了上學的年齡，該選擇什麼樣的教育路線？',
      choices: [
        {
          text: '專注學業',
          effects: { knowledge: 20, health: -5, happiness: -5 }
        },
        {
          text: '平衡發展',
          effects: { knowledge: 10, health: 5, happiness: 10 }
        },
        {
          text: '享受童年',
          effects: { happiness: 20, knowledge: -10, health: 10 }
        }
      ]
    },
    {
      id: 'career_start',
      title: '職業選擇',
      description: '畢業了！是時候開始你的職業生涯了，你想做什麼？',
      choices: [
        {
          text: '進入大公司',
          effects: { wealth: 30, knowledge: 10, happiness: -5 },
          requirements: { minKnowledge: 50 }
        },
        {
          text: '創業',
          effects: { wealth: -20, happiness: 20, fame: 15 },
          requirements: { minWealth: 30 }
        },
        {
          text: '從事藝術工作',
          effects: { wealth: -10, happiness: 30, fame: 10 }
        },
        {
          text: '公務員',
          effects: { wealth: 15, happiness: 5, health: 5 }
        }
      ]
    },
    {
      id: 'health_crisis',
      title: '健康危機',
      description: '你感到身體不適，需要做出重要決定。',
      choices: [
        {
          text: '立即就醫',
          effects: { health: 20, wealth: -15, happiness: -5 }
        },
        {
          text: '自己調理',
          effects: { health: 5, wealth: 0, happiness: -10 }
        },
        {
          text: '忽視問題',
          effects: { health: -20, wealth: 0, happiness: -15 }
        }
      ]
    },
    {
      id: 'investment_opportunity',
      title: '投資機會',
      description: '有一個看起來不錯的投資機會，你要投資嗎？',
      choices: [
        {
          text: '大量投資',
          effects: { wealth: 50, happiness: -10 },
          requirements: { minWealth: 50 }
        },
        {
          text: '小額投資',
          effects: { wealth: 15, happiness: 0 },
          requirements: { minWealth: 20 }
        },
        {
          text: '不投資',
          effects: { wealth: 0, happiness: 5 }
        }
      ]
    }
  ]

  // 開始新遊戲
  const startNewGame = (name: string) => {
    const newCharacter: Character = {
      name,
      age: 0,
      stage: 'birth',
      attributes: {
        health: 100,
        wealth: 50,
        knowledge: 10,
        happiness: 80,
        fame: 0
      },
      education: '',
      career: '',
      achievements: [],
      gameYear: 1
    }
    setCharacter(newCharacter)
    setGameState('playing')
    setGameLog([`${name} 出生了！人生模擬器開始...`])
    triggerNextEvent()
  }

  // 觸發下一個事件
  const triggerNextEvent = () => {
    if (!character) return
    
    // 根據年齡和屬性選擇合適的事件
    const availableEvents = events.filter(event => {
      return event.choices.some(choice => {
        if (choice.requirements) {
          const { minAge, maxAge, minWealth, minKnowledge } = choice.requirements
          return (!minAge || character.age >= minAge) &&
                 (!maxAge || character.age <= maxAge) &&
                 (!minWealth || character.attributes.wealth >= minWealth) &&
                 (!minKnowledge || character.attributes.knowledge >= minKnowledge)
        }
        return true
      })
    })

    if (availableEvents.length > 0) {
      const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)]
      setCurrentEvent(randomEvent)
    }
  }

  // 處理選擇
  const handleChoice = (choiceIndex: number) => {
    if (!character || !currentEvent) return

    const choice = currentEvent.choices[choiceIndex]
    const newCharacter = { ...character }

    // 應用效果
    Object.entries(choice.effects).forEach(([attr, value]) => {
      if (attr in newCharacter.attributes) {
        newCharacter.attributes[attr as keyof typeof newCharacter.attributes] += value
        // 確保屬性在合理範圍內
        newCharacter.attributes[attr as keyof typeof newCharacter.attributes] = Math.max(0, 
          Math.min(100, newCharacter.attributes[attr as keyof typeof newCharacter.attributes]))
      }
    })

    // 更新年齡和階段
    newCharacter.age += 5
    newCharacter.gameYear += 5
    
    if (newCharacter.age >= 80) newCharacter.stage = 'elderly'
    else if (newCharacter.age >= 50) newCharacter.stage = 'middle_age'
    else if (newCharacter.age >= 25) newCharacter.stage = 'adult'
    else if (newCharacter.age >= 13) newCharacter.stage = 'teenager'
    else if (newCharacter.age >= 6) newCharacter.stage = 'childhood'

    // 檢查遊戲結束條件
    if (newCharacter.age >= 100 || newCharacter.attributes.health <= 0) {
      setGameState('gameOver')
    }

    setCharacter(newCharacter)
    setGameLog(prev => [...prev, `${character.name} 選擇了「${choice.text}」`])
    setCurrentEvent(null)

    // 延遲觸發下一個事件
    if (gameState !== 'gameOver') {
      setTimeout(() => {
        triggerNextEvent()
      }, 2000)
    }
  }

  const getStageText = (stage: string) => {
    const stages = {
      birth: '嬰兒期',
      childhood: '童年',
      teenager: '青少年',
      adult: '成年',
      middle_age: '中年',
      elderly: '老年'
    }
    return stages[stage as keyof typeof stages] || stage
  }

  const getAttributeColor = (value: number) => {
    if (value >= 70) return '#22c55e' // green
    if (value >= 40) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  if (gameState === 'start') {
    return (
      <div className="life-simulator">
        <PageHeader
          title="人生模擬器"
          subtitle="體驗不同的人生選擇，看看你能創造出什麼樣的人生故事"
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11.5V9.5L21 9V11L15 11.5M7 10C7 10.9 7.29 11.71 7.76 12.39L7.34 12.81C6.22 13.95 6.22 15.78 7.35 16.91L8.77 18.33C9.9 19.46 11.73 19.46 12.86 18.33L13.28 17.91C14 18.38 14.8 18.67 15.69 18.67C17.1 18.67 18.31 17.85 18.82 16.64L21.04 11.55C21.39 10.85 21.35 10.03 20.95 9.37C20.55 8.71 19.85 8.29 19.1 8.29H17.53C16.22 8.29 15.17 9.34 15.17 10.65V11.9C15.17 12.45 14.73 12.9 14.17 12.9S13.17 12.45 13.17 11.9V10.65C13.17 9.34 12.12 8.29 10.81 8.29H9.24C8.5 8.29 7.8 8.71 7.4 9.37C7 10.03 6.96 10.85 7.31 11.55L9.53 16.64C10.04 17.85 11.25 18.67 12.66 18.67"/>
            </svg>
          }
        />
        
        <div className="start-screen">
          <div className="start-card">
            <div className="start-content">
              <h2>開始新的人生</h2>
              <p>輸入你的角色名字，開始這趟人生旅程</p>
              <input
                type="text"
                placeholder="輸入角色名字"
                className="name-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    startNewGame(e.currentTarget.value.trim())
                  }
                }}
              />
              <button
                className="start-btn"
                onClick={() => {
                  const input = document.querySelector('.name-input') as HTMLInputElement
                  if (input?.value.trim()) {
                    startNewGame(input.value.trim())
                  }
                }}
              >
                開始人生
              </button>
            </div>
            
            <div className="game-features">
              <h3>遊戲特色</h3>
              <ul>
                <li>🎯 做出重要的人生決策</li>
                <li>📊 管理健康、財富、知識、快樂等屬性</li>
                <li>🎲 體驗隨機事件和挑戰</li>
                <li>🏆 解鎖各種成就</li>
                <li>⏰ 見證完整的人生歷程</li>
              </ul>
            </div>
          </div>
        </div>

        <style jsx>{`
          .life-simulator {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }

          .start-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 500px;
          }

          .start-card {
            background: rgba(255, 253, 250, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            border: 1px solid rgba(201, 169, 97, 0.2);
            box-shadow: 0 8px 32px rgba(201, 169, 97, 0.1);
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            max-width: 800px;
          }

          .start-content {
            text-align: center;
          }

          .start-content h2 {
            font-size: 24px;
            font-weight: 700;
            color: #3a3833;
            margin: 0 0 16px 0;
          }

          .start-content p {
            color: #6d685f;
            margin: 0 0 24px 0;
            line-height: 1.6;
          }

          .name-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid rgba(201, 169, 97, 0.3);
            border-radius: 12px;
            font-size: 16px;
            background: white;
            color: #3a3833;
            margin-bottom: 20px;
            transition: all 0.2s ease;
          }

          .name-input:focus {
            outline: none;
            border-color: #c9a961;
            box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
          }

          .start-btn {
            background: linear-gradient(135deg, #c9a961, #e4d4a8);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(201, 169, 97, 0.4);
          }

          .game-features {
            border-left: 3px solid rgba(201, 169, 97, 0.3);
            padding-left: 20px;
          }

          .game-features h3 {
            font-size: 18px;
            font-weight: 600;
            color: #3a3833;
            margin: 0 0 16px 0;
          }

          .game-features ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .game-features li {
            padding: 8px 0;
            color: #6d685f;
            font-size: 14px;
          }

          @media (max-width: 768px) {
            .start-card {
              grid-template-columns: 1fr;
              gap: 20px;
              padding: 24px;
            }

            .game-features {
              border-left: none;
              border-top: 3px solid rgba(201, 169, 97, 0.3);
              padding-left: 0;
              padding-top: 20px;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="life-simulator">
      <PageHeader
        title="人生模擬器"
        subtitle={`${character?.name}的人生故事 - ${getStageText(character?.stage || '')}`}
        stats={[
          { label: '歲', value: character?.age || 0, type: 'default' },
          { label: '年', value: character?.gameYear || 1, type: 'info' }
        ]}
        actions={
          <button className="restart-btn" onClick={() => {
            setGameState('start')
            setCharacter(null)
            setCurrentEvent(null)
            setGameLog([])
          }}>
            重新開始
          </button>
        }
      />
      
      <div className="game-main">
        <div className="character-panel">
          <div className="character-info">
            <h3>{character?.name}</h3>
            <p className="character-stage">{getStageText(character?.stage || '')} • {character?.age}歲</p>
          </div>
          
          <div className="attributes">
            {character && Object.entries(character.attributes).map(([key, value]) => (
              <div key={key} className="attribute">
                <div className="attribute-label">
                  {key === 'health' ? '健康' : 
                   key === 'wealth' ? '財富' :
                   key === 'knowledge' ? '知識' :
                   key === 'happiness' ? '快樂' : '名望'}
                </div>
                <div className="attribute-bar">
                  <div 
                    className="attribute-fill" 
                    style={{ 
                      width: `${value}%`,
                      backgroundColor: getAttributeColor(value)
                    }}
                  />
                  <span className="attribute-value">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentEvent ? (
          <div className="event-panel">
            <div className="event-card">
              <h3 className="event-title">{currentEvent.title}</h3>
              <p className="event-description">{currentEvent.description}</p>
              
              <div className="choices">
                {currentEvent.choices.map((choice, index) => (
                  <button
                    key={index}
                    className="choice-btn"
                    onClick={() => handleChoice(index)}
                  >
                    <div className="choice-text">{choice.text}</div>
                    <div className="choice-effects">
                      {Object.entries(choice.effects).map(([attr, value]) => (
                        <span key={attr} className={value > 0 ? 'positive' : 'negative'}>
                          {attr === 'health' ? '健康' : 
                           attr === 'wealth' ? '財富' :
                           attr === 'knowledge' ? '知識' :
                           attr === 'happiness' ? '快樂' : '名望'}
                          {value > 0 ? '+' : ''}{value}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="waiting-panel">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>人生繼續中...</p>
          </div>
        )}

        <div className="log-panel">
          <h4>人生記錄</h4>
          <div className="log-content">
            {gameLog.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .life-simulator {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .restart-btn {
          padding: 8px 16px;
          background: rgba(201, 169, 97, 0.1);
          color: #c9a961;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .restart-btn:hover {
          background: rgba(201, 169, 97, 0.2);
        }

        .game-main {
          display: grid;
          grid-template-columns: 300px 1fr 250px;
          gap: 24px;
          min-height: 600px;
        }

        .character-panel {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          height: fit-content;
        }

        .character-info h3 {
          font-size: 20px;
          font-weight: 700;
          color: #3a3833;
          margin: 0 0 4px 0;
        }

        .character-stage {
          color: #6d685f;
          font-size: 14px;
          margin: 0 0 24px 0;
        }

        .attributes {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .attribute {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .attribute-label {
          font-size: 14px;
          font-weight: 500;
          color: #3a3833;
        }

        .attribute-bar {
          position: relative;
          background: #f1f1f1;
          border-radius: 8px;
          height: 24px;
          overflow: hidden;
        }

        .attribute-fill {
          height: 100%;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .attribute-value {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          font-weight: 600;
          color: #3a3833;
        }

        .event-panel {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .event-card {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 32px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          max-width: 500px;
          text-align: center;
        }

        .event-title {
          font-size: 24px;
          font-weight: 700;
          color: #3a3833;
          margin: 0 0 16px 0;
        }

        .event-description {
          color: #6d685f;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .choices {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .choice-btn {
          background: white;
          border: 2px solid rgba(201, 169, 97, 0.3);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .choice-btn:hover {
          border-color: #c9a961;
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.2);
        }

        .choice-text {
          font-weight: 600;
          color: #3a3833;
          margin-bottom: 8px;
        }

        .choice-effects {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .choice-effects span {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .choice-effects .positive {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .choice-effects .negative {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .waiting-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #6d685f;
        }

        .loading-spinner {
          margin-bottom: 16px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(201, 169, 97, 0.3);
          border-radius: 50%;
          border-top-color: #c9a961;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .log-panel {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          height: fit-content;
          max-height: 600px;
          overflow: hidden;
        }

        .log-panel h4 {
          font-size: 16px;
          font-weight: 600;
          color: #3a3833;
          margin: 0 0 16px 0;
        }

        .log-content {
          max-height: 500px;
          overflow-y: auto;
        }

        .log-entry {
          padding: 8px 0;
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
          font-size: 14px;
          color: #6d685f;
        }

        .log-entry:last-child {
          border-bottom: none;
        }

        @media (max-width: 1024px) {
          .game-main {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .character-panel {
            order: 1;
          }

          .event-panel {
            order: 2;
          }

          .log-panel {
            order: 3;
          }
        }
      `}</style>
    </div>
  )
}