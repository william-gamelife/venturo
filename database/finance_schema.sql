-- 財務管理模組資料庫架構
-- 建立在現有 Venturo 資料庫基礎上

-- 1. 財務相關枚舉類型
CREATE TYPE asset_type AS ENUM (
  'cash',           -- 現金/錢包
  'bank_account',   -- 銀行帳戶
  'credit_card',    -- 信用卡
  'investment',     -- 投資（股票、基金）
  'insurance',      -- 保險
  'property',       -- 房地產
  'other'           -- 其他資產
);

CREATE TYPE transaction_type AS ENUM (
  'income',         -- 收入
  'expense',        -- 支出
  'transfer',       -- 轉帳
  'adjustment'      -- 調整
);

CREATE TYPE advance_status AS ENUM (
  'pending',        -- 待處理
  'approved',       -- 已批准
  'disbursed',      -- 已撥款
  'reimbursed',     -- 已核銷
  'rejected'        -- 已拒絕
);

-- 2. 資產分類表
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 個人資產表
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE RESTRICT,
  
  name TEXT NOT NULL,
  description TEXT,
  type asset_type NOT NULL,
  
  -- 帳戶資訊
  account_number TEXT,
  bank_name TEXT,
  currency TEXT DEFAULT 'TWD',
  
  -- 金額資訊
  balance DECIMAL(15, 2) DEFAULT 0,
  credit_limit DECIMAL(15, 2),
  available_credit DECIMAL(15, 2),
  
  -- 投資相關
  cost_basis DECIMAL(15, 2),
  current_value DECIMAL(15, 2),
  
  -- 狀態
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  
  -- 同步設定
  auto_sync BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  
  -- 元資料
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 預算分類表
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES budget_categories(id),
  
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#10B981',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 預算表
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- 預算期間
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- 預算金額
  planned_amount DECIMAL(12, 2) NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
  
  -- 遊戲化元素
  target_savings DECIMAL(12, 2),
  achievement_level INTEGER DEFAULT 1,
  bonus_exp INTEGER DEFAULT 0,
  
  -- 狀態
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'monthly', 'quarterly', etc.
  
  -- 提醒設定
  alert_threshold DECIMAL(3, 2) DEFAULT 0.8, -- 80% 時提醒
  alert_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 收支交易表
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- 關聯資產
  from_asset_id UUID REFERENCES assets(id),
  to_asset_id UUID REFERENCES assets(id),
  
  -- 預算分類
  budget_category_id UUID REFERENCES budget_categories(id),
  
  -- 基本資訊
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TWD',
  type transaction_type NOT NULL,
  
  -- 日期
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- 標籤和分類
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  
  -- 收據和證明
  receipt_url TEXT,
  receipt_data JSONB DEFAULT '{}',
  
  -- 關聯墊款或核銷
  advance_id UUID REFERENCES advances(id),
  reimbursement_id UUID REFERENCES reimbursements(id),
  
  -- 遊戲化
  exp_earned INTEGER DEFAULT 1,
  achievement_unlocked TEXT[],
  
  -- 狀態
  is_verified BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  
  -- 元資料
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 墊款表（公司墊款管理）
CREATE TABLE advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES profiles(id),
  
  -- 基本資訊
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TWD',
  
  -- 用途
  purpose TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  expected_date DATE,
  
  -- 狀態管理
  status advance_status DEFAULT 'pending',
  
  -- 審批流程
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  due_date DATE,
  
  -- 核銷相關
  reimbursed_amount DECIMAL(12, 2) DEFAULT 0,
  outstanding_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - reimbursed_amount) STORED,
  
  -- 文件和備註
  documents JSONB DEFAULT '{}',
  approval_notes TEXT,
  
  -- 角落API整合
  corner_reference_id TEXT,
  corner_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 核銷表
CREATE TABLE reimbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  advance_id UUID REFERENCES advances(id),
  
  -- 基本資訊
  title TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- 狀態
  status advance_status DEFAULT 'pending',
  
  -- 審批
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  
  -- 文件
  receipts JSONB DEFAULT '{}',
  documents JSONB DEFAULT '{}',
  
  -- 備註
  notes TEXT,
  approval_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 財務目標表（遊戲化元素）
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- 期限
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  
  -- 遊戲化
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  reward_exp INTEGER DEFAULT 100,
  milestone_rewards JSONB DEFAULT '{}',
  
  -- 狀態
  is_active BOOLEAN DEFAULT true,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 建立索引
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_active ON assets(is_active) WHERE is_active = true;

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_period ON budgets(period_start, period_end);
CREATE INDEX idx_budgets_active ON budgets(is_active) WHERE is_active = true;

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_budget_category ON transactions(budget_category_id);

