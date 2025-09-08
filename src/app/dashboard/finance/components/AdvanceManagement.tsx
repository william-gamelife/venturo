'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'

interface Advance {
  id: string
  title: string
  amount: number
  purpose: string
  status: 'pending' | 'approved' | 'disbursed' | 'reimbursed' | 'rejected'
  requester: string
  requestedAt: string
  approvedAt?: string
  disbursedAt?: string
  dueDate: string
  reimbursedAmount: number
  outstandingAmount: number
  description?: string
  projectName?: string
  documents: string[]
  approvalNotes?: string
}

interface Reimbursement {
  id: string
  advanceId?: string
  title: string
  amount: number
  status: 'pending' | 'approved' | 'processed' | 'rejected'
  submittedAt: string
  approvedAt?: string
  processedAt?: string
  receipts: string[]
  description?: string
  notes?: string
  approvalNotes?: string
}

export function AdvanceManagement() {
  const [activeTab, setActiveTab] = useState<'advances' | 'reimbursements'>('advances')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showRequestModal, setShowRequestModal] = useState(false)

  // 墊款資料
  const [advances, setAdvances] = useState<Advance[]>([
    {
      id: '1',
      title: '客戶拜訪交通費',
      amount: 5000,
      purpose: '台中客戶會議交通住宿費',
      status: 'approved',
      requester: '張小明',
      requestedAt: '2025-01-05',
      approvedAt: '2025-01-06',
      dueDate: '2025-02-05',
      reimbursedAmount: 0,
      outstandingAmount: 5000,
      description: '拜訪台中重要客戶，預計2天1夜',
      projectName: '台中區域拓展計畫',
      documents: ['travel_plan.pdf', 'client_meeting_agenda.pdf'],
      approvalNotes: '同意此次出差，請保存好所有收據'
    },
    {
      id: '2',
      title: '辦公用品採購',
      amount: 8000,
      purpose: 'Q1辦公用品及設備採購',
      status: 'disbursed',
      requester: '李美華',
      requestedAt: '2025-01-03',
      approvedAt: '2025-01-04',
      disbursedAt: '2025-01-05',
      dueDate: '2025-01-20',
      reimbursedAmount: 7650,
      outstandingAmount: 350,
      description: '包含文具、影印紙、清潔用品等',
      documents: ['purchase_list.xlsx', 'quotes.pdf'],
      approvalNotes: '已核准，請選擇性價比最高的供應商'
    },
    {
      id: '3',
      title: '展覽參展費用',
      amount: 15000,
      purpose: '台北國際電腦展參展費用',
      status: 'pending',
      requester: '陳志華',
      requestedAt: '2025-01-08',
      dueDate: '2025-01-25',
      reimbursedAmount: 0,
      outstandingAmount: 15000,
      description: '包含展位租金、裝潢、宣傳物料等',
      projectName: '2025年市場推廣計畫',
      documents: ['exhibition_proposal.pdf', 'budget_breakdown.xlsx']
    },
    {
      id: '4',
      title: '員工培訓費用',
      amount: 12000,
      purpose: 'React進階開發課程',
      status: 'reimbursed',
      requester: '王小美',
      requestedAt: '2024-12-20',
      approvedAt: '2024-12-21',
      disbursedAt: '2024-12-22',
      dueDate: '2025-01-20',
      reimbursedAmount: 12000,
      outstandingAmount: 0,
      description: '提升團隊技術能力，為期5天課程',
      documents: ['training_certificate.pdf', 'receipts.pdf'],
      approvalNotes: '已完成培訓並通過測試，同意核銷'
    }
  ])

  // 核銷資料
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([
    {
      id: '1',
      advanceId: '2',
      title: '辦公用品採購核銷',
      amount: 7650,
      status: 'approved',
      submittedAt: '2025-01-07',
      approvedAt: '2025-01-08',
      receipts: ['receipt_1.jpg', 'receipt_2.jpg', 'receipt_3.jpg'],
      description: '實際採購金額比預期少350元',
      notes: '已購買所有必需品，剩餘金額將退回',
      approvalNotes: '收據齊全，核銷金額正確'
    },
    {
      id: '2',
      title: '客戶招待餐費',
      amount: 3200,
      status: 'pending',
      submittedAt: '2025-01-08',
      receipts: ['dinner_receipt.jpg'],
      description: '與重要客戶晚餐，商談合作事宜',
      notes: '餐廳：君悅大飯店，參與人數：4人'
    },
    {
      id: '3',
      advanceId: '4',
      title: '員工培訓費用核銷',
      amount: 12000,
      status: 'processed',
      submittedAt: '2025-01-05',
      approvedAt: '2025-01-06',
      processedAt: '2025-01-07',
      receipts: ['training_invoice.pdf', 'completion_certificate.pdf'],
      description: 'React進階課程已完成',
      notes: '課程效果良好，團隊技術能力顯著提升',
      approvalNotes: '培訓成果優秀，核銷完成'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B'
      case 'approved': return '#3B82F6'
      case 'disbursed': return '#8B5CF6'
      case 'reimbursed': case 'processed': return '#10B981'
      case 'rejected': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待審核'
      case 'approved': return '已核准'
      case 'disbursed': return '已撥款'
      case 'reimbursed': return '已核銷'
      case 'processed': return '已處理'
      case 'rejected': return '已拒絕'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return ''
      case 'approved': return ''
      case 'disbursed': return ''
      case 'reimbursed': case 'processed': return ''
      case 'rejected': return ''
      default: return ''
    }
  }

  const filteredAdvances = selectedStatus === 'all' 
    ? advances 
    : advances.filter(advance => advance.status === selectedStatus)

  const filteredReimbursements = selectedStatus === 'all' 
    ? reimbursements 
    : reimbursements.filter(reimbursement => reimbursement.status === selectedStatus)

  const totalAdvanceAmount = advances.reduce((sum, advance) => sum + advance.amount, 0)
  const totalOutstanding = advances.reduce((sum, advance) => sum + advance.outstandingAmount, 0)
  const pendingCount = advances.filter(a => a.status === 'pending').length
  const reimbursementPending = reimbursements.filter(r => r.status === 'pending').length

  return (
    <>
      <div className="advance-header">
        <div className="header-info">
          <h2> 墊款核銷管理</h2>
          <p>管理公司墊款申請與費用核銷，讓財務流程更透明</p>
          <div className="header-stats">
            <span>待處理墊款: {pendingCount} 件</span>
            <span>待處理核銷: {reimbursementPending} 件</span>
          </div>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary" 
            onClick={() => setShowRequestModal(true)}
          >
            ➕ 申請墊款
          </Button>
          <Button variant="ghost">
             財務報告
          </Button>
        </div>
      </div>

      {/* 統計概覽 */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <span className="stat-label">總墊款金額</span>
            <span className="stat-value">NT$ {totalAdvanceAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <span className="stat-label">未核銷金額</span>
            <span className="stat-value outstanding">NT$ {totalOutstanding.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <span className="stat-label">待處理申請</span>
            <span className="stat-value pending">{pendingCount + reimbursementPending} 件</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <span className="stat-label">完成率</span>
            <span className="stat-value success">
              {advances.length > 0 ? Math.round((advances.filter(a => a.status === 'reimbursed').length / advances.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 主要導航 */}
      <div className="main-tabs">
        <button
          className={`tab-button ${activeTab === 'advances' ? 'active' : ''}`}
          onClick={() => setActiveTab('advances')}
        >
          <span className="tab-icon"></span>
          <span>墊款申請</span>
          {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'reimbursements' ? 'active' : ''}`}
          onClick={() => setActiveTab('reimbursements')}
        >
          <span className="tab-icon"></span>
          <span>費用核銷</span>
          {reimbursementPending > 0 && <span className="badge">{reimbursementPending}</span>}
        </button>
      </div>

      {/* 狀態篩選 */}
      <div className="status-filter">
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="status-select"
        >
          <option value="all">全部狀態</option>
          <option value="pending">待審核</option>
          <option value="approved">已核准</option>
          <option value="disbursed">已撥款</option>
          <option value="reimbursed">已核銷</option>
          <option value="processed">已處理</option>
          <option value="rejected">已拒絕</option>
        </select>
      </div>

      {/* 墊款列表 */}
      {activeTab === 'advances' && (
        <div className="content-section">
          <h3> 墊款申請列表</h3>
          {filteredAdvances.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>暫無墊款申請</h3>
              <p>開始您的第一個墊款申請</p>
              <Button variant="primary" onClick={() => setShowRequestModal(true)}>
                ➕ 申請墊款
              </Button>
            </div>
          ) : (
            <div className="items-grid">
              {filteredAdvances.map((advance) => (
                <div key={advance.id} className="item-card">
                  <div className="item-header">
                    <div className="item-title">
                      <h4>{advance.title}</h4>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(advance.status) }}
                      >
                        {getStatusIcon(advance.status)} {getStatusText(advance.status)}
                      </span>
                    </div>
                    <div className="item-amount">
                      NT$ {advance.amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="item-details">
                    <div className="detail-row">
                      <span className="detail-label">申請人:</span>
                      <span>{advance.requester}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">用途:</span>
                      <span>{advance.purpose}</span>
                    </div>
                    {advance.projectName && (
                      <div className="detail-row">
                        <span className="detail-label">專案:</span>
                        <span>{advance.projectName}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">申請日期:</span>
                      <span>{advance.requestedAt}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">截止日期:</span>
                      <span>{advance.dueDate}</span>
                    </div>
                  </div>

                  {advance.status !== 'pending' && (
                    <div className="progress-section">
                      <div className="progress-row">
                        <span>未核銷金額:</span>
                        <span className="outstanding-amount">
                          NT$ {advance.outstandingAmount.toLocaleString()}
                        </span>
                      </div>
                      {advance.outstandingAmount > 0 && (
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${((advance.amount - advance.outstandingAmount) / advance.amount) * 100}%`,
                              backgroundColor: getStatusColor(advance.status)
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )}

                  {advance.documents.length > 0 && (
                    <div className="documents">
                      <span className="documents-label"> 附件:</span>
                      <div className="document-list">
                        {advance.documents.map((doc, index) => (
                          <span key={index} className="document-item">{doc}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {advance.approvalNotes && (
                    <div className="approval-notes">
                      <strong>審核意見:</strong> {advance.approvalNotes}
                    </div>
                  )}

                  <div className="item-actions">
                    <button className="action-btn view"> 檢視</button>
                    <button className="action-btn edit"> 編輯</button>
                    {advance.status === 'disbursed' && (
                      <button className="action-btn reimburse"> 核銷</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 核銷列表 */}
      {activeTab === 'reimbursements' && (
        <div className="content-section">
          <h3> 費用核銷列表</h3>
          {filteredReimbursements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>暫無核銷記錄</h3>
              <p>開始您的第一個費用核銷</p>
              <Button variant="primary">
                ➕ 提交核銷
              </Button>
            </div>
          ) : (
            <div className="items-grid">
              {filteredReimbursements.map((reimbursement) => (
                <div key={reimbursement.id} className="item-card">
                  <div className="item-header">
                    <div className="item-title">
                      <h4>{reimbursement.title}</h4>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(reimbursement.status) }}
                      >
                        {getStatusIcon(reimbursement.status)} {getStatusText(reimbursement.status)}
                      </span>
                    </div>
                    <div className="item-amount">
                      NT$ {reimbursement.amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="item-details">
                    <div className="detail-row">
                      <span className="detail-label">提交日期:</span>
                      <span>{reimbursement.submittedAt}</span>
                    </div>
                    {reimbursement.approvedAt && (
                      <div className="detail-row">
                        <span className="detail-label">審核日期:</span>
                        <span>{reimbursement.approvedAt}</span>
                      </div>
                    )}
                    {reimbursement.processedAt && (
                      <div className="detail-row">
                        <span className="detail-label">處理日期:</span>
                        <span>{reimbursement.processedAt}</span>
                      </div>
                    )}
                  </div>

                  {reimbursement.description && (
                    <div className="description">
                      <strong>說明:</strong> {reimbursement.description}
                    </div>
                  )}

                  {reimbursement.receipts.length > 0 && (
                    <div className="documents">
                      <span className="documents-label"> 收據:</span>
                      <div className="document-list">
                        {reimbursement.receipts.map((receipt, index) => (
                          <span key={index} className="document-item">{receipt}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {reimbursement.approvalNotes && (
                    <div className="approval-notes">
                      <strong>審核意見:</strong> {reimbursement.approvalNotes}
                    </div>
                  )}

                  <div className="item-actions">
                    <button className="action-btn view"> 檢視</button>
                    {reimbursement.status === 'pending' && (
                      <button className="action-btn edit"> 編輯</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 申請模態框 */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3> 申請墊款</h3>
              <button className="close-btn" onClick={() => setShowRequestModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>此功能正在開發中，敬請期待！ </p>
              <p>未來您可以在這裡：</p>
              <ul>
                <li> 提交墊款申請</li>
                <li> 填寫申請用途和金額</li>
                <li> 上傳相關文件</li>
                <li> 追蹤申請狀態</li>
                <li> 進行費用核銷</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .advance-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .header-info h2 {
          margin: 0 0 8px 0;
          color: #3a3833;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .header-info p {
          margin: 0 0 12px 0;
          color: #6d685f;
        }

        .header-stats {
          display: flex;
          gap: 20px;
          font-size: 14px;
          color: #F59E0B;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 24px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 158, 11, 0.15);
          border-radius: 12px;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 12px;
          color: #6d685f;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #3a3833;
        }

        .stat-value.outstanding {
          color: #F59E0B;
        }

        .stat-value.pending {
          color: #EF4444;
        }

        .stat-value.success {
          color: #10B981;
        }

        .main-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 4px;
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .tab-button.active {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: #3a3833;
        }

        .tab-icon {
          font-size: 16px;
        }

        .badge {
          position: absolute;
          top: -4px;
          right: 8px;
          background: #EF4444;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .status-filter {
          margin-bottom: 24px;
        }

        .status-select {
          padding: 8px 12px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          cursor: pointer;
        }

        .content-section h3 {
          margin: 0 0 20px 0;
          color: #3a3833;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .items-grid {
          display: grid;
          gap: 20px;
        }

        .item-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(201, 169, 97, 0.15);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 169, 97, 0.15);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .item-title {
          flex: 1;
        }

        .item-title h4 {
          margin: 0 0 8px 0;
          color: #3a3833;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .item-amount {
          font-size: 1.3rem;
          font-weight: 700;
          color: #3a3833;
        }

        .item-details {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 14px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
        }

        .detail-label {
          color: #6d685f;
          font-weight: 500;
        }

        .progress-section {
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(245, 158, 11, 0.05);
          border-radius: 8px;
        }

        .progress-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .outstanding-amount {
          font-weight: 600;
          color: #F59E0B;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(245, 158, 11, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .documents {
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(201, 169, 97, 0.05);
          border-radius: 8px;
        }

        .documents-label {
          font-size: 12px;
          color: #6d685f;
          font-weight: 500;
          display: block;
          margin-bottom: 8px;
        }

        .document-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .document-item {
          font-size: 11px;
          color: #6d685f;
          background: rgba(255, 255, 255, 0.8);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .description, .approval-notes {
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 8px;
          font-size: 14px;
          color: #3a3833;
        }

        .approval-notes {
          background: rgba(16, 185, 129, 0.05);
        }

        .item-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .action-btn {
          padding: 6px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          background: rgba(255, 255, 255, 0.8);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-1px);
        }

        .action-btn.reimburse {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10B981;
        }

        .empty-state {
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
          color: #3a3833;
        }

        .empty-state p {
          margin: 0 0 20px 0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
        }

        .modal-header h3 {
          margin: 0;
          color: #3a3833;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-body ul {
          margin: 16px 0;
          padding-left: 20px;
        }

        .modal-body li {
          margin-bottom: 8px;
          color: #6d685f;
        }

        @media (max-width: 768px) {
          .advance-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            align-self: stretch;
            justify-content: center;
          }

          .header-stats {
            flex-direction: column;
            gap: 8px;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .main-tabs {
            flex-direction: column;
          }

          .item-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .item-actions {
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}