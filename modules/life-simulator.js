/**
 * 人生模擬器 2.0 - 真正好玩的版本
 * 角色可以在房間走動、互動、升級房間、解鎖新區域
 * @version 2.0.0
 */

class LifeSimulatorModule {
    static moduleInfo = {
        id: 'life-simulator',
        name: '人生大亨',
        subtitle: '從小套房到豪宅的奮鬥之旅',
        description: '控制角色在房間移動、工作賺錢、升級房子、收集家具、達成人生目標',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>',
        version: '2.0.0',
        author: 'william'
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.gameState = null;
        this.keyboardHandler = null;
        this.gameLoop = null;
        this.autoSaveTimer = null;
    }

    async render(uuid) {
        window.activeModule = this;
        this.currentUser = uuid;
        
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        await this.loadGameData(uuid);
        
        const container = document.getElementById('moduleContainer');
        container.innerHTML = this.getHTML();
        
        this.initGame();
        // 移除不存在的 startGameLoop 調用
        
        this.autoSaveTimer = setInterval(() => {
            this.saveGameData();
        }, 30000); // 每30秒自動存檔
    }

    getHTML() {
        const g = this.gameState;
        const room = this.getRoomConfig();
        
        return `
            <style>
                /* 遊戲主容器 */
                .life-game {
                    height: 100%;
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 20px;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                /* 左側遊戲區 */
                .game-area {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                /* 頂部資訊列 */
                .top-bar {
                    background: rgba(255,255,255,0.95);
                    border-radius: 12px;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .player-level {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .level-circle {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                    color: white;
                    box-shadow: 0 2px 10px rgba(255,215,0,0.5);
                }

                .exp-bar {
                    width: 150px;
                    height: 8px;
                    background: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .exp-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #8BC34A);
                    transition: width 0.3s;
                }

                .resources {
                    display: flex;
                    gap: 30px;
                    font-size: 18px;
                    font-weight: bold;
                }

                .money {
                    color: #4CAF50;
                }

                .energy {
                    color: #2196F3;
                }

                .happiness {
                    color: #FF9800;
                }

                /* 遊戲房間 */
                .room-container {
                    background: rgba(255,255,255,0.95);
                    border-radius: 12px;
                    padding: 20px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .room-name {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #333;
                }

                .game-canvas {
                    flex: 1;
                    background: #2C3E50;
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                    min-height: 400px;
                    cursor: pointer;
                    image-rendering: pixelated;
                }

                /* 遊戲元素 */
                .game-tile {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    transition: all 0.15s ease;
                    user-select: none;
                }

                .tile-floor {
                    background: linear-gradient(135deg, #8D6E63, #6D4C41);
                    z-index: 1;
                }

                .tile-wall {
                    background: linear-gradient(135deg, #37474F, #263238);
                    z-index: 2;
                }

                .tile-door {
                    background: linear-gradient(135deg, #795548, #5D4037);
                    z-index: 2;
                    cursor: pointer;
                }

                .tile-furniture {
                    z-index: 3;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                }

                .tile-character {
                    z-index: 10;
                    animation: characterBreathe 2s ease-in-out infinite;
                    filter: drop-shadow(0 0 10px rgba(255,215,0,0.5));
                }

                @keyframes characterBreathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .tile-interactive {
                    cursor: pointer;
                    animation: glow 2s ease-in-out infinite;
                }

                @keyframes glow {
                    0%, 100% { filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.3)); }
                    50% { filter: brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.6)); }
                }

                .tile-collectible {
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }

                /* 控制提示 */
                .controls-hint {
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 8px;
                    margin-top: 10px;
                    text-align: center;
                    font-size: 14px;
                }

                .controls-hint kbd {
                    background: rgba(255,255,255,0.2);
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin: 0 2px;
                }

                /* 右側面板 */
                .side-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                /* 任務面板 */
                .quest-panel {
                    background: rgba(255,255,255,0.95);
                    border-radius: 12px;
                    padding: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .quest-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #333;
                }

                .quest-item {
                    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .quest-item:hover {
                    transform: translateX(5px);
                    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                }

                .quest-item.completed {
                    background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
                    text-decoration: line-through;
                    opacity: 0.7;
                }

                .quest-reward {
                    font-size: 12px;
                    color: #FF9800;
                    font-weight: bold;
                }

                /* 商店面板 */
                .shop-panel {
                    background: rgba(255,255,255,0.95);
                    border-radius: 12px;
                    padding: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .shop-item {
                    background: white;
                    border: 2px solid #e0e0e0;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .shop-item:hover {
                    border-color: #667eea;
                    transform: scale(1.02);
                }

                .shop-item.affordable {
                    border-color: #4CAF50;
                }

                .shop-item.owned {
                    background: #e8f5e9;
                    border-color: #4CAF50;
                    opacity: 0.7;
                }

                .shop-price {
                    font-weight: bold;
                    color: #4CAF50;
                }

                /* 動作菜單 */
                .action-menu {
                    position: absolute;
                    background: white;
                    border: 2px solid #667eea;
                    border-radius: 8px;
                    padding: 5px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 100;
                    display: none;
                }

                .action-menu.show {
                    display: block;
                }

                .action-item {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .action-item:hover {
                    background: #667eea;
                    color: white;
                }

                /* 對話框 */
                .dialog-box {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    max-width: 400px;
                    text-align: center;
                    z-index: 50;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

                /* 特效 */
                .particle {
                    position: absolute;
                    pointer-events: none;
                    animation: particleFloat 1s ease-out forwards;
                    z-index: 100;
                    font-size: 20px;
                    font-weight: bold;
                }

                @keyframes particleFloat {
                    0% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-30px); }
                }

                /* 升級動畫 */
                .level-up-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.5s ease;
                }

                .level-up-content {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    animation: bounceIn 0.5s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes bounceIn {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                .level-up-title {
                    font-size: 36px;
                    color: #FFD700;
                    margin-bottom: 20px;
                    text-shadow: 0 0 20px rgba(255,215,0,0.5);
                }

                .level-up-rewards {
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                }

                .level-up-close {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 10px 30px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                }

                /* 手機版 */
                @media (max-width: 768px) {
                    .life-game {
                        grid-template-columns: 1fr;
                    }
                    
                    .side-panel {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                    }
                }
            </style>

            <div class="life-game">
                <!-- 左側遊戲區 -->
                <div class="game-area">
                    <!-- 頂部資訊 -->
                    <div class="top-bar">
                        <div class="player-level">
                            <div class="level-circle">${g.level}</div>
                            <div>
                                <div style="font-weight: bold;">${this.getLevelTitle()}</div>
                                <div class="exp-bar">
                                    <div class="exp-fill" style="width: ${(g.exp / this.getNextLevelExp()) * 100}%"></div>
                                </div>
                                <div style="font-size: 12px; color: #666;">${g.exp}/${this.getNextLevelExp()} EXP</div>
                            </div>
                        </div>
                        <div class="resources">
                            <div class="money">💰 $${g.money}</div>
                            <div class="energy">⚡ ${g.energy}/100</div>
                            <div class="happiness">😊 ${g.happiness}/100</div>
                        </div>
                    </div>

                    <!-- 遊戲房間 -->
                    <div class="room-container">
                        <div class="room-name">🏠 ${room.name}</div>
                        <div class="game-canvas" id="gameCanvas">
                            ${this.renderRoom()}
                        </div>
                        <div class="controls-hint">
                            使用 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 或 <kbd>方向鍵</kbd> 移動 | <kbd>空白鍵</kbd> 互動 | 點擊物品查看選項
                        </div>
                    </div>
                </div>

                <!-- 右側面板 -->
                <div class="side-panel">
                    <!-- 當前目標 -->
                    <div class="quest-panel">
                        <div class="quest-title">🎯 當前目標</div>
                        ${this.renderQuests()}
                    </div>

                    <!-- 可購買項目 -->
                    <div class="shop-panel">
                        <div class="quest-title">🛍️ 商店</div>
                        ${this.renderShop()}
                    </div>

                    <!-- 成就 -->
                    <div class="quest-panel">
                        <div class="quest-title">🏆 成就進度</div>
                        ${this.renderAchievements()}
                    </div>
                </div>
            </div>

            <!-- 動作菜單（隱藏） -->
            <div class="action-menu" id="actionMenu"></div>

            <!-- 對話框（動態顯示） -->
            <div id="dialogContainer"></div>
        `;
    }

