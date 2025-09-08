import { supabase } from './client'
import { CalendarEvent, CalendarEventInput } from '@/types/calendar'

export const calendarAPI = {
  // 獲取用戶的所有事件
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }

    return data || []
  },

  // 獲取指定日期範圍的事件
  async getEventsByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching calendar events by date range:', error)
      throw error
    }

    return data || []
  },

  // 創建新事件
  async createEvent(userId: string, eventData: CalendarEventInput): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        ...eventData
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }

    return data
  },

  // 更新事件
  async updateEvent(eventId: string, updates: Partial<CalendarEventInput>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Error updating calendar event:', error)
      throw error
    }

    return data
  },

  // 刪除事件
  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting calendar event:', error)
      throw error
    }
  },

  // 獲取特定日期的事件
  async getEventsByDate(userId: string, date: string): Promise<CalendarEvent[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', startOfDay.toISOString())
      .lte('start_date', endOfDay.toISOString())
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching events by date:', error)
      throw error
    }

    return data || []
  },

  // 搜尋事件
  async searchEvents(userId: string, query: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error searching calendar events:', error)
      throw error
    }

    return data || []
  }
}