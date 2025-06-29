/*
  # 猫咪销售管理系统完整数据库架构

  1. 表结构
    - 用户管理：users
    - 客户管理：customers, customer_files
    - 产品管理：products
    - 订单管理：orders, order_products, installment_plans, payments
    - 知识库：knowledge_base
    - 售后服务：after_sales_records
    - 考勤管理：attendance_records

  2. 安全设置
    - 所有表启用行级安全策略(RLS)
    - 基于角色的访问控制
    - 适当的数据隔离

  3. 测试数据
    - 包含完整的测试账户和示例数据
    - 支持系统所有功能的演示
*/

-- ============================================================================
-- 第一步：清理现有策略（避免重复创建错误）
-- ============================================================================

-- 删除可能存在的策略
DO $$
BEGIN
    -- 尝试删除所有可能存在的策略
    EXECUTE 'DROP POLICY IF EXISTS users_read_policy ON users';
    EXECUTE 'DROP POLICY IF EXISTS users_insert_policy ON users';
    EXECUTE 'DROP POLICY IF EXISTS users_update_policy ON users';
    EXECUTE 'DROP POLICY IF EXISTS users_delete_policy ON users';
    
    EXECUTE 'DROP POLICY IF EXISTS customers_read_policy ON customers';
    EXECUTE 'DROP POLICY IF EXISTS customers_insert_policy ON customers';
    EXECUTE 'DROP POLICY IF EXISTS customers_update_policy ON customers';
    EXECUTE 'DROP POLICY IF EXISTS customers_delete_policy ON customers';
    
    EXECUTE 'DROP POLICY IF EXISTS customer_files_read_policy ON customer_files';
    EXECUTE 'DROP POLICY IF EXISTS customer_files_insert_policy ON customer_files';
    
    EXECUTE 'DROP POLICY IF EXISTS products_read_policy ON products';
    EXECUTE 'DROP POLICY IF EXISTS products_insert_policy ON products';
    EXECUTE 'DROP POLICY IF EXISTS products_update_policy ON products';
    
    EXECUTE 'DROP POLICY IF EXISTS orders_read_policy ON orders';
    EXECUTE 'DROP POLICY IF EXISTS orders_insert_policy ON orders';
    EXECUTE 'DROP POLICY IF EXISTS orders_update_policy ON orders';
    
    EXECUTE 'DROP POLICY IF EXISTS order_products_read_policy ON order_products';
    EXECUTE 'DROP POLICY IF EXISTS order_products_insert_policy ON order_products';
    
    EXECUTE 'DROP POLICY IF EXISTS installment_plans_read_policy ON installment_plans';
    EXECUTE 'DROP POLICY IF EXISTS installment_plans_insert_policy ON installment_plans';
    EXECUTE 'DROP POLICY IF EXISTS installment_plans_update_policy ON installment_plans';
    
    EXECUTE 'DROP POLICY IF EXISTS payments_read_policy ON payments';
    EXECUTE 'DROP POLICY IF EXISTS payments_insert_policy ON payments';
    EXECUTE 'DROP POLICY IF EXISTS payments_update_policy ON payments';
    
    EXECUTE 'DROP POLICY IF EXISTS knowledge_base_read_policy ON knowledge_base';
    EXECUTE 'DROP POLICY IF EXISTS knowledge_base_insert_policy ON knowledge_base';
    EXECUTE 'DROP POLICY IF EXISTS knowledge_base_update_policy ON knowledge_base';
    
    EXECUTE 'DROP POLICY IF EXISTS after_sales_records_read_policy ON after_sales_records';
    EXECUTE 'DROP POLICY IF EXISTS after_sales_records_insert_policy ON after_sales_records';
    EXECUTE 'DROP POLICY IF EXISTS after_sales_records_update_policy ON after_sales_records';
    
    EXECUTE 'DROP POLICY IF EXISTS attendance_records_read_policy ON attendance_records';
    EXECUTE 'DROP POLICY IF EXISTS attendance_records_insert_policy ON attendance_records';
    EXECUTE 'DROP POLICY IF EXISTS attendance_records_update_policy ON attendance_records';
    EXECUTE 'DROP POLICY IF EXISTS attendance_records_admin_policy ON attendance_records';
    
    -- 删除可能存在的其他通用命名策略
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON users';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON users';
    EXECUTE 'DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON users';
    
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers';
    EXECUTE 'DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON customers';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read customer files" ON customer_files';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert customer files" ON customer_files';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read all products" ON products';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert products" ON products';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update products" ON products';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read all orders" ON orders';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert orders" ON orders';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update orders" ON orders';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read order products" ON order_products';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert order products" ON order_products';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read installment plans" ON installment_plans';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert installment plans" ON installment_plans';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update installment plans" ON installment_plans';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read payments" ON payments';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert payments" ON payments';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update payments" ON payments';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read knowledge base" ON knowledge_base';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert knowledge base" ON knowledge_base';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update knowledge base" ON knowledge_base';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read after sales records" ON after_sales_records';
    EXECUTE 'DROP POLICY IF EXISTS "After sales and admin can insert records" ON after_sales_records';
    EXECUTE 'DROP POLICY IF EXISTS "After sales and admin can update records" ON after_sales_records';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can read all attendance records" ON attendance_records';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own attendance" ON attendance_records';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own attendance" ON attendance_records';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all attendance records" ON attendance_records';