    renderRoom() {
        const room = this.getRoomConfig();
        const tiles = [];
        
        // 生成房間格子
        for (let y = 0; y < room.height; y++) {
            for (let x = 0; x < room.width; x++) {
                const index = y * room.width + x;
                const tile = room.layout[index];
                
                let tileClass = 'game-tile tile-floor';
                let content = '';
                let interactive = false;
                
                // 判斷格子類型
                if (tile === '#') {
                    tileClass = 'game-tile tile-wall';
                } else if (tile === 'D') {
                    tileClass = 'game-tile tile-door';
                    content = '🚪';
                    interactive = true;
                } else if (tile === 'P') {
                    // 玩家位置
                    tileClass = 'game-tile tile-floor tile-character';
                    content = this.getCharacterSprite();
                } else if (room.furniture[tile]) {
                    // 家具
                    const furniture = room.furniture[tile];
                    tileClass = `game-tile tile-floor tile-furniture ${furniture.interactive ? 'tile-interactive' : ''}`;
                    content = furniture.icon;
                    interactive = furniture.interactive;
                } else if (room.items[tile]) {
                    // 可收集物品
                    const item = room.items[tile];
                    tileClass = 'game-tile tile-floor tile-collectible';
                    content = item.icon;
                    interactive = true;
                }
                
                tiles.push(`
                    <div class="${tileClass}"
                         style="left: ${x * 40}px; top: ${y * 40}px;"
                         data-x="${x}" data-y="${y}"
                         data-tile="${tile}"
                         ${interactive ? `onclick="window.activeModule.handleTileClick(${x}, ${y})"` : ''}>
                        ${content}
                    </div>
                `);
            }
        }
        
        return tiles.join('');
    }