CREATE INDEX idx_advances_user_id ON advances(user_id);
CREATE INDEX idx_advances_status ON advances(status);
CREATE INDEX idx_advances_requester ON advances(requester_id);

CREATE INDEX idx_reimbursements_user_id ON reimbursements(user_id);
CREATE INDEX idx_reimbursements_advance ON reimbursements(advance_id);

-- 11. Row Level Security 政策
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- 個人財務資料政策（只能管理自己的）
CREATE POLICY "Users can manage own asset categories" ON asset_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own assets" ON assets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budget categories" ON budget_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own financial goals" ON financial_goals
  FOR ALL USING (auth.uid() = user_id);

-- 墊款政策（可以看到自己申請的，管理員可以看到所有）
CREATE POLICY "Users can see own advances" ON advances
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('corner', 'admin')
    )
  );

CREATE POLICY "Users can create advances" ON advances
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Managers can update advances" ON advances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('corner', 'admin')
    )
  );

-- 核銷政策（同墊款）
CREATE POLICY "Users can see relevant reimbursements" ON reimbursements
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('corner', 'admin')
    )
  );

CREATE POLICY "Users can create reimbursements" ON reimbursements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. 觸發器：自動更新 updated_at
CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advances_updated_at BEFORE UPDATE ON advances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reimbursements_updated_at BEFORE UPDATE ON reimbursements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. 觸發器：記帳時更新預算支出
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- 只有支出類型才更新預算
  IF NEW.type = 'expense' AND NEW.budget_category_id IS NOT NULL THEN
    UPDATE budgets 
    SET spent_amount = spent_amount + NEW.amount
    WHERE category_id = NEW.budget_category_id
      AND period_start <= NEW.transaction_date 
      AND period_end >= NEW.transaction_date
      AND user_id = NEW.user_id;
  END IF;
  
  -- 記帳獲得經驗值
  UPDATE profiles 
  SET experience = experience + COALESCE(NEW.exp_earned, 1)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_budget_on_transaction 
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

-- 14. 觸發器：資產餘額更新
CREATE OR REPLACE FUNCTION update_asset_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新來源資產餘額（支出）
  IF NEW.from_asset_id IS NOT NULL THEN
    UPDATE assets 
    SET balance = balance - NEW.amount
    WHERE id = NEW.from_asset_id;
  END IF;
  
  -- 更新目標資產餘額（收入）
  IF NEW.to_asset_id IS NOT NULL THEN
    UPDATE assets 
    SET balance = balance + NEW.amount
    WHERE id = NEW.to_asset_id;
  END IF;
  
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_asset_balance_on_transaction 
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_asset_balance();

-- 15. 檢視：財務總覽
CREATE VIEW financial_overview AS
SELECT 
  p.id,
  p.username,
  
  -- 資產總計
  COALESCE(SUM(a.balance) FILTER (WHERE a.type = 'cash'), 0) as total_cash,
  COALESCE(SUM(a.balance) FILTER (WHERE a.type = 'bank_account'), 0) as total_bank,
  COALESCE(SUM(a.current_value) FILTER (WHERE a.type = 'investment'), 0) as total_investment,
  COALESCE(SUM(a.balance), 0) as total_assets,
  
  -- 本月預算使用情況
  COALESCE(SUM(b.planned_amount) FILTER (
    WHERE b.period_start <= CURRENT_DATE 
    AND b.period_end >= CURRENT_DATE
  ), 0) as monthly_budget,
  
  COALESCE(SUM(b.spent_amount) FILTER (
    WHERE b.period_start <= CURRENT_DATE 
    AND b.period_end >= CURRENT_DATE
  ), 0) as monthly_spent,
  
  -- 本月收支
  COALESCE(SUM(t.amount) FILTER (
    WHERE t.type = 'income' 
    AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
  ), 0) as monthly_income,
  
  COALESCE(SUM(t.amount) FILTER (
    WHERE t.type = 'expense' 
    AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
  ), 0) as monthly_expense

FROM profiles p
LEFT JOIN assets a ON p.id = a.user_id AND a.is_active = true
LEFT JOIN budgets b ON p.id = b.user_id AND b.is_active = true
LEFT JOIN transactions t ON p.id = t.user_id
GROUP BY p.id, p.username;

-- 完成！