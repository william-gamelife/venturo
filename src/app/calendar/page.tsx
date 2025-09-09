'use client';

// 直接移植 corner-src 的日曆頁面邏輯，使用 Venturo 樣式

import { useState, useEffect } from 'react';
import CalendarView from '@/components/calendar/CalendarView';
import { 
	CalendarEvent, 
	groupToCalendarEvent, 
	customerBirthdayToCalendarEvent,
	taskToCalendarEvent 
} from './CalendarEventModel';
import { format } from 'date-fns';

// Mock API 資料 - 模擬 corner-src 的資料結構
function generateMockData() {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth();

	// 模擬旅遊團資料
	const mockGroups = [
		{
			groupCode: 'TW2025001',
			groupName: '日本櫻花團',
			departureDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`,
			returnDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
			status: 1,
			description: '東京、大阪賞櫻5日遊'
		},
		{
			groupCode: 'TW2025002',
			groupName: '歐洲經典團',
			departureDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
			returnDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-08`,
			status: 1,
			description: '法國、德國、瑞士8日遊'
		},
		{
			groupCode: 'TW2025003',
			groupName: '台灣環島團',
			departureDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-20`,
			returnDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-24`,
			status: 1,
			description: '台灣深度環島5日遊'
		}
	];

	// 模擬客戶生日資料
	const mockCustomers = [
		{
			id: 'c001',
			name: '王小明',
			birthday: '1990-03-15'
		},
		{
			id: 'c002', 
			name: '李小花',
			birthday: '1985-11-28'
		},
		{
			id: 'c003',
			name: '張大華',
			birthday: '1975-07-10'
		}
	];

	// 模擬任務資料
	const mockTasks = [
		{
			id: 't001',
			title: '準備日本團資料',
			dueDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-10`,
			description: '整理護照、簽證等文件',
			priority: 'high'
		},
		{
			id: 't002',
			title: '聯絡歐洲團客戶',
			dueDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-25`,
			description: '確認行程安排',
			priority: 'medium'
		}
	];

	return { mockGroups, mockCustomers, mockTasks };
}

