'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Icons } from '@/components/icons';
import { questions, ARCHETYPES, type Question } from '@/data/mind-magic-questions';
import { venturoAuth } from '@/lib/venturo-auth';

interface TestResult {
  [key: string]: number;
}

export default function MindMagicTestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);

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

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = { ...answers, [currentQuestion]: optionIndex };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // 測驗完成，計算結果
      const result = calculateResult(newAnswers);
      const user = await venturoAuth.getCurrentUser();
      const userId = user?.id || 'anonymous';
      
      // 使用用戶ID作為key存儲結果
      localStorage.setItem(`mindMagicResult_${userId}`, JSON.stringify(result));
      localStorage.setItem(`mindMagicTestDate_${userId}`, new Date().toISOString());
      setIsCompleted(true);
      
      setTimeout(() => {
        router.push('/dashboard/mind-magic/results');
      }, 2000);
    }
  };

  const calculateResult = (userAnswers: { [key: number]: number }): TestResult => {
    const scores: TestResult = {};
    
    // 初始化所有原型分數
    Object.values(ARCHETYPES).forEach(archetype => {
      scores[archetype] = 0;
    });

    // 根據答案計算分數
    questions.forEach((question, questionIndex) => {
      const answerIndex = userAnswers[questionIndex];
      if (answerIndex !== undefined) {
        const selectedOption = question.options[answerIndex];
        Object.entries(selectedOption.archetypes).forEach(([archetype, score]) => {
          scores[archetype] = (scores[archetype] || 0) + score;
        });
      }
    });

    return scores;
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToNext = () => {
    if (answers[currentQuestion] !== undefined && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  if (isCompleted) {
    return (
      <ModuleLayout
        header={{
          icon: Icons.mindMagic,
          title: "測驗完成",
          subtitle: "正在分析你的結果..."
        }}
      >
        <div className="completion-screen">
          <div className="completion-content">
            <div className="magic-circle">
              <div className="inner-circle">
                <span className="completion-icon">✨</span>
              </div>
            </div>
            <h2>測驗已完成！</h2>
            <p>正在為你分析專屬的人格原型...</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .completion-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
            text-align: center;
          }
          
          .completion-content h2 {
            font-size: 1.8rem;
            margin: 1.5rem 0 0.5rem;
            color: #c9a961;
          }
          
          .completion-content p {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 2rem;
          }
          
          .magic-circle {
            width: 120px;
            height: 120px;
            border: 3px solid rgba(201, 169, 97, 0.3);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
            animation: rotate 3s linear infinite;
          }
          
          .inner-circle {
            width: 80px;
            height: 80px;
            border: 2px solid rgba(201, 169, 97, 0.6);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: rotate-reverse 2s linear infinite;
          }
          
          .completion-icon {
            font-size: 2rem;
            animation: pulse 1.5s ease-in-out infinite;
          }
          
          .loading-bar {
            width: 200px;
            height: 4px;
            background: rgba(201, 169, 97, 0.2);
            border-radius: 2px;
            overflow: hidden;
            margin: 0 auto;
          }
          
          .loading-progress {
            width: 30%;
            height: 100%;
            background: linear-gradient(90deg, #c9a961, #d4b86a);
            border-radius: 2px;
            animation: loading 2s ease-in-out infinite;
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
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(300%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.mindMagic,
        title: `第 ${currentQuestion + 1} 題`,
        subtitle: `共 ${questions.length} 題 • ${Math.round(progress)}% 完成`,
        actions: (
          <div className="test-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )
      }}
    >
      <div className="test-container">
        <div className="question-section">
          <div className="question-number">
            題目 {currentQuestion + 1} / {questions.length}
          </div>
          <h2 className="question-text">{question.text}</h2>
        </div>

        <div className="options-section">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${answers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswer(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option.text}</span>
            </button>
          ))}
        </div>

        <div className="navigation-section">
          <button 
            className="nav-button prev"
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
          >
            上一題
          </button>
          
          <button 
            className="nav-button next"
            onClick={goToNext}
            disabled={answers[currentQuestion] === undefined}
          >
            {currentQuestion === questions.length - 1 ? '完成測驗' : '下一題'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .test-progress {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .progress-bar {
          width: 200px;
          height: 8px;
          background: rgba(201, 169, 97, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a961, #d4b86a);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .test-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 0;
        }
        
        .question-section {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .question-number {
          font-size: 0.9rem;
          color: #c9a961;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .question-text {
          font-size: 1.5rem;
          font-weight: 300;
          color: #2d3748;
          line-height: 1.5;
          margin: 0;
        }
        
        .options-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3rem;
        }
        
        .option-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border: 2px solid rgba(201, 169, 97, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }
        
        .option-button:hover {
          border-color: rgba(201, 169, 97, 0.5);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        .option-button.selected {
          border-color: #c9a961;
          background: rgba(201, 169, 97, 0.1);
        }
        
        .option-letter {
          width: 32px;
          height: 32px;
          background: rgba(201, 169, 97, 0.2);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 600;
          color: #c9a961;
          flex-shrink: 0;
        }
        
        .option-button.selected .option-letter {
          background: #c9a961;
          color: white;
        }
        
        .option-text {
          font-size: 1rem;
          color: #4a5568;
          line-height: 1.5;
        }
        
        .navigation-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-button {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .nav-button.prev {
          background: transparent;
          border: 2px solid rgba(201, 169, 97, 0.3);
          color: #c9a961;
        }
        
        .nav-button.prev:hover:not(:disabled) {
          border-color: #c9a961;
          background: rgba(201, 169, 97, 0.1);
        }
        
        .nav-button.next {
          background: #c9a961;
          border: 2px solid #c9a961;
          color: white;
        }
        
        .nav-button.next:hover:not(:disabled) {
          background: #b8976b;
          border-color: #b8976b;
        }
        
        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .test-container {
            padding: 1rem;
          }
          
          .question-text {
            font-size: 1.25rem;
          }
          
          .progress-bar {
            width: 150px;
          }
          
          .navigation-section {
            flex-direction: column;
            gap: 1rem;
          }
          
          .nav-button {
            width: 100%;
          }
        }
      `}</style>
    </ModuleLayout>
  );
}