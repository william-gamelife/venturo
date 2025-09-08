'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Invoice,
  INVOICE_STATUS,
  INVOICE_STATUS_NAMES,
  INVOICE_STATUS_COLORS
} from './models/InvoiceModel';
import { InvoiceApi } from './InvoiceApi';
import { GroupApi } from '../groups/GroupApi';
import { Group } from '../groups/models/GroupModel';

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
      'warning': 'bg-yellow-100 text-yellow-800',
      'info': 'bg-blue-100 text-blue-800',
      'success': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800'
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
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">請款單管理</h1>
        <p className="text-gray-600 mt-1">管理所有成本支出記錄</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">請款單數</div>
          <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">總成本</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCost)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">已付款</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidCost)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">待付款</div>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingCost)}</div>
        </div>
      </div>

      {/* 篩選區 */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          {/* 狀態篩選 */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

          {/* 團號篩選 */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

          {/* 新增按鈕 */}
          <Link
            href="/dashboard/invoices/new"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新增請款單
          </Link>
        </div>
      </div>

      {/* 請款單列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">載入中...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            沒有找到請款單資料
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    請款單號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    團號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    請款日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    總金額
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
                {invoices.map((invoice) => (
                  <tr key={invoice.invoiceNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link
                        href={`/dashboard/groups/${invoice.groupCode}`}
                        className="text-blue-600 hover:text-blue-900 underline"
                      >
                        {invoice.groupCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link
                        href={`/dashboard/orders/${invoice.orderNumber}`}
                        className="text-blue-600 hover:text-blue-900 underline"
                      >
                        {invoice.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(invoiceTotals[invoice.invoiceNumber] || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                        {INVOICE_STATUS_NAMES[invoice.status as keyof typeof INVOICE_STATUS_NAMES]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/invoices/${invoice.invoiceNumber}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          檢視
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.invoiceNumber)}
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
    </div>
  );
}
