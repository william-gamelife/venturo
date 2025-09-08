export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  all_day: boolean
  type?: 'meeting' | 'task' | 'reminder' | 'personal' | 'work'
  location?: string
  participants?: string[]
  status?: 'confirmed' | 'tentative' | 'cancelled'
  color?: string
  created_at: string
  updated_at: string
}

export interface CalendarEventInput {
  title: string
  description?: string
  start_date: string
  end_date?: string
  all_day: boolean
  type?: 'meeting' | 'task' | 'reminder' | 'personal' | 'work'
  location?: string
  participants?: string[]
  status?: 'confirmed' | 'tentative' | 'cancelled'
  color?: string
}

export interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  onEventUpdate?: (eventId: string, updates: Partial<CalendarEventInput>) => void
  onEventDelete?: (eventId: string) => void
}

export type CalendarView = 'month' | 'week' | 'day'

export interface CalendarState {
  currentDate: Date
  view: CalendarView
  selectedEvent: CalendarEvent | null
  isLoading: boolean
}