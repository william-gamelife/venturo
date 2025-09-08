'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModuleLayout } from '@/components/ModuleLayout';
import { PageHeader } from '@/components/PageHeader';
import { Group, GROUP_STATUS, GroupStatus, GROUP_STATUS_NAMES, GROUP_STATUS_COLORS } from './models/GroupModel';
import { GroupApi } from './GroupApi';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GroupStatus | 'all'>('all');

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
    } catch (error) {
      console.error('載入團體失敗:', error);
    } finally {
      setLoading(false);
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

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW');
  };

  // 取得狀態標籤樣式
  const getStatusBadgeClass = (status: GroupStatus) => {
    const colors = {
      'success': 'bg-green-100 text-green-800',
      'default': 'bg-gray-100 text-gray-800',
      'warning': 'bg-yellow-100 text-yellow-800'
    };
    return colors[GROUP_STATUS_COLORS[status] as keyof typeof colors];
  };

  return (
    <ModuleLayout>
      <PageHeader 
        title="團體管理"
        subtitle="管理所有旅遊團體資訊"
        icon="👥"
        actions={
          <>
            <div className="group-stats">
              <div className="stat-item">
                <span className="stat-number">{groups.length}</span>
                <span className="stat-label">總團數</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-green-600">
                  {groups.filter(g => g.status === GROUP_STATUS.IN_PROGRESS).length}
                </span>
                <span className="stat-label">進行中</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-gray-600">
                  {groups.filter(g => g.status === GROUP_STATUS.COMPLETED).length}
                </span>
                <span className="stat-label">已結團</span>
              </div>
            </div>
            <Link
              href="/dashboard/groups/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 新增團體
            </Link>
          </>
        }
      />

      {/* 搜尋和篩選區 */}
      <div className="filter-section">
        <div className="flex flex-wrap gap-4">
          {/* 搜尋框 */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜尋團名或團號..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 狀態篩選 */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">載入中...</div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            沒有找到團體資料
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
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