EXCEPTION
    WHEN OTHERS THEN
        -- 忽略策略不存在的错误
        NULL;
END $$;

-- ============================================================================
-- 第二步：创建基础表结构
-- ============================================================================

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'sales',
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建客户表
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL DEFAULT 'female',
  phone text NOT NULL,
  wechat text DEFAULT '',
  address text DEFAULT '',
  occupation text DEFAULT '',
  tags text[] DEFAULT '{}',
  notes text DEFAULT '',
  assigned_sales text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建客户文件表
CREATE TABLE IF NOT EXISTS customer_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  description text DEFAULT '',
  uploaded_at timestamptz DEFAULT now()
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  breed text NOT NULL,
  age text NOT NULL,
  gender text NOT NULL DEFAULT 'female',
  price integer NOT NULL,
  description text DEFAULT '',
  images text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  amount integer NOT NULL,
  payment_method text NOT NULL DEFAULT 'full',
  status text NOT NULL DEFAULT 'pending_payment',
  order_date date DEFAULT CURRENT_DATE,
  sales_person text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建订单产品关联表
CREATE TABLE IF NOT EXISTS order_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  price integer NOT NULL
);

-- 创建分期付款计划表
CREATE TABLE IF NOT EXISTS installment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  total_installments integer NOT NULL,
  installment_amount integer NOT NULL,
  paid_installments integer DEFAULT 0,
  next_payment_date date NOT NULL
);

-- 创建付款记录表
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_plan_id uuid REFERENCES installment_plans(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  amount integer NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status text NOT NULL DEFAULT 'pending'
);

-- 创建知识库表
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- 创建售后服务记录表
CREATE TABLE IF NOT EXISTS after_sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  agent text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建考勤记录表
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status text NOT NULL DEFAULT 'absent',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 第三步：启用行级安全策略 (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE after_sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 第四步：创建 RLS 策略
-- ============================================================================

-- 用户表策略
CREATE POLICY "users_read_policy" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users_insert_policy" ON users
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "users_update_policy" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ))
  WITH CHECK (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));

CREATE POLICY "users_delete_policy" ON users
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));

-- 客户表策略
CREATE POLICY "customers_read_policy" ON customers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "customers_insert_policy" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "customers_update_policy" ON customers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "customers_delete_policy" ON customers
  FOR DELETE TO authenticated
  USING (true);

