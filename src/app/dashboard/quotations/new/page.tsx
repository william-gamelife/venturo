'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/page-header'
import { Button } from '@/components/Button'
import { useQuotationStore, COST_CATEGORIES, type QuotationItem, type QuotationCost } from '@/lib/stores/quotation-store'

export default function NewQuotationPage() {
  const router = useRouter()
  const { addQuotation, calculateTotals } = useQuotationStore()
  
  // 基本資料
  const [clientName, setClientName] = useState('')
  const [tripDays, setTripDays] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [validDays, setValidDays] = useState(3)
  
  // 報價項目（左側）
  const [items, setItems] = useState<QuotationItem[]>([])
  const [newItem, setNewItem] = useState<Partial<QuotationItem>>({
    itemName: '',
    unitPrice: 0,
    quantity: 1,
    remark: ''
  })
  
  // 成本項目（右側）
  const [costs, setCosts] = useState<QuotationCost[]>([])
  const [newCost, setNewCost] = useState<Partial<QuotationCost>>({
    category: 'OTHER',
    supplier: '',
    description: '',
    unitCost: 0,
    quantity: 1
  })

  // 計算總計
  const totals = calculateTotals(items, costs)

  // 新增報價項目
  const addItem = () => {
    if (!newItem.itemName || !newItem.unitPrice) return
    
    const item: QuotationItem = {
      id: `item-${Date.now()}`,
      itemName: newItem.itemName!,
      unitPrice: newItem.unitPrice!,
      quantity: newItem.quantity || 1,
      subtotal: newItem.unitPrice! * (newItem.quantity || 1),
      remark: newItem.remark
    }
    
    setItems([...items, item])
    setNewItem({ itemName: '', unitPrice: 0, quantity: 1, remark: '' })
  }

  // 刪除報價項目
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // 新增成本項目
  const addCost = () => {
    if (!newCost.description || !newCost.unitCost) return
    
    const cost: QuotationCost = {
      id: `cost-${Date.now()}`,
      category: newCost.category as QuotationCost['category'],
      supplier: newCost.supplier || '',
      description: newCost.description!,
      unitCost: newCost.unitCost!,
      quantity: newCost.quantity || 1,
      subtotal: newCost.unitCost! * (newCost.quantity || 1)
    }
    
    setCosts([...costs, cost])
    setNewCost({ category: 'OTHER', supplier: '', description: '', unitCost: 0, quantity: 1 })
  }

  // 刪除成本項目
  const removeCost = (id: string) => {
    setCosts(costs.filter(cost => cost.id !== id))
  }

  // 儲存報價單
  const handleSave = (status: '草稿' | '已報價') => {
    if (!clientName || !startDate || !endDate) {
      alert('請填寫客戶名稱和出團日期')
      return
    }

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + validDays)

    const quotation = addQuotation({
      version: 1,
      clientName,
      tripDays,
      dateRange: {
        start: new Date(startDate),
        end: new Date(endDate)
      },
      status,
      validUntil,
      items,
      costs,
      ...totals
    })

    router.push('/dashboard/quotations')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="新增報價單"
        subtitle="建立新的報價單，左側為客戶報價，右側為內部成本"
      />

      {/* 基本資料 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">基本資料</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">客戶名稱 *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
              placeholder="請輸入客戶名稱"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出團日期 *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">結束日期 *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">天數</label>
            <input
              type="number"
              value={tripDays}
              onChange={(e) => setTripDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* 左右分離版面 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側 - 客戶報價（會列印） */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">客戶報價</h3>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">會列印</span>
          </div>
          
          {/* 新增報價項目 */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="項目名稱"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="單價"
                  value={newItem.unitPrice || ''}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
                />
                <input
                  type="number"
                  placeholder="數量"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
                  min="1"
                />
                <button
                  onClick={addItem}
                  className="px-4 py-2 bg-[#c9a961] text-white rounded-lg hover:bg-[#b39555]"
                >
                  新增
                </button>
              </div>
              <input
                type="text"
                placeholder="備註（選填）"
                value={newItem.remark || ''}
                onChange={(e) => setNewItem({ ...newItem, remark: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          {/* 報價項目列表 */}
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.itemName}</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.subtotal)}
                  </div>
                  {item.remark && <div className="text-xs text-gray-400 mt-1">{item.remark}</div>}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>

          {/* 報價總計 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>總報價</span>
              <span className="text-[#c9a961]">{formatCurrency(totals.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* 右側 - 內部成本（不列印） */}
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">內部成本</h3>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">不列印</span>
          </div>

          {/* 新增成本項目 */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
            <div className="grid grid-cols-1 gap-3">
              <select
                value={newCost.category}
                onChange={(e) => setNewCost({ ...newCost, category: e.target.value as QuotationCost['category'] })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
              >
                {Object.entries(COST_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="供應商"
                value={newCost.supplier}
                onChange={(e) => setNewCost({ ...newCost, supplier: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
              />
              <input
                type="text"
                placeholder="成本說明"
                value={newCost.description}
                onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="單價"
                  value={newCost.unitCost || ''}
                  onChange={(e) => setNewCost({ ...newCost, unitCost: Number(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
                />
                <input
                  type="number"
                  placeholder="數量"
                  value={newCost.quantity || ''}
                  onChange={(e) => setNewCost({ ...newCost, quantity: Number(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
                  min="1"
                />
                <button
                  onClick={addCost}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  新增
                </button>
              </div>
            </div>
          </div>

          {/* 成本項目列表 */}
          <div className="space-y-2 mb-4">
            {costs.map((cost) => (
              <div key={cost.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                      {COST_CATEGORIES[cost.category]}
                    </span>
                    <span className="font-medium">{cost.description}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {cost.supplier && `${cost.supplier} | `}
                    {formatCurrency(cost.unitCost)} × {cost.quantity} = {formatCurrency(cost.subtotal)}
                  </div>
                </div>
                <button
                  onClick={() => removeCost(cost.id)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>

          {/* 成本總計 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>總成本</span>
              <span className="text-gray-700">{formatCurrency(totals.totalCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 利潤計算區 */}
      <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">利潤分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">總報價</div>
            <div className="text-xl font-bold text-[#c9a961]">{formatCurrency(totals.totalPrice)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">總成本</div>
            <div className="text-xl font-bold text-gray-700">{formatCurrency(totals.totalCost)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">預估利潤</div>
            <div className={`text-xl font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.profit)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">利潤率</div>
            <div className={`text-xl font-bold ${totals.profitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.profitRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="secondary"
          onClick={() => router.push('/dashboard/quotations')}
        >
          取消
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSave('草稿')}
        >
          儲存草稿
        </Button>
        <Button
          onClick={() => handleSave('已報價')}
          className="bg-[#c9a961] hover:bg-[#b39555] text-white"
        >
          確認報價
        </Button>
      </div>
    </div>
  )
}
