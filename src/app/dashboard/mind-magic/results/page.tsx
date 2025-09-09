'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';

export default function MindMagicResults() {
  // 模擬歷史測試結果數據
  const [testHistory] = useState([
    {
      id: 'DEMO_ATH_APH_HER',
      date: '2024-01-15',
      type: '演示版',
      status: '已完成'
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.mindMagic,
        title: "測試歷史",
        subtitle: "查看您的所有心靈魔法測試記錄",
        actions: (
          <Link href="/dashboard/mind-magic/test" className="btn-primary">
            + 開始新測試
          </Link>
        )
      }}
    >
      <div className="results-content">
        {testHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔮</div>
            <h3>尚無測試記錄</h3>
            <p>開始您的第一次心靈魔法之旅吧！</p>
            <Link href="/dashboard/mind-magic/test" className="btn-primary">
              開始測試
            </Link>
          </div>
        ) : (
          <div className="history-list">
            <div className="unified-table">
              <table className="w-full">
                <thead style={{ background: "linear-gradient(135deg, #c9a961 0%, #b8975a 100%)" }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      測試日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      人格ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      版本
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
                  {testHistory.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(test.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {test.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full badge-info">
                          {test.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full badge-success">
                          {test.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/mind-magic/result/${test.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          查看結果
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .results-content {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #4a5568;
        }
        
        .empty-state p {
          color: #666;
          margin-bottom: 2rem;
        }
        
        .history-list {
          margin-top: 2rem;
        }
      `}</style>
    </ModuleLayout>
  );
}