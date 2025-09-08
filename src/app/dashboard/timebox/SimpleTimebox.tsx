'use client'

import { useState, useEffect } from 'react'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'

interface TimeSlot {
  id: string
  activity?: string
  color?: string
  duration?: number
  groupId?: string
}

interface ActivityGroup {
  id: string
  name: string
  color: string
  startSlot: string
  duration: number // 分鐘
  day: number
  startHour: number
  startMinute: number
}

export default function SimpleTimebox() {
  const [timeUnit, setTimeUnit] = useState(30) // 30 或 60 分鐘
  // 移除 timeSlots 狀態，只使用 activityGroups
  const [activityGroups, setActivityGroups] = useState<ActivityGroup[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [popoverPlacement, setPopoverPlacement] = useState<'right' | 'left'>('right')
  
  // 永久活動列表
  const [permanentActivities, setPermanentActivities] = useState([
    { id: 'workout', name: '重訓', color: '#ef4444', icon: '💪' },
    { id: 'cardio', name: '有氧', color: '#10b981', icon: '🏃' },
    { id: 'study', name: '學習', color: '#3b82f6', icon: '📚' },
    { id: 'work', name: '工作', color: '#f97316', icon: '💼' },
  ])

  // 活動管理器顯示狀態
  const [showActivityManager, setShowActivityManager] = useState(false)

  // 重訓記錄
  const [workoutRecords, setWorkoutRecords] = useState<Record<string, any>>({})
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false)
  const [currentWorkoutSlot, setCurrentWorkoutSlot] = useState<string | null>(null)
  const [currentWorkout, setCurrentWorkout] = useState({
    equipment: '',
    weight: '',
    sets: '',
    reps: ''
  })
  
  // 新活動表單
  const [newActivity, setNewActivity] = useState({
    name: '',
    duration: 60,
    color: '#6366f1'
  })

  // 初始化載入重訓記錄
  useEffect(() => {
    const savedRecords = localStorage.getItem('workout_records')
    if (savedRecords) {
      setWorkoutRecords(JSON.parse(savedRecords))
    }
  }, [])

  // 檢查指定時間格是否被活動佔用 - 超簡化版本
  const isSlotOccupied = (day: number, hour: number, minute: number) => {
    const slotStart = hour * 60 + minute
    const slotEnd = slotStart + timeUnit
    
    return activityGroups.some(group => {
      if (group.day !== day) return false
      const groupStart = group.startHour * 60 + group.startMinute
      const groupEnd = groupStart + group.duration
      return slotStart < groupEnd && slotEnd > groupStart
    })
  }
  
  // 獲取佔用指定時間格的活動 - 超簡化版本
  const getSlotActivity = (day: number, hour: number, minute: number) => {
    const slotStart = hour * 60 + minute
    const slotEnd = slotStart + timeUnit
    
    return activityGroups.find(group => {
      if (group.day !== day) return false
      const groupStart = group.startHour * 60 + group.startMinute
      const groupEnd = groupStart + group.duration
      return slotStart < groupEnd && slotEnd > groupStart
    })
  }

  // 生成時間格
  const generateTimeGrid = () => {
    const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
    const slots = []
    
    for (let hour = 6; hour <= 22; hour++) {
      if (timeUnit === 30) {
        slots.push({ hour, minute: 0, display: `${hour}:00` })
        if (hour < 22) {
          slots.push({ hour, minute: 30, display: `${hour}:30` })
        }
      } else {
        slots.push({ hour, minute: 0, display: `${hour}:00` })
      }
    }
    
    return { days, slots }
  }

  // 點擊時間格
  const handleSlotClick = (day: number, hour: number, minute: number, event: React.MouseEvent) => {
    const slotId = `${day}_${hour}_${minute}`
    setSelectedSlot(slotId)
    
    // 計算popover位置
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const windowWidth = window.innerWidth
    const popoverWidth = 380 // popover預估寬度
    
    // 判斷應該顯示在左側還是右側
    let placement: 'right' | 'left' = 'right'
    let x = rect.right + 8
    
    if (x + popoverWidth > windowWidth - 20) {
      placement = 'left'
      x = rect.left - popoverWidth - 8
    }
    
    setPopoverPlacement(placement)
    setPopoverPosition({
      x: Math.max(20, x),
      y: rect.top - 10
    })
    
    setShowAddDialog(true)
  }

  // 新增活動 - 從永久活動列表選擇
  const handleSelectActivity = (permanentActivity: any, duration: number) => {
    if (!selectedSlot) return
    
    const [day, hour, minute] = selectedSlot.split('_').map(Number)
    const groupId = `activity_${Date.now()}`
    
    // 建立活動群組
    const newGroup: ActivityGroup = {
      id: groupId,
      name: permanentActivity.name,
      color: permanentActivity.color,
      startSlot: selectedSlot,
      duration: duration,
      day,
      startHour: hour,
      startMinute: minute
    }
    
    setActivityGroups([...activityGroups, newGroup])
    
    // 重置表單
    setShowAddDialog(false)
    setSelectedSlot(null)
  }


  // 計算活動視覺位置
  const calculateActivityPosition = (group: ActivityGroup) => {
    const slotHeight = timeUnit === 30 ? 40 : 60
    const slotsPerHour = timeUnit === 30 ? 2 : 1
    
    // 計算起始位置
    const startIndex = (group.startHour - 6) * slotsPerHour + (group.startMinute / timeUnit)
    const topPosition = startIndex * slotHeight
    
    // 計算高度
    const slots = Math.ceil(group.duration / timeUnit)
    const height = slots * slotHeight
    
    return { top: topPosition, height }
  }

  const { days, slots } = generateTimeGrid()

  return (
    <ModuleLayout
      header={{
        icon: Icons.timebox,
        title: "時間盒",
        subtitle: "簡單的時間管理",
        actions: (
          <>
            <button 
              className="manage-activity-btn"
              onClick={() => setShowActivityManager(true)}
            >
              管理活動
            </button>
            <div className="time-unit-selector">
              <button 
                className={`unit-btn ${timeUnit === 30 ? 'active' : ''}`}
                onClick={() => setTimeUnit(30)}
              >
                30分
              </button>
              <button 
                className={`unit-btn ${timeUnit === 60 ? 'active' : ''}`}
                onClick={() => setTimeUnit(60)}
              >
                60分
              </button>
            </div>
          </>
        )
      }}
    >
      <div className="simple-timebox">

      {/* 時間表格 */}
      <div className="timebox-grid">
        <div className="grid-header">
          <div className="time-header">時間</div>
          {days.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
        
        <div className="grid-body">
          {/* 時間標籤 */}
          <div className="time-labels">
            {slots.map(slot => (
              <div key={slot.display} className="time-label">
                {slot.display}
              </div>
            ))}
          </div>
          
          {/* 每天的欄位 */}
          {days.map((_, dayIndex) => (
            <div key={dayIndex} className="day-column">
              {/* 底層：可點擊的格子 */}
              <div className="slots-layer">
                {slots.map(slot => {
                  const slotId = `${dayIndex}_${slot.hour}_${slot.minute}`
                  const isOccupied = isSlotOccupied(dayIndex, slot.hour, slot.minute)
                  const slotActivity = getSlotActivity(dayIndex, slot.hour, slot.minute)
                  
                  return (
                    <div
                      key={slotId}
                      className={`time-slot ${isOccupied ? 'occupied' : ''}`}
                      onClick={(e) => !isOccupied && handleSlotClick(dayIndex, slot.hour, slot.minute, e)}
                      style={{
                        background: isOccupied && slotActivity ? `${slotActivity.color}20` : 'transparent',
                        cursor: isOccupied ? 'default' : 'pointer'
                      }}
                    />
                  )
                })}
              </div>
              
              {/* 上層：活動視覺 */}
              <div className="activities-layer">
                {activityGroups
                  .filter(group => group.day === dayIndex)
                  .map(group => {
                    const position = calculateActivityPosition(group)
                    return (
                      <div
                        key={group.id}
                        className="activity-block"
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height - 4}px`,
                          backgroundColor: group.color
                        }}
                        onClick={() => {
                          // 如果是重訓活動，開啟記錄對話框
                          if (group.name.includes('重訓') || group.name.includes('健身') || group.name.includes('訓練')) {
                            setCurrentWorkoutSlot(group.startSlot)
                            setShowWorkoutDialog(true)
                          } else if (confirm(`刪除 ${group.name}？`)) {
                            // 刪除活動
                            setActivityGroups(activityGroups.filter(g => g.id !== group.id))
                          }
                        }}
                      >
                        <div className="activity-name">{group.name}</div>
                        <div className="activity-duration">
                          {group.duration >= 60 
                            ? `${group.duration / 60}小時` 
                            : `${group.duration}分鐘`}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 新增活動Popover */}
      {showAddDialog && (
        <>
          <div className="popover-backdrop" onClick={() => setShowAddDialog(false)} />
          <div 
            className={`activity-popover ${popoverPlacement}`}
            style={{
              position: 'fixed',
              left: `${popoverPosition.x}px`,
              top: `${popoverPosition.y}px`,
              zIndex: 1000
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 箭頭指示器 */}
            <div className="popover-arrow" />
            
            <div className="popover-content">
              <h3>🎯 選擇活動</h3>
              
              <div className="activity-selection-grid">
                {permanentActivities.map(activity => (
                  <div 
                    key={activity.id} 
                    className="permanent-activity-card"
                    style={{ borderColor: activity.color }}
                  >
                    <div className="activity-header">
                      <span className="activity-icon">{activity.icon}</span>
                      <span className="activity-name">{activity.name}</span>
                    </div>
                    
                    <div className="duration-buttons">
                      <button 
                        className="duration-btn"
                        onClick={() => handleSelectActivity(activity, 30)}
                      >
                        30分
                      </button>
                      <button 
                        className="duration-btn"
                        onClick={() => handleSelectActivity(activity, 60)}
                      >
                        60分
                      </button>
                      <button 
                        className="duration-btn"
                        onClick={() => handleSelectActivity(activity, 90)}
                      >
                        90分
                      </button>
                      <button 
                        className="duration-btn"
                        onClick={() => handleSelectActivity(activity, 120)}
                      >
                        120分
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="popover-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAddDialog(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 重訓記錄對話框 */}
      {showWorkoutDialog && (
        <div className="dialog-overlay" onClick={() => setShowWorkoutDialog(false)}>
          <div className="dialog workout-dialog" onClick={e => e.stopPropagation()}>
            <h3>💪 重訓記錄</h3>
            
            <div className="workout-form">
              <input 
                type="text" 
                placeholder="器材名稱（如：臥推）" 
                value={currentWorkout.equipment}
                onChange={e => setCurrentWorkout({...currentWorkout, equipment: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="重量 (kg)" 
                value={currentWorkout.weight}
                onChange={e => setCurrentWorkout({...currentWorkout, weight: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="組數" 
                value={currentWorkout.sets}
                onChange={e => setCurrentWorkout({...currentWorkout, sets: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="次數" 
                value={currentWorkout.reps}
                onChange={e => setCurrentWorkout({...currentWorkout, reps: e.target.value})}
              />
            </div>
            
            {/* 重訓記錄歷史 */}
            <div className="workout-history">
              <h4>📊 今日記錄</h4>
              <div className="history-list">
                {Object.entries(workoutRecords)
                  .filter(([_, record]) => record.date === new Date().toLocaleDateString())
                  .slice(-3)
                  .map(([id, record]) => (
                  <div key={id} className="history-item">
                    <span className="equipment">{record.equipment}</span>
                    <span className="details">{record.weight}kg × {record.sets}組 × {record.reps}下</span>
                  </div>
                ))}
                {Object.entries(workoutRecords).filter(([_, record]) => record.date === new Date().toLocaleDateString()).length === 0 && (
                  <div className="no-records">今日尚無記錄</div>
                )}
              </div>
            </div>
            
            <div className="dialog-actions">
              <button onClick={() => setShowWorkoutDialog(false)}>取消</button>
              <button onClick={() => {
                // 儲存重訓記錄
                if (currentWorkoutSlot && currentWorkout.equipment) {
                  const record = {
                    date: new Date().toLocaleDateString(),
                    time: currentWorkoutSlot,
                    ...currentWorkout
                  }
                  
                  const newRecords = {
                    ...workoutRecords,
                    [Date.now()]: record
                  }
                  setWorkoutRecords(newRecords)
                  
                  // 儲存到 localStorage
                  localStorage.setItem('workout_records', JSON.stringify(newRecords))
                  
                  alert(`${record.equipment} ${record.weight}kg ${record.sets}組${record.reps}下 已記錄！`)
                }
                setShowWorkoutDialog(false)
                setCurrentWorkout({ equipment: '', weight: '', sets: '', reps: '' })
                setCurrentWorkoutSlot(null)
              }} disabled={!currentWorkout.equipment}>
                💾 儲存記錄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 活動管理器對話框 */}
      {showActivityManager && (
        <div className="dialog-overlay" onClick={() => setShowActivityManager(false)}>
          <div className="dialog activity-manager" onClick={e => e.stopPropagation()}>
            <h3>🎯 永久活動管理</h3>
            
            <div className="permanent-activities">
              {permanentActivities.map(activity => (
                <div key={activity.id} className="activity-card" style={{ borderColor: activity.color + '40' }}>
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-card-name">{activity.name}</div>
                </div>
              ))}
              
              {/* 新增活動卡片 */}
              <div className="activity-card" onClick={() => {
                const newName = prompt('新活動名稱:')
                const newIcon = prompt('選擇 emoji:')
                if (newName && newIcon) {
                  setPermanentActivities([...permanentActivities, {
                    id: Date.now().toString(),
                    name: newName,
                    color: '#6366f1',
                    icon: newIcon
                  }])
                }
              }}>
                <div className="activity-icon">➕</div>
                <div className="activity-card-name">新增活動</div>
              </div>
            </div>
            
            <div className="dialog-actions">
              <button onClick={() => setShowActivityManager(false)}>完成</button>
            </div>
          </div>
        </div>
      )}

      {/* 週統計區 */}
      <div className="week-stats">
        <h3>本週活動統計</h3>
        <div className="stats-grid">
          {Object.entries(
            activityGroups.reduce((acc, group) => {
              acc[group.name] = (acc[group.name] || 0) + group.duration
              return acc
            }, {} as Record<string, number>)
          ).map(([name, minutes]) => (
            <div key={name} className="stat-card">
              <div className="stat-name">{name}</div>
              <div className="stat-value">
                {minutes >= 60 ? `${(minutes/60).toFixed(1)}小時` : `${minutes}分鐘`}
              </div>
            </div>
          ))}
        </div>
        
        {/* 週日覆盤功能 */}
        {new Date().getDay() === 0 && (
          <button 
            className="review-btn"
            onClick={() => {
              if(confirm('要將本週安排複製到下週一嗎？')) {
                // 複製邏輯
                const mondayActivities = activityGroups.filter(g => g.day === 0)
                // 實作複製到下週的邏輯
              }
            }}
          >
            📋 複製本週安排到下週
          </button>
        )}
      </div>

      <style jsx global>{`
        .simple-timebox {
          padding: 0;
        }

        .header-actions {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .manage-activity-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #c9a961 0%, #e4d4a8 100%);
          color: white !important;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(201, 169, 97, 0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .manage-activity-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201, 169, 97, 0.3);
        }

        .time-unit-selector {
          display: flex;
          background: #f8fafb;
          border-radius: 12px;
          padding: 2px;
          border: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .unit-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          color: #6b7280;
          font-size: 14px;
        }

        .unit-btn.active {
          background: white;
          color: #c9a961;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .manage-activity-btn {
            padding: 8px 16px;
            font-size: 13px;
          }
          
          .unit-btn {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
        
        @media (max-width: 480px) {
          .manage-activity-btn {
            padding: 6px 12px;
            font-size: 12px;
          }
          
          .unit-btn {
            padding: 4px 8px;
            font-size: 12px;
          }
        }

        .timebox-grid {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          margin-top: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .grid-header {
          display: grid;
          grid-template-columns: 90px repeat(7, 1fr);
          background: linear-gradient(135deg, #f8fafb 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
        }

        .time-header,
        .day-header {
          padding: 16px 12px;
          font-weight: 600;
          text-align: center;
          border-right: 1px solid #e5e7eb;
          color: #374151;
          font-size: 14px;
        }

        .time-header {
          background: linear-gradient(135deg, #c9a961 0%, #e4d4a8 100%);
          color: white;
        }

        .grid-body {
          display: grid;
          grid-template-columns: 90px repeat(7, 1fr);
        }

        .time-labels {
          border-right: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #fafbfc 0%, #f8fafb 100%);
        }

        .time-label {
          height: ${timeUnit === 30 ? '40px' : '60px'};
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .day-column {
          position: relative;
          border-right: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .slots-layer {
          position: relative;
        }

        .time-slot {
          height: ${timeUnit === 30 ? '40px' : '60px'};
          border-bottom: 1px solid #f8fafc;
          transition: all 0.2s;
        }

        .time-slot:hover:not(.occupied) {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
          border-color: #c9a961;
        }

        .activities-layer {
          position: absolute;
          top: 0;
          left: 4px;
          right: 4px;
          pointer-events: none;
        }

        .activity-block {
          position: absolute;
          left: 0;
          right: 0;
          border-radius: 6px;
          padding: 4px 8px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.2s;
        }

        .activity-block:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .activity-name {
          font-size: 12px;
          font-weight: 600;
        }

        .activity-duration {
          font-size: 10px;
          opacity: 0.9;
        }

        /* Popover樣式 */
        .popover-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          z-index: 999;
        }

        .activity-popover {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          width: 380px;
          animation: popoverFadeIn 0.2s ease-out;
          transform-origin: top left;
        }

        .activity-popover.right {
          transform-origin: top left;
        }

        .activity-popover.left {
          transform-origin: top right;
        }

        @keyframes popoverFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .popover-arrow {
          position: absolute;
          width: 12px;
          height: 12px;
          background: white;
          transform: rotate(45deg);
          box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.05);
          top: 20px;
        }

        .activity-popover.right .popover-arrow {
          left: -6px;
        }

        .activity-popover.left .popover-arrow {
          right: -6px;
        }

        .popover-content {
          position: relative;
          padding: 24px;
          z-index: 1;
        }

        .popover-content h3 {
          margin: 0 0 20px 0;
          color: #374151;
          font-size: 18px;
          font-weight: 700;
        }

        .activity-selection-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
          max-height: 300px;
          overflow-y: auto;
        }

        .permanent-activity-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.2s;
        }

        .permanent-activity-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .permanent-activity-card .activity-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .permanent-activity-card .activity-icon {
          font-size: 20px;
        }

        .permanent-activity-card .activity-name {
          font-weight: 600;
          color: #374151;
        }

        .duration-buttons {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .duration-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .duration-btn:hover {
          border-color: #c9a961;
          background: #c9a961;
          color: white;
        }

        .popover-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .cancel-btn,
        .confirm-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #6b7280;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .confirm-btn {
          background: linear-gradient(135deg, #c9a961 0%, #e4d4a8 100%);
          color: white;
        }

        .confirm-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201, 169, 97, 0.3);
        }

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .dialog {
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
        }

        .dialog h3 {
          margin: 0 0 20px 0;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }

        .color-options {
          display: flex;
          gap: 8px;
        }

        .color-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
        }

        .color-btn.active {
          border-color: #333;
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .dialog-actions button {
          padding: 8px 20px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .dialog-actions button:first-child {
          background: #f5f5f5;
        }

        .dialog-actions button:last-child {
          background: #3b82f6;
          color: white;
        }

        .dialog-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        /* 活動管理器對話框 */
        .activity-manager {
          max-width: 600px;
        }

        .permanent-activities {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .activity-card {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          border: 2px solid transparent;
          transition: all 0.3s;
          cursor: pointer;
        }

        .activity-card:hover {
          border-color: #c9a961;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(201, 169, 97, 0.15);
        }

        .activity-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .activity-card-name {
          font-weight: 600;
          font-size: 14px;
          color: #374151;
        }

        /* 重訓記錄對話框 */
        .workout-dialog {
          max-width: 500px;
        }

        .workout-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .workout-form input {
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }

        .workout-form input:focus {
          outline: none;
          border-color: #c9a961;
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
        }

        /* 週統計區域 */
        .week-stats {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 16px;
          padding: 24px;
          margin-top: 32px;
          border: 1px solid #e2e8f0;
        }

        .week-stats h3 {
          margin: 0 0 20px 0;
          color: #374151;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .week-stats h3:before {
          content: '📊';
          font-size: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
          border: 1px solid #e5e7eb;
          transition: all 0.3s;
        }

        .stat-card:hover {
          border-color: #c9a961;
          box-shadow: 0 4px 15px rgba(201, 169, 97, 0.1);
          transform: translateY(-2px);
        }

        .stat-name {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #374151;
        }

        .review-btn {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto;
        }

        .review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201, 169, 97, 0.3);
        }

        /* 增強對話框樣式 */
        .dialog {
          background: white;
          border-radius: 16px;
          padding: 28px;
          width: 90%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
        }

        .dialog h3 {
          margin: 0 0 24px 0;
          font-size: 20px;
          font-weight: 700;
          color: #374151;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #c9a961;
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
        }

        .color-options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .color-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .color-btn:hover {
          transform: scale(1.1);
        }

        .color-btn.active {
          border-color: #374151;
          transform: scale(1.15);
          box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.2);
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 28px;
        }

        .dialog-actions button {
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .dialog-actions button:first-child {
          background: #f3f4f6;
          color: #6b7280;
        }

        .dialog-actions button:first-child:hover {
          background: #e5e7eb;
        }

        .dialog-actions button:last-child {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
        }

        .dialog-actions button:last-child:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(201, 169, 97, 0.3);
        }

        .dialog-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        /* 重訓記錄歷史 */
        .workout-history {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .workout-history h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #374151;
        }

        .history-list {
          max-height: 120px;
          overflow-y: auto;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
          margin-bottom: 6px;
        }

        .equipment {
          font-weight: 600;
          color: #374151;
        }

        .details {
          font-size: 12px;
          color: #6b7280;
        }

        .no-records {
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          padding: 20px;
        }
      `}</style>
      </div>
    </ModuleLayout>
  )
}