'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';
import { 
  Receipt,
  RECEIPT_STATUS,
  RECEIPT_TYPE,
  RECEIPT_STATUS_NAMES,
  RECEIPT_TYPE_NAMES,
  RECEIPT_STATUS_COLORS,
  getReceiptTypeName
} from './models/ReceiptModel';
import { ReceiptApi } from './ReceiptApi';
import { OrderApi } from '../orders/OrderApi';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
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
          <>
            <div className="receipt-stats">
              <div className="stat-item">
                <span className="stat-number" style={{ fontSize: 24, fontWeight: 700, color: "#c9a961" }}>{stats.count}</span>
                <span className="stat-label">收款單數</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" style={{ fontSize: 24, fontWeight: 700, color: "#c9a961" }}>{formatCurrency(stats.totalAmount)}</span>
                <span className="stat-label">應收總額</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-success">{formatCurrency(stats.actualAmount)}</span>
                <span className="stat-label">已收金額</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-warning">{formatCurrency(stats.pendingAmount)}</span>
                <span className="stat-label">待收金額</span>
              </div>
            </div>
            <div className="action-buttons">
              <Link
                href="/dashboard/receipts/new"
                className="btn-primary"
              >
                + 新增收款單
              </Link>
              <Link
                href="/dashboard/receipts/batch-create"
                className="btn-primary"
              >
                批次建立
              </Link>
            </div>
          </>
        )
      }}
    >

      {/* 篩選區 */}
      <div className="filter-section" style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: 16, padding: 24, border: "1px solid rgba(201, 169, 97, 0.2)", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", backdropFilter: "blur(10px)", marginBottom: 24 }}>
        <div className="flex flex-wrap gap-4">
          {/* 狀態篩選 */}
          <select
            className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: 8, fontSize: 14, transition: "all 0.2s ease" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">所有狀態</option>
            {Object.entries(RECEIPT_STATUS).map(([key, value]) => (
              <option key={key} value={value}>
                {RECEIPT_STATUS_NAMES[value as keyof typeof RECEIPT_STATUS_NAMES]}
              </option>
            ))}
          </select>

          {/* 訂單篩選 */}
          <select
            className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: 8, fontSize: 14, transition: "all 0.2s ease" }}
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
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

      {/* 收款單列表 */}
      <div className="unified-table" style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", border: "1px solid rgba(201, 169, 97, 0.2)" }}>
        {loading ? (
          <div className="p-8 text-center text-gray-500">載入中...</div>
        ) : receipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            沒有找到收款單資料
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "linear-gradient(135deg, #c9a961 0%, #b8975a 100%)" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    收款單號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    團號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    團名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    收款日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    收款方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.receiptNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {receipt.receiptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.groupCode ? (
                        <Link
                          href={`/dashboard/groups/${receipt.groupCode}`}
                          className="text-blue-600 hover:text-blue-900 underline"
                        >
                          {receipt.groupCode}
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.groupName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link
                        href={`/dashboard/receipts/by-order/${receipt.orderNumber}`}
                        className="text-blue-600 hover:text-blue-900 underline"
                      >
                        {receipt.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(receipt.receiptDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatCurrency(receipt.receiptAmount)}</div>
                        {receipt.actualAmount !== receipt.receiptAmount && (
                          <div className="text-xs text-gray-500">
                            實收: {formatCurrency(receipt.actualAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getReceiptTypeName(receipt.receiptType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(receipt.status)}`}>
                        {RECEIPT_STATUS_NAMES[receipt.status as keyof typeof RECEIPT_STATUS_NAMES]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/receipts/${receipt.receiptNumber}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          檢視
                        </Link>
                        <button
                          onClick={() => handleDelete(receipt.receiptNumber)}
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
        .receipt-stats {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        
        .receipt-stats .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        
        .receipt-stats .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
        }
        
        .receipt-stats .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          white-space: nowrap;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
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
          .receipt-stats {
            flex-direction: column;
            gap: 12px;
          }
          
          .receipt-stats .stat-item {
            flex-direction: row;
            gap: 8px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}
