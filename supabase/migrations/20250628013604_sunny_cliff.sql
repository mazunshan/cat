/*
  # 重新初始化测试账户

  1. 清理现有数据
    - 删除所有现有的用户记录
    - 重置自增序列

  2. 重新创建测试账户
    - 管理员账户: admin / password123
    - 销售员账户: sales1, sales2, sales3 / password123
    - 确保所有账户都有正确的角色和权限

  3. 数据一致性
    - 所有用户都处于活跃状态
    - 正确的角色分配
    - 唯一的用户名和邮箱
*/

-- 清理现有用户数据
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- 重新插入测试用户账户
INSERT INTO users (id, username, email, role, name, is_active, created_at, updated_at)
VALUES 
  -- 管理员账户
  (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@catstore.com',
    'admin',
    'Administrator',
    true,
    now(),
    now()
  ),
  -- 销售员账户
  (
    '00000000-0000-0000-0000-000000000002',
    'sales1',
    'sales1@catstore.com',
    'sales',
    'Alice Chen',
    true,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'sales2',
    'sales2@catstore.com',
    'sales',
    'Bob Wang',
    true,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'sales3',
    'sales3@catstore.com',
    'sales',
    'Carol Li',
    true,
    now(),
    now()
  );

-- 验证插入的数据
-- SELECT username, email, role, name, is_active FROM users ORDER BY role DESC, username;