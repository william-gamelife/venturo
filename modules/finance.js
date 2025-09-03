/**
 * 財務管理模組 - 遊戲人生 3.0 完整版
 * 符合 building-manual 規範
 * 
 * 功能：
 * 1. 收支記錄與分類
 * 2. 預算管理與追蹤
 * 3. 投資組合管理
 * 4. 財務報表與分析
 * 5. 目標儲蓄規劃
 */

class FinanceModule {
    // 符合規範的設施資訊
    static facilityInfo = {
        code: 'finance',
        name: '財務管理',
        subtitle: '個人財務規劃與記錄',
        description: '完整的財務管理系統，記錄收支、分析消費習慣、預算規劃一應俱全。',
        version: '3.0.0',
        author: 'GameLife Team',
        icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        theme: 'finance',
        color: '#8B7E9B',
        support: {
            theme: true,
            mobile: true,
            offline: true
        },
        permissions: {
            public: false,
            allowedUsers: [],
            requireAuth: true
        }
    };
    // SignageHost 招牌資料
    static signage = {
        title: '財務管理',
        subtitle: '個人財務規劃與記錄',
        iconSVG: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        actions: [
            { id: 'overview', label: '總覽', kind: 'secondary', onClick: 'switchToOverview' },
            { id: 'company', label: '公司代墊款', kind: 'secondary', onClick: 'switchToCompany' },
            { id: 'transactions', label: '交易記錄', kind: 'secondary', onClick: 'switchToTransactions' },
            { id: 'investments', label: '投資組合', kind: 'secondary', onClick: 'switchToInvestments' },
            { id: 'assets', label: '資產管理', kind: 'secondary', onClick: 'switchToAssets' }
        ]
    };

    static moduleInfo = {
        name: '財務管理',
        subtitle: '個人財務規劃與記錄',
        icon: `<svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5" 
                      stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
               </svg>`,
        version: '2.0.0',
        author: 'william',
        themeSupport: true,
        mobileSupport: true
    };

    constructor() {
        this.syncManager = null;
        this.currentUser = null;
        this.transactions = [];
        this.budgets = [];
        this.investments = [];
        this.goals = [];
        this.currentView = 'overview';
        this.currentMonth = new Date();
        this.currentPeriod = 'month';  // 新增：用於總覽的時間週期切換
        this.currentAdvanceStatus = 'all';  // 新增：用於公司代墊款的狀態切換
        this.categories = {
            income: [
                { id: 'salary', name: '薪資', color: '#22c55e', icon: '$' },
                { id: 'bonus', name: '獎金', color: '#10b981', icon: '+' },
                { id: 'investment', name: '投資收益', color: '#06b6d4', icon: '↗' },
                { id: 'freelance', name: '兼職', color: '#3b82f6', icon: '◊' },
                { id: 'other_income', name: '其他收入', color: '#8b5cf6', icon: '○' }
            ],
            expense: [
                { id: 'food', name: '飲食', color: '#ef4444', icon: '♦' },
                { id: 'transport', name: '交通', color: '#f97316', icon: '→' },
                { id: 'shopping', name: '購物', color: '#f59e0b', icon: '◎' },
                { id: 'entertainment', name: '娛樂', color: '#eab308', icon: '♠' },
                { id: 'bills', name: '帳單', color: '#84cc16', icon: '□' },
                { id: 'health', name: '醫療', color: '#ec4899', icon: '♡' },
                { id: 'education', name: '教育', color: '#a855f7', icon: '◈' },
                { id: 'other_expense', name: '其他支出', color: '#6b7280', icon: '▽' }
            ]
        };
    }

    async render(uuid) {
        // 第一行必須設定 activeModule
        window.activeModule = this;
        this.currentUser = { uuid };
        
        const syncModule = await import('./sync.js');
        this.syncManager = new syncModule.SyncManager();
        
        await this.loadData();
        
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        
        this.attachEventListeners();
        this.initializeCharts();
    }

    async loadData() {
        try {
            const data = await this.syncManager.load(this.currentUser.uuid, 'finance');
            if (data) {
                this.transactions = data.transactions || [];
                this.budgets = data.budgets || [];
                this.investments = data.investments || [];
                this.goals = data.goals || [];
            }
        } catch (error) {
            console.error('載入財務資料失敗:', error);
        }
    }

