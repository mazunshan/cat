/*
  # 添加售后角色和售后专员账户

  1. 新增售后专员账户
    - 添加一个新的售后专员用户
    - 确保用户有正确的角色和权限

  2. 更新现有用户
    - 确保所有用户数据保持一致
*/

-- 添加售后专员账户
INSERT INTO users (id, username, email, role, name, is_active, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000005',
    'aftersales1',
    'aftersales1@catstore.com',
    'after_sales',
    'David Zhang',
    true,
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- 确保其他用户账户存在并正确
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
  )
ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;