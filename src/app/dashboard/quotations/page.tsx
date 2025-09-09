'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'
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
      '草稿': 'badge-primary',
      '已報價': 'badge-info', 
      '成交': 'badge-success',
      '失敗': 'badge-danger'
    }
    return styles[status as keyof typeof styles] || 'badge-primary'
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
    <ModuleLayout
      header={{
        icon: Icons.quotations,
        title: "報價單管理",
        subtitle: "管理所有報價單，包含報價、成本與利潤分析",
        actions: (
          <>
            <div className="quotation-stats">
              <div className="stat-item">
                <span className="stat-number" style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{quotations.length}</span>
                <span className="stat-label">總報價單數</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-success">
                  {quotations.filter(q => q.status === '成交').length}
                </span>
                <span className="stat-label">已成交</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-info">
                  {quotations.filter(q => q.status === '已報價').length}
                </span>
                <span className="stat-label">報價中</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-primary">
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
              className="btn-primary"
            >
              + 新增報價單
            </Button>
          </>
        )
      }}
    >

      {/* 搜尋和篩選區 */}
      <div className="card">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="搜尋客戶名稱或報價單號..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
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
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>
                  報價單號
                </th>
                <th>
                  客戶名稱
                </th>
                <th>
                  出團日期
                </th>
                <th>
                  天數
                </th>
                <th>
                  報價金額
                </th>
                <th>
                  預估利潤
                </th>
                <th>
                  狀態
                </th>
                <th>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-lg text-center text-muted">
                    {searchTerm || statusFilter !== 'all' 
                      ? '沒有符合條件的報價單' 
                      : '尚無報價單，點擊上方按鈕新增第一筆報價單'}
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id}>
                    <td className="p-md">
                      {quotation.id}
                      {quotation.version > 1 && (
                        <span className="m-sm text-muted">v{quotation.version}</span>
                      )}
                    </td>
                    <td className="p-md">
                      {quotation.clientName}
                    </td>
                    <td className="p-md text-muted">
                      {formatDate(quotation.dateRange.start)}
                    </td>
                    <td className="p-md text-muted">
                      {quotation.tripDays} 天
                    </td>
                    <td className="p-md">
                      {formatCurrency(quotation.totalPrice)}
                    </td>
                    <td className="p-md">
                      <span className={quotation.profit >= 0 ? 'text-success' : 'text-danger'}>
                        {formatCurrency(quotation.profit)}
                        <span className="text-muted m-sm">
                          ({quotation.profitRate.toFixed(1)}%)
                        </span>
                      </span>
                    </td>
                    <td className="p-md">
                      <span className={`badge ${getStatusBadge(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="p-md">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/quotations/${quotation.id}`)}
                          className="text-primary hover:text-primary-hover"
                        >
                          查看
                        </button>
                        {quotation.status === '已報價' && (
                          <button
                            onClick={() => {
                              setSelectedQuotationId(quotation.id)
                              setShowDealModal(true)
                            }}
                            className="text-success hover:text-success"
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
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3 className="modal-title">確認成交</h3>
            <p className="modal-description text-secondary">
              確認將此報價單標記為成交嗎？系統將自動：
            </p>
            <ul className="modal-list">
              <li>標記報價單狀態為「成交」</li>
              <li>建立專案並生成預設任務清單</li>
              <li>根據報價內容自動產生相關待辦事項</li>
            </ul>
            
            <div className="modal-checkbox">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoCreateGroup}
                  onChange={(e) => setAutoCreateGroup(e.target.checked)}
                  className="modal-input"
                />
                <span>同時開立團體</span>
              </label>
            </div>
            
            <div className="modal-actions">
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
                className="btn-success"
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
        
        /* 彈窗樣式 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          max-width: 400px;
          width: 100%;
          margin: 16px;
        }
        
        .modal-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .modal-description {
          margin-bottom: 24px;
        }
        
        .modal-list {
          list-style: disc;
          padding-left: 20px;
          margin-bottom: 24px;
          color: var(--text-secondary);
        }
        
        .modal-list li {
          margin-bottom: 8px;
        }
        
        .modal-checkbox {
          margin-bottom: 24px;
        }
        
        .modal-input {
          margin-right: 8px;
        }
        
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
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