    async saveData() {
        try {
            await this.syncManager.save(this.currentUser.uuid, 'finance', {
                transactions: this.transactions,
                budgets: this.budgets,
                investments: this.investments,
                goals: this.goals,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('儲存失敗:', error);
            this.showToast('儲存失敗', 'error');
        }
    }

    getHTML() {
        return `
            <div class="finance-container">
                <!-- 主要內容區 - 移到上方 -->
                <div class="finance-content">
                    ${this.getContentByView()}
                </div>

                <!-- 統計卡片 - 移到底部 -->
                <div class="finance-stats">
                    ${this.getStatsCards()}
                </div>
            </div>

            ${this.getStyles()}
        `;
    }

    getStatsCards() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // 計算本月收支
        const monthlyIncome = this.calculateMonthlyTotal('income', currentMonth, currentYear);
        const monthlyExpense = this.calculateMonthlyTotal('expense', currentMonth, currentYear);
        const monthlyBalance = monthlyIncome - monthlyExpense;
        
        // 計算總資產
        const totalAssets = this.calculateTotalAssets();
        
        return `
            <div class="stat-card income-card">
                <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M12 2v20M17 7l-5-5-5 5" stroke="currentColor" fill="none" stroke-width="2"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-label">本月收入</div>
                    <div class="stat-value">NT$ ${monthlyIncome.toLocaleString()}</div>
                </div>
            </div>
            
            <div class="stat-card expense-card">
                <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M12 22V2M17 17l-5 5-5-5" stroke="currentColor" fill="none" stroke-width="2"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-label">本月支出</div>
                    <div class="stat-value">NT$ ${monthlyExpense.toLocaleString()}</div>
                </div>
            </div>
            
            <div class="stat-card balance-card ${monthlyBalance >= 0 ? 'positive' : 'negative'}">
                <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect x="3" y="8" width="18" height="8" rx="2" stroke="currentColor" fill="none" stroke-width="2"/>
                        <path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-label">本月結餘</div>
                    <div class="stat-value">NT$ ${monthlyBalance.toLocaleString()}</div>
                </div>
            </div>
            
            <div class="stat-card assets-card">
                <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M3 13h6l2-4 3 8 2-4h5" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-label">總資產</div>
                    <div class="stat-value">NT$ ${totalAssets.toLocaleString()}</div>
                </div>
            </div>
        `;
    }

    getContentByView() {
        switch(this.currentView) {
            case 'overview':
                return this.getOverviewContent();
            case 'company':
                return this.getCompanyContent();
            case 'transactions':
                return this.getTransactionsContent();
            case 'budgets':
                return this.getBudgetsContent();
            case 'investments':
                return this.getInvestmentsContent();
            case 'assets':
                return this.getAssetsContent();
            default:
                return this.getOverviewContent();
        }
    }

    getOverviewContent() {
        return `
            <!-- 控制工具列 -->
            <div class="finance-controls">
                <div class="period-selector">
                    <button class="period-btn ${this.currentPeriod === 'week' ? 'active' : ''}" 
                            onclick="window.activeModule.setPeriod('week')">週</button>
                    <button class="period-btn ${this.currentPeriod === 'month' ? 'active' : ''}" 
                            onclick="window.activeModule.setPeriod('month')">月</button>
                    <button class="period-btn ${this.currentPeriod === 'quarter' ? 'active' : ''}" 
                            onclick="window.activeModule.setPeriod('quarter')">季</button>
                    <button class="period-btn ${this.currentPeriod === 'year' ? 'active' : ''}" 
                            onclick="window.activeModule.setPeriod('year')">年</button>
                </div>
                
                <button class="btn-add-transaction" onclick="window.activeModule.showAddDialog()">
                    <span>+</span> 新增交易
                </button>
            </div>

            <div class="overview-grid">
                <!-- 收支圖表 -->
                <div class="chart-card">
                    <h3>本${this.getPeriodLabel()}收支分析</h3>
                    <canvas id="monthlyChart"></canvas>
                </div>
                
                <!-- 分類統計 -->
                <div class="chart-card">
                    <h3>支出分類</h3>
                    <canvas id="categoryChart"></canvas>
                </div>
                
                <!-- 趨勢圖 -->
                <div class="chart-card full-width">
                    <h3>收支趨勢（近${this.currentPeriod === 'week' ? '12週' : this.currentPeriod === 'month' ? '6個月' : this.currentPeriod === 'quarter' ? '4季' : '3年'}）</h3>
                    <canvas id="trendChart"></canvas>
                </div>
                
                <!-- 最近交易 -->
                <div class="recent-transactions">
                    <h3>最近交易</h3>
                    ${this.getRecentTransactionsList()}
                </div>
            </div>
        `;
    }

    getTransactionsContent() {
        return `
            <div class="transactions-container">
                <!-- 月份選擇器 -->
                <div class="month-selector">
                    <button onclick="window.activeModule.changeMonth(-1)">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M12 15l-5-5 5-5" stroke="currentColor" fill="none" stroke-width="2"/>
                        </svg>
                    </button>
                    <span>${this.formatMonth(this.currentMonth)}</span>
                    <button onclick="window.activeModule.changeMonth(1)">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M8 15l5-5-5-5" stroke="currentColor" fill="none" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                
                <!-- 交易列表 -->
                <div class="transactions-list">
                    ${this.getTransactionsList()}
                </div>
            </div>
        `;
    }

    getBudgetsContent() {
        return `
            <div class="budgets-container">
                <div class="budget-header">
                    <h3>預算管理</h3>
                    <button class="btn-add" onclick="window.activeModule.showBudgetDialog()">
                        新增預算
                    </button>
                </div>
                
                <div class="budgets-grid">
                    ${this.getBudgetCards()}
                </div>
            </div>
        `;
    }

    getInvestmentsContent() {
        return `
            <div class="investments-container">
                <div class="investment-header">
                    <h3>投資組合</h3>
                    <button class="btn-add" onclick="window.activeModule.showInvestmentDialog()">
                        新增投資
                    </button>
                </div>
                
                <div class="portfolio-summary">
                    ${this.getPortfolioSummary()}
                </div>
                
                <div class="investments-list">
                    ${this.getInvestmentsList()}
                </div>
            </div>
        `;
    }

    getCompanyContent() {
        const companyAdvances = this.transactions.filter(t => t.companyAdvance);
        const totalAdvance = companyAdvances.reduce((sum, t) => sum + t.amount, 0);
        
        return `
            <!-- 控制工具列 -->
            <div class="finance-controls">
                <div class="status-selector">
                    <button class="period-btn ${this.currentAdvanceStatus === 'all' ? 'active' : ''}" 
                            onclick="window.activeModule.setAdvanceStatus('all')">全部</button>
                    <button class="period-btn ${this.currentAdvanceStatus === 'pending' ? 'active' : ''}" 
                            onclick="window.activeModule.setAdvanceStatus('pending')">待請款</button>
                    <button class="period-btn ${this.currentAdvanceStatus === 'claimed' ? 'active' : ''}" 
                            onclick="window.activeModule.setAdvanceStatus('claimed')">已請款</button>
                    <button class="period-btn ${this.currentAdvanceStatus === 'completed' ? 'active' : ''}" 
                            onclick="window.activeModule.setAdvanceStatus('completed')">已入帳</button>
                </div>
                
                <button class="btn-add-transaction" onclick="window.activeModule.showAddDialog()">
                    <span>+</span> 新增交易
                </button>
            </div>

            <div class="company-container">
                <div class="company-summary">
                    <div class="summary-card">
                        <h3>公司代墊款總額</h3>
                        <div class="total-amount">NT$ ${totalAdvance.toLocaleString()}</div>
                        <div class="total-count">${companyAdvances.length} 筆代墊</div>
                    </div>
                </div>
                
                <div class="company-transactions">
                    <h3>代墊款明細</h3>
                    <div class="transactions-list">
                        ${this.getCompanyAdvancesList()}
                    </div>
                </div>
            </div>
        `;
    }

    getAssetsContent() {
        return `
            <div class="assets-container">
                <div class="assets-header">
                    <h3>資產管理</h3>
                    <button class="btn-add" onclick="window.activeModule.showAssetDialog()">
                        新增資產
                    </button>
                </div>
                
                <div class="assets-summary">
                    <div class="asset-categories">
                        <div class="category-card">
                            <h4>現金與存款</h4>
                            <div class="amount">NT$ 0</div>
                        </div>
                        <div class="category-card">
                            <h4>投資</h4>
                            <div class="amount">NT$ 0</div>
                        </div>
                        <div class="category-card">
                            <h4>其他資產</h4>
                            <div class="amount">NT$ 0</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getGoalsContent() {
        return `
            <div class="goals-container">
                <div class="goals-header">
                    <h3>儲蓄目標</h3>
                    <button class="btn-add" onclick="window.activeModule.showGoalDialog()">
                        新增目標
                    </button>
                </div>
                
                <div class="goals-grid">
                    ${this.getGoalCards()}
                </div>
            </div>
        `;
    }

    // 新增交易對話框
    showAddDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'finance-dialog-overlay';
        dialog.innerHTML = `
            <div class="finance-dialog">
                <h3>新增交易</h3>
                
                <div class="transaction-type-selector">
                    <button class="type-btn income active" onclick="window.activeModule.selectTransactionType('income')">
                        收入
                    </button>
                    <button class="type-btn expense" onclick="window.activeModule.selectTransactionType('expense')">
                        支出
                    </button>
                </div>
                
                <div class="form-group">
                    <label>金額</label>
                    <input type="number" id="transactionAmount" placeholder="0" min="0">
                </div>
                
                <div class="form-group">
                    <label>分類</label>
                    <div class="category-grid" id="categoryGrid">
                        ${this.getCategoryOptions('income')}
                    </div>
                </div>
                
                <div class="form-group">
                    <label>描述</label>
                    <input type="text" id="transactionDescription" placeholder="輸入描述...">
                </div>
                
                <div class="form-group">
                    <label>日期</label>
                    <input type="date" id="transactionDate" value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div class="form-group" id="companyAdvanceGroup" style="display: none;">
                    <label class="checkbox-label">
                        <input type="checkbox" id="companyAdvance">
                        <span>公司代墊款</span>
                    </label>
                </div>
                
                <div class="dialog-actions">
                    <button onclick="window.activeModule.closeDialog()">取消</button>
                    <button class="btn-primary" onclick="window.activeModule.saveTransaction()">儲存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.currentTransactionType = 'income';
    }

    selectTransactionType(type) {
        this.currentTransactionType = type;
        
        // 更新按鈕狀態
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.type-btn.${type}`).classList.add('active');
        
        // 更新分類選項
        document.getElementById('categoryGrid').innerHTML = this.getCategoryOptions(type);
        
        // 顯示/隱藏公司代墊選項（只在支出時顯示）
        const companyAdvanceGroup = document.getElementById('companyAdvanceGroup');
        if (companyAdvanceGroup) {
            companyAdvanceGroup.style.display = type === 'expense' ? 'block' : 'none';
        }
    }

    getCategoryOptions(type) {
        return this.categories[type].map(cat => `
            <div class="category-option" data-category="${cat.id}" 
                 style="background: ${cat.color};"
                 onclick="window.activeModule.selectCategory('${cat.id}')">
                ${cat.name}
            </div>
        `).join('');
    }

    selectCategory(categoryId) {
        document.querySelectorAll('.category-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.querySelector(`[data-category="${categoryId}"]`).classList.add('selected');
        this.selectedCategory = categoryId;
    }

    async saveTransaction() {
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const description = document.getElementById('transactionDescription').value;
        const date = document.getElementById('transactionDate').value;
        const companyAdvance = document.getElementById('companyAdvance')?.checked || false;
        
        if (!amount || !this.selectedCategory) {
            this.showToast('請填寫必要欄位', 'error');
            return;
        }
        
        const transaction = {
            id: Date.now().toString(),
            type: this.currentTransactionType,
            amount,
            category: this.selectedCategory,
            description,
            date,
            companyAdvance,
            advanceStatus: companyAdvance ? 'pending' : null, // pending/claimed/paid
            claimDate: null,
            paidDate: null,
            createdAt: new Date().toISOString()
        };
        
        this.transactions.push(transaction);
        await this.saveData();
        
        this.closeDialog();
        this.refresh();
        this.showToast('交易已新增', 'success');
    }

    // 計算函數
    calculateMonthlyTotal(type, month, year) {
        return this.transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === type && 
                       tDate.getMonth() === month && 
                       tDate.getFullYear() === year;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    }

    calculateTotalAssets() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const investmentValue = this.investments
            .reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
        
        return totalIncome - totalExpense + investmentValue;
    }

    getRecentTransactionsList() {
        const recent = this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recent.length === 0) {
            return '<p class="no-data">尚無交易記錄</p>';
        }
        
        return recent.map(t => {
            const category = this.categories[t.type].find(c => c.id === t.category);
            return `
                <div class="transaction-item ${t.type}">
                    <div class="transaction-icon" style="background: ${category?.color};">
                        ${category?.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5"/></svg>'}
                    </div>
                    <div class="transaction-info">
                        <div class="transaction-desc">${t.description || category?.name}</div>
                        <div class="transaction-date">${this.formatDate(t.date)}</div>
                    </div>
                    <div class="transaction-amount ${t.type}">
                        ${t.type === 'income' ? '+' : '-'} NT$ ${t.amount.toLocaleString()}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 完整交易列表
    getTransactionsList() {
        const currentMonth = this.currentMonth || new Date();
        const filtered = this.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === currentMonth.getFullYear() &&
                   tDate.getMonth() === currentMonth.getMonth();
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filtered.length === 0) {
            return '<p class="no-data">本月尚無交易記錄</p>';
        }
        
        return filtered.map(t => {
            const category = this.categories[t.type].find(c => c.id === t.category);
            return `
                <div class="transaction-item ${t.type}">
                    <div class="transaction-icon" style="background: ${category?.color};">
                        ${category?.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5"/></svg>'}
                    </div>
                    <div class="transaction-info">
                        <div class="transaction-desc">${t.description || category?.name}</div>
                        <div class="transaction-date">${this.formatDate(t.date)}</div>
                    </div>
                    <div class="transaction-amount ${t.type}">
                        ${t.type === 'income' ? '+' : '-'} NT$ ${t.amount.toLocaleString()}
                    </div>
                    <button class="transaction-edit" onclick="window.activeModule.editTransaction('${t.id}')">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path d="M10 2l2 2-7 7-3 1 1-3z" fill="none" stroke="currentColor"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');
    }

    // 投資列表
    getInvestmentsList() {
        if (!this.investments || this.investments.length === 0) {
            return '<p class="no-data">尚無投資記錄</p>';
        }
        
        return this.investments.map(inv => `
            <div class="investment-item">
                <div class="investment-info">
                    <div class="investment-name">${inv.name}</div>
                    <div class="investment-type">${inv.type}</div>
                </div>
                <div class="investment-amount">
                    NT$ ${inv.amount.toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    // 公司代墊款列表
    getCompanyAdvancesList() {
        if (!this.companyAdvances || this.companyAdvances.length === 0) {
            return '<p class="no-data">尚無代墊款記錄</p>';
        }
        
        return this.companyAdvances.map(advance => `
            <div class="advance-item ${advance.status}">
                <div class="advance-info">
                    <div class="advance-desc">${advance.description}</div>
                    <div class="advance-date">${this.formatDate(advance.date)}</div>
                </div>
                <div class="advance-amount">
                    NT$ ${advance.amount.toLocaleString()}
                </div>
                <div class="advance-status">
                    ${this.getAdvanceStatusText(advance.status)}
                </div>
                <button class="advance-action" onclick="window.activeModule.updateAdvanceStatus('${advance.id}')">
                    ${advance.status === 'pending' ? '標記請款' : advance.status === 'claimed' ? '標記入帳' : '已完成'}
                </button>
            </div>
        `).join('');
    }

    // 工具函數
    formatMonth(date) {
        const months = ['一月', '二月', '三月', '四月', '五月', '六月', 
                       '七月', '八月', '九月', '十月', '十一月', '十二月'];
        return `${date.getFullYear()}年 ${months[date.getMonth()]}`;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    changeMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.refresh();
    }

    switchView(view) {
        this.currentView = view;
        this.refresh();
    }

    refresh() {
        const moduleContainer = document.getElementById('moduleContainer');
        moduleContainer.innerHTML = this.getHTML();
        this.attachEventListeners();
        this.initializeCharts();
    }

    closeDialog() {
        document.querySelector('.finance-dialog-overlay')?.remove();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    attachEventListeners() {
        // 事件監聽器
    }

    initializeCharts() {
        // 初始化圖表（需要 Chart.js）
        // 這裡先留空，實際使用時需要引入 Chart.js
    }

    // 清理方法（符合規範）
    destroy() {
        // 儲存狀態
        if (this.transactions && this.transactions.length > 0) {
            this.saveData();
        }
        
        // 清理對話框
        this.closeDialog();
        
        // 清理資源
        this.transactions = null;
        this.budgets = null;
        this.investments = null;
        this.goals = null;
        this.syncManager = null;
        this.currentUser = null;
        
        // 清除全域參考
        if (window.activeModule === this) {
            window.activeModule = null;
        }
        
        // 清理所有彈出視窗
        document.querySelectorAll('.finance-dialog-overlay').forEach(d => d.remove());
        document.querySelectorAll('.toast').forEach(t => t.remove());
    }

    // SignageHost 方法
    switchToOverview() {
        this.switchView('overview');
    }

    switchToCompany() {
        this.switchView('company');
    }

    switchToTransactions() {
        this.switchView('transactions');
    }

    switchToInvestments() {
        this.switchView('investments');
    }

    switchToAssets() {
        this.switchView('assets');
    }

    // 新增方法：設定時間週期
    setPeriod(period) {
        this.currentPeriod = period;
        this.refresh();
    }

    // 新增方法：設定代墊款狀態篩選
    setAdvanceStatus(status) {
        this.currentAdvanceStatus = status;
        this.refresh();
    }

    // 新增方法：取得週期標籤
    getPeriodLabel() {
        switch(this.currentPeriod) {
            case 'week': return '週';
            case 'month': return '月';
            case 'quarter': return '季';
            case 'year': return '年';
            default: return '月';
        }
    }

    // 獲取代墊款狀態文字
    getAdvanceStatusText(status) {
        const statusMap = {
            'pending': '待處理',
            'claimed': '已請款',
            'paid': '已入帳'
        };
        return statusMap[status] || status;
    }

    // 更新代墊款狀態
    async updateAdvanceStatus(advanceId) {
        const advance = this.companyAdvances.find(a => a.id === advanceId);
        if (!advance) return;

        if (advance.status === 'pending') {
            advance.status = 'claimed';
            advance.claimedDate = new Date().toISOString();
        } else if (advance.status === 'claimed') {
            advance.status = 'paid';
            advance.paidDate = new Date().toISOString();
        }

        await this.saveData();
        this.refresh();
        this.showToast('狀態更新成功', 'success');
    }

    // 編輯交易
    editTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction) {
            // TODO: 實作編輯功能
            console.log('編輯交易:', transaction);
        }
    }

    getStyles() {
        return `
            <style>
                .finance-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    padding: 20px 0;
                    gap: 20px;
                }

                /* 控制工具列樣式（參考 timebox 美化樣式） */
                .finance-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--card);
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    margin-bottom: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .period-selector, .status-selector {
                    display: flex;
                    background: var(--bg);
                    border-radius: 8px;
                    padding: 2px;
                    border: 1px solid var(--border);
                }

                .period-btn {
                    padding: 6px 12px;
                    background: transparent;
                    border: none;
                    color: var(--text-light);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .period-btn.active {
                    background: white;
                    color: var(--primary);
                    font-weight: 600;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                /* 工具列樣式 */
                .finance-tools {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    background: var(--card);
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .mode-selector {
                    display: flex;
                    background: var(--bg);
                    border-radius: 8px;
                    padding: 2px;
                    border: 1px solid var(--border);
                }

                .mode-btn {
                    padding: 6px 12px;
                    background: transparent;
                    border: none;
                    color: var(--text-light);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .mode-btn.active {
                    background: white;
                    color: var(--primary);
                    font-weight: 600;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }

                .add-btn:hover {
                    background: var(--primary-light);
                    transform: translateY(-1px);
                }

                /* 統一招牌樣式 */
                .module-welcome-card {
                    height: 100px;
                    background: var(--card);
                    border-radius: 16px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid var(--border);
                    backdrop-filter: blur(20px);
                }

                .welcome-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .module-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #22c55e, #10b981);
                    border-radius: 12px;
                    color: white;
                }

                .module-text {
                    display: flex;
                    flex-direction: column;
                }

                .module-title {
                    margin: 0;
                    font-size: 1.4rem;
                    color: var(--text);
                }

                .module-subtitle {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--text-light);
                }

                .btn-add-transaction {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-light));
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s;
                }

                .btn-add-transaction:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                /* 統計卡片 */
                .finance-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .stat-card {
                    background: var(--card);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .income-card .stat-icon {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                }

                .expense-card .stat-icon {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }

                .balance-card.positive .stat-icon {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                }

                .balance-card.negative .stat-icon {
                    background: linear-gradient(135deg, #f97316, #ea580c);
                }

                .assets-card .stat-icon {
                    background: linear-gradient(135deg, #a855f7, #9333ea);
                }

                .stat-content {
                    flex: 1;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: var(--text-light);
                    margin-bottom: 4px;
                }

                .stat-value {
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: var(--text);
                }

                /* 頁籤 */
                .finance-tabs {
                    display: flex;
                    gap: 8px;
                    background: var(--card);
                    padding: 8px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .tab-btn {
                    flex: 1;
                    padding: 10px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    color: var(--text-light);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s;
                }

                .tab-btn.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                /* 內容區 */
                .finance-content {
                    flex: 1;
                    background: var(--card);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid var(--border);
                    overflow-y: auto;
                }

                /* 總覽網格 */
                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }

                .chart-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid var(--border);
                }

                .chart-card h3 {
                    margin: 0 0 16px 0;
                    font-size: 1rem;
                    color: var(--text);
                }

                .chart-card.full-width {
                    grid-column: 1 / -1;
                }

                /* 交易列表 */
                .recent-transactions {
                    grid-column: 1 / -1;
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid var(--border);
                }

                .recent-transactions h3 {
                    margin: 0 0 16px 0;
                    font-size: 1rem;
                    color: var(--text);
                }

                .transaction-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bg);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .transaction-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .transaction-info {
                    flex: 1;
                }

                .transaction-desc {
                    font-weight: 500;
                    color: var(--text);
                }

                .transaction-date {
                    font-size: 0.85rem;
                    color: var(--text-light);
                }

                .transaction-amount {
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .transaction-amount.income {
                    color: #22c55e;
                }

                .transaction-amount.expense {
                    color: #ef4444;
                }

                /* 對話框 */
                .finance-dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .finance-dialog {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    width: 90%;
                    max-width: 500px;
                }

                .finance-dialog h3 {
                    margin: 0 0 20px 0;
                    color: var(--text);
                }

                .transaction-type-selector {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 20px;
                }

                .type-btn {
                    padding: 12px;
                    border: 2px solid var(--border);
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s;
                }

                .type-btn.income.active {
                    background: #22c55e;
                    color: white;
                    border-color: #22c55e;
                }

                .type-btn.expense.active {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text);
                    font-weight: 500;
                }

                .form-group input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 1rem;
                }

                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                    gap: 8px;
                }

                .category-option {
                    padding: 8px;
                    border-radius: 8px;
                    text-align: center;
                    color: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .category-option:hover {
                    transform: scale(1.05);
                }

                .category-option.selected {
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.2);
                }

                .dialog-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }

                .dialog-actions button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }

                .dialog-actions .btn-primary {
                    background: var(--primary);
                    color: white;
                }

                .no-data {
                    text-align: center;
                    color: var(--text-light);
                    padding: 20px;
                }

                /* 響應式設計 */
                @media (max-width: 768px) {
                    .finance-stats {
                        grid-template-columns: 1fr;
                    }

                    .finance-tabs {
                        overflow-x: auto;
                    }

                    .tab-btn {
                        white-space: nowrap;
                    }
                }
            </style>
        `;
    }

    getCompanyAdvancesList() {
        const companyAdvances = this.transactions.filter(t => t.companyAdvance);
        
        if (companyAdvances.length === 0) {
            return '<p class="no-data">尚無代墊款記錄</p>';
        }
        
        return companyAdvances.map(t => {
            const category = this.categories[t.type].find(c => c.id === t.category);
            const statusText = {
                'pending': '未請款',
                'claimed': '已請款',
                'paid': '已入帳'
            };
            
            return `
                <div class="company-transaction-item">
                    <div class="transaction-main">
                        <div class="transaction-icon" style="background: ${category?.color};">
                            ${category?.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.5-1.5-2.5-3-2.5s-3 1-3 2.5c0 3 6 1.5 6 4.5 0 1.5-1.5 2.5-3 2.5s-3-1-3-2.5"/></svg>'}
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-desc">${t.description || category?.name}</div>
                            <div class="transaction-date">${this.formatDate(t.date)}</div>
                        </div>
                        <div class="transaction-amount">
                            NT$ ${t.amount.toLocaleString()}
                        </div>
                    </div>
                    
                    <div class="advance-controls">
                        <div class="status-group">
                            <label class="status-option">
                                <input type="radio" name="status_${t.id}" value="pending" 
                                       ${t.advanceStatus === 'pending' ? 'checked' : ''}
                                       onchange="window.activeModule.updateAdvanceStatus('${t.id}', 'pending')">
                                <span>未請款</span>
                            </label>
                            <label class="status-option">
                                <input type="radio" name="status_${t.id}" value="claimed"
                                       ${t.advanceStatus === 'claimed' ? 'checked' : ''}
                                       onchange="window.activeModule.updateAdvanceStatus('${t.id}', 'claimed')">
                                <span>已請款</span>
                            </label>
                            <label class="status-option">
                                <input type="radio" name="status_${t.id}" value="paid"
                                       ${t.advanceStatus === 'paid' ? 'checked' : ''}
                                       onchange="window.activeModule.updateAdvanceStatus('${t.id}', 'paid')">
                                <span>已入帳</span>
                            </label>
                        </div>
                        
                        ${t.advanceStatus === 'claimed' || t.advanceStatus === 'paid' ? `
                            <div class="date-inputs">
                                ${t.advanceStatus === 'claimed' || t.advanceStatus === 'paid' ? `
                                    <input type="date" class="date-input" value="${t.claimDate || ''}"
                                           onchange="window.activeModule.updateClaimDate('${t.id}', this.value)"
                                           placeholder="請款日期">
                                ` : ''}
                                ${t.advanceStatus === 'paid' ? `
                                    <input type="date" class="date-input" value="${t.paidDate || ''}"
                                           onchange="window.activeModule.updatePaidDate('${t.id}', this.value)"
                                           placeholder="入帳日期">
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    async updateAdvanceStatus(transactionId, status) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        transaction.advanceStatus = status;
        
        // 設定日期
        if (status === 'claimed' && !transaction.claimDate) {
            transaction.claimDate = new Date().toISOString().split('T')[0];
        }
        if (status === 'paid' && !transaction.paidDate) {
            transaction.paidDate = new Date().toISOString().split('T')[0];
        }
        
        await this.saveData();
        this.refresh();
        this.showToast('狀態已更新', 'success');
    }

    async updateClaimDate(transactionId, date) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        transaction.claimDate = date;
        await this.saveData();
    }

    async updatePaidDate(transactionId, date) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        transaction.paidDate = date;
        await this.saveData();
    }

    // SignageHost 按鈕方法
    switchToOverview() {
        this.switchView('overview');
    }

    switchToTransactions() {
        this.switchView('transactions');
    }

    switchToBudgets() {
        this.switchView('budgets');
    }
}

export { FinanceModule };