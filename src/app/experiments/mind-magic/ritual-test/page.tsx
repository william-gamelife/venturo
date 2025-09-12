'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';
import { questions, ARCHETYPES, type Question } from '@/data/mind-magic-questions';
import { venturoAuth } from '@/lib/venturo-auth';
import { VersionIndicator } from '@/components/VersionIndicator';
import { Play, Volume2, VolumeX, ArrowRight, ArrowLeft, Heart, Sparkles } from 'lucide-react';

// 測驗階段
const PHASES = {
  PREPARATION: 'preparation',
  PHASE_1: 'phase1', // Q1-18: 廣域掃描
  PHASE_2: 'phase2', // Q19-42: 深度挖掘  
  PHASE_3: 'phase3', // Q43-60: 陰影整合
  AFTERCARE: 'aftercare', // 二次引導
  COMPLETED: 'completed'
};

// 音景選項
const SOUNDSCAPES = {
  rain: { name: '雨聲', icon: '🌧️' },
  wood: { name: '木質', icon: '🌲' },
  white: { name: '白噪音', icon: '🌊' }
};

// 體感選項
const BODY_STATES = {
  calm: { name: '平靜', icon: '😌', color: 'text-blue-500' },
  tense: { name: '緊繃', icon: '😰', color: 'text-red-500' },
  sad: { name: '悲傷', icon: '😢', color: 'text-gray-500' },
  serene: { name: '寧靜', icon: '🕊️', color: 'text-green-500' }
};

// 過門詩句庫
const TRANSITION_POEMS = [
  "月光在你的背後，替你保管尚未說出的話。",
  "有些答案不是被想出來的，是在沉默裡被聽見的。",
  "在問題與答案之間，住著一個更真實的你。",
  "每一次停頓，都是靈魂在深呼吸。",
  "你不需要完美，你只需要真實。",
  "內心的聲音，比任何建議都要珍貴。",
  "深度不在於速度，而在於誠實。",
  "每個選擇都在訴說著你是誰。",
  "智慧不是知道所有答案，而是問對問題。",
  "真實比正確更重要。"
];

// 開場白和過門語
const RITUAL_TEXTS = {
  opening: [
    "這不是考試，這是一場召喚。",
    "在開始之前，請為自己點亮一盞很小的燈。"
  ],
  microBreak: [
    "很好。請給自己三口呼吸。",
    "第一口給身體，第二口給情緒，第三口給還沒說出口的那個名字。"
  ],
  ending: [
    "接下來，你會看見三道在你身上最亮的光，",
    "以及兩處仍在學會溫柔的影子。"
  ]
};

// Phase 2 場景描述（針對不同軸線的引導）
const PHASE2_SCENARIOS = [
  "你站在十字路口，眾人的目光聚焦於你。",
  "月圓之夜，有人在遠方等待你的答案。",
  "畫布空白，但你的手已經開始顫動。",
  "古老的天秤出現在你面前。",
  "風暴將至，但遠方有光在召喚。",
  "熱鬧的廣場上，你發現自己站在陰影中。",
  "金色的果實垂手可得。",
  "家的燈火在黑夜中閃爍不定。",
  "戰鼓響起，但你的心跳得更響。",
  "鏡子中的自己，正在對你說話。"
];

interface TestResult {
  [key: string]: number;
}

interface AftercareData {
  touchingPhrase?: string;
  bodyLocation?: string;
  ritual?: string;
}

