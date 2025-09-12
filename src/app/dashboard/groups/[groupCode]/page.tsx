'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Group, GroupStatus, GROUP_STATUS_NAMES, createDefaultGroup } from '../models/GroupModel';
import { GroupApi } from '../GroupApi';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupCode = params.groupCode as string;
  const isNew = groupCode === 'new';
  
  const [group, setGroup] = useState<Group>(createDefaultGroup());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 載入團體資料
  useEffect(() => {
    if (!isNew) {
      loadGroup();
    }
  }, [groupCode]);

  const loadGroup = async () => {
    try {
      const data = await GroupApi.getGroup(groupCode);
      if (data) {
        setGroup(data);
      } else {
        alert('找不到團體資料');
        router.push('/dashboard/groups');
      }
    } catch (error) {
      console.error('載入團體失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 儲存團體
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const newGroup = await GroupApi.createGroup(group);
        alert(`團體建立成功！團號：${newGroup.groupCode}`);
        router.push(`/dashboard/groups/${newGroup.groupCode}`);
      } else {
        await GroupApi.updateGroup(groupCode, group);
        alert('團體更新成功！');
        loadGroup();
      }
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  // 更新欄位
  const updateField = (field: keyof Group, value: any) => {
    setGroup(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 格式化日期為 input 可接受的格式
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
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
            {isNew ? '新增團體' : `團體詳情 - ${group.groupCode}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNew ? '建立新的旅遊團體' : group.groupName}
          </p>
        </div>
        <Link
          href="/dashboard/groups"
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
            {!isNew && (
              <>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'orders'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  訂單管理
                </button>
                <button
                  onClick={() => setActiveTab('travellers')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'travellers'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  旅客名單
                </button>
                <button
                  onClick={() => setActiveTab('finance')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'finance'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  財務資訊
                </button>
              </>
            )}
          </nav>
        </div>

        {/* 基本資料頁籤 */}
        {activeTab === 'basic' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 團號 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  團號
                </label>
                <input
                  type="text"
                  value={group.groupCode}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="系統自動產生"
                />
              </div>

              {/* 團名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  團名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={group.groupName}
                  onChange={(e) => updateField('groupName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入團名"
                  required
                />
              </div>

              {/* 出發日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出發日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formatDateForInput(group.departureDate)}
                  onChange={(e) => updateField('departureDate', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 回程日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  回程日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formatDateForInput(group.returnDate)}
                  onChange={(e) => updateField('returnDate', new Date(e.target.value))}
                  min={formatDateForInput(group.departureDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 狀態 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  狀態
                </label>
                <select
                  value={group.status}
                  onChange={(e) => updateField('status', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(GROUP_STATUS_NAMES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 業務員 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  業務員
                </label>
                <input
                  type="text"
                  value={group.salesPerson || ''}
                  onChange={(e) => updateField('salesPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入業務員姓名"
                />
              </div>

              {/* OP員 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OP員
                </label>
                <input
                  type="text"
                  value={group.opId || ''}
                  onChange={(e) => updateField('opId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入OP員代號"
                />
              </div>

              {/* 人數 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  預計人數
                </label>
                <input
                  type="number"
                  value={group.customerCount || 0}
                  onChange={(e) => updateField('customerCount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
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
                    value={group.expReward || 100}
                    onChange={(e) => updateField('expReward', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white"
                    min="0"
                    step="10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-blue-700 mb-1">
                    相關成就
                  </label>
                  <input
                    type="text"
                    value={group.achievement || ''}
                    onChange={(e) => updateField('achievement', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white"
                    placeholder="例如：日本達人、首團成功"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 訂單管理頁籤 */}
        {activeTab === 'orders' && !isNew && (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              訂單管理功能開發中...
            </div>
          </div>
        )}

        {/* 旅客名單頁籤 */}
        {activeTab === 'travellers' && !isNew && (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              旅客名單功能開發中...
            </div>
          </div>
        )}

        {/* 財務資訊頁籤 */}
        {activeTab === 'finance' && !isNew && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分公司獎金比例 (%)
                </label>
                <input
                  type="number"
                  value={group.branchBonus || 0}
                  onChange={(e) => updateField('branchBonus', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OP獎金比例 (%)
                </label>
                <input
                  type="number"
                  value={group.opBonus || 0}
                  onChange={(e) => updateField('opBonus', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  業務獎金比例 (%)
                </label>
                <input
                  type="number"
                  value={group.saleBonus || 0}
                  onChange={(e) => updateField('saleBonus', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  營收稅額
                </label>
                <input
                  type="number"
                  value={group.profitTax || 0}
                  onChange={(e) => updateField('profitTax', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-end gap-4">
        <Link
          href="/dashboard/groups"
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          取消
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || !group.groupName}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '儲存中...' : (isNew ? '建立團體' : '儲存變更')}
        </button>
      </div>
    </div>
  );
}