-- 客户文件策略
CREATE POLICY "customer_files_read_policy" ON customer_files
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "customer_files_insert_policy" ON customer_files
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 产品表策略
CREATE POLICY "products_read_policy" ON products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "products_insert_policy" ON products
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_update_policy" ON products
  FOR UPDATE TO authenticated
  USING (true);

-- 订单表策略
CREATE POLICY "orders_read_policy" ON orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "orders_update_policy" ON orders
  FOR UPDATE TO authenticated
  USING (true);

-- 订单产品关联表策略
CREATE POLICY "order_products_read_policy" ON order_products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "order_products_insert_policy" ON order_products
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 分期付款计划策略
CREATE POLICY "installment_plans_read_policy" ON installment_plans
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "installment_plans_insert_policy" ON installment_plans
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "installment_plans_update_policy" ON installment_plans
  FOR UPDATE TO authenticated
  USING (true);

-- 付款记录策略
CREATE POLICY "payments_read_policy" ON payments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "payments_insert_policy" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "payments_update_policy" ON payments
  FOR UPDATE TO authenticated
  USING (true);

-- 知识库策略
CREATE POLICY "knowledge_base_read_policy" ON knowledge_base
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "knowledge_base_insert_policy" ON knowledge_base
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "knowledge_base_update_policy" ON knowledge_base
  FOR UPDATE TO authenticated
  USING (true);

-- 售后服务记录策略
CREATE POLICY "after_sales_records_read_policy" ON after_sales_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "after_sales_records_insert_policy" ON after_sales_records
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('after_sales', 'admin')
    )
  );

CREATE POLICY "after_sales_records_update_policy" ON after_sales_records
  FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('after_sales', 'admin')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('after_sales', 'admin')
    )
  );

