/**
 * 旅遊PDF模組
 * 
 * 功能：
 * 1. 上傳PDF檔案
 * 2. PDF預覽與管理
 * 3. 旅遊文件分類
 */

class TravelPdfModule {
    // SignageHost 招牌資料
    static signage = {
        title: '旅遊PDF',
        subtitle: '文件管理與預覽',
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/><polyline points="10 9 9 9 8 9" stroke="currentColor" stroke-width="2"/></svg>',
        actions: [
            { id:'upload', label:'上傳PDF', kind:'primary', onClick:'uploadPdf' },
            { id:'refresh', label:'重新載入', kind:'secondary', onClick:'refresh' },
            { id:'settings', label:'設定', kind:'secondary', onClick:'showSettings' }
        ]
    };

    // 靜態資訊（必填）
    static moduleInfo = {
        name: '旅遊PDF',
        version: '1.0.0',
        description: '管理旅遊相關PDF文件'
    };

    constructor() {
        this.currentUser = null;
        this.pdfFiles = [];
        this.categories = ['機票', '住宿', '行程', '簽證', '保險', '其他'];
    }

    async render(uuid) {
        try {
            this.currentUser = { uuid };
            
            // 載入PDF資料
            await this.loadData();
            
            // 渲染介面
            const moduleContainer = document.getElementById('moduleContainer');
            if (!moduleContainer) {
                throw new Error('找不到 moduleContainer 元素');
            }
            
            moduleContainer.innerHTML = this.getHTML();
            this.attachEventListeners();
            
            console.log('旅遊PDF模組渲染完成');
        } catch (error) {
            console.error('旅遊PDF模組渲染失敗:', error);
            throw error;
        }
    }

    getHTML() {
        return `
            <div class="travel-pdf-container">
                <!-- PDF檔案清單 -->
                <div class="pdf-grid">
                    ${this.pdfFiles.length > 0 ? 
                        this.pdfFiles.map(pdf => this.renderPdfCard(pdf)).join('') :
                        '<div class="empty-state">尚無PDF檔案<br><small>點擊上方「上傳PDF」開始</small></div>'
                    }
                </div>

                <!-- 上傳對話框 -->
                <div id="uploadDialog" class="dialog-overlay" style="display: none;">
                    <div class="dialog">
                        <div class="dialog-header">上傳PDF檔案</div>
                        <div class="dialog-content">
                            <div class="form-group">
                                <label>選擇檔案</label>
                                <input type="file" id="pdfFileInput" accept=".pdf" />
                            </div>
                            <div class="form-group">
                                <label>檔案名稱</label>
                                <input type="text" id="pdfFileName" placeholder="輸入檔案名稱" />
                            </div>
                            <div class="form-group">
                                <label>分類</label>
                                <select id="pdfCategory">
                                    ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="dialog-actions">
                            <button class="btn" onclick="window.activeModule.closeDialog()">取消</button>
                            <button class="btn btn-primary" onclick="window.activeModule.savePdf()">上傳</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .travel-pdf-container {
                    padding: 20px;
                    height: 100%;
                    overflow-y: auto;
                }

                .pdf-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }

                .pdf-card {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e5e5;
                    overflow: hidden;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .pdf-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }

                .pdf-preview {
                    height: 200px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                    color: #dc3545;
                }

                .pdf-info {
                    padding: 16px;
                }

                .pdf-name {
                    font-weight: 600;
                    margin-bottom: 8px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .pdf-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                    color: #666;
                }

                .pdf-category {
                    background: #007bff;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                }

                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                    font-size: 1.1rem;
                }

                .empty-state small {
                    font-size: 0.9rem;
                    opacity: 0.7;
                }

                .dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .dialog {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }

                .dialog-header {
                    padding: 20px 20px 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .dialog-content {
                    padding: 20px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 1rem;
                }

                .dialog-actions {
                    padding: 0 20px 20px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .btn {
                    padding: 10px 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .btn:hover {
                    background: #f8f9fa;
                }

                .btn-primary {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .btn-primary:hover {
                    background: #0056b3;
                }
            </style>
        `;
    }

    renderPdfCard(pdf) {
        return `
            <div class="pdf-card" onclick="window.activeModule.viewPdf('${pdf.id}')">
                <div class="pdf-preview">PDF</div>
                <div class="pdf-info">
                    <div class="pdf-name">${pdf.name}</div>
                    <div class="pdf-meta">
                        <span class="pdf-category">${pdf.category}</span>
                        <span>${new Date(pdf.uploadDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // 已在HTML中使用onclick處理
    }

    async loadData() {
        try {
            const data = localStorage.getItem(`travel_pdf_${this.currentUser.uuid}`);
            if (data) {
                this.pdfFiles = JSON.parse(data);
            }
        } catch (error) {
            console.error('載入PDF資料失敗:', error);
            this.pdfFiles = [];
        }
    }

    async saveData() {
        try {
            localStorage.setItem(`travel_pdf_${this.currentUser.uuid}`, JSON.stringify(this.pdfFiles));
        } catch (error) {
            console.error('儲存PDF資料失敗:', error);
        }
    }

    // SignageHost 按鈕方法：上傳PDF
    uploadPdf() {
        document.getElementById('uploadDialog').style.display = 'flex';
        // 清空表單
        document.getElementById('pdfFileInput').value = '';
        document.getElementById('pdfFileName').value = '';
        document.getElementById('pdfCategory').selectedIndex = 0;
    }

    // SignageHost 按鈕方法：重新載入
    async refresh() {
        await this.loadData();
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
    }

    // SignageHost 按鈕方法：設定
    showSettings() {
        alert('設定功能開發中...');
    }

    closeDialog() {
        document.getElementById('uploadDialog').style.display = 'none';
    }

    async savePdf() {
        const fileInput = document.getElementById('pdfFileInput');
        const fileName = document.getElementById('pdfFileName').value.trim();
        const category = document.getElementById('pdfCategory').value;

        if (!fileInput.files[0]) {
            alert('請選擇PDF檔案');
            return;
        }

        if (!fileName) {
            alert('請輸入檔案名稱');
            return;
        }

        // 模擬檔案儲存（實際應該上傳到伺服器）
        const file = fileInput.files[0];
        const pdf = {
            id: Date.now().toString(),
            name: fileName,
            category: category,
            originalName: file.name,
            size: file.size,
            uploadDate: new Date().toISOString(),
            // 實際應用中這裡會是伺服器回傳的檔案URL
            fileUrl: URL.createObjectURL(file)
        };

        this.pdfFiles.unshift(pdf);
        await this.saveData();

        this.closeDialog();
        this.refresh();
    }

    viewPdf(pdfId) {
        const pdf = this.pdfFiles.find(p => p.id === pdfId);
        if (pdf) {
            // 在新頁籤中開啟PDF
            window.open(pdf.fileUrl, '_blank');
        }
    }
}

// 導出模組
export { TravelPdfModule };