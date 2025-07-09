# 猫咪销售管理系统 (Cat Sales Management System)

一个专业的猫舍销售管理系统，帮助猫舍管理客户、知识库和团队，提供完整的销售流程和售后服务支持。

![猫咪销售管理系统](https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg)

## 🌟 功能特点

### 🔐 多角色权限管理
- **管理员**：完整的系统访问权限，用户管理，系统设置，收支明细管理
- **销售员**：客户管理、知识库访问、公告查看
- **售后专员**：售后服务管理、客户回访、健康咨询、公告查看

### 👥 客户管理
- 详细的客户信息记录（联系方式、地址、职业等）
- 支持零售客户和分期客户两种类型
- 客户标签分类管理
- 客户文件上传和管理（图片、视频、聊天记录）
- 分期客户还款状态跟踪和逾期提醒

### 📚 知识库
- 分类管理的问答系统
- 支持图片和标签
- 浏览量统计
- 权限控制（用户只能编辑自己创建的内容，管理员可编辑所有内容）

### 🛠️ 售后服务
- 电话回访记录
- 健康咨询管理
- 上门服务安排
- 投诉处理
- 客户反馈管理
- 服务模板和检查清单

### 📊 数据分析
- 销售趋势图表
- 品种销售分布
- 付款方式分析
- 实时统计数据
- 逾期付款提醒（管理员专用）

### 📢 公告管理
- 系统公告发布
- 按角色可见性设置（所有人、仅销售员、仅售后专员）
- 公告优先级管理（普通、重要、紧急）
- 公告横幅展示

### 💰 收支明细
- 月度收支记录管理
- 销售收入和其他收入统计
- 支出项目和报销管理
- 数据导出功能
- 净收入计算

### ⚙️ 系统设置
- 登录验证码管理
- 安全策略配置
- 用户权限管理
- 团队管理

## 🚀 技术栈

- **前端框架**：React 18 + TypeScript
- **样式框架**：Tailwind CSS
- **状态管理**：React Context API
- **图标库**：Lucide React
- **图表库**：Recharts
- **后端服务**：Supabase (PostgreSQL + 认证服务)
- **构建工具**：Vite
- **部署平台**：Netlify

## 📋 快速开始

### 前提条件

- Node.js 18+ 和 npm
- Supabase 账户（用于数据库和认证）

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/yourusername/cat-sales-management.git
cd cat-sales-management
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件并添加以下内容：
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **运行数据库迁移**

在 Supabase SQL 编辑器中运行 `supabase/migrations` 目录下的所有 SQL 文件：
- `20250629073837_old_spire.sql` - 基础数据库架构
- `20250707055942_golden_boat.sql` - 公告系统
- `20250708080444_silent_math.sql` - 团队管理和销售业绩

5. **启动开发服务器**
```bash
npm run dev
```

6. **访问应用**

打开浏览器访问 `http://localhost:5173`

### 🔑 测试账户

系统默认创建以下测试账户（密码均为 `password123`）：

- **管理员**：admin / password123
- **销售员**：sales1 / password123 (需要验证码)
- **销售员**：sales2 / password123 (需要验证码)
- **售后专员**：aftersales1 / password123 (需要验证码)

> 注意：非管理员用户登录需要验证码，可由管理员在系统设置中生成。

## 📁 项目结构

```
cat-sales-management/
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── components/          # React 组件
│   │   ├── AfterSales/      # 售后服务组件
│   │   ├── Announcements/   # 公告管理组件
│   │   ├── Auth/            # 认证相关组件
│   │   ├── Common/          # 通用组件
│   │   ├── Customers/       # 客户管理组件
│   │   ├── Dashboard/       # 仪表盘组件
│   │   ├── Financial/       # 收支明细组件
│   │   ├── Knowledge/       # 知识库组件
│   │   ├── Layout/          # 布局组件
│   │   ├── SalesPerformance/# 销售业绩组件
│   │   └── Settings/        # 系统设置组件
│   ├── context/             # React Context
│   ├── hooks/               # 自定义 Hooks
│   ├── lib/                 # 工具库
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── App.tsx              # 应用入口组件
│   └── main.tsx             # 应用入口文件
├── supabase/                # Supabase 配置和迁移
│   └── migrations/          # 数据库迁移文件
├── .env                     # 环境变量
├── index.html               # HTML 模板
├── package.json             # 项目依赖
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
└── vite.config.ts           # Vite 配置
```

