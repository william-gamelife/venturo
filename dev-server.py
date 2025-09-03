#!/usr/bin/env python3
"""
簡易 Python 開發伺服器
用於本地開發和測試網站
"""

import http.server
import socketserver
import os
import webbrowser
import sys
from pathlib import Path

# 設定參數
PORT = 3000
HOST = "localhost"
DIRECTORY = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # 添加 CORS 標頭
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def log_message(self, format, *args):
        # 自訂日誌格式
        print(f"[{self.log_date_time_string()}] {format % args}")

def run_server():
    print("\n🎮 遊戲人生開發伺服器已啟動！\n")
    print(f"📍 訪問地址: http://{HOST}:{PORT}")
    print(f"📂 根目錄: {DIRECTORY}")
    print("\n✨ 正在自動開啟瀏覽器...\n")
    print("按 Ctrl+C 停止伺服器\n")
    print("─" * 50)
    
    # 自動開啟瀏覽器
    url = f"http://{HOST}:{PORT}"
    webbrowser.open(url)
    
    try:
        with socketserver.TCPServer((HOST, PORT), MyHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 正在關閉伺服器...")
        print("✅ 伺服器已關閉\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 錯誤: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # 切換到腳本所在目錄
    os.chdir(DIRECTORY)
    run_server()