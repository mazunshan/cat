/*
  # 重新初始化管理员账号

  1. 清理现有数据
    - 删除所有现有的用户记录以避免重复键冲突
    - 重置用户表

  2. 重新创建默认用户
    - 创建管理员账号
    - 创建销售员账号
    - 确保所有账号都有唯一的用户名和邮箱

  3. 确保数据一致性
    - 所有用户都有正确的角色设置
    - 所有用户都处于活跃状态
*/

-- 清理现有用户数据以避免重复键冲突
DELETE FROM users;

-- 重新插入默认用户，确保没有重复
INSERT INTO users (id, username, email, role, name, is_active, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'admin',
    'admin@catstore.com',
    'admin',
    'Administrator',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'sales1',
    'sales1@catstore.com',
    'sales',
    'Alice Chen',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'sales2',
    'sales2@catstore.com',
    'sales',
    'Bob Wang',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'sales3',
    'sales3@catstore.com',
    'sales',
    'Carol Li',
    true,
    now(),
    now()
  );

-- 验证插入的数据
-- 这个查询会显示所有插入的用户
-- SELECT username, email, role, name, is_active FROM users ORDER BY role, username;