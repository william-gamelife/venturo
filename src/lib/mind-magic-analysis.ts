// 心靈魔法測驗結果分析系統

import { ARCHETYPES } from '@/data/mind-magic-questions';

export interface ArchetypeInfo {
  id: string;
  name: string;
  greekName: string;
  description: string;
  strengths: string[];
  challenges: string[];
  careers: string[];
  relationships: string;
  shadow: string;
  element: string;
  symbol: string;
}

export interface TestAnalysis {
  primaryArchetype: ArchetypeInfo;
  secondaryArchetype: ArchetypeInfo;
  shadowArchetype: ArchetypeInfo;
  personalityCode: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  detailedAnalysis: string;
}

// 十二原型的詳細資訊
export const ARCHETYPE_DATA: { [key: string]: ArchetypeInfo } = {
  [ARCHETYPES.ZEUS]: {
    id: ARCHETYPES.ZEUS,
    name: "統治者",
    greekName: "宙斯",
    description: "天生的領導者，具有權威感和責任心，渴望建立秩序和規則。",
    strengths: ["領導力", "決斷力", "責任感", "組織能力", "權威感"],
    challenges: ["控制慾過強", "難以放權", "可能變得專斷", "承受過多壓力"],
    careers: ["CEO", "政治家", "法官", "軍官", "管理者"],
    relationships: "在關係中傾向於主導，需要學會平等和傾聽。",
    shadow: "暴君 - 濫用權力，變得專橫跋扈",
    element: "火",
    symbol: "⚡"
  },
  [ARCHETYPES.HERA]: {
    id: ARCHETYPES.HERA,
    name: "女王",
    greekName: "希拉",
    description: "忠誠的伴侶，重視承諾和傳統，具有強烈的保護慾。",
    strengths: ["忠誠", "責任感", "保護能力", "傳統價值", "堅持不懈"],
    challenges: ["嫉妒心強", "過度控制", "難以原諒背叛", "固執己見"],
    careers: ["人力資源", "諮詢師", "傳統行業管理者", "家庭治療師"],
    relationships: "極度重視忠誠和承諾，但可能過於佔有。",
    shadow: "復仇女神 - 因嫉妒而變得報復心強",
    element: "土",
    symbol: "👑"
  },
  [ARCHETYPES.POSEIDON]: {
    id: ARCHETYPES.POSEIDON,
    name: "海王",
    greekName: "波塞頓",
    description: "情感深沉如海，具有強大的直覺力和創造力，但情緒波動較大。",
    strengths: ["直覺力", "創造力", "感受力", "適應性", "深度思考"],
    challenges: ["情緒不穩定", "過於敏感", "難以控制情緒", "孤僻傾向"],
    careers: ["藝術家", "心理學家", "作家", "海洋學家", "治療師"],
    relationships: "情感深沉但不穩定，需要理解和包容。",
    shadow: "風暴之神 - 情緒失控，變得破壞性",
    element: "水",
    symbol: "🌊"
  },
  [ARCHETYPES.DEMETER]: {
    id: ARCHETYPES.DEMETER,
    name: "母親",
    greekName: "得墨忒耳",
    description: "天生的照顧者，具有強烈的養育本能和同理心。",
    strengths: ["同理心", "養育能力", "無私奉獻", "耐心", "包容性"],
    challenges: ["過度保護", "自我犧牲", "界限模糊", "依賴關係"],
    careers: ["護士", "教師", "社工", "營養師", "兒童工作者"],
    relationships: "給予型人格，但需要學會接受愛。",
    shadow: "吞噬母親 - 過度保護變成控制",
    element: "土",
    symbol: "🌾"
  },
  [ARCHETYPES.ATHENA]: {
    id: ARCHETYPES.ATHENA,
    name: "智者",
    greekName: "雅典娜",
    description: "智慧與策略的化身，理性思考，善於解決問題。",
    strengths: ["智慧", "邏輯思維", "策略規劃", "公正", "學習能力"],
    challenges: ["過於理性", "情感疏離", "完美主義", "批判性強"],
    careers: ["律師", "顧問", "研究員", "戰略規劃師", "學者"],
    relationships: "重視精神層面的契合，但可能忽略情感需求。",
    shadow: "冷酷智者 - 過度理性而缺乏人情味",
    element: "風",
    symbol: "🦉"
  },
  [ARCHETYPES.APOLLO]: {
    id: ARCHETYPES.APOLLO,
    name: "太陽神",
    greekName: "阿波羅",
    description: "追求完美與和諧，具有藝術天賦和領導魅力。",
    strengths: ["藝術才能", "魅力", "理想主義", "和諧感", "靈感"],
    challenges: ["完美主義", "自戀傾向", "情緒極端", "現實脫節"],
    careers: ["藝術家", "音樂家", "設計師", "表演者", "治療師"],
    relationships: "富有魅力但可能自戀，需要欣賞和讚美。",
    shadow: "虛榮王子 - 過度自戀和虛榮",
    element: "火",
    symbol: "☀️"
  },
  [ARCHETYPES.ARTEMIS]: {
    id: ARCHETYPES.ARTEMIS,
    name: "獨立者",
    greekName: "阿爾忒彌斯",
    description: "獨立自主，追求自由，具有強烈的原則性和正義感。",
    strengths: ["獨立性", "原則性", "直覺", "保護能力", "純真"],
    challenges: ["孤僻", "難以親密", "過於理想化", "缺乏妥協"],
    careers: ["環保工作者", "獨立顧問", "研究員", "攝影師", "獸醫"],
    relationships: "重視自由和獨立，需要空間和理解。",
    shadow: "復仇女神 - 變得冷酷和報復心強",
    element: "土",
    symbol: "🏹"
  },
  [ARCHETYPES.ARES]: {
    id: ARCHETYPES.ARES,
    name: "戰士",
    greekName: "阿瑞斯",
    description: "勇敢的戰士，充滿激情和行動力，不畏困難挑戰。",
    strengths: ["勇氣", "行動力", "激情", "保護能力", "直接性"],
    challenges: ["衝動", "攻擊性", "缺乏策略", "情緒化", "破壞性"],
    careers: ["軍人", "警察", "消防員", "運動員", "急救人員"],
    relationships: "激情但可能衝動，需要學會控制脾氣。",
    shadow: "暴力狂 - 失控的攻擊性和破壞力",
    element: "火",
    symbol: "⚔️"
  },
  [ARCHETYPES.APHRODITE]: {
    id: ARCHETYPES.APHRODITE,
    name: "愛神",
    greekName: "阿芙羅黛蒂",
    description: "愛與美的化身，重視感情和美感，具有強大的吸引力。",
    strengths: ["魅力", "愛的能力", "美感", "同理心", "創造力"],
    challenges: ["情感依賴", "虛榮", "不穩定", "嫉妒", "缺乏深度"],
    careers: ["美容師", "設計師", "諮詢師", "藝術家", "公關"],
    relationships: "重視愛情和美感，但可能過於依賴感情。",
    shadow: "誘惑者 - 操控他人情感為己所用",
    element: "水",
    symbol: "💕"
  },
  [ARCHETYPES.HEPHAESTUS]: {
    id: ARCHETYPES.HEPHAESTUS,
    name: "工匠",
    greekName: "赫菲斯托斯",
    description: "技藝精湛的創造者，堅韌不拔，專注於完美的作品。",
    strengths: ["技藝", "堅持", "創造力", "實用性", "專注力"],
    challenges: ["內向", "自卑", "固執", "社交困難", "完美主義"],
    careers: ["工程師", "工匠", "設計師", "技術專家", "發明家"],
    relationships: "忠誠但內向，需要時間建立信任。",
    shadow: "孤獨匠人 - 變得孤僻和憤世嫉俗",
    element: "火",
    symbol: "🔨"
  },
  [ARCHETYPES.HERMES]: {
    id: ARCHETYPES.HERMES,
    name: "信使",
    greekName: "赫耳墨斯",
    description: "靈活的溝通者和中介者，適應力強，善於連接不同的世界。",
    strengths: ["溝通力", "適應性", "機智", "靈活性", "學習能力"],
    challenges: ["不穩定", "表面化", "缺乏深度", "不負責任", "善變"],
    careers: ["銷售員", "記者", "翻譯", "中介", "導遊"],
    relationships: "善於交流但可能缺乏深度承諾。",
    shadow: "騙子 - 利用溝通能力操控他人",
    element: "風",
    symbol: "📱"
  },
  [ARCHETYPES.DIONYSUS]: {
    id: ARCHETYPES.DIONYSUS,
    name: "狂歡者",
    greekName: "狄俄尼索斯",
    description: "生命力旺盛，熱愛自由和享樂，具有強烈的創造性和直覺。",
    strengths: ["創造力", "直覺", "生命力", "享樂能力", "自由精神"],
    challenges: ["缺乏自制", "成癮傾向", "不負責任", "情緒極端", "混亂"],
    careers: ["藝術家", "演員", "音樂家", "派對策劃師", "治療師"],
    relationships: "熱情但不穩定，需要理解和包容。",
    shadow: "成癮者 - 失去控制，沉溺於享樂",
    element: "水",
    symbol: "🍷"
  }
};