export default function RitualMindMagicTestPage() {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(PHASES.PREPARATION);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [selectedSoundscape, setSelectedSoundscape] = useState<string | null>(null);
  const [permissionGiven, setPermissionGiven] = useState(false);
  const [bodyStates, setBodyStates] = useState<{ [key: number]: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [showMicroBreak, setShowMicroBreak] = useState(false);
  const [currentPoem, setCurrentPoem] = useState('');
  const [aftercareData, setAftercareData] = useState<AftercareData>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const breathingTimer = useRef<NodeJS.Timeout | null>(null);

  // 檢查用戶認證
  useEffect(() => {
    venturoAuth.getCurrentUser().then(user => {
      if (!user) {
        router.push('/');
        return;
      }
    }).catch(() => {
      router.push('/');
    });
  }, [router]);

  // 呼吸動畫控制
  useEffect(() => {
    if (currentPhase === PHASES.PREPARATION || currentPhase === PHASES.AFTERCARE) {
      const updateBreathing = () => {
        setBreathingPhase(current => {
          const durations = { in: 3000, hold: 4000, out: 5000 };
          const nextPhase = current === 'in' ? 'hold' : current === 'hold' ? 'out' : 'in';
          
          if (breathingTimer.current) {
            clearTimeout(breathingTimer.current);
          }
          
          breathingTimer.current = setTimeout(updateBreathing, durations[nextPhase]);
          return nextPhase;
        });
      };
      
      const initialDuration = breathingPhase === 'in' ? 3000 : breathingPhase === 'hold' ? 4000 : 5000;
      breathingTimer.current = setTimeout(updateBreathing, initialDuration);
    }

    return () => {
      if (breathingTimer.current) {
        clearTimeout(breathingTimer.current);
      }
    };
  }, [currentPhase, breathingPhase]);

  // 音景控制
  const toggleSoundscape = (soundKey: string) => {
    if (selectedSoundscape === soundKey && isPlaying) {
      setIsPlaying(false);
    } else {
      setSelectedSoundscape(soundKey);
      setIsPlaying(true);
      console.log(`Playing ${soundKey} soundscape`);
    }
  };

  // 開始測驗
  const startTest = () => {
    if (permissionGiven) {
      setCurrentPhase(PHASES.PHASE_1);
      setCurrentQuestion(0);
    }
  };

  // 回答問題
  const handleAnswer = (optionIndex: number) => {
    const newAnswers = { ...answers, [currentQuestion]: optionIndex };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        const nextQuestion = currentQuestion + 1;
        
        // 檢查是否需要微休息（每6題一次，限Phase 1）
        if (nextQuestion % 6 === 0 && nextQuestion <= 18) {
          showMicroBreakScreen();
        } else {
          setCurrentQuestion(nextQuestion);
          updatePhase(nextQuestion);
        }
      } else {
        setCurrentPhase(PHASES.AFTERCARE);
      }
    }, 500);
  };

  // 更新階段
  const updatePhase = (questionIndex: number) => {
    if (questionIndex < 18) {
      setCurrentPhase(PHASES.PHASE_1);
    } else if (questionIndex < 42) {
      setCurrentPhase(PHASES.PHASE_2);
    } else {
      setCurrentPhase(PHASES.PHASE_3);
    }
  };

  // 顯示微休息
  const showMicroBreakScreen = () => {
    const randomPoem = TRANSITION_POEMS[Math.floor(Math.random() * TRANSITION_POEMS.length)];
    setCurrentPoem(randomPoem);
    setShowMicroBreak(true);
  };

  // 繼續測驗
  const continueAfterBreak = (bodyState?: string) => {
    if (bodyState) {
      setBodyStates(prev => ({ ...prev, [currentQuestion]: bodyState }));
    }
    setShowMicroBreak(false);
    setCurrentQuestion(currentQuestion + 1);
    updatePhase(currentQuestion + 1);
  };

  // 計算結果
  const calculateResult = (): TestResult => {
    const scores: TestResult = {};
    
    Object.values(ARCHETYPES).forEach(archetype => {
      scores[archetype] = 0;
    });

    questions.forEach((question, questionIndex) => {
      const answerIndex = answers[questionIndex];
      if (answerIndex !== undefined) {
        const selectedOption = question.options[answerIndex];
        Object.entries(selectedOption.archetypes).forEach(([archetype, score]) => {
          scores[archetype] = (scores[archetype] || 0) + score;
        });
      }
    });

    return scores;
  };

  // 完成二次引導
  const completeAftercare = async () => {
    const result = calculateResult();
    const user = await venturoAuth.getCurrentUser();
    const userId = user?.id || 'anonymous';
    
    localStorage.setItem(`mindMagicResult_${userId}`, JSON.stringify(result));
    localStorage.setItem(`mindMagicTestDate_${userId}`, new Date().toISOString());
    localStorage.setItem(`mindMagicAftercare_${userId}`, JSON.stringify(aftercareData));
    
    setIsCompleted(true);
    
    setTimeout(() => {
      router.push('/dashboard/mind-magic/results');
    }, 2000);
  };

  // 獲取當前問題
  const getCurrentQuestion = (): Question => {
    return questions[currentQuestion] || questions[0];
  };

  // 獲取Phase描述
  const getPhaseDescription = () => {
    switch (currentPhase) {
      case PHASES.PHASE_1:
        return "廣域掃描 • 探索你的能量傾向";
      case PHASES.PHASE_2:
        return "深度挖掘 • 觸及內心深處";
      case PHASES.PHASE_3:
        return "陰影整合 • 面對最真實的自己";
      default:
        return "";
    }
  };

  // 獲取Phase 2的場景描述
  const getPhase2Scenario = (questionIndex: number) => {
    const scenarioIndex = (questionIndex - 18) % PHASE2_SCENARIOS.length;
    return PHASE2_SCENARIOS[scenarioIndex];
  };

  // 準備階段渲染
  const renderPreparation = () => (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        {/* 呼吸環 */}
        <div className="mb-8">
          <div className={`w-32 h-32 mx-auto rounded-full border-2 border-white/30 flex items-center justify-center transition-all duration-1000 ${
            breathingPhase === 'in' ? 'scale-110 border-white/60' :
            breathingPhase === 'hold' ? 'scale-110 border-white/60' :
            'scale-90 border-white/20'
          }`}>
            <div className={`w-20 h-20 rounded-full border border-white/50 flex items-center justify-center transition-all duration-1000 ${
              breathingPhase === 'in' ? 'scale-110 border-white/80' :
              breathingPhase === 'hold' ? 'scale-110 border-white/80' :
              'scale-90 border-white/30'
            }`}>
              <Sparkles className="w-8 h-8 text-white/70" />
            </div>
          </div>
        </div>

        {/* 開場文案 */}
        <div className="space-y-6 mb-12">
          <p className="text-xl leading-relaxed opacity-90">
            {RITUAL_TEXTS.opening[0]}
          </p>
          <p className="text-lg leading-relaxed opacity-80">
            {RITUAL_TEXTS.opening[1]}
          </p>
        </div>

        {/* 環境準備 */}
        <div className="mb-8">
          <h3 className="text-lg mb-4 opacity-90">為自己創造神聖的空間</h3>
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <div className="text-3xl mb-4">🎵</div>
            <p className="text-sm opacity-80 mb-4">選擇你的專屬音景，陪伴這次心靈旅程</p>
            
            {/* 音景選項 */}
            <div className="flex justify-center gap-4 mb-4">
              {Object.entries(SOUNDSCAPES).map(([key, soundscape]) => (
                <button
                  key={key}
                  onClick={() => toggleSoundscape(key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    selectedSoundscape === key && isPlaying
                      ? 'border-white/60 bg-white/10 text-white'
                      : 'border-white/20 hover:border-white/40 text-white/70'
                  }`}
                >
                  <div className="text-xl">{soundscape.icon}</div>
                  <span className="text-xs">{soundscape.name}</span>
                  {selectedSoundscape === key && isPlaying && (
                    <Volume2 className="w-3 h-3" />
                  )}
                  {selectedSoundscape === key && !isPlaying && (
                    <VolumeX className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
            
            <p className="text-xs opacity-60">或者，保持安靜也是很好的選擇</p>
          </div>
        </div>

        {/* 意圖設定 */}
        <div className="mb-8">
          <div className="space-y-4">
            <label className="flex items-center justify-center gap-3 text-base cursor-pointer">
              <input
                type="checkbox"
                checked={permissionGiven}
                onChange={(e) => setPermissionGiven(e.target.checked)}
                className="w-5 h-5 rounded border-white/30"
              />
              <span className="opacity-90">
                我允許自己在12分鐘內，暫時把世界放在門外。
              </span>
            </label>
            <p className="text-sm opacity-60 text-center max-w-md mx-auto">
              這個儀式需要你的專注與誠實，請確保有充足的時間完成。
            </p>
          </div>
        </div>

        {/* 開始按鈕 */}
        <button
          onClick={startTest}
          disabled={!permissionGiven}
          className={`px-8 py-3 rounded-lg text-lg font-medium transition-all ${
            permissionGiven
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
        >
          <Play className="w-5 h-5 inline mr-2" />
          開始儀式
        </button>
      </div>
    </div>
  );

  // 問題階段渲染
  const renderQuestion = () => {
    const question = getCurrentQuestion();
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* 進度條 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-70">題目 {currentQuestion + 1} / {questions.length}</span>
              <span className="text-sm opacity-70">{Math.round(progress)}% 完成</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Phase描述 */}
          <div className="text-center mb-4">
            <p className="text-sm opacity-60">{getPhaseDescription()}</p>
          </div>

          {/* Phase 2 場景描述 */}
          {currentPhase === PHASES.PHASE_2 && (
            <div className="text-center mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm opacity-80 italic">{getPhase2Scenario(currentQuestion)}</p>
            </div>
          )}

          {/* 問題 */}
          <div className="text-center mb-12">
            <h2 className={`leading-relaxed font-light ${
              currentPhase === PHASES.PHASE_3 ? 'text-xl' : 'text-2xl'
            }`}>
              {question.text}
            </h2>
          </div>

          {/* 選項 */}
          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full p-6 text-left bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-sm group-hover:border-white/60 transition-colors">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <p className="text-lg">{option.text}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 導航 */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-white/30 rounded-lg hover:border-white/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              上一題
            </button>

            {/* 進度提示 */}
            <div className="text-sm opacity-50">
              {currentPhase === PHASES.PHASE_1 && "第一階段 • 廣域掃描"}
              {currentPhase === PHASES.PHASE_2 && "第二階段 • 深度挖掘"}
              {currentPhase === PHASES.PHASE_3 && "最後階段 • 陰影整合"}
            </div>

            <div className="opacity-0">佔位</div>
          </div>
        </div>
      </div>
    );
  };

  // 二次引導渲染
  const renderAftercare = () => (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-12">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center transition-all duration-1000 ${
            breathingPhase === 'in' ? 'scale-110' :
            breathingPhase === 'hold' ? 'scale-110' :
            'scale-95'
          }`}>
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl mb-4">深呼吸，讓自己沉澱</h2>
          <p className="opacity-80">在看見結果之前，我們先來照顧一下剛剛被觸動的心</p>
        </div>

        <div className="space-y-8">
          {/* 第一步：命名 */}
          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-lg mb-4">剛剛最刺到你的一句是？</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setAftercareData(prev => ({...prev, touchingPhrase: '權威與決斷力'}))}
                className="w-full p-3 text-left border border-white/20 rounded hover:border-white/40 transition-colors"
              >
                「權威與決斷力」
              </button>
              <button 
                onClick={() => setAftercareData(prev => ({...prev, touchingPhrase: '做真實的自己'}))}
                className="w-full p-3 text-left border border-white/20 rounded hover:border-white/40 transition-colors"
              >
                「做真實的自己」
              </button>
              <input 
                type="text" 
                placeholder="或者，寫下你自己的感受..."
                value={aftercareData.touchingPhrase || ''}
                onChange={(e) => setAftercareData(prev => ({...prev, touchingPhrase: e.target.value}))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
              />
            </div>
          </div>

          {/* 第二步：位置 */}
          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-lg mb-4">那句話現在停在你的身體哪裡？</h3>
            <div className="grid grid-cols-3 gap-3">
              {['胸口', '胃部', '喉嚨', '眼部', '肩膀', '其他'].map(part => (
                <button 
                  key={part} 
                  onClick={() => setAftercareData(prev => ({...prev, bodyLocation: part}))}
                  className={`p-3 border rounded transition-colors ${
                    aftercareData.bodyLocation === part 
                      ? 'border-white/60 bg-white/10' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>

          {/* 第三步：行動 */}
          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-lg mb-4">今晚你願意為它做一個很小的姿勢嗎？</h3>
            <div className="space-y-2">
              {[
                '把那句話手抄在紙上',
                '給自己泡一杯熱飲',
                '5分鐘安靜坐著'
              ].map(ritual => (
                <button 
                  key={ritual}
                  onClick={() => setAftercareData(prev => ({...prev, ritual}))}
                  className={`w-full p-3 text-left border rounded transition-colors ${
                    aftercareData.ritual === ritual 
                      ? 'border-white/60 bg-white/10' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {ritual}
                </button>
              ))}
              <input 
                type="text" 
                placeholder="自訂一個1分鐘儀式..."
                value={aftercareData.ritual && !['把那句話手抄在紙上', '給自己泡一杯熱飲', '5分鐘安靜坐著'].includes(aftercareData.ritual) ? aftercareData.ritual : ''}
                onChange={(e) => setAftercareData(prev => ({...prev, ritual: e.target.value}))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
              />
            </div>
          </div>

          <button 
            onClick={completeAftercare}
            disabled={!aftercareData.touchingPhrase || !aftercareData.bodyLocation || !aftercareData.ritual}
            className={`px-8 py-3 rounded-lg text-lg font-medium transition-all ${
              aftercareData.touchingPhrase && aftercareData.bodyLocation && aftercareData.ritual
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                : 'bg-white/20 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-5 h-5 inline mr-2" />
            看見我的原型
          </button>
        </div>
      </div>
    </div>
  );

  // 完成畫面渲染
  const renderCompleted = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black text-white flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center animate-pulse">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl mb-4">儀式完成</h2>
          <p className="text-lg opacity-80">{RITUAL_TEXTS.ending[0]}</p>
          <p className="text-lg opacity-80">{RITUAL_TEXTS.ending[1]}</p>
        </div>
        <div className="loading-bar w-64 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
        </div>
      </div>
    </div>
  );

  // 微休息覆蓋層
  const renderMicroBreakOverlay = () => {
    if (!showMicroBreak) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-purple-900/90 to-black/90 backdrop-blur-lg rounded-lg p-8 text-white text-center max-w-2xl mx-4">
          <div className="mb-8">
            <p className="text-lg mb-6 opacity-90">{RITUAL_TEXTS.microBreak[0]}</p>
            <p className="text-base opacity-80">{RITUAL_TEXTS.microBreak[1]}</p>
          </div>
          
          <div className="mb-8">
            <p className="text-sm opacity-70 mb-6 italic">
              {currentPoem}
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg mb-4">現在你的感受是？</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(BODY_STATES).map(([key, state]) => (
                <button
                  key={key}
                  onClick={() => continueAfterBreak(key)}
                  className={`p-4 rounded-lg border transition-all ${state.color} border-current hover:bg-current/10`}
                >
                  <div className="text-2xl mb-2">{state.icon}</div>
                  <div>{state.name}</div>
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => continueAfterBreak()}
            className="px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            繼續
          </button>
        </div>
      </div>
    );
  };

  // 主要渲染控制
  const renderContent = () => {
    switch (currentPhase) {
      case PHASES.PREPARATION:
        return renderPreparation();
      case PHASES.PHASE_1:
      case PHASES.PHASE_2:
      case PHASES.PHASE_3:
        return renderQuestion();
      case PHASES.AFTERCARE:
        return renderAftercare();
      case PHASES.COMPLETED:
        return renderCompleted();
      default:
        return renderPreparation();
    }
  };

  return (
    <>
      {currentPhase === PHASES.PREPARATION || currentPhase === PHASES.AFTERCARE || currentPhase === PHASES.COMPLETED ? (
        renderContent()
      ) : (
        <ModuleLayout
          header={{
            icon: Icons.mindMagic,
            title: "心靈魔法儀式",
            subtitle: getPhaseDescription()
          }}
        >
          {renderContent()}
        </ModuleLayout>
      )}
      {renderMicroBreakOverlay()}
      
      {/* 只在非全屏模式顯示版本指示器 */}
      {!(currentPhase === PHASES.PREPARATION || currentPhase === PHASES.AFTERCARE || currentPhase === PHASES.COMPLETED) && (
        <VersionIndicator 
          page="心靈魔法儀式"
          authSystem="venturoAuth" 
          version="2.0"
          status="working"
        />
      )}
    </>
  );
}