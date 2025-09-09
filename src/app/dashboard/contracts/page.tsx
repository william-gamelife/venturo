'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '@/lib/auth-utils'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import { useMode } from '@/contexts/ModeContext'

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
          <div className="header-actions">
            <button 
              className="new-contract-btn"
              onClick={() => router.push('/dashboard/contracts/new')}
            >
              + 新增合約
            </button>
          </div>
        )
      }}
    >
      {/* 搜尋和篩選區 */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜尋合約編號、標題或客戶名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有狀態</option>
            <option value="draft">草稿</option>
            <option value="pending">待簽署</option>
            <option value="active">有效</option>
            <option value="expired">已過期</option>
            <option value="terminated">已終止</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有類型</option>
            <option value="service">服務合約</option>
            <option value="product">產品合約</option>
            <option value="lease">租賃合約</option>
            <option value="other">其他</option>
          </select>
        </div>
      </div>

      {/* 合約列表 */}
      <div className="contracts-grid">
        {filteredContracts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>暫無合約資料</h3>
            <p>開始建立您的第一份合約</p>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div key={contract.id} className="contract-card">
              <div className="contract-header">
                <div className="contract-info">
                  <h3 className="contract-title">{contract.title}</h3>
                  <p className="contract-number">{contract.contractNumber}</p>
                </div>
                <div 
                  className="status-badge"
                  style={getStatusStyle(contract.status)}
                >
                  {getStatusName(contract.status)}
                </div>
              </div>
              
              <div className="contract-details">
                <div className="detail-row">
                  <span className="detail-label">客戶：</span>
                  <span className="detail-value">{contract.clientName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">類型：</span>
                  <span className="detail-value">{getTypeName(contract.contractType)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">金額：</span>
                  <span className="detail-value amount">{formatCurrency(contract.totalAmount, contract.currency)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">期間：</span>
                  <span className="detail-value">
                    {contract.startDate} ~ {contract.endDate || '無期限'}
                  </span>
                </div>
              </div>
              
              {contract.description && (
                <div className="contract-description">
                  {contract.description}
                </div>
              )}
              
              <div className="contract-actions">
                <button 
                  className="action-btn view"
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                >
                  檢視
                </button>
                <button 
                  className="action-btn edit"
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
                >
                  編輯
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6d685f;
          font-size: 16px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .new-contract-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .new-contract-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        .filters-section {
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #c9a961;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #c9a961;
        }

        .contracts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .contract-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .contract-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .contract-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .contract-title {
          font-size: 16px;
          font-weight: 600;
          color: #3a3833;
          margin: 0 0 4px 0;
        }

        .contract-number {
          font-size: 12px;
          color: #6d685f;
          margin: 0;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .contract-details {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .detail-label {
          color: #6d685f;
          font-weight: 500;
        }

        .detail-value {
          color: #3a3833;
        }

        .detail-value.amount {
          font-weight: 600;
          color: #c9a961;
        }

        .contract-description {
          background: rgba(249, 250, 251, 0.8);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #6d685f;
          line-height: 1.4;
        }

        .contract-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.view {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .action-btn.edit {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #6d685f;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .empty-state p {
          margin: 0;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .contracts-grid {
            grid-template-columns: 1fr;
          }
          
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            min-width: auto;
          }
          
          .filter-group {
            justify-content: center;
          }
        }
      `}</style>
    </ModuleLayout>
  )
}