    getRoomConfig() {
        const level = this.gameState.level;
        
        // 根據等級返回不同的房間配置
        const rooms = {
            1: {
                name: '破舊小套房',
                width: 8,
                height: 6,
                layout: [
                    '#','#','#','#','#','#','#','#',
                    '#','B','.','.','.','.','T','#',
                    '#','.','.','.','P','.','.','.#',
                    '#','.','.','.','.','.','.','#',
                    '#','C','.','.','.','.','$','#',
                    '#','#','#','D','D','#','#','#'
                ].join(''),
                furniture: {
                    'B': { icon: '🛏️', name: '破舊的床', interactive: true, action: 'sleep' },
                    'T': { icon: '📺', name: '老電視', interactive: true, action: 'watch' },
                    'C': { icon: '💻', name: '舊電腦', interactive: true, action: 'work' }
                },
                items: {
                    '$': { icon: '💵', name: '錢包', value: 50 }
                }
            },
            5: {
                name: '舒適公寓',
                width: 10,
                height: 8,
                layout: [
                    '#','#','#','#','#','#','#','#','#','#',
                    '#','B','B','.','.','.','.','K','K','#',
                    '#','.','.','.','.','.','.','.','K','#',
                    '#','S','S','.','P','.','.','.','.','#',
                    '#','S','S','.','.','.','T','T','.','#',
                    '#','.','.','.','.','.','.','.','.','#',
                    '#','C','C','.','.','.','$','G','.','#',
                    '#','#','#','#','D','D','#','#','#','#'
                ].join(''),
                furniture: {
                    'B': { icon: '🛏️', name: '雙人床', interactive: true, action: 'sleep' },
                    'T': { icon: '📺', name: '大電視', interactive: true, action: 'watch' },
                    'C': { icon: '💻', name: '工作站', interactive: true, action: 'work' },
                    'S': { icon: '🛋️', name: '沙發', interactive: true, action: 'relax' },
                    'K': { icon: '🍳', name: '廚房', interactive: true, action: 'cook' },
                    'G': { icon: '🎮', name: '遊戲機', interactive: true, action: 'play' }
                },
                items: {
                    '$': { icon: '💰', name: '金幣', value: 100 }
                }
            },
            10: {
                name: '豪華別墅',
                width: 12,
                height: 10,
                layout: [
                    '#','#','#','#','#','#','#','#','#','#','#','#',
                    '#','B','B','B','.','.','.','.','.','K','K','#',
                    '#','B','B','B','.','.','.','.','.','K','K','#',
                    '#','.','.','.','.','.','.','.','.','.','.','#',
                    '#','S','S','.','.','P','.','.','.','T','T','#',
                    '#','S','S','.','.','.','.','.','.','T','T','#',
                    '#','.','.','.','.','.','.','.','.','.','.','#',
                    '#','C','C','.','.','.','.','.','G','G','.','#',
                    '#','C','C','.','.','.','$','.','G','G','.','#',
                    '#','#','#','#','#','D','D','#','#','#','#','#'
                ].join(''),
                furniture: {
                    'B': { icon: '👑', name: '國王床', interactive: true, action: 'sleep' },
                    'T': { icon: '🖥️', name: '家庭影院', interactive: true, action: 'watch' },
                    'C': { icon: '💻', name: '辦公室', interactive: true, action: 'work' },
                    'S': { icon: '🛋️', name: '豪華沙發', interactive: true, action: 'relax' },
                    'K': { icon: '👨‍🍳', name: '專業廚房', interactive: true, action: 'cook' },
                    'G': { icon: '🕹️', name: '遊戲室', interactive: true, action: 'play' }
                },
                items: {
                    '$': { icon: '💎', name: '鑽石', value: 500 }
                }
            }
        };
        
        // 根據等級選擇房間
        if (level >= 10) return rooms[10];
        if (level >= 5) return rooms[5];
        return rooms[1];
    }

