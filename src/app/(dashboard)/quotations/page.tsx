'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ModuleLayout } from '@/components/ModuleLayout'
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
      '草稿': 'v-badge variant-primary',
      '已報價': 'v-badge variant-info', 
      '成交': 'v-badge variant-success',
      '失敗': 'v-badge variant-danger'
    }
    return styles[status as keyof typeof styles] || 'v-badge variant-primary'
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
            <div className="v-stats-group">
              <div className="v-stat-item">
                <span className="v-stat-number variant-primary">{quotations.length}</span>
                <span className="v-stat-label">總報價單數</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-number variant-success">
                  {quotations.filter(q => q.status === '成交').length}
                </span>
                <span className="v-stat-label">已成交</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-number variant-info">
                  {quotations.filter(q => q.status === '已報價').length}
                </span>
                <span className="v-stat-label">報價中</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-number variant-primary">
                  {formatCurrency(
                    quotations
                      .filter(q => q.status === '成交')
                      .reduce((sum, q) => sum + q.profit, 0)
                  )}
                </span>
                <span className="v-stat-label">總預估利潤</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/quotations/new')}
              className="v-button variant-primary"
            >
              <svg className="v-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              新增報價單
            </button>
          </>
        )
      }}
    >

      {/* 搜尋和篩選區 - 無額外容器，直接呈現 */}
      <div className="v-filters">
        <input
          type="text"
          placeholder="搜尋客戶名稱或報價單號..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="v-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="v-select"
        >
          <option value="all">所有狀態</option>
          <option value="草稿">草稿</option>
          <option value="已報價">已報價</option>
          <option value="成交">成交</option>
          <option value="失敗">失敗</option>
        </select>
      </div>

      {/* 報價單列表 - 直接呈現表格，無額外容器 */}
      {filteredQuotations.length === 0 ? (
        <div className="v-empty-state">
          <svg className="v-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11H15M9 15H15M5 7H19L18 19H6L5 7Z"/>
          </svg>
          <p>
            {searchTerm || statusFilter !== 'all' 
              ? '沒有符合條件的報價單' 
              : '尚無報價單，點擊上方按鈕新增第一筆報價單'}
          </p>
        </div>
      ) : (
        <table className="v-table">
          <thead>
            <tr>
              <th>報價單號</th>
              <th>客戶名稱</th>
              <th>出團日期</th>
              <th>天數</th>
              <th>報價金額</th>
              <th>預估利潤</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.map((quotation) => (
              <tr key={quotation.id}>
                <td className="v-table-cell-primary">
                  {quotation.id}
                  {quotation.version > 1 && (
                    <span className="v-table-cell-sub">v{quotation.version}</span>
                  )}
                </td>
                <td>{quotation.clientName}</td>
                <td>{formatDate(quotation.dateRange.start)}</td>
                <td>{quotation.tripDays} 天</td>
                <td className="v-table-cell-amount">
                  {formatCurrency(quotation.totalPrice)}
                </td>
                <td>
                  <div className="v-table-cell-stack">
                    <span className={quotation.profit >= 0 ? 'v-table-cell-success' : 'v-table-cell-danger'}>
                      {formatCurrency(quotation.profit)}
                    </span>
                    <span className="v-table-cell-sub">
                      ({quotation.profitRate.toFixed(1)}%)
                    </span>
                  </div>
                </td>
                <td>
                  <span className={getStatusBadge(quotation.status)}>
                    {quotation.status}
                  </span>
                </td>
                <td>
                  <div className="v-table-actions">
                    <button
                      onClick={() => router.push(`/dashboard/quotations/${quotation.id}`)}
                      className="v-link variant-primary"
                    >
                      查看
                    </button>
                    {quotation.status === '已報價' && (
                      <button
                        onClick={() => {
                          setSelectedQuotationId(quotation.id)
                          setShowDealModal(true)
                        }}
                        className="v-link variant-success"
                      >
                        成交
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 成交確認彈窗 - 使用 Venturo 的 dialog 樣式 */}
      {showDealModal && (
        <div className="v-dialog-overlay" onClick={() => setShowDealModal(false)}>
          <div className="v-dialog size-md" onClick={(e) => e.stopPropagation()}>
            <div className="v-dialog-header">
              <h3 className="v-dialog-title">確認成交</h3>
            </div>
            <div className="v-dialog-content">
              <p className="v-text-secondary">
                確認將此報價單標記為成交嗎？系統將自動：
              </p>
              <ul className="v-list">
                <li>標記報價單狀態為「成交」</li>
                <li>建立專案並生成預設任務清單</li>
                <li>根據報價內容自動產生相關待辦事項</li>
              </ul>
              
              <div className="v-checkbox-group">
                <label className="v-checkbox">
                  <input
                    type="checkbox"
                    checked={autoCreateGroup}
                    onChange={(e) => setAutoCreateGroup(e.target.checked)}
                  />
                  <span>同時開立團體</span>
                </label>
              </div>
            </div>
            <div className="v-dialog-footer">
              <button
                className="v-button variant-secondary"
                onClick={() => {
                  setShowDealModal(false)
                  setSelectedQuotationId(null)
                }}
              >
                取消
              </button>
              <button
                onClick={handleDealConfirm}
                className="v-button variant-success"
              >
                確認成交
              </button>
            </div>
          </div>
        </div>
      )}
    </ModuleLayout>
  )
}
