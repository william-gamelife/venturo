-- Venturo Supabase Database Schema
-- 版本: 1.0.0
-- 創建日期: 2025-09-10

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 用戶管理表
-- ========================================

-- 用戶資料表（擴展 Supabase auth.users）
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    avatar VARCHAR(50) DEFAULT '🎮',
    role VARCHAR(20) DEFAULT 'GENERAL_USER' CHECK (role IN ('SUPER_ADMIN', 'BUSINESS_ADMIN', 'GENERAL_USER', 'CORNER_EMPLOYEE')),
    title VARCHAR(100),
    world_mode VARCHAR(10) DEFAULT 'game' CHECK (world_mode IN ('game', 'corner')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);

-- 用戶設定表
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings_key VARCHAR(100) NOT NULL,
    settings_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, settings_key)
);

-- ========================================
-- 待辦事項相關表
-- ========================================

-- 待辦事項表
CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'backlog' CHECK (status IN ('backlog', 'in-progress', 'review', 'packaging', 'done', 'waiting', 'unorganized')),
    category VARCHAR(100),
    assignee VARCHAR(100),
    assigned_to VARCHAR(100), -- 相容舊版
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    tags TEXT[], -- PostgreSQL 陣列類型
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 專案相關
    type VARCHAR(20) DEFAULT 'task' CHECK (type IN ('task', 'project')),
    project_id UUID,
    parent_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    
    -- 角落模式
    business_type VARCHAR(20) CHECK (business_type IN ('group', 'order', 'general')),
    group_code VARCHAR(50),
    order_number VARCHAR(50),
    data_completeness VARCHAR(20) CHECK (data_completeness IN ('skeleton', 'basic', 'detailed', 'complete')),
    corner_mode_data JSONB, -- 儲存角落模式的複雜資料
    
    -- 系統欄位
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 子任務表
CREATE TABLE IF NOT EXISTS todo_subtasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    assignee VARCHAR(100),
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 專案相關表
-- ========================================

-- 專案表
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    tags TEXT[],
    
    -- 專案元資料
    client_name VARCHAR(200),
    budget DECIMAL(10, 2),
    estimated_hours INTEGER,
    actual_hours INTEGER,
    
    -- 系統欄位
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 專案任務表
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
    assignee VARCHAR(100),
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_hours INTEGER,
    actual_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 筆記和文件表
-- ========================================

-- 筆記表
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_encrypted BOOLEAN DEFAULT false,
    
    -- 系統欄位
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 時間管理表
-- ========================================

-- 時間盒子記錄表
CREATE TABLE IF NOT EXISTS timebox_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- 以分鐘為單位
    category VARCHAR(100),
    tags TEXT[],
    
    -- 關聯項目
    todo_id UUID REFERENCES todos(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 索引
-- ========================================

-- 用戶資料表索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

-- 用戶設定表索引
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(user_id, settings_key);

-- 待辦事項表索引
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id);
CREATE INDEX IF NOT EXISTS idx_todos_project_id ON todos(project_id);

-- 子任務表索引
CREATE INDEX IF NOT EXISTS idx_todo_subtasks_parent_id ON todo_subtasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_todo_subtasks_user_id ON todo_subtasks(user_id);

-- 專案表索引
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(user_id, due_date);

-- 專案任務表索引
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user_id ON project_tasks(user_id);

-- 筆記表索引
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(user_id, category);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(user_id, is_pinned);

-- 時間盒子表索引
CREATE INDEX IF NOT EXISTS idx_timebox_entries_user_id ON timebox_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_timebox_entries_start_time ON timebox_entries(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_timebox_entries_todo_id ON timebox_entries(todo_id);
CREATE INDEX IF NOT EXISTS idx_timebox_entries_project_id ON timebox_entries(project_id);

-- ========================================
-- 觸發器：自動更新 updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為所有表格添加 updated_at 觸發器
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_todo_subtasks_updated_at BEFORE UPDATE ON todo_subtasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_timebox_entries_updated_at BEFORE UPDATE ON timebox_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- 啟用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timebox_entries ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 政策：用戶只能存取自己的資料
-- 用戶資料：管理員可以看到所有用戶，一般用戶只能看到自己
CREATE POLICY "Users can see own profile or admins see all" ON user_profiles 
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Only admins can insert profiles" ON user_profiles 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Users can update own profile or admins update any" ON user_profiles 
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Only admins can delete profiles" ON user_profiles 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Users can only see their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own todos" ON todos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own subtasks" ON todo_subtasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own project tasks" ON project_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own notes" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own timebox entries" ON timebox_entries FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- 預設資料和函數
-- ========================================

-- 創建管理員帳號的函數（需要使用 service_role 權限執行）
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT DEFAULT 'System Administrator'
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 使用 Supabase Auth 創建用戶
  -- 注意：這個函數需要在 Supabase Dashboard 中手動執行
  -- 或者使用 service_role key 在後端執行
  
  -- 這裡返回一個佔位符 UUID
  -- 實際創建需要使用 supabase.auth.admin.createUser()
  new_user_id := gen_random_uuid();
  
  -- 預留：當有 user_id 時，插入 profile
  -- INSERT INTO user_profiles (id, email, real_name, display_name, role, permissions, created_at, updated_at)
  -- VALUES (
  --   new_user_id,
  --   admin_email,
  --   admin_name,
  --   admin_name,
  --   'SUPER_ADMIN',
  --   jsonb_build_object(
  --     'users', jsonb_build_object('read', true, 'write', true, 'delete', true, 'admin', true),
  --     'todos', jsonb_build_object('read', true, 'write', true, 'delete', true, 'admin', true, 'packaging', true)
  --   ),
  --   NOW(),
  --   NOW()
  -- );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- 建立資料庫視圖以方便查詢
CREATE OR REPLACE VIEW user_todo_stats AS
SELECT 
    user_id,
    COUNT(*) as total_todos,
    COUNT(*) FILTER (WHERE completed = true) as completed_todos,
    COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_todos,
    COUNT(*) FILTER (WHERE due_date < NOW() AND completed = false) as overdue_todos
FROM todos 
WHERE archived = false
GROUP BY user_id;

-- 專案統計視圖
CREATE OR REPLACE VIEW user_project_stats AS
SELECT 
    user_id,
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE status = 'active') as active_projects,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_projects,
    AVG(progress) as average_progress
FROM projects 
WHERE archived = false
GROUP BY user_id;