export default function CalendarPage() {
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [loading, setLoading] = useState(true);

	// 模擬 API 載入
	useEffect(() => {
		const loadCalendarData = async () => {
			try {
				// 模擬網路延遲
				await new Promise(resolve => setTimeout(resolve, 800));

				const { mockGroups, mockCustomers, mockTasks } = generateMockData();
				const allEvents: CalendarEvent[] = [];

				// 轉換旅遊團為日曆事件
				const groupEvents = mockGroups.map(group => groupToCalendarEvent(group));
				allEvents.push(...groupEvents);

				// 轉換客戶生日為日曆事件
				const currentYear = new Date().getFullYear();
				const birthdayEvents = mockCustomers
					.filter(customer => customer.birthday)
					.map(customer => customerBirthdayToCalendarEvent(customer, currentYear));
				allEvents.push(...birthdayEvents);

				// 轉換任務為日曆事件
				const taskEvents = mockTasks.map(task => taskToCalendarEvent(task));
				allEvents.push(...taskEvents);

				setEvents(allEvents);
			} catch (error) {
				console.error('載入日曆資料失敗:', error);
			} finally {
				setLoading(false);
			}
		};

		loadCalendarData();
	}, []);

	// 處理事件點擊
	const handleEventClick = (event: CalendarEvent) => {
		console.log('點擊事件:', event);
		
		// 根據事件類型執行不同的動作
		const extendedProps = event.extendedProps;
		if (extendedProps?.type === 'group' && extendedProps.groupCode) {
			// 可以在這裡導向旅遊團詳細頁面
			alert(`查看旅遊團: ${extendedProps.groupCode}\n${event.title}\n${extendedProps.description || ''}`);
		} else if (extendedProps?.type === 'birthday' && extendedProps.customerId) {
			// 可以在這裡導向客戶詳細頁面
			alert(`客戶生日提醒: ${extendedProps.customerName}`);
		} else if (extendedProps?.type === 'task') {
			// 可以在這裡導向任務編輯頁面
			alert(`任務: ${event.title}\n優先級: ${extendedProps.priority}\n${extendedProps.description || ''}`);
		}
	};

	// 處理日期點擊
	const handleDateClick = (date: string) => {
		console.log('點擊日期:', date);
		// 可以在這裡開啟新增事件的對話框
		alert(`在 ${date} 新增事件`);
	};

	if (loading) {
		return (
			<div style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '60vh',
				background: 'var(--background)'
			}}>
				<div style={{
					textAlign: 'center',
					padding: 'var(--spacing-xl)',
					background: 'var(--surface)',
					borderRadius: 'var(--radius-lg)',
					boxShadow: 'var(--shadow-md)'
				}}>
					<div style={{
						width: '40px',
						height: '40px',
						border: '4px solid var(--border)',
						borderTop: '4px solid var(--primary)',
						borderRadius: '50%',
						animation: 'spin 1s linear infinite',
						margin: '0 auto var(--spacing-md) auto'
					}} />
					<p style={{
						color: 'var(--text-secondary)',
						fontSize: 'var(--font-size-base)',
						margin: 0
					}}>
						載入日曆資料中...
					</p>
				</div>
				
				<style jsx>{`
					@keyframes spin {
						0% { transform: rotate(0deg); }
						100% { transform: rotate(360deg); }
					}
				`}</style>
			</div>
		);
	}

	return (
		<div style={{
			maxWidth: '1400px',
			margin: '0 auto',
			padding: 'var(--spacing-lg)',
			background: 'var(--background)',
			minHeight: '100vh'
		}}>
			{/* 頁面標題 */}
			<div className="gradient-card" style={{ 
				marginBottom: 'var(--spacing-lg)',
				textAlign: 'center'
			}}>
				<h1 style={{
					fontSize: 'var(--font-size-2xl)',
					fontWeight: 700,
					color: 'var(--text-primary)',
					margin: '0 0 var(--spacing-sm) 0'
				}}>
					🗓️ Venturo 日曆系統
				</h1>
				<p style={{
					fontSize: 'var(--font-size-base)',
					color: 'var(--text-secondary)',
					margin: 0,
					lineHeight: 1.5
				}}>
					管理旅遊團行程、客戶生日提醒和重要任務
				</p>
				<div style={{
					marginTop: 'var(--spacing-md)',
					display: 'flex',
					justifyContent: 'center',
					gap: 'var(--spacing-lg)'
				}}>
					<div style={{ textAlign: 'center' }}>
						<div style={{
							fontSize: 'var(--font-size-xl)',
							fontWeight: 700,
							color: 'var(--primary)'
						}}>
							{events.filter(e => e.extendedProps?.type === 'group').length}
						</div>
						<div style={{
							fontSize: 'var(--font-size-sm)',
							color: 'var(--text-secondary)'
						}}>
							旅遊團
						</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{
							fontSize: 'var(--font-size-xl)',
							fontWeight: 700,
							color: '#FF6B6B'
						}}>
							{events.filter(e => e.extendedProps?.type === 'birthday').length}
						</div>
						<div style={{
							fontSize: 'var(--font-size-sm)',
							color: 'var(--text-secondary)'
						}}>
							生日提醒
						</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{
							fontSize: 'var(--font-size-xl)',
							fontWeight: 700,
							color: '#9CAF88'
						}}>
							{events.filter(e => e.extendedProps?.type === 'task').length}
						</div>
						<div style={{
							fontSize: 'var(--font-size-sm)',
							color: 'var(--text-secondary)'
						}}>
							任務
						</div>
					</div>
				</div>
			</div>

			{/* 日曆組件 */}
			<CalendarView
				events={events}
				onEventClick={handleEventClick}
				onDateClick={handleDateClick}
			/>

			{/* 操作說明 */}
			<div className="gradient-card-subtle" style={{
				marginTop: 'var(--spacing-lg)',
				fontSize: 'var(--font-size-sm)',
				color: 'var(--text-secondary)'
			}}>
				<h4 style={{ 
					margin: '0 0 var(--spacing-sm) 0',
					color: 'var(--text-primary)' 
				}}>
					💡 操作說明
				</h4>
				<ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
					<li>點擊日期可新增事件</li>
					<li>點擊事件可查看詳細資訊</li>
					<li>使用上方過濾器切換顯示類型</li>
					<li>當日事件過多時，點擊「更多」查看完整清單</li>
				</ul>
			</div>
		</div>
	);
}