## 🗄️ 数据库架构

系统使用 PostgreSQL 数据库（通过 Supabase 提供），包含以下主要表：

### 核心表
- **users** - 系统用户和权限管理
- **teams** - 销售团队管理
- **customers** - 客户信息
- **customer_files** - 客户文件
- **products** - 产品信息
- **orders** - 订单管理
- **order_products** - 订单产品关联

### 功能表
- **knowledge_base** - 知识库
- **announcements** - 系统公告
- **attendance_records** - 考勤记录
- **sales_performance** - 销售业绩
- **installment_plans** - 分期付款计划
- **payments** - 付款记录

## 👥 用户角色和权限

### 🔧 管理员 (Admin)
- 完全的系统访问权限
- 用户管理和权限分配
- 团队创建和管理
- 系统设置和配置
- 数据分析和报表
- 知识库完全管理权限
- 公告发布和管理
- 收支明细管理
- 逾期付款提醒查看

### 💼 销售员 (Sales)
- 客户管理（增删改查）
- 知识库访问（只能编辑自己创建的内容）
- 公告查看（根据可见性设置）
- 销售业绩查看

### 🎧 售后专员 (After Sales)
- 售后服务记录管理
- 电话回访和健康咨询
- 上门服务安排
- 客户反馈处理
- 知识库访问（只能编辑自己创建的内容）
- 公告查看（根据可见性设置）

## 🔒 安全特性

### 登录验证码系统
- 管理员可生成24小时有效的登录验证码
- 非管理员用户登录需要验证码（可配置）
- 验证码自动过期机制

### 权限控制
- 基于角色的访问控制 (RBAC)
- 前端和后端双重权限验证
- 操作级别的权限检查

### 数据安全
- 行级安全策略 (RLS)
- 用户数据隔离
- 安全的密码存储

## 📊 主要功能模块

### 仪表盘
- 客户数量统计
- 营收数据展示
- 销售趋势图表
- 品种销售分布
- 付款方式分析
- 逾期付款提醒（管理员专用）

### 客户管理
- 客户信息录入和编辑
- 零售客户和分期客户分类管理
- 客户文件上传（图片、视频、文档）
- 分期还款状态跟踪
- 客户标签和备注管理

### 知识库
- 问答内容管理
- 分类和标签系统
- 图片支持
- 浏览量统计
- 权限控制编辑

### 售后服务
- 服务记录创建和管理
- 多种服务类型支持
- 优先级和状态管理
- 客户满意度评分
- 后续跟进提醒

### 公告管理
- 公告发布和编辑
- 角色可见性控制
- 优先级设置
- 横幅展示

### 收支明细
- 月度收支记录
- 销售收入统计
- 支出项目管理
- 报销状态跟踪
- 数据导出功能

## 🚀 部署

### Netlify 部署

1. 连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置发布目录：`dist`
4. 添加环境变量：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`

### 环境变量配置

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

### 数据库迁移

1. 在 Supabase 项目中创建新的 SQL 查询
2. 按顺序执行 `supabase/migrations` 目录下的迁移文件
3. 确保所有表的 RLS 策略正确配置

### 添加新功能

1. 在 `src/types/index.ts` 中定义相关类型
2. 在 `src/hooks/useDatabase.ts` 中添加数据操作方法
3. 创建相应的 React 组件
4. 更新路由和权限控制

## 🤝 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有任何问题或建议，请联系：
- 邮箱：admin@catstore.com
- GitHub Issues：[提交问题](https://github.com/yourusername/cat-sales-management/issues)

---

⭐ 如果这个项目对您有帮助，请给它一个星标！