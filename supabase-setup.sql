-- GameLife Supabase 資料庫設定
-- 執行順序很重要，請按照以下步驟執行

-- ================================
-- 步驟 1: 建立 user_data 表格
-- ================================
CREATE TABLE IF NOT EXISTS public.user_data (
    user_id UUID NOT NULL,
    module VARCHAR(50) NOT NULL,
    data JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, module)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_module ON public.user_data(module);
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON public.user_data(updated_at DESC);

-- ================================
-- 步驟 2: 啟用 RLS (Row Level Security)
-- ================================
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- ================================
-- 步驟 3: 建立 RLS 政策
-- ================================

-- 移除舊政策（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON public.user_data;
DROP POLICY IF EXISTS "Allow public insert access" ON public.user_data;
DROP POLICY IF EXISTS "Allow public update access" ON public.user_data;
DROP POLICY IF EXISTS "Allow public delete access" ON public.user_data;

-- 建立新的公開存取政策（適用於無需登入的應用）
CREATE POLICY "Enable read access for all users" ON public.user_data
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.user_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.user_data
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON public.user_data
    FOR DELETE USING (true);

-- ================================
-- 步驟 4: 初始化預設資料
-- ================================

-- 插入系統使用者資料儲存位置
INSERT INTO public.user_data (user_id, module, data, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'users', 
     '[
        {
            "id": "william",
            "uuid": "550e8400-e29b-41d4-a716-446655440000",
            "username": "william",
            "password": "pass1234",
            "display_name": "William",
            "role": "SUPER_ADMIN",
            "title": "IT主管",
            "permissions": ["*"]
        },
        {
            "id": "carson",
            "uuid": "550e8400-e29b-41d4-a716-446655440002",
            "username": "carson",
            "password": "pass1234",
            "display_name": "Carson",
            "role": "BUSINESS_ADMIN",
            "title": "工程師",
            "permissions": ["todos", "projects", "calendar", "finance"]
        },
        {
            "id": "kai",
            "uuid": "550e8400-e29b-41d4-a716-446655440003",
            "username": "kai",
            "password": "pass1234",
            "display_name": "KAI",
            "role": "GENERAL_USER",
            "title": "使用者",
            "permissions": ["todos", "calendar"]
        }
     ]'::jsonb,
     NOW())
ON CONFLICT (user_id, module) 
DO UPDATE SET 
    data = EXCLUDED.data,
    updated_at = NOW();

-- ================================
-- 步驟 5: 建立輔助函數
-- ================================

-- 取得特定使用者的模組資料
CREATE OR REPLACE FUNCTION get_user_module_data(p_user_id UUID, p_module VARCHAR)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT data 
        FROM public.user_data 
        WHERE user_id = p_user_id 
        AND module = p_module
    );
END;
$$ LANGUAGE plpgsql;

-- 更新特定使用者的模組資料
CREATE OR REPLACE FUNCTION upsert_user_module_data(
    p_user_id UUID, 
    p_module VARCHAR, 
    p_data JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_data (user_id, module, data, updated_at)
    VALUES (p_user_id, p_module, p_data, NOW())
    ON CONFLICT (user_id, module) 
    DO UPDATE SET 
        data = EXCLUDED.data,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 步驟 6: 測試查詢
-- ================================

-- 測試查詢所有使用者資料
SELECT * FROM public.user_data WHERE module = 'users';

-- 測試查詢特定使用者的特定模組
SELECT * FROM public.user_data 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' 
AND module = 'todos';

-- ================================
-- 步驟 7: 權限設定
-- ================================

-- 確保 anon 角色有適當權限
GRANT ALL ON public.user_data TO anon;
GRANT ALL ON public.user_data TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ================================
-- 注意事項：
-- ================================
-- 1. 請在 Supabase SQL Editor 中執行此腳本
-- 2. 確認 URL 和 anon key 正確
-- 3. 如果遇到 406 錯誤，檢查：
--    a. Accept header 是否正確
--    b. Content-Type 是否為 application/json
--    c. RLS 政策是否生效
-- 4. 測試 API：
--    curl -X GET 'YOUR_SUPABASE_URL/rest/v1/user_data?select=*' \
--      -H "apikey: YOUR_ANON_KEY" \
--      -H "Authorization: Bearer YOUR_ANON_KEY"
