# 猫咪销售管理系统 - 数据结构说明文档

本文档详细说明了猫咪销售管理系统中使用的所有数据字段、数据关系和业务逻辑，为后端开发提供完整的数据架构参考。

## 📋 目录

- [数据库概览](#数据库概览)
- [核心数据表](#核心数据表)
- [业务数据表](#业务数据表)
- [数据关系图](#数据关系图)
- [业务逻辑说明](#业务逻辑说明)
- [API 接口设计建议](#api-接口设计建议)
- [数据验证规则](#数据验证规则)

## 数据库概览

系统使用 PostgreSQL 数据库，通过 Supabase 提供服务。所有表都启用了行级安全策略 (RLS)，确保数据安全。

### 数据库连接信息
```typescript
interface DatabaseConfig {
  host: string;          // Supabase 项目 URL
  database: string;      // 数据库名称
  username: string;      // 数据库用户名
  password: string;      // 数据库密码
  port: number;          // 端口号 (通常是 5432)
  ssl: boolean;          // 启用 SSL
}
```

## 核心数据表

### 1. users - 用户表

用户认证和权限管理的核心表。

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sales', 'after_sales')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**字段说明：**
- `id`: 用户唯一标识符 (UUID)
- `username`: 登录用户名，唯一
- `email`: 用户邮箱，唯一
- `name`: 用户真实姓名
- `role`: 用户角色，枚举值：'admin'(管理员), 'sales'(销售员), 'after_sales'(售后专员)
- `password_hash`: 密码哈希值 (使用 bcrypt)
- `is_active`: 用户状态，true=激活，false=禁用
- `team_id`: 所属团队ID，外键关联 teams 表
- `created_at`: 创建时间
- `updated_at`: 更新时间

**TypeScript 接口：**
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'sales' | 'after_sales';
  name: string;
  isActive: boolean;
  createdAt: string;
  teamId?: string;
}
```

### 2. teams - 团队表

销售团队管理表。

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**字段说明：**
- `id`: 团队唯一标识符
- `name`: 团队名称
- `description`: 团队描述
- `created_at`: 创建时间
- `updated_at`: 更新时间

**TypeScript 接口：**
```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3. customers - 客户表

客户信息管理的核心表，支持零售和分期两种客户类型。

```sql
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
```

**字段说明：**
- `id`: 客户唯一标识符
- `name`: 客户姓名
- `gender`: 性别，'male' 或 'female'
- `phone`: 电话号码
- `wechat`: 微信号
- `address`: 地址
- `occupation`: 职业
- `tags`: 客户标签，JSON 数组格式
- `notes`: 备注信息
- `assigned_sales`: 分配的销售员姓名
- `created_at`: 创建时间
- `updated_at`: 更新时间

**扩展字段（前端处理）：**
```typescript
interface Customer {
  // 基础字段
  id: string;
  name: string;
  gender: 'male' | 'female';
  phone: string;
  wechat: string;
  address: string;
  occupation: string;
  tags: string[];
  notes: string;
  createdAt: string;
  assignedSales?: string;
  
  // 客户类型
  customerType?: 'retail' | 'installment';
  
  // 零售客户特有字段
  orderDate?: string;
  salesPerson?: string;
  catName?: string;
  catBirthday?: string;
  isMallMember?: boolean;
  catBreed?: string;
  catGender?: 'male' | 'female';
  supplyChain?: string;
  supplyChainDeposit?: number;
  totalAmount?: number;
  paymentMethod?: 'full_payment' | 'shipping_balance' | 'cash_on_delivery';
  customerDeposit?: number;
  depositDestination?: string;
  shippingDate?: string;
  shippingVideoUrl?: string;
  balance?: number;
  balancePaid?: boolean;
  balanceConfirmMethod?: string;
  sellingPrice?: number;
  cost?: number;
  shippingFee?: number;
  profit?: number;
  profitRate?: number;
  
  // 分期客户特有字段
  contractName?: string;
  relationship?: string;
  isInGroup?: boolean;
  repaymentDate?: string;
  installmentPeriod?: string;
  catCost?: number;
  collectionAmount?: number;
  fundsDestination?: string;
  installmentAmount?: number;
  installmentCount?: number;
  signingMethod?: string;
  isFirstPaymentManual?: boolean;
  hasESignContract?: boolean;
  contractTotalPrice?: number;
  mallGrossProfit?: number;
  grossProfit?: number;
  monthlyProfit?: number;
  breakEvenPeriod?: number;
  
  // 关联数据
  installmentPayments?: InstallmentPayment[];
  files: CustomerFile[];
  orders: Order[];
}
```

### 4. customer_files - 客户文件表

存储客户相关的文件信息。

```sql
CREATE TABLE customer_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('image', 'video', 'document')),
    url TEXT NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**字段说明：**
- `id`: 文件唯一标识符
- `customer_id`: 关联的客户ID
- `name`: 文件名称
- `type`: 文件类型，'image'(图片), 'video'(视频), 'document'(文档)
- `url`: 文件存储URL
- `description`: 文件描述
- `uploaded_at`: 上传时间

**TypeScript 接口：**
```typescript
interface CustomerFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  description?: string;
  uploadedAt: string;
}
```

### 5. products - 产品表

猫咪产品信息管理。

```sql
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
```

**字段说明：**
- `id`: 产品唯一标识符
- `name`: 产品名称
- `breed`: 猫咪品种
- `age`: 年龄
- `gender`: 性别
- `price`: 价格
- `description`: 产品描述
- `images`: 图片URL数组，JSON格式
- `videos`: 视频URL数组，JSON格式
- `is_available`: 是否可售
- `features`: 特色功能数组，JSON格式
- `created_at`: 创建时间
- `updated_at`: 更新时间

**TypeScript 接口：**
```typescript
interface Product {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: 'male' | 'female';
  price: number;
  description: string;
  images: string[];
  videos: string[];
  quarantineVideos: QuarantineVideo[];
  isAvailable: boolean;
  features: string[];
}

interface QuarantineVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  recordedDate: string;
  duration?: number;
  fileSize?: number;
  veterinarian?: string;
  quarantineStatus: 'healthy' | 'under_observation' | 'treated' | 'cleared';
  uploadedAt: string;
}
```

## 业务数据表

### 6. orders - 订单表

订单管理核心表。

```sql
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
```

**字段说明：**
- `id`: 订单唯一标识符
- `customer_id`: 关联客户ID
- `order_number`: 订单编号，唯一
- `amount`: 订单金额
- `payment_method`: 付款方式，'full'(全款), 'installment'(分期)
- `status`: 订单状态
- `order_date`: 订单日期
- `sales_person`: 销售员
- `created_at`: 创建时间
- `updated_at`: 更新时间

**订单状态说明：**
- `pending_payment`: 待付款
- `paid`: 已付款
- `pending_shipment`: 待发货
- `shipped`: 已发货
- `completed`: 已完成
- `cancelled`: 已取消

### 7. order_products - 订单产品关联表

订单和产品的多对多关联表。

```sql
CREATE TABLE order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2) NOT NULL
);
```

### 8. installment_plans - 分期付款计划表

分期付款计划管理。

```sql
CREATE TABLE installment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    total_installments INTEGER NOT NULL,
    installment_amount DECIMAL(10,2) NOT NULL,
    paid_installments INTEGER DEFAULT 0,
    next_payment_date DATE
);
```

### 9. payments - 付款记录表

具体的付款记录。

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installment_plan_id UUID REFERENCES installment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue'))
);
```

**TypeScript 接口：**
```typescript
interface InstallmentPayment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  isPaid: boolean;
  isOverdue: boolean;
  overdueCount?: number;
}
```

### 10. knowledge_base - 知识库表

知识库问答管理。

```sql
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
```

**字段说明：**
- `id`: 知识库条目唯一标识符
- `question`: 问题标题
- `answer`: 答案内容
- `category`: 分类
- `tags`: 标签数组，JSON格式
- `images`: 相关图片URL数组
- `view_count`: 浏览次数
- `created_by`: 创建者用户ID
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 11. announcements - 公告表

系统公告管理。

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visible_to TEXT NOT NULL CHECK (visible_to IN ('sales', 'after_sales', 'all')),
  priority TEXT NOT NULL CHECK (priority IN ('normal', 'important', 'urgent')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**字段说明：**
- `visible_to`: 可见对象，'sales'(仅销售员), 'after_sales'(仅售后专员), 'all'(所有人)
- `priority`: 优先级，'normal'(普通), 'important'(重要), 'urgent'(紧急)

### 12. sales_performance - 销售业绩表

销售业绩统计。

```sql
CREATE TABLE sales_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  traffic INTEGER NOT NULL DEFAULT 0,
  orders INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, user_id)
);
```

**字段说明：**
- `date`: 统计日期
- `user_id`: 用户ID
- `team_id`: 团队ID
- `traffic`: 客流量
- `orders`: 订单数
- `revenue`: 营收金额

### 13. attendance_records - 考勤记录表

员工考勤管理。

```sql
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
```

**考勤状态说明：**
- `present`: 正常出勤
- `absent`: 缺勤
- `late`: 迟到
- `early_leave`: 早退

## 数据关系图

```
users (1) ←→ (N) teams
  ↓ (1:N)
customers
  ↓ (1:N)
customer_files

customers (1) ←→ (N) orders
  ↓ (1:N)
order_products (N) ←→ (1) products

orders (1) ←→ (1) installment_plans
  ↓ (1:N)
payments

users (1) ←→ (N) knowledge_base
users (1) ←→ (N) announcements
users (1) ←→ (N) attendance_records
users (1) ←→ (N) sales_performance
```

## 业务逻辑说明

### 1. 用户权限控制

**角色权限矩阵：**

| 功能模块 | 管理员 | 销售员 | 售后专员 |
|---------|--------|--------|----------|
| 用户管理 | ✅ | ❌ | ❌ |
| 客户管理 | ✅ | ✅ | ✅ (只读) |
| 订单管理 | ✅ | ✅ | ❌ |
| 产品管理 | ✅ | ❌ | ❌ |
| 知识库 | ✅ (全部) | ✅ (自己的) | ✅ (自己的) |
| 公告管理 | ✅ | ❌ | ❌ |
| 售后服务 | ✅ | ❌ | ✅ |
| 收支明细 | ✅ | ❌ | ❌ |
| 系统设置 | ✅ | ❌ | ❌ |

### 2. 客户类型业务逻辑

**零售客户：**
- 一次性付款或发货补尾款
- 重点关注猫咪信息和交付流程
- 财务计算：利润 = 卖价 - 成本 - 运费

**分期客户：**
- 分期付款管理
- 逾期提醒机制
- 合同管理
- 财务计算：月毛利、回本期等

### 3. 逾期提醒逻辑

```typescript
// 逾期状态计算
interface PaymentStatus {
  status: 'normal' | 'reminder' | 'overdue';
  message: string;
  overdueCount?: number;
  nextDueDate?: string;
}

// 逾期判断逻辑：
// 1. 超过还款日期且未付款 = 逾期
// 2. 3天内到期且未付款 = 待催款
// 3. 其他情况 = 正常
```

### 4. 知识库权限逻辑

- 所有用户可以查看知识库
- 用户只能编辑自己创建的条目
- 管理员可以编辑所有条目
- 通过 `created_by` 字段控制权限

### 5. 公告可见性逻辑

```sql
-- 公告可见性查询示例
SELECT * FROM announcements 
WHERE visible_to = 'all' 
   OR (visible_to = 'sales' AND user_role = 'sales')
   OR (visible_to = 'after_sales' AND user_role = 'after_sales')
   OR user_role = 'admin';
```

## API 接口设计建议

### 1. 认证接口

```typescript
// POST /api/auth/login
interface LoginRequest {
  username: string;
  password: string;
  verificationCode?: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
  requireVerificationCode?: boolean;
}
```

### 2. 客户管理接口

```typescript
// GET /api/customers
interface GetCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: 'retail' | 'installment';
  tags?: string[];
}

// POST /api/customers
interface CreateCustomerRequest {
  // Customer 接口的所有字段（除了 id, createdAt, files, orders）
}

// PUT /api/customers/:id
interface UpdateCustomerRequest {
  // 部分 Customer 字段
}
```

### 3. 分期付款接口

```typescript
// GET /api/customers/:id/installments
interface InstallmentResponse {
  customerId: string;
  payments: InstallmentPayment[];
  summary: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    overdueCount: number;
  };
}

// POST /api/installments/:id/pay
interface PayInstallmentRequest {
  paymentId: string;
  amount: number;
  paidDate: string;
}
```

### 4. 知识库接口

```typescript
// GET /api/knowledge
interface GetKnowledgeQuery {
  category?: string;
  search?: string;
  createdBy?: string; // 筛选自己创建的
}

// POST /api/knowledge
interface CreateKnowledgeRequest {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  images?: string[];
}
```

### 5. 公告接口

```typescript
// GET /api/announcements
interface GetAnnouncementsQuery {
  visibleTo?: 'sales' | 'after_sales' | 'all';
  priority?: 'normal' | 'important' | 'urgent';
}

// POST /api/announcements (仅管理员)
interface CreateAnnouncementRequest {
  title: string;
  content: string;
  visibleTo: 'sales' | 'after_sales' | 'all';
  priority: 'normal' | 'important' | 'urgent';
}
```

## 数据验证规则

### 1. 用户数据验证

```typescript
const userValidation = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  email: {
    required: true,
    format: 'email'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  role: {
    required: true,
    enum: ['admin', 'sales', 'after_sales']
  }
};
```

### 2. 客户数据验证

```typescript
const customerValidation = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  phone: {
    required: true,
    pattern: /^1[3-9]\d{9}$/ // 中国手机号格式
  },
  gender: {
    enum: ['male', 'female']
  },
  customerType: {
    enum: ['retail', 'installment']
  }
};
```

### 3. 订单数据验证

```typescript
const orderValidation = {
  amount: {
    required: true,
    min: 0,
    type: 'decimal'
  },
  paymentMethod: {
    required: true,
    enum: ['full', 'installment']
  },
  status: {
    required: true,
    enum: ['pending_payment', 'paid', 'pending_shipment', 'shipped', 'completed', 'cancelled']
  }
};
```

### 4. 分期付款验证

```typescript
const installmentValidation = {
  installmentAmount: {
    required: true,
    min: 0,
    type: 'decimal'
  },
  installmentCount: {
    required: true,
    min: 1,
    max: 36,
    type: 'integer'
  },
  dueDate: {
    required: true,
    format: 'date',
    futureDate: true
  }
};
```

## 性能优化建议

### 1. 数据库索引

```sql
-- 客户表索引
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_assigned_sales ON customers(assigned_sales);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- 订单表索引
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);

-- 分期付款索引
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_status ON payments(status);

-- 知识库索引
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_created_by ON knowledge_base(created_by);
```

### 2. 查询优化

```sql
-- 逾期付款查询优化
SELECT p.*, c.name as customer_name, c.phone
FROM payments p
JOIN installment_plans ip ON p.installment_plan_id = ip.id
JOIN orders o ON ip.order_id = o.id
JOIN customers c ON o.customer_id = c.id
WHERE p.status = 'pending' 
  AND p.due_date < CURRENT_DATE
ORDER BY p.due_date ASC;

-- 销售业绩统计查询
SELECT 
  u.name,
  t.name as team_name,
  SUM(sp.revenue) as total_revenue,
  SUM(sp.orders) as total_orders
FROM sales_performance sp
JOIN users u ON sp.user_id = u.id
LEFT JOIN teams t ON sp.team_id = t.id
WHERE sp.date >= '2024-01-01'
GROUP BY u.id, u.name, t.name
ORDER BY total_revenue DESC;
```

### 3. 缓存策略

```typescript
// Redis 缓存键设计
const cacheKeys = {
  user: (id: string) => `user:${id}`,
  customer: (id: string) => `customer:${id}`,
  customerList: (page: number, filters: string) => `customers:${page}:${filters}`,
  knowledgeBase: (category: string) => `knowledge:${category}`,
  announcements: (role: string) => `announcements:${role}`,
  overduePayments: () => `overdue_payments`,
  salesStats: (date: string) => `sales_stats:${date}`
};

// 缓存过期时间
const cacheTTL = {
  user: 3600,        // 1小时
  customer: 1800,    // 30分钟
  customerList: 300, // 5分钟
  knowledgeBase: 7200, // 2小时
  announcements: 600,  // 10分钟
  overduePayments: 300, // 5分钟
  salesStats: 86400    // 24小时
};
```

## 数据迁移和备份

### 1. 数据迁移脚本

```sql
-- 迁移脚本示例：添加新字段
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) DEFAULT 'retail';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS installment_data JSONB DEFAULT '{}';

-- 数据迁移
UPDATE customers 
SET customer_type = 'installment' 
WHERE id IN (
  SELECT DISTINCT c.id 
  FROM customers c 
  JOIN orders o ON c.id = o.customer_id 
  WHERE o.payment_method = 'installment'
);
```

### 2. 备份策略

```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/daily/

# 保留最近30天的备份
find /backup -name "backup_*.sql" -mtime +30 -delete
```

## 安全考虑

### 1. 数据脱敏

```typescript
// 敏感数据脱敏
const maskSensitiveData = {
  phone: (phone: string) => phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
  email: (email: string) => email.replace(/(.{2}).*(@.*)/, '$1***$2'),
  idCard: (id: string) => id.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
};
```

### 2. SQL 注入防护

```typescript
// 使用参数化查询
const getUserByUsername = async (username: string) => {
  const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
  return await db.query(query, [username]);
};
```

### 3. 权限验证中间件

```typescript
const checkPermission = (requiredRole: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !requiredRole.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

本文档为猫咪销售管理系统的完整数据结构说明，建议后端开发人员在实现时严格按照此规范进行开发，确保数据一致性和系统稳定性。