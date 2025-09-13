'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';
import {
  Invoice,
  INVOICE_STATUS,
  INVOICE_STATUS_NAMES,
  INVOICE_STATUS_COLORS
} from './models/InvoiceModel';
import { InvoiceApi } from './InvoiceApi';
import { GroupApi } from '../groups/GroupApi';
import { Group } from '../groups/models/GroupModel';
import {
  Receipt,
  Plus,
  Filter,
  Eye,
  Trash2,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceTotals, setInvoiceTotals] = useState<Record<string, number>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // 載入資料
  const loadData = async () => {
    setLoading(true);
    try {
      // 載入團體列表（用於篩選）
      const groupsData = await GroupApi.getGroups();
      setGroups(groupsData);
      
      // 載入請款單
      const params: any = {};
      
      if (statusFilter !== 'all') {
        params.status = [statusFilter];
      }
      
      if (groupFilter !== 'all') {
        params.groupCode = groupFilter;
      }
      
      const invoicesData = await InvoiceApi.getInvoices(params);
      setInvoices(invoicesData);
      
      // 載入每張請款單的總金額
      const totals: Record<string, number> = {};
      for (const invoice of invoicesData) {
        totals[invoice.invoiceNumber] = await InvoiceApi.getInvoiceTotal(invoice.invoiceNumber);
      }
      setInvoiceTotals(totals);
    } catch (error) {
      console.error('載入請款單失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, groupFilter]);

  // 刪除請款單
  const handleDelete = async (invoiceNumber: string) => {
    if (confirm(`確定要刪除請款單 ${invoiceNumber} 嗎？這將同時刪除所有相關項目。`)) {
      await InvoiceApi.deleteInvoice(invoiceNumber);
      loadData();
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
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
    return colors[INVOICE_STATUS_COLORS[status as keyof typeof INVOICE_STATUS_COLORS] as keyof typeof colors];
  };

  // 計算統計
  const stats = {
    totalCost: Object.values(invoiceTotals).reduce((sum, amount) => sum + amount, 0),
    paidCost: invoices.filter(i => i.status === INVOICE_STATUS.PAID)
                     .reduce((sum, i) => sum + (invoiceTotals[i.invoiceNumber] || 0), 0),
    pendingCost: invoices.filter(i => i.status === INVOICE_STATUS.PENDING)
                        .reduce((sum, i) => sum + (invoiceTotals[i.invoiceNumber] || 0), 0),
    count: invoices.length
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.invoices || Icons.finance,
        title: "請款單管理",
        subtitle: "管理所有成本支出記錄",
        actions: (
          <>
            <div className="v-stats">
              <div className="v-stat-item">
                <Receipt className="v-stat-icon" size={16} />
                <div className="v-stat-content">
                  <span className="v-stat-number">{stats.count}</span>
                  <span className="v-stat-label">請款單數</span>
                </div>
              </div>
              <div className="v-stat-item">
                <TrendingUp className="v-stat-icon" size={16} />
                <div className="v-stat-content">
                  <span className="v-stat-number">{formatCurrency(stats.totalCost)}</span>
                  <span className="v-stat-label">總成本</span>
                </div>
              </div>
              <div className="v-stat-item">
                <CheckCircle className="v-stat-icon" size={16} />
                <div className="v-stat-content">
                  <span className="v-stat-number v-success">{formatCurrency(stats.paidCost)}</span>
                  <span className="v-stat-label">已付款</span>
                </div>
              </div>
              <div className="v-stat-item">
                <Clock className="v-stat-icon" size={16} />
                <div className="v-stat-content">
                  <span className="v-stat-number v-warning">{formatCurrency(stats.pendingCost)}</span>
                  <span className="v-stat-label">待付款</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/invoices/new"
              className="v-button variant-primary"
            >
              <Plus size={16} />
              新增請款單
            </Link>
          </>
        )
      }}
    >

      {/* 篩選區 */}
      <div className="v-filters">
        <div className="v-filter-group">
          <div className="v-select-group">
            <Filter className="v-select-icon" size={16} />
            <select
              className="v-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">所有狀態</option>
              {Object.entries(INVOICE_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {INVOICE_STATUS_NAMES[value as keyof typeof INVOICE_STATUS_NAMES]}
                </option>
              ))}
            </select>
          </div>

          <div className="v-select-group">
            <Receipt className="v-select-icon" size={16} />
            <select
              className="v-select"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">所有團體</option>
              {groups.map(group => (
                <option key={group.groupCode} value={group.groupCode}>
                  {group.groupCode} - {group.groupName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 請款單列表 */}
      <div className="v-table-container">
        {loading ? (
          <div className="v-loading">
            <Receipt className="v-loading-icon" size={32} />
            <p>載入中...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="v-empty-state">
            <Receipt className="v-empty-icon" size={48} />
            <h3 className="v-empty-title">沒有找到請款單資料</h3>
            <p className="v-empty-message">開始建立您的第一張請款單</p>
          </div>
        ) : (
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead className="v-table-header">
                <tr>
                  <th className="v-th">
                    <Receipt size={14} />
                    請款單號
                  </th>
                  <th className="v-th">
                    團號
                  </th>
                  <th className="v-th">
                    訂單編號
                  </th>
                  <th className="v-th">
                    <Calendar size={14} />
                    請款日期
                  </th>
                  <th className="v-th">
                    <DollarSign size={14} />
                    總金額
                  </th>
                  <th className="v-th">
                    狀態
                  </th>
                  <th className="v-th">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="v-table-body">
                {invoices.map((invoice) => (
                  <tr key={invoice.invoiceNumber} className="v-tr">
                    <td className="v-td v-td-primary">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="v-td">
                      <Link
                        href={`/dashboard/groups/${invoice.groupCode}`}
                        className="v-link"
                      >
                        {invoice.groupCode}
                      </Link>
                    </td>
                    <td className="v-td">
                      <Link
                        href={`/dashboard/orders/${invoice.orderNumber}`}
                        className="v-link"
                      >
                        {invoice.orderNumber}
                      </Link>
                    </td>
                    <td className="v-td v-td-muted">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="v-td v-td-amount">
                      {formatCurrency(invoiceTotals[invoice.invoiceNumber] || 0)}
                    </td>
                    <td className="v-td">
                      <span className={`v-badge ${
                        invoice.status === INVOICE_STATUS.PAID ? 'v-success' :
                        invoice.status === INVOICE_STATUS.PENDING ? 'v-warning' :
                        'v-info'
                      }`}>
                        {INVOICE_STATUS_NAMES[invoice.status as keyof typeof INVOICE_STATUS_NAMES]}
                      </span>
                    </td>
                    <td className="v-td">
                      <div className="v-actions">
                        <Link
                          href={`/dashboard/invoices/${invoice.invoiceNumber}`}
                          className="v-button variant-secondary size-sm"
                        >
                          <Eye size={12} />
                          檢視
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.invoiceNumber)}
                          className="v-button variant-danger size-sm"
                        >
                          <Trash2 size={12} />
                          刪除
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
        /* Venturo 發票管理樣式 */
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
          color: var(--primary);
          line-height: 1;
        }

        .v-stat-number.v-success {
          color: var(--sage-green);
        }

        .v-stat-number.v-warning {
          color: var(--fog-blue);
        }

        .v-stat-label {
          font-size: 11px;
          color: #666;
          white-space: nowrap;
        }

        /* 篩選區域 */
        .v-filters {
          margin-bottom: var(--spacing-lg);
        }

        .v-filter-group {
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

        /* 表格容器 */
        .v-table-container {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid #E5E5E5;
          overflow: hidden;
        }

        .v-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #666;
          gap: var(--spacing-md);
        }

        .v-loading-icon {
          color: var(--primary);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .v-empty-state {
          text-align: center;
          padding: 60px 20px;
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

        /* 表格樣式 */
        .v-table-wrapper {
          overflow-x: auto;
        }

        .v-table {
          width: 100%;
          border-collapse: collapse;
        }

        .v-table-header {
          background: var(--primary);
        }

        .v-th {
          padding: var(--spacing-md) var(--spacing-lg);
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .v-th svg {
          margin-right: var(--spacing-xs);
          vertical-align: middle;
        }

        .v-table-body {
          background: white;
        }

        .v-tr {
          border-bottom: 1px solid #F0F0F0;
          transition: background-color 0.2s ease;
        }

        .v-tr:hover {
          background: #FAFAFA;
        }

        .v-td {
          padding: var(--spacing-md) var(--spacing-lg);
          font-size: 14px;
          color: #333;
          white-space: nowrap;
        }

        .v-td-primary {
          font-weight: 600;
          color: var(--primary);
        }

        .v-td-muted {
          color: #666;
        }

        .v-td-amount {
          font-weight: 600;
          color: var(--primary);
        }

        .v-link {
          color: var(--primary);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .v-link:hover {
          color: var(--sage-green);
          text-decoration: underline;
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

        .v-actions {
          display: flex;
          gap: var(--spacing-xs);
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

          .v-filter-group {
            flex-direction: column;
          }

          .v-select-group {
            min-width: auto;
          }

          .v-table-wrapper {
            font-size: 12px;
          }

          .v-th,
          .v-td {
            padding: var(--spacing-sm);
          }

          .v-actions {
            flex-direction: column;
            gap: 2px;
          }
        }

        @media (max-width: 480px) {
          .v-th,
          .v-td {
            padding: var(--spacing-xs) var(--spacing-sm);
          }

          .v-actions {
            flex-direction: row;
            gap: var(--spacing-xs);
          }
        }
      `}</style>
    </ModuleLayout>
  );
}
