#!/usr/bin/env node

/**
 * 簡易開發伺服器
 * 用於本地開發和測試網站
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 設定參數
const PORT = 3000;
const HOST = 'localhost';
const ROOT_DIR = __dirname;

// MIME 類型對應
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
};

// 創建伺服器
const server = http.createServer((req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // 處理 URL
    let filePath = path.join(ROOT_DIR, req.url === '/' ? '/index.html' : req.url);
    
    // 防止路徑遍歷攻擊
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // 檢查檔案是否存在
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // 檔案不存在
            console.error(`404: ${filePath}`);
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }

        // 如果是目錄，尋找 index.html
        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        // 讀取並發送檔案
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(`Error reading file: ${err}`);
                res.writeHead(500);
                res.end('Internal Server Error');
                return;
            }

            // 獲取檔案副檔名
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            // 發送回應
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        });
    });
});

// 啟動伺服器
server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log('\n🎮 遊戲人生開發伺服器已啟動！\n');
    console.log(`📍 訪問地址: ${url}`);
    console.log(`📂 根目錄: ${ROOT_DIR}`);
    console.log(`\n✨ 正在自動開啟瀏覽器...\n`);
    console.log('按 Ctrl+C 停止伺服器\n');
    console.log('─'.repeat(50));

    // 自動開啟瀏覽器（macOS）
    const openCommand = process.platform === 'darwin' 
        ? 'open' 
        : process.platform === 'win32' 
        ? 'start' 
        : 'xdg-open';
    
    exec(`${openCommand} ${url}`, (err) => {
        if (err) {
            console.error('無法自動開啟瀏覽器，請手動訪問:', url);
        }
    });
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n\n👋 正在關閉伺服器...');
    server.close(() => {
        console.log('✅ 伺服器已關閉\n');
        process.exit(0);
    });
});

// 錯誤處理
process.on('uncaughtException', (err) => {
    console.error('未捕獲的例外:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未處理的 Promise 拒絕:', reason);
});