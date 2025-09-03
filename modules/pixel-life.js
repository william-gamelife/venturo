/**
 * 像素風人生模擬器 - Pixel Life
 * 真正的復古像素風格，16x16 格子，限定色彩
 * @version 3.0.0
 */

class PixelLifeModule {
    static moduleInfo = {
        id: 'pixel-life',
        name: 'PIXEL LIFE',
        subtitle: '復古像素風人生模擬器',
        description: '8-bit 風格的人生冒險，從貧民窟到豪宅的像素之旅',
        icon: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="4" height="4" fill="currentColor"/><rect x="8" y="4" width="4" height="4" fill="currentColor"/><rect x="12" y="4" width="4" height="4" fill="currentColor"/><rect x="16" y="4" width="4" height="4" fill="currentColor"/></svg>',
        version: '3.0.0',
        author: 'william'
    };

    
    // Toast 通知系統
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">
                    ${type === 'success' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' : type === 'error' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' : 'ⓘ'}
                </span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // 添加樣式（如果尚未存在）
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    min-width: 300px;
                    padding: 12px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    animation: toastSlideIn 0.3s ease;
                }
                .toast-info { background: #e3f2fd; border-left: 4px solid #2196f3; color: #1976d2; }
                .toast-success { background: #e8f5e8; border-left: 4px solid #4caf50; color: #2e7d32; }
                .toast-error { background: #ffebee; border-left: 4px solid #f44336; color: #c62828; }
                .toast-content { display: flex; align-items: center; gap: 8px; }
                .toast-close { background: none; border: none; font-size: 18px; cursor: pointer; margin-left: auto; }
                @keyframes toastSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // 自動移除
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
        
        return toast;
    }

    // Toast 確認對話框
    showConfirm(message, onConfirm, onCancel = null) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-content">
                    <h3>確認操作</h3>
                    <p>${message}</p>
                    <div class="confirm-actions">
                        <button class="btn btn-secondary cancel-btn">取消</button>
                        <button class="btn btn-primary confirm-btn">確定</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加樣式
        if (!document.getElementById('confirm-styles')) {
            const style = document.createElement('style');
            style.id = 'confirm-styles';
            style.textContent = `
                .confirm-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); z-index: 10001;
                    display: flex; align-items: center; justify-content: center;
                }
                .confirm-dialog {
                    background: white; border-radius: 12px; padding: 24px;
                    min-width: 320px; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                }
                .confirm-content h3 { margin: 0 0 16px; color: #333; }
                .confirm-content p { margin: 0 0 24px; color: #666; line-height: 1.5; }
                .confirm-actions { display: flex; gap: 12px; justify-content: flex-end; }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
        
        // 事件處理
        overlay.querySelector('.cancel-btn').onclick = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };
        
        overlay.querySelector('.confirm-btn').onclick = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        };
    }

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.gameState = null;
        this.canvas = null;
        this.ctx = null;
        this.pixelSize = 16; // 每個像素格大小
        this.gridWidth = 16;  // 16x12 的遊戲畫面
        this.gridHeight = 12;
        this.gameLoop = null;
        this.keys = {};
        this.frameCount = 0;
        
        // 復古色板 (Game Boy 風格)
        this.colors = {
            BLACK: '#0f380f',     // 深綠黑
            DARK: '#306230',      // 深綠
            LIGHT: '#8bac0f',     // 亮綠
            WHITE: '#9bbc0f'      // 淺綠
        };
    }

    async render(uuid) {
        window.activeModule = this;
        this.currentUser = uuid;
        
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        await this.loadGameData(uuid);
        
        const container = document.getElementById('moduleContainer');
        container.innerHTML = this.getHTML();
        
        this.initCanvas();
        this.initControls();
        this.startGameLoop();
    }

    getHTML() {
        return `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
                
                /* 整體容器 */
                .pixel-life-container {
                    height: 100%;
                    background: #1a1a1a;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    font-family: 'VT323', monospace;
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                }

                /* CRT 螢幕效果 */
                .crt-screen {
                    background: #0f380f;
                    border: 20px solid #2a2a2a;
                    border-radius: 10px;
                    box-shadow: 
                        inset 0 0 50px rgba(0,0,0,0.5),
                        0 0 50px rgba(0,0,0,0.8);
                    position: relative;
                    overflow: hidden;
                }

                /* 掃描線效果 */
                .crt-screen::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        transparent 50%,
                        rgba(0,0,0,0.25) 50%
                    );
                    background-size: 100% 4px;
                    pointer-events: none;
                    z-index: 1;
                }

                /* 閃爍效果 */
                .crt-screen::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(18, 16, 16, 0.1);
                    pointer-events: none;
                    z-index: 2;
                    animation: flicker 0.15s infinite;
                }

                @keyframes flicker {
                    0% { opacity: 0.27861; }
                    5% { opacity: 0.34769; }
                    10% { opacity: 0.23604; }
                    15% { opacity: 0.90626; }
                    20% { opacity: 0.18128; }
                    25% { opacity: 0.83891; }
                    30% { opacity: 0.65583; }
                    35% { opacity: 0.67807; }
                    40% { opacity: 0.26559; }
                    45% { opacity: 0.84693; }
                    50% { opacity: 0.96019; }
                    55% { opacity: 0.08594; }
                    60% { opacity: 0.20313; }
                    65% { opacity: 0.71988; }
                    70% { opacity: 0.53455; }
                    75% { opacity: 0.37288; }
                    80% { opacity: 0.71428; }
                    85% { opacity: 0.70419; }
                    90% { opacity: 0.7003; }
                    95% { opacity: 0.36108; }
                    100% { opacity: 0.24387; }
                }

                /* 遊戲畫布 */
                #pixelCanvas {
                    display: block;
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                    width: 512px;
                    height: 384px;
                }

                /* 狀態顯示 */
                .pixel-stats {
                    background: #0f380f;
                    border: 4px solid #8bac0f;
                    padding: 8px 16px;
                    margin-top: 10px;
                    color: #9bbc0f;
                    font-size: 20px;
                    text-align: center;
                    letter-spacing: 2px;
                    box-shadow: 
                        inset 0 0 20px rgba(0,0,0,0.5),
                        0 0 20px rgba(0,0,0,0.8);
                }

                .stat-line {
                    margin: 4px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .stat-bar {
                    display: inline-block;
                    width: 100px;
                    height: 8px;
                    background: #306230;
                    border: 1px solid #8bac0f;
                    position: relative;
                    margin-left: 10px;
                }

                .stat-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background: #9bbc0f;
                }

                /* 控制提示 */
                .pixel-controls {
                    margin-top: 20px;
                    color: #8bac0f;
                    text-align: center;
                    font-size: 18px;
                    letter-spacing: 1px;
                }

                .pixel-controls kbd {
                    background: #306230;
                    color: #9bbc0f;
                    padding: 2px 6px;
                    border: 2px solid #8bac0f;
                    margin: 0 2px;
                }

                /* 像素按鈕 */
                .pixel-button {
                    background: #306230;
                    color: #9bbc0f;
                    border: 2px solid #8bac0f;
                    padding: 8px 16px;
                    font-family: 'VT323', monospace;
                    font-size: 20px;
                    cursor: pointer;
                    margin: 5px;
                    transition: all 0.1s;
                }

                .pixel-button:hover {
                    background: #8bac0f;
                    color: #0f380f;
                }

                .pixel-button:active {
                    transform: translateY(2px);
                }

                /* 對話框 */
                .pixel-dialog {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #0f380f;
                    border: 4px solid #8bac0f;
                    padding: 8px 12px;
                    color: #9bbc0f;
                    font-size: 18px;
                    z-index: 10;
                    max-width: 400px;
                    animation: blink 0.5s;
                }

                @keyframes blink {
                    0%, 50%, 100% { opacity: 1; }
                    25%, 75% { opacity: 0.7; }
                }
            </style>

            <div class="pixel-life-container">
                <div class="crt-screen">
                    <canvas id="pixelCanvas"></canvas>
                </div>
                
                <div class="pixel-stats">
                    <div class="stat-line">
                        <span>LEVEL: ${this.gameState.level}</span>
                        <span>MONEY: $${this.gameState.money}</span>
                    </div>
                    <div class="stat-line">
                        <span>HP:</span>
                        <span class="stat-bar">
                            <span class="stat-fill" style="width: ${this.gameState.hp}%"></span>
                        </span>
                    </div>
                    <div class="stat-line">
                        <span>EP:</span>
                        <span class="stat-bar">
                            <span class="stat-fill" style="width: ${this.gameState.energy}%"></span>
                        </span>
                    </div>
                </div>
                
                <div class="pixel-controls">
                    <div>MOVE: <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div>
                    <div>ACTION: <kbd>SPACE</kbd> MENU: <kbd>ESC</kbd></div>
                </div>
            </div>
        `;
    }

    initCanvas() {
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 設定實際像素大小
        this.canvas.width = this.gridWidth * this.pixelSize;
        this.canvas.height = this.gridHeight * this.pixelSize;
        
        // 關閉抗鋸齒
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }

    initControls() {
        // 鍵盤控制
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // 防止方向鍵滾動頁面
            if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
            this.frameCount++;
        }, 100); // 10 FPS 復古感
    }

    update() {
        const player = this.gameState.player;
        let moved = false;
        
        // 移動控制
        if (this.keys['arrowup'] || this.keys['w']) {
            if (this.canMove(player.x, player.y - 1)) {
                player.y--;
                moved = true;
            }
        }
        if (this.keys['arrowdown'] || this.keys['s']) {
            if (this.canMove(player.x, player.y + 1)) {
                player.y++;
                moved = true;
            }
        }
        if (this.keys['arrowleft'] || this.keys['a']) {
            if (this.canMove(player.x - 1, player.y)) {
                player.x--;
                moved = true;
                player.facing = 'left';
            }
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            if (this.canMove(player.x + 1, player.y)) {
                player.x++;
                moved = true;
                player.facing = 'right';
            }
        }
        
        // 空白鍵互動
        if (this.keys[' ']) {
            this.interact();
            this.keys[' '] = false; // 防止連續觸發
        }
        
        // 移動消耗能量
        if (moved) {
            this.gameState.energy = Math.max(0, this.gameState.energy - 1);
            this.updateStats();
        }
        
        // 檢查拾取物品
        this.checkPickups();
        
        // 遊戲邏輯更新
        if (this.frameCount % 30 === 0) { // 每3秒
            this.gameState.energy = Math.max(0, this.gameState.energy - 1);
            this.gameState.hp = Math.max(0, this.gameState.hp - 1);
            
            if (this.gameState.hp < 20) {
                this.showMessage("WARNING: LOW HP!");
            }
            
            this.updateStats();
        }
    }

    draw() {
        const ctx = this.ctx;
        const colors = this.colors;
        
        // 清空畫布
        ctx.fillStyle = colors.BLACK;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製房間
        this.drawRoom();
        
        // 繪製物品
        this.drawItems();
        
        // 繪製玩家
        this.drawPlayer();
        
        // 繪製UI
        this.drawUI();
        
        // 添加像素噪點效果
        if (this.frameCount % 2 === 0) {
            this.addNoise();
        }
    }

    drawRoom() {
        const room = this.getCurrentRoom();
        const ctx = this.ctx;
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const tile = room.tiles[y * this.gridWidth + x];
                this.drawTile(x, y, tile);
            }
        }
    }

    drawTile(x, y, type) {
        const ctx = this.ctx;
        const px = x * this.pixelSize;
        const py = y * this.pixelSize;
        
        switch(type) {
            case '#': // 牆壁
                this.drawPixelArt(px, py, this.wallSprite());
                break;
            case '.': // 地板
                this.drawPixelArt(px, py, this.floorSprite());
                break;
            case 'D': // 門
                this.drawPixelArt(px, py, this.doorSprite());
                break;
            case 'B': // 床
                this.drawPixelArt(px, py, this.bedSprite());
                break;
            case 'C': // 電腦
                this.drawPixelArt(px, py, this.computerSprite());
                break;
            case 'T': // 電視
                this.drawPixelArt(px, py, this.tvSprite());
                break;
        }
    }

    drawPlayer() {
        const player = this.gameState.player;
        const px = player.x * this.pixelSize;
        const py = player.y * this.pixelSize;
        
        // 角色動畫幀
        const frame = Math.floor(this.frameCount / 5) % 2;
        this.drawPixelArt(px, py, this.playerSprite(frame, player.facing));
    }

    drawItems() {
        this.gameState.items.forEach(item => {
            const px = item.x * this.pixelSize;
            const py = item.y * this.pixelSize;
            
            if (item.type === 'coin') {
                this.drawPixelArt(px, py, this.coinSprite());
            } else if (item.type === 'food') {
                this.drawPixelArt(px, py, this.foodSprite());
            } else if (item.type === 'key') {
                this.drawPixelArt(px, py, this.keySprite());
            }
        });
    }

    drawUI() {
        const ctx = this.ctx;
        
        // 頂部狀態列
        ctx.fillStyle = this.colors.BLACK;
        ctx.fillRect(0, 0, this.canvas.width, 16);
        
        // 繪製像素文字
        this.drawPixelText(`LV${this.gameState.level}`, 2, 2);
        this.drawPixelText(`$${this.gameState.money}`, 60, 2);
        this.drawPixelText(`HP:${this.gameState.hp}`, 120, 2);
        this.drawPixelText(`EP:${this.gameState.energy}`, 180, 2);
    }

    // 像素精靈圖（用數組定義每個像素）
    playerSprite(frame, facing) {
        // 8x8 像素的角色
        const sprites = {
            right: [
                frame === 0 ? [
                    '..####..',
                    '.######.',
                    '.#.##.#.',
                    '.######.',
                    '..####..',
                    '.##..##.',
                    '.#....#.',
                    '.##..##.'
                ] : [
                    '..####..',
                    '.######.',
                    '.#.##.#.',
                    '.######.',
                    '..####..',
                    '..#..#..',
                    '.#....#.',
                    '.#....#.'
                ]
            ],
            left: [
                frame === 0 ? [
                    '..####..',
                    '.######.',
                    '.#.##.#.',
                    '.######.',
                    '..####..',
                    '.##..##.',
                    '.#....#.',
                    '.##..##.'
                ] : [
                    '..####..',
                    '.######.',
                    '.#.##.#.',
                    '.######.',
                    '..####..',
                    '..#..#..',
                    '.#....#.',
                    '.#....#.'
                ]
            ]
        };
        
        return sprites[facing][0];
    }

    wallSprite() {
        return [
            '########',
            '#......#',
            '#......#',
            '#......#',
            '#......#',
            '#......#',
            '#......#',
            '########'
        ];
    }

    floorSprite() {
        return [
            '........',
            '........',
            '........',
            '........',
            '........',
            '........',
            '........',
            '........'
        ];
    }

    doorSprite() {
        return [
            '########',
            '#......#',
            '#..##..#',
            '#..##..#',
            '#..##..#',
            '#....#.#',
            '#......#',
            '########'
        ];
    }

    bedSprite() {
        return [
            '########',
            '########',
            '##....##',
            '##....##',
            '##....##',
            '##....##',
            '########',
            '##....##'
        ];
    }

    computerSprite() {
        return [
            '........',
            '.######.',
            '.#....#.',
            '.#....#.',
            '.######.',
            '..####..',
            '.######.',
            '########'
        ];
    }

    tvSprite() {
        return [
            '########',
            '#......#',
            '#..##..#',
            '#..##..#',
            '#......#',
            '########',
            '..#..#..',
            '.##..##.'
        ];
    }

    coinSprite() {
        const blink = Math.floor(this.frameCount / 10) % 2;
        return blink ? [
            '..####..',
            '.######.',
            '##.##.##',
            '##.##.##',
            '##.##.##',
            '##.##.##',
            '.######.',
            '..####..'
        ] : [
            '..####..',
            '.######.',
            '##$$$$##',
            '##$$$$##',
            '##$$$$##',
            '##$$$$##',
            '.######.',
            '..####..'
        ];
    }

    foodSprite() {
        return [
            '........',
            '..####..',
            '.######.',
            '########',
            '########',
            '.######.',
            '..####..',
            '........'
        ];
    }

    keySprite() {
        return [
            '..####..',
            '.##..##.',
            '.##..##.',
            '..####..',
            '...##...',
            '...##...',
            '...##.#.',
            '...####.'
        ];
    }

    drawPixelArt(x, y, sprite) {
        const ctx = this.ctx;
        const pixelSize = 2; // 每個像素點的大小
        
        sprite.forEach((row, py) => {
            for (let px = 0; px < row.length; px++) {
                const char = row[px];
                let color;
                
                switch(char) {
                    case '#': color = this.colors.WHITE; break;
                    case '.': color = this.colors.BLACK; break;
                    case '$': color = this.colors.LIGHT; break;
                    default: color = this.colors.DARK;
                }
                
                if (char !== '.') {
                    ctx.fillStyle = color;
                    ctx.fillRect(
                        x + px * pixelSize,
                        y + py * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        });
    }

    drawPixelText(text, x, y) {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.WHITE;
        ctx.font = '12px monospace';
        ctx.fillText(text, x, y + 10);
    }

    addNoise() {
        const ctx = this.ctx;
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() > 0.98) {
                const brightness = Math.random() > 0.5 ? 255 : 0;
                data[i] = brightness;     // R
                data[i + 1] = brightness; // G
                data[i + 2] = brightness; // B
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    getCurrentRoom() {
        const level = this.gameState.level;
        
        // 簡單的房間佈局 (16x12)
        const rooms = {
            1: {
                name: 'SLUM ROOM',
                tiles: [
                    '################',
                    '#..............#',
                    '#.B............#',
                    '#..............#',
                    '#......P.......#',
                    '#..............#',
                    '#..C...........#',
                    '#..............#',
                    '#..............#',
                    '#............$.#',
                    '#..............#',
                    '######DD########'
                ].join('')
            },
            5: {
                name: 'APARTMENT',
                tiles: [
                    '################',
                    '#.B....T.......#',
                    '#..............#',
                    '#..............#',
                    '#......P.......#',
                    '#..............#',
                    '#.C............#',
                    '#..............#',
                    '#..............#',
                    '#..........$...#',
                    '#..............#',
                    '######DD########'
                ].join('')
            }
        };
        
        return level >= 5 ? rooms[5] : rooms[1];
    }

    canMove(x, y) {
        // 邊界檢查
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
            return false;
        }
        
        // 碰撞檢查
        const room = this.getCurrentRoom();
        const tile = room.tiles[y * this.gridWidth + x];
        
        return tile !== '#';
    }

    checkPickups() {
        const player = this.gameState.player;
        const items = this.gameState.items;
        
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            if (item.x === player.x && item.y === player.y) {
                // 撿起物品
                if (item.type === 'coin') {
                    this.gameState.money += 10;
                    this.showMessage("+$10");
                } else if (item.type === 'food') {
                    this.gameState.hp = Math.min(100, this.gameState.hp + 20);
                    this.showMessage("+20 HP");
                } else if (item.type === 'key') {
                    this.gameState.hasKey = true;
                    this.showMessage("GOT KEY!");
                }
                
                // 移除物品
                items.splice(i, 1);
                this.updateStats();
            }
        }
    }

    interact() {
        const player = this.gameState.player;
        const room = this.getCurrentRoom();
        
        // 檢查面前的格子
        let checkX = player.x;
        let checkY = player.y;
        
        if (player.facing === 'left') checkX--;
        else if (player.facing === 'right') checkX++;
        
        const tile = room.tiles[checkY * this.gridWidth + checkX];
        
        switch(tile) {
            case 'B': // 床
                this.gameState.energy = Math.min(100, this.gameState.energy + 30);
                this.gameState.hp = Math.min(100, this.gameState.hp + 10);
                this.showMessage("RESTED!");
                break;
            case 'C': // 電腦
                if (this.gameState.energy >= 20) {
                    this.gameState.energy -= 20;
                    this.gameState.money += 30;
                    this.gameState.exp += 10;
                    this.showMessage("WORK +$30");
                    this.checkLevelUp();
                } else {
                    this.showMessage("TOO TIRED!");
                }
                break;
            case 'T': // 電視
                this.gameState.hp = Math.min(100, this.gameState.hp + 5);
                this.showMessage("WATCHED TV");
                break;
            case 'D': // 門
                if (this.gameState.hasKey || this.gameState.level >= 5) {
                    this.showMessage("NEXT AREA!");
                    this.nextLevel();
                } else {
                    this.showMessage("NEED KEY!");
                }
                break;
        }
        
        this.updateStats();
    }

    checkLevelUp() {
        const expNeeded = this.gameState.level * 50;
        if (this.gameState.exp >= expNeeded) {
            this.gameState.exp -= expNeeded;
            this.gameState.level++;
            this.gameState.hp = 100;
            this.gameState.energy = 100;
            this.showMessage(`LEVEL UP! LV${this.gameState.level}`);
            
            // 升級後生成新物品
            this.spawnItems();
        }
    }

    nextLevel() {
        // 進入下一個區域
        this.gameState.area++;
        this.gameState.player.x = 8;
        this.gameState.player.y = 5;
        this.spawnItems();
    }

    spawnItems() {
        // 隨機生成物品
        this.gameState.items = [];
        
        for (let i = 0; i < 3; i++) {
            const types = ['coin', 'food', 'key'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let x, y;
            do {
                x = Math.floor(Math.random() * this.gridWidth);
                y = Math.floor(Math.random() * this.gridHeight);
            } while (!this.canMove(x, y));
            
            this.gameState.items.push({ type, x, y });
        }
    }

    showMessage(text) {
        const dialog = document.createElement('div');
        dialog.className = 'pixel-dialog';
        dialog.textContent = text;
        document.querySelector('.crt-screen').appendChild(dialog);
        
        setTimeout(() => {
            dialog.remove();
        }, 2000);
    }

    updateStats() {
        // 更新狀態顯示
        document.querySelector('.pixel-stats').innerHTML = `
            <div class="stat-line">
                <span>LEVEL: ${this.gameState.level}</span>
                <span>MONEY: $${this.gameState.money}</span>
            </div>
            <div class="stat-line">
                <span>HP:</span>
                <span class="stat-bar">
                    <span class="stat-fill" style="width: ${this.gameState.hp}%"></span>
                </span>
            </div>
            <div class="stat-line">
                <span>EP:</span>
                <span class="stat-bar">
                    <span class="stat-fill" style="width: ${this.gameState.energy}%"></span>
                </span>
            </div>
        `;
    }

    async loadGameData(uuid) {
        try {
            const data = await this.syncManager.load(uuid, 'pixel-life');
            if (data && data.gameState) {
                this.gameState = data.gameState;
            } else {
                this.gameState = this.getDefaultGameState();
            }
        } catch (error) {
            console.error('載入失敗:', error);
            this.gameState = this.getDefaultGameState();
        }
    }

    async saveGameData() {
        try {
            await this.syncManager.save(
                this.currentUser,
                'pixel-life',
                { gameState: this.gameState }
            );
        } catch (error) {
            console.error('儲存失敗:', error);
        }
    }

    getDefaultGameState() {
        return {
            level: 1,
            exp: 0,
            money: 50,
            hp: 100,
            energy: 100,
            area: 1,
            player: {
                x: 8,
                y: 5,
                facing: 'right'
            },
            items: [
                { type: 'coin', x: 14, y: 9 }
            ],
            hasKey: false
        };
    }

    destroy() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // 移除事件監聽 (需要提供相同的處理函數)
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
        
        // 儲存遊戲
        this.saveGameData();
        
        this.canvas = null;
        this.ctx = null;
        this.syncManager = null;
        this.currentUser = null;
        
        if (window.activeModule === this) {
            window.activeModule = null;
        }
    }
}

export { PixelLifeModule };