// 🌗 光影1320測驗系統 - 完整題庫與答案對照表
// Version: 1.0
// 60題 × 5選項 × 權重系統 = 1320種人格指紋

export interface Question {
  id: string;
  phase: number;
  axis: string;
  weight: number;
  text: string;
  scene?: string;
  projection?: boolean;
  relationship?: boolean;
  options: {
    text: string;
    value: number;
    archetypes: { [key: string]: number };
  }[];
}

// 光影12神原型定義
export const ARCHETYPES = {
  ATH: 'ath',     // 理性之神 - 雅典娜型
  APH: 'aph',     // 感性之神 - 阿芙羅黛蒂型  
  HER: 'her',     // 行動之神 - 赫耳墨斯型
  ODI: 'odi',     // 思索之神 - 奧丁型
  PRO: 'pro',     // 創造之神 - 普羅米修斯型
  ZEU: 'zeu',     // 秩序之神 - 宙斯型
  HOR: 'hor',     // 領導之神 - 荷魯斯型
  LOK: 'lok',     // 自由之神 - 洛基型
  ISI: 'isi',     // 夢想之神 - 伊西斯型
  HEP: 'hep',     // 實踐之神 - 赫菲斯托斯型
  AMA: 'ama',     // 挑戰之神 - 阿瑪忒伊亞型
  FRE: 'fre'      // 療癒之神 - 弗雷亞型
} as const;

// 系統配置
export const CONFIG = {
  totalQuestions: 60,
  totalPatterns: 1320,
  testDuration: "12-15分鐘",
  
  phases: {
    phase1: { 
      range: "Q1-Q18", 
      type: "詩意題", 
      weight: 1.5,
      purpose: "潛意識探索"
    },
    phase2: { 
      range: "Q19-Q42", 
      type: "情境題", 
      weight: 2.0,
      purpose: "行為測量"
    },
    phase3: { 
      range: "Q43-Q60", 
      type: "陰影題", 
      weight: 1.0,
      purpose: "投射與整合"
    }
  },
  
  axes: {
    "ATH-APH": { light: "理性", shadow: "感性", code: ["ATH", "APH"] },
    "HER-ODI": { light: "行動", shadow: "思索", code: ["HER", "ODI"] },
    "PRO-ZEU": { light: "創造", shadow: "秩序", code: ["PRO", "ZEU"] },
    "HOR-LOK": { light: "領導", shadow: "自由", code: ["HOR", "LOK"] },
    "ISI-HEP": { light: "夢想", shadow: "實踐", code: ["ISI", "HEP"] },
    "AMA-FRE": { light: "挑戰", shadow: "療癒", code: ["AMA", "FRE"] }
  }
};

// 儀式引導文字
export const RITUAL_TEXTS = {
  opening: {
    visual: "黑底微光、呼吸環動畫",
    breathing: "3秒吸氣、4秒停留、5秒吐氣",
    mainText: "這不是考試，這是一場召喚。",
    subText: "在開始之前，請為自己點亮一盞很小的燈。",
    soundOptions: ["雨聲", "木質聲", "白噪音"],
    permission: "我允許自己在12分鐘內，暫時把世界放在門外。"
  },
  
  microPausePoems: [
    "月光在你的背後，替你保管尚未說出的話。",
    "有些答案不是被想出來的，是在沉默裡被聽見的。",
    "你選的不是答案，是一直藏在心裡的那個自己。",
    "每個選擇都是對的，因為那是你此刻的真實。",
    "不要想太多，讓手指替心說話。",
    "你正在拼湊一個只有你認得的形狀。"
  ],
  
  ending: {
    preReveal: "接下來，你會看見三道在你身上最亮的光，以及兩處仍在學會溫柔的影子。",
    duration: 6000
  }
};

// 月之囈語（根據主神顯示）
export const MOON_WHISPERS = {
  "ATH": "你總是替世界找答案。今晚，替自己留一個空白。",
  "APH": "請把眼淚當成一種語言，它想說你其實很勇敢。",
  "HER": "不是每一步都要前進，有些腳步，是為了等那個人追上來。",
  "ODI": "你思考的深度，就是你愛的深度。慢一點，愛會追上來。",
  "PRO": "創造之前先創造自己，最美的作品是完整的你。",
  "ZEU": "秩序是你的語言，但記得，最美的詩都有點亂。",
  "HOR": "領導別人之前，先溫柔地領導那個內在的小孩。",
  "LOK": "自由不是逃離，是knowing exactly where home is。",
  "ISI": "夢想家最大的勇氣，是允許夢想慢慢實現。",
  "HEP": "你的雙手很可靠，記得也要為自己建造一個避風港。",
  "AMA": "戰士最大的勝利，是放下劍的那一刻。",
  "FRE": "療癒者需要被療癒，你值得你給別人的溫柔。"
};

