export class Validator {
  static todo = {
    create: (data: any) => {
      const errors: string[] = []
      if (!data.title?.trim()) errors.push('標題必填')
      if (data.title?.length > 100) errors.push('標題過長')
      if (data.description && data.description.length > 500) errors.push('描述過長')
      if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
        errors.push('優先級格式錯誤')
      }
      return { valid: errors.length === 0, errors }
    },
    
    update: (data: any) => {
      const errors: string[] = []
      if (data.title !== undefined && !data.title?.trim()) errors.push('標題不能為空')
      if (data.title && data.title.length > 100) errors.push('標題過長')
      if (data.description && data.description.length > 500) errors.push('描述過長')
      if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
        errors.push('優先級格式錯誤')
      }
      if (data.status && !['backlog', 'doing', 'done'].includes(data.status)) {
        errors.push('狀態格式錯誤')
      }
      return { valid: errors.length === 0, errors }
    }
  }
  
  static project = {
    create: (data: any) => {
      const errors: string[] = []
      if (!data.title?.trim()) errors.push('專案名稱必填')
      if (data.title?.length > 100) errors.push('專案名稱過長')
      if (data.description && data.description.length > 1000) errors.push('專案描述過長')
      if (data.status && !['planning', 'active', 'paused', 'completed'].includes(data.status)) {
        errors.push('專案狀態格式錯誤')
      }
      return { valid: errors.length === 0, errors }
    },
    
    update: (data: any) => {
      const errors: string[] = []
      if (data.title !== undefined && !data.title?.trim()) errors.push('專案名稱不能為空')
      if (data.title && data.title.length > 100) errors.push('專案名稱過長')
      if (data.description && data.description.length > 1000) errors.push('專案描述過長')
      if (data.status && !['planning', 'active', 'paused', 'completed'].includes(data.status)) {
        errors.push('專案狀態格式錯誤')
      }
      if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
        errors.push('進度必須在 0-100 之間')
      }
      return { valid: errors.length === 0, errors }
    }
  }
  
  static timebox = {
    create: (data: any) => {
      const errors: string[] = []
      if (!data.date) errors.push('日期必填')
      if (!data.startTime) errors.push('開始時間必填')
      if (!data.endTime) errors.push('結束時間必填')
      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        errors.push('結束時間必須晚於開始時間')
      }
      if (data.title && data.title.length > 100) errors.push('標題過長')
      return { valid: errors.length === 0, errors }
    },
    
    update: (data: any) => {
      const errors: string[] = []
      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        errors.push('結束時間必須晚於開始時間')
      }
      if (data.title && data.title.length > 100) errors.push('標題過長')
      return { valid: errors.length === 0, errors }
    }
  }
  
  static finance = {
    create: (data: any) => {
      const errors: string[] = []
      if (!data.amount && data.amount !== 0) errors.push('金額必填')
      if (typeof data.amount !== 'number') errors.push('金額格式錯誤')
      if (!data.type || !['income', 'expense'].includes(data.type)) {
        errors.push('類型必須是收入或支出')
      }
      if (!data.category?.trim()) errors.push('分類必填')
      if (!data.date) errors.push('日期必填')
      return { valid: errors.length === 0, errors }
    },
    
    update: (data: any) => {
      const errors: string[] = []
      if (data.amount !== undefined && typeof data.amount !== 'number') {
        errors.push('金額格式錯誤')
      }
      if (data.type && !['income', 'expense'].includes(data.type)) {
        errors.push('類型必須是收入或支出')
      }
      if (data.category !== undefined && !data.category?.trim()) {
        errors.push('分類不能為空')
      }
      return { valid: errors.length === 0, errors }
    }
  }
}