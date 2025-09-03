/**
 * 人生模擬器 - GameLife Simulator
 * 一個將現實任務遊戲化的模擬經營遊戲
 * @version 1.0.0
 * @author william
 */

class LifeSimulatorModule {
    static moduleInfo = {
        id: 'life-simulator',
        name: '人生模擬器',
        subtitle: '經營你的虛擬人生',
        description: '完成現實任務來提升虛擬角色，用遊戲化方式管理生活',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><circle cx="9" cy="10" r="1.25"/><circle cx="15" cy="10" r="1.25"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>',
        version: '1.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.gameState = null;
        this.animations = [];
        this.autoSaveTimer = null;
    }

    async render(uuid) {
        window.activeModule = this;
        this.currentUser = uuid;
        
        // 載入同步管理器
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        // 載入遊戲資料
        await this.loadGameData(uuid);
        
        // 渲染遊戲介面
        const container = document.getElementById('moduleContainer');
        container.innerHTML = this.getHTML();
        
        // 初始化遊戲
        this.initGame();
        
        // 自動存檔（每分鐘）
        this.autoSaveTimer = setInterval(() => {
            this.saveGameData();
        }, 60000);
    }

    getHTML() {
        const char = this.gameState.character;
        const nextLevelExp = this.getNextLevelExp();
        const expProgress = (char.exp / nextLevelExp) * 100;
        
        return `
            <style>
                /* 遊戲容器 */
                .life-sim-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                    gap: 20px;
                }

                /* 狀態列 */
                .status-bar {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .player-info {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .level-badge {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 18px;
                }

                .exp-bar {
                    width: 200px;
                    height: 20px;
                    background: #e0e0e0;
                    border-radius: 10px;
                    overflow: hidden;
                    position: relative;
                }

                .exp-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #8BC34A);
                    width: ${expProgress}%;
                    transition: width 0.5s ease;
                    border-radius: 10px;
                }

                .exp-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 11px;
                    font-weight: bold;
                    color: #333;
                }

                .resources {
                    display: flex;
                    gap: 20px;
                    font-size: 18px;
                    font-weight: bold;
                }

                .gold {
                    color: #FFA000;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .gems {
                    color: #E91E63;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                /* 主遊戲區 */
                .game-area {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 20px;
                }

                /* 房間視圖 */
                .room-section {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .room-title {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: #333;
                }

                .pixel-room {
                    display: grid;
                    grid-template-columns: repeat(10, 1fr);
                    grid-template-rows: repeat(8, 1fr);
                    gap: 1px;
                    background: #333;
                    padding: 2px;
                    border-radius: 8px;
                    aspect-ratio: 10/8;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .tile {
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-radius: 2px;
                    position: relative;
                }

                .tile:hover {
                    background: #e0e0e0;
                    transform: scale(1.1);
                    z-index: 10;
                }

                .tile.wall {
                    background: linear-gradient(135deg, #8D6E63, #6D4C41);
                    cursor: default;
                }

                .tile.wall:hover {
                    transform: none;
                }

                .tile.floor {
                    background: linear-gradient(180deg, #EFEBE9, #D7CCC8);
                }

                .tile.character {
                    animation: characterBounce 2s ease-in-out infinite;
                    z-index: 5;
                }

                @keyframes characterBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }

                .tile.furniture {
                    background: transparent;
                }

                .tile.interactive {
                    box-shadow: 0 0 10px rgba(103, 126, 234, 0.5);
                    animation: glow 2s ease-in-out infinite;
                }

                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px rgba(103, 126, 234, 0.3); }
                    50% { box-shadow: 0 0 15px rgba(103, 126, 234, 0.6); }
                }

                /* 狀態面板 */
                .stats-section {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .stat-icon {
                    font-size: 24px;
                    width: 30px;
                }

                .stat-bar {
                    flex: 1;
                    height: 25px;
                    background: #e0e0e0;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                }

                .stat-fill {
                    height: 100%;
                    transition: width 0.5s ease;
                    border-radius: 12px;
                }

                .health-fill {
                    background: linear-gradient(90deg, #f44336, #ef5350);
                    width: ${char.stats.health}%;
                }

                .mood-fill {
                    background: linear-gradient(90deg, #FFC107, #FFD54F);
                    width: ${char.stats.mood}%;
                }

                .energy-fill {
                    background: linear-gradient(90deg, #2196F3, #64B5F6);
                    width: ${char.stats.energy}%;
                }

                .hunger-fill {
                    background: linear-gradient(90deg, #4CAF50, #81C784);
                    width: ${char.stats.hunger}%;
                }

                .stat-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }

                /* 動作按鈕 */
                .actions-section {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .actions-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: #333;
                }

                .action-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }

                .action-btn {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                }

                .action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(103, 126, 234, 0.3);
                }

                .action-btn:active {
                    transform: scale(0.95);
                }

                .action-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .action-icon {
                    font-size: 24px;
                }

                .action-cost {
                    font-size: 10px;
                    opacity: 0.9;
                }

                /* 任務面板 */
                .quests-section {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .quest-item {
                    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s;
                }

                .quest-item:hover {
                    transform: translateX(5px);
                }

                .quest-item.completed {
                    background: linear-gradient(135deg, #4CAF50, #81C784);
                    color: white;
                }

                .quest-reward {
                    font-weight: bold;
                    color: #FFA000;
                }

                /* 特效 */
                .floating-text {
                    position: fixed;
                    font-weight: bold;
                    font-size: 20px;
                    pointer-events: none;
                    animation: floatUp 2s ease-out;
                    z-index: 1000;
                }

                @keyframes floatUp {
                    0% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                }

                .level-up-effect {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 48px;
                    font-weight: bold;
                    color: gold;
                    text-shadow: 0 0 20px gold;
                    animation: levelUpPulse 1s ease-out;
                    z-index: 1001;
                }

                @keyframes levelUpPulse {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0;
                    }
                }

                /* 手機版調整 */
                @media (max-width: 768px) {
                    .game-area {
                        grid-template-columns: 1fr;
                    }
                    
                    .pixel-room {
                        max-width: 100%;
                    }
                    
                    .action-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>

            <div class="life-sim-container">
                <!-- 頂部狀態列 -->
                <div class="status-bar">
                    <div class="player-info">
                        <div class="level-badge">Lv.${char.level}</div>
                        <div class="exp-bar">
                            <div class="exp-fill"></div>
                            <div class="exp-text">${char.exp}/${nextLevelExp} EXP</div>
                        </div>
                    </div>
                    <div class="resources">
                        <div class="gold">💰 ${char.gold}</div>
                        <div class="gems">💎 ${char.gems}</div>
                    </div>
                </div>

                <!-- 主遊戲區 -->
                <div class="game-area">
                    <!-- 左側：房間 -->
                    <div>
                        <div class="room-section">
                            <div class="room-title">🏠 我的房間</div>
                            <div class="pixel-room" id="gameRoom">
                                ${this.generateRoom()}
                            </div>
                        </div>
                        
                        <!-- 任務面板 -->
                        <div class="quests-section" style="margin-top: 20px;">
                            <div class="actions-title">📋 今日任務</div>
                            ${this.renderQuests()}
                        </div>
                    </div>

                    <!-- 右側：狀態和動作 -->
                    <div>
                        <!-- 角色狀態 -->
                        <div class="stats-section">
                            <div class="stat-item">
                                <span class="stat-icon">❤️</span>
                                <div class="stat-bar">
                                    <div class="stat-fill health-fill"></div>
                                    <div class="stat-text">${char.stats.health}/100</div>
                                </div>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">😊</span>
                                <div class="stat-bar">
                                    <div class="stat-fill mood-fill"></div>
                                    <div class="stat-text">${char.stats.mood}/100</div>
                                </div>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">⚡</span>
                                <div class="stat-bar">
                                    <div class="stat-fill energy-fill"></div>
                                    <div class="stat-text">${char.stats.energy}/100</div>
                                </div>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">🍔</span>
                                <div class="stat-bar">
                                    <div class="stat-fill hunger-fill"></div>
                                    <div class="stat-text">${char.stats.hunger}/100</div>
                                </div>
                            </div>
                        </div>

                        <!-- 動作按鈕 -->
                        <div class="actions-section" style="margin-top: 20px;">
                            <div class="actions-title">🎮 動作</div>
                            <div class="action-grid">
                                <button class="action-btn" onclick="window.activeModule.doAction('work')">
                                    <span class="action-icon">💼</span>
                                    <span>工作</span>
                                    <span class="action-cost">-20 能量 +50 EXP</span>
                                </button>
                                <button class="action-btn" onclick="window.activeModule.doAction('rest')">
                                    <span class="action-icon">🛏️</span>
                                    <span>休息</span>
                                    <span class="action-cost">+30 能量</span>
                                </button>
                                <button class="action-btn" onclick="window.activeModule.doAction('eat')">
                                    <span class="action-icon">🍕</span>
                                    <span>吃飯</span>
                                    <span class="action-cost">-20 金幣 +40 飽食</span>
                                </button>
                                <button class="action-btn" onclick="window.activeModule.doAction('play')">
                                    <span class="action-icon">🎮</span>
                                    <span>娛樂</span>
                                    <span class="action-cost">+30 心情 -10 能量</span>
                                </button>
                                <button class="action-btn" onclick="window.activeModule.doAction('exercise')">
                                    <span class="action-icon">🏃</span>
                                    <span>運動</span>
                                    <span class="action-cost">+20 健康 -15 能量</span>
                                </button>
                                <button class="action-btn" onclick="window.activeModule.doAction('shop')">
                                    <span class="action-icon">🛍️</span>
                                    <span>商店</span>
                                    <span class="action-cost">購買道具</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateRoom() {
        const layout = [
            ['🧱','🧱','🧱','🧱','🧱','🧱','🧱','🧱','🧱','🧱'],
            ['🧱','🪴','','','','','','','🖼️','🧱'],
            ['🧱','','','','','','','','','🧱'],
            ['🧱','','','','','','','','','🧱'],
            ['🧱','🛏️','','','👤','','','📺','','🧱'],
            ['🧱','','','','','','','🛋️','','🧱'],
            ['🧱','📚','','','','','','','🪴','🧱'],
            ['🧱','🧱','🧱','🧱','🚪','🚪','🧱','🧱','🧱','🧱']
        ];

        return layout.map((row, y) => 
            row.map((cell, x) => {
                const classes = ['tile'];
                let content = cell;
                
                if (cell === '🧱') {
                    classes.push('wall');
                } else if (cell === '') {
                    classes.push('floor');
                } else if (cell === '👤') {
                    classes.push('character');
                    content = this.getCharacterSprite();
                } else if (cell === '🚪') {
                    classes.push('floor');
                } else {
                    classes.push('furniture');
                    if (this.isInteractive(cell)) {
                        classes.push('interactive');
                    }
                }
                
                return `<div class="${classes.join(' ')}" 
                        data-x="${x}" data-y="${y}"
                        data-item="${cell}"
                        onclick="window.activeModule.handleTileClick(${x}, ${y}, '${cell}')">
                        ${content}
                </div>`;
            }).join('')
        ).join('');
    }

    getCharacterSprite() {
        const mood = this.gameState.character.stats.mood;
        if (mood > 80) return '😄';
        if (mood > 60) return '😊';
        if (mood > 40) return '😐';
        if (mood > 20) return '😔';
        return '😢';
    }

    isInteractive(item) {
        const interactiveItems = ['📺', '🛏️', '🛋️', '📚', '🪴'];
        return interactiveItems.includes(item);
    }

    handleTileClick(x, y, item) {
        if (this.isInteractive(item)) {
            this.interactWithItem(item);
        }
    }

    interactWithItem(item) {
        const interactions = {
            '📺': { action: 'watch_tv', mood: 10, energy: -5, message: '看電視放鬆一下' },
            '🛏️': { action: 'sleep', energy: 50, mood: 10, message: '好好睡一覺' },
            '🛋️': { action: 'relax', mood: 15, energy: 10, message: '在沙發上休息' },
            '📚': { action: 'read', exp: 20, mood: -5, message: '讀書學習新知識' },
            '🪴': { action: 'water', mood: 5, message: '照顧植物' }
        };

        const interaction = interactions[item];
        if (interaction) {
            this.applyInteraction(interaction);
        }
    }

    applyInteraction(interaction) {
        const char = this.gameState.character;
        
        // 更新狀態
        if (interaction.mood) {
            char.stats.mood = Math.min(100, Math.max(0, char.stats.mood + interaction.mood));
        }
        if (interaction.energy) {
            char.stats.energy = Math.min(100, Math.max(0, char.stats.energy + interaction.energy));
        }
        if (interaction.exp) {
            this.gainExp(interaction.exp);
        }
        
        // 顯示效果
        this.showFloatingText(interaction.message, 'info');
        
        // 更新畫面
        this.updateStats();
        this.saveGameData();
    }

    renderQuests() {
        const quests = this.gameState.dailyQuests;
        return quests.map(quest => `
            <div class="quest-item ${quest.completed ? 'completed' : ''}">
                <div>
                    <span>${quest.completed ? '✅' : '⬜'}</span>
                    <span>${quest.name}</span>
                </div>
                <span class="quest-reward">+${quest.reward} EXP</span>
            </div>
        `).join('');
    }

    doAction(action) {
        const char = this.gameState.character;
        const actions = {
            work: {
                condition: () => char.stats.energy >= 20,
                effect: () => {
                    char.stats.energy -= 20;
                    char.stats.mood -= 10;
                    char.stats.hunger -= 10;
                    char.gold += 50;
                    this.gainExp(50);
                    this.completeQuest('work');
                },
                success: '完成工作！獲得 50 金幣和 50 經驗',
                failure: '能量不足，需要先休息'
            },
            rest: {
                condition: () => true,
                effect: () => {
                    char.stats.energy = Math.min(100, char.stats.energy + 30);
                    char.stats.mood += 5;
                },
                success: '休息完畢，能量恢復了',
                failure: ''
            },
            eat: {
                condition: () => char.gold >= 20,
                effect: () => {
                    char.gold -= 20;
                    char.stats.hunger = Math.min(100, char.stats.hunger + 40);
                    char.stats.mood += 10;
                    this.completeQuest('eat');
                },
                success: '吃飽了！心情也變好了',
                failure: '金幣不足'
            },
            play: {
                condition: () => char.stats.energy >= 10,
                effect: () => {
                    char.stats.energy -= 10;
                    char.stats.mood = Math.min(100, char.stats.mood + 30);
                    this.gainExp(10);
                },
                success: '玩得很開心！',
                failure: '太累了，沒力氣玩'
            },
            exercise: {
                condition: () => char.stats.energy >= 15,
                effect: () => {
                    char.stats.energy -= 15;
                    char.stats.health = Math.min(100, char.stats.health + 20);
                    char.stats.hunger -= 15;
                    this.gainExp(30);
                    this.completeQuest('exercise');
                },
                success: '運動完成！身體更健康了',
                failure: '體力不足'
            },
            shop: {
                condition: () => true,
                effect: () => {
                    this.openShop();
                },
                success: '',
                failure: ''
            }
        };

        const selectedAction = actions[action];
        if (!selectedAction) return;

        if (selectedAction.condition()) {
            selectedAction.effect();
            if (selectedAction.success) {
                this.showFloatingText(selectedAction.success, 'success');
            }
        } else {
            this.showFloatingText(selectedAction.failure, 'error');
        }

        // 更新畫面
        this.updateStats();
        this.checkGameEvents();
        this.saveGameData();
    }

    gainExp(amount) {
        const char = this.gameState.character;
        const oldLevel = char.level;
        char.exp += amount;
        
        // 檢查升級
        while (char.exp >= this.getNextLevelExp()) {
            char.exp -= this.getNextLevelExp();
            char.level++;
            this.onLevelUp();
        }
        
        this.showFloatingText(`+${amount} EXP`, 'exp');
        
        if (char.level > oldLevel) {
            this.showLevelUpEffect(char.level);
        }
    }

    getNextLevelExp() {
        return this.gameState.character.level * 100;
    }

    onLevelUp() {
        const char = this.gameState.character;
        
        // 升級獎勵
        char.gold += 100;
        char.gems += 10;
        
        // 恢復狀態
        char.stats.health = 100;
        char.stats.mood = 100;
        char.stats.energy = 100;
        char.stats.hunger = 100;
        
        // 記錄成就
        this.checkAchievements();
    }

    showLevelUpEffect(level) {
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.textContent = `LEVEL UP! LV.${level}`;
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    showFloatingText(text, type = 'info') {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            exp: '#FFA000',
            info: '#2196F3'
        };
        
        const float = document.createElement('div');
        float.className = 'floating-text';
        float.textContent = text;
        float.style.color = colors[type] || colors.info;
        
        // 隨機位置
        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
        const y = window.innerHeight / 2;
        
        float.style.left = x + 'px';
        float.style.top = y + 'px';
        
        document.body.appendChild(float);
        
        setTimeout(() => {
            float.remove();
        }, 2000);
    }

    completeQuest(type) {
        const quest = this.gameState.dailyQuests.find(q => q.type === type && !q.completed);
        if (quest) {
            quest.completed = true;
            this.gainExp(quest.reward);
            this.showFloatingText(`任務完成！+${quest.reward} EXP`, 'success');
            
            // 更新任務顯示
            const questsContainer = document.querySelector('.quests-section');
            if (questsContainer) {
                questsContainer.innerHTML = `
                    <div class="actions-title">📋 今日任務</div>
                    ${this.renderQuests()}
                `;
            }
        }
    }

    checkGameEvents() {
        const char = this.gameState.character;
        
        // 檢查狀態警告
        if (char.stats.hunger < 20) {
            this.showFloatingText('肚子好餓，該吃東西了！', 'error');
        }
        if (char.stats.energy < 20) {
            this.showFloatingText('好累，需要休息了！', 'error');
        }
        if (char.stats.mood < 20) {
            this.showFloatingText('心情不好，做點開心的事吧！', 'error');
        }
        
        // 隨時間降低狀態（模擬真實生活）
        this.gameState.ticks++;
        if (this.gameState.ticks % 10 === 0) {  // 每10次動作
            char.stats.hunger = Math.max(0, char.stats.hunger - 5);
            char.stats.energy = Math.max(0, char.stats.energy - 3);
            char.stats.mood = Math.max(0, char.stats.mood - 2);
        }
    }

    checkAchievements() {
        const char = this.gameState.character;
        const achievements = this.gameState.achievements;
        
        // 檢查等級成就
        if (char.level >= 5 && !achievements.includes('novice')) {
            achievements.push('novice');
            this.showFloatingText('🏆 成就解鎖：新手玩家', 'success');
        }
        if (char.level >= 10 && !achievements.includes('expert')) {
            achievements.push('expert');
            this.showFloatingText('🏆 成就解鎖：專業玩家', 'success');
        }
        
        // 檢查金幣成就
        if (char.gold >= 1000 && !achievements.includes('rich')) {
            achievements.push('rich');
            this.showFloatingText('🏆 成就解鎖：小富翁', 'success');
        }
    }

    openShop() {
        // 簡單的商店對話框
        const shopHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        background: white; padding: 30px; border-radius: 16px; 
                        box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 1000;">
                <h2>🛍️ 商店</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0;">
                    <button onclick="window.activeModule.buyItem('potion', 50)" 
                            style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer;">
                        🧪 能量飲料<br>50 金幣<br>(+50 能量)
                    </button>
                    <button onclick="window.activeModule.buyItem('food', 30)"
                            style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer;">
                        🍖 大餐<br>30 金幣<br>(+60 飽食)
                    </button>
                    <button onclick="window.activeModule.buyItem('game', 100)"
                            style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer;">
                        🎮 遊戲機<br>100 金幣<br>(永久 +10 心情)
                    </button>
                    <button onclick="window.activeModule.buyItem('book', 80)"
                            style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer;">
                        📚 技能書<br>80 金幣<br>(+100 經驗)
                    </button>
                </div>
                <button onclick="this.parentElement.remove()"
                        style="padding: 10px 20px; background: #667eea; color: white; 
                               border: none; border-radius: 8px; cursor: pointer;">
                    關閉商店
                </button>
            </div>
        `;
        
        const shopDiv = document.createElement('div');
        shopDiv.innerHTML = shopHTML;
        document.body.appendChild(shopDiv);
    }

