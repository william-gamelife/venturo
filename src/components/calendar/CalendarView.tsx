'use client';

// 直接從 corner-src 移植的 CalendarView，使用 Venturo UI 樣式

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateClickArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { CalendarEvent } from '../calendar/CalendarEventModel';

interface CalendarViewProps {
	events?: CalendarEvent[];
	onEventClick?: (event: CalendarEvent) => void;
	onDateClick?: (date: string) => void;
}

export default function CalendarView({ events = [], onEventClick, onDateClick }: CalendarViewProps) {
	const router = useRouter();
	const calendarRef = useRef<FullCalendar>(null);
	const [dateRange, setDateRange] = useState({
		start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
		end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
	});

	// 對話框狀態管理
	const [moreEventsDialog, setMoreEventsDialog] = useState<{
		open: boolean;
		date: string;
		events: any[];
	}>({
		open: false,
		date: '',
		events: []
	});

	// 事件類型過濾狀態
	const [eventFilter, setEventFilter] = useState<'all' | 'groups' | 'birthdays' | 'tasks'>('all');

	// 計算事件日期區間長度的函數
	const getEventDuration = (event: any): number => {
		// 生日事件沒有區間，視為 0 天（排在最前面）
		if (!event.end || event.extendedProps?.type === 'birthday') {
			return 0;
		}

		const start = new Date(event.start);
		const end = new Date(event.end);
		const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		return duration;
	};

	// 事件排序比較函數
	const compareEvents = (a: any, b: any): number => {
		const durationA = getEventDuration(a);
		const durationB = getEventDuration(b);

		// 先按照區間長度排序（短的在前）
		if (durationA !== durationB) {
			return durationA - durationB;
		}

		// 如果區間長度相同，按照開始日期排序
		const getDateString = (date: any): string => {
			if (typeof date === 'string') {
				return date;
			} else if (date instanceof Date) {
				return date.toISOString().split('T')[0];
			} else if (date && typeof date.toISOString === 'function') {
				return date.toISOString().split('T')[0];
			}
			return String(date);
		};

		const startA = getDateString(a.start);
		const startB = getDateString(b.start);

		return startA.localeCompare(startB);
	};

	// 過濾事件函數
	const filterEvents = (events: CalendarEvent[]): CalendarEvent[] => {
		switch (eventFilter) {
			case 'groups':
				return events.filter((event) => event.extendedProps?.type === 'group');
			case 'birthdays':
				return events.filter((event) => event.extendedProps?.type === 'birthday');
			case 'tasks':
				return events.filter((event) => event.extendedProps?.type === 'task');
			case 'all':
			default:
				return events;
		}
	};

	// 應用過濾的事件
	const filteredEvents = filterEvents(events);

	// 處理日期點擊 - 導向新增功能
	const handleDateClick = (info: DateClickArg) => {
		const selectedDate = format(info.date, 'yyyy-MM-dd');
		if (onDateClick) {
			onDateClick(selectedDate);
		} else {
			// 預設行為：可以在這裡添加新增事件的邏輯
			console.log('點擊日期:', selectedDate);
		}
	};

	// 處理事件點擊
	const handleEventClick = (info: EventClickArg) => {
		const event = info.event;
		const calendarEvent: CalendarEvent = {
			id: event.id,
			title: event.title,
			start: event.startStr,
			end: event.endStr,
			allDay: event.allDay,
			backgroundColor: event.backgroundColor,
			borderColor: event.borderColor,
			extendedProps: event.extendedProps as any,
		};

		if (onEventClick) {
			onEventClick(calendarEvent);
		} else {
			// 預設行為
			const extendedProps = event.extendedProps as any;
			if (extendedProps?.type === 'group' && extendedProps.groupCode) {
				console.log('導向旅遊團編輯頁面:', extendedProps.groupCode);
			} else if (extendedProps?.type === 'birthday' && extendedProps.customerId) {
				console.log('導向客戶詳細頁面:', extendedProps.customerId);
			} else if (extendedProps?.type === 'task') {
				console.log('編輯任務:', event.title);
			}
		}
	};

	// 處理日期範圍變更
	const handleDatesSet = (dateInfo: any) => {
		setDateRange({
			start: dateInfo.start,
			end: dateInfo.end
		});
	};

	// 處理 "更多" 連結點擊
	const handleMoreLinkClick = (info: any) => {
		// 阻止預設的 popover 行為
		info.jsEvent.preventDefault();

		const clickedDate = format(info.date, 'yyyy-MM-dd');

		// 取得當天的所有事件（包括顯示的和隱藏的）
		const allDayEvents = events.filter((event: CalendarEvent) => {
			// 處理日期格式
			const getDateString = (date: string | Date | undefined): string => {
				if (!date) return '';

				if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
					return date.split('T')[0];
				}

				return format(new Date(date), 'yyyy-MM-dd');
			};

			const eventStartDate = getDateString(event.start);

			// 對於生日事件（沒有 end date），只檢查 start date
			if (!event.end || event.extendedProps?.type === 'birthday') {
				return eventStartDate === clickedDate;
			}

			// 對於有結束日期的事件（如旅遊團），檢查日期範圍
			const eventEndDate = getDateString(event.end);
			const isInRange = clickedDate >= eventStartDate && clickedDate <= eventEndDate;

			return isInRange;
		});

		// 排序事件：按照日期區間長度排序
		const sortedEvents = allDayEvents.sort(compareEvents);

		setMoreEventsDialog({
			open: true,
			date: clickedDate,
			events: sortedEvents
		});

		return 'none'; // 告訴 FullCalendar 不要顯示預設的 popover
	};

	// 關閉對話框
	const handleCloseDialog = () => {
		setMoreEventsDialog({
			open: false,
			date: '',
			events: []
		});
	};

	return (
		<div className="calendar-container card">
			{/* 事件類型過濾器 - 使用 Venturo 樣式 */}
			<div className="filter-section gradient-card-subtle" style={{ marginBottom: 'var(--spacing-lg)' }}>
				<div style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 'var(--spacing-md)'
				}}>
					<h3 style={{ 
						margin: 0,
						fontSize: 'var(--font-size-lg)',
						fontWeight: 600,
						color: 'var(--text-primary)'
					}}>
						📅 日曆管理
					</h3>
					<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
						<span style={{
							fontSize: 'var(--font-size-sm)',
							color: 'var(--text-secondary)',
							fontWeight: 500
						}}>
							顯示類型：
						</span>
						<div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
							{[
								{ value: 'all', label: '全部顯示' },
								{ value: 'groups', label: '旅遊團' },
								{ value: 'tasks', label: '任務' },
								{ value: 'birthdays', label: '生日' },
							].map(({ value, label }) => (
								<button
									key={value}
									className={`btn ${eventFilter === value ? 'btn-primary' : 'btn-ghost'}`}
									style={{
										padding: 'var(--spacing-xs) var(--spacing-sm)',
										fontSize: 'var(--font-size-sm)'
									}}
									onClick={() => setEventFilter(value as any)}
								>
									{label}
								</button>
							))}
						</div>
						<div className="badge badge-primary" style={{ whiteSpace: 'nowrap' }}>
							{filteredEvents.length} 個事件
						</div>
					</div>
				</div>
			</div>

			{/* FullCalendar 主體 */}
			<div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
				<FullCalendar
					ref={calendarRef}
					plugins={[dayGridPlugin, interactionPlugin]}
					initialView="dayGridMonth"
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: ''
					}}
					events={filteredEvents}
					dateClick={handleDateClick}
					eventClick={handleEventClick}
					datesSet={handleDatesSet}
					locale="zh-tw"
					height="auto"
					dayMaxEvents={false}  // 關閉限制以支援跨日事件
					moreLinkClick={handleMoreLinkClick}
					moreLinkText="更多"
					weekends={true}
					eventDisplay="block"
					displayEventTime={false}
					eventOrder={compareEvents}
					eventClassNames={(arg) => {
						const type = arg.event.extendedProps?.type;
						return `event-${type}`;
					}}
					// 跨日事件相關設置
					eventMinHeight={26}
					dayMaxEventRows={8}
					eventMaxStack={8}
					nextDayThreshold="00:00:00"
				/>
			</div>

			{/* 更多事件對話框 - 使用 Venturo 樣式 */}
			{moreEventsDialog.open && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 1000
				}} onClick={handleCloseDialog}>
					<div className="card" style={{
						maxWidth: '500px',
						width: '90vw',
						maxHeight: '80vh',
						overflowY: 'auto'
					}} onClick={(e) => e.stopPropagation()}>
						<div style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: 'var(--spacing-md)',
							paddingBottom: 'var(--spacing-md)',
							borderBottom: '1px solid var(--border)'
						}}>
							<h3 style={{
								margin: 0,
								fontSize: 'var(--font-size-lg)',
								fontWeight: 600
							}}>
								{moreEventsDialog.date} 的所有活動 ({moreEventsDialog.events.length})
							</h3>
							<button
								className="btn btn-ghost"
								onClick={handleCloseDialog}
								style={{ padding: 'var(--spacing-xs)' }}
							>
								✕
							</button>
						</div>
						
						<div>
							{moreEventsDialog.events.map((event, index) => (
								<div
									key={index}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 'var(--spacing-sm)',
										padding: 'var(--spacing-sm)',
										borderRadius: 'var(--radius-sm)',
										border: '1px solid var(--border)',
										cursor: 'pointer',
										transition: 'all var(--animation-fast)',
										marginBottom: index < moreEventsDialog.events.length - 1 ? 'var(--spacing-sm)' : 0
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = 'var(--surface-hover)';
										e.currentTarget.style.borderColor = 'var(--border-hover)';
										e.currentTarget.style.transform = 'translateY(-1px)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = 'transparent';
										e.currentTarget.style.borderColor = 'var(--border)';
										e.currentTarget.style.transform = 'translateY(0)';
									}}
									onClick={() => {
										handleEventClick({
											event: {
												id: event.id,
												title: event.title,
												startStr: event.start,
												endStr: event.end,
												allDay: event.allDay,
												backgroundColor: event.backgroundColor,
												borderColor: event.borderColor,
												extendedProps: event.extendedProps
											}
										} as any);
										handleCloseDialog();
									}}
								>
									<div style={{
										width: '12px',
										height: '12px',
										borderRadius: 'var(--radius-xs)',
										backgroundColor: event.backgroundColor || event.color || '#2196F3',
										flexShrink: 0
									}} />
									<div style={{ flex: 1 }}>
										<div style={{
											fontWeight: 500,
											marginBottom: 'var(--spacing-xs)'
										}}>
											{event.title}
										</div>
										<div style={{
											fontSize: 'var(--font-size-sm)',
											color: 'var(--text-secondary)'
										}}>
											{(() => {
												if (event.extendedProps?.type === 'birthday') {
													return '生日提醒';
												} else if (event.extendedProps?.type === 'group') {
													let dayInfo = '';
													if (event.end) {
														const start = new Date(event.start);
														const end = new Date(event.end);
														const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
														dayInfo = ` • ${days}天`;
													}
													return `團號: ${event.extendedProps.groupCode}${dayInfo}`;
												} else if (event.extendedProps?.type === 'task') {
													return `任務 • ${event.extendedProps.priority || 'normal'}`;
												}
												return '';
											})()}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* FullCalendar 自定義樣式 */}
			<style jsx global>{`
				.fc-event {
					cursor: pointer;
					border: none !important;
					font-size: 12px;
					padding: 6px 10px;
					font-weight: 500;
					box-shadow: none;
					margin: 1px 0;
					min-height: 24px !important;
					line-height: 1.2;
				}

				.fc-event:hover {
					opacity: 0.85;
					transform: translateY(-1px);
					box-shadow: 0 2px 8px rgba(0,0,0,0.15);
					transition: all 0.2s ease;
				}

				.fc-daygrid-event {
					margin: 1px 0 !important;
					border-radius: 6px !important;
				}

				.fc-daygrid-event-harness {
					margin: 1px 0 !important;
				}

				.fc-h-event {
					border: none !important;
					padding: 6px 10px !important;
					margin-left: 0 !important;
					margin-right: 0 !important;
				}

				/* 跨日事件圓角處理 */
				.fc-event-start {
					border-top-left-radius: 6px !important;
					border-bottom-left-radius: 6px !important;
					border-top-right-radius: 0 !important;
					border-bottom-right-radius: 0 !important;
				}

				.fc-event-end {
					border-top-left-radius: 0 !important;
					border-bottom-left-radius: 0 !important;
					border-top-right-radius: 6px !important;
					border-bottom-right-radius: 6px !important;
				}

				.fc-event:not(.fc-event-start):not(.fc-event-end) {
					border-radius: 0 !important;
				}

				.fc-event.fc-event-start.fc-event-end {
					border-radius: 6px !important;
				}

				.fc-day-today {
					background-color: rgba(201, 169, 97, 0.1) !important;
				}

				.fc-daygrid-day:hover {
					background-color: rgba(0, 0, 0, 0.02);
					cursor: pointer;
				}

				.fc-daygrid-more-link {
					color: var(--primary) !important;
					font-weight: 500 !important;
					text-decoration: none !important;
					padding: 2px 6px !important;
					border-radius: 4px !important;
					transition: all 0.2s ease !important;
				}

				.fc-daygrid-more-link:hover {
					background-color: var(--primary-bg) !important;
				}

				/* 隱藏原生 popover */
				.fc-popover {
					display: none !important;
				}

				/* 事件類型顏色 */
				.event-group {
					/* 由 generateGroupColor 動態設定 */
				}
				
				.event-birthday {
					background-color: #FF6B6B !important;
					border-color: #FF6B6B !important;
				}
				
				.event-task {
					background-color: #9CAF88 !important;
					border-color: #9CAF88 !important;
				}
			`}</style>
		</div>
	);
}