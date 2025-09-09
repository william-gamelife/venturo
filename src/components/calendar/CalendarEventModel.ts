import { CalendarEvent } from '@/types/calendar';
import { format } from 'date-fns';

// 根據團號生成一致的顏色（可調整）
function generateGroupColor(groupCode: string): string {
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
    return format(date, 'yyyy-MM-dd');
  }
  return date;
}

// 將旅遊團資料轉換為日曆事件
export const groupToCalendarEvent = (group: any): CalendarEvent => {
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
  const birthdayStr = customer.birthday;
  let month: number, day: number;

  if (birthdayStr.includes('-')) {
    const parts = birthdayStr.split('-');
    month = parseInt(parts[1]) - 1;
    day = parseInt(parts[2]);
  } else if (birthdayStr.includes('/')) {
    const parts = birthdayStr.split('/');
    if (parts[0].length === 4) {
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    } else {
      month = parseInt(parts[0]) - 1;
      day = parseInt(parts[1]);
    }
  } else {
    const birthday = new Date(birthdayStr + 'T00:00:00');
    month = birthday.getMonth();
    day = birthday.getDate();
  }

  const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    id: `birthday-${customer.id}-${year}`,
    title: `🎂 ${customer.name} 生日`,
    start: eventDate,
    allDay: true,
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
    extendedProps: {
      type: 'birthday',
      customerId: customer.id,
      customerName: customer.name
    }
  };
};

// 將任務轉換為日曆事件
export const taskToCalendarEvent = (task: any): CalendarEvent => {
  const priorityColors = {
    high: '#FF4444',
    medium: '#9CAF88',
    low: '#95A5A6'
  };

  return {
    id: `task-${task.id}`,
    title: task.title,
    start: task.dueDate || formatDateForAPI(new Date()),
    allDay: true,
    backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium,
    borderColor: priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium,
    extendedProps: {
      type: 'task',
      description: task.description,
      priority: task.priority || 'medium'
    }
  };
};

// 將會議轉換為日曆事件
export const meetingToCalendarEvent = (meeting: any): CalendarEvent => {
  return {
    id: `meeting-${meeting.id}`,
    title: meeting.title,
    start: meeting.startTime,
    end: meeting.endTime,
    allDay: false,
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    extendedProps: {
      type: 'meeting',
      description: meeting.description,
      location: meeting.location,
      participants: meeting.participants || []
    }
  };
};

// 計算事件持續天數（用於排序）
export const getEventDuration = (event: CalendarEvent): number => {
  if (!event.end || event.extendedProps?.type === 'birthday') {
    return 0;
  }

  const start = new Date(event.start);
  const end = new Date(event.end);
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return duration;
};

// 事件排序比較函數
export const compareEvents = (a: CalendarEvent, b: CalendarEvent): number => {
  const durationA = getEventDuration(a);
  const durationB = getEventDuration(b);

  // 先按照區間長度排序（短的在前）
  if (durationA !== durationB) {
    return durationA - durationB;
  }

  // 如果區間長度相同，按照開始日期排序
  const getDateString = (date: string): string => {
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
      return date.split('T')[0];
    }
    return format(new Date(date), 'yyyy-MM-dd');
  };

  const startA = getDateString(a.start);
  const startB = getDateString(b.start);

  return startA.localeCompare(startB);
};