export const questions: Question[] = [
  // ========== PHASE 1: 詩意題 (Q1-18) ==========
  
  // --- 理性ATH vs 感性APH (Q1-3) ---
  {
    id: "Q1",
    phase: 1,
    axis: "ATH-APH",
    weight: 1.0,
    text: "晨昏交界，你站在一天的邊緣...",
    options: [
      { text: "我走向透明的黎明，那裡每一道光都有角度", value: 0, archetypes: { [ARCHETYPES.ATH]: 100, [ARCHETYPES.APH]: 0 } },
      { text: "我在晨霧中等待，讓理性慢慢甦醒", value: 25, archetypes: { [ARCHETYPES.ATH]: 75, [ARCHETYPES.APH]: 25 } },
      { text: "我站在正中央，晨昏都是我", value: 50, archetypes: { [ARCHETYPES.ATH]: 50, [ARCHETYPES.APH]: 50 } },
      { text: "暮色吸引著我，那裡有說不清的什麼", value: 75, archetypes: { [ARCHETYPES.ATH]: 25, [ARCHETYPES.APH]: 75 } },
      { text: "我沉入深藍的黃昏，那裡的顏色會呼吸", value: 100, archetypes: { [ARCHETYPES.ATH]: 0, [ARCHETYPES.APH]: 100 } }
    ]
  },
  
  {
    id: "Q2",
    phase: 1,
    axis: "ATH-APH",
    weight: 1.5,
    text: "你要為靈魂選擇一個容器...",
    options: [
      { text: "水晶稜鏡，每個切面都折射精確的光譜", value: 0, archetypes: { [ARCHETYPES.ATH]: 100, [ARCHETYPES.APH]: 0 } },
      { text: "霧面玻璃，透光但保有朦朧", value: 25, archetypes: { [ARCHETYPES.ATH]: 75, [ARCHETYPES.APH]: 25 } },
      { text: "一半是水晶，一半是流水", value: 50, archetypes: { [ARCHETYPES.ATH]: 50, [ARCHETYPES.APH]: 50 } },
      { text: "深海的水，透著微光和記憶", value: 75, archetypes: { [ARCHETYPES.ATH]: 25, [ARCHETYPES.APH]: 75 } },
      { text: "純粹的光暈，沒有形狀只有感覺", value: 100, archetypes: { [ARCHETYPES.ATH]: 0, [ARCHETYPES.APH]: 100 } }
    ]
  },
  
  {
    id: "Q3",
    phase: 1,
    axis: "ATH-APH",
    weight: 2.0,
    text: "閉上眼，伸手觸碰'真實'...",
    options: [
      { text: "冰冷的金屬表面，絕對光滑", value: 0, archetypes: { [ARCHETYPES.ATH]: 100, [ARCHETYPES.APH]: 0 } },
      { text: "打磨過的石頭，保有原始紋理", value: 25, archetypes: { [ARCHETYPES.ATH]: 75, [ARCHETYPES.APH]: 25 } },
      { text: "水與石的交界，兩種真實", value: 50, archetypes: { [ARCHETYPES.ATH]: 50, [ARCHETYPES.APH]: 50 } },
      { text: "絲綢的觸感，真實卻飄渺", value: 75, archetypes: { [ARCHETYPES.ATH]: 25, [ARCHETYPES.APH]: 75 } },
      { text: "心跳的震動，純粹的脈動", value: 100, archetypes: { [ARCHETYPES.ATH]: 0, [ARCHETYPES.APH]: 100 } }
    ]
  },
  
  // --- 行動HER vs 思索ODI (Q4-6) ---
  {
    id: "Q4",
    phase: 1,
    axis: "HER-ODI",
    weight: 1.0,
    text: "兩扇門：一扇半開透風，一扇緊閉刻著符文...",
    options: [
      { text: "直接推開半開的門走進去", value: 0, archetypes: { [ARCHETYPES.HER]: 100, [ARCHETYPES.ODI]: 0 } },
      { text: "快速瞄一眼符文，然後進門", value: 25, archetypes: { [ARCHETYPES.HER]: 75, [ARCHETYPES.ODI]: 25 } },
      { text: "一隻腳跨進門，一隻手摸著符文", value: 50, archetypes: { [ARCHETYPES.HER]: 50, [ARCHETYPES.ODI]: 50 } },
      { text: "讀了大半符文，門在召喚", value: 75, archetypes: { [ARCHETYPES.HER]: 25, [ARCHETYPES.ODI]: 75 } },
      { text: "站著解讀每個符文，門可以等", value: 100, archetypes: { [ARCHETYPES.HER]: 0, [ARCHETYPES.ODI]: 100 } }
    ]
  },
  
  {
    id: "Q5",
    phase: 1,
    axis: "HER-ODI",
    weight: 1.5,
    text: "河邊有木筏，也有橋的設計圖...",
    options: [
      { text: "跳上木筏立刻出發", value: 0, archetypes: { [ARCHETYPES.HER]: 100, [ARCHETYPES.ODI]: 0 } },
      { text: "邊划木筏邊想橋的事", value: 25, archetypes: { [ARCHETYPES.HER]: 75, [ARCHETYPES.ODI]: 25 } },
      { text: "先搭一半橋，再用木筏", value: 50, archetypes: { [ARCHETYPES.HER]: 50, [ARCHETYPES.ODI]: 50 } },
      { text: "研究完設計圖，改良木筏", value: 75, archetypes: { [ARCHETYPES.HER]: 25, [ARCHETYPES.ODI]: 75 } },
      { text: "完美的橋建好前，我不過河", value: 100, archetypes: { [ARCHETYPES.HER]: 0, [ARCHETYPES.ODI]: 100 } }
    ]
  },
  
  {
    id: "Q6",
    phase: 1,
    axis: "HER-ODI",
    weight: 2.0,
    text: "腳步聲的節奏...",
    options: [
      { text: "快速而堅定，像在追趕什麼", value: 0, archetypes: { [ARCHETYPES.HER]: 100, [ARCHETYPES.ODI]: 0 } },
      { text: "輕快但會突然停下", value: 25, archetypes: { [ARCHETYPES.HER]: 75, [ARCHETYPES.ODI]: 25 } },
      { text: "時快時慢，隨心而動", value: 50, archetypes: { [ARCHETYPES.HER]: 50, [ARCHETYPES.ODI]: 50 } },
      { text: "緩慢謹慎，每步都在思考", value: 75, archetypes: { [ARCHETYPES.HER]: 25, [ARCHETYPES.ODI]: 75 } },
      { text: "幾乎聽不見，像在等待", value: 100, archetypes: { [ARCHETYPES.HER]: 0, [ARCHETYPES.ODI]: 100 } }
    ]
  },
  
  // --- 創造PRO vs 秩序ZEU (Q7-9) ---
  {
    id: "Q7",
    phase: 1,
    axis: "PRO-ZEU",
    weight: 1.0,
    text: "給'力量'一個形狀...",
    options: [
      { text: "不斷變化的火焰，每秒都不同", value: 0, archetypes: { [ARCHETYPES.PRO]: 100, [ARCHETYPES.ZEU]: 0 } },
      { text: "螺旋上升的煙，有跡可循", value: 25, archetypes: { [ARCHETYPES.PRO]: 75, [ARCHETYPES.ZEU]: 25 } },
      { text: "一半是火，一半是金字塔", value: 50, archetypes: { [ARCHETYPES.PRO]: 50, [ARCHETYPES.ZEU]: 50 } },
      { text: "幾何圖形，帶著黃金比例", value: 75, archetypes: { [ARCHETYPES.PRO]: 25, [ARCHETYPES.ZEU]: 75 } },
      { text: "完美的正方體，絕對穩固", value: 100, archetypes: { [ARCHETYPES.PRO]: 0, [ARCHETYPES.ZEU]: 100 } }
    ]
  },
  
  {
    id: "Q8",
    phase: 1,
    axis: "PRO-ZEU",
    weight: 1.5,
    text: "你的創作方式...",
    options: [
      { text: "靈感爆發時一氣呵成", value: 0, archetypes: { [ARCHETYPES.PRO]: 100, [ARCHETYPES.ZEU]: 0 } },
      { text: "有大方向但細節即興", value: 25, archetypes: { [ARCHETYPES.PRO]: 75, [ARCHETYPES.ZEU]: 25 } },
      { text: "框架清楚，內容自由", value: 50, archetypes: { [ARCHETYPES.PRO]: 50, [ARCHETYPES.ZEU]: 50 } },
      { text: "先列大綱，按部就班", value: 75, archetypes: { [ARCHETYPES.PRO]: 25, [ARCHETYPES.ZEU]: 75 } },
      { text: "每個細節都預先規劃", value: 100, archetypes: { [ARCHETYPES.PRO]: 0, [ARCHETYPES.ZEU]: 100 } }
    ]
  },
  
  {
    id: "Q9",
    phase: 1,
    axis: "PRO-ZEU",
    weight: 2.0,
    text: "線條在你手中...",
    options: [
      { text: "自由流動，像在跳舞", value: 0, archetypes: { [ARCHETYPES.PRO]: 100, [ARCHETYPES.ZEU]: 0 } },
      { text: "曲線優美但有韻律", value: 25, archetypes: { [ARCHETYPES.PRO]: 75, [ARCHETYPES.ZEU]: 25 } },
      { text: "曲直並存，動靜結合", value: 50, archetypes: { [ARCHETYPES.PRO]: 50, [ARCHETYPES.ZEU]: 50 } },
      { text: "工整的弧度，精確的角度", value: 75, archetypes: { [ARCHETYPES.PRO]: 25, [ARCHETYPES.ZEU]: 75 } },
      { text: "筆直如尺，分毫不差", value: 100, archetypes: { [ARCHETYPES.PRO]: 0, [ARCHETYPES.ZEU]: 100 } }
    ]
  },
  
  // --- 領導HOR vs 自由LOK (Q10-12) ---
  {
    id: "Q10",
    phase: 1,
    axis: "HOR-LOK",
    weight: 1.0,
    text: "你變成一隻鳥，看見鳥群...",
    options: [
      { text: "我飛到最前方，帶領方向", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "在前排飛行，隨時準備領導", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "時而領飛，時而跟隨", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "在鳥群邊緣，自由進出", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "我飛向另一片天空", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },
  
  {
    id: "Q11",
    phase: 1,
    axis: "HOR-LOK",
    weight: 1.5,
    text: "道路分歧處...",
    options: [
      { text: "我選擇並帶其他人一起走", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "我先走，讓他們看見可能", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "各走各的，約定終點見", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "我選沒人走的那條", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "我不走路，我創造新的", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },
  
  {
    id: "Q12",
    phase: 1,
    axis: "HOR-LOK",
    weight: 2.0,
    text: "王座與風...",
    options: [
      { text: "我坐上王座，承擔一切", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "我站在王座旁，輔佐但不依附", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "有時是王，有時是風", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "我繞過王座，去找窗", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "我就是那陣自由的風", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },
  
  // --- 夢想ISI vs 實踐HEP (Q13-15) ---
  {
    id: "Q13",
    phase: 1,
    axis: "ISI-HEP",
    weight: 1.0,
    text: "手中的種子...",
    options: [
      { text: "我看見它會成為的森林", value: 0, archetypes: { [ARCHETYPES.ISI]: 100, [ARCHETYPES.HEP]: 0 } },
      { text: "我想像它的花朵顏色", value: 25, archetypes: { [ARCHETYPES.ISI]: 75, [ARCHETYPES.HEP]: 25 } },
      { text: "一邊想像，一邊找土", value: 50, archetypes: { [ARCHETYPES.ISI]: 50, [ARCHETYPES.HEP]: 50 } },
      { text: "我在準備最好的土壤", value: 75, archetypes: { [ARCHETYPES.ISI]: 25, [ARCHETYPES.HEP]: 75 } },
      { text: "我正在測量種植深度", value: 100, archetypes: { [ARCHETYPES.ISI]: 0, [ARCHETYPES.HEP]: 100 } }
    ]
  },
  
  {
    id: "Q14",
    phase: 1,
    axis: "ISI-HEP",
    weight: 1.5,
    text: "建築藍圖...",
    options: [
      { text: "我畫的是雲上的城堡", value: 0, archetypes: { [ARCHETYPES.ISI]: 100, [ARCHETYPES.HEP]: 0 } },
      { text: "美麗但還不知道怎麼蓋", value: 25, archetypes: { [ARCHETYPES.ISI]: 75, [ARCHETYPES.HEP]: 25 } },
      { text: "一半在夢裡，一半能實現", value: 50, archetypes: { [ARCHETYPES.ISI]: 50, [ARCHETYPES.HEP]: 50 } },
      { text: "每個細節都考慮預算", value: 75, archetypes: { [ARCHETYPES.ISI]: 25, [ARCHETYPES.HEP]: 75 } },
      { text: "地基已經打好了", value: 100, archetypes: { [ARCHETYPES.ISI]: 0, [ARCHETYPES.HEP]: 100 } }
    ]
  },
  
  {
    id: "Q15",
    phase: 1,
    axis: "ISI-HEP",
    weight: 2.0,
    text: "星星與麵包...",
    options: [
      { text: "我伸手摘星，餓著也值得", value: 0, archetypes: { [ARCHETYPES.ISI]: 100, [ARCHETYPES.HEP]: 0 } },
      { text: "先摘一顆星，再找麵包", value: 25, archetypes: { [ARCHETYPES.ISI]: 75, [ARCHETYPES.HEP]: 25 } },
      { text: "左手拿星星，右手拿麵包", value: 50, archetypes: { [ARCHETYPES.ISI]: 50, [ARCHETYPES.HEP]: 50 } },
      { text: "吃飽了才有力氣看星星", value: 75, archetypes: { [ARCHETYPES.ISI]: 25, [ARCHETYPES.HEP]: 75 } },
      { text: "麵包在手，星星在心就好", value: 100, archetypes: { [ARCHETYPES.ISI]: 0, [ARCHETYPES.HEP]: 100 } }
    ]
  },
  
  // --- 挑戰AMA vs 療癒FRE (Q16-18) ---
  {
    id: "Q16",
    phase: 1,
    axis: "AMA-FRE",
    weight: 1.0,
    text: "看見自己的傷口...",
    options: [
      { text: "這是戰士的印記，我繼續戰鬥", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "纏上繃帶，準備下一戰", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "清理傷口，思考它的意義", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "溫柔地療癒它", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "讓時間慢慢癒合一切", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },
  
  {
    id: "Q17",
    phase: 1,
    axis: "AMA-FRE",
    weight: 1.5,
    text: "風暴來臨...",
    options: [
      { text: "我走進風暴中心", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "我在風暴邊緣試探", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "觀察風暴，等待時機", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "我為他人搭建避風處", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "我成為風暴後的寧靜", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },
  
  {
    id: "Q18",
    phase: 1,
    axis: "AMA-FRE",
    weight: 2.0,
    text: "破曉時分...",
    options: [
      { text: "我撕開黑夜", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "我推動太陽升起", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "我見證光明到來", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "我守護最後的星光", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "我是黎明前最深的寧靜", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },
  
  // ========== PHASE 2: 情境題 (Q19-42) ==========
  
  // --- 理性ATH vs 感性APH 情境題 (Q19-22) ---
  {
    id: "Q19",
    phase: 2,
    axis: "ATH-APH",
    weight: 2.0,
    text: "深夜，朋友哭著打電話來...",
    scene: "你聽見電話那頭的啜泣聲",
    options: [
      { text: "我冷靜詢問發生什麼事，幫他理清思緒", value: 0, archetypes: { [ARCHETYPES.ATH]: 100, [ARCHETYPES.APH]: 0 } },
      { text: "我先讓他說完，再分析問題", value: 25, archetypes: { [ARCHETYPES.ATH]: 75, [ARCHETYPES.APH]: 25 } },
      { text: "我邊安慰邊了解情況", value: 50, archetypes: { [ARCHETYPES.ATH]: 50, [ARCHETYPES.APH]: 50 } },
      { text: "我說'我在這裡'，讓他盡情宣洩", value: 75, archetypes: { [ARCHETYPES.ATH]: 25, [ARCHETYPES.APH]: 75 } },
      { text: "我什麼都不說，只是陪他一起哭", value: 100, archetypes: { [ARCHETYPES.ATH]: 0, [ARCHETYPES.APH]: 100 } }
    ]
  },
  
  {
    id: "Q20",
    phase: 2,
    axis: "ATH-APH",
    weight: 2.0,
    text: "會議上意見分歧...",
    scene: "氣氛開始緊張",
    options: [
      { text: "我拿出數據和報表說話", value: 0, archetypes: { [ARCHETYPES.ATH]: 100, [ARCHETYPES.APH]: 0 } },
      { text: "我列出論點1、2、3", value: 25, archetypes: { [ARCHETYPES.ATH]: 75, [ARCHETYPES.APH]: 25 } },
      { text: "講道理但也顧及大家情緒", value: 50, archetypes: { [ARCHETYPES.ATH]: 50, [ARCHETYPES.APH]: 50 } },
      { text: "我用故事包裝我的觀點", value: 75, archetypes: { [ARCHETYPES.ATH]: 25, [ARCHETYPES.APH]: 75 } },
      { text: "我先處理情緒，再談事情", value: 100, archetypes: { [ARCHETYPES.ATH]: 0, [ARCHETYPES.APH]: 100 } }
    ]
  },
  
  {
    id: "Q21",
    phase: 2,
    axis: "ATH-APH",
    weight: 2.0,
    text: "選擇生日禮物...",
    scene: "為重要的人準備",
    options: [
      { text: "研究他最需要什麼，買最實用的", value: 0, archetypes: { [ARCHETYPES.ATH]: 100, [ARCHETYPES.APH]: 0 } },
      { text: "實用為主，但包裝要美", value: 25, archetypes: { [ARCHETYPES.ATH]: 75, [ARCHETYPES.APH]: 25 } },
      { text: "實用與心意並重", value: 50, archetypes: { [ARCHETYPES.ATH]: 50, [ARCHETYPES.APH]: 50 } },
      { text: "選會讓他感動的，實不實用其次", value: 75, archetypes: { [ARCHETYPES.ATH]: 25, [ARCHETYPES.APH]: 75 } },
      { text: "親手做的，哪怕不完美", value: 100, archetypes: { [ARCHETYPES.ATH]: 0, [ARCHETYPES.APH]: 100 } }
    ]
  },
  
  {
    id: "Q22",
    phase: 2,
    axis: "ATH-APH",
    weight: 2.0,
    text: "面對分手...",
    scene: "關係走到盡頭",
    options: [
      { text: "理性分析為什麼走到這步", value: 0, archetypes: { [ARCHETYPES.ATH]: 100, [ARCHETYPES.APH]: 0 } },
      { text: "列出分手的理由說服自己", value: 25, archetypes: { [ARCHETYPES.ATH]: 75, [ARCHETYPES.APH]: 25 } },
      { text: "理智上懂，但心還是會痛", value: 50, archetypes: { [ARCHETYPES.ATH]: 50, [ARCHETYPES.APH]: 50 } },
      { text: "我需要時間處理這些情緒", value: 75, archetypes: { [ARCHETYPES.ATH]: 25, [ARCHETYPES.APH]: 75 } },
      { text: "我讓眼淚流，不問為什麼", value: 100, archetypes: { [ARCHETYPES.ATH]: 0, [ARCHETYPES.APH]: 100 } }
    ]
  }

  
  // --- 行動HER vs 思索ODI 情境題 (Q23-26) ---
  {
    id: "Q23",
    phase: 2,
    axis: "HER-ODI",
    weight: 2.0,
    text: "新的工作機會出現...",
    scene: "薪水比現在高30%，但需要立刻決定",
    options: [
      { text: "馬上說好，機會難得", value: 0, archetypes: { [ARCHETYPES.HER]: 100, [ARCHETYPES.ODI]: 0 } },
      { text: "當場詢問幾個關鍵問題", value: 25, archetypes: { [ARCHETYPES.HER]: 75, [ARCHETYPES.ODI]: 25 } },
      { text: "先說好，回去再仔細考慮", value: 50, archetypes: { [ARCHETYPES.HER]: 50, [ARCHETYPES.ODI]: 50 } },
      { text: "要求一週時間考慮", value: 75, archetypes: { [ARCHETYPES.HER]: 25, [ARCHETYPES.ODI]: 75 } },
      { text: "需要詳細了解公司文化和發展", value: 100, archetypes: { [ARCHETYPES.HER]: 0, [ARCHETYPES.ODI]: 100 } }
    ]
  },

  {
    id: "Q24",
    phase: 2,
    axis: "HER-ODI",
    weight: 2.0,
    text: "旅遊規劃...",
    scene: "三天後出國，還沒訂住宿",
    options: [
      { text: "直接去當地再找住宿", value: 0, archetypes: { [ARCHETYPES.HER]: 100, [ARCHETYPES.ODI]: 0 } },
      { text: "快速訂第一個看起來不錯的", value: 25, archetypes: { [ARCHETYPES.HER]: 75, [ARCHETYPES.ODI]: 25 } },
      { text: "花一小時快速比較幾家", value: 50, archetypes: { [ARCHETYPES.HER]: 50, [ARCHETYPES.ODI]: 50 } },
      { text: "仔細看評價，比較地理位置", value: 75, archetypes: { [ARCHETYPES.HER]: 25, [ARCHETYPES.ODI]: 75 } },
      { text: "研究當地地圖，制定完美計畫", value: 100, archetypes: { [ARCHETYPES.HER]: 0, [ARCHETYPES.ODI]: 100 } }
    ]
  },

  {
    id: "Q25",
    phase: 2,
    axis: "HER-ODI",
    weight: 2.0,
    text: "購物時...",
    scene: "看到喜歡的東西，但有點貴",
    options: [
      { text: "喜歡就買，不要想太多", value: 0, archetypes: { [ARCHETYPES.HER]: 100, [ARCHETYPES.ODI]: 0 } },
      { text: "考慮一下，但很快就決定", value: 25, archetypes: { [ARCHETYPES.HER]: 75, [ARCHETYPES.ODI]: 25 } },
      { text: "比較一下價格和需求", value: 50, archetypes: { [ARCHETYPES.HER]: 50, [ARCHETYPES.ODI]: 50 } },
      { text: "回家想一晚再決定", value: 75, archetypes: { [ARCHETYPES.HER]: 25, [ARCHETYPES.ODI]: 75 } },
      { text: "貨比三家，看評價，考慮替代品", value: 100, archetypes: { [ARCHETYPES.HER]: 0, [ARCHETYPES.ODI]: 100 } }
    ]
  },

  {
    id: "Q26",
    phase: 2,
    axis: "HER-ODI",
    weight: 2.0,
    text: "解決技術問題...",
    scene: "程式出現bug，專案明天要交",
    options: [
      { text: "立刻開始try各種方法", value: 0, archetypes: { [ARCHETYPES.HER]: 100, [ARCHETYPES.ODI]: 0 } },
      { text: "快速google，找類似解法", value: 25, archetypes: { [ARCHETYPES.HER]: 75, [ARCHETYPES.ODI]: 25 } },
      { text: "先分析問題，再開始修", value: 50, archetypes: { [ARCHETYPES.HER]: 50, [ARCHETYPES.ODI]: 50 } },
      { text: "仔細trace code，找根本原因", value: 75, archetypes: { [ARCHETYPES.HER]: 25, [ARCHETYPES.ODI]: 75 } },
      { text: "重新review整個架構", value: 100, archetypes: { [ARCHETYPES.HER]: 0, [ARCHETYPES.ODI]: 100 } }
    ]
  },

  // --- 創造PRO vs 秩序ZEU 情境題 (Q27-30) ---
  {
    id: "Q27",
    phase: 2,
    axis: "PRO-ZEU",
    weight: 2.0,
    text: "策劃活動...",
    scene: "公司尾牙，老闆要求要有創意",
    options: [
      { text: "完全原創主題，從零開始設計", value: 0, archetypes: { [ARCHETYPES.PRO]: 100, [ARCHETYPES.ZEU]: 0 } },
      { text: "創新元素加入經典格式", value: 25, archetypes: { [ARCHETYPES.PRO]: 75, [ARCHETYPES.ZEU]: 25 } },
      { text: "參考成功案例，加入自己想法", value: 50, archetypes: { [ARCHETYPES.PRO]: 50, [ARCHETYPES.ZEU]: 50 } },
      { text: "照過往成功模式，微調細節", value: 75, archetypes: { [ARCHETYPES.PRO]: 25, [ARCHETYPES.ZEU]: 75 } },
      { text: "用最穩當的標準流程", value: 100, archetypes: { [ARCHETYPES.PRO]: 0, [ARCHETYPES.ZEU]: 100 } }
    ]
  },

  {
    id: "Q28",
    phase: 2,
    axis: "PRO-ZEU",
    weight: 2.0,
    text: "裝潢新家...",
    scene: "預算有限，想要有個性的家",
    options: [
      { text: "DIY所有裝飾，展現獨特風格", value: 0, archetypes: { [ARCHETYPES.PRO]: 100, [ARCHETYPES.ZEU]: 0 } },
      { text: "基本裝潢＋創意小物", value: 25, archetypes: { [ARCHETYPES.PRO]: 75, [ARCHETYPES.ZEU]: 25 } },
      { text: "選定風格，按比例搭配", value: 50, archetypes: { [ARCHETYPES.PRO]: 50, [ARCHETYPES.ZEU]: 50 } },
      { text: "參考室內設計雜誌的配色", value: 75, archetypes: { [ARCHETYPES.PRO]: 25, [ARCHETYPES.ZEU]: 75 } },
      { text: "全部交給設計師處理", value: 100, archetypes: { [ARCHETYPES.PRO]: 0, [ARCHETYPES.ZEU]: 100 } }
    ]
  },

  {
    id: "Q29",
    phase: 2,
    axis: "PRO-ZEU",
    weight: 2.0,
    text: "準備簡報...",
    scene: "重要提案，成敗在此一舉",
    options: [
      { text: "完全客製化，突破性創意提案", value: 0, archetypes: { [ARCHETYPES.PRO]: 100, [ARCHETYPES.ZEU]: 0 } },
      { text: "創新概念＋穩固論述", value: 25, archetypes: { [ARCHETYPES.PRO]: 75, [ARCHETYPES.ZEU]: 25 } },
      { text: "經典架構＋創意包裝", value: 50, archetypes: { [ARCHETYPES.PRO]: 50, [ARCHETYPES.ZEU]: 50 } },
      { text: "參考成功案例的結構", value: 75, archetypes: { [ARCHETYPES.PRO]: 25, [ARCHETYPES.ZEU]: 75 } },
      { text: "使用公司標準簡報格式", value: 100, archetypes: { [ARCHETYPES.PRO]: 0, [ARCHETYPES.ZEU]: 100 } }
    ]
  },

  {
    id: "Q30",
    phase: 2,
    axis: "PRO-ZEU",
    weight: 2.0,
    text: "處理工作流程...",
    scene: "團隊效率低，需要改善",
    options: [
      { text: "重新發明全新工作方法", value: 0, archetypes: { [ARCHETYPES.PRO]: 100, [ARCHETYPES.ZEU]: 0 } },
      { text: "創新工具＋標準流程", value: 25, archetypes: { [ARCHETYPES.PRO]: 75, [ARCHETYPES.ZEU]: 25 } },
      { text: "改良現有流程的關鍵環節", value: 50, archetypes: { [ARCHETYPES.PRO]: 50, [ARCHETYPES.ZEU]: 50 } },
      { text: "引入業界標準做法", value: 75, archetypes: { [ARCHETYPES.PRO]: 25, [ARCHETYPES.ZEU]: 75 } },
      { text: "完全按照SOP執行", value: 100, archetypes: { [ARCHETYPES.PRO]: 0, [ARCHETYPES.ZEU]: 100 } }
    ]
  },

  // --- 領導HOR vs 自由LOK 情境題 (Q31-34) ---
  {
    id: "Q31",
    phase: 2,
    axis: "HOR-LOK",
    weight: 2.0,
    text: "團隊意見不合...",
    scene: "會議上大家各持己見，沒有共識",
    options: [
      { text: "我做最終決定，承擔責任", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "綜合大家意見，做整合決策", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "分組執行不同方案，看結果", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "讓每個人都嘗試自己的想法", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "沒有標準答案，各做各的", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },

  {
    id: "Q32",
    phase: 2,
    axis: "HOR-LOK",
    weight: 2.0,
    text: "選擇工作模式...",
    scene: "新工作可以選擇辦公室或遠距工作",
    options: [
      { text: "辦公室，這樣可以帶領團隊", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "混合模式，在辦公室建立影響力", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "看專案需求決定", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "遠距為主，保持工作彈性", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "完全遠距，追求工作自由", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },

  {
    id: "Q33",
    phase: 2,
    axis: "HOR-LOK",
    weight: 2.0,
    text: "朋友聚會規劃...",
    scene: "一群人要出去玩，但沒人知道去哪",
    options: [
      { text: "我來規劃整個行程，大家跟著走", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "我提幾個選項，大家投票決定", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "每人負責一個環節", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "不要太詳細計劃，隨興最好", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "我自己決定要不要參加", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },

  {
    id: "Q34",
    phase: 2,
    axis: "HOR-LOK",
    weight: 2.0,
    text: "面對權威...",
    scene: "上級的決定你不太認同",
    options: [
      { text: "直接表達不同意見，說服上級", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "提出建設性的替代方案", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "表面配合，暗中按自己方式做", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "消極配合，保持距離", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "如果太違背原則就離開", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },

  // --- 夢想ISI vs 實踐HEP 情境題 (Q35-38) ---
  {
    id: "Q35",
    phase: 2,
    axis: "ISI-HEP",
    weight: 2.0,
    text: "職涯規劃...",
    scene: "30歲了，該選擇穩定還是追夢",
    options: [
      { text: "追求理想工作，錢不是最重要的", value: 0, archetypes: { [ARCHETYPES.ISI]: 100, [ARCHETYPES.HEP]: 0 } },
      { text: "找有發展性的工作，慢慢實現理想", value: 25, archetypes: { [ARCHETYPES.ISI]: 75, [ARCHETYPES.HEP]: 25 } },
      { text: "選擇有挑戰性又穩定的工作", value: 50, archetypes: { [ARCHETYPES.ISI]: 50, [ARCHETYPES.HEP]: 50 } },
      { text: "先求穩定，業餘時間追求理想", value: 75, archetypes: { [ARCHETYPES.ISI]: 25, [ARCHETYPES.HEP]: 75 } },
      { text: "選最實際的，能養家糊口最重要", value: 100, archetypes: { [ARCHETYPES.ISI]: 0, [ARCHETYPES.HEP]: 100 } }
    ]
  },

  {
    id: "Q36",
    phase: 2,
    axis: "ISI-HEP",
    weight: 2.0,
    text: "買房考慮...",
    scene: "存款有限，要選區段還是格局",
    options: [
      { text: "選有潛力的新興區域，投資未來", value: 0, archetypes: { [ARCHETYPES.ISI]: 100, [ARCHETYPES.HEP]: 0 } },
      { text: "交通便利的區域，格局小一點沒關係", value: 25, archetypes: { [ARCHETYPES.ISI]: 75, [ARCHETYPES.HEP]: 25 } },
      { text: "在能力範圍內選最好的", value: 50, archetypes: { [ARCHETYPES.ISI]: 50, [ARCHETYPES.HEP]: 50 } },
      { text: "選實用格局，區位其次", value: 75, archetypes: { [ARCHETYPES.ISI]: 25, [ARCHETYPES.HEP]: 75 } },
      { text: "買最划算的，房子就是拿來住的", value: 100, archetypes: { [ARCHETYPES.ISI]: 0, [ARCHETYPES.HEP]: 100 } }
    ]
  },

  {
    id: "Q37",
    phase: 2,
    axis: "ISI-HEP",
    weight: 2.0,
    text: "學習新技能...",
    scene: "想學程式設計，但不知道有沒有用",
    options: [
      { text: "先學了再說，技能不嫌多", value: 0, archetypes: { [ARCHETYPES.ISI]: 100, [ARCHETYPES.HEP]: 0 } },
      { text: "選最有趣的程式語言開始", value: 25, archetypes: { [ARCHETYPES.ISI]: 75, [ARCHETYPES.HEP]: 25 } },
      { text: "選就業市場需求大的技能", value: 50, archetypes: { [ARCHETYPES.ISI]: 50, [ARCHETYPES.HEP]: 50 } },
      { text: "確定對工作有幫助才學", value: 75, archetypes: { [ARCHETYPES.ISI]: 25, [ARCHETYPES.HEP]: 75 } },
      { text: "評估投資報酬率，值得才學", value: 100, archetypes: { [ARCHETYPES.ISI]: 0, [ARCHETYPES.HEP]: 100 } }
    ]
  },

  {
    id: "Q38",
    phase: 2,
    axis: "ISI-HEP",
    weight: 2.0,
    text: "退休計劃...",
    scene: "25歲，朋友說要開始理財規劃",
    options: [
      { text: "先努力實現夢想，錢的事以後再說", value: 0, archetypes: { [ARCHETYPES.ISI]: 100, [ARCHETYPES.HEP]: 0 } },
      { text: "基本儲蓄，但不要限制現在的生活", value: 25, archetypes: { [ARCHETYPES.ISI]: 75, [ARCHETYPES.HEP]: 25 } },
      { text: "一邊享受生活，一邊規劃未來", value: 50, archetypes: { [ARCHETYPES.ISI]: 50, [ARCHETYPES.HEP]: 50 } },
      { text: "開始固定儲蓄，理財很重要", value: 75, archetypes: { [ARCHETYPES.ISI]: 25, [ARCHETYPES.HEP]: 75 } },
      { text: "越早開始越好，複利效果驚人", value: 100, archetypes: { [ARCHETYPES.ISI]: 0, [ARCHETYPES.HEP]: 100 } }
    ]
  },

  // --- 挑戰AMA vs 療癒FRE 情境題 (Q39-42) ---
  {
    id: "Q39",
    phase: 2,
    axis: "AMA-FRE",
    weight: 2.0,
    text: "面對批評...",
    scene: "你的作品被公開批評",
    options: [
      { text: "立刻反駁，為自己辯護", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "分析批評是否有道理，該回應就回應", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "先處理情緒，再理性分析", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "謝謝指教，回去檢討改進", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "默默接受，時間會證明一切", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },

  {
    id: "Q40",
    phase: 2,
    axis: "AMA-FRE",
    weight: 2.0,
    text: "朋友受挫...",
    scene: "好友工作不順，情緒很低落",
    options: [
      { text: "激勵他，告訴他要勇敢面對", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "分析問題，幫他想解決方法", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "陪伴他，需要時再提供建議", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "先讓他發洩情緒，再慢慢開導", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "什麼都不說，靜靜陪著", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },

  {
    id: "Q41",
    phase: 2,
    axis: "AMA-FRE",
    weight: 2.0,
    text: "遇到不公...",
    scene: "職場上看到同事被不公平對待",
    options: [
      { text: "直接站出來替同事發聲", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "私下找主管討論這件事", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "支持同事，給他建議和資源", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "安慰同事，幫他紓解情緒", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "默默關心，避免讓事情更複雜", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },

  {
    id: "Q42",
    phase: 2,
    axis: "AMA-FRE",
    weight: 2.0,
    text: "競爭環境...",
    scene: "團隊內競爭激烈，氣氛緊張",
    options: [
      { text: "全力以赴，要就要做到最好", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "努力表現，但不踩同事", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "做好本分，不刻意競爭", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "試著改善團隊氣氛", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "專注合作，淡化競爭", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },

  // ========== PHASE 3: 陰影整合題 (Q43-60) ==========
  // 這些問題旨在探索陰影面和被壓抑的特質
  
  // --- 投射整合題 (Q43-48) ---
  {
    id: "Q43",
    phase: 3,
    axis: "ATH-APH",
    weight: 1.0,
    text: "最討厭的人類特質...",
    projection: true,
    options: [
      { text: "時候遷就，沒有措施", value: 0, archetypes: { [ARCHETYPES.APH]: 100, [ARCHETYPES.ATH]: 0 } },
      { text: "逐利短視，不考慮後果", value: 25, archetypes: { [ARCHETYPES.APH]: 75, [ARCHETYPES.ATH]: 25 } },
      { text: "不果決，總是在擺盪", value: 50, archetypes: { [ARCHETYPES.APH]: 50, [ARCHETYPES.ATH]: 50 } },
      { text: "太理理計較，不考慮感受", value: 75, archetypes: { [ARCHETYPES.APH]: 25, [ARCHETYPES.ATH]: 75 } },
      { text: "冷漠無情，不在乎他人", value: 100, archetypes: { [ARCHETYPES.APH]: 0, [ARCHETYPES.ATH]: 100 } }
    ]
  },

  {
    id: "Q44",
    phase: 3,
    axis: "HER-ODI",
    weight: 1.0,
    text: "最讓你無法忍受的行為...",
    projection: true,
    options: [
      { text: "什麼都不做，等別人來解決", value: 0, archetypes: { [ARCHETYPES.ODI]: 100, [ARCHETYPES.HER]: 0 } },
      { text: "想太久，錯過機會", value: 25, archetypes: { [ARCHETYPES.ODI]: 75, [ARCHETYPES.HER]: 25 } },
      { text: "好高騖遠，不想實作", value: 50, archetypes: { [ARCHETYPES.ODI]: 50, [ARCHETYPES.HER]: 50 } },
      { text: "緪分不想，轕率去做", value: 75, archetypes: { [ARCHETYPES.ODI]: 25, [ARCHETYPES.HER]: 75 } },
      { text: "衝動魯莽，完全不考慮", value: 100, archetypes: { [ARCHETYPES.ODI]: 0, [ARCHETYPES.HER]: 100 } }
    ]
  },

  {
    id: "Q45",
    phase: 3,
    axis: "PRO-ZEU",
    weight: 1.0,
    text: "你最不喜歡的工作方式...",
    projection: true,
    options: [
      { text: "固守成規，不容許任何變化", value: 0, archetypes: { [ARCHETYPES.ZEU]: 100, [ARCHETYPES.PRO]: 0 } },
      { text: "遵照既定流程，不願嘗試新方法", value: 25, archetypes: { [ARCHETYPES.ZEU]: 75, [ARCHETYPES.PRO]: 25 } },
      { text: "異想天開，但缺乏執行力", value: 50, archetypes: { [ARCHETYPES.ZEU]: 50, [ARCHETYPES.PRO]: 50 } },
      { text: "太有創意，但不实際", value: 75, archetypes: { [ARCHETYPES.ZEU]: 25, [ARCHETYPES.PRO]: 75 } },
      { text: "沒有標準，隨性發揮", value: 100, archetypes: { [ARCHETYPES.ZEU]: 0, [ARCHETYPES.PRO]: 100 } }
    ]
  },

  {
    id: "Q46",
    phase: 3,
    axis: "HOR-LOK",
    weight: 1.0,
    text: "你最不能接受的人...",
    projection: true,
    options: [
      { text: "不負責任，沒有承擔", value: 0, archetypes: { [ARCHETYPES.LOK]: 100, [ARCHETYPES.HOR]: 0 } },
      { text: "不受權威，難以管理", value: 25, archetypes: { [ARCHETYPES.LOK]: 75, [ARCHETYPES.HOR]: 25 } },
      { text: "只顧自己，不考慮團隊", value: 50, archetypes: { [ARCHETYPES.LOK]: 50, [ARCHETYPES.HOR]: 50 } },
      { text: "太獨裁，不聽意見", value: 75, archetypes: { [ARCHETYPES.LOK]: 25, [ARCHETYPES.HOR]: 75 } },
      { text: "控制欲強，什麼都要管", value: 100, archetypes: { [ARCHETYPES.LOK]: 0, [ARCHETYPES.HOR]: 100 } }
    ]
  },

  {
    id: "Q47",
    phase: 3,
    axis: "ISI-HEP",
    weight: 1.0,
    text: "你最看不起的態度...",
    projection: true,
    options: [
      { text: "只會空想，什麼都不做", value: 0, archetypes: { [ARCHETYPES.HEP]: 100, [ARCHETYPES.ISI]: 0 } },
      { text: "夠理想但不實際", value: 25, archetypes: { [ARCHETYPES.HEP]: 75, [ARCHETYPES.ISI]: 25 } },
      { text: "哪邊都不徹底", value: 50, archetypes: { [ARCHETYPES.HEP]: 50, [ARCHETYPES.ISI]: 50 } },
      { text: "太現實，沒有夢想", value: 75, archetypes: { [ARCHETYPES.HEP]: 25, [ARCHETYPES.ISI]: 75 } },
      { text: "太僵化，不敢冒險", value: 100, archetypes: { [ARCHETYPES.HEP]: 0, [ARCHETYPES.ISI]: 100 } }
    ]
  },

  {
    id: "Q48",
    phase: 3,
    axis: "AMA-FRE",
    weight: 1.0,
    text: "你最不屑的特質...",
    projection: true,
    options: [
      { text: "過度包容，沒有原則", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "太於温和，不敢堅持", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "中庸無奇，沒有特色", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "太競爭，不考慮他人", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "過於激進，傷害他人", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },

  // --- 陰影整合題 (Q49-54) ---
  {
    id: "Q49",
    phase: 3,
    axis: "ATH-APH",
    weight: 1.5,
    text: "在深夜，你的陰影說...",
    options: [
      { text: "你想太多了，放縱自己吧", value: 0, archetypes: { [ARCHETYPES.APH]: 100, [ARCHETYPES.ATH]: 0 } },
      { text: "偶爾也要陪伴自己的想法", value: 25, archetypes: { [ARCHETYPES.APH]: 75, [ARCHETYPES.ATH]: 25 } },
      { text: "有時候理性也需要休息", value: 50, archetypes: { [ARCHETYPES.APH]: 50, [ARCHETYPES.ATH]: 50 } },
      { text: "别總是跟著感覺走", value: 75, archetypes: { [ARCHETYPES.APH]: 25, [ARCHETYPES.ATH]: 75 } },
      { text: "你太軟弱了，該硬起來", value: 100, archetypes: { [ARCHETYPES.APH]: 0, [ARCHETYPES.ATH]: 100 } }
    ]
  },

  {
    id: "Q50",
    phase: 3,
    axis: "HER-ODI",
    weight: 1.5,
    text: "你內心的另一個聲音...",
    options: [
      { text: "停下來，你需要思考", value: 0, archetypes: { [ARCHETYPES.ODI]: 100, [ARCHETYPES.HER]: 0 } },
      { text: "有時候慢一點比較好", value: 25, archetypes: { [ARCHETYPES.ODI]: 75, [ARCHETYPES.HER]: 25 } },
      { text: "不是每件事都要加速", value: 50, archetypes: { [ARCHETYPES.ODI]: 50, [ARCHETYPES.HER]: 50 } },
      { text: "別總是退縮，該行動了", value: 75, archetypes: { [ARCHETYPES.ODI]: 25, [ARCHETYPES.HER]: 75 } },
      { text: "你算得太多，勇敢一點", value: 100, archetypes: { [ARCHETYPES.ODI]: 0, [ARCHETYPES.HER]: 100 } }
    ]
  },

  {
    id: "Q51",
    phase: 3,
    axis: "PRO-ZEU",
    weight: 1.5,
    text: "你的反面人格住耐你...",
    options: [
      { text: "你太下正了，需要紀律", value: 0, archetypes: { [ARCHETYPES.ZEU]: 100, [ARCHETYPES.PRO]: 0 } },
      { text: "偉在按照規則比較安全", value: 25, archetypes: { [ARCHETYPES.ZEU]: 75, [ARCHETYPES.PRO]: 25 } },
      { text: "不要既要安穩又要創新", value: 50, archetypes: { [ARCHETYPES.ZEU]: 50, [ARCHETYPES.PRO]: 50 } },
      { text: "別總是依賴既有系統", value: 75, archetypes: { [ARCHETYPES.ZEU]: 25, [ARCHETYPES.PRO]: 75 } },
      { text: "你太僵化了，該放手了", value: 100, archetypes: { [ARCHETYPES.ZEU]: 0, [ARCHETYPES.PRO]: 100 } }
    ]
  },

  {
    id: "Q52",
    phase: 3,
    axis: "HOR-LOK",
    weight: 1.5,
    text: "你內在的反叛者說...",
    options: [
      { text: "你太逃避責任了", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "需要你的時候你要站出來", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "自由和責任都很重要", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "別總是想要控制別人", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "你控制欲太強了", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },

  {
    id: "Q53",
    phase: 3,
    axis: "ISI-HEP",
    weight: 1.5,
    text: "你的點為上相輿囁...",
    options: [
      { text: "你都不面對現實", value: 0, archetypes: { [ARCHETYPES.HEP]: 100, [ARCHETYPES.ISI]: 0 } },
      { text: "偵爾也要實際一點", value: 25, archetypes: { [ARCHETYPES.HEP]: 75, [ARCHETYPES.ISI]: 25 } },
      { text: "理想和現實都需要", value: 50, archetypes: { [ARCHETYPES.HEP]: 50, [ARCHETYPES.ISI]: 50 } },
      { text: "別總是計較小利益", value: 75, archetypes: { [ARCHETYPES.HEP]: 25, [ARCHETYPES.ISI]: 75 } },
      { text: "你太現實，缺乏美感", value: 100, archetypes: { [ARCHETYPES.HEP]: 0, [ARCHETYPES.ISI]: 100 } }
    ]
  },

  {
    id: "Q54",
    phase: 3,
    axis: "AMA-FRE",
    weight: 1.5,
    text: "你被壓抑的一面譱責你...",
    options: [
      { text: "你太懇弱，該做就要做", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "有時候需要堅強一點", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "温柔和堅強都有價值", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "別總是想要與人爭鬥", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "你太有攻擊性了", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  },

  // --- 最終整合題 (Q55-60) ---
  {
    id: "Q55",
    phase: 3,
    axis: "ATH-APH",
    weight: 2.0,
    text: "在人生的十字路口，你最需要的智慧...",
    relationship: true,
    options: [
      { text: "策略理性，分析利弊得失", value: 0, archetypes: { [ARCHETYPES.ATH]: 100, [ARCHETYPES.APH]: 0 } },
      { text: "理性分析，但也聽心的聲音", value: 25, archetypes: { [ARCHETYPES.ATH]: 75, [ARCHETYPES.APH]: 25 } },
      { text: "平衡理性與直覺", value: 50, archetypes: { [ARCHETYPES.ATH]: 50, [ARCHETYPES.APH]: 50 } },
      { text: "直覺感受，再用理性驗證", value: 75, archetypes: { [ARCHETYPES.ATH]: 25, [ARCHETYPES.APH]: 75 } },
      { text: "完全相信內在的感覺", value: 100, archetypes: { [ARCHETYPES.ATH]: 0, [ARCHETYPES.APH]: 100 } }
    ]
  },

  {
    id: "Q56",
    phase: 3,
    axis: "HER-ODI",
    weight: 2.0,
    text: "面對重大決定，你的智慧是...",
    relationship: true,
    options: [
      { text: "立刻行動，用結果調整方向", value: 0, archetypes: { [ARCHETYPES.HER]: 100, [ARCHETYPES.ODI]: 0 } },
      { text: "快速決定，但也要想清楚", value: 25, archetypes: { [ARCHETYPES.HER]: 75, [ARCHETYPES.ODI]: 25 } },
      { text: "有計畫的行動", value: 50, archetypes: { [ARCHETYPES.HER]: 50, [ARCHETYPES.ODI]: 50 } },
      { text: "先深入思考，再謹慎行動", value: 75, archetypes: { [ARCHETYPES.HER]: 25, [ARCHETYPES.ODI]: 75 } },
      { text: "全面思考各種後果和可能性", value: 100, archetypes: { [ARCHETYPES.HER]: 0, [ARCHETYPES.ODI]: 100 } }
    ]
  },

  {
    id: "Q57",
    phase: 3,
    axis: "PRO-ZEU",
    weight: 2.0,
    text: "你的創造智慧是...",
    relationship: true,
    options: [
      { text: "突破一切，重新定義遊戲規則", value: 0, archetypes: { [ARCHETYPES.PRO]: 100, [ARCHETYPES.ZEU]: 0 } },
      { text: "在結構裡注入創新元素", value: 25, archetypes: { [ARCHETYPES.PRO]: 75, [ARCHETYPES.ZEU]: 25 } },
      { text: "穩固基礎上的創新", value: 50, archetypes: { [ARCHETYPES.PRO]: 50, [ARCHETYPES.ZEU]: 50 } },
      { text: "按認證的標準，加上精緻優化", value: 75, archetypes: { [ARCHETYPES.PRO]: 25, [ARCHETYPES.ZEU]: 75 } },
      { text: "完全依據經驗和系統", value: 100, archetypes: { [ARCHETYPES.PRO]: 0, [ARCHETYPES.ZEU]: 100 } }
    ]
  },

  {
    id: "Q58",
    phase: 3,
    axis: "HOR-LOK",
    weight: 2.0,
    text: "你的領導智慧是...",
    relationship: true,
    options: [
      { text: "絕對的責任和使命", value: 0, archetypes: { [ARCHETYPES.HOR]: 100, [ARCHETYPES.LOK]: 0 } },
      { text: "導引不勉強，啟發不控制", value: 25, archetypes: { [ARCHETYPES.HOR]: 75, [ARCHETYPES.LOK]: 25 } },
      { text: "想要協作還是獨立", value: 50, archetypes: { [ARCHETYPES.HOR]: 50, [ARCHETYPES.LOK]: 50 } },
      { text: "讓每個人發揮自主性", value: 75, archetypes: { [ARCHETYPES.HOR]: 25, [ARCHETYPES.LOK]: 75 } },
      { text: "完全自由，不受任何束縛", value: 100, archetypes: { [ARCHETYPES.HOR]: 0, [ARCHETYPES.LOK]: 100 } }
    ]
  },

  {
    id: "Q59",
    phase: 3,
    axis: "ISI-HEP",
    weight: 2.0,
    text: "你的生命智慧是...",
    relationship: true,
    options: [
      { text: "相信奇蹟，追求不可能的夢", value: 0, archetypes: { [ARCHETYPES.ISI]: 100, [ARCHETYPES.HEP]: 0 } },
      { text: "在實際中實現美麗的想像", value: 25, archetypes: { [ARCHETYPES.ISI]: 75, [ARCHETYPES.HEP]: 25 } },
      { text: "讓理想和現實相互滋養", value: 50, archetypes: { [ARCHETYPES.ISI]: 50, [ARCHETYPES.HEP]: 50 } },
      { text: "實際為主，但保持對美的整悳", value: 75, archetypes: { [ARCHETYPES.ISI]: 25, [ARCHETYPES.HEP]: 75 } },
      { text: "完全實際，用双手創造價值", value: 100, archetypes: { [ARCHETYPES.ISI]: 0, [ARCHETYPES.HEP]: 100 } }
    ]
  },

  {
    id: "Q60",
    phase: 3,
    axis: "AMA-FRE",
    weight: 2.0,
    text: "你的癒療智慧是...",
    relationship: true,
    options: [
      { text: "直面所有挑戰，永不放棄", value: 0, archetypes: { [ARCHETYPES.AMA]: 100, [ARCHETYPES.FRE]: 0 } },
      { text: "為現在奇駟，為未來繁殖", value: 25, archetypes: { [ARCHETYPES.AMA]: 75, [ARCHETYPES.FRE]: 25 } },
      { text: "戰鬥與寇靜的完美平衡", value: 50, archetypes: { [ARCHETYPES.AMA]: 50, [ARCHETYPES.FRE]: 50 } },
      { text: "用温柔的力量化解衝突", value: 75, archetypes: { [ARCHETYPES.AMA]: 25, [ARCHETYPES.FRE]: 75 } },
      { text: "純粹的慈悲，接納一切美好", value: 100, archetypes: { [ARCHETYPES.AMA]: 0, [ARCHETYPES.FRE]: 100 } }
    ]
  }
];

// 計分和分析函數
export function calculateResult(answers: { [key: number]: number }) {
  const scores: { [key: string]: number } = {};
  
  Object.values(ARCHETYPES).forEach(archetype => {
    scores[archetype] = 0;
  });

  questions.forEach((question, questionIndex) => {
    const answerIndex = answers[questionIndex];
    if (answerIndex !== undefined) {
      const selectedOption = question.options[answerIndex];
      Object.entries(selectedOption.archetypes).forEach(([archetype, score]) => {
        scores[archetype] = (scores[archetype] || 0) + (score * question.weight);
      });
    }
  });

  // 找出三高二低
  const sortedScores = Object.entries(scores)
    .map(([code, value]) => ({ code, value }))
    .sort((a, b) => b.value - a.value);

  return {
    threeHighs: sortedScores.slice(0, 3),
    twoLows: sortedScores.slice(-2),
    rawScores: scores,
    patternId: generatePatternId(sortedScores)
  };
}

// 擴展編號系統：包含三高二低的完整資訊
function generateFullPatternId(
  threeHighs: Array<{code: string, value: number}>, 
  twoLows: Array<{code: string, value: number}>
): number {
  const archetypeIndices = Object.values(ARCHETYPES);
  
  // 三高編碼 (12 × 11 × 10 = 1320)
  const mainIndex = archetypeIndices.indexOf(threeHighs[0].code as any);
  const secondIndex = archetypeIndices.indexOf(threeHighs[1].code as any);
  const thirdIndex = archetypeIndices.indexOf(threeHighs[2].code as any);
  
  // 調整索引避免重複
  let adjustedSecond = secondIndex;
  if (adjustedSecond >= mainIndex) adjustedSecond--;
  
  let adjustedThird = thirdIndex;
  if (adjustedThird >= mainIndex) adjustedThird--;
  if (adjustedThird >= (secondIndex < mainIndex ? secondIndex : secondIndex - 1)) adjustedThird--;
  
  const threeHighId = (mainIndex * 110) + (adjustedSecond * 10) + adjustedThird;
  
  // 二低編碼 (剩餘9個神中選2個 = 9 × 8 = 72種可能)
  const usedIndices = new Set([mainIndex, secondIndex, thirdIndex]);
  const remainingIndices = archetypeIndices
    .map((_, i) => i)
    .filter(i => !usedIndices.has(i));
  
  const lowMainIndex = remainingIndices.indexOf(archetypeIndices.indexOf(twoLows[0].code as any));
  const lowSecondIndex = remainingIndices.indexOf(archetypeIndices.indexOf(twoLows[1].code as any));
  
  // 調整二低索引
  let adjustedLowSecond = lowSecondIndex;
  if (adjustedLowSecond >= lowMainIndex) adjustedLowSecond--;
  
  const twoLowId = (lowMainIndex * 8) + adjustedLowSecond;
  
  // 組合成完整ID (1320 × 72 = 95040種可能)
  return (threeHighId * 72) + twoLowId;
}

// 舊版1320系統（向後相容）
function generate1320Id(threeHighs: Array<{code: string, value: number}>): number {
  const archetypeIndices = Object.values(ARCHETYPES);
  
  const mainIndex = archetypeIndices.indexOf(threeHighs[0].code as any);
  const secondIndex = archetypeIndices.indexOf(threeHighs[1].code as any);
  const thirdIndex = archetypeIndices.indexOf(threeHighs[2].code as any);
  
  let adjustedSecond = secondIndex;
  if (adjustedSecond >= mainIndex) adjustedSecond--;
  
  let adjustedThird = thirdIndex;
  if (adjustedThird >= mainIndex) adjustedThird--;
  if (adjustedThird >= (secondIndex < mainIndex ? secondIndex : secondIndex - 1)) adjustedThird--;
  
  const id = (mainIndex * 110) + (adjustedSecond * 10) + adjustedThird;
  return Math.min(Math.max(id, 0), 1319);
}

// 代號加密系統
const SALT = 'SHADOWLIGHT2024';
const CHARS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // 移除容易混淆的字符

// 新版加密系統：支援完整三高二低編碼
function encryptFullCode(
  fullId: number, 
  threeHighs: Array<{code: string, value: number}>, 
  twoLows: Array<{code: string, value: number}>
): string {
  const seed = (fullId * 37 + 1337) % 99991; // 更大的種子空間
  
  // 第一段：主神提示 + 隨機字符
  const mainGod = threeHighs[0].code.toUpperCase();
  const firstChar = mainGod[0];
  const randomNum = (seed % 9) + 1;
  const randomChar1 = CHARS[(seed * 7) % CHARS.length];
  const segment1 = `${firstChar}${randomNum}${randomChar1}`;
  
  // 第二段：加密的編號（支援更大範圍）
  const encodedId = ((fullId * 73 + 521) % 9999).toString().padStart(3, '0');
  const segment2 = `Q${encodedId}`;
  
  // 第三段：二低提示 + 校驗碼
  const lowGod = twoLows[0].code.toUpperCase();
  const lowChar = lowGod[0];
  const checksum = ((fullId + seed) % CHARS.length);
  const checksumChar = CHARS[checksum];
  const segment3 = `${lowChar}${checksumChar}`;
  
  return `${segment1}-${segment2}-${segment3}`;
}

// 舊版加密系統（向後相容）
function encryptCode(id1320: number, threeHighs: Array<{code: string, value: number}>): string {
  const seed = (id1320 * 37 + 1337) % 9973;
  
  const mainGod = threeHighs[0].code.toUpperCase();
  const firstChar = mainGod[0];
  const randomNum = (seed % 9) + 1;
  const randomChar1 = CHARS[(seed * 7) % CHARS.length];
  const segment1 = `${firstChar}${randomNum}${randomChar1}`;
  
  const encodedId = ((id1320 * 73 + 521) % 999).toString().padStart(2, '0');
  const segment2 = `Q${encodedId}`;
  
  const checksum = ((id1320 + seed) % CHARS.length);
  const checksumChar = CHARS[checksum];
  const randomChar2 = CHARS[(seed * 13) % CHARS.length];
  const strengthIndicator = Math.floor(threeHighs[0].value / 20);
  const segment3 = `${checksumChar}${strengthIndicator}${randomChar2}`;
  
  return `${segment1}-${segment2}-${segment3}`;
}

// 新版解密系統：支援完整三高二低
function decryptFullCode(encryptedCode: string): { fullId: number; isValid: boolean } {
  try {
    const parts = encryptedCode.split('-');
    if (parts.length !== 3) return { fullId: -1, isValid: false };
    
    const [segment1, segment2, segment3] = parts;
    
    // 檢查格式：第二段應該是Q+3位數字，第三段應該是2個字符
    if (!segment2.startsWith('Q') || segment3.length !== 2) {
      return { fullId: -1, isValid: false };
    }
    
    const encodedId = parseInt(segment2.substring(1));
    
    // 反向計算原始ID（搜索範圍擴大到95040）
    for (let testId = 0; testId < 95040; testId++) {
      const testEncoded = ((testId * 73 + 521) % 9999);
      if (testEncoded === encodedId) {
        // 驗證校驗碼
        const seed = (testId * 37 + 1337) % 99991;
        const expectedChecksum = ((testId + seed) % CHARS.length);
        const actualChecksum = CHARS.indexOf(segment3[1]); // 第二個字符是校驗碼
        
        if (expectedChecksum === actualChecksum) {
          return { fullId: testId, isValid: true };
        }
      }
    }
    
    return { fullId: -1, isValid: false };
  } catch {
    return { fullId: -1, isValid: false };
  }
}

// 舊版解密系統（向後相容）
function decryptCode(encryptedCode: string): { id1320: number; isValid: boolean } {
  try {
    const parts = encryptedCode.split('-');
    if (parts.length !== 3) return { id1320: -1, isValid: false };
    
    const [segment1, segment2, segment3] = parts;
    
    // 舊格式檢查：第二段是Q+2位數字，第三段是3個字符
    if (!segment2.startsWith('Q') || segment3.length !== 3) {
      return { id1320: -1, isValid: false };
    }
    
    const encodedId = parseInt(segment2.substring(1));
    
    for (let testId = 0; testId < 1320; testId++) {
      const testEncoded = ((testId * 73 + 521) % 999);
      if (testEncoded === encodedId) {
        const seed = (testId * 37 + 1337) % 9973;
        const expectedChecksum = ((testId + seed) % CHARS.length);
        const actualChecksum = CHARS.indexOf(segment3[0]);
        
        if (expectedChecksum === actualChecksum) {
          return { id1320: testId, isValid: true };
        }
      }
    }
    
    return { id1320: -1, isValid: false };
  } catch {
    return { id1320: -1, isValid: false };
  }
}

// 根據完整ID反推三高二低（新版）
function reconstructFullPattern(fullId: number): {
  threeHighs: Array<string>;
  twoLows: Array<string>;
} {
  const archetypeKeys = Object.keys(ARCHETYPES);
  
  // 分離三高和二低的ID
  const threeHighId = Math.floor(fullId / 72);
  const twoLowId = fullId % 72;
  
  // 重建三高
  const mainIndex = Math.floor(threeHighId / 110);
  const secondIndex = Math.floor((threeHighId % 110) / 10);
  const thirdIndex = threeHighId % 10;
  
  let actualSecond = secondIndex;
  if (actualSecond >= mainIndex) actualSecond++;
  
  let actualThird = thirdIndex;
  if (actualThird >= mainIndex) actualThird++;
  if (actualThird >= actualSecond) actualThird++;
  
  const threeHighs = [
    archetypeKeys[mainIndex],
    archetypeKeys[actualSecond],
    archetypeKeys[actualThird]
  ];
  
  // 重建二低
  const usedIndices = new Set([mainIndex, actualSecond, actualThird]);
  const remainingIndices = archetypeKeys
    .map((_, i) => i)
    .filter(i => !usedIndices.has(i));
  
  const lowMainIndex = Math.floor(twoLowId / 8);
  const lowSecondIndex = twoLowId % 8;
  
  let actualLowSecond = lowSecondIndex;
  if (actualLowSecond >= lowMainIndex) actualLowSecond++;
  
  const twoLows = [
    archetypeKeys[remainingIndices[lowMainIndex]],
    archetypeKeys[remainingIndices[actualLowSecond]]
  ];
  
  return { threeHighs, twoLows };
}

// 根據ID反推三高組合（舊版，向後相容）
function reconstruct1320Pattern(id1320: number): Array<string> {
  const archetypeKeys = Object.keys(ARCHETYPES);
  
  const mainIndex = Math.floor(id1320 / 110);
  const secondIndex = Math.floor((id1320 % 110) / 10);
  const thirdIndex = id1320 % 10;
  
  let actualSecond = secondIndex;
  if (actualSecond >= mainIndex) actualSecond++;
  
  let actualThird = thirdIndex;
  if (actualThird >= mainIndex) actualThird++;
  if (actualThird >= actualSecond) actualThird++;
  
  return [
    archetypeKeys[mainIndex],
    archetypeKeys[actualSecond], 
    archetypeKeys[actualThird]
  ];
}

function generatePatternId(sortedScores: Array<{code: string, value: number}>): string {
  const threeHighs = sortedScores.slice(0, 3);
  const twoLows = sortedScores.slice(-2);
  const fullId = generateFullPatternId(threeHighs, twoLows);
  return encryptFullCode(fullId, threeHighs, twoLows);
}

// 導出給後台使用的工具函數
export const PatternCodeUtils = {
  // 新版完整功能
  generateFullPatternId,
  encryptFullCode,
  decryptFullCode,
  reconstructFullPattern,
  
  // 舊版向後相容
  generate1320Id,
  encryptCode,
  decryptCode,
  reconstruct1320Pattern,
  
  // 智能解析函數：自動判斷新舊格式
  analyzeCode: (encryptedCode: string) => {
    const archetypeNames = {
      'ATH': '理性之神', 'APH': '感性之神',
      'HER': '行動之神', 'ODI': '思索之神', 
      'PRO': '創造之神', 'ZEU': '秩序之神',
      'HOR': '領導之神', 'LOK': '自由之神',
      'ISI': '夢想之神', 'HEP': '實踐之神',
      'AMA': '挑戰之神', 'FRE': '療癒之神'
    };
    
    // 嘗試新版解析（有二低資訊）
    const fullDecryptResult = decryptFullCode(encryptedCode);
    if (fullDecryptResult.isValid) {
      const fullPattern = reconstructFullPattern(fullDecryptResult.fullId);
      return {
        isValid: true,
        version: 'full',
        fullId: fullDecryptResult.fullId,
        threeHighs: fullPattern.threeHighs.map(key => archetypeNames[key as keyof typeof archetypeNames]),
        twoLows: fullPattern.twoLows.map(key => archetypeNames[key as keyof typeof archetypeNames]),
        rawThreeHighs: fullPattern.threeHighs,
        rawTwoLows: fullPattern.twoLows,
        encryptedCode
      };
    }
    
    // 回退到舊版解析（只有三高）
    const legacyDecryptResult = decryptCode(encryptedCode);
    if (legacyDecryptResult.isValid) {
      const pattern = reconstruct1320Pattern(legacyDecryptResult.id1320);
      return {
        isValid: true,
        version: 'legacy',
        id1320: legacyDecryptResult.id1320,
        threeHighs: pattern.map(key => archetypeNames[key as keyof typeof archetypeNames]),
        twoLows: ['未知', '未知'], // 舊版無法得知二低
        rawThreeHighs: pattern,
        rawTwoLows: ['unknown', 'unknown'],
        encryptedCode
      };
    }
    
    return { isValid: false, error: '無效代號' };
  }
};

// 測試範例（開發時使用）
export const SAMPLE_PATTERNS = [
  // 新版格式（包含二低資訊）
  { code: "A3K-Q125-AF", description: "理性主導型（新版）", version: "full" },
  { code: "H5L-Q842-PL", description: "行動創造型（新版）", version: "full" }, 
  { code: "I7M-Q317-ZH", description: "夢想療癒型（新版）", version: "full" },
  
  // 舊版格式（僅三高）
  { code: "A3K-Q25-M7X", description: "理性主導型（舊版）", version: "legacy" },
  { code: "H5L-Q42-N8P", description: "行動創造型（舊版）", version: "legacy" },
  { code: "I7M-Q17-K9V", description: "夢想療癒型（舊版）", version: "legacy" }
];

// 系統資訊
export const SYSTEM_INFO = {
  name: '光影1320測驗系統',
  version: '2.0',
  totalPatterns: 95040, // 1320 × 72 (三高組合 × 二低組合)
  legacyPatterns: 1320, // 向後相容
  features: {
    fullPattern: '完整三高二低識別',
    encryption: '防偽造校驗碼',
    backwardCompatible: '向後相容舊版格式'
  },
  codeFormats: {
    new: 'XXX-QYYY-ZW (如: A3K-Q125-AF)',
    legacy: 'XXX-QYY-ZWV (如: A3K-Q25-M7X)'
  }
};