import { create } from 'zustand'

export interface QuotationItem {
  id: string
  itemName: string
  unitPrice: number
  quantity: number
  subtotal: number
  remark?: string
}

export interface QuotationCost {
  id: string
  category: 'TRANSPORT' | 'ACCOMMODATION' | 'MEAL' | 'TICKET' | 'GUIDE' | 'INSURANCE' | 'OTHER'
  supplier: string
  description: string
  unitCost: number
  quantity: number
  subtotal: number
}

export interface Quotation {
  id: string
  version: number
  clientName: string
  tripDays: number
  dateRange: {
    start: Date
    end: Date
  }
  status: '草稿' | '已報價' | '成交' | '失敗'
  validUntil: Date
  items: QuotationItem[]
  costs: QuotationCost[]
  totalPrice: number
  totalCost: number
  profit: number
  profitRate: number
  createdAt: Date
  updatedAt: Date
  todoId?: string
  projectId?: string
  groupId?: string
}

export const COST_CATEGORIES = {
  TRANSPORT: '交通',
  ACCOMMODATION: '住宿',
  MEAL: '餐食',
  TICKET: '門票',
  GUIDE: '導遊',
  INSURANCE: '保險',
  OTHER: '其他'
} as const

interface QuotationStore {
  quotations: Quotation[]
  currentQuotationNumber: number
  
  // Actions
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => Quotation
  updateQuotation: (id: string, updates: Partial<Quotation>) => void
  deleteQuotation: (id: string) => void
  getQuotation: (id: string) => Quotation | undefined
  getQuotationsByStatus: (status: Quotation['status']) => Quotation[]
  generateQuotationNumber: () => string
  markAsDeal: (id: string) => void
  calculateTotals: (items: QuotationItem[], costs: QuotationCost[]) => {
    totalPrice: number
    totalCost: number
    profit: number
    profitRate: number
  }
}

export const useQuotationStore = create<QuotationStore>((set, get) => ({
  quotations: [],
  currentQuotationNumber: 1,

  generateQuotationNumber: () => {
    const currentNumber = get().currentQuotationNumber
    const year = new Date().getFullYear()
    const formattedNumber = String(currentNumber).padStart(3, '0')
    set({ currentQuotationNumber: currentNumber + 1 })
    return `QUO-${year}-${formattedNumber}`
  },

  calculateTotals: (items: QuotationItem[], costs: QuotationCost[]) => {
    const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0)
    const totalCost = costs.reduce((sum, cost) => sum + cost.subtotal, 0)
    const profit = totalPrice - totalCost
    const profitRate = totalPrice > 0 ? (profit / totalPrice) * 100 : 0
    
    return {
      totalPrice,
      totalCost,
      profit,
      profitRate
    }
  },

  addQuotation: (quotationData) => {
    const quotation: Quotation = {
      ...quotationData,
      id: get().generateQuotationNumber(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    set((state) => ({
      quotations: [...state.quotations, quotation]
    }))
    
    return quotation
  },

  updateQuotation: (id, updates) => {
    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id
          ? {
              ...q,
              ...updates,
              updatedAt: new Date()
            }
          : q
      )
    }))
  },

  deleteQuotation: (id) => {
    set((state) => ({
      quotations: state.quotations.filter((q) => q.id !== id)
    }))
  },

  getQuotation: (id) => {
    return get().quotations.find((q) => q.id === id)
  },

  getQuotationsByStatus: (status) => {
    return get().quotations.filter((q) => q.status === status)
  },

  markAsDeal: (id) => {
    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id
          ? {
              ...q,
              status: '成交' as const,
              updatedAt: new Date()
            }
          : q
      )
    }))
  }
}))
