'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Order, 
  OrderStatus, 
  OrderType,
  PaymentStatus,
  ORDER_STATUS_NAMES,
  ORDER_TYPE_NAMES,
  PAYMENT_STATUS_NAMES,
  createDefaultOrder,
  calculateRemainingAmount,
  updatePaymentStatus
} from '../models/OrderModel';
import { OrderApi } from '../OrderApi';
import { GroupApi } from '../../groups/GroupApi';
import { Group } from '../../groups/models/GroupModel';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const isNew = orderNumber === 'new';
  
  const [order, setOrder] = useState<Order>(createDefaultOrder());
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 載入資料
  useEffect(() => {
    loadGroups();
    if (!isNew) {
      loadOrder();
    }
  }, [orderNumber]);

  const loadGroups = async () => {
    try {
      const data = await GroupApi.getGroups({ excludeCompletedGroups: true });
      setGroups(data);
    } catch (error) {
      console.error('載入團體失敗:', error);
    }
  };

  const loadOrder = async () => {
    try {
      const data = await OrderApi.getOrder(orderNumber);
      if (data) {
        setOrder(data);
      } else {
        alert('找不到訂單資料');
        router.push('/dashboard/orders');
      }
    } catch (error) {
      console.error('載入訂單失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 儲存訂單
  const handleSave = async () => {
    // 驗證必填欄位
    if (!order.groupCode) {
      alert('請選擇團號');
      return;
    }
    if (!order.contactPerson || !order.contactPhone) {
      alert('請填寫聯絡人資訊');
      return;
    }
    if (order.totalAmount <= 0) {
      alert('請輸入總金額');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const newOrder = await OrderApi.createOrder(order);
        alert(`訂單建立成功！訂單編號：${newOrder.orderNumber}`);
        router.push(`/dashboard/orders/${newOrder.orderNumber}`);
      } else {
        await OrderApi.updateOrder(orderNumber, order);
        alert('訂單更新成功！');
        loadOrder();
      }
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  // 更新欄位
  const updateField = (field: keyof Order, value: any) => {
    const updatedOrder = {
      ...order,
      [field]: value
    };

    // 如果更新團號，同時更新團名
    if (field === 'groupCode') {
      const group = groups.find(g => g.groupCode === value);
      if (group) {
        updatedOrder.groupName = group.groupName;
      }
    }

    // 如果更新金額相關欄位，重新計算
    if (['totalAmount', 'paidAmount', 'depositAmount'].includes(field)) {
      updatedOrder.remainingAmount = calculateRemainingAmount(updatedOrder);
      updatedOrder.paymentStatus = updatePaymentStatus(updatedOrder);
    }

    setOrder(updatedOrder);
  };

  // 格式化日期為 input 可接受的格式
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // 格式化金額
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">載入中...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? '新增訂單' : `訂單詳情 - ${order.orderNumber}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNew ? '建立新的訂單' : `${order.contactPerson} - ${order.groupName}`}
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← 返回列表
        </Link>
      </div>

      {/* 頁籤 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'basic'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              基本資料
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'payment'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              付款資訊
            </button>
            {!isNew && (
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                歷史記錄
              </button>
            )}
          </nav>
        </div>

        {/* 基本資料頁籤 */}
        {activeTab === 'basic' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 訂單編號 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  訂單編號
                </label>
                <input
                  type="text"
                  value={order.orderNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="系統自動產生"
                />
              </div>

              {/* 團號 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  團號 <span className="text-red-500">*</span>
                </label>
                <select
                  value={order.groupCode}
                  onChange={(e) => updateField('groupCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">請選擇團號</option>
                  {groups.map(group => (
                    <option key={group.groupCode} value={group.groupCode}>
                      {group.groupCode} - {group.groupName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 聯絡人 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={order.contactPerson}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入聯絡人姓名"
                  required
                />
              </div>

              {/* 聯絡電話 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={order.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入聯絡電話"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={order.contactEmail || ''}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入 Email"
                />
              </div>

              {/* 人數 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  人數 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={order.customerCount}
                  onChange={(e) => updateField('customerCount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              {/* 訂單類型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  訂單類型
                </label>
                <select
                  value={order.orderType}
                  onChange={(e) => updateField('orderType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(ORDER_TYPE_NAMES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 訂單狀態 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  訂單狀態
                </label>
                <select
                  value={order.orderStatus}
                  onChange={(e) => updateField('orderStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(ORDER_STATUS_NAMES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 訂單日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  訂單日期
                </label>
                <input
                  type="date"
                  value={formatDateForInput(order.orderDate)}
                  onChange={(e) => updateField('orderDate', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 業務員 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  業務員
                </label>
                <input
                  type="text"
                  value={order.salesPerson || ''}
                  onChange={(e) => updateField('salesPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入業務員姓名"
                />
              </div>

              {/* 備註 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註
                </label>
                <textarea
                  value={order.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="請輸入備註"
                />
              </div>

              {/* 特殊需求 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  特殊需求
                </label>
                <textarea
                  value={order.specialRequests || ''}
                  onChange={(e) => updateField('specialRequests', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="請輸入特殊需求"
                />
              </div>
            </div>

            {/* Venturo 特色：經驗值設定 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                🎮 Venturo 遊戲化設定
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-blue-700 mb-1">
                    完成獎勵經驗值
                  </label>
                  <input
                    type="number"
                    value={order.expReward || 50}
                    onChange={(e) => updateField('expReward', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white"
                    min="0"
                    step="10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-blue-700 mb-1">
                    緊急程度
                  </label>
                  <select
                    value={order.urgencyLevel || 'medium'}
                    onChange={(e) => updateField('urgencyLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 付款資訊頁籤 */}
        {activeTab === 'payment' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 總金額 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  總金額 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={order.totalAmount}
                  onChange={(e) => updateField('totalAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              {/* 訂金 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  訂金
                </label>
                <input
                  type="number"
                  value={order.depositAmount}
                  onChange={(e) => updateField('depositAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              {/* 已付金額 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  已付金額
                </label>
                <input
                  type="number"
                  value={order.paidAmount}
                  onChange={(e) => updateField('paidAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max={order.totalAmount}
                />
              </div>

              {/* 剩餘金額 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  剩餘金額
                </label>
                <input
                  type="text"
                  value={formatCurrency(order.remainingAmount)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              {/* 付款狀態 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付款狀態
                </label>
                <input
                  type="text"
                  value={PAYMENT_STATUS_NAMES[order.paymentStatus]}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              {/* 付款方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付款方式
                </label>
                <select
                  value={order.paymentMethod || ''}
                  onChange={(e) => updateField('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">請選擇</option>
                  <option value="cash">現金</option>
                  <option value="transfer">轉帳</option>
                  <option value="credit">信用卡</option>
                  <option value="check">支票</option>
                </select>
              </div>
            </div>

            {/* 付款摘要 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">付款摘要</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">總金額</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">已付金額</span>
                  <span className="font-medium text-green-600">{formatCurrency(order.paidAmount)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-900 font-medium">剩餘金額</span>
                  <span className="font-bold text-red-600">{formatCurrency(order.remainingAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 歷史記錄頁籤 */}
        {activeTab === 'history' && !isNew && (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              歷史記錄功能開發中...
            </div>
          </div>
        )}
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-end gap-4">
        <Link
          href="/dashboard/orders"
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          取消
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '儲存中...' : (isNew ? '建立訂單' : '儲存變更')}
        </button>
      </div>
    </div>
  );
}
