-- ================================
-- Venturo 完整資料庫設定 SQL
-- 一次執行完成所有架構設定
-- ================================

-- 1. 啟用必要擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 建立所有枚舉類型
CREATE TYPE user_role AS ENUM ('admin', 'corner', 'user');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_type AS ENUM (
  'task', 'project', 'invoice', 'receipt', 'order', 
  'quote', 'itinerary', 'group', 'visa', 'cashier'
);
CREATE TYPE asset_type AS ENUM (
  'cash', 'bank_account', 'credit_card', 'investment', 
  'insurance', 'property', 'other'
);
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer', 'adjustment');
CREATE TYPE advance_status AS ENUM ('pending', 'approved', 'disbursed', 'reimbursed', 'rejected');

-- 3. 建立核心資料表

-- 使用者檔案表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  experience_lifetime INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 待辦事項表
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  type task_type DEFAULT 'task',
  related_id UUID,
  related_type task_type,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  corner_data JSONB DEFAULT '{}',
  exp_reward INTEGER DEFAULT 10,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 專案表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10, 2),
  progress INTEGER DEFAULT 0,
  client_name TEXT,
  client_contact JSONB DEFAULT '{}',
  parent_id UUID REFERENCES projects(id),
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 團體表
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  departure_date DATE,
  return_date DATE,
  member_count INTEGER DEFAULT 0,
  max_members INTEGER,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'planning',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 訂單表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id),
  project_id UUID REFERENCES projects(id),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  amount DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  order_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 經驗值記錄表
CREATE TABLE experience_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  source_type task_type,
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 財務管理模組表

-- 資產分類表
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

-- 個人資產表
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  type asset_type NOT NULL,
  account_number TEXT,
  bank_name TEXT,
  currency TEXT DEFAULT 'TWD',
  balance DECIMAL(15, 2) DEFAULT 0,
  credit_limit DECIMAL(15, 2),
  available_credit DECIMAL(15, 2),
  cost_basis DECIMAL(15, 2),
  current_value DECIMAL(15, 2),
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  auto_sync BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 預算分類表
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

-- 預算表
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  planned_amount DECIMAL(12, 2) NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
  target_savings DECIMAL(12, 2),
  achievement_level INTEGER DEFAULT 1,
  bonus_exp INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  alert_threshold DECIMAL(3, 2) DEFAULT 0.8,
  alert_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 墊款表
CREATE TABLE advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TWD',
  purpose TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  expected_date DATE,
  status advance_status DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  due_date DATE,
  reimbursed_amount DECIMAL(12, 2) DEFAULT 0,
  outstanding_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - reimbursed_amount) STORED,
  documents JSONB DEFAULT '{}',
  approval_notes TEXT,
  corner_reference_id TEXT,
  corner_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 核銷表
CREATE TABLE reimbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  advance_id UUID REFERENCES advances(id),
  title TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(12, 2) NOT NULL,
  status advance_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  receipts JSONB DEFAULT '{}',
  documents JSONB DEFAULT '{}',
  notes TEXT,
  approval_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收支交易表
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_asset_id UUID REFERENCES assets(id),
  to_asset_id UUID REFERENCES assets(id),
  budget_category_id UUID REFERENCES budget_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TWD',
  type transaction_type NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  receipt_url TEXT,
  receipt_data JSONB DEFAULT '{}',
  advance_id UUID REFERENCES advances(id),
  reimbursement_id UUID REFERENCES reimbursements(id),
  exp_earned INTEGER DEFAULT 1,
  achievement_unlocked TEXT[],
  is_verified BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 財務目標表
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  reward_exp INTEGER DEFAULT 100,
  milestone_rewards JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 建立索引
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_type ON todos(type);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_groups_project_id ON groups(project_id);
CREATE INDEX idx_orders_group_id ON orders(group_id);
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

-- 6. 啟用 Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- 7. 建立安全政策

-- Profiles 政策
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Todos 政策
CREATE POLICY "Users can manage own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

-- Projects 政策
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Groups 政策（角落員工以上）
CREATE POLICY "Corner staff can manage groups" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('corner', 'admin')
    )
  );

-- Orders 政策（角落員工以上）
CREATE POLICY "Corner staff can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('corner', 'admin')
    )
  );

-- 個人財務資料政策
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

-- 墊款政策
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

-- 核銷政策
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

-- 8. 建立觸發器函數

