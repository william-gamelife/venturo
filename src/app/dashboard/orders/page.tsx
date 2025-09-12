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
          <>
            <div className="order-stats">
              <div className="stat-item">
                <span className="stat-number" style={{ fontSize: 24, fontWeight: 700, color: "#c9a961" }}>{stats.totalOrders}</span>
                <span className="stat-label">總訂單數</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" style={{ fontSize: 24, fontWeight: 700, color: "#c9a961" }}>{formatCurrency(stats.totalAmount)}</span>
                <span className="stat-label">總金額</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-success">{formatCurrency(stats.paidAmount)}</span>
                <span className="stat-label">已收款</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-danger">{formatCurrency(stats.unpaidAmount)}</span>
                <span className="stat-label">待收款</span>
              </div>
            </div>
            <Link
              href="/dashboard/orders/new"
              className="btn-primary"
            >
              + 新增訂單
            </Link>
          </>
        )
      }}
    >

      {/* 搜尋和篩選區 */}
      <div className="filter-section" style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: 16, padding: 24, border: "1px solid rgba(201, 169, 97, 0.2)", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", backdropFilter: "blur(10px)", marginBottom: 24 }}>
        <div className="flex flex-wrap gap-4">
          {/* 搜尋框 */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜尋訂單號、聯絡人、電話..."
              className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: 8, fontSize: 14, transition: "all 0.2s ease" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 團號篩選 */}
          <select
            className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: 8, fontSize: 14, transition: "all 0.2s ease" }}
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

          {/* 訂單狀態篩選 */}
          <select
            className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: 8, fontSize: 14, transition: "all 0.2s ease" }}
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

          {/* 付款狀態篩選 */}
          <select
            className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: 8, fontSize: 14, transition: "all 0.2s ease" }}
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
      </div>

      {/* 訂單列表 */}
      <div className="unified-table" style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", border: "1px solid rgba(201, 169, 97, 0.2)" }}>
        {loading ? (
          <div className="p-8 text-center text-gray-500">載入中...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            沒有找到訂單資料
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "linear-gradient(135deg, #c9a961 0%, #b8975a 100%)" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    團號/團名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    聯絡人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    人數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    總金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    付款狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.groupCode}</div>
                        <div className="text-gray-500 text-xs">{order.groupName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{order.contactPerson}</div>
                        <div className="text-gray-500 text-xs">{order.contactPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerCount} 人
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                        {order.remainingAmount > 0 && (
                          <div className="text-red-600 text-xs">
                            待收: {formatCurrency(order.remainingAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.orderStatus)}`}>
                        {ORDER_STATUS_NAMES[order.orderStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadgeClass(order.paymentStatus)}`}>
                        {PAYMENT_STATUS_NAMES[order.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/orders/${order.orderNumber}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          檢視
                        </Link>
                        <Link
                          href={`/dashboard/orders/${order.orderNumber}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          編輯
                        </Link>
                        <button
                          onClick={() => handleDelete(order.orderNumber)}
                          className="text-red-600 hover:text-red-900"
                        >
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
        .order-stats {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        
        .order-stats .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        
        .order-stats .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
        }
        
        .order-stats .stat-label {
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
          .order-stats {
            flex-direction: column;
            gap: 12px;
          }
          
          .order-stats .stat-item {
            flex-direction: row;
            gap: 8px;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}
