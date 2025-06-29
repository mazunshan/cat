/*
  # 猫咪销售管理系统初始数据库架构

  1. 新建表
    - `users` - 系统用户表
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `role` (text)
      - `name` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `customers` - 客户信息表
      - `id` (uuid, primary key)
      - `name` (text)
      - `gender` (text)
      - `phone` (text)
      - `wechat` (text)
      - `address` (text)
      - `occupation` (text)
      - `tags` (text[])
      - `notes` (text)
      - `assigned_sales` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `customer_files` - 客户文件表
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `name` (text)
      - `type` (text)
      - `url` (text)
      - `description` (text)
      - `uploaded_at` (timestamp)

    - `products` - 产品表
      - `id` (uuid, primary key)
      - `name` (text)
      - `breed` (text)
      - `age` (text)
      - `gender` (text)
      - `price` (integer)
      - `description` (text)
      - `images` (text[])
      - `videos` (text[])
      - `is_available` (boolean)
      - `features` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `orders` - 订单表
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `order_number` (text, unique)
      - `amount` (integer)
      - `payment_method` (text)
      - `status` (text)
      - `order_date` (date)
      - `sales_person` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `order_products` - 订单产品关联表
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (integer)

    - `installment_plans` - 分期付款计划表
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `total_installments` (integer)
      - `installment_amount` (integer)
      - `paid_installments` (integer)
      - `next_payment_date` (date)

    - `payments` - 付款记录表
      - `id` (uuid, primary key)
      - `installment_plan_id` (uuid, foreign key)
      - `installment_number` (integer)
      - `amount` (integer)
      - `due_date` (date)
      - `paid_date` (date)
      - `status` (text)

    - `knowledge_base` - 知识库表
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `category` (text)
      - `tags` (text[])
      - `images` (text[])
      - `view_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. 安全设置
    - 为所有表启用 RLS (Row Level Security)
    - 添加适当的访问策略

  3. 索引
    - 为常用查询字段添加索引
*/

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
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 用户表策略
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- 客户表策略
CREATE POLICY "Users can read all customers" ON customers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert customers" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update customers" ON customers
  FOR UPDATE TO authenticated
  USING (true);

-- 客户文件策略
CREATE POLICY "Users can read customer files" ON customer_files
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert customer files" ON customer_files
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 产品表策略
CREATE POLICY "Users can read all products" ON products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products" ON products
  FOR UPDATE TO authenticated
  USING (true);

-- 订单表策略
CREATE POLICY "Users can read all orders" ON orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (true);

-- 订单产品关联表策略
CREATE POLICY "Users can read order products" ON order_products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert order products" ON order_products
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 分期付款计划策略
CREATE POLICY "Users can read installment plans" ON installment_plans
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert installment plans" ON installment_plans
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update installment plans" ON installment_plans
  FOR UPDATE TO authenticated
  USING (true);

-- 付款记录策略
CREATE POLICY "Users can read payments" ON payments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert payments" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update payments" ON payments
  FOR UPDATE TO authenticated
  USING (true);

-- 知识库策略
CREATE POLICY "Users can read knowledge base" ON knowledge_base
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert knowledge base" ON knowledge_base
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update knowledge base" ON knowledge_base
  FOR UPDATE TO authenticated
  USING (true);

-- 创建索引
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

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

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