    buyItem(item, cost) {
        const char = this.gameState.character;
        
        if (char.gold < cost) {
            this.showFloatingText('金幣不足！', 'error');
            return;
        }
        
        char.gold -= cost;
        
        switch(item) {
            case 'potion':
                char.stats.energy = Math.min(100, char.stats.energy + 50);
                this.showFloatingText('購買成功！能量大幅恢復', 'success');
                break;
            case 'food':
                char.stats.hunger = Math.min(100, char.stats.hunger + 60);
                this.showFloatingText('購買成功！吃得好飽', 'success');
                break;
            case 'game':
                char.stats.mood = 100;
                this.gameState.items.push('game_console');
                this.showFloatingText('購買成功！獲得遊戲機', 'success');
                break;
            case 'book':
                this.gainExp(100);
                this.showFloatingText('購買成功！獲得大量經驗', 'success');
                break;
        }
        
        this.updateStats();
        this.saveGameData();
    }

    updateStats() {
        // 更新所有顯示的數值
        const char = this.gameState.character;
        
        // 檢查DOM元素是否存在
        const levelBadge = document.querySelector('.level-badge');
        const expFill = document.querySelector('.exp-fill');
        const expText = document.querySelector('.exp-text');
        
        if (!levelBadge || !expFill || !expText) {
            console.log('DOM元素尚未載入，跳過統計更新');
            return;
        }
        
        // 更新等級和經驗
        levelBadge.textContent = `Lv.${char.level}`;
        expFill.style.width = `${(char.exp / this.getNextLevelExp()) * 100}%`;
        expText.textContent = `${char.exp}/${this.getNextLevelExp()} EXP`;
        
        // 更新資源
        const goldEl = document.querySelector('.gold');
        const gemsEl = document.querySelector('.gems');
        if (goldEl) goldEl.innerHTML = `💰 ${char.gold}`;
        if (gemsEl) gemsEl.innerHTML = `💎 ${char.gems}`;
        
        // 更新狀態條
        const healthFill = document.querySelector('.health-fill');
        const moodFill = document.querySelector('.mood-fill');
        const energyFill = document.querySelector('.energy-fill');
        const hungerFill = document.querySelector('.hunger-fill');
        
        if (healthFill) healthFill.style.width = `${char.stats.health}%`;
        if (moodFill) moodFill.style.width = `${char.stats.mood}%`;
        if (energyFill) energyFill.style.width = `${char.stats.energy}%`;
        if (hungerFill) hungerFill.style.width = `${char.stats.hunger}%`;
        
        // 更新狀態文字
        const statTextElements = document.querySelectorAll('.stat-text');
        if (statTextElements.length > 0) {
            statTextElements.forEach((el, i) => {
                const stats = ['health', 'mood', 'energy', 'hunger'];
                if (el) el.textContent = `${char.stats[stats[i]]}/100`;
            });
        }
        
        // 更新角色表情
        const roomDiv = document.getElementById('gameRoom');
        if (roomDiv) {
            const charTile = roomDiv.querySelector('.character');
            if (charTile) {
                charTile.textContent = this.getCharacterSprite();
            }
        }
    }