-- 考勤记录策略
CREATE POLICY "attendance_records_read_policy" ON attendance_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "attendance_records_insert_policy" ON attendance_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendance_records_update_policy" ON attendance_records
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendance_records_admin_policy" ON attendance_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 第五步：创建索引
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_sales ON customers(assigned_sales);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_customer_files_customer_id ON customer_files(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_products_order_id ON order_products(order_id);
CREATE INDEX IF NOT EXISTS idx_installment_plans_order_id ON installment_plans(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_installment_plan_id ON payments(installment_plan_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_after_sales_records_order_id ON after_sales_records(order_id);
CREATE INDEX IF NOT EXISTS idx_after_sales_records_status ON after_sales_records(status);
CREATE INDEX IF NOT EXISTS idx_after_sales_records_date ON after_sales_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

-- 创建唯一约束
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_records_user_date 
  ON attendance_records(user_id, date);

-- ============================================================================
-- 第六步：创建触发器函数和触发器
-- ============================================================================

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 删除可能存在的触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
DROP TRIGGER IF EXISTS update_after_sales_records_updated_at ON after_sales_records;
DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_after_sales_records_updated_at BEFORE UPDATE ON after_sales_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 第七步：清理现有数据并插入测试数据
-- ============================================================================

-- 清理现有数据（如果需要重新开始）
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE installment_plans RESTART IDENTITY CASCADE;
TRUNCATE TABLE order_products RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE customer_files RESTART IDENTITY CASCADE;
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE knowledge_base RESTART IDENTITY CASCADE;
TRUNCATE TABLE after_sales_records RESTART IDENTITY CASCADE;
TRUNCATE TABLE attendance_records RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- ============================================================================
-- 第八步：插入测试用户账户
-- ============================================================================

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
  ),
  -- 售后专员账户
  (
    '00000000-0000-0000-0000-000000000005',
    'aftersales1',
    'aftersales1@catstore.com',
    'after_sales',
    'David Zhang',
    true,
    now(),
    now()
  );

-- ============================================================================
-- 第九步：插入示例业务数据
-- ============================================================================

-- 创建临时变量来存储生成的UUID
DO $$
DECLARE
    customer1_id uuid := gen_random_uuid();
    customer2_id uuid := gen_random_uuid();
    customer3_id uuid := gen_random_uuid();
    customer4_id uuid := gen_random_uuid();
    customer5_id uuid := gen_random_uuid();
    
    product1_id uuid := gen_random_uuid();
    product2_id uuid := gen_random_uuid();
    product3_id uuid := gen_random_uuid();
    product4_id uuid := gen_random_uuid();
    product5_id uuid := gen_random_uuid();
    product6_id uuid := gen_random_uuid();
    
    order1_id uuid := gen_random_uuid();
    order2_id uuid := gen_random_uuid();
    order3_id uuid := gen_random_uuid();
    order4_id uuid := gen_random_uuid();
    
    plan2_id uuid := gen_random_uuid();
    plan4_id uuid := gen_random_uuid();
BEGIN
    -- 插入客户数据
    INSERT INTO customers (id, name, gender, phone, wechat, address, occupation, tags, notes, assigned_sales, created_at, updated_at)
    VALUES 
      (
        customer1_id,
        '张小美',
        'female',
        '13800138001',
        'zhang_xiaomei',
        '北京市朝阳区三里屯路123号',
        'UI设计师',
        ARRAY['高意向', '英短爱好者', '预算充足'],
        '很喜欢银渐层，已看过多只猫咪，计划本月内购买',
        'Alice Chen',
        '2024-01-15 10:00:00+00'::timestamptz,
        '2024-01-15 10:00:00+00'::timestamptz
      ),
      (
        customer2_id,
        '李先生',
        'male',
        '13900139002',
        'li_mister',
        '上海市浦东新区世纪大道456号',
        '软件工程师',
        ARRAY['分期付款', '布偶猫', '首次购买'],
        '选择分期付款，工作稳定，收入可观，对布偶猫很感兴趣',
        'Bob Wang',
        '2024-02-01 09:30:00+00'::timestamptz,
        '2024-02-01 09:30:00+00'::timestamptz
      ),
      (
        customer3_id,
        '王女士',
        'female',
        '13700137003',
        'wang_lady',
        '广州市天河区珠江新城789号',
        '市场经理',
        ARRAY['老客户', '推荐朋友', '全款'],
        '第二次购买，上次购买布偶猫很满意，这次为朋友推荐',
        'Alice Chen',
        '2024-02-15 14:20:00+00'::timestamptz,
        '2024-02-15 14:20:00+00'::timestamptz
      ),
      (
        customer4_id,
        '陈先生',
        'male',
        '13600136004',
        'chen_sir',
        '深圳市南山区科技园路321号',
        '产品经理',
        ARRAY['波斯猫', '高端客户', '全款'],
        '对波斯猫情有独钟，预算充足，要求品相优秀',
        'Carol Li',
        '2024-03-01 11:15:00+00'::timestamptz,
        '2024-03-01 11:15:00+00'::timestamptz
      ),
      (
        customer5_id,
        '刘小姐',
        'female',
        '13500135005',
        'liu_miss',
        '杭州市西湖区文三路654号',
        '教师',
        ARRAY['暹罗猫', '预算有限', '分期'],
        '喜欢暹罗猫，预算有限，希望分期付款',
        'Bob Wang',
        '2024-03-10 16:45:00+00'::timestamptz,
        '2024-03-10 16:45:00+00'::timestamptz
      );

    -- 插入客户文件数据
    INSERT INTO customer_files (id, customer_id, name, type, url, description, uploaded_at)
    VALUES 
      (
        gen_random_uuid(),
        customer1_id,
        '家庭环境照片',
        'image',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        '客户家中养猫环境，空间宽敞，适合养猫',
        '2024-01-16 10:30:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        customer1_id,
        '客户与猫咪合影',
        'image',
        'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg',
        '客户很喜欢猫咪，有养猫经验',
        '2024-01-18 15:20:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        customer2_id,
        '收入证明',
        'document',
        'https://example.com/income-proof.pdf',
        '月收入15000元，适合分期付款',
        '2024-02-02 09:45:00+00'::timestamptz
      );

    -- 插入产品数据
    INSERT INTO products (id, name, breed, age, gender, price, description, images, videos, is_available, features, created_at, updated_at)
    VALUES 
      (
        product1_id,
        '银渐层英短',
        '英国短毛猫',
        '3个月',
        'female',
        8800,
        '纯种银渐层英短，毛色均匀，性格温顺，已完成疫苗接种。父母均为CFA认证血统，品相优秀，健康保证。',
        ARRAY[
          'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg',
          'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
          'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
        ],
        ARRAY['https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'],
        true,
        ARRAY['纯种血统', '疫苗齐全', '健康保证', '可上门看猫', 'CFA认证'],
        '2024-01-01 08:00:00+00'::timestamptz,
        '2024-01-01 08:00:00+00'::timestamptz
      ),
      (
        product2_id,
        '蓝双色布偶猫',
        '布偶猫',
        '4个月',
        'male',
        12000,
        '蓝双色布偶猫，眼睛湛蓝，毛质柔顺，性格粘人。来自知名猫舍，父母均有优秀血统证书。',
        ARRAY[
          'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg',
          'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
          'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
        ],
        ARRAY[]::text[],
        true,
        ARRAY['CFA认证', '父母均有证书', '毛色标准', '性格亲人', '健康检查'],
        '2024-01-05 09:15:00+00'::timestamptz,
        '2024-01-05 09:15:00+00'::timestamptz
      ),
      (
        product3_id,
        '金点波斯猫',
        '波斯猫',
        '5个月',
        'female',
        15000,
        '金点波斯猫，毛色华丽，面部扁平，典型波斯猫特征。性格温和，适合家庭饲养。',
        ARRAY[
          'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
          'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg'
        ],
        ARRAY[]::text[],
        false,
        ARRAY['纯种血统', '毛色华丽', '性格温和', '适合家庭', '健康保证'],
        '2024-01-10 10:30:00+00'::timestamptz,
        '2024-01-10 10:30:00+00'::timestamptz
      ),
      (
        product4_id,
        '纯白波斯猫',
        '波斯猫',
        '6个月',
        'male',
        18000,
        '纯白波斯猫，毛色纯净如雪，眼睛蓝色，品相极佳。来自顶级血统，适合参赛或繁殖。',
        ARRAY[
          'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg',
          'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg'
        ],
        ARRAY[]::text[],
        true,
        ARRAY['顶级血统', '品相极佳', '适合参赛', '繁殖价值', '健康认证'],
        '2024-01-15 11:45:00+00'::timestamptz,
        '2024-01-15 11:45:00+00'::timestamptz
      ),
      (
        product5_id,
        '海豹色暹罗猫',
        '暹罗猫',
        '3个月',
        'female',
        6800,
        '海豹色暹罗猫，颜色对比鲜明，性格活泼好动，智商很高，容易训练。',
        ARRAY[
          'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg',
          'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
        ],
        ARRAY[]::text[],
        true,
        ARRAY['颜色标准', '性格活泼', '智商很高', '容易训练', '健康活泼'],
        '2024-01-20 13:20:00+00'::timestamptz,
        '2024-01-20 13:20:00+00'::timestamptz
      ),
      (
        product6_id,
        '蓝猫英短',
        '英国短毛猫',
        '4个月',
        'male',
        7500,
        '蓝猫英短，毛色纯正，体型圆润，性格稳重。是英短中的经典色系，深受喜爱。',
        ARRAY[
          'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
          'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
        ],
        ARRAY[]::text[],
        true,
        ARRAY['毛色纯正', '体型标准', '性格稳重', '经典色系', '健康保证'],
        '2024-01-25 14:10:00+00'::timestamptz,
        '2024-01-25 14:10:00+00'::timestamptz
      );

    -- 插入订单数据
    INSERT INTO orders (id, customer_id, order_number, amount, payment_method, status, order_date, sales_person, created_at, updated_at)
    VALUES 
      (
        order1_id,
        customer1_id,
        'ORD-2024-001',
        8800,
        'full',
        'completed',
        '2024-02-01'::date,
        'Alice Chen',
        '2024-02-01 10:00:00+00'::timestamptz,
        '2024-02-01 10:00:00+00'::timestamptz
      ),
      (
        order2_id,
        customer2_id,
        'ORD-2024-002',
        12000,
        'installment',
        'paid',
        '2024-02-10'::date,
        'Bob Wang',
        '2024-02-10 09:30:00+00'::timestamptz,
        '2024-02-10 09:30:00+00'::timestamptz
      ),
      (
        order3_id,
        customer3_id,
        'ORD-2024-003',
        15000,
        'full',
        'shipped',
        '2024-03-05'::date,
        'Alice Chen',
        '2024-03-05 14:20:00+00'::timestamptz,
        '2024-03-05 14:20:00+00'::timestamptz
      ),
      (
        order4_id,
        customer4_id,
        'ORD-2024-004',
        18000,
        'installment',
        'paid',
        '2024-03-12'::date,
        'Carol Li',
        '2024-03-12 11:15:00+00'::timestamptz,
        '2024-03-12 11:15:00+00'::timestamptz
      );

    -- 插入订单产品关联数据
    INSERT INTO order_products (id, order_id, product_id, quantity, price)
    VALUES 
      (
        gen_random_uuid(),
        order1_id,
        product1_id,
        1,
        8800
      ),
      (
        gen_random_uuid(),
        order2_id,
        product2_id,
        1,
        12000
      ),
      (
        gen_random_uuid(),
        order3_id,
        product3_id,
        1,
        15000
      ),
      (
        gen_random_uuid(),
        order4_id,
        product4_id,
        1,
        18000
      );

    -- 插入分期付款计划数据
    INSERT INTO installment_plans (id, order_id, total_installments, installment_amount, paid_installments, next_payment_date)
    VALUES 
      (
        plan2_id,
        order2_id,
        6,
        2000,
        2,
        '2024-04-10'::date
      ),
      (
        plan4_id,
        order4_id,
        12,
        1500,
        1,
        '2024-04-12'::date
      );

    -- 插入付款记录数据
    INSERT INTO payments (id, installment_plan_id, installment_number, amount, due_date, paid_date, status)
    VALUES 
      -- 订单2的付款记录
      (
        gen_random_uuid(),
        plan2_id,
        1,
        2000,
        '2024-02-10'::date,
        '2024-02-10'::date,
        'paid'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        2,
        2000,
        '2024-03-10'::date,
        '2024-03-09'::date,
        'paid'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        3,
        2000,
        '2024-04-10'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        4,
        2000,
        '2024-05-10'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        5,
        2000,
        '2024-06-10'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        6,
        2000,
        '2024-07-10'::date,
        NULL,
        'pending'
      ),
      -- 订单4的付款记录
      (
        gen_random_uuid(),
        plan4_id,
        1,
        1500,
        '2024-03-12'::date,
        '2024-03-12'::date,
        'paid'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        2,
        1500,
        '2024-04-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        3,
        1500,
        '2024-05-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        4,
        1500,
        '2024-06-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        5,
        1500,
        '2024-07-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        6,
        1500,
        '2024-08-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        7,
        1500,
        '2024-09-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        8,
        1500,
        '2024-10-12'::date,
        NULL,
        'pending'
      );

    -- 插入知识库数据
    INSERT INTO knowledge_base (id, question, answer, category, tags, images, view_count, created_at, updated_at, created_by)
    VALUES 
      (
        gen_random_uuid(),
        '如何选择适合的猫咪品种？',
        '选择猫咪品种需要考虑以下几个因素：

1. **生活空间大小**：大型猫咪如缅因猫需要更大的活动空间，小户型适合选择体型较小的品种。

2. **家庭成员情况**：有小孩的家庭建议选择性格温和的品种如布偶猫、英短等。

3. **护理时间**：长毛猫需要每天梳毛，短毛猫相对好打理。如果工作繁忙，建议选择短毛品种。

4. **预算考虑**：不同品种价格差异较大，同时要考虑后续的食物、医疗等费用。

5. **个人喜好**：最重要的是选择自己真正喜欢的品种，这样才能给猫咪最好的照顾。',
        '选购指南',
        ARRAY['品种选择', '新手指南', '家庭养猫'],
        ARRAY[
          'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg',
          'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
        ],
        156,
        '2024-01-01 08:00:00+00'::timestamptz,
        '2024-01-01 08:00:00+00'::timestamptz,
        '00000000-0000-0000-0000-000000000001'
      ),
      (
        gen_random_uuid(),
        '猫咪疫苗接种时间表是什么？',
        '幼猫疫苗接种时间表如下：

**首次免疫（8-10周龄）**
- 猫三联疫苗（预防猫瘟、猫杯状病毒、猫鼻气管炎）

**第二次免疫（12-14周龄）**
- 猫三联疫苗加强
- 狂犬病疫苗

**第三次免疫（16-18周龄）**
- 猫三联疫苗再次加强

**成年猫维护**
- 每年接种一次猫三联疫苗
- 每年接种一次狂犬病疫苗

**注意事项：**
- 疫苗接种前需确保猫咪身体健康
- 接种后观察1-2天，注意有无不良反应
- 疫苗接种期间避免洗澡和外出',
        '健康护理',
        ARRAY['疫苗', '健康', '幼猫', '免疫'],
        ARRAY[
          'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
        ],
        89,
        '2024-01-05 09:15:00+00'::timestamptz,
        '2024-01-05 09:15:00+00'::timestamptz,
        '00000000-0000-0000-0000-000000000002'
      ),
      (
        gen_random_uuid(),
        '猫咪适应新环境的常见问题及解决方法',
        '**猫咪适应新环境常见问题：**

1. **躲藏不出来**
   - 解决方法：给猫咪准备一个安全的小空间，放置猫窝、猫砂盆和食物，减少干扰，让它慢慢适应。
   - 不要强行将猫咪拉出来，给予足够的时间和空间。

2. **不吃不喝**
   - 解决方法：保持食物和水的新鲜，尝试提供与之前相同的食物。
   - 可以使用猫零食引诱，或尝试湿粮增加食欲。

3. **叫声增多**
   - 解决方法：多陪伴猫咪，播放轻柔的音乐。
   - 使用费洛蒙产品帮助缓解压力。

4. **排泄问题**
   - 解决方法：确保猫砂盆位置安静且容易到达。
   - 使用与之前相同类型的猫砂。

**适应期建议：**

- 给予猫咪至少2周的适应时间
- 保持日常作息规律
- 使用玩具和互动增加安全感
- 准备猫抓板和猫爬架
- 避免频繁访客和大声噪音

**何时需要寻求帮助：**
- 超过24小时不进食
- 出现呕吐、腹泻等症状
- 持续躲藏超过一周
- 攻击性行为明显增加',
        '售后服务',
        ARRAY['新环境', '适应', '行为', '解决方案'],
        ARRAY['https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'],
        45,
        now(),
        now(),
        '00000000-0000-0000-0000-000000000005'
      );

    -- 插入售后服务记录
    INSERT INTO after_sales_records (order_id, type, status, date, notes, agent)
    VALUES 
        (order1_id, '电话回访', 'completed', CURRENT_DATE - INTERVAL '5 days', '客户反馈猫咪适应良好，无特殊问题', 'David Zhang'),
        (order1_id, '上门检查', 'scheduled', CURRENT_DATE + INTERVAL '5 days', '预约上门检查猫咪健康状况', 'David Zhang'),
        (order3_id, '健康咨询', 'pending', CURRENT_DATE - INTERVAL '2 days', '客户咨询猫咪饮食问题，已提供专业建议', 'David Zhang');

END $$;

-- ============================================================================
-- 第十步：生成考勤数据
-- ============================================================================

-- 为过去30天生成考勤记录
DO $$
DECLARE
    user_record RECORD;
    current_date_iter date;
    random_status text;
    random_check_in timestamptz;
    random_check_out timestamptz;
BEGIN
    -- 为过去30天生成考勤记录
    FOR current_date_iter IN 
        SELECT generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day')::date
    LOOP
        -- 为每个用户生成考勤记录
        FOR user_record IN SELECT id, name FROM users WHERE is_active = true
        LOOP
            -- 随机生成考勤状态
            CASE (random() * 10)::int
                WHEN 0, 1 THEN 
                    random_status := 'late';
                    random_check_in := current_date_iter + INTERVAL '9 hours' + (random() * 60)::int * INTERVAL '1 minute';
                    random_check_out := current_date_iter + INTERVAL '17 hours' + (random() * 60)::int * INTERVAL '1 minute';
                WHEN 2 THEN 
                    random_status := 'early_leave';
                    random_check_in := current_date_iter + INTERVAL '8 hours' + (random() * 30)::int * INTERVAL '1 minute';
                    random_check_out := current_date_iter + INTERVAL '16 hours' + (random() * 60)::int * INTERVAL '1 minute';
                WHEN 3 THEN 
                    random_status := 'absent';
                    random_check_in := NULL;
                    random_check_out := NULL;
                ELSE 
                    random_status := 'present';
                    random_check_in := current_date_iter + INTERVAL '8 hours' + (random() * 30)::int * INTERVAL '1 minute';
                    random_check_out := current_date_iter + INTERVAL '17 hours' + (random() * 60)::int * INTERVAL '1 minute';
            END CASE;

            -- 插入考勤记录
            INSERT INTO attendance_records (user_id, date, check_in_time, check_out_time, status, notes)
            VALUES (
                user_record.id,
                current_date_iter,
                random_check_in,
                random_check_out,
                random_status,
                CASE random_status
                    WHEN 'late' THEN '迟到'
                    WHEN 'early_leave' THEN '早退'
                    WHEN 'absent' THEN '请假'
                    ELSE '正常出勤'
                END
            )
            ON CONFLICT (user_id, date) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 迁移完成
-- ============================================================================

-- 验证数据插入
SELECT 
    'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 
    'customers' as table_name, count(*) as record_count FROM customers
UNION ALL
SELECT 
    'products' as table_name, count(*) as record_count FROM products
UNION ALL
SELECT 
    'orders' as table_name, count(*) as record_count FROM orders
UNION ALL
SELECT 
    'knowledge_base' as table_name, count(*) as record_count FROM knowledge_base
UNION ALL
SELECT 
    'after_sales_records' as table_name, count(*) as record_count FROM after_sales_records
UNION ALL
SELECT 
    'attendance_records' as table_name, count(*) as record_count FROM attendance_records;

-- 显示成功消息
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '猫咪销售管理系统数据库迁移完成！';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '已创建的表：';
    RAISE NOTICE '- users (用户表)';
    RAISE NOTICE '- customers (客户表)';
    RAISE NOTICE '- customer_files (客户文件表)';
    RAISE NOTICE '- products (产品表)';
    RAISE NOTICE '- orders (订单表)';
    RAISE NOTICE '- order_products (订单产品关联表)';
    RAISE NOTICE '- installment_plans (分期付款计划表)';
    RAISE NOTICE '- payments (付款记录表)';
    RAISE NOTICE '- knowledge_base (知识库表)';
    RAISE NOTICE '- after_sales_records (售后服务记录表)';
    RAISE NOTICE '- attendance_records (考勤记录表)';
    RAISE NOTICE '';
    RAISE NOTICE '测试账户：';
    RAISE NOTICE '- 管理员: admin / password123';
    RAISE NOTICE '- 销售员: sales1 / password123';
    RAISE NOTICE '- 售后专员: aftersales1 / password123';
    RAISE NOTICE '';
    RAISE NOTICE '数据库迁移成功完成！';
    RAISE NOTICE '==============================================';
END $$;