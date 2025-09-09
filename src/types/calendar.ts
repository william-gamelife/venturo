export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    type: 'group' | 'birthday' | 'task' | 'meeting' | 'personal';
    groupCode?: string;
    customerId?: string;
    customerName?: string;
    groupName?: string;
    departureDate?: string;
    returnDate?: string;
    status?: number;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    location?: string;
    participants?: string[];
  };
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  type?: 'meeting' | 'task' | 'reminder' | 'personal' | 'work';
  location?: string;
  participants?: string[];
  status?: 'confirmed' | 'tentative' | 'cancelled';
  color?: string;
}

export interface CalendarViewProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
  onEventUpdate?: (eventId: string, updates: Partial<CalendarEventInput>) => void;
  onEventDelete?: (eventId: string) => void;
}

export type CalendarViewType = 'month' | 'week' | 'day';
export type EventFilterType = 'all' | 'groups' | 'birthdays' | 'tasks' | 'meetings' | 'personal';

export interface CalendarState {
  currentDate: Date;
  view: CalendarViewType;
  selectedEvent: CalendarEvent | null;
  isLoading: boolean;
  eventFilter: EventFilterType;
}