-- 更新 updated_at 函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- 為所有需要的表建立觸發器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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

-- 完成任務時增加經驗值
CREATE OR REPLACE FUNCTION add_experience_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles 
    SET 
      experience = experience + NEW.exp_reward,
      experience_lifetime = experience_lifetime + NEW.exp_reward
    WHERE id = NEW.user_id;
    
    INSERT INTO experience_logs (user_id, amount, reason, source_type, source_id)
    VALUES (NEW.user_id, NEW.exp_reward, '完成任務', NEW.type, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER reward_experience_on_complete 
  AFTER UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION add_experience_on_complete();

-- 記帳時更新預算支出
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'expense' AND NEW.budget_category_id IS NOT NULL THEN
    UPDATE budgets 
    SET spent_amount = spent_amount + NEW.amount
    WHERE category_id = NEW.budget_category_id
      AND period_start <= NEW.transaction_date 
      AND period_end >= NEW.transaction_date
      AND user_id = NEW.user_id;
  END IF;
  
  UPDATE profiles 
  SET experience = experience + COALESCE(NEW.exp_earned, 1)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_budget_on_transaction 
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

-- 資產餘額更新
CREATE OR REPLACE FUNCTION update_asset_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.from_asset_id IS NOT NULL THEN
    UPDATE assets 
    SET balance = balance - NEW.amount
    WHERE id = NEW.from_asset_id;
  END IF;
  
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

-- 等級檢查函數
CREATE OR REPLACE FUNCTION check_level_up(user_id UUID)
RETURNS void AS $$
DECLARE
  current_exp INTEGER;
  current_level INTEGER;
  exp_needed INTEGER;
BEGIN
  SELECT experience, level INTO current_exp, current_level
  FROM profiles WHERE id = user_id;
  
  exp_needed := current_level * 100;
  
  WHILE current_exp >= exp_needed LOOP
    current_exp := current_exp - exp_needed;
    current_level := current_level + 1;
    exp_needed := current_level * 100;
  END LOOP;
  
  UPDATE profiles 
  SET experience = current_exp, level = current_level
  WHERE id = user_id;
END;
$$ language plpgsql;

-- 9. 建立檢視

-- 使用者統計檢視
CREATE VIEW user_stats AS
SELECT 
  p.id,
  p.username,
  p.level,
  p.experience,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
  COUNT(DISTINCT pr.id) as total_projects,
  SUM(o.amount) as total_revenue
FROM profiles p
LEFT JOIN todos t ON p.id = t.user_id
LEFT JOIN projects pr ON p.id = pr.user_id
LEFT JOIN orders o ON p.id = o.user_id
GROUP BY p.id, p.username, p.level, p.experience;

-- 財務總覽檢視
CREATE VIEW financial_overview AS
SELECT 
  p.id,
  p.username,
  COALESCE(SUM(a.balance) FILTER (WHERE a.type = 'cash'), 0) as total_cash,
  COALESCE(SUM(a.balance) FILTER (WHERE a.type = 'bank_account'), 0) as total_bank,
  COALESCE(SUM(a.current_value) FILTER (WHERE a.type = 'investment'), 0) as total_investment,
  COALESCE(SUM(a.balance), 0) as total_assets,
  COALESCE(SUM(b.planned_amount) FILTER (
    WHERE b.period_start <= CURRENT_DATE 
    AND b.period_end >= CURRENT_DATE
  ), 0) as monthly_budget,
  COALESCE(SUM(b.spent_amount) FILTER (
    WHERE b.period_start <= CURRENT_DATE 
    AND b.period_end >= CURRENT_DATE
  ), 0) as monthly_spent,
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

-- ================================
-- 🎉 Venturo 資料庫設定完成！
-- ================================

-- 成功訊息
DO $$
BEGIN
  RAISE NOTICE '🎉 Venturo 資料庫架構設定完成！';
  RAISE NOTICE '✅ 已建立 %s 個資料表', (
    SELECT count(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  );
  RAISE NOTICE '✅ 已建立 %s 個檢視', (
    SELECT count(*) FROM information_schema.views 
    WHERE table_schema = 'public'
  );
  RAISE NOTICE '✅ Row Level Security 已啟用';
  RAISE NOTICE '✅ 觸發器和函數已建立';
  RAISE NOTICE '';
  RAISE NOTICE '下一步：請返回 Venturo 應用程式測試連線！';
END $$;