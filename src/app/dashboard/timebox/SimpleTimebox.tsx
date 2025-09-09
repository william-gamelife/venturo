'use client'

import { useState, useEffect } from 'react'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import { calculatePopoverPosition } from '@/lib/popover-utils'

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
  // 基本狀態
  const [timeUnit, setTimeUnit] = useState(30) // 30 或 60 分鐘
  const [activityGroups, setActivityGroups] = useState<ActivityGroup[]>([])
  const [weekOffset, setWeekOffset] = useState(0) // 0=本週, -1=上週, 1=下週
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // 彈窗狀態
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [popoverPlacement, setPopoverPlacement] = useState<'right' | 'left'>('right')
  const [selectedActivityForTime, setSelectedActivityForTime] = useState<any | null>(null)
  
  // 活動管理狀態
  const [showActivityManager, setShowActivityManager] = useState(false)
  const [showAddActivityForm, setShowAddActivityForm] = useState(false)
  const [newActivity, setNewActivity] = useState({ name: '', color: '#C4A484' })
  
  // 重訓記錄狀態
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false)
  const [currentWorkoutSlot, setCurrentWorkoutSlot] = useState<string | null>(null)
  const [workoutRecords, setWorkoutRecords] = useState<Record<string, any>>({})
  const [currentWorkout, setCurrentWorkout] = useState({
    equipment: '', weight: '', sets: '', reps: ''
  })

  // 永久活動列表 - 莫蘭迪色系
  const [permanentActivities, setPermanentActivities] = useState([
    { id: 'workout', name: '重訓', color: '#C4A484', fixed: true },
    { id: 'cardio', name: '有氧', color: '#A8B5A0', fixed: false },
    { id: 'study', name: '學習', color: '#9DB4CE', fixed: false },
    { id: 'work', name: '工作', color: '#D4B5A0', fixed: false },
  ])

  // 莫蘭迪色調色板
  const morandiColors = ['#C4A484', '#A8B5A0', '#9DB4CE', '#D4B5A0', '#B5A8D4', '#D4A8B5', '#A8D4B5', '#D4C4A8']

  // 初始化和定時器
  useEffect(() => {
    const savedRecords = localStorage.getItem('workout_records')
    if (savedRecords) {
      setWorkoutRecords(JSON.parse(savedRecords))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // 週次和日期相關函數
  const getTodayIndex = () => {
    const today = new Date().getDay()
    return today === 0 ? 6 : today - 1
  }

  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + mondayOffset + i + (weekOffset * 7))
      dates.push(date.getDate())
    }
    return dates
  }

  const changeWeek = (direction: number) => {
    setWeekOffset(prev => prev + direction)
  }

  // 計算當前時間線的位置
  const getCurrentTimeLinePosition = () => {
    if (weekOffset !== 0) return null // 只在當前週顯示
    
    const now = currentTime
    const hour = now.getHours()
    const minute = now.getMinutes()
    
    // 只在 6-22 點範圍內顯示
    if (hour < 6 || hour > 22) return null
    
    const slotHeight = timeUnit === 30 ? 40 : 60
    const slotsPerHour = timeUnit === 30 ? 2 : 1
    
    // 計算從 6 點開始的位置
    const hoursSinceStart = hour - 6
    const minuteProgress = minute / 60 // 0-1 的進度
    
    const position = (hoursSinceStart + minuteProgress) * (slotHeight * slotsPerHour)
    
    return position
  }

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

  // 活動操作函數
  const handleSlotClick = (day: number, hour: number, minute: number, event: React.MouseEvent) => {
    const slotId = `${day}_${hour}_${minute}`
    setSelectedSlot(slotId)
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const position = calculatePopoverPosition(rect, {
      width: 380,
      height: 500,
      margin: 20,
      preferredPlacement: 'right'
    })
    
    setPopoverPlacement(position.placement as 'right' | 'left')
    setPopoverPosition({ x: position.x, y: position.y })
    setShowAddDialog(true)
  }

  const handleSelectActivityType = (activity: any) => {
    setSelectedActivityForTime(activity)
  }

  const handleSelectDuration = (duration: number) => {
    if (!selectedSlot || !selectedActivityForTime) return
    
    const [day, hour, minute] = selectedSlot.split('_').map(Number)
    const groupId = `activity_${Date.now()}`
    
    
    const newGroup: ActivityGroup = {
      id: groupId,
      name: selectedActivityForTime.name,
      color: selectedActivityForTime.color,
      startSlot: selectedSlot,
      duration: duration,
      day,
      startHour: hour,
      startMinute: minute
    }
    
    setActivityGroups([...activityGroups, newGroup])
    
    setShowAddDialog(false)
    setSelectedSlot(null)
    setSelectedActivityForTime(null)
  }

  const calculateActivityPosition = (group: ActivityGroup) => {
    const slotHeight = timeUnit === 30 ? 40 : 60
    
    // 計算從6點開始到活動開始的總分鐘數
    const startMinutesFromSix = (group.startHour - 6) * 60 + group.startMinute
    
    // 根據時間單位計算位置
    const topPosition = (startMinutesFromSix / timeUnit) * slotHeight
    
    // 計算活動高度
    const heightInPixels = (group.duration / timeUnit) * slotHeight
    
    
    return { top: topPosition, height: heightInPixels }
  }

  const { days, slots } = generateTimeGrid()
  const weekDates = getWeekDates()

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
            {days.map((day, index) => (
              <div key={day} className={`day-header ${weekOffset === 0 && index === getTodayIndex() ? 'today' : ''}`}>
                {/* 週一的上週箭頭 */}
                {index === 0 && (
                  <button 
                    className="week-nav-arrow left-arrow" 
                    onClick={() => changeWeek(-1)}
                    title="上週"
                  >
                    ‹
                  </button>
                )}
                
                <div className="day-content">
                  {day}
                  <span className={`date-indicator ${weekOffset === 0 && index === getTodayIndex() ? 'today-date' : ''}`}>
                    ({weekDates[index]})
                  </span>
                </div>

                {/* 週日的下週箭頭 */}
                {index === 6 && (
                  <button 
                    className="week-nav-arrow right-arrow" 
                    onClick={() => changeWeek(1)}
                    title="下週"
                  >
                    ›
                  </button>
                )}
              </div>
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
                          background: isOccupied && slotActivity ? 'rgba(0,0,0,0.05)' : 'transparent',
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
                          data-activity={group.name}
                          style={{
                            top: `${position.top}px`,
                            height: `${position.height - 4}px`
                          }}
                          onClick={() => {
                            if (group.name.includes('重訓') || group.name.includes('健身') || group.name.includes('訓練')) {
                              setCurrentWorkoutSlot(group.startSlot)
                              setShowWorkoutDialog(true)
                            } else if (confirm(`刪除 ${group.name}？`)) {
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

                  {/* 當前時間線 - 只在今天的欄位顯示 */}
                  {weekOffset === 0 && dayIndex === getTodayIndex() && getCurrentTimeLinePosition() !== null && (
                    <div 
                      className="current-time-line"
                      style={{
                        top: `${getCurrentTimeLinePosition()}px`
                      }}
                    >
                      <div className="time-dot"></div>
                      <div className="current-time-label">
                        {currentTime.toLocaleTimeString('zh-TW', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                      </div>
                    </div>
                  )}
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
              <div className="popover-arrow" />
              
              <div className="popover-content">
                <h3>新增活動</h3>
                
                {/* 活動選擇區域 */}
                <div className="activity-type-section">
                  <h4>選擇活動類型</h4>
                  <div className="activity-boxes">
                    {permanentActivities.map(activity => (
                      <div 
                        key={activity.id} 
                        className={`activity-box ${selectedActivityForTime?.id === activity.id ? 'selected' : ''}`}
                        data-id={activity.id}
                        onClick={() => handleSelectActivityType(activity)}
                      >
                        <div className="activity-color-square" style={{ backgroundColor: activity.color }}></div>
                        <span className="activity-name">{activity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 時間選擇區域 */}
                {selectedActivityForTime && (
                  <div className="duration-section">
                    <h4>選擇時長</h4>
                    <div className="duration-grid">
                      {[30, 60, 90, 120].map(minutes => (
                        <button 
                          key={minutes}
                          className="duration-option"
                          onClick={() => handleSelectDuration(minutes)}
                        >
                          {minutes >= 60 ? `${minutes/60}小時` : `${minutes}分鐘`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="popover-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddDialog(false)
                      setSelectedActivityForTime(null)
                    }}
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
              <h3>重訓記錄</h3>
              
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
              
              <div className="workout-history">
                <h4>今日記錄</h4>
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
              <h3>活動管理</h3>
              
              <div className="activity-list">
                {permanentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-info">
                      <div className="activity-color-dot" style={{ backgroundColor: activity.color }}></div>
                      <span className="activity-name">{activity.name}</span>
                    </div>
                    <div className="activity-actions">
                      {!activity.fixed && (
                        <button 
                          className="delete-btn"
                          onClick={() => {
                            if (confirm(`確定要刪除「${activity.name}」？`)) {
                              setPermanentActivities(permanentActivities.filter(a => a.id !== activity.id))
                            }
                          }}
                        >
                          刪除
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="add-activity-section">
                <button 
                  className="add-activity-btn"
                  onClick={() => setShowAddActivityForm(true)}
                >
                  ＋ 新增活動
                </button>
              </div>
              
              <div className="dialog-actions">
                <button onClick={() => setShowActivityManager(false)}>完成</button>
              </div>
            </div>
          </div>
        )}

        {/* 新增活動表單 */}
        {showAddActivityForm && (
          <div className="dialog-overlay" onClick={() => setShowAddActivityForm(false)}>
            <div className="dialog add-activity-form" onClick={e => e.stopPropagation()}>
              <h3>新增活動</h3>
              
              <div className="form-group">
                <label>活動名稱</label>
                <input 
                  type="text" 
                  value={newActivity.name}
                  onChange={e => setNewActivity({...newActivity, name: e.target.value})}
                  placeholder="輸入活動名稱"
                />
              </div>
              
              <div className="form-group">
                <label>顏色</label>
                <div className="color-picker">
                  {morandiColors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${newActivity.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewActivity({...newActivity, color})}
                    />
                  ))}
                </div>
              </div>
              
              <div className="dialog-actions">
                <button onClick={() => {
                  setShowAddActivityForm(false)
                  setNewActivity({ name: '', color: '#C4A484' })
                }}>取消</button>
                <button 
                  onClick={() => {
                    if (newActivity.name.trim()) {
                      setPermanentActivities([...permanentActivities, {
                        id: Date.now().toString(),
                        name: newActivity.name,
                        color: newActivity.color,
                        fixed: false
                      }])
                      setNewActivity({ name: '', color: '#C4A484' })
                      setShowAddActivityForm(false)
                    }
                  }}
                  disabled={!newActivity.name.trim()}
                >
                  新增
                </button>
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
          
          {new Date().getDay() === 0 && (
            <button 
              className="review-btn"
              onClick={() => {
                if(confirm('要將本週安排複製到下週一嗎？')) {
                  const mondayActivities = activityGroups.filter(g => g.day === 0)
                }
              }}
            >
              複製本週安排到下週
            </button>
          )}
        </div>

        <style jsx global>{`
          .simple-timebox {
            padding: 0;
          }

          /* 頂部控制按鈕 */
          .manage-activity-btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #C4A484 0%, #D4B5A0 100%);
            color: white !important;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(196, 164, 132, 0.2);
          }

          .manage-activity-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(196, 164, 132, 0.3);
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
            color: #C4A484;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            font-weight: 600;
          }

          /* 時間表格 */
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

          .time-header {
            background: linear-gradient(135deg, #C4A484 0%, #D4B5A0 100%);
            color: white;
            padding: 16px 12px;
            font-weight: 600;
            text-align: center;
            border-right: 1px solid #e5e7eb;
            font-size: 14px;
          }

          .day-header {
            padding: 16px 12px;
            font-weight: 600;
            text-align: center;
            border-right: 1px solid #e5e7eb;
            color: #8B7355;
            font-size: 14px;
            position: relative;
            background: #FDFCFB;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .day-header.today {
            background: rgba(196, 164, 132, 0.15);
            color: #C4A484;
            font-weight: 700;
          }

          .day-content {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 4px;
          }

          .date-indicator {
            font-size: 11px;
            opacity: 0.6;
            font-weight: 400;
          }

          .date-indicator.today-date {
            opacity: 0.9;
            font-weight: 600;
          }

          /* 週次導航箭頭 */
          .week-nav-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            font-size: 18px;
            font-weight: bold;
            color: #C4A484;
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s;
            padding: 4px 6px;
            border-radius: 4px;
            z-index: 10;
          }

          .left-arrow { left: 2px; }
          .right-arrow { right: 2px; }

          .day-header:hover .week-nav-arrow {
            opacity: 0.7;
          }

          .week-nav-arrow:hover {
            opacity: 1 !important;
            background: rgba(196, 164, 132, 0.1);
          }

          /* 表格主體 */
          .grid-body {
            display: grid;
            grid-template-columns: 90px repeat(7, 1fr);
          }

          .time-labels {
            border-right: 1px solid #e2e8f0;
            background: white;
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
            background: white;
          }

          .day-column {
            position: relative;
            border-right: 1px solid #e5e7eb;
            background: #ffffff;
          }

          .day-column.today-column {
            background: rgba(196, 164, 132, 0.04);
          }

          .slots-layer {
            position: relative;
          }

          .time-slot {
            height: ${timeUnit === 30 ? '40px' : '60px'};
            border-bottom: 1px solid #f8fafc;
            transition: all 0.2s;
            cursor: pointer;
          }

          .time-slot:hover:not(.occupied) {
            background: rgba(196, 164, 132, 0.08) !important;
          }

          /* 當前時間線 - 莫蘭迪風格 */
          .current-time-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #C4A484, #D4B5A0);
            border-radius: 1px;
            z-index: 15;
            display: flex;
            align-items: center;
            box-shadow: 0 0 6px rgba(196, 164, 132, 0.2);
          }

          .time-dot {
            width: 6px;
            height: 6px;
            background: #C4A484;
            border-radius: 50%;
            margin-left: -3px;
            border: 1px solid white;
            box-shadow: 0 0 4px rgba(196, 164, 132, 0.3);
          }

          .current-time-label {
            background: #C4A484;
            color: white;
            font-size: 10px;
            font-weight: 500;
            padding: 1px 4px;
            border-radius: 2px;
            margin-left: 6px;
            white-space: nowrap;
            opacity: 0.9;
            box-shadow: 0 1px 3px rgba(196, 164, 132, 0.2);
          }

          /* 活動視覺 */
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
            transition: all 0.3s;
            overflow: hidden;
            position: relative;
          }

          .activity-block:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }

          /* 統一金屬質感 */
          .activity-block[data-activity="重訓"] {
            background: linear-gradient(135deg, #C4A484 0%, #D4B5A0 50%, #B8956F 100%);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 1px 3px rgba(0,0,0,0.1);
          }

          .activity-block[data-activity="有氧"] {
            background: linear-gradient(135deg, #A8B5A0 0%, #B8C5B0 50%, #98A590 100%);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 1px 3px rgba(0,0,0,0.1);
          }

          .activity-block[data-activity="學習"] {
            background: linear-gradient(135deg, #9DB4CE 0%, #ADC4DE 50%, #8DA4BE 100%);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 1px 3px rgba(0,0,0,0.1);
          }

          .activity-block[data-activity="工作"] {
            background: linear-gradient(135deg, #D4B5A0 0%, #E4C5B0 50%, #C4A590 100%);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 1px 3px rgba(0,0,0,0.1);
          }

          /* 統一金屬光澤效果 */
          .activity-block::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            animation: shine 4s infinite;
            pointer-events: none;
          }

          @keyframes shine {
            0% { left: -100%; }
            25% { left: -100%; }
            100% { left: 100%; }
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

          .activity-popover.right .popover-arrow { left: -6px; }
          .activity-popover.left .popover-arrow { right: -6px; }

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

          /* 活動選擇界面 */
          .activity-type-section {
            margin-bottom: 24px;
          }

          .activity-type-section h4 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
          }

          .activity-boxes {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .activity-box {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
          }

          .activity-box:hover {
            border-color: #C4A484;
            transform: translateY(-1px);
          }

          .activity-box.selected {
            border-color: #C4A484;
            background: rgba(196, 164, 132, 0.05);
            box-shadow: 0 4px 12px rgba(196, 164, 132, 0.15);
          }

          /* 重訓 - 漸層風格 */
          .activity-box[data-id="workout"] {
            background: linear-gradient(135deg, #C4A484 0%, #D4B5A0 50%, #C4A484 100%);
            color: white;
            border: none;
            box-shadow: 0 4px 15px rgba(196, 164, 132, 0.3);
          }

          .activity-box[data-id="workout"]:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(196, 164, 132, 0.4);
          }

          .activity-box[data-id="workout"] .activity-name {
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }

          /* 有氧 - 圓角卡片風格 */
          .activity-box[data-id="cardio"] {
            border-radius: 16px;
            background: #A8B5A0;
            color: white;
            border: none;
            position: relative;
          }

          .activity-box[data-id="cardio"]::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            border-radius: 16px;
          }

          /* 學習 - 漸層邊框風格 */
          .activity-box[data-id="study"] {
            background: white;
            border: 3px solid;
            border-image: linear-gradient(45deg, #9DB4CE, #B5A8D4) 1;
            border-radius: 0;
            position: relative;
          }

          .activity-box[data-id="study"]::after {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(45deg, #9DB4CE, #B5A8D4);
            border-radius: 8px;
            z-index: -1;
          }

          /* 工作 - 陰影層疊風格 */
          .activity-box[data-id="work"] {
            background: #D4B5A0;
            color: white;
            border: none;
            border-radius: 12px;
            box-shadow: 
              0 2px 4px rgba(212, 181, 160, 0.2),
              0 4px 8px rgba(212, 181, 160, 0.15),
              0 8px 16px rgba(212, 181, 160, 0.1);
          }

          .activity-box[data-id="work"]:hover {
            box-shadow: 
              0 4px 8px rgba(212, 181, 160, 0.3),
              0 8px 16px rgba(212, 181, 160, 0.2),
              0 16px 32px rgba(212, 181, 160, 0.15);
            transform: translateY(-3px);
          }

          .activity-color-square {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            flex-shrink: 0;
          }

          /* 重訓的色塊特殊樣式 */
          .activity-box[data-id="workout"] .activity-color-square {
            background: rgba(255,255,255,0.3) !important;
            border: 1px solid rgba(255,255,255,0.5);
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
          }

          /* 有氧的色塊特殊樣式 */
          .activity-box[data-id="cardio"] .activity-color-square {
            background: rgba(255,255,255,0.2) !important;
            border: 1px solid rgba(255,255,255,0.3);
          }

          /* 學習的色塊特殊樣式 */
          .activity-box[data-id="study"] .activity-color-square {
            background: linear-gradient(45deg, #9DB4CE, #B5A8D4) !important;
            border: none;
          }

          /* 工作的色塊特殊樣式 */
          .activity-box[data-id="work"] .activity-color-square {
            background: rgba(255,255,255,0.25) !important;
            border: 1px solid rgba(255,255,255,0.4);
          }

          .activity-box .activity-name {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          }

          /* 時長選擇區域 */
          .duration-section {
            margin-bottom: 20px;
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;
          }

          .duration-section h4 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
          }

          .duration-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .duration-option {
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .duration-option:hover {
            border-color: #C4A484;
            background: #C4A484;
            color: white;
            transform: translateY(-1px);
          }

          .popover-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
          }

          .cancel-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
            background: #f3f4f6;
            color: #6b7280;
          }

          .cancel-btn:hover {
            background: #e5e7eb;
            transform: translateY(-1px);
          }

          /* 對話框樣式 */
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

          .activity-manager {
            max-width: 600px;
          }

          .activity-list {
            margin-bottom: 24px;
          }

          .activity-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            margin-bottom: 8px;
            border: 1px solid #e2e8f0;
          }

          .activity-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .activity-color-dot {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .activity-actions {
            display: flex;
            gap: 8px;
          }

          .delete-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s;
            background: #fef2f2;
            color: #dc2626;
          }

          .delete-btn:hover {
            background: #fecaca;
          }

          .add-activity-section {
            margin-bottom: 24px;
          }

          .add-activity-btn {
            width: 100%;
            padding: 16px;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            background: transparent;
            color: #6b7280;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
          }

          .add-activity-btn:hover {
            border-color: #C4A484;
            color: #C4A484;
            background: rgba(196, 164, 132, 0.05);
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

          .form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
          }

          .form-group input:focus {
            outline: none;
            border-color: #C4A484;
            box-shadow: 0 0 0 3px rgba(196, 164, 132, 0.1);
          }

          .color-picker {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .color-option {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            border: 3px solid transparent;
            cursor: pointer;
            transition: all 0.2s;
          }

          .color-option:hover {
            transform: scale(1.1);
          }

          .color-option.active {
            border-color: white;
            box-shadow: 0 0 0 2px #374151;
            transform: scale(1.1);
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
            background: linear-gradient(135deg, #C4A484, #D4B5A0);
            color: white;
          }

          .dialog-actions button:last-child:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(196, 164, 132, 0.3);
          }

          .dialog-actions button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
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
            border-color: #C4A484;
            box-shadow: 0 0 0 3px rgba(196, 164, 132, 0.1);
          }

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
            border-color: #C4A484;
            box-shadow: 0 4px 15px rgba(196, 164, 132, 0.1);
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
            background: linear-gradient(135deg, #C4A484, #D4B5A0);
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
            box-shadow: 0 6px 20px rgba(196, 164, 132, 0.3);
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
        `}</style>
      </div>
    </ModuleLayout>
  )
}