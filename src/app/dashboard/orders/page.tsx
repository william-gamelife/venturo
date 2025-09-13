'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'
import {
  FileText,
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import {
  Order,
  OrderStatus,
  OrderType,
  PaymentStatus,
  ORDER_STATUS_NAMES,
  ORDER_TYPE_NAMES,
  PAYMENT_STATUS_NAMES,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS
} from './models/OrderModel'
import { OrderApi } from './OrderApi'
import { GroupApi } from '../groups/GroupApi'
import { Group } from '../groups/models/GroupModel'
import { VersionIndicator } from '@/components/VersionIndicator'

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');

  // 處理 URL 參數
  useEffect(() => {
    const groupCode = searchParams.get('groupCode');
    if (groupCode) {
      setGroupFilter(groupCode);
    }
  }, [searchParams]);

  // 載入資料
  const loadData = async () => {
    setLoading(true);
    try {
      // 載入團體列表（用於篩選）
      const groupsData = await GroupApi.getGroups();
      setGroups(groupsData);
      
      // 載入訂單
      const params: any = {};
      
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }
      
      if (groupFilter !== 'all') {
        params.groupCode = groupFilter;
      }
      
      if (statusFilter !== 'all') {
        params.orderStatus = statusFilter;
      }
      
      if (paymentFilter !== 'all') {
        params.paymentStatus = paymentFilter;
      }
      
      const ordersData = await OrderApi.getOrders(params);
      setOrders(ordersData);
    } catch (error) {
      console.error('載入訂單失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, groupFilter, statusFilter, paymentFilter]);

  // 刪除訂單
  const handleDelete = async (orderNumber: string) => {
    if (confirm(`確定要刪除訂單 ${orderNumber} 嗎？`)) {
      await OrderApi.deleteOrder(orderNumber);
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
  const getStatusBadgeClass = (status: OrderStatus) => {
    const colors = {
      'warning': 'badge-warning',
      'info': 'badge-info',
      'primary': 'badge-primary',
      'success': 'badge-success',
      'error': 'badge-danger'
    };
    return colors[ORDER_STATUS_COLORS[status] as keyof typeof colors];
  };

  const getPaymentBadgeClass = (status: PaymentStatus) => {
    const colors = {
      'error': 'badge-danger',
      'warning': 'badge-warning',
      'info': 'badge-info',
      'success': 'badge-success'
    };
    return colors[PAYMENT_STATUS_COLORS[status] as keyof typeof colors];
  };

  // 計算統計資料
  const stats = {
    totalOrders: orders.length,
    totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    paidAmount: orders.reduce((sum, o) => sum + o.paidAmount, 0),
    unpaidAmount: orders.reduce((sum, o) => sum + o.remainingAmount, 0)
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.orders,
        title: "訂單管理",
        subtitle: "管理所有訂單資訊與付款狀態",
        actions: (
          <div className="v-stats">
            <div className="v-stat-item">
              <FileText className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{stats.totalOrders}</span>
                <span className="v-stat-label">總訂單數</span>
              </div>
            </div>
            <div className="v-stat-item">
              <DollarSign className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{formatCurrency(stats.totalAmount)}</span>
                <span className="v-stat-label">總金額</span>
              </div>
            </div>
            <div className="v-stat-item">
              <CheckCircle className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{formatCurrency(stats.paidAmount)}</span>
                <span className="v-stat-label">已收款</span>
              </div>
            </div>
            <div className="v-stat-item">
              <Clock className="v-stat-icon" size={16} />
              <div className="v-stat-content">
                <span className="v-stat-number">{formatCurrency(stats.unpaidAmount)}</span>
                <span className="v-stat-label">待收款</span>
              </div>
            </div>
          </div>
        )
      }}
    >

      {/* 操作區域 */}
      <div className="v-actions">
        <div className="v-search-group">
          <div className="v-input-group">
            <Search className="v-input-icon" size={16} />
            <input
              type="text"
              placeholder="搜尋訂單號、聯絡人、電話..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="v-input"
            />
          </div>
        </div>
        <div className="v-filters">
          <div className="v-select-group">
            <Filter className="v-select-icon" size={16} />
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="v-select"
            >
              <option value="all">所有團體</option>
              {groups.map(group => (
                <option key={group.groupCode} value={group.groupCode}>
                  {group.groupCode} - {group.groupName}
                </option>
              ))}
            </select>
          </div>
          <div className="v-select-group">
            <Filter className="v-select-icon" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="v-select"
            >
              <option value="all">所有狀態</option>
              {Object.entries(ORDER_STATUS_NAMES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="v-select-group">
            <Filter className="v-select-icon" size={16} />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
              className="v-select"
            >
              <option value="all">付款狀態</option>
              {Object.entries(PAYMENT_STATUS_NAMES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="v-action-buttons">
          <Link
            href="/dashboard/orders/new"
            className="v-button variant-primary"
          >
            <Plus size={16} />
            新增訂單
          </Link>
        </div>
      </div>

      {/* 訂單列表 */}
      <div className="v-table-container">
        {loading ? (
          <div className="v-empty-state">
            <p className="v-empty-message">載入中...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="v-empty-state">
            <p className="v-empty-message">沒有找到訂單資料</p>
          </div>
        ) : (
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th className="v-th">訂單編號</th>
                  <th className="v-th">
                    <Users size={14} />
                    團號/團名
                  </th>
                  <th className="v-th">聯絡人</th>
                  <th className="v-th">人數</th>
                  <th className="v-th">
                    <DollarSign size={14} />
                    總金額
                  </th>
                  <th className="v-th">訂單狀態</th>
                  <th className="v-th">付款狀態</th>
                  <th className="v-th">
                    <Calendar size={14} />
                    訂單日期
                  </th>
                  <th className="v-th">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderNumber} className="v-tr">
                    <td className="v-td">
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td className="v-td">
                      <div className="v-group-info">
                        <div className="v-group-code">{order.groupCode}</div>
                        <div className="v-group-name">{order.groupName}</div>
                      </div>
                    </td>
                    <td className="v-td">
                      <div className="v-contact-info">
                        <div className="v-contact-name">{order.contactPerson}</div>
                        <div className="v-contact-phone">{order.contactPhone}</div>
                      </div>
                    </td>
                    <td className="v-td">
                      {order.customerCount} 人
                    </td>
                    <td className="v-td">
                      <div className="v-amount-info">
                        <div className="v-amount">{formatCurrency(order.totalAmount)}</div>
                        {order.remainingAmount > 0 && (
                          <div className="v-amount-remaining">
                            待收: {formatCurrency(order.remainingAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="v-td">
                      <span className={`v-badge ${
                        order.orderStatus === 'confirmed' ? 'v-success' :
                        order.orderStatus === 'pending' ? 'v-warning' :
                        order.orderStatus === 'cancelled' ? 'v-danger' : 'v-info'
                      }`}>
                        {ORDER_STATUS_NAMES[order.orderStatus]}
                      </span>
                    </td>
                    <td className="v-td">
                      <span className={`v-badge ${
                        order.paymentStatus === 'paid' ? 'v-success' :
                        order.paymentStatus === 'partial' ? 'v-warning' :
                        order.paymentStatus === 'unpaid' ? 'v-danger' : 'v-info'
                      }`}>
                        {PAYMENT_STATUS_NAMES[order.paymentStatus]}
                      </span>
                    </td>
                    <td className="v-td">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="v-td">
                      <div className="v-actions-cell">
                        <Link
                          href={`/dashboard/orders/${order.orderNumber}`}
                          className="v-action-button"
                          title="檢視"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/dashboard/orders/${order.orderNumber}/edit`}
                          className="v-action-button"
                          title="編輯"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(order.orderNumber)}
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
        /* Venturo 訂單管理樣式 */
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
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          flex-wrap: wrap;
        }

        .v-search-group {
          display: flex;
          gap: var(--spacing-md);
          flex: 1;
          min-width: 280px;
        }

        .v-input-group {
          position: relative;
          flex: 1;
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
          transition: all 0.2s ease;
        }

        .v-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(212, 196, 160, 0.1);
        }

        .v-filters {
          display: flex;
          gap: var(--spacing-md);
        }

        .v-select-group {
          position: relative;
          min-width: 160px;
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

        /* 表格容器 */
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
          background: #F8F9FA;
          padding: var(--spacing-md);
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #333;
          border-bottom: 1px solid #E5E5E5;
          white-space: nowrap;
        }

        .v-th svg {
          margin-right: 4px;
          vertical-align: middle;
        }

        .v-tr {
          transition: background-color 0.2s ease;
        }

        .v-tr:hover {
          background: #F8F9FA;
        }

        .v-td {
          padding: var(--spacing-md);
          border-bottom: 1px solid #F0F0F0;
          vertical-align: top;
        }

        .v-group-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .v-group-code {
          font-weight: 600;
          color: var(--primary);
          font-size: 14px;
        }

        .v-group-name {
          color: #666;
          font-size: 13px;
        }

        .v-contact-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .v-contact-name {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .v-contact-phone {
          color: #666;
          font-size: 13px;
        }

        .v-amount-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .v-amount {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .v-amount-remaining {
          color: #F57C00;
          font-size: 12px;
        }

        .v-badge {
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
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
          color: #C62828;
        }

        .v-badge.v-info {
          background: #E3F2FD;
          color: #1976D2;
        }

        .v-actions-cell {
          display: flex;
          gap: var(--spacing-xs);
          align-items: center;
        }

        .v-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: 1px solid #E5E5E5;
          background: white;
          color: #666;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
        }

        .v-action-button:hover {
          background: #F8F9FA;
          color: var(--primary);
          border-color: var(--primary);
        }

        .v-action-button.v-danger:hover {
          background: #FFEBEE;
          color: #C62828;
          border-color: #C62828;
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
            gap: var(--spacing-md);
          }

          .v-search-group {
            min-width: unset;
          }

          .v-filters {
            flex-direction: column;
          }

          .v-select-group {
            min-width: unset;
          }

          .v-table-wrapper {
            font-size: 14px;
          }

          .v-th,
          .v-td {
            padding: var(--spacing-sm);
          }

          .v-actions-cell {
            flex-direction: column;
            gap: var(--spacing-xs);
          }
        }

        @media (max-width: 480px) {
          .v-stat-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .v-stat-content {
            align-items: center;
          }

          .v-table-wrapper {
            font-size: 12px;
          }

          .v-th,
          .v-td {
            padding: 8px;
          }

          .v-group-info,
          .v-contact-info,
          .v-amount-info {
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}
