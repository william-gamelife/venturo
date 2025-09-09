'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';
import { authManager } from '@/lib/auth';

export default function MindMagicPage() {
  const router = useRouter();

  // 檢查用戶認證
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      router.push('/');
      return;
    }
  }, [router]);

  const startTest = () => {
    router.push('/dashboard/mind-magic/test');
  };

  const viewResults = () => {
    router.push('/dashboard/mind-magic/results');
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.mindMagic,
        title: "心靈魔法",
        subtitle: "探索內在，發現真實的自己",
        actions: (
          <div className="mind-magic-stats">
            <div className="stat-item">
              <span className="stat-number" style={{ fontSize: 24, fontWeight: 700, color: "#c9a961" }}>🔮</span>
              <span className="stat-label">準備好了嗎？</span>
            </div>
          </div>
        )
      }}
    >
      {/* 主要內容 */}
      <div className="mind-magic-content">
        <div className="intro-section">
          <h2>歡迎來到心靈魔法</h2>
          <p>基於希臘神話十二原型的深度人格測驗，探索你的內在真實樣貌。</p>
          
          <div className="test-phases">
            <div className="phase-card">
              <h3>🎯 人格軸向測驗</h3>
              <p>分析你的主要人格特質組合</p>
            </div>
            <div className="phase-card">
              <h3>🎭 陰影人格識別</h3>
              <p>發現你最不願承認的內在面向</p>
            </div>
            <div className="phase-card">
              <h3>🔮 專屬密碼生成</h3>
              <p>獲得獨一無二的人格解鎖密碼</p>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={startTest}>
              開始測驗
            </button>
            <button className="btn-secondary" onClick={viewResults}>
              查看歷史結果
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .mind-magic-stats {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        
        .mind-magic-stats .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        
        .mind-magic-stats .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          white-space: nowrap;
        }
        
        .mind-magic-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 0;
        }
        
        .intro-section {
          text-align: center;
          space-y: 2rem;
        }
        
        .intro-section h2 {
          font-size: 2rem;
          font-weight: 300;
          margin-bottom: 1rem;
          color: #2d3748;
        }
        
        .intro-section p {
          font-size: 1.1rem;
          color: #4a5568;
          margin-bottom: 3rem;
          line-height: 1.6;
        }
        
        .test-phases {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 3rem 0;
        }
        
        .phase-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(201, 169, 97, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .phase-card:hover {
          border-color: rgba(201, 169, 97, 0.4);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        .phase-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #c9a961;
        }
        
        .phase-card p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }
        
        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 3rem;
        }
        
        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}