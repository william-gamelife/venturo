'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'

interface PixelDay {
  date: string
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible'
  activities: string[]
  energy: number // 1-10
  productivity: number // 1-10
  notes: string
}

export default function PixelLifePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [pixelData, setPixelData] = useState<{[date: string]: PixelDay}>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDay, setEditingDay] = useState<PixelDay | null>(null)

  useEffect(() => {
    loadPixelData()
  }, [])

  const loadPixelData = () => {
    try {
      const stored = localStorage.getItem('gamelife_pixel_data')
      if (stored) {
        setPixelData(JSON.parse(stored))
      }
    } catch (error) {
      console.error('載入像素資料失敗:', error)
    }
  }

  const savePixelData = (data: {[date: string]: PixelDay}) => {
    try {
      localStorage.setItem('gamelife_pixel_data', JSON.stringify(data))
      setPixelData(data)
    } catch (error) {
      console.error('儲存像素資料失敗:', error)
    }
  }

  const getMoodColor = (mood: string) => {
    const colors = {
      great: '#22c55e',    // 綠色
      good: '#84cc16',     // 淺綠
      okay: '#eab308',     // 黃色
      bad: '#f97316',      // 橙色
      terrible: '#ef4444'  // 紅色
    }
    return colors[mood as keyof typeof colors] || '#9ca3af'
  }

  const getMoodEmoji = (mood: string) => {
    const emojis = {
      great: '😄',
      good: '😊',
      okay: '😐',
      bad: '😞',
      terrible: '😫'
    }
    return emojis[mood as keyof typeof emojis] || '⚪'
  }

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // 從週日開始

    const days = []
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())) // 到週六結束

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const isCurrentMonth = d.getMonth() === month
      days.push({
        date: dateStr,
        day: d.getDate(),
        isCurrentMonth,
        data: pixelData[dateStr]
      })
    }

    return days
  }

  const handleDateClick = (dateStr: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    
    const existing = pixelData[dateStr]
    if (existing) {
      setEditingDay(existing)
    } else {
      setEditingDay({
        date: dateStr,
        mood: 'okay',
        activities: [],
        energy: 5,
        productivity: 5,
        notes: ''
      })
    }
    setSelectedDate(dateStr)
    setShowEditModal(true)
  }

  const saveDay = () => {
    if (!editingDay || !selectedDate) return

    const newData = {
      ...pixelData,
      [selectedDate]: editingDay
    }
    savePixelData(newData)
    setShowEditModal(false)
    setEditingDay(null)
    setSelectedDate(null)
  }

  const getMonthStats = () => {
    const monthData = Object.values(pixelData).filter(day => 
      day.date.startsWith(currentMonth.toISOString().substring(0, 7))
    )
    
    const totalDays = monthData.length
    const avgEnergy = totalDays > 0 ? Math.round(monthData.reduce((sum, day) => sum + day.energy, 0) / totalDays) : 0
    const avgProductivity = totalDays > 0 ? Math.round(monthData.reduce((sum, day) => sum + day.productivity, 0) / totalDays) : 0
    const goodDays = monthData.filter(day => ['great', 'good'].includes(day.mood)).length

    return { totalDays, avgEnergy, avgProductivity, goodDays }
  }

  const stats = getMonthStats()
  const monthName = currentMonth.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })

  return (
    <div className="pixel-life-page">
      <PageHeader
        title="像素人生"
        subtitle="用像素格子記錄你的每一天"
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="4" height="4" rx="1"/>
            <rect x="10" y="3" width="4" height="4" rx="1"/>
            <rect x="17" y="3" width="4" height="4" rx="1"/>
            <rect x="3" y="10" width="4" height="4" rx="1"/>
            <rect x="10" y="10" width="4" height="4" rx="1"/>
            <rect x="17" y="10" width="4" height="4" rx="1"/>
            <rect x="3" y="17" width="4" height="4" rx="1"/>
            <rect x="10" y="17" width="4" height="4" rx="1"/>
            <rect x="17" y="17" width="4" height="4" rx="1"/>
          </svg>
        }
        stats={[
          { label: '記錄天數', value: stats.totalDays, type: 'default' },
          { label: '好心情天數', value: stats.goodDays, type: 'success' },
          { label: '平均能量', value: stats.avgEnergy, type: 'info' }
        ]}
      />

      <div className="pixel-calendar">
        <div className="calendar-header">
          <button 
            className="nav-btn"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            ‹
          </button>
          <h2 className="month-title">{monthName}</h2>
          <button 
            className="nav-btn"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            ›
          </button>
        </div>

        <div className="calendar-grid">
          <div className="weekdays">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="days-grid">
            {getCalendarDays().map((day, index) => (
              <div
                key={day.date}
                className={`pixel-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.data ? 'has-data' : ''}`}
                onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                style={{
                  backgroundColor: day.data ? getMoodColor(day.data.mood) : undefined,
                  opacity: day.isCurrentMonth ? 1 : 0.3
                }}
                title={day.data ? `${day.date} - ${getMoodEmoji(day.data.mood)} ${day.data.mood}` : day.date}
              >
                <div className="day-number">{day.day}</div>
                {day.data && (
                  <div className="mood-indicator">
                    {getMoodEmoji(day.data.mood)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="legend">
        <h3>心情圖例</h3>
        <div className="mood-legend">
          {[
            { mood: 'great', label: '超棒', emoji: '😄' },
            { mood: 'good', label: '不錯', emoji: '😊' },
            { mood: 'okay', label: '普通', emoji: '😐' },
            { mood: 'bad', label: '不好', emoji: '😞' },
            { mood: 'terrible', label: '糟糕', emoji: '😫' }
          ].map(item => (
            <div key={item.mood} className="mood-item">
              <div 
                className="mood-color"
                style={{ backgroundColor: getMoodColor(item.mood) }}
              />
              <span>{item.emoji} {item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 編輯模態框 */}
      {showEditModal && editingDay && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>記錄 {selectedDate}</h3>
              <button onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>今天心情</label>
                <div className="mood-selector">
                  {[
                    { mood: 'great', emoji: '😄' },
                    { mood: 'good', emoji: '😊' },
                    { mood: 'okay', emoji: '😐' },
                    { mood: 'bad', emoji: '😞' },
                    { mood: 'terrible', emoji: '😫' }
                  ].map(item => (
                    <button
                      key={item.mood}
                      className={`mood-btn ${editingDay.mood === item.mood ? 'active' : ''}`}
                      style={{ backgroundColor: getMoodColor(item.mood) }}
                      onClick={() => setEditingDay({...editingDay, mood: item.mood as any})}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>能量等級 ({editingDay.energy}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editingDay.energy}
                  onChange={(e) => setEditingDay({...editingDay, energy: parseInt(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label>工作效率 ({editingDay.productivity}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editingDay.productivity}
                  onChange={(e) => setEditingDay({...editingDay, productivity: parseInt(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label>今日筆記</label>
                <textarea
                  value={editingDay.notes}
                  onChange={(e) => setEditingDay({...editingDay, notes: e.target.value})}
                  placeholder="記錄今天發生的事情..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={saveDay}>
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .pixel-life-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px;
        }

        .pixel-calendar {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 32px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.1);
          margin-bottom: 32px;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .nav-btn {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          transform: scale(1.1);
        }

        .month-title {
          font-size: 24px;
          font-weight: 600;
          color: #3a3833;
          margin: 0;
        }

        .calendar-grid {
          display: grid;
          gap: 2px;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 8px;
        }

        .weekday {
          text-align: center;
          font-weight: 600;
          color: #6d685f;
          padding: 8px;
          font-size: 14px;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .pixel-day {
          aspect-ratio: 1;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 60px;
        }

        .pixel-day.current-month:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .pixel-day.has-data {
          color: white;
          font-weight: bold;
        }

        .day-number {
          font-size: 14px;
          font-weight: 600;
        }

        .mood-indicator {
          font-size: 16px;
          margin-top: 2px;
        }

        .legend {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.1);
        }

        .legend h3 {
          font-size: 18px;
          font-weight: 600;
          color: #3a3833;
          margin: 0 0 16px 0;
        }

        .mood-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .mood-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mood-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #3a3833;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 18px;
          color: #6d685f;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
          max-height: 400px;
          overflow-y: auto;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #3a3833;
          margin-bottom: 8px;
        }

        .mood-selector {
          display: flex;
          gap: 8px;
        }

        .mood-btn {
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 8px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.7;
        }

        .mood-btn.active {
          opacity: 1;
          transform: scale(1.1);
        }

        input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
          -webkit-appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #c9a961;
          cursor: pointer;
        }

        textarea {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          resize: vertical;
          font-family: inherit;
        }

        textarea:focus {
          outline: none;
          border-color: #c9a961;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-secondary {
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .pixel-day {
            min-height: 48px;
          }
          
          .day-number {
            font-size: 12px;
          }
          
          .mood-indicator {
            font-size: 14px;
          }
          
          .modal-content {
            width: 95%;
          }
        }
      `}</style>
    </div>
  )
}