    initGame() {
        // 初始化遊戲
        this.updateStats();
        
        // 每秒更新一次（模擬時間流逝）
        setInterval(() => {
            this.checkGameEvents();
            this.updateStats();
        }, 5000);  // 每5秒檢查一次
        
        // 每日重置任務（真實時間）
        this.checkDailyReset();
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.gameState.lastLogin !== today) {
            this.gameState.lastLogin = today;
            // 重置每日任務
            this.gameState.dailyQuests = this.generateDailyQuests();
            this.showFloatingText('新的一天開始了！任務已重置', 'info');
            this.saveGameData();
        }
    }

    generateDailyQuests() {
        return [
            { type: 'work', name: '完成3次工作', completed: false, reward: 100 },
            { type: 'exercise', name: '運動1次', completed: false, reward: 50 },
            { type: 'eat', name: '吃飯2次', completed: false, reward: 30 }
        ];
    }

    async loadGameData(uuid) {
        try {
            const data = await this.syncManager.load(uuid, 'life-simulator');
            if (data && data.gameState) {
                this.gameState = data.gameState;
                // 檢查是否需要重置每日任務
                this.checkDailyReset();
            } else {
                // 新玩家，初始化遊戲狀態
                this.gameState = this.getDefaultGameState();
            }
        } catch (error) {
            console.error('載入遊戲失敗:', error);
            this.gameState = this.getDefaultGameState();
        }
    }

    async saveGameData() {
        try {
            await this.syncManager.save(
                this.currentUser,
                'life-simulator',
                { gameState: this.gameState }
            );
        } catch (error) {
            console.error('儲存遊戲失敗:', error);
            // 備份到 localStorage
            localStorage.setItem(
                `gamelife_life-simulator_${this.currentUser}`,
                JSON.stringify(this.gameState)
            );
        }
    }

    getDefaultGameState() {
        return {
            character: {
                level: 1,
                exp: 0,
                gold: 100,
                gems: 0,
                stats: {
                    health: 100,
                    mood: 80,
                    energy: 100,
                    hunger: 70
                }
            },
            items: [],
            achievements: [],
            dailyQuests: this.generateDailyQuests(),
            lastLogin: new Date().toDateString(),
            ticks: 0
        };
    }

    destroy() {
        // 儲存遊戲
        if (this.gameState) {
            this.saveGameData();
        }
        
        // 清理計時器
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        // 清理資源
        this.syncManager = null;
        this.currentUser = null;
        this.gameState = null;
        
        if (window.activeModule === this) {
            window.activeModule = null;
        }
    }
}

export { LifeSimulatorModule };