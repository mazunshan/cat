# 猫咪销售管理系统 (Cat Sales Management System)

一个专业的猫舍销售管理系统，帮助猫舍管理客户、订单、产品和知识库，提供完整的销售流程和售后服务支持。

![猫咪销售管理系统](https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg)

## 🌟 功能特点

### 🔐 多角色权限管理
- **管理员**：完整的系统访问权限，用户管理，系统设置，可编辑和删除所有订单和产品
- **销售员**：客户管理、订单管理（仅限自己创建的订单）、产品查看、知识库访问
- **售后专员**：售后服务管理、客户回访、健康咨询

### 👥 客户管理
- 详细的客户信息记录（联系方式、地址、职业等）
- 客户标签分类管理
- 客户文件上传和管理
- 订单历史跟踪

### 📦 订单管理
- 支持全款和分期付款
- 完整的订单状态跟踪
- 基于角色的订单操作权限（编辑/删除）
- 分期付款进度管理
- 订单产品关联

### 🐱 产品管理
- 猫咪产品信息管理（品种、年龄、性别、价格等）
- 产品图片和视频展示（支持本地文件上传）
- 产品特色标签
- 库存状态管理
- 检疫视频管理
- 管理员专属产品编辑功能

### 📚 知识库
- 分类管理的问答系统
- 支持图片和标签
- 浏览量统计
- 权限控制（用户只能编辑自己创建的内容）

### 🛠️ 售后服务
- 电话回访记录
- 健康咨询管理
- 上门服务安排
- 客户反馈处理

### 📊 数据分析
- 销售趋势图表
- 品种销售分布
- 付款方式分析
- 实时统计数据
- 销售业绩排名

### ⏰ 考勤管理
- 员工签到签退
- 考勤日历视图
- 考勤统计分析
- 自定义工作时间设置
- 迟到早退规则配置

### ⚙️ 系统设置
- 登录验证码管理
- 安全策略配置
- 用户权限管理
- 营业时间设置
- 数据备份和导出

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

在 Supabase SQL 编辑器中运行 `supabase/migrations` 目录下的所有 SQL 文件。

5. **启动开发服务器**
```bash
npm run dev
```

6. **访问应用**

打开浏览器访问 `http://localhost:5173`

### 🔑 测试账户

- **管理员**：admin / password123
- **销售员**：sales1 / password123 (需要验证码)
- **售后专员**：aftersales1 / password123 (需要验证码)

## 📁 项目结构

```
cat-sales-management/
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── components/          # React 组件
│   │   ├── AfterSales/      # 售后服务组件
│   │   ├── Attendance/      # 考勤管理组件
│   │   ├── Auth/            # 认证相关组件
│   │   ├── Common/          # 通用组件
│   │   ├── Customers/       # 客户管理组件
│   │   ├── Dashboard/       # 仪表盘组件
│   │   ├── Knowledge/       # 知识库组件
│   │   ├── Layout/          # 布局组件
│   │   ├── Orders/          # 订单管理组件
│   │   ├── Products/        # 产品管理组件
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

- **users** - 系统用户和权限管理
- **customers** - 客户信息
- **customer_files** - 客户文件
- **products** - 产品信息
- **orders** - 订单信息
- **order_products** - 订单产品关联
- **installment_plans** - 分期付款计划
- **payments** - 付款记录
- **knowledge_base** - 知识库
- **attendance_records** - 考勤记录
- **after_sales_records** - 售后服务记录

## 👥 用户角色和权限

### 🔧 管理员 (Admin)
- 完全的系统访问权限
- 用户管理和权限分配
- 系统设置和配置
- 数据分析和报表
- 产品添加、编辑和删除
- 所有订单的编辑和删除权限
- 知识库完全管理权限
- 考勤时间设置

### 💼 销售员 (Sales)
- 客户管理（增删改查）
- 订单管理（创建、编辑和删除自己的订单）
- 产品查看（不能添加/编辑/删除）
- 知识库访问（只能编辑自己创建的内容）
- 考勤打卡

### 🎧 售后专员 (After Sales)
- 查看已完成或已发货的订单
- 记录电话回访和健康咨询
- 安排上门服务
- 处理客户反馈
- 知识库访问（只能编辑自己创建的内容）
- 考勤打卡

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

## 🚀 部署

### Netlify 部署

1. 连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置发布目录：`dist`
4. 添加环境变量：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`

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