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
      'success': 'badge-success',
      'default': 'badge-primary',
      'warning': 'badge-warning'
    };
    return colors[GROUP_STATUS_COLORS[status] as keyof typeof colors];
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.groups,
        title: "團體管理",
        subtitle: "管理所有旅遊團體資訊",
        actions: (
          <>
            <div className="group-stats">
              <div className="stat-item">
                <span className="stat-number" style={{ fontSize: 24, fontWeight: 700, color: "#c9a961" }}>{groups.length}</span>
                <span className="stat-label">總團數</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-success">
                  {groups.filter(g => g.status === GROUP_STATUS.IN_PROGRESS).length}
                </span>
                <span className="stat-label">進行中</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-muted">
                  {groups.filter(g => g.status === GROUP_STATUS.COMPLETED).length}
                </span>
                <span className="stat-label">已結團</span>
              </div>
            </div>
            <Link
              href="/dashboard/groups/new"
              className="btn-primary"
            >
              + 新增團體
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
              placeholder="搜尋團名或團號..."
              className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: 8, fontSize: 14, transition: "all 0.2s ease" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 狀態篩選 */}
          <select
            className="unified-input" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(201, 169, 97, 0.3)", borderRadius: 8, fontSize: 14, transition: "all 0.2s ease" }}
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
      </div>

      {/* 團體列表 */}
      <div className="unified-table" style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", border: "1px solid rgba(201, 169, 97, 0.2)" }}>
        {loading ? (
          <div className="p-8 text-center text-gray-500">載入中...</div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            沒有找到團體資料
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "linear-gradient(135deg, #c9a961 0%, #b8975a 100%)" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    團號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    團名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出發日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    回程日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    人數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    業務員
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr key={group.groupCode} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {group.groupCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.groupName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(group.departureDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(group.returnDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(group.status)}`}>
                        {GROUP_STATUS_NAMES[group.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.customerCount || 0} 人
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.salesPerson || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600">
                          {groupOrders[group.groupCode]?.length || 0}
                        </span>
                        {groupOrders[group.groupCode]?.length > 0 && (
                          <button
                            onClick={() => handleViewOrders(group.groupCode)}
                            className="badge badge-info"
                          >
                            檢視
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/groups/${group.groupCode}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          檢視
                        </Link>
                        <Link
                          href={`/dashboard/groups/${group.groupCode}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          編輯
                        </Link>
                        {(!groupOrders[group.groupCode] || groupOrders[group.groupCode].length === 0) && (
                          <button
                            onClick={() => handleCreateOrder(group)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            建立訂單
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(group.groupCode)}
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
        .group-stats {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        
        .group-stats .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        
        .group-stats .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
        }
        
        .group-stats .stat-label {
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
          .group-stats {
            flex-direction: column;
            gap: 12px;
          }
          
          .group-stats .stat-item {
            flex-direction: row;
            gap: 8px;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}
