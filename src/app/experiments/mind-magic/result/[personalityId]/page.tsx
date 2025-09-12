'use client';

import { useParams, useRouter } from 'next/navigation';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';

// 軸向說明資料
const axisDescriptions = {
  ATH: { name: "雅典娜", description: "理性思維，邏輯分析" },
  APH: { name: "阿芙蘿黛蒂", description: "感性直覺，情感豐富" },
  HER: { name: "赫拉", description: "權威領導，組織能力" },
  ODI: { name: "奧德修斯", description: "靈活變通，適應能力" },
  PRO: { name: "普羅米修斯", description: "創新前瞻，突破傳統" },
  POL: { name: "波塞冬", description: "穩定務實，腳踏實地" },
  ZEU: { name: "宙斯", description: "權力慾望，統治意識" },
  FRE: { name: "自由女神", description: "自由獨立，不受拘束" },
  DRE: { name: "夢想家", description: "想像豐富，理想主義" },
  HEP: { name: "赫菲斯托斯", description: "實作能力，工匠精神" },
  LOK: { name: "洛基", description: "機智狡詐，善於變化" },
  CER: { name: "墨忒耳", description: "孕育滋養，關愛他人" }
};

export default function MindMagicResult() {
  const params = useParams();
  const router = useRouter();
  const personalityId = params.personalityId as string;

  // 解析人格ID
  const parsePersonalityId = (id: string) => {
    if (id.startsWith('P') && id.includes('_')) {
      // 新格式：P000102_0305_120308 (3高軸向_2低軸向_強度)
      const parts = id.substring(1).split('_');
      if (parts.length === 3) {
        const [topAxes, shadowAxes, intensities] = parts;
        
        // 解析軸向索引
        const primaryAxis = parseInt(topAxes.substring(0, 2));
        const secondaryAxis = parseInt(topAxes.substring(2, 4));  
        const tertiaryAxis = parseInt(topAxes.substring(4, 6));
        const shadowAxis1 = parseInt(shadowAxes.substring(0, 2));
        const shadowAxis2 = parseInt(shadowAxes.substring(2, 4));
        
        // 解析強度
        const primaryIntensity = parseInt(intensities.substring(0, 2));
        const secondaryIntensity = parseInt(intensities.substring(2, 4));
        const tertiaryIntensity = parseInt(intensities.substring(4, 6));
        
        return {
          isDemoVersion: false,
          isRealProfile: true,
          personalityId: id,
          axisIndices: {
            top3: [primaryAxis, secondaryAxis, tertiaryAxis],
            shadow2: [shadowAxis1, shadowAxis2]
          },
          intensities: {
            primary: primaryIntensity,
            secondary: secondaryIntensity,
            tertiary: tertiaryIntensity
          },
          needsUnlocking: true
        };
      }
    }
    
    if (id.startsWith('P') && id.length === 5) {
      // 舊格式兼容
      const numericId = parseInt(id.substring(1));
      const primaryIntensity = Math.floor(numericId / 110) + 1;
      const secondaryIntensity = Math.floor((numericId % 110) / 10) + 1;
      const tertiaryIntensity = (numericId % 10) + 1;
      
      return {
        isDemoVersion: false,
        isRealProfile: true,
        personalityId: id,
        intensities: {
          primary: primaryIntensity,
          secondary: secondaryIntensity,
          tertiary: tertiaryIntensity
        },
        needsUnlocking: true
      };
    }
    
    if (id.startsWith('DEMO_')) {
      // 演示版格式
      const parts = id.replace('DEMO_', '').split('_');
      return {
        isDemoVersion: true,
        top3: parts.map(axis => ({
          axis,
          name: axisDescriptions[axis]?.name || axis,
          description: axisDescriptions[axis]?.description || '未知特質'
        }))
      };
    }
    
    return {
      isDemoVersion: false,
      profileNotFound: true
    };
  };

  const personality = parsePersonalityId(personalityId);

  const retakeTest = () => {
    router.push('/dashboard/mind-magic/test');
  };

  const upgradeToFull = () => {
    alert('完整版本即將推出！將包含1320種詳細人格分析');
  };

  return (
    <ModuleLayout
      header={{
        icon: Icons.mindMagic,
        title: "心靈魔法結果",
        subtitle: "你的內在人格解析",
        actions: (
          <div className="result-actions">
            <button className="btn-secondary" onClick={retakeTest}>
              重新測驗
            </button>
            <button className="btn-primary" onClick={upgradeToFull}>
              升級完整版
            </button>
          </div>
        )
      }}
    >
      <div className="result-content">
        {personality.isRealProfile ? (
          <div className="real-profile">
            <div className="result-header">
              <h2>恭喜！你的專屬人格密碼已生成</h2>
              <div className="personality-id">{personalityId}</div>
            </div>

            <div className="intensity-display">
              <h3>你的人格強度組合</h3>
              <div className="intensity-grid">
                <div className="intensity-item primary">
                  <div className="intensity-label">主要特質</div>
                  <div className="intensity-value">強度 {personality.intensities.primary}</div>
                  <div className="intensity-note">最高層級</div>
                </div>
                <div className="intensity-item secondary">
                  <div className="intensity-label">次要特質</div>
                  <div className="intensity-value">強度 {personality.intensities.secondary}</div>
                  <div className="intensity-note">輔助特質</div>
                </div>
                <div className="intensity-item tertiary">
                  <div className="intensity-label">第三特質</div>
                  <div className="intensity-value">強度 {personality.intensities.tertiary}</div>
                  <div className="intensity-note">平衡要素</div>
                </div>
              </div>
            </div>

            <div className="upgrade-notice">
              <div className="notice-content">
                <h3>🔮 解鎖完整版本</h3>
                <p>恭喜！你已獲得專屬人格密碼</p>
                
                <div className="secret-code">
                  <div className="code-label">你的專屬密碼：</div>
                  <div className="code-value">{personalityId}</div>
                  <div className="code-instruction">
                    請將此密碼傳送給 William，即可解鎖你的完整人格分析！
                  </div>
                </div>

                <div className="unlock-benefits">
                  <p>解鎖後將獲得：</p>
                  <ul>
                    <li>🎯 你的專屬三大人格軸向解析</li>
                    <li>📊 1320種精確人格分析檔案</li>
                    <li>🎭 陰影人格深度解析</li>
                    <li>💝 專屬人格成長建議</li>
                    <li>🌟 個人化冥想指導</li>
                    <li>🔒 專屬人格檔案永久保存</li>
                  </ul>
                </div>

                <div className="contact-info">
                  <button className="copy-code-btn" onClick={() => {
                    navigator.clipboard.writeText(`我的心靈魔法人格密碼是：${personalityId}，請幫我解鎖完整分析！`);
                    alert('已複製到剪貼簿！現在可以傳送給William囉～');
                  }}>
                    📋 複製密碼訊息
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : personality.isDemoVersion ? (
          <div className="demo-result">
            <div className="result-header">
              <h2>你的人格類型 (演示版)</h2>
              <div className="personality-id">ID: {personalityId}</div>
            </div>

            <div className="top-traits">
              <h3>你的前三大特質</h3>
              <div className="traits-grid">
                {personality.top3.map((trait, index) => (
                  <div key={trait.axis} className={`trait-card rank-${index + 1}`}>
                    <div className="trait-rank">#{index + 1}</div>
                    <div className="trait-name">{trait.name}</div>
                    <div className="trait-axis">({trait.axis})</div>
                    <div className="trait-description">{trait.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="upgrade-notice">
              <div className="notice-content">
                <h3>🔮 解鎖完整版本</h3>
                <p>恭喜！你已獲得專屬人格密碼</p>
                
                <div className="secret-code">
                  <div className="code-label">你的專屬密碼：</div>
                  <div className="code-value">{personalityId}</div>
                  <div className="code-instruction">
                    請將此密碼傳送給 William，即可解鎖你的完整人格分析！
                  </div>
                </div>

                <div className="unlock-benefits">
                  <p>解鎖後將獲得：</p>
                  <ul>
                    <li>✨ 完整60題三階段測驗</li>
                    <li>📊 1320種精確人格分析</li>
                    <li>🎭 陰影人格深度解析</li>
                    <li>💝 專屬人格成長建議</li>
                    <li>🌟 個人化冥想指導</li>
                    <li>🔒 專屬人格檔案永久保存</li>
                  </ul>
                </div>

                <div className="contact-info">
                  <button className="copy-code-btn" onClick={() => {
                    navigator.clipboard.writeText(`我的心靈魔法人格密碼是：${personalityId}，請幫我解鎖完整分析！`);
                    alert('已複製到剪貼簿！現在可以傳送給William囉～');
                  }}>
                    📋 複製密碼訊息
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : personality.profileNotFound ? (
          <div className="not-found-result">
            <div className="not-found-content">
              <div className="not-found-icon">🔮</div>
              <h2>人格檔案建構中...</h2>
              <p>完整的1320人格資料庫正在建置中</p>
              <p>您的人格ID: <code>{personalityId}</code></p>
              
              <div className="placeholder-actions">
                <button className="btn-primary" onClick={retakeTest}>
                  重新測驗
                </button>
                <button className="btn-secondary" onClick={upgradeToFull}>
                  了解完整版
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <style jsx global>{`
        .result-actions {
          display: flex;
          gap: 12px;
        }
        
        .result-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 0;
        }
        
        .real-profile .result-header,
        .demo-result .result-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .intensity-display {
          margin-bottom: 3rem;
        }
        
        .intensity-display h3 {
          text-align: center;
          font-size: 1.5rem;
          margin-bottom: 2rem;
          color: #4a5568;
        }
        
        .intensity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .intensity-item {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        
        .intensity-item.primary {
          border-color: #c9a961;
          background: linear-gradient(135deg, #c9a961 0%, #e4d4a8 100%);
          color: white;
        }
        
        .intensity-item.secondary {
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          color: white;
        }
        
        .intensity-item.tertiary {
          border-color: #06b6d4;
          background: linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%);
          color: white;
        }
        
        .intensity-label {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .intensity-value {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .intensity-note {
          font-size: 0.8rem;
          opacity: 0.8;
        }
        
        .demo-result .result-header h2 {
          font-size: 2rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }
        
        .personality-id {
          font-family: monospace;
          background: rgba(201, 169, 97, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: #c9a961;
          display: inline-block;
        }
        
        .top-traits {
          margin-bottom: 3rem;
        }
        
        .top-traits h3 {
          text-align: center;
          font-size: 1.5rem;
          margin-bottom: 2rem;
          color: #4a5568;
        }
        
        .traits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        
        .trait-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 2px solid transparent;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          transition: all 0.3s ease;
        }
        
        .trait-card.rank-1 {
          border-color: #FFD700;
          transform: scale(1.02);
        }
        
        .trait-card.rank-2 {
          border-color: #C0C0C0;
        }
        
        .trait-card.rank-3 {
          border-color: #CD7F32;
        }
        
        .trait-rank {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #c9a961;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
        }
        
        .trait-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #c9a961;
        }
        
        .trait-axis {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.75rem;
        }
        
        .trait-description {
          color: #4a5568;
          line-height: 1.5;
        }
        
        .upgrade-notice {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 2rem;
          color: white;
          text-align: center;
        }
        
        .upgrade-notice h3 {
          font-size: 1.75rem;
          margin-bottom: 1rem;
        }
        
        .upgrade-notice p {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }
        
        .secret-code {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .code-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }
        
        .code-value {
          font-family: 'Courier New', monospace;
          font-size: 1.5rem;
          font-weight: bold;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin: 0.5rem 0;
          letter-spacing: 2px;
          word-break: break-all;
        }
        
        .code-instruction {
          font-size: 0.95rem;
          opacity: 0.9;
          margin-top: 0.75rem;
          line-height: 1.4;
        }
        
        .unlock-benefits {
          margin: 1.5rem 0;
        }
        
        .unlock-benefits p {
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        
        .unlock-benefits ul {
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .unlock-benefits li {
          padding: 0.25rem 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }
        
        .contact-info {
          margin-top: 2rem;
        }
        
        .copy-code-btn {
          background: rgba(255, 215, 0, 0.9);
          border: 2px solid rgba(255, 215, 0, 1);
          color: #333;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }
        
        .copy-code-btn:hover {
          background: rgba(255, 215, 0, 1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }
        
        .not-found-result {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .not-found-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .not-found-content h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #4a5568;
        }
        
        .not-found-content p {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .not-found-content code {
          background: rgba(201, 169, 97, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: #c9a961;
          font-family: monospace;
        }
        
        .placeholder-actions {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .result-actions {
            flex-direction: column;
          }
          
          .placeholder-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}