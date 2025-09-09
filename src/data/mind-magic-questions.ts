// 心靈魔法 - 希臘神話十二原型測驗題目

export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    archetypes: { [key: string]: number }; // 每個回答對應的原型分數
  }[];
}

// 十二原型定義
export const ARCHETYPES = {
  ZEUS: 'zeus',        // 宙斯 - 統治者
  HERA: 'hera',        // 希拉 - 女王/妻子
  POSEIDON: 'poseidon', // 波塞頓 - 海王
  DEMETER: 'demeter',   // 得墨忒耳 - 母親
  ATHENA: 'athena',     // 雅典娜 - 智者
  APOLLO: 'apollo',     // 阿波羅 - 太陽神
  ARTEMIS: 'artemis',   // 阿爾忒彌斯 - 獨立女性
  ARES: 'ares',         // 阿瑞斯 - 戰士
  APHRODITE: 'aphrodite', // 阿芙羅黛蒂 - 愛情女神
  HEPHAESTUS: 'hephaestus', // 赫菲斯托斯 - 工匠
  HERMES: 'hermes',     // 赫耳墨斯 - 信使/商人
  DIONYSUS: 'dionysus'  // 狄俄尼索斯 - 狂歡者
} as const;

export const questions: Question[] = [
  // 第1-5題：領導與權威
  {
    id: 1,
    text: "當團隊需要做重要決定時，你通常會...",
    options: [
      {
        text: "主動承擔領導責任，做最終決定",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ATHENA]: 1 }
      },
      {
        text: "仔細分析各種選項後提出建議",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "傾聽每個人的想法後協調共識",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.DEMETER]: 1 }
      },
      {
        text: "等待別人做決定，然後配合執行",
        archetypes: { [ARCHETYPES.HERA]: 2, [ARCHETYPES.HEPHAESTUS]: 2 }
      }
    ]
  },
  {
    id: 2,
    text: "面對衝突時，你的第一反應是...",
    options: [
      {
        text: "直接面對，用權威解決問題",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 2 }
      },
      {
        text: "冷靜分析問題的根源",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "嘗試調解，尋找雙贏方案",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.DEMETER]: 1 }
      },
      {
        text: "暫時迴避，等情緒冷卻後再處理",
        archetypes: { [ARCHETYPES.ARTEMIS]: 2, [ARCHETYPES.HEPHAESTUS]: 2 }
      }
    ]
  },
  {
    id: 3,
    text: "在工作場合中，你最希望扮演什麼角色？",
    options: [
      {
        text: "決策者，制定方向與策略",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ATHENA]: 1 }
      },
      {
        text: "顧問，提供專業建議與分析",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "協調者，維持團隊和諧",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.DEMETER]: 2 }
      },
      {
        text: "執行者，專注完成具體任務",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.ARTEMIS]: 1 }
      }
    ]
  },
  {
    id: 4,
    text: "當你擁有權力時，你會...",
    options: [
      {
        text: "制定規則，確保秩序與效率",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "用智慧引導他人做正確選擇",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "創造環境讓每個人發揮潛能",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "保持低調，只在必要時才行使",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HEPHAESTUS]: 2 }
      }
    ]
  },
  {
    id: 5,
    text: "你認為一個好領導者最重要的特質是？",
    options: [
      {
        text: "權威與決斷力",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 1 }
      },
      {
        text: "智慧與遠見",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "同理心與包容力",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "獨立與自主性",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },

  // 第6-10題：人際關係與愛情
  {
    id: 6,
    text: "在感情關係中，你最重視什麼？",
    options: [
      {
        text: "忠誠與承諾",
        archetypes: { [ARCHETYPES.HERA]: 3, [ARCHETYPES.DEMETER]: 1 }
      },
      {
        text: "激情與浪漫",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      },
      {
        text: "精神層面的契合",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "個人空間與自由",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HERMES]: 1 }
      }
    ]
  },
  {
    id: 7,
    text: "你理想中的伴侶是什麼樣的？",
    options: [
      {
        text: "有權勢地位，能給你安全感",
        archetypes: { [ARCHETYPES.HERA]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "外表吸引人，充滿魅力",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "聰明有才華，能深度交流",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "獨立自主，不會束縛你",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 8,
    text: "當感情出現問題時，你會...",
    options: [
      {
        text: "堅持維護這段關係，努力修復",
        archetypes: { [ARCHETYPES.HERA]: 3, [ARCHETYPES.DEMETER]: 2 }
      },
      {
        text: "理性分析問題，尋找解決方案",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "勇敢面對，直接攤牌",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "果斷離開，不想浪費時間",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HERMES]: 1 }
      }
    ]
  },
  {
    id: 9,
    text: "你如何表達對別人的愛意？",
    options: [
      {
        text: "透過實際行動和照顧",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HEPHAESTUS]: 2 }
      },
      {
        text: "用言語和浪漫的舉動",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "分享智慧和深度對話",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "給予自由和獨立空間",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 10,
    text: "面對背叛或欺騙，你的反應是？",
    options: [
      {
        text: "感到憤怒，要求對方付出代價",
        archetypes: { [ARCHETYPES.HERA]: 3, [ARCHETYPES.ARES]: 2 }
      },
      {
        text: "冷靜分析，制定報復計劃",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.POSEIDON]: 1 }
      },
      {
        text: "直接對抗，立即解決",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "默默離開，不再回頭",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.APOLLO]: 1 }
      }
    ]
  },

  // 第11-15題：創造力與工作
  {
    id: 11,
    text: "你最享受什麼類型的工作？",
    options: [
      {
        text: "需要創造和設計的工作",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "需要溝通和說服的工作",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.APHRODITE]: 1 }
      },
      {
        text: "需要分析和策略的工作",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "需要獨立和自由的工作",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 12,
    text: "完成一項創作時，你最關心什麼？",
    options: [
      {
        text: "作品的完美和品質",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "作品能否打動人心",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DIONYSUS]: 2 }
      },
      {
        text: "作品的實用性和功能",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.DEMETER]: 1 }
      },
      {
        text: "作品是否體現自己的個性",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.APOLLO]: 1 }
      }
    ]
  },
  {
    id: 13,
    text: "工作中遇到困難時，你會？",
    options: [
      {
        text: "堅持不懈直到解決",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.ARES]: 1 }
      },
      {
        text: "尋找更聰明的解決方法",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERMES]: 2 }
      },
      {
        text: "向有經驗的人請教",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "重新考慮是否值得繼續",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 14,
    text: "你希望你的作品給人什麼感受？",
    options: [
      {
        text: "震撼和敬畏",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.POSEIDON]: 2 }
      },
      {
        text: "美麗和愉悅",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "智慧和啟發",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "真實和純粹",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HEPHAESTUS]: 1 }
      }
    ]
  },
  {
    id: 15,
    text: "在團隊合作中，你傾向於？",
    options: [
      {
        text: "負責整體規劃和協調",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ATHENA]: 1 }
      },
      {
        text: "專注於技術執行",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "負責對外溝通聯絡",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.APHRODITE]: 1 }
      },
      {
        text: "獨立完成自己的部分",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },

  // 第16-20題：性格與價值觀
  {
    id: 16,
    text: "你最不能容忍別人的什麼行為？",
    options: [
      {
        text: "背叛和不忠",
        archetypes: { [ARCHETYPES.HERA]: 3, [ARCHETYPES.ARES]: 2 }
      },
      {
        text: "愚蠢和無知",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "欺騙和虛假",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "冷漠和殘忍",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 1 }
      }
    ]
  },
  {
    id: 17,
    text: "你認為人生最重要的是什麼？",
    options: [
      {
        text: "權力和成就",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "愛情和關係",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DEMETER]: 2 }
      },
      {
        text: "智慧和真理",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "自由和獨立",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 2 }
      }
    ]
  },
  {
    id: 18,
    text: "面對誘惑時，你會？",
    options: [
      {
        text: "理性分析利弊後決定",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "跟隨內心的感受",
        archetypes: { [ARCHETYPES.DIONYSUS]: 3, [ARCHETYPES.APHRODITE]: 2 }
      },
      {
        text: "堅持原則，拒絕誘惑",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "適度享受，但有底線",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.APOLLO]: 1 }
      }
    ]
  },
  {
    id: 19,
    text: "你如何看待規則和傳統？",
    options: [
      {
        text: "必須遵守，維護秩序",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "可以改進，但要謹慎",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "應該打破，追求創新",
        archetypes: { [ARCHETYPES.POSEIDON]: 3, [ARCHETYPES.DIONYSUS]: 2 }
      },
      {
        text: "不適合的就應該拋棄",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HERMES]: 1 }
      }
    ]
  },
  {
    id: 20,
    text: "在道德困境中，你會？",
    options: [
      {
        text: "遵循法律和社會規範",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "依據智慧和經驗判斷",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "跟隨內心的道德感",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DEMETER]: 2 }
      },
      {
        text: "選擇對大多數人有利的",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.ATHENA]: 1 }
      }
    ]
  },

  // 第21-25題：冒險與挑戰
  {
    id: 21,
    text: "面對未知的挑戰，你的態度是？",
    options: [
      {
        text: "興奮期待，躍躍欲試",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.POSEIDON]: 2 }
      },
      {
        text: "謹慎評估，制定計劃",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "觀望等待，看情況發展",
        archetypes: { [ARCHETYPES.HERMES]: 2, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "能避則避，維持現狀",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HEPHAESTUS]: 1 }
      }
    ]
  },
  {
    id: 22,
    text: "你喜歡什麼樣的冒險？",
    options: [
      {
        text: "刺激的極限運動",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.DIONYSUS]: 2 }
      },
      {
        text: "探索未知的地方",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 2 }
      },
      {
        text: "智力上的挑戰",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "創造性的實驗",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.HERMES]: 1 }
      }
    ]
  },
  {
    id: 23,
    text: "當別人質疑你的能力時，你會？",
    options: [
      {
        text: "立即證明他們錯了",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.ZEUS]: 2 }
      },
      {
        text: "冷靜展示你的實力",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "用成果說話",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.ARTEMIS]: 2 }
      },
      {
        text: "不需要向他們證明什麼",
        archetypes: { [ARCHETYPES.POSEIDON]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      }
    ]
  },
  {
    id: 24,
    text: "你如何處理失敗？",
    options: [
      {
        text: "分析原因，重新來過",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HEPHAESTUS]: 2 }
      },
      {
        text: "接受現實，尋找新方向",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "感到沮喪，需要時間恢復",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "憤怒不甘，想要報復",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 25,
    text: "你認為勇氣是什麼？",
    options: [
      {
        text: "面對危險時不退縮",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "堅持正義和真理",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "保護你所愛的人",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "做真實的自己",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DIONYSUS]: 2 }
      }
    ]
  },

  // 第26-30題：社交與溝通
  {
    id: 26,
    text: "在聚會中，你通常是？",
    options: [
      {
        text: "聚會的焦點，吸引眾人",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.DIONYSUS]: 2 }
      },
      {
        text: "活躍的參與者，到處聊天",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.APHRODITE]: 2 }
      },
      {
        text: "安靜的觀察者，偶爾發言",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "早早離開，不太參與",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HEPHAESTUS]: 2 }
      }
    ]
  },
  {
    id: 27,
    text: "你如何與陌生人建立關係？",
    options: [
      {
        text: "展現權威和能力",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 1 }
      },
      {
        text: "展現魅力和吸引力",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      },
      {
        text: "展現智慧和見解",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "保持距離，慢慢了解",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 28,
    text: "當朋友需要建議時，你會？",
    options: [
      {
        text: "直接告訴他們該怎麼做",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 1 }
      },
      {
        text: "分析情況，提供理性建議",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "傾聽他們的心聲，給予安慰",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "分享類似經驗，讓他們自己決定",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.ARTEMIS]: 1 }
      }
    ]
  },
  {
    id: 29,
    text: "你喜歡與什麼樣的人交朋友？",
    options: [
      {
        text: "有影響力和地位的人",
        archetypes: { [ARCHETYPES.HERA]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "有趣風趣，充滿活力的人",
        archetypes: { [ARCHETYPES.DIONYSUS]: 3, [ARCHETYPES.HERMES]: 2 }
      },
      {
        text: "聰明有深度的人",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "真誠可靠的人",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DEMETER]: 2 }
      }
    ]
  },
  {
    id: 30,
    text: "處理人際衝突時，你的策略是？",
    options: [
      {
        text: "用權威壓制衝突",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "用智慧化解矛盾",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "正面對抗，解決問題",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.POSEIDON]: 1 }
      },
      {
        text: "避免衝突，維持和平",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APOLLO]: 1 }
      }
    ]
  },

  // 第31-35題：慾望與享樂
  {
    id: 31,
    text: "你如何看待物質享受？",
    options: [
      {
        text: "享受是人生的重要組成",
        archetypes: { [ARCHETYPES.DIONYSUS]: 3, [ARCHETYPES.APHRODITE]: 2 }
      },
      {
        text: "適度享受，不可過度",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.ATHENA]: 1 }
      },
      {
        text: "簡樸生活，專注精神層面",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DEMETER]: 1 }
      },
      {
        text: "享受高品質的東西",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 2 }
      }
    ]
  },
  {
    id: 32,
    text: "在慶祝活動中，你會？",
    options: [
      {
        text: "盡情狂歡，享受快樂",
        archetypes: { [ARCHETYPES.DIONYSUS]: 3, [ARCHETYPES.APHRODITE]: 1 }
      },
      {
        text: "適度參與，維持形象",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "負責組織，確保順利",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "早點離開，不太習慣",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HEPHAESTUS]: 2 }
      }
    ]
  },
  {
    id: 33,
    text: "面對美食誘惑時，你會？",
    options: [
      {
        text: "盡情享受，滿足味蕾",
        archetypes: { [ARCHETYPES.DIONYSUS]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "品嚐美味，但有節制",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.APHRODITE]: 1 }
      },
      {
        text: "注重營養，健康第一",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.ATHENA]: 1 }
      },
      {
        text: "不太在意食物",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HEPHAESTUS]: 2 }
      }
    ]
  },
  {
    id: 34,
    text: "你對奢華生活的態度是？",
    options: [
      {
        text: "值得追求，代表成功",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "偶爾享受，增添樂趣",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.APHRODITE]: 1 }
      },
      {
        text: "沒有必要，浪費資源",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DEMETER]: 2 }
      },
      {
        text: "不感興趣，專注其他事物",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HEPHAESTUS]: 1 }
      }
    ]
  },
  {
    id: 35,
    text: "休閒時間你喜歡做什麼？",
    options: [
      {
        text: "參加派對和社交活動",
        archetypes: { [ARCHETYPES.DIONYSUS]: 3, [ARCHETYPES.HERMES]: 2 }
      },
      {
        text: "閱讀學習，充實自己",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "親近自然，戶外活動",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      },
      {
        text: "創作或手工藝",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.APOLLO]: 1 }
      }
    ]
  },

  // 第36-40題：家庭與責任
  {
    id: 36,
    text: "你對家庭的看法是？",
    options: [
      {
        text: "家庭是最重要的，必須維護",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "家庭重要，但個人發展也很重要",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.ATHENA]: 1 }
      },
      {
        text: "家庭會限制個人自由",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 2 }
      },
      {
        text: "家庭是責任和義務",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HEPHAESTUS]: 1 }
      }
    ]
  },
  {
    id: 37,
    text: "面對家庭責任時，你會？",
    options: [
      {
        text: "全心全意承擔責任",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "盡力平衡責任和個人需求",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.ATHENA]: 1 }
      },
      {
        text: "履行義務，但保持獨立",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "以權威方式管理家庭",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      }
    ]
  },
  {
    id: 38,
    text: "你希望給孩子什麼樣的教育？",
    options: [
      {
        text: "溫暖關愛，讓他們快樂成長",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 1 }
      },
      {
        text: "智慧教育，培養獨立思考",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "嚴格管教，建立權威",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "自由發展，不過多干涉",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 39,
    text: "處理家庭衝突時，你的角色是？",
    options: [
      {
        text: "和事佬，努力調解矛盾",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "仲裁者，公正解決問題",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.ZEUS]: 1 }
      },
      {
        text: "權威者，制定規則",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "旁觀者，讓他們自己解決",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.APOLLO]: 1 }
      }
    ]
  },
  {
    id: 40,
    text: "你認為婚姻中最重要的是？",
    options: [
      {
        text: "忠誠和承諾",
        archetypes: { [ARCHETYPES.HERA]: 3, [ARCHETYPES.DEMETER]: 1 }
      },
      {
        text: "理解和溝通",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERMES]: 2 }
      },
      {
        text: "激情和浪漫",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      },
      {
        text: "互相尊重和獨立",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.APOLLO]: 2 }
      }
    ]
  },

  // 第41-45題：競爭與成功
  {
    id: 41,
    text: "面對競爭時，你的策略是？",
    options: [
      {
        text: "正面對決，用實力取勝",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.ZEUS]: 2 }
      },
      {
        text: "智取，用策略獲勝",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "專注自己，不在意競爭",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.ARTEMIS]: 1 }
      },
      {
        text: "避免競爭，尋找合作",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 1 }
      }
    ]
  },
  {
    id: 42,
    text: "你定義成功的標準是？",
    options: [
      {
        text: "權力和地位",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "智慧和成就",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "自由和獨立",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 2 }
      },
      {
        text: "愛和被愛",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DEMETER]: 2 }
      }
    ]
  },
  {
    id: 43,
    text: "當你成功時，你會？",
    options: [
      {
        text: "享受勝利，展示成就",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 2 }
      },
      {
        text: "保持低調，繼續努力",
        archetypes: { [ARCHETYPES.APOLLO]: 3, [ARCHETYPES.HEPHAESTUS]: 1 }
      },
      {
        text: "分享喜悅，感謝支持",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "慶祝一下，然後尋找新目標",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      }
    ]
  },
  {
    id: 44,
    text: "你最不能忍受的失敗是？",
    options: [
      {
        text: "在權力鬥爭中失敗",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "因為愚蠢錯誤而失敗",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "在戰鬥中被擊敗",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.POSEIDON]: 1 }
      },
      {
        text: "失去所愛的人",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 2 }
      }
    ]
  },
  {
    id: 45,
    text: "你認為失敗的原因通常是？",
    options: [
      {
        text: "準備不足或策略錯誤",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "運氣不好或時機不對",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      },
      {
        text: "敵人太強或被人背叛",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "沒有足夠的支持",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },

  // 第46-50題：情緒與內在
  {
    id: 46,
    text: "你最常體驗到的情緒是？",
    options: [
      {
        text: "自信和權威感",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "好奇和求知慾",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERMES]: 1 }
      },
      {
        text: "平靜和獨立感",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "溫暖和關愛",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 1 }
      }
    ]
  },
  {
    id: 47,
    text: "當你生氣時，你會？",
    options: [
      {
        text: "大發雷霆，展現怒火",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 2 }
      },
      {
        text: "冷靜計劃報復",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "直接對抗，解決問題",
        archetypes: { [ARCHETYPES.ARES]: 3, [ARCHETYPES.POSEIDON]: 1 }
      },
      {
        text: "保持距離，冷處理",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.APOLLO]: 1 }
      }
    ]
  },
  {
    id: 48,
    text: "面對悲傷時，你傾向於？",
    options: [
      {
        text: "獨自承受，不願意讓人看見",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 2 }
      },
      {
        text: "尋求理性分析和解決方案",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "需要他人的陪伴和安慰",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 1 }
      },
      {
        text: "用創作或工作來轉移注意力",
        archetypes: { [ARCHETYPES.HEPHAESTUS]: 3, [ARCHETYPES.HERMES]: 1 }
      }
    ]
  },
  {
    id: 49,
    text: "你最害怕什麼？",
    options: [
      {
        text: "失去權力和控制",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 2 }
      },
      {
        text: "變得愚蠢或無知",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "失去自由和獨立",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 2 }
      },
      {
        text: "失去所愛的人",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 2 }
      }
    ]
  },
  {
    id: 50,
    text: "你如何處理內心的矛盾？",
    options: [
      {
        text: "用理性分析找出最佳選擇",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "跟隨內心的直覺",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DIONYSUS]: 2 }
      },
      {
        text: "尋求權威或傳統的指導",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "與信任的人討論",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.HERMES]: 2 }
      }
    ]
  },

  // 第51-55題：靈性與哲學
  {
    id: 51,
    text: "你對生命意義的看法是？",
    options: [
      {
        text: "建立偉大的成就和影響力",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "追求真理和智慧",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "享受生活的美好",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DIONYSUS]: 2 }
      },
      {
        text: "找到內在的平靜",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DEMETER]: 1 }
      }
    ]
  },
  {
    id: 52,
    text: "你相信命運嗎？",
    options: [
      {
        text: "命運由自己掌握",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 2 }
      },
      {
        text: "命運和努力都很重要",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "順其自然，接受安排",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.ARTEMIS]: 1 }
      },
      {
        text: "命運是可以改變的",
        archetypes: { [ARCHETYPES.HERMES]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      }
    ]
  },
  {
    id: 53,
    text: "面對死亡的想法，你會？",
    options: [
      {
        text: "希望留下偉大的遺產",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "理性思考生死的意義",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "珍惜當下，享受每一天",
        archetypes: { [ARCHETYPES.DIONYSUS]: 3, [ARCHETYPES.APHRODITE]: 2 }
      },
      {
        text: "平靜接受，這是自然規律",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DEMETER]: 2 }
      }
    ]
  },
  {
    id: 54,
    text: "你認為什麼是真正的智慧？",
    options: [
      {
        text: "了解如何運用權力",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "掌握知識和真理",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "理解人性和情感",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DEMETER]: 2 }
      },
      {
        text: "認識自己的本性",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      }
    ]
  },
  {
    id: 55,
    text: "你覺得什麼最能代表你？",
    options: [
      {
        text: "一座雄偉的山峰",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      },
      {
        text: "一本充滿智慧的書",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "一朵美麗的花",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DEMETER]: 1 }
      },
      {
        text: "一片寧靜的森林",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DEMETER]: 1 }
      }
    ]
  },

  // 第56-60題：綜合性格特質
  {
    id: 56,
    text: "如果你是一個神祇，你會統治什麼領域？",
    options: [
      {
        text: "權力和秩序",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "智慧和戰略",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "愛情和美麗",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      },
      {
        text: "自然和自由",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 57,
    text: "你最希望別人如何記住你？",
    options: [
      {
        text: "偉大的領導者",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 1 }
      },
      {
        text: "智慧的導師",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 2 }
      },
      {
        text: "溫暖的親人",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 1 }
      },
      {
        text: "真實的自己",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DIONYSUS]: 2 }
      }
    ]
  },
  {
    id: 58,
    text: "在困難時期，你最需要什麼？",
    options: [
      {
        text: "權力和資源",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.HERA]: 1 }
      },
      {
        text: "智慧和計劃",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "愛和支持",
        archetypes: { [ARCHETYPES.DEMETER]: 3, [ARCHETYPES.APHRODITE]: 2 }
      },
      {
        text: "空間和時間",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.POSEIDON]: 1 }
      }
    ]
  },
  {
    id: 59,
    text: "你的人生格言會是什麼？",
    options: [
      {
        text: "征服自己，征服世界",
        archetypes: { [ARCHETYPES.ZEUS]: 3, [ARCHETYPES.ARES]: 2 }
      },
      {
        text: "知識就是力量",
        archetypes: { [ARCHETYPES.ATHENA]: 3, [ARCHETYPES.APOLLO]: 1 }
      },
      {
        text: "愛是一切的答案",
        archetypes: { [ARCHETYPES.APHRODITE]: 3, [ARCHETYPES.DEMETER]: 2 }
      },
      {
        text: "做真實的自己",
        archetypes: { [ARCHETYPES.ARTEMIS]: 3, [ARCHETYPES.DIONYSUS]: 1 }
      }
    ]
  },
  {
    id: 60,
    text: "最後一題：你認為自己最像希臘神話中的哪位神祇？",
    options: [
      {
        text: "宙斯 - 眾神之王，權威領導者",
        archetypes: { [ARCHETYPES.ZEUS]: 5 }
      },
      {
        text: "雅典娜 - 智慧女神，策略思考者",
        archetypes: { [ARCHETYPES.ATHENA]: 5 }
      },
      {
        text: "阿爾忒彌斯 - 月神，獨立自由者",
        archetypes: { [ARCHETYPES.ARTEMIS]: 5 }
      },
      {
        text: "得墨忒耳 - 豐收女神，照顧者",
        archetypes: { [ARCHETYPES.DEMETER]: 5 }
      }
    ]
  }
];