-- Venturo 用戶資料清理腳本
-- 僅在遇到衝突時使用

-- ========================================
-- 安全清理有問題的用戶資料
-- ========================================

-- 1. 檢查目前的用戶狀態
SELECT 
  'Current Users' as status,
  u.id,
  u.email,
  u.created_at,
  p.role,
  p.display_name
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. 如果需要清理特定用戶，取消註釋以下區塊
-- 請將 'USER_EMAIL_HERE' 替換為實際需要刪除的 email

/*
-- 刪除用戶 profile（如果存在）
DELETE FROM user_profiles 
WHERE email = 'USER_EMAIL_HERE';

-- 刪除 auth 用戶
DELETE FROM auth.users 
WHERE email = 'USER_EMAIL_HERE';
*/

-- 3. 確認清理結果
SELECT 
  'After Cleanup' as status,
  COUNT(*) as total_users
FROM auth.users;

-- ========================================
-- 重新檢查表格結構
-- ========================================

-- 檢查 user_profiles 表格是否存在
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles';

-- 檢查 RLS 政策
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';