    getCharacterSprite() {
        const happiness = this.gameState.happiness;
        if (happiness > 80) return '😎';  // 超開心
        if (happiness > 60) return '😊';  // 開心
        if (happiness > 40) return '🙂';  // 普通
        if (happiness > 20) return '😐';  // 無聊
        return '😢';  // 難過
    }

    getLevelTitle() {
        const level = this.gameState.level;
        if (level < 5) return '窮光蛋';
        if (level < 10) return '小職員';
        if (level < 15) return '主管';
        if (level < 20) return '經理';
        if (level < 30) return '總監';
        if (level < 50) return '老闆';
        return '富豪';
    }

    renderQuests() {
        // 確保 inventory 屬性存在
        if (!this.gameState.inventory) {
            this.gameState.inventory = [];
        }
        
        const quests = [
            { 
                name: `達到等級 ${this.gameState.level + 1}`,
                progress: `${this.gameState.exp}/${this.getNextLevelExp()}`,
                reward: '解鎖新物品'
            },
            {
                name: '賺取 $1000',
                progress: `$${this.gameState.money}/1000`,
                reward: '成就點數',
                completed: this.gameState.money >= 1000
            },
            {
                name: '收集5個物品',
                progress: `${this.gameState.inventory.length}/5`,
                reward: '神秘獎勵'
            }
        ];
        
        return quests.map(q => `
            <div class="quest-item ${q.completed ? 'completed' : ''}">
                <div>
                    <div>${q.name}</div>
                    <div style="font-size: 12px; color: #666;">${q.progress}</div>
                </div>
                <div class="quest-reward">${q.reward}</div>
            </div>
        `).join('');
    }

