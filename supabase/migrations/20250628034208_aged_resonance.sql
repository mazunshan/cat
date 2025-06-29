/*
  # 添加售后专员角色

  1. 角色更新
    - 添加售后专员 (after_sales) 角色
    - 确保现有用户数据保持一致

  2. 用户添加
    - 添加售后专员用户 "David Zhang"
    - 确保用户ID和其他属性正确设置
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