export function analyzeTestResults(scores: { [key: string]: number }): TestAnalysis {
  // 按分數排序
  const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([archetype]) => Object.values(ARCHETYPES).includes(archetype as any));

  const primaryArchetype = ARCHETYPE_DATA[sortedScores[0][0]];
  const secondaryArchetype = ARCHETYPE_DATA[sortedScores[1][0]];
  const shadowArchetype = ARCHETYPE_DATA[sortedScores[sortedScores.length - 1][0]];

  // 生成人格密碼
  const personalityCode = generatePersonalityCode(sortedScores);

  // 綜合優勢
  const strengths = [
    ...primaryArchetype.strengths.slice(0, 3),
    ...secondaryArchetype.strengths.slice(0, 2)
  ];

  // 綜合挑戰
  const challenges = [
    ...primaryArchetype.challenges.slice(0, 2),
    ...secondaryArchetype.challenges.slice(0, 1),
    `需要整合${shadowArchetype.name}的陰影面`
  ];

  // 成長建議
  const recommendations = generateRecommendations(primaryArchetype, secondaryArchetype, shadowArchetype);

  // 詳細分析
  const detailedAnalysis = generateDetailedAnalysis(primaryArchetype, secondaryArchetype, shadowArchetype, sortedScores);

  return {
    primaryArchetype,
    secondaryArchetype,
    shadowArchetype,
    personalityCode,
    strengths,
    challenges,
    recommendations,
    detailedAnalysis
  };
}

