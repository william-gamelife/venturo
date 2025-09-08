-- Venturo 資料庫架構
-- 執行順序很重要，請依序執行

-- 1. 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 使用者角色枚舉
CREATE TYPE user_role AS ENUM ('admin', 'corner', 'user');

-- 3. 任務狀態枚舉
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- 4. 優先級枚舉
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- 5. 任務類型枚舉
CREATE TYPE task_type AS ENUM (
  'task',        -- 一般任務
  'project',     -- 專案
  'invoice',     -- 請款單
  'receipt',     -- 收款單
  'order',       -- 訂單
  'quote',       -- 報價單
  'itinerary',   -- 行程表
  'group',       -- 團體
  'visa',        -- 簽證
  'cashier'      -- 出納
);

-- 6. 使用者資料表（擴展 auth.users）
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

-- 7. 待辦事項主表
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  type task_type DEFAULT 'task',
  
  -- 關聯欄位（連動到其他模組）
  related_id UUID,
  related_type task_type,
  
  -- 時間相關
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- 角落模式擴展資料
  corner_data JSONB DEFAULT '{}',
  
  -- 經驗值獎勵
  exp_reward INTEGER DEFAULT 10,
  
  -- 標籤
  tags TEXT[] DEFAULT '{}',
  
  -- 時間戳記
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 專案表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  
  -- 專案特定欄位
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10, 2),
  progress INTEGER DEFAULT 0,
  
  -- 角落模式資料
  client_name TEXT,
  client_contact JSONB DEFAULT '{}',
  
  -- 關聯
  parent_id UUID REFERENCES projects(id),
  
  -- 元資料
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 團體管理表（角落模式）
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  
  -- 團體資訊
  departure_date DATE,
  return_date DATE,
  member_count INTEGER DEFAULT 0,
  max_members INTEGER,
  
  -- 聯絡資訊
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- 狀態
  status TEXT DEFAULT 'planning',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 訂單表（角落模式）
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id),
  project_id UUID REFERENCES projects(id),
  
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  
  -- 金額
  amount DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- 狀態
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  
  -- 日期
  order_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 經驗值記錄表
CREATE TABLE experience_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  amount INTEGER NOT NULL,
  reason TEXT,
  source_type task_type,
  source_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. 建立索引以提升查詢效能
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_type ON todos(type);
CREATE INDEX idx_todos_due_date ON todos(due_date);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

CREATE INDEX idx_groups_project_id ON groups(project_id);
CREATE INDEX idx_orders_group_id ON orders(group_id);

-- 13. Row Level Security (RLS) 政策
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_logs ENABLE ROW LEVEL SECURITY;

-- Profiles 政策
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Todos 政策
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Projects 政策（同樣模式）
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

-- 14. 觸發器：自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

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

-- 15. 觸發器：完成任務時增加經驗值
CREATE OR REPLACE FUNCTION add_experience_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- 更新使用者經驗值
    UPDATE profiles 
    SET 
      experience = experience + NEW.exp_reward,
      experience_lifetime = experience_lifetime + NEW.exp_reward
    WHERE id = NEW.user_id;
    
    -- 記錄經驗值獲得
    INSERT INTO experience_logs (user_id, amount, reason, source_type, source_id)
    VALUES (NEW.user_id, NEW.exp_reward, '完成任務', NEW.type, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER reward_experience_on_complete 
  AFTER UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION add_experience_on_complete();

-- 16. 函數：檢查並升級等級
CREATE OR REPLACE FUNCTION check_level_up(user_id UUID)
RETURNS void AS $$
DECLARE
  current_exp INTEGER;
  current_level INTEGER;
  exp_needed INTEGER;
BEGIN
  SELECT experience, level INTO current_exp, current_level
  FROM profiles WHERE id = user_id;
  
  -- 升級公式：每級需要 level * 100 經驗
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

-- 17. 建立檢視：使用者統計
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

-- 完成！
-- 請在 Supabase SQL Editor 中執行此腳本
