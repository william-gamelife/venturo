'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';
import { analyzeTestResults, type TestAnalysis, type ArchetypeInfo } from '@/lib/mind-magic-analysis';

export default function MindMagicResultsPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<TestAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [testDate, setTestDate] = useState<string>('');

  useEffect(() => {
    const savedResult = localStorage.getItem('mindMagicResult');
    const savedDate = localStorage.getItem('mindMagicTestDate');
    
    if (savedResult) {
      try {
        const scores = JSON.parse(savedResult);
        const analysisResult = analyzeTestResults(scores);
        setAnalysis(analysisResult);
        setTestDate(savedDate ? new Date(savedDate).toLocaleDateString('zh-TW') : '');
      } catch (error) {
        console.error('解析測驗結果時發生錯誤:', error);
      }
    }
    setLoading(false);
  }, []);

  const retakeTest = () => {
    localStorage.removeItem('mindMagicResult');
    localStorage.removeItem('mindMagicTestDate');
    router.push('/dashboard/mind-magic/test');
  };

  const goHome = () => {
    router.push('/dashboard/mind-magic');
  };

  if (loading) {
    return (
      <ModuleLayout
        header={{
          icon: Icons.mindMagic,
          title: "載入中...",
          subtitle: "正在分析你的結果"
        }}
      >
        <div className="loading-screen">
          <div className="magic-circle">
            <div className="inner-circle">
              <span className="loading-icon">🔮</span>
            </div>
          </div>
          <p>正在解析你的心靈密碼...</p>
        </div>

        <style jsx global>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
            text-align: center;
          }
          
          .magic-circle {
            width: 100px;
            height: 100px;
            border: 2px solid rgba(201, 169, 97, 0.3);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 1rem;
            animation: rotate 2s linear infinite;
          }
          
          .inner-circle {
            width: 60px;
            height: 60px;
            border: 1px solid rgba(201, 169, 97, 0.6);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: rotate-reverse 1.5s linear infinite;
          }
          
          .loading-icon {
            font-size: 1.5rem;
            animation: pulse 1s ease-in-out infinite;
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes rotate-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </ModuleLayout>
    );
  }

  if (!analysis) {
    return (
      <ModuleLayout
        header={{
          icon: Icons.mindMagic,
          title: "沒有測驗結果",
          subtitle: "請先完成測驗"
        }}
      >
        <div className="no-results">
          <div className="no-results-content">
            <h2>尚未進行測驗</h2>
            <p>你還沒有完成心靈魔法測驗，請先進行測驗以獲得你的專屬結果。</p>
            <button className="btn-primary" onClick={() => router.push('/dashboard/mind-magic/test')}>
              開始測驗
            </button>
          </div>
        </div>

        <style jsx global>{`
          .no-results {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
            text-align: center;
          }
          
          .no-results-content h2 {
            font-size: 1.5rem;
            color: #c9a961;
            margin-bottom: 1rem;
          }
          
          .no-results-content p {
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
        `}</style>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.mindMagic,
        title: "你的心靈原型",
        subtitle: testDate ? `測驗日期：${testDate}` : '',
        actions: (
          <div className="result-actions">
            <button className="action-btn secondary" onClick={retakeTest}>
              重新測驗
            </button>
            <button className="action-btn primary" onClick={goHome}>
              返回首頁
            </button>
          </div>
        )
      }}
    >
      <div className="results-container">
        {/* 主要原型展示 */}
        <div className="primary-archetype-section">
          <div className="archetype-card primary">
            <div className="archetype-symbol">{analysis.primaryArchetype.symbol}</div>
            <div className="archetype-info">
              <h2>{analysis.primaryArchetype.name}</h2>
              <p className="greek-name">{analysis.primaryArchetype.greekName}</p>
              <p className="description">{analysis.primaryArchetype.description}</p>
            </div>
          </div>
          
          <div className="personality-code">
            <h3>你的專屬密碼</h3>
            <div className="code">{analysis.personalityCode}</div>
            <p className="code-explanation">這是你獨一無二的人格解鎖密碼</p>
          </div>
        </div>

        {/* 次要原型和陰影原型 */}
        <div className="secondary-archetypes">
          <div className="archetype-card secondary">
            <div className="archetype-symbol small">{analysis.secondaryArchetype.symbol}</div>
            <div className="archetype-info">
              <h3>次要原型：{analysis.secondaryArchetype.name}</h3>
              <p>{analysis.secondaryArchetype.description}</p>
            </div>
          </div>
          
          <div className="archetype-card shadow">
            <div className="archetype-symbol small">{analysis.shadowArchetype.symbol}</div>
            <div className="archetype-info">
              <h3>陰影原型：{analysis.shadowArchetype.name}</h3>
              <p>你最需要整合的內在面向</p>
            </div>
          </div>
        </div>

        {/* 優勢與挑戰 */}
        <div className="traits-section">
          <div className="traits-card strengths">
            <h3>💪 你的優勢</h3>
            <ul>
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="traits-card challenges">
            <h3>⚠️ 成長挑戰</h3>
            <ul>
              {analysis.challenges.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 建議 */}
        <div className="recommendations-section">
          <h3>🌟 給你的建議</h3>
          <div className="recommendations-list">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-number">{index + 1}</span>
                <span className="recommendation-text">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 詳細分析 */}
        <div className="detailed-analysis-section">
          <h3>📊 詳細分析</h3>
          <div className="analysis-content">
            {analysis.detailedAnalysis.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index}>{paragraph.trim()}</p>
              )
            ))}
          </div>
        </div>

        {/* 職業建議 */}
        <div className="career-section">
          <h3>💼 適合的職業方向</h3>
          <div className="career-tags">
            {analysis.primaryArchetype.careers.map((career, index) => (
              <span key={index} className="career-tag">{career}</span>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .result-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .action-btn.secondary {
          background: transparent;
          border: 1px solid rgba(201, 169, 97, 0.5);
          color: #c9a961;
        }
        
        .action-btn.secondary:hover {
          border-color: #c9a961;
          background: rgba(201, 169, 97, 0.1);
        }
        
        .action-btn.primary {
          background: #c9a961;
          border: 1px solid #c9a961;
          color: white;
        }
        
        .action-btn.primary:hover {
          background: #b8976b;
          border-color: #b8976b;
        }
        
        .results-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
          space-y: 3rem;
        }
        
        .primary-archetype-section {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .archetype-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        .archetype-card.primary {
          border: 3px solid #c9a961;
          background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(255, 255, 255, 0.9));
        }
        
        .archetype-card.secondary {
          border: 2px solid rgba(201, 169, 97, 0.5);
        }
        
        .archetype-card.shadow {
          border: 2px solid rgba(108, 117, 125, 0.5);
          background: rgba(248, 249, 250, 0.8);
        }
        
        .archetype-symbol {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.8;
        }
        
        .archetype-symbol.small {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        
        .archetype-info h2 {
          font-size: 2rem;
          color: #c9a961;
          margin-bottom: 0.5rem;
        }
        
        .archetype-info h3 {
          font-size: 1.25rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }
        
        .greek-name {
          font-size: 1.1rem;
          color: #8b7355;
          font-style: italic;
          margin-bottom: 1rem;
        }
        
        .description {
          font-size: 1rem;
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
        }
        
        .personality-code {
          margin-top: 2rem;
        }
        
        .personality-code h3 {
          font-size: 1.25rem;
          color: #2d3748;
          margin-bottom: 1rem;
        }
        
        .code {
          font-size: 2rem;
          font-weight: 700;
          color: #c9a961;
          background: rgba(201, 169, 97, 0.1);
          padding: 1rem 2rem;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 0.5rem;
          letter-spacing: 0.1em;
          font-family: 'Courier New', monospace;
        }
        
        .code-explanation {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }
        
        .secondary-archetypes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .traits-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .traits-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }
        
        .traits-card.strengths {
          border-left: 4px solid #10b981;
        }
        
        .traits-card.challenges {
          border-left: 4px solid #f59e0b;
        }
        
        .traits-card h3 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }
        
        .traits-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .traits-card li {
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          color: #4a5568;
          font-size: 0.9rem;
        }
        
        .traits-card li:last-child {
          border-bottom: none;
        }
        
        .recommendations-section,
        .detailed-analysis-section,
        .career-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }
        
        .recommendations-section h3,
        .detailed-analysis-section h3,
        .career-section h3 {
          font-size: 1.25rem;
          color: #2d3748;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid rgba(201, 169, 97, 0.2);
          padding-bottom: 0.5rem;
        }
        
        .recommendations-list {
          space-y: 1rem;
        }
        
        .recommendation-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .recommendation-number {
          background: #c9a961;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .recommendation-text {
          color: #4a5568;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        
        .analysis-content p {
          color: #4a5568;
          line-height: 1.7;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        
        .career-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .career-tag {
          background: rgba(201, 169, 97, 0.1);
          color: #c9a961;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .results-container {
            padding: 1rem 0.5rem;
          }
          
          .secondary-archetypes,
          .traits-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .archetype-symbol {
            font-size: 3rem;
          }
          
          .code {
            font-size: 1.5rem;
            padding: 0.75rem 1.5rem;
          }
          
          .recommendation-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}