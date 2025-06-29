/*
  # 猫咪销售管理系统完整数据库架构

  1. 新建表
    - `users` - 用户管理表
    - `customers` - 客户信息表
    - `customer_files` - 客户文件表
    - `products` - 产品信息表
    - `orders` - 订单表
    - `order_products` - 订单产品关联表
    - `installment_plans` - 分期付款计划表
    - `payments` - 付款记录表
    - `knowledge_base` - 知识库表
    - `attendance_records` - 考勤记录表

  2. 安全设置
    - 启用所有表的行级安全 (RLS)
    - 创建适当的安全策略
    - 设置用户权限控制

  3. 索引优化
    - 为常用查询字段创建索引
    - 优化查询性能

  4. 初始数据
    - 创建默认管理员账户
    - 插入测试用户数据
    - 添加示例数据
*/

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS installment_plans CASCADE;
DROP TABLE IF EXISTS order_products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customer_files CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sales', 'after_sales')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 客户表
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    phone VARCHAR(20) NOT NULL,
    wechat VARCHAR(50),
    address TEXT,
    occupation VARCHAR(100),
    tags JSONB DEFAULT '[]',
    notes TEXT,
    assigned_sales VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 客户文件表
CREATE TABLE customer_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('image', 'video', 'document')),
    url TEXT NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品表
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(50) NOT NULL,
    age VARCHAR(20) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]',
    videos JSONB DEFAULT '[]',
    is_available BOOLEAN DEFAULT true,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('full', 'installment')),
    status VARCHAR(20) CHECK (status IN ('pending_payment', 'paid', 'pending_shipment', 'shipped', 'completed', 'cancelled')),
    order_date DATE DEFAULT CURRENT_DATE,
    sales_person VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单产品关联表
CREATE TABLE order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2) NOT NULL
);

-- 分期付款计划表
CREATE TABLE installment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    total_installments INTEGER NOT NULL,
    installment_amount DECIMAL(10,2) NOT NULL,
    paid_installments INTEGER DEFAULT 0,
    next_payment_date DATE
);

-- 付款记录表
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installment_plan_id UUID REFERENCES installment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue'))
);

-- 知识库表
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 考勤记录表
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'early_leave')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 启用行级安全 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 创建安全策略

-- 用户表策略
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 客户表策略
CREATE POLICY "Users can read customers" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Sales and admins can manage customers" ON customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'sales') 
            AND is_active = true
        )
    );

-- 产品表策略
CREATE POLICY "Users can read products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 订单表策略
CREATE POLICY "Users can read orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Sales and admins can manage orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'sales') 
            AND is_active = true
        )
    );

-- 知识库策略
CREATE POLICY "Users can read knowledge base" ON knowledge_base
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage own knowledge entries" ON knowledge_base
    FOR ALL USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 考勤记录策略
CREATE POLICY "Users can read own attendance" ON attendance_records
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can manage own attendance" ON attendance_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance" ON attendance_records
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 创建性能优化索引
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_assigned_sales ON customers(assigned_sales);
CREATE INDEX idx_customers_created_at ON customers(created_at);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_sales_person ON orders(sales_person);

CREATE INDEX idx_products_breed ON products(breed);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_price ON products(price);

CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_created_by ON knowledge_base(created_by);

CREATE INDEX idx_attendance_records_user_date ON attendance_records(user_id, date);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);

-- 插入初始用户数据
INSERT INTO users (username, email, name, role, password_hash, is_active) VALUES
('admin', 'admin@catstore.com', 'Administrator', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
('sales1', 'sales1@catstore.com', 'Alice Chen', 'sales', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
('sales2', 'sales2@catstore.com', 'Bob Wang', 'sales', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
('aftersales1', 'aftersales1@catstore.com', 'David Zhang', 'after_sales', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true);

-- 插入示例客户数据
INSERT INTO customers (name, gender, phone, wechat, address, occupation, tags, notes, assigned_sales) VALUES
('张小美', 'female', '13800138001', 'zhang_xiaomei', '北京市朝阳区三里屯路123号', 'UI设计师', '["高意向", "英短爱好者", "预算充足"]', '很喜欢银渐层，已看过多只猫咪，计划本月内购买', 'Alice Chen'),
('李先生', 'male', '13900139002', 'li_mister', '上海市浦东新区世纪大道456号', '软件工程师', '["分期付款", "布偶猫", "首次购买"]', '选择分期付款，工作稳定，收入可观，对布偶猫很感兴趣', 'Alice Chen'),
('王女士', 'female', '13700137003', 'wang_lady', '广州市天河区珠江新城789号', '市场经理', '["高端客户", "波斯猫", "多只购买"]', '有养猫经验，希望购买2-3只高品质波斯猫', 'Bob Wang');

-- 插入示例产品数据
INSERT INTO products (name, breed, age, gender, price, description, images, videos, is_available, features) VALUES
('银渐层英短', '英国短毛猫', '3个月', 'female', 8800.00, '纯种银渐层英短，毛色均匀，性格温顺，已完成疫苗接种。', 
 '["https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg", "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg"]', 
 '[]', true, '["纯种血统", "疫苗齐全", "健康保证", "可上门看猫"]'),
('蓝双色布偶猫', '布偶猫', '4个月', 'male', 12000.00, '蓝双色布偶猫，眼睛湛蓝，毛质柔顺，性格粘人。', 
 '["https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg", "https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg"]', 
 '[]', true, '["CFA认证", "父母均有证书", "毛色标准", "性格亲人"]'),
('金吉拉波斯猫', '波斯猫', '5个月', 'female', 15000.00, '金吉拉波斯猫，毛质如丝，五官精致，贵族气质。', 
 '["https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg"]', 
 '[]', true, '["顶级血统", "毛质极佳", "五官标准", "性格温和"]');

-- 插入示例知识库数据
INSERT INTO knowledge_base (question, answer, category, tags, images, view_count, created_by) VALUES
('如何选择适合的猫咪品种？', 
'选择猫咪品种需要考虑以下几个因素：

1. **生活空间大小**：大型猫咪如缅因猫需要更大的活动空间，小户型适合选择体型较小的品种。

2. **家庭成员情况**：有小孩的家庭建议选择性格温和的品种如布偶猫、英短等。

3. **护理时间**：长毛猫需要每天梳理，短毛猫相对容易打理。

4. **预算考虑**：不同品种价格差异较大，需要根据预算选择。

5. **性格偏好**：有些品种活泼好动，有些则安静温顺。', 
'选购指南', '["品种选择", "新手指南", "家庭养猫"]', 
'["https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg"]', 
156, (SELECT id FROM users WHERE username = 'admin')),

('猫咪疫苗接种时间表是什么？', 
'幼猫疫苗接种时间表如下：

**首次免疫（8-10周龄）**
- 猫三联疫苗（预防猫瘟、猫杯状病毒、猫鼻气管炎）

**第二次免疫（12-14周龄）**
- 猫三联疫苗加强
- 狂犬病疫苗

**第三次免疫（16-18周龄）**
- 猫三联疫苗再次加强

**成年后**
- 每年接种一次猫三联疫苗
- 每年接种一次狂犬病疫苗

**注意事项：**
- 疫苗接种前需确保猫咪健康
- 接种后观察是否有不良反应
- 按时接种，不要延误', 
'健康护理', '["疫苗", "健康", "幼猫", "免疫"]', 
'[]', 89, (SELECT id FROM users WHERE username = 'admin'));

-- 创建触发器函数用于更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建触发器
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

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();