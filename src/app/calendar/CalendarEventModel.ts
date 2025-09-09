// 直接從 corner-src 移植的事件模型，適配 Venturo 專案

export interface CalendarEvent {
	id: string;
	title: string;
	start: string; // 統一使用字串格式避免序列化問題
	end?: string;
	allDay?: boolean;
	color?: string;
	backgroundColor?: string;
	borderColor?: string;
	extendedProps?: {
		type: 'group' | 'birthday' | 'task' | 'meeting';
		groupCode?: string;
		customerId?: string;
		customerName?: string;
		groupName?: string;
		departureDate?: string; // 統一使用字串格式
		returnDate?: string;
		status?: number;
		description?: string;
		priority?: string;
	};
}

// 根據團號生成一致的顏色
function generateGroupColor(groupCode: string): string {
	// 預定義的顏色調色板（避免使用生日的 #FF6B6B）
	const colorPalette = [
		'#4ECDC4', // 青色
		'#45B7D1', // 藍色
		'#96CEB4', // 綠色
		'#FECA57', // 黃色
		'#DDA0DD', // 紫色
		'#98D8C8', // 薄荷綠
		'#F8B500', // 橙色
		'#FF8A95', // 粉紅色
		'#55A3FF', // 天藍色
		'#5D62B5', // 靛藍色
		'#F2726F', // 珊瑚色
		'#FFC05C', // 金色
		'#8B5A8F', // 梅紫色
		'#407261', // 深綠色
		'#E85D75', // 玫瑰色
		'#7B68EE', // 中板岩藍
		'#20B2AA', // 淺海綠
		'#9370DB'  // 中紫色
	];

	// 使用團號的 hash 值來選擇顏色
	let hash = 0;
	for (let i = 0; i < groupCode.length; i++) {
		hash = groupCode.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % colorPalette.length;

	return colorPalette[index];
}

// 格式化日期為 API 格式
function formatDateForAPI(date: Date | string): string {
	if (typeof date === 'string') return date;
	if (date instanceof Date) {
		return date.toISOString().split('T')[0];
	}
	return date;
}

// 將旅遊團資料轉換為日曆事件
export const groupToCalendarEvent = (group: any): CalendarEvent => {
	// 確保日期為字串格式
	const formatDate = (date: any): string | undefined => {
		if (!date) return undefined;
		if (typeof date === 'string') return date;
		if (date instanceof Date) return formatDateForAPI(date);
		return date;
	};

	const backgroundColor = generateGroupColor(group.groupCode || group.id || 'default');

	return {
		id: `group-${group.groupCode || group.id}`,
		title: group.groupName || group.title,
		start: formatDate(group.departureDate) || group.departureDate,
		end: formatDate(group.returnDate),
		allDay: true,
		backgroundColor,
		borderColor: backgroundColor,
		extendedProps: {
			type: 'group',
			groupCode: group.groupCode,
			groupName: group.groupName,
			departureDate: formatDate(group.departureDate) || group.departureDate,
			returnDate: formatDate(group.returnDate),
			status: group.status,
			description: group.description
		}
	};
};

// 將客戶生日轉換為日曆事件
export const customerBirthdayToCalendarEvent = (customer: any, year: number): CalendarEvent => {
	// 使用字串分割來避免時區問題
	const birthdayStr = customer.birthday;
	let month: number, day: number;

	if (birthdayStr.includes('-')) {
		// 格式: YYYY-MM-DD
		const parts = birthdayStr.split('-');
		month = parseInt(parts[1]) - 1; // 月份是 0-based
		day = parseInt(parts[2]);
	} else if (birthdayStr.includes('/')) {
		// 格式: YYYY/MM/DD 或 MM/DD/YYYY
		const parts = birthdayStr.split('/');

		if (parts[0].length === 4) {
			// YYYY/MM/DD
			month = parseInt(parts[1]) - 1;
			day = parseInt(parts[2]);
		} else {
			// MM/DD/YYYY
			month = parseInt(parts[0]) - 1;
			day = parseInt(parts[1]);
		}
	} else {
		// 如果無法解析，使用原本的方式但加上時區修正
		const birthday = new Date(birthdayStr + 'T00:00:00');
		month = birthday.getMonth();
		day = birthday.getDate();
	}

	// 建立該年的生日日期
	const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

	return {
		id: `birthday-${customer.id}-${year}`,
		title: `🎂 ${customer.name} 生日`,
		start: eventDate, // 直接使用 YYYY-MM-DD 格式
		allDay: true,
		backgroundColor: '#FF6B6B', // 生日固定使用紅色
		borderColor: '#FF6B6B',
		extendedProps: {
			type: 'birthday',
			customerId: customer.id,
			customerName: customer.name
		}
	};
};

// 任務轉換為日曆事件
export const taskToCalendarEvent = (task: any): CalendarEvent => {
	return {
		id: `task-${task.id}`,
		title: task.title,
		start: task.dueDate || formatDateForAPI(new Date()),
		allDay: true,
		backgroundColor: '#9CAF88',
		borderColor: '#9CAF88',
		extendedProps: {
			type: 'task',
			description: task.description,
			priority: task.priority || 'medium'
		}
	};
};