-- Venturo 資料庫清理與重建腳本
-- ⚠️ 警告：這會刪除所有現有資料！

-- 1. 刪除現有的檢視
DROP VIEW IF EXISTS user_stats CASCADE;

-- 2. 刪除現有的資料表（按照依賴順序）
DROP TABLE IF EXISTS experience_logs CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. 刪除現有的類型
DROP TYPE IF EXISTS task_type CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 4. 刪除函數
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS add_experience_on_complete() CASCADE;
DROP FUNCTION IF EXISTS check_level_up(UUID) CASCADE;

-- 完成清理！
-- 現在可以執行 schema.sql 來重新建立資料庫結構
