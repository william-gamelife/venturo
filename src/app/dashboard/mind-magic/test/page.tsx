'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 簡化的測試資料結構
const phase1Questions = [
  {
    id: "Q001",
    phase: 1,
    axis: "ATH-APH",
    type: "情境",
    question: "深夜獨處時，你會：",
    options: [
      { text: "整理思緒，規劃明天", score: { ATH: 3 } },
      { text: "聽音樂，感受當下", score: { APH: 3 } },
      { text: "看書或學習新知", score: { ATH: 2, HER: 1 } },
      { text: "翻看照片回憶往事", score: { APH: 2, ODI: 1 } },
      { text: "都有可能，看心情", score: {} }
    ]
  },
  {
    id: "Q002",
    phase: 1,
    axis: "ATH-APH",
    type: "價值觀",
    question: "面對爭論時，你最在意：",
    options: [
      { text: "邏輯是否嚴密", score: { ATH: 3 } },
      { text: "情感是否受傷", score: { APH: 3 } },
      { text: "事實是否正確", score: { ATH: 2 } },
      { text: "氣氛是否和諧", score: { APH: 2 } },
      { text: "快點結束爭論", score: { ODI: 1 } }
    ]
  },
  // 為了演示，這裡只放2題
];

export default function MindMagicTest() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState({
    ATH: 0, APH: 0, HER: 0, ODI: 0,
    PRO: 0, POL: 0, ZEU: 0, FRE: 0,
    DRE: 0, HEP: 0, LOK: 0, CER: 0
  });

  const handleAnswer = (optionIndex) => {
    const question = phase1Questions[currentQuestion];
    const selectedOption = question.options[optionIndex];
    
    // 更新分數
    const newScores = { ...scores };
    if (selectedOption.score) {
      Object.entries(selectedOption.score).forEach(([axis, value]) => {
        newScores[axis] = (newScores[axis] || 0) + value;
      });
    }

    setScores(newScores);
    setAnswers([...answers, { questionId: question.id, selectedOption: optionIndex }]);

    // 檢查是否完成測試
    if (currentQuestion + 1 >= phase1Questions.length) {
      // 測試完成，導向結果頁
      completeTest(newScores);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const completeTest = (finalScores) => {
    // 按照您的規格計算1320人格ID (需要3高+2低)
    const sorted = Object.entries(finalScores).sort((a, b) => b[1] - a[1]);
    const top3 = sorted.slice(0, 3);  // 前3高
    const bottom2 = sorted.slice(-2); // 後2低
    
    // 計算強度等級 (1-12, 1-11, 1-10)
    const primaryIntensity = Math.min(12, Math.max(1, Math.ceil(top3[0][1] / 10)));
    const secondaryIntensity = Math.min(11, Math.max(1, Math.ceil(top3[1][1] / 10)));
    const tertiaryIntensity = Math.min(10, Math.max(1, Math.ceil(top3[2][1] / 10)));
    
    // 將12軸轉換為索引編號 (ATH=0, APH=1, ...)
    const axisToIndex = {
      'ATH': 0, 'APH': 1, 'HER': 2, 'ODI': 3,
      'PRO': 4, 'POL': 5, 'ZEU': 6, 'FRE': 7,
      'DRE': 8, 'HEP': 9, 'LOK': 10, 'CER': 11
    };
    
    // 生成包含軸向資訊的ID
    const primaryAxis = axisToIndex[top3[0][0]];
    const secondaryAxis = axisToIndex[top3[1][0]];
    const tertiaryAxis = axisToIndex[top3[2][0]];
    const shadowAxis1 = axisToIndex[bottom2[0][0]];
    const shadowAxis2 = axisToIndex[bottom2[1][0]];
    
    // 組合成完整的人格ID (包含3高2低+強度資訊)
    const personalityId = `P${primaryAxis.toString().padStart(2,'0')}${secondaryAxis.toString().padStart(2,'0')}${tertiaryAxis.toString().padStart(2,'0')}_${shadowAxis1.toString().padStart(2,'0')}${shadowAxis2.toString().padStart(2,'0')}_${primaryIntensity.toString().padStart(2,'0')}${secondaryIntensity.toString().padStart(2,'0')}${tertiaryIntensity.toString().padStart(2,'0')}`;
    
    // 導向結果頁
    router.push(`/dashboard/mind-magic/result/${personalityId}`);
  };

  if (currentQuestion >= phase1Questions.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">正在分析您的結果...</h2>
          <div className="animate-pulse">🔮</div>
        </div>
      </div>
    );
  }

  const question = phase1Questions[currentQuestion];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 進度顯示 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Phase 1 (演示版)</span>
            <span>{currentQuestion + 1}/{phase1Questions.length}</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
              style={{
                width: `${((currentQuestion + 1) / phase1Questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* 題目 */}
        <div className="space-y-8">
          <h2 className="text-2xl font-light leading-relaxed">
            {question.question}
          </h2>

          {/* 選項 */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-4 rounded-lg border border-gray-800 
                         hover:border-gray-600 hover:bg-gray-900/50 
                         transition-all duration-300 group"
              >
                <span className="text-lg font-light group-hover:text-blue-400 transition-colors">
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}