-- 安全更新腳本（保留現有資料）
-- 只建立不存在的物件

-- 1. 建立類型（如果不存在）
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'corner', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_type AS ENUM (
        'task', 'project', 'invoice', 'receipt', 'order',
        'quote', 'itinerary', 'group', 'visa', 'cashier'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 檢查並建立 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
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

-- 3. 檢查並建立 todos 表
CREATE TABLE IF NOT EXISTS todos (
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

-- 4. 檢查並建立其他表...（繼續其他表的建立）

-- 5. 為現有用戶建立 profile（如果需要）
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 6. 啟用 RLS（如果尚未啟用）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 7. 建立政策（使用 IF NOT EXISTS）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- 完成！
