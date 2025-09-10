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

  const startRitualTest = () => {
    router.push('/dashboard/mind-magic/ritual-test');
  };

  const viewResults = () => {
    router.push('/dashboard/mind-magic/results');
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.mindMagic,
        title: "心靈魔法",
        subtitle: "基於希臘神話十二原型的深度人格分析系統",
        actions: (
          <div className="mind-magic-stats">
            <div className="stat-item">
              <span className="stat-number" style={{ fontSize: 14, fontWeight: 600, color: "#c9a961" }}>1320+ 系統</span>
              <span className="stat-label">完整十二維度評估</span>
            </div>
          </div>
        )
      }}
    >
      {/* 主要內容 */}
      <div className="mind-magic-content">
        <div className="intro-section">
          <h2>重新架構：完整的 1320+ 系統</h2>
          <p>不是三高二低的簡化分析，而是十二維度的全像人格圖譜。每個維度都重要，每個分數都有其獨特意義。</p>
          
          <div className="test-phases">
            <div className="phase-card">
              <div className="phase-icon">◊</div>
              <h3>多層次人格測量</h3>
              <p>絕對值、相對值、動態範圍的完整評估</p>
            </div>
            <div className="phase-card">
              <div className="phase-icon">◈</div>
              <h3>陰影原型識別</h3>
              <p>發現最不願承認的內在驅動力</p>
            </div>
            <div className="phase-card">
              <div className="phase-icon">◉</div>
              <h3>專屬密碼生成</h3>
              <p>基於完整數據的個人化識別碼</p>
            </div>
          </div>

          <div className="test-options">
            <h3>選擇評估模式</h3>
            <div className="test-type-cards">
              <div className="test-type-card">
                <div className="test-type-icon">◦</div>
                <h4>標準評估</h4>
                <p>完整的 60 題多層次測量，獲得精確的十二維度數據</p>
                <button className="btn-outline" onClick={startTest}>
                  開始評估
                </button>
              </div>
              <div className="test-type-card featured">
                <div className="test-type-icon">◆</div>
                <h4>深度分析</h4>
                <p>結合情境模擬的進階評估，探索動態人格模式</p>
                <span className="recommended-badge">建議</span>
                <button className="btn-primary" onClick={startRitualTest}>
                  開始分析
                </button>
              </div>
            </div>
            
            <div className="results-section">
              <button className="btn-secondary" onClick={viewResults}>
                查看歷史結果
              </button>
            </div>
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
          background: linear-gradient(145deg, #ffffff, #f8f9fa);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(201, 169, 97, 0.15);
          box-shadow: 0 4px 20px rgba(201, 169, 97, 0.08);
          transition: all 0.3s ease;
          text-align: center;
        }
        
        .phase-card:hover {
          border-color: rgba(201, 169, 97, 0.3);
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.15);
          transform: translateY(-2px);
        }
        
        .phase-icon {
          font-size: 2rem;
          color: #c9a961;
          margin-bottom: 1rem;
          font-weight: 300;
        }
        
        .phase-card h3 {
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
          color: #2d3748;
          letter-spacing: -0.025em;
        }
        
        .phase-card p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }
        
        .test-options {
          margin-top: 3rem;
          text-align: center;
        }
        
        .test-options h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 2rem;
        }
        
        .test-type-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin: 2rem 0 3rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .test-type-card {
          background: white;
          border: 2px solid rgba(201, 169, 97, 0.2);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .test-type-card:hover {
          border-color: rgba(201, 169, 97, 0.4);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .test-type-card.featured {
          border-color: #c9a961;
          background: linear-gradient(135deg, rgba(201, 169, 97, 0.05), rgba(255, 255, 255, 0.95));
        }
        
        .test-type-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }
        
        .test-type-card h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }
        
        .test-type-card p {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        
        .recommended-badge {
          position: absolute;
          top: -8px;
          right: 16px;
          background: linear-gradient(135deg, #c9a961, #d4b86a);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .btn-outline {
          background: transparent;
          border: 2px solid rgba(201, 169, 97, 0.3);
          color: #c9a961;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-outline:hover {
          border-color: #c9a961;
          background: rgba(201, 169, 97, 0.05);
        }
        
        .results-section {
          border-top: 1px solid rgba(201, 169, 97, 0.2);
          padding-top: 2rem;
          margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
          .test-type-cards {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}