'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';
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
} from './models/OrderModel';
import { OrderApi } from './OrderApi';
import { GroupApi } from '../groups/GroupApi';
import { Group } from '../groups/models/GroupModel';

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
      'warning': 'v-badge variant-warning',
      'info': 'v-badge variant-info',
      'primary': 'v-badge variant-primary',
      'success': 'v-badge variant-success',
      'error': 'v-badge variant-danger'
    };
    return colors[ORDER_STATUS_COLORS[status] as keyof typeof colors] || 'v-badge';
  };

  const getPaymentBadgeClass = (status: PaymentStatus) => {
    const colors = {
      'error': 'v-badge variant-danger',
      'warning': 'v-badge variant-warning',
      'info': 'v-badge variant-info',
      'success': 'v-badge variant-success'
    };
    return colors[PAYMENT_STATUS_COLORS[status] as keyof typeof colors] || 'v-badge';
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
          <>
            <div className="v-stats-group">
              <div className="v-stat-item">
                <span className="v-stat-number variant-primary">{stats.totalOrders}</span>
                <span className="v-stat-label">總訂單數</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-number variant-primary">{formatCurrency(stats.totalAmount)}</span>
                <span className="v-stat-label">總金額</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-number variant-success">{formatCurrency(stats.paidAmount)}</span>
                <span className="v-stat-label">已收款</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-number variant-danger">{formatCurrency(stats.unpaidAmount)}</span>
                <span className="v-stat-label">待收款</span>
              </div>
            </div>
            <Link
              href="/dashboard/orders/new"
              className="v-button variant-primary"
            >
              <svg className="v-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              新增訂單
            </Link>
          </>
        )
      }}
    >

      {/* 搜尋和篩選區 - 無額外容器，直接呈現 */}
      <div className="v-filters">
        <input
          type="text"
          placeholder="搜尋訂單號、聯絡人、電話..."
          className="v-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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

        <select
          className="v-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
        >
          <option value="all">所有狀態</option>
          {Object.entries(ORDER_STATUS_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          className="v-select"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
        >
          <option value="all">付款狀態</option>
          {Object.entries(PAYMENT_STATUS_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 訂單列表 - 直接呈現表格，無額外容器 */}
      {loading ? (
        <div className="v-loading">
          <span>載入中...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="v-empty-state">
          <svg className="v-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11H15M9 15H15M5 7H19L18 19H6L5 7Z"/>
          </svg>
          <p>沒有找到訂單資料</p>
        </div>
      ) : (
        <table className="v-table">
          <thead>
            <tr>
              <th>訂單編號</th>
              <th>團號/團名</th>
              <th>聯絡人</th>
              <th>人數</th>
              <th>總金額</th>
              <th>訂單狀態</th>
              <th>付款狀態</th>
              <th>訂單日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderNumber}>
                <td className="v-table-cell-primary">
                  {order.orderNumber}
                </td>
                <td>
                  <div className="v-table-cell-stack">
                    <span className="v-table-cell-main">{order.groupCode}</span>
                    <span className="v-table-cell-sub">{order.groupName}</span>
                  </div>
                </td>
                <td>
                  <div className="v-table-cell-stack">
                    <span>{order.contactPerson}</span>
                    <span className="v-table-cell-sub">{order.contactPhone}</span>
                  </div>
                </td>
                <td>{order.customerCount} 人</td>
                <td>
                  <div className="v-table-cell-stack">
                    <span className="v-table-cell-amount">{formatCurrency(order.totalAmount)}</span>
                    {order.remainingAmount > 0 && (
                      <span className="v-table-cell-sub variant-danger">
                        待收: {formatCurrency(order.remainingAmount)}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={getStatusBadgeClass(order.orderStatus)}>
                    {ORDER_STATUS_NAMES[order.orderStatus]}
                  </span>
                </td>
                <td>
                  <span className={getPaymentBadgeClass(order.paymentStatus)}>
                    {PAYMENT_STATUS_NAMES[order.paymentStatus]}
                  </span>
                </td>
                <td>{formatDate(order.orderDate)}</td>
                <td>
                  <div className="v-table-actions">
                    <Link
                      href={`/dashboard/orders/${order.orderNumber}`}
                      className="v-link variant-primary"
                    >
                      檢視
                    </Link>
                    <Link
                      href={`/dashboard/orders/${order.orderNumber}/edit`}
                      className="v-link variant-success"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleDelete(order.orderNumber)}
                      className="v-link variant-danger"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ModuleLayout>
  );
}
