'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '@/lib/auth-utils'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import { useMode } from '@/contexts/ModeContext'
import { VersionIndicator } from '@/components/VersionIndicator'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Calendar,
  DollarSign
} from 'lucide-react'

// 合約型別定義
interface Contract {
  id: string
  contractNumber: string
  title: string
  clientName: string
  clientEmail?: string
  contractType: 'service' | 'product' | 'lease' | 'other'
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated'
  startDate: string
  endDate?: string
  totalAmount: number
  currency: 'TWD' | 'USD' | 'EUR'
  description?: string
  terms: string[]
  attachments: string[]
  created_at: string
  updated_at: string
  createdBy: string
}

export default function ContractsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const { currentMode } = useMode()

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      const { user } = await checkAuth()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // 模擬合約數據
      const mockContracts: Contract[] = [
        {
          id: '1',
          contractNumber: 'CT-2024-001',
          title: '網站開發服務合約',
          clientName: '科技公司 A',
          clientEmail: 'contact@company-a.com',
          contractType: 'service',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalAmount: 500000,
          currency: 'TWD',
          description: '企業網站開發與維護服務',
          terms: ['每月提供維護服務', '包含SSL憑證', '24小時技術支援'],
          attachments: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          createdBy: 'admin'
        },
        {
          id: '2',
          contractNumber: 'CT-2024-002',
          title: '軟體授權合約',
          clientName: '製造業 B',
          clientEmail: 'it@company-b.com',
          contractType: 'product',
          status: 'pending',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          totalAmount: 200000,
          currency: 'TWD',
          description: '企業軟體年度授權',
          terms: ['年度授權', '包含更新服務', '用戶培訓'],
          attachments: [],
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          createdBy: 'admin'
        }
      ]
      
      setContracts(mockContracts)
      setLoading(false)
    } catch (error) {
      console.error('載入合約資料失敗:', error)
      setLoading(false)
    }
  }

  // 過濾合約
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    const matchesType = typeFilter === 'all' || contract.contractType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // 狀態標籤樣式
  const getStatusStyle = (status: Contract['status']) => {
    const styles = {
      draft: { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
      pending: { background: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b' },
      active: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
      expired: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
      terminated: { background: 'rgba(75, 85, 99, 0.1)', color: '#4b5563' }
    }
    return styles[status]
  }

  // 狀態中文名稱
  const getStatusName = (status: Contract['status']) => {
    const names = {
      draft: '草稿',
      pending: '待簽署',
      active: '有效',
      expired: '已過期',
      terminated: '已終止'
    }
    return names[status]
  }

  // 合約類型中文名稱
  const getTypeName = (type: Contract['contractType']) => {
    const names = {
      service: '服務合約',
      product: '產品合約',
      lease: '租賃合約',
      other: '其他'
    }
    return names[type]
  }

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: currency === 'TWD' ? 'TWD' : currency,
      minimumFractionDigits: 0
    })
    return formatter.format(amount)
  }

  if (loading) {
    return (
      <div className="loading">
        正在載入合約系統...
      </div>
    )
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.contracts,
        title: "合約管理",
        subtitle: "Contract Management",
        actions: (
          <div className="v-actions">
            <button
              className="v-button variant-primary"
              onClick={() => router.push('/dashboard/contracts/new')}
            >
              <Plus size={16} />
              新增合約
            </button>
          </div>
        )
      }}
    >
      {/* 搜尋和篩選區 */}
      <div className="v-filters">
        <div className="v-search-group">
          <div className="v-input-group">
            <Search className="v-input-icon" size={16} />
            <input
              type="text"
              placeholder="搜尋合約編號、標題或客戶名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="v-input"
            />
          </div>
        </div>

        <div className="v-filter-group">
          <div className="v-select-group">
            <Filter className="v-select-icon" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="v-select"
            >
              <option value="all">所有狀態</option>
              <option value="draft">草稿</option>
              <option value="pending">待簽署</option>
              <option value="active">有效</option>
              <option value="expired">已過期</option>
              <option value="terminated">已終止</option>
            </select>
          </div>

          <div className="v-select-group">
            <FileText className="v-select-icon" size={16} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="v-select"
            >
              <option value="all">所有類型</option>
              <option value="service">服務合約</option>
              <option value="product">產品合約</option>
              <option value="lease">租賃合約</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>
      </div>

      {/* 合約列表 */}
      <div className="v-contracts-grid">
        {filteredContracts.length === 0 ? (
          <div className="v-empty-state">
            <FileText className="v-empty-icon" size={48} />
            <h3 className="v-empty-title">暫無合約資料</h3>
            <p className="v-empty-message">開始建立您的第一份合約</p>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div key={contract.id} className="v-contract-card">
              <div className="v-card-header">
                <div className="v-contract-info">
                  <h3 className="v-contract-title">{contract.title}</h3>
                  <p className="v-contract-number">{contract.contractNumber}</p>
                </div>
                <div
                  className={`v-badge ${
                    contract.status === 'active' ? 'v-success' :
                    contract.status === 'pending' ? 'v-warning' :
                    contract.status === 'expired' ? 'v-danger' :
                    contract.status === 'terminated' ? 'v-secondary' :
                    'v-info'
                  }`}
                >
                  {getStatusName(contract.status)}
                </div>
              </div>

              <div className="v-contract-details">
                <div className="v-detail-row">
                  <span className="v-detail-label">客戶：</span>
                  <span className="v-detail-value">{contract.clientName}</span>
                </div>
                <div className="v-detail-row">
                  <span className="v-detail-label">類型：</span>
                  <span className="v-detail-value">{getTypeName(contract.contractType)}</span>
                </div>
                <div className="v-detail-row">
                  <DollarSign className="v-detail-icon" size={14} />
                  <span className="v-detail-label">金額：</span>
                  <span className="v-detail-value v-amount">{formatCurrency(contract.totalAmount, contract.currency)}</span>
                </div>
                <div className="v-detail-row">
                  <Calendar className="v-detail-icon" size={14} />
                  <span className="v-detail-label">期間：</span>
                  <span className="v-detail-value">
                    {contract.startDate} ~ {contract.endDate || '無期限'}
                  </span>
                </div>
              </div>

              {contract.description && (
                <div className="v-contract-description">
                  {contract.description}
                </div>
              )}

              <div className="v-contract-actions">
                <button
                  className="v-button variant-secondary size-sm"
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                >
                  <Eye size={14} />
                  檢視
                </button>
                <button
                  className="v-button variant-sage size-sm"
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
                >
                  <Edit size={14} />
                  編輯
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        /* Venturo 合約管理樣式 */
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #666;
          font-size: 16px;
        }

        .v-actions {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
        }

        /* 篩選區域 */
        .v-filters {
          margin-bottom: var(--spacing-lg);
          display: flex;
          gap: var(--spacing-lg);
          align-items: center;
          flex-wrap: wrap;
        }

        .v-search-group {
          flex: 1;
          min-width: 300px;
        }

        .v-input-group {
          position: relative;
        }

        .v-input-icon {
          position: absolute;
          left: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
        }

        .v-input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px;
          border: 1px solid #E5E5E5;
          border-radius: var(--radius-md);
          font-size: 14px;
          background: white;
          transition: all 0.2s ease;
        }

        .v-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(212, 196, 160, 0.1);
        }

        .v-filter-group {
          display: flex;
          gap: var(--spacing-sm);
        }

        .v-select-group {
          position: relative;
          min-width: 140px;
        }

        .v-select-icon {
          position: absolute;
          left: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
          z-index: 1;
        }

        .v-select {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px;
          border: 1px solid #E5E5E5;
          border-radius: var(--radius-md);
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .v-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(212, 196, 160, 0.1);
        }

        /* 合約網格 */
        .v-contracts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: var(--spacing-lg);
        }

        .v-empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid #E5E5E5;
        }

        .v-empty-icon {
          color: #999;
          margin-bottom: var(--spacing-md);
        }

        .v-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0 0 var(--spacing-sm) 0;
        }

        .v-empty-message {
          color: #666;
          margin: 0;
        }

        /* 合約卡片 */
        .v-contract-card {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid #E5E5E5;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .v-contract-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          border-color: #D1D5DB;
        }

        .v-card-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid #F0F0F0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .v-contract-info {
          flex: 1;
        }

        .v-contract-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary);
          margin: 0 0 4px 0;
        }

        .v-contract-number {
          font-size: 12px;
          color: #666;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .v-badge {
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .v-badge.v-success {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .v-badge.v-warning {
          background: #FFF3E0;
          color: #F57C00;
        }

        .v-badge.v-danger {
          background: #FFEBEE;
          color: #D32F2F;
        }

        .v-badge.v-secondary {
          background: rgba(196, 164, 167, 0.2);
          color: var(--secondary);
        }

        .v-badge.v-info {
          background: #E3F2FD;
          color: #1976D2;
        }

        /* 合約詳情 */
        .v-contract-details {
          padding: var(--spacing-md) var(--spacing-lg);
        }

        .v-detail-row {
          display: flex;
          align-items: center;
          margin-bottom: var(--spacing-sm);
          font-size: 14px;
          gap: var(--spacing-xs);
        }

        .v-detail-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .v-detail-label {
          color: #666;
          font-weight: 500;
          min-width: 50px;
        }

        .v-detail-value {
          color: #333;
          flex: 1;
          text-align: right;
        }

        .v-detail-value.v-amount {
          font-weight: 600;
          color: var(--primary);
        }

        .v-contract-description {
          padding: var(--spacing-md) var(--spacing-lg);
          background: #FAFAFA;
          font-size: 13px;
          color: #666;
          line-height: 1.5;
          border-top: 1px solid #F0F0F0;
        }

        /* 操作按鈕 */
        .v-contract-actions {
          padding: var(--spacing-md) var(--spacing-lg);
          border-top: 1px solid #F0F0F0;
          display: flex;
          gap: var(--spacing-sm);
          justify-content: flex-end;
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .v-contracts-grid {
            grid-template-columns: 1fr;
          }

          .v-filters {
            flex-direction: column;
            align-items: stretch;
            gap: var(--spacing-md);
          }

          .v-search-group {
            min-width: auto;
          }

          .v-filter-group {
            justify-content: center;
          }

          .v-card-header {
            flex-direction: column;
            gap: var(--spacing-sm);
            align-items: flex-start;
          }

          .v-detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .v-detail-value {
            text-align: left;
          }
        }

        @media (max-width: 480px) {
          .v-contracts-grid {
            gap: var(--spacing-md);
          }

          .v-card-header,
          .v-contract-details,
          .v-contract-actions {
            padding: var(--spacing-md);
          }
        }
      `}</style>
      
      <VersionIndicator 
        page="合約管理"
        authSystem="venturoAuth" 
        version="1.1"
        status="working"
      />
    </ModuleLayout>
  )
}
