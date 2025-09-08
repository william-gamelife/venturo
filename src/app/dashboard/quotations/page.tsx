'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ModuleLayout } from '@/components/ModuleLayout'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { useQuotationStore } from '@/lib/stores/quotation-store'
import { useProjectStore } from '@/lib/stores/project-store'

export default function QuotationsPage() {
  const router = useRouter()
  const quotations = useQuotationStore((state) => state.quotations)
  const { markAsDeal, getQuotation } = useQuotationStore()
  const { createProjectFromQuotation } = useProjectStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showDealModal, setShowDealModal] = useState(false)
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null)
  const [autoCreateGroup, setAutoCreateGroup] = useState(true)

  // 篩選報價單
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch = quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quotation.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      '草稿': 'bg-gray-100 text-gray-800',
      '已報價': 'bg-blue-100 text-blue-800',
      '成交': 'bg-green-100 text-green-800',
      '失敗': 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date: Date) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleDealConfirm = () => {
    if (!selectedQuotationId) return
    
    const quotation = getQuotation(selectedQuotationId)
    if (!quotation) return
    
    // 1. 標記報價單為成交
    markAsDeal(selectedQuotationId)
    
    // 2. 建立專案
    const project = createProjectFromQuotation(
      selectedQuotationId,
      quotation,
      autoCreateGroup
    )
    
    // 3. 如果需要同時開團，導向開團頁面
    if (autoCreateGroup) {
      router.push(`/dashboard/groups/new?projectId=${project.id}&quotationId=${selectedQuotationId}`)
    } else {
      // 否則導向專案頁面
      router.push(`/dashboard/projects/${project.id}`)
    }
    
    setShowDealModal(false)
    setSelectedQuotationId(null)
  }

  return (
    <ModuleLayout>
      <PageHeader 
        title="報價單管理"
        subtitle="管理所有報價單，包含報價、成本與利潤分析"
        icon="📋"
        actions={
          <>
            <div className="quotation-stats">
              <div className="stat-item">
                <span className="stat-number">{quotations.length}</span>
                <span className="stat-label">總報價單數</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-green-600">
                  {quotations.filter(q => q.status === '成交').length}
                </span>
                <span className="stat-label">已成交</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-blue-600">
                  {quotations.filter(q => q.status === '已報價').length}
                </span>
                <span className="stat-label">報價中</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-[#c9a961]">
                  {formatCurrency(
                    quotations
                      .filter(q => q.status === '成交')
                      .reduce((sum, q) => sum + q.profit, 0)
                  )}
                </span>
                <span className="stat-label">總預估利潤</span>
              </div>
            </div>
            <Button
              onClick={() => router.push('/dashboard/quotations/new')}
              className="bg-[#c9a961] hover:bg-[#b39555] text-white"
            >
              + 新增報價單
            </Button>
          </>
        }
      />

      {/* 搜尋和篩選區 */}
      <div className="filter-section">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="搜尋客戶名稱或報價單號..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a961]"
          >
            <option value="all">所有狀態</option>
            <option value="草稿">草稿</option>
            <option value="已報價">已報價</option>
            <option value="成交">成交</option>
            <option value="失敗">失敗</option>
          </select>
        </div>
      </div>

      {/* 報價單列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  報價單號
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客戶名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出團日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  天數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  報價金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  預估利潤
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? '沒有符合條件的報價單' 
                      : '尚無報價單，點擊上方按鈕新增第一筆報價單'}
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quotation.id}
                      {quotation.version > 1 && (
                        <span className="ml-1 text-xs text-gray-500">v{quotation.version}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quotation.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quotation.dateRange.start)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quotation.tripDays} 天
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(quotation.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={quotation.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(quotation.profit)}
                        <span className="text-xs ml-1">
                          ({quotation.profitRate.toFixed(1)}%)
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/quotations/${quotation.id}`)}
                          className="text-[#c9a961] hover:text-[#b39555]"
                        >
                          查看
                        </button>
                        {quotation.status === '已報價' && (
                          <button
                            onClick={() => {
                              setSelectedQuotationId(quotation.id)
                              setShowDealModal(true)
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            成交
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 成交確認彈窗 */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">確認成交</h3>
            <p className="text-gray-600 mb-6">
              確認將此報價單標記為成交嗎？系統將自動：
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 text-sm text-gray-600">
              <li>標記報價單狀態為「成交」</li>
              <li>建立專案並生成預設任務清單</li>
              <li>根據報價內容自動產生相關待辦事項</li>
            </ul>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoCreateGroup}
                  onChange={(e) => setAutoCreateGroup(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">同時開立團體</span>
              </label>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDealModal(false)
                  setSelectedQuotationId(null)
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleDealConfirm}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                確認成交
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .quotation-stats {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        
        .quotation-stats .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        
        .quotation-stats .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
        }
        
        .quotation-stats .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          white-space: nowrap;
        }
        
        .filter-section {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          border: 1px solid #e5e7eb;
        }
        
        @media (max-width: 768px) {
          .quotation-stats {
            flex-direction: column;
            gap: 12px;
          }
          
          .quotation-stats .stat-item {
            flex-direction: row;
            gap: 8px;
          }
        }
      `}</style>
    </ModuleLayout>
  )
}
