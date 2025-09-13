'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import {
  Receipt as ReceiptModel,
  RECEIPT_STATUS,
  RECEIPT_TYPE,
  RECEIPT_STATUS_NAMES,
  RECEIPT_TYPE_NAMES,
  RECEIPT_STATUS_COLORS,
  getReceiptTypeName
} from './models/ReceiptModel'
import { ReceiptApi } from './ReceiptApi'
import { OrderApi } from '../orders/OrderApi'
import { VersionIndicator } from '@/components/VersionIndicator'

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orders, setOrders] = useState<Array<{orderNumber: string; groupCode: string; groupName: string}>>([]);

  // 載入資料
  const loadData = async () => {
    setLoading(true);
    try {
      // 載入訂單列表（用於篩選）
      const ordersData = await OrderApi.getOrdersForSelect();
      setOrders(ordersData);
      
      // 載入收款單
      const params: any = {};
      
      if (statusFilter !== 'all') {
        params.status = [statusFilter];
      }
      
      if (orderFilter !== 'all') {
        params.orderNumber = orderFilter;
      }
      
      params.limit = 200;
      
      const receiptsData = await ReceiptApi.getReceipts(params);
      setReceipts(receiptsData);
    } catch (error) {
      console.error('載入收款單失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, orderFilter]);

  // 刪除收款單
  const handleDelete = async (receiptNumber: string) => {
    if (confirm(`確定要刪除收款單 ${receiptNumber} 嗎？`)) {
      await ReceiptApi.deleteReceipt(receiptNumber);
      loadData();
    }
  };

  // 格式化日期
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-TW');
  };

  // 格式化金額
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 取得狀態標籤樣式
  const getStatusBadgeClass = (status: number) => {
    const colors = {
      'warning': 'badge-warning',
      'info': 'badge-info',
      'success': 'badge-success',
      'error': 'badge-danger'
    };
    return colors[RECEIPT_STATUS_COLORS[status as keyof typeof RECEIPT_STATUS_COLORS] as keyof typeof colors];
  };

  // 計算統計
  const stats = {
    totalAmount: receipts.reduce((sum, r) => sum + r.receiptAmount, 0),
    actualAmount: receipts.filter(r => r.status === RECEIPT_STATUS.COMPLETED)
                         .reduce((sum, r) => sum + r.actualAmount, 0),
    pendingAmount: receipts.filter(r => r.status === RECEIPT_STATUS.PENDING)
                          .reduce((sum, r) => sum + r.receiptAmount, 0),
    count: receipts.length
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.receipts,
        title: "收款單管理",
        subtitle: "管理所有客戶付款記錄",
        actions: (
          <div className="v-stats">
            <div className="v-stat-item">
              <Receipt className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{stats.count}</span>
                <span className="v-stat-label">收款單數</span>
              </div>
            </div>
            <div className="v-stat-item">
              <DollarSign className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{formatCurrency(stats.totalAmount)}</span>
                <span className="v-stat-label">應收總額</span>
              </div>
            </div>
            <div className="v-stat-item">
              <CheckCircle className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{formatCurrency(stats.actualAmount)}</span>
                <span className="v-stat-label">已收金額</span>
              </div>
            </div>
            <div className="v-stat-item">
              <Clock className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{formatCurrency(stats.pendingAmount)}</span>
                <span className="v-stat-label">待收金額</span>
              </div>
            </div>
          </div>
        )
      }}
    >

      {/* 操作區域 */}
      <div className="v-actions">
        <div className="v-filters">
          <div className="v-select-group">
            <Filter className="v-select-icon" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="v-select"
            >
              <option value="all">所有狀態</option>
              {Object.entries(RECEIPT_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {RECEIPT_STATUS_NAMES[value as keyof typeof RECEIPT_STATUS_NAMES]}
                </option>
              ))}
            </select>
          </div>
          <div className="v-select-group">
            <Filter className="v-select-icon" size={16} />
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="v-select"
            >
              <option value="all">所有訂單</option>
              {orders.map(order => (
                <option key={order.orderNumber} value={order.orderNumber}>
                  {order.orderNumber} - {order.groupCode} {order.groupName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="v-action-buttons">
          <Link
            href="/dashboard/receipts/new"
            className="v-button variant-primary"
          >
            <Plus size={16} />
            新增收款單
          </Link>
          <Link
            href="/dashboard/receipts/batch-create"
            className="v-button variant-outline"
          >
            批次建立
          </Link>
        </div>
      </div>

      {/* 收款單列表 */}
      <div className="v-table-container">
        {loading ? (
          <div className="v-empty-state">
            <p className="v-empty-message">載入中...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="v-empty-state">
            <p className="v-empty-message">沒有找到收款單資料</p>
          </div>
        ) : (
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th className="v-th">收款單號</th>
                  <th className="v-th">團號</th>
                  <th className="v-th">團名</th>
                  <th className="v-th">訂單編號</th>
                  <th className="v-th">
                    <Calendar size={14} />
                    收款日期
                  </th>
                  <th className="v-th">
                    <DollarSign size={14} />
                    金額
                  </th>
                  <th className="v-th">收款方式</th>
                  <th className="v-th">狀態</th>
                  <th className="v-th">操作</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.receiptNumber} className="v-tr">
                    <td className="v-td">
                      <strong>{receipt.receiptNumber}</strong>
                    </td>
                    <td className="v-td">
                      {receipt.groupCode ? (
                        <Link
                          href={`/dashboard/groups/${receipt.groupCode}`}
                          className="v-link"
                        >
                          {receipt.groupCode}
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="v-td">
                      {receipt.groupName || '-'}
                    </td>
                    <td className="v-td">
                      <Link
                        href={`/dashboard/receipts/by-order/${receipt.orderNumber}`}
                        className="v-link"
                      >
                        {receipt.orderNumber}
                      </Link>
                    </td>
                    <td className="v-td">
                      {formatDate(receipt.receiptDate)}
                    </td>
                    <td className="v-td">
                      <div>
                        <div className="v-amount">{formatCurrency(receipt.receiptAmount)}</div>
                        {receipt.actualAmount !== receipt.receiptAmount && (
                          <div className="v-amount-sub">
                            實收: {formatCurrency(receipt.actualAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="v-td">
                      {getReceiptTypeName(receipt.receiptType)}
                    </td>
                    <td className="v-td">
                      <span className={`v-badge ${
                        receipt.status === RECEIPT_STATUS.COMPLETED ? 'v-success' :
                        receipt.status === RECEIPT_STATUS.PENDING ? 'v-warning' :
                        'v-info'
                      }`}>
                        {RECEIPT_STATUS_NAMES[receipt.status as keyof typeof RECEIPT_STATUS_NAMES]}
                      </span>
                    </td>
                    <td className="v-td">
                      <div className="v-actions-cell">
                        <Link
                          href={`/dashboard/receipts/${receipt.receiptNumber}`}
                          className="v-action-button"
                          title="檢視"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(receipt.receiptNumber)}
                          className="v-action-button v-danger"
                          title="刪除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        /* Venturo 收款單管理樣式 */
        .v-stats {
          display: flex;
          gap: var(--spacing-lg);
          align-items: center;
        }

        .v-stat-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-md);
          border: 1px solid rgba(212, 196, 160, 0.2);
        }

        .v-stat-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .v-stat-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .v-stat-number {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }

        .v-stat-label {
          font-size: 11px;
          color: #666;
          white-space: nowrap;
        }

        /* 操作區域 */
        .v-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          gap: var(--spacing-md);
        }

        .v-filters {
          display: flex;
          gap: var(--spacing-md);
        }

        .v-select-group {
          position: relative;
          min-width: 180px;
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

        .v-action-buttons {
          display: flex;
          gap: var(--spacing-sm);
        }

        /* 表格樣式 */
        .v-table-container {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid #E5E5E5;
          overflow: hidden;
        }

        .v-empty-state {
          padding: 48px 24px;
          text-align: center;
        }

        .v-empty-message {
          color: #666;
          margin: 0;
        }

        .v-table-wrapper {
          overflow-x: auto;
        }

        .v-table {
          width: 100%;
          border-collapse: collapse;
        }

        .v-th {
          background: linear-gradient(135deg, var(--primary) 0%, var(--sage-green) 100%);
          color: white;
          padding: var(--spacing-md) var(--spacing-lg);
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .v-th svg {
          margin-right: var(--spacing-xs);
          vertical-align: text-top;
        }

        .v-tr {
          transition: all 0.2s ease;
        }

        .v-tr:hover {
          background: rgba(212, 196, 160, 0.05);
        }

        .v-td {
          padding: var(--spacing-md) var(--spacing-lg);
          border-bottom: 1px solid #F0F0F0;
          vertical-align: top;
        }

        .v-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .v-link:hover {
          color: var(--sage-green);
          text-decoration: underline;
        }

        .v-amount {
          font-weight: 600;
          color: #333;
        }

        .v-amount-sub {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
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

        .v-badge.v-info {
          background: #E3F2FD;
          color: #1976D2;
        }

        .v-actions-cell {
          display: flex;
          gap: var(--spacing-xs);
        }

        .v-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(212, 196, 160, 0.1);
          color: var(--primary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .v-action-button:hover {
          background: rgba(212, 196, 160, 0.2);
          transform: translateY(-1px);
        }

        .v-action-button.v-danger {
          background: rgba(244, 67, 54, 0.1);
          color: #F44336;
        }

        .v-action-button.v-danger:hover {
          background: rgba(244, 67, 54, 0.2);
        }

        /* 響應式設計 */
        @media (max-width: 768px) {
          .v-stats {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: stretch;
          }

          .v-stat-item {
            justify-content: space-between;
            padding: var(--spacing-md);
          }

          .v-stat-content {
            align-items: flex-end;
          }

          .v-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .v-filters {
            flex-direction: column;
          }

          .v-action-buttons {
            flex-direction: column;
          }

          .v-th {
            font-size: 12px;
            padding: var(--spacing-sm);
          }

          .v-td {
            padding: var(--spacing-sm);
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .v-th,
          .v-td {
            padding: var(--spacing-xs);
            font-size: 12px;
          }
        }
      `}</style>

      <VersionIndicator
        page="收款單管理"
        authSystem="mixed"
        version="1.0"
        status="error"
      />
    </ModuleLayout>
  );
}