function generatePersonalityCode(sortedScores: [string, number][]): string {
  const primary = sortedScores[0][0];
  const secondary = sortedScores[1][0];
  const tertiary = sortedScores[2][0];
  
  const primaryScore = Math.min(Math.floor(sortedScores[0][1] / 5), 9);
  const secondaryScore = Math.min(Math.floor(sortedScores[1][1] / 5), 9);
  
  const codeMap: { [key: string]: string } = {
    [ARCHETYPES.ZEUS]: 'Z',
    [ARCHETYPES.HERA]: 'H',
    [ARCHETYPES.POSEIDON]: 'P',
    [ARCHETYPES.DEMETER]: 'D',
    [ARCHETYPES.ATHENA]: 'A',
    [ARCHETYPES.APOLLO]: 'L',
    [ARCHETYPES.ARTEMIS]: 'R',
    [ARCHETYPES.ARES]: 'S',
    [ARCHETYPES.APHRODITE]: 'V',
    [ARCHETYPES.HEPHAESTUS]: 'F',
    [ARCHETYPES.HERMES]: 'M',
    [ARCHETYPES.DIONYSUS]: 'O'
  };

  return `${codeMap[primary]}${primaryScore}${codeMap[secondary]}${secondaryScore}${codeMap[tertiary]}`;
}

function generateRecommendations(primary: ArchetypeInfo, secondary: ArchetypeInfo, shadow: ArchetypeInfo): string[] {
  const recommendations = [
    `發揮你的${primary.name}特質：專注於${primary.strengths[0]}的發展`,
    `整合${secondary.name}能量：在日常生活中培養${secondary.strengths[0]}`,
    `面對陰影：認識並接受你內在的${shadow.name}面向`,
    `平衡發展：避免過度展現${primary.name}的負面特質`,
    `成長方向：學習其他原型的優點來完善自己`
  ];

  // 根據特定組合添加個性化建議
  if (primary.id === ARCHETYPES.ZEUS && secondary.id === ARCHETYPES.ATHENA) {
    recommendations.push("你的領導力與智慧結合，適合從事戰略管理工作");
  }
  if (primary.id === ARCHETYPES.ARTEMIS && secondary.id === ARCHETYPES.APOLLO) {
    recommendations.push("獨立與創造的結合讓你適合藝術創作或獨立工作");
  }

  return recommendations;
}

function generateDetailedAnalysis(primary: ArchetypeInfo, secondary: ArchetypeInfo, shadow: ArchetypeInfo, scores: [string, number][]): string {
  return `
你的核心原型是${primary.name}（${primary.greekName}），這意味著${primary.description}

你的次要原型${secondary.name}（${secondary.greekName}）為你增添了${secondary.description}的特質。

這種組合創造了一個既具有${primary.strengths[0]}又富有${secondary.strengths[0]}的獨特人格。你在${primary.element}元素的驅動下，同時受到${secondary.element}元素的影響。

你的陰影原型是${shadow.name}，代表你最需要整合的內在面向。當你感到壓力或失去平衡時，可能會表現出${shadow.challenges[0]}的特徵。

根據你的測驗結果，你最強的三個原型分數為：
1. ${ARCHETYPE_DATA[scores[0][0]].name}：${scores[0][1]}分
2. ${ARCHETYPE_DATA[scores[1][0]].name}：${scores[1][1]}分  
3. ${ARCHETYPE_DATA[scores[2][0]].name}：${scores[2][1]}分

這個結果顯示了你人格的豐富層次和複雜性。記住，每個人都包含所有十二個原型，只是表現程度不同。
  `;
}