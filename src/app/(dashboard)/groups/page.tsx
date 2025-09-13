'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';
import { Group, GROUP_STATUS, GroupStatus, GROUP_STATUS_NAMES, GROUP_STATUS_COLORS } from './models/GroupModel';
import { GroupApi } from './GroupApi';
import { OrderApi } from '../orders/OrderApi';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GroupStatus | 'all'>('all');
  const [groupOrders, setGroupOrders] = useState<{[key: string]: any[]}>({});

  // 載入團體資料
  const loadGroups = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (searchTerm) {
        params.groupName = searchTerm;
      }
      
      if (statusFilter !== 'all') {
        params.status = [statusFilter];
      }
      
      const data = await GroupApi.getGroups(params);
      setGroups(data);
      
      // 載入每個團體對應的訂單
      await loadGroupOrders(data);
    } catch (error) {
      console.error('載入團體失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 載入團體對應的訂單
  const loadGroupOrders = async (groups: Group[]) => {
    try {
      const orders = await OrderApi.getOrders();
      const groupOrderMap: {[key: string]: any[]} = {};
      
      groups.forEach(group => {
        groupOrderMap[group.groupCode] = orders.filter(order => order.groupCode === group.groupCode);
      });
      
      setGroupOrders(groupOrderMap);
    } catch (error) {
      console.error('載入訂單失敗:', error);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [searchTerm, statusFilter]);

  // 刪除團體
  const handleDelete = async (groupCode: string) => {
    if (confirm(`確定要刪除團號 ${groupCode} 嗎？`)) {
      await GroupApi.deleteGroup(groupCode);
      loadGroups();
    }
  };

  // 快速建立訂單
  const handleCreateOrder = async (group: Group) => {
    try {
      const orderData = {
        groupCode: group.groupCode,
        groupName: group.groupName,
        departureDate: group.departureDate,
        returnDate: group.returnDate,
        salesPerson: group.salesPerson || 'current_user',
        customerCount: group.customerCount || 1,
        status: 'PENDING'
      };
      
      const newOrder = await OrderApi.createOrder(orderData);
      alert(`已為團體 ${group.groupCode} 建立訂單 ${newOrder.orderNumber}`);
      
      // 重新載入資料
      loadGroups();
    } catch (error) {
      console.error('建立訂單失敗:', error);
      alert('建立訂單失敗，請稍後重試');
    }
  };

  // 檢視團體訂單
  const handleViewOrders = (groupCode: string) => {
    router.push(`/dashboard/orders?groupCode=${groupCode}`);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW');
  };

  // 取得狀態標籤樣式
  const getStatusBadgeClass = (status: GroupStatus) => {
    const colors = {
      'success': 'v-badge variant-success',
      'default': 'v-badge variant-primary',
      'warning': 'v-badge variant-warning'
    };
    return colors[GROUP_STATUS_COLORS[status] as keyof typeof colors] || 'v-badge';
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.groups,
        title: "團體管理",
        subtitle: "管理所有旅遊團體資訊",
        actions: (
          <>
            <div className="v-stats-group">
              <div className="v-stat-item">
                <span className="v-stat-number variant-primary">{groups.length}</span>
                <span className="v-stat-label">總團數</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-number variant-success">
                  {groups.filter(g => g.status === GROUP_STATUS.IN_PROGRESS).length}
                </span>
                <span className="v-stat-label">進行中</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-number variant-secondary">
                  {groups.filter(g => g.status === GROUP_STATUS.COMPLETED).length}
                </span>
                <span className="v-stat-label">已結團</span>
              </div>
            </div>
            <Link
              href="/dashboard/groups/new"
              className="v-button variant-primary"
            >
              <svg className="v-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              新增團體
            </Link>
          </>
        )
      }}
    >

      {/* 搜尋和篩選區 - 無額外容器，直接呈現 */}
      <div className="v-filters">
        <input
          type="text"
          placeholder="搜尋團名或團號..."
          className="v-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="v-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as GroupStatus | 'all')}
        >
          <option value="all">所有狀態</option>
          {Object.entries(GROUP_STATUS_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 團體列表 - 直接呈現表格，無額外容器 */}
      {loading ? (
        <div className="v-loading">
          <span>載入中...</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="v-empty-state">
          <svg className="v-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <p>沒有找到團體資料</p>
        </div>
      ) : (
        <table className="v-table">
          <thead>
            <tr>
              <th>團號</th>
              <th>團名</th>
              <th>出發日期</th>
              <th>回程日期</th>
              <th>狀態</th>
              <th>人數</th>
              <th>業務員</th>
              <th>訂單數</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.groupCode}>
                <td className="v-table-cell-primary">
                  {group.groupCode}
                </td>
                <td>{group.groupName}</td>
                <td>{formatDate(group.departureDate)}</td>
                <td>{formatDate(group.returnDate)}</td>
                <td>
                  <span className={getStatusBadgeClass(group.status)}>
                    {GROUP_STATUS_NAMES[group.status]}
                  </span>
                </td>
                <td>{group.customerCount || 0} 人</td>
                <td>{group.salesPerson || '-'}</td>
                <td>
                  <div className="v-table-cell-stack">
                    <span className="v-table-cell-main variant-info">
                      {groupOrders[group.groupCode]?.length || 0}
                    </span>
                    {groupOrders[group.groupCode]?.length > 0 && (
                      <button
                        onClick={() => handleViewOrders(group.groupCode)}
                        className="v-link variant-info size-sm"
                      >
                        檢視
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <div className="v-table-actions">
                    <Link
                      href={`/dashboard/groups/${group.groupCode}`}
                      className="v-link variant-primary"
                    >
                      檢視
                    </Link>
                    <Link
                      href={`/dashboard/groups/${group.groupCode}/edit`}
                      className="v-link variant-success"
                    >
                      編輯
                    </Link>
                    {(!groupOrders[group.groupCode] || groupOrders[group.groupCode].length === 0) && (
                      <button
                        onClick={() => handleCreateOrder(group)}
                        className="v-link variant-warning"
                      >
                        建立訂單
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(group.groupCode)}
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