    renderShop() {
        const items = [
            { id: 'coffee', name: '☕ 咖啡', price: 20, effect: '+20能量', owned: false },
            { id: 'pizza', name: '🍕 披薩', price: 30, effect: '+15快樂', owned: false },
            { id: 'book', name: '📚 技能書', price: 100, effect: '+50經驗', owned: false },
            { id: 'plant', name: '🌱 盆栽', price: 150, effect: '房間美化', owned: this.gameState.items.includes('plant') },
            { id: 'painting', name: '🖼️ 名畫', price: 500, effect: '永久+10快樂', owned: this.gameState.items.includes('painting') }
        ];
        
        return items.map(item => {
            const affordable = this.gameState.money >= item.price;
            return `
                <div class="shop-item ${affordable ? 'affordable' : ''} ${item.owned ? 'owned' : ''}"
                     onclick="window.activeModule.buyItem('${item.id}', ${item.price})">
                    <div>
                        <div>${item.name}</div>
                        <div style="font-size: 12px; color: #666;">${item.effect}</div>
                    </div>
                    <div class="shop-price">
                        ${item.owned ? '已擁有' : `$${item.price}`}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAchievements() {
        const achievements = [
            { name: '第一桶金', desc: '賺到$100', done: this.gameState.totalEarned >= 100 },
            { name: '工作狂', desc: '工作10次', done: this.gameState.workCount >= 10 },
            { name: '收藏家', desc: '收集10個物品', done: (this.gameState.inventory || []).length >= 10 },
            { name: '富豪', desc: '存款$10000', done: this.gameState.money >= 10000 }
        ];
        
        const completed = achievements.filter(a => a.done).length;
        const total = achievements.length;
        
        return `
            <div style="margin-bottom: 10px;">
                <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #FFD700, #FFA500); 
                                height: 100%; width: ${(completed/total)*100}%;
                                transition: width 0.5s;"></div>
                </div>
                <div style="text-align: center; margin-top: 5px; font-size: 12px;">
                    ${completed}/${total} 完成
                </div>
            </div>
        `;
    }

    initGame() {
        // 綁定鍵盤控制
        this.keyboardHandler = (e) => {
            const key = e.key.toLowerCase();
            const moves = {
                'w': { dx: 0, dy: -1 },
                'arrowup': { dx: 0, dy: -1 },
                's': { dx: 0, dy: 1 },
                'arrowdown': { dx: 0, dy: 1 },
                'a': { dx: -1, dy: 0 },
                'arrowleft': { dx: -1, dy: 0 },
                'd': { dx: 1, dy: 0 },
                'arrowright': { dx: 1, dy: 0 }
            };
            
            if (moves[key]) {
                e.preventDefault();
                this.movePlayer(moves[key].dx, moves[key].dy);
            } else if (key === ' ') {
                e.preventDefault();
                this.interact();
            }
        };
        
        document.addEventListener('keydown', this.keyboardHandler);
        
        // 點擊移動
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / 40);
            const y = Math.floor((e.clientY - rect.top) / 40);
            this.moveToPosition(x, y);
        });
    }

    movePlayer(dx, dy) {
        const newX = this.gameState.playerX + dx;
        const newY = this.gameState.playerY + dy;
        const room = this.getRoomConfig();
        
        // 檢查邊界
        if (newX < 0 || newX >= room.width || newY < 0 || newY >= room.height) {
            return;
        }
        
        // 檢查碰撞
        const tileIndex = newY * room.width + newX;
        const tile = room.layout[tileIndex];
        
        if (tile === '#') {
            // 撞牆
            this.showMessage('撞牆了！');
            return;
        }
        
        if (tile === 'D') {
            // 門
            this.showMessage('這是出口，等級10才能出去探索！');
            if (this.gameState.level >= 10) {
                this.unlockNewArea();
            }
            return;
        }
        
        // 檢查物品
        if (room.items[tile]) {
            this.collectItem(tile, room.items[tile]);
        }
        
        // 移動角色
        this.gameState.playerX = newX;
        this.gameState.playerY = newY;
        
        // 消耗能量
        this.gameState.energy = Math.max(0, this.gameState.energy - 1);
        
        // 更新顯示
        this.updateRoom();
        this.updateStats();
    }

    moveToPosition(targetX, targetY) {
        // 簡單的尋路：直線移動
        const dx = targetX - this.gameState.playerX;
        const dy = targetY - this.gameState.playerY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.movePlayer(Math.sign(dx), 0);
        } else if (dy !== 0) {
            this.movePlayer(0, Math.sign(dy));
        }
    }

    interact() {
        const room = this.getRoomConfig();
        
        // 檢查周圍8個格子
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const x = this.gameState.playerX + dx;
                const y = this.gameState.playerY + dy;
                const tileIndex = y * room.width + x;
                const tile = room.layout[tileIndex];
                
                if (room.furniture[tile]) {
                    this.useFurniture(room.furniture[tile]);
                    return;
                }
            }
        }
        
        this.showMessage('附近沒有可互動的物品');
    }

    useFurniture(furniture) {
        const actions = {
            'sleep': () => {
                this.gameState.energy = Math.min(100, this.gameState.energy + 50);
                this.gameState.happiness += 10;
                this.showMessage('睡了一覺，精力充沛！');
                this.addParticle('💤');
            },
            'work': () => {
                if (this.gameState.energy < 20) {
                    this.showMessage('太累了，無法工作');
                    return;
                }
                this.gameState.energy -= 20;
                const earned = Math.floor(50 + Math.random() * 50);
                this.gameState.money += earned;
                this.gameState.totalEarned += earned;
                this.gameState.workCount++;
                this.gainExp(30);
                this.showMessage(`工作完成！賺了 $${earned}`);
                this.addParticle(`+$${earned}`);
            },
            'watch': () => {
                this.gameState.happiness = Math.min(100, this.gameState.happiness + 20);
                this.showMessage('看電視放鬆，心情變好了');
                this.addParticle('📺');
            },
            'relax': () => {
                this.gameState.energy += 10;
                this.gameState.happiness += 15;
                this.showMessage('在沙發上休息');
                this.addParticle('😌');
            },
            'cook': () => {
                if (this.gameState.money < 10) {
                    this.showMessage('沒錢買食材');
                    return;
                }
                this.gameState.money -= 10;
                this.gameState.energy += 25;
                this.gameState.happiness += 10;
                this.showMessage('做了一頓美食');
                this.addParticle('🍳');
            },
            'play': () => {
                this.gameState.happiness = Math.min(100, this.gameState.happiness + 30);
                this.gameState.energy -= 10;
                this.gainExp(10);
                this.showMessage('玩遊戲好開心！');
                this.addParticle('🎮');
            }
        };
        
        const action = actions[furniture.action];
        if (action) {
            action();
            this.updateStats();
            this.checkAchievements();
        }
    }

    collectItem(tileType, item) {
        // 收集物品
        if (!this.gameState.inventory) {
            this.gameState.inventory = [];
        }
        this.gameState.inventory.push(item.name);
        
        if (item.value) {
            this.gameState.money += item.value;
            this.showMessage(`撿到 ${item.name}！獲得 $${item.value}`);
            this.addParticle(`+$${item.value}`);
        } else {
            this.showMessage(`獲得 ${item.name}！`);
        }
        
        // 從地圖上移除
        const room = this.getRoomConfig();
        delete room.items[tileType];
        
        this.updateRoom();
        this.checkAchievements();
    }

    buyItem(itemId, price) {
        if (this.gameState.money < price) {
            this.showMessage('錢不夠！');
            return;
        }
        
        if (this.gameState.items.includes(itemId)) {
            this.showMessage('已經擁有了！');
            return;
        }
        
        this.gameState.money -= price;
        
        const effects = {
            'coffee': () => {
                this.gameState.energy = Math.min(100, this.gameState.energy + 20);
                this.showMessage('喝了咖啡，精神百倍！');
            },
            'pizza': () => {
                this.gameState.happiness = Math.min(100, this.gameState.happiness + 15);
                this.showMessage('吃了披薩，好滿足！');
            },
            'book': () => {
                this.gainExp(50);
                this.showMessage('讀完書，學到很多！');
            },
            'plant': () => {
                this.gameState.items.push('plant');
                this.showMessage('房間變漂亮了！');
            },
            'painting': () => {
                this.gameState.items.push('painting');
                this.gameState.happiness = Math.min(100, this.gameState.happiness + 10);
                this.showMessage('掛上名畫，品味提升！');
            }
        };
        
        if (effects[itemId]) {
            effects[itemId]();
        }
        
        this.updateStats();
        this.updateShop();
    }

    gainExp(amount) {
        this.gameState.exp += amount;
        this.addParticle(`+${amount} EXP`);
        
        // 檢查升級
        while (this.gameState.exp >= this.getNextLevelExp()) {
            this.gameState.exp -= this.getNextLevelExp();
            this.levelUp();
        }
        
        this.updateStats();
    }

    getNextLevelExp() {
        return this.gameState.level * 100;
    }

    levelUp() {
        this.gameState.level++;
        
        // 升級獎勵
        this.gameState.money += 100 * this.gameState.level;
        this.gameState.energy = 100;
        this.gameState.happiness = 100;
        
        // 顯示升級動畫
        this.showLevelUpAnimation();
        
        // 如果房間升級了，重新渲染
        if (this.gameState.level === 5 || this.gameState.level === 10) {
            this.updateRoom();
            this.showMessage('房間升級了！');
        }
    }

    showLevelUpAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'level-up-overlay';
        overlay.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-title">🎉 LEVEL UP! 🎉</div>
                <div style="font-size: 48px; margin: 20px 0;">
                    Level ${this.gameState.level}
                </div>
                <div class="level-up-rewards">
                    <div>獎勵：</div>
                    <div>💰 +$${100 * this.gameState.level}</div>
                    <div>⚡ 能量全滿</div>
                    <div>😊 快樂全滿</div>
                </div>
                <button class="level-up-close" onclick="this.parentElement.parentElement.remove()">
                    太棒了！
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    showMessage(text) {
        const container = document.getElementById('dialogContainer');
        const dialog = document.createElement('div');
        dialog.className = 'dialog-box';
        dialog.textContent = text;
        container.appendChild(dialog);
        
        setTimeout(() => {
            dialog.remove();
        }, 2000);
    }

    addParticle(text) {
        const canvas = document.getElementById('gameCanvas');
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = text;
        particle.style.left = `${this.gameState.playerX * 40 + 20}px`;
        particle.style.top = `${this.gameState.playerY * 40}px`;
        particle.style.color = text.includes('$') ? '#4CAF50' : '#FFD700';
        canvas.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    updateRoom() {
        const canvas = document.getElementById('gameCanvas');
        canvas.innerHTML = this.renderRoom();
    }

    updateStats() {
        // 更新頂部資訊
        document.querySelector('.level-circle').textContent = this.gameState.level;
        document.querySelector('.exp-fill').style.width = 
            `${(this.gameState.exp / this.getNextLevelExp()) * 100}%`;
        document.querySelector('.money').textContent = `💰 $${this.gameState.money}`;
        document.querySelector('.energy').textContent = `⚡ ${this.gameState.energy}/100`;
        document.querySelector('.happiness').textContent = `😊 ${this.gameState.happiness}/100`;
        
        // 更新任務
        const questPanel = document.querySelector('.quest-panel');
        questPanel.innerHTML = `
            <div class="quest-title">🎯 當前目標</div>
            ${this.renderQuests()}
        `;
    }

    updateShop() {
        const shopPanel = document.querySelector('.shop-panel');
        shopPanel.innerHTML = `
            <div class="quest-title">🛍️ 商店</div>
            ${this.renderShop()}
        `;
    }

    checkAchievements() {
        // 檢查成就
        if (!this.gameState.achievements) {
            this.gameState.achievements = [];
        }
        const oldAchievements = [...this.gameState.achievements];
        
        if (this.gameState.totalEarned >= 100 && !(this.gameState.achievements || []).includes('first_money')) {
            if (!this.gameState.achievements) {
                this.gameState.achievements = [];
            }
            this.gameState.achievements.push('first_money');
            this.showMessage('🏆 成就解鎖：第一桶金！');
        }
        
        if (this.gameState.workCount >= 10 && !(this.gameState.achievements || []).includes('workaholic')) {
            if (!this.gameState.achievements) {
                this.gameState.achievements = [];
            }
            this.gameState.achievements.push('workaholic');
            this.showMessage('🏆 成就解鎖：工作狂！');
        }
        
        if ((this.gameState.inventory || []).length >= 10 && !(this.gameState.achievements || []).includes('collector')) {
            if (!this.gameState.achievements) {
                this.gameState.achievements = [];
            }
            this.gameState.achievements.push('collector');
            this.showMessage('🏆 成就解鎖：收藏家！');
        }
        
        // 更新成就顯示
        if (oldAchievements.length !== this.gameState.achievements.length) {
            const achievementPanel = document.querySelectorAll('.quest-panel')[1];
            achievementPanel.innerHTML = `
                <div class="quest-title">🏆 成就進度</div>
                ${this.renderAchievements()}
            `;
        }
    }

    startGameLoop() {
        // 遊戲主循環（每秒執行）
        this.gameLoop = setInterval(() => {
            // 時間流逝效果
            this.gameState.ticks++;
            
            // 每10秒消耗資源
            if (this.gameState.ticks % 10 === 0) {
                this.gameState.energy = Math.max(0, this.gameState.energy - 2);
                this.gameState.happiness = Math.max(0, this.gameState.happiness - 1);
                
                // 能量太低警告
                if (this.gameState.energy < 20) {
                    this.showMessage('能量不足，需要休息！');
                }
                
                // 快樂太低警告
                if (this.gameState.happiness < 20) {
                    this.showMessage('心情不好，做點開心的事吧！');
                }
                
                this.updateStats();
            }
        }, 1000);
    }

    handleTileClick(x, y) {
        // 處理點擊事件
        const room = this.getRoomConfig();
        const tileIndex = y * room.width + x;
        const tile = room.layout[tileIndex];
        
        if (room.furniture[tile]) {
            // 顯示動作菜單
            this.showActionMenu(x, y, room.furniture[tile]);
        }
    }

    showActionMenu(x, y, furniture) {
        const menu = document.getElementById('actionMenu');
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        menu.style.left = `${rect.left + x * 40}px`;
        menu.style.top = `${rect.top + y * 40}px`;
        menu.className = 'action-menu show';
        
        menu.innerHTML = `
            <div class="action-item" onclick="window.activeModule.useFurniture({action: '${furniture.action}'})">
                使用 ${furniture.name}
            </div>
            <div class="action-item" onclick="window.activeModule.hideActionMenu()">
                取消
            </div>
        `;
    }

    hideActionMenu() {
        const menu = document.getElementById('actionMenu');
        menu.className = 'action-menu';
    }

    createDefaultGameState() {
        return {
            level: 1,
            money: 100,
            energy: 100,
            happiness: 100,
            playerX: 5,
            playerY: 5,
            currentRoom: 'studio',
            inventory: [],
            furniture: [],
            achievements: [],
            exp: 0,
            roomLevel: 1
        };
    }

    async loadGameData(uuid) {
        try {
            const data = await this.syncManager.load(uuid, 'life-simulator');
            if (data && data.gameState) {
                this.gameState = data.gameState;
            } else {
                this.gameState = this.createDefaultGameState();
            }
        } catch (error) {
            console.error('載入遊戲失敗:', error);
            this.gameState = this.createDefaultGameState();
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
        }
    }

    getDefaultGameState() {
        return {
            level: 1,
            exp: 0,
            money: 100,
            energy: 100,
            happiness: 80,
            playerX: 4,
            playerY: 2,
            inventory: [],
            items: [],
            achievements: [],
            totalEarned: 0,
            workCount: 0,
            ticks: 0
        };
    }

    destroy() {
        // 清理資源
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        // 儲存遊戲
        if (this.gameState) {
            this.saveGameData();
        }
        
        this.syncManager = null;
        this.currentUser = null;
        this.gameState = null;
        
        if (window.activeModule === this) {
            window.activeModule = null;
        }
    }
}

export { LifeSimulatorModule };