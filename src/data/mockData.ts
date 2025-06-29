import { Customer, Order, Product, KnowledgeBase, DashboardStats } from '../types';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '张小美',
    gender: 'female',
    phone: '13800138001',
    wechat: 'zhang_xiaomei',
    address: '北京市朝阳区三里屯路123号',
    occupation: 'UI设计师',
    tags: ['高意向', '英短爱好者', '预算充足'],
    notes: '很喜欢银渐层，已看过多只猫咪，计划本月内购买',
    createdAt: '2024-01-15',
    assignedSales: 'Alice Chen',
    files: [
      {
        id: '1',
        name: '家庭环境照片',
        type: 'image',
        url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        description: '客户家中养猫环境，空间宽敞，适合养猫',
        uploadedAt: '2024-01-16'
      },
      {
        id: '2',
        name: '客户与猫咪合影',
        type: 'image',
        url: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg',
        description: '客户很喜欢猫咪，有养猫经验',
        uploadedAt: '2024-01-18'
      }
    ],
    orders: []
  },
  {
    id: '2',
    name: '李先生',
    gender: 'male',
    phone: '13900139002',
    wechat: 'li_mister',
    address: '上海市浦东新区世纪大道456号',
    occupation: '软件工程师',
    tags: ['分期付款', '布偶猫', '首次购买'],
    notes: '选择分期付款，工作稳定，收入可观，对布偶猫很感兴趣',
    createdAt: '2024-02-01',
    assignedSales: 'Bob Wang',
    files: [
      {
        id: '3',
        name: '收入证明',
        type: 'document',
        url: 'https://example.com/income-proof.pdf',
        description: '月收入15000元，适合分期付款',
        uploadedAt: '2024-02-02'
      }
    ],
    orders: []
  },
  {
    id: '3',
    name: '王女士',
    gender: 'female',
    phone: '13700137003',
    wechat: 'wang_lady',
    address: '广州市天河区珠江新城789号',
    occupation: '市场经理',
    tags: ['老客户', '推荐朋友', '全款'],
    notes: '第二次购买，上次购买布偶猫很满意，这次为朋友推荐',
    createdAt: '2024-02-15',
    assignedSales: 'Alice Chen',
    files: [],
    orders: []
  },
  {
    id: '4',
    name: '陈先生',
    gender: 'male',
    phone: '13600136004',
    wechat: 'chen_sir',
    address: '深圳市南山区科技园路321号',
    occupation: '产品经理',
    tags: ['波斯猫', '高端客户', '全款'],
    notes: '对波斯猫情有独钟，预算充足，要求品相优秀',
    createdAt: '2024-03-01',
    assignedSales: 'Carol Li',
    files: [
      {
        id: '4',
        name: '客户需求说明',
        type: 'document',
        url: 'https://example.com/requirements.pdf',
        description: '详细的猫咪品相要求和预算说明',
        uploadedAt: '2024-03-02'
      }
    ],
    orders: []
  },
  {
    id: '5',
    name: '刘小姐',
    gender: 'female',
    phone: '13500135005',
    wechat: 'liu_miss',
    address: '杭州市西湖区文三路654号',
    occupation: '教师',
    tags: ['暹罗猫', '预算有限', '分期'],
    notes: '喜欢暹罗猫，预算有限，希望分期付款',
    createdAt: '2024-03-10',
    assignedSales: 'Bob Wang',
    files: [],
    orders: []
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    orderNumber: 'ORD-2024-001',
    amount: 8800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-02-01',
    salesPerson: 'Alice Chen',
    products: [
      {
        id: '1',
        name: '银渐层英短',
        breed: '英国短毛猫',
        price: 8800,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
      }
    ]
  },
  {
    id: '2',
    customerId: '2',
    orderNumber: 'ORD-2024-002',
    amount: 12000,
    paymentMethod: 'installment',
    status: 'paid',
    orderDate: '2024-02-10',
    salesPerson: 'Bob Wang',
    installmentPlan: {
      totalInstallments: 6,
      installmentAmount: 2000,
      paidInstallments: 2,
      nextPaymentDate: '2024-04-10',
      payments: [
        {
          id: '1',
          installmentNumber: 1,
          amount: 2000,
          dueDate: '2024-02-10',
          paidDate: '2024-02-10',
          status: 'paid'
        },
        {
          id: '2',
          installmentNumber: 2,
          amount: 2000,
          dueDate: '2024-03-10',
          paidDate: '2024-03-09',
          status: 'paid'
        },
        {
          id: '3',
          installmentNumber: 3,
          amount: 2000,
          dueDate: '2024-04-10',
          status: 'pending'
        },
        {
          id: '4',
          installmentNumber: 4,
          amount: 2000,
          dueDate: '2024-05-10',
          status: 'pending'
        },
        {
          id: '5',
          installmentNumber: 5,
          amount: 2000,
          dueDate: '2024-06-10',
          status: 'pending'
        },
        {
          id: '6',
          installmentNumber: 6,
          amount: 2000,
          dueDate: '2024-07-10',
          status: 'pending'
        }
      ]
    },
    products: [
      {
        id: '2',
        name: '蓝双色布偶猫',
        breed: '布偶猫',
        price: 12000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'
      }
    ]
  },
  {
    id: '3',
    customerId: '3',
    orderNumber: 'ORD-2024-003',
    amount: 15000,
    paymentMethod: 'full',
    status: 'shipped',
    orderDate: '2024-03-05',
    salesPerson: 'Alice Chen',
    products: [
      {
        id: '3',
        name: '金点波斯猫',
        breed: '波斯猫',
        price: 15000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg'
      }
    ]
  },
  {
    id: '4',
    customerId: '4',
    orderNumber: 'ORD-2024-004',
    amount: 18000,
    paymentMethod: 'installment',
    status: 'paid',
    orderDate: '2024-03-12',
    salesPerson: 'Carol Li',
    installmentPlan: {
      totalInstallments: 12,
      installmentAmount: 1500,
      paidInstallments: 1,
      nextPaymentDate: '2024-04-12',
      payments: [
        {
          id: '7',
          installmentNumber: 1,
          amount: 1500,
          dueDate: '2024-03-12',
          paidDate: '2024-03-12',
          status: 'paid'
        },
        {
          id: '8',
          installmentNumber: 2,
          amount: 1500,
          dueDate: '2024-04-12',
          status: 'pending'
        }
      ]
    },
    products: [
      {
        id: '4',
        name: '纯白波斯猫',
        breed: '波斯猫',
        price: 18000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg'
      }
    ]
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: '银渐层英短',
    breed: '英国短毛猫',
    age: '3个月',
    gender: 'female',
    price: 8800,
    description: '纯种银渐层英短，毛色均匀，性格温顺，已完成疫苗接种。父母均为CFA认证血统，品相优秀，健康保证。',
    images: [
      'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg',
      'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
    ],
    videos: ['https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'],
    isAvailable: true,
    features: ['纯种血统', '疫苗齐全', '健康保证', '可上门看猫', 'CFA认证']
  },
  {
    id: '2',
    name: '蓝双色布偶猫',
    breed: '布偶猫',
    age: '4个月',
    gender: 'male',
    price: 12000,
    description: '蓝双色布偶猫，眼睛湛蓝，毛质柔顺，性格粘人。来自知名猫舍，父母均有优秀血统证书。',
    images: [
      'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg',
      'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
      'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
    ],
    videos: [],
    isAvailable: true,
    features: ['CFA认证', '父母均有证书', '毛色标准', '性格亲人', '健康检查']
  },
  {
    id: '3',
    name: '金点波斯猫',
    breed: '波斯猫',
    age: '5个月',
    gender: 'female',
    price: 15000,
    description: '金点波斯猫，毛色华丽，面部扁平，典型波斯猫特征。性格温和，适合家庭饲养。',
    images: [
      'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
      'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg'
    ],
    videos: [],
    isAvailable: false,
    features: ['纯种血统', '毛色华丽', '性格温和', '适合家庭', '健康保证']
  },
  {
    id: '4',
    name: '纯白波斯猫',
    breed: '波斯猫',
    age: '6个月',
    gender: 'male',
    price: 18000,
    description: '纯白波斯猫，毛色纯净如雪，眼睛蓝色，品相极佳。来自顶级血统，适合参赛或繁殖。',
    images: [
      'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg',
      'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg'
    ],
    videos: [],
    isAvailable: true,
    features: ['顶级血统', '品相极佳', '适合参赛', '繁殖价值', '健康认证']
  },
  {
    id: '5',
    name: '海豹色暹罗猫',
    breed: '暹罗猫',
    age: '3个月',
    gender: 'female',
    price: 6800,
    description: '海豹色暹罗猫，颜色对比鲜明，性格活泼好动，智商很高，容易训练。',
    images: [
      'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg',
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
    ],
    videos: [],
    isAvailable: true,
    features: ['颜色标准', '性格活泼', '智商很高', '容易训练', '健康活泼']
  },
  {
    id: '6',
    name: '蓝猫英短',
    breed: '英国短毛猫',
    age: '4个月',
    gender: 'male',
    price: 7500,
    description: '蓝猫英短，毛色纯正，体型圆润，性格稳重。是英短中的经典色系，深受喜爱。',
    images: [
      'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
      'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
    ],
    videos: [],
    isAvailable: true,
    features: ['毛色纯正', '体型标准', '性格稳重', '经典色系', '健康保证']
  }
];

export const mockKnowledgeBase: KnowledgeBase[] = [
  {
    id: '1',
    question: '如何选择适合的猫咪品种？',
    answer: '选择猫咪品种需要考虑以下几个因素：\n\n1. **生活空间大小**：大型猫咪如缅因猫需要更大的活动空间，小户型适合选择体型较小的品种。\n\n2. **家庭成员情况**：有小孩的家庭建议选择性格温和的品种如布偶猫、英短等。\n\n3. **护理时间**：长毛猫需要每天梳毛，短毛猫相对好打理。如果工作繁忙，建议选择短毛品种。\n\n4. **预算考虑**：不同品种价格差异较大，同时要考虑后续的食物、医疗等费用。\n\n5. **个人喜好**：最重要的是选择自己真正喜欢的品种，这样才能给猫咪最好的照顾。',
    category: '选购指南',
    tags: ['品种选择', '新手指南', '家庭养猫'],
    images: [
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg',
      'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
    ],
    viewCount: 156,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    question: '猫咪疫苗接种时间表是什么？',
    answer: '幼猫疫苗接种时间表如下：\n\n**首次免疫（8-10周龄）**\n- 猫三联疫苗（预防猫瘟、猫杯状病毒、猫鼻气管炎）\n\n**第二次免疫（12-14周龄）**\n- 猫三联疫苗加强\n- 狂犬病疫苗\n\n**第三次免疫（16-18周龄）**\n- 猫三联疫苗再次加强\n\n**成年猫维护**\n- 每年接种一次猫三联疫苗\n- 每年接种一次狂犬病疫苗\n\n**注意事项：**\n- 疫苗接种前需确保猫咪身体健康\n- 接种后观察1-2天，注意有无不良反应\n- 疫苗接种期间避免洗澡和外出',
    category: '健康护理',
    tags: ['疫苗', '健康', '幼猫', '免疫'],
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
    ],
    viewCount: 89,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05'
  },
  {
    id: '3',
    question: '布偶猫的性格特点和饲养要点？',
    answer: '**布偶猫性格特点：**\n\n1. **温顺粘人**：布偶猫性格非常温和，喜欢跟随主人，被称为"小狗猫"。\n\n2. **忍耐力强**：对疼痛的忍耐力很强，适合有小孩的家庭。\n\n3. **安静优雅**：叫声轻柔，不会过度吵闹。\n\n**饲养要点：**\n\n1. **毛发护理**：每天需要梳毛，防止打结，定期洗澡。\n\n2. **室内饲养**：布偶猫适合室内饲养，不建议散养。\n\n3. **营养需求**：选择高质量猫粮，注意蛋白质含量。\n\n4. **运动需求**：虽然性格温和，但也需要适量运动保持健康。\n\n5. **定期体检**：注意心脏病等遗传疾病的预防。',
    category: '品种介绍',
    tags: ['布偶猫', '性格', '饲养', '护理'],
    images: [
      'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg',
      'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg'
    ],
    viewCount: 234,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: '4',
    question: '猫咪日常饮食应该注意什么？',
    answer: '**猫咪饮食基本原则：**\n\n1. **高蛋白低碳水**：猫咪是肉食动物，需要高蛋白质的食物。\n\n2. **定时定量**：建议一天2-3餐，避免自由采食导致肥胖。\n\n3. **充足饮水**：保证新鲜饮水，可以使用流动水源。\n\n**食物选择：**\n\n- **主食**：优质猫粮为主，注意蛋白质含量≥30%\n- **湿粮**：适量添加罐头或湿粮，增加水分摄入\n- **零食**：控制在总热量的10%以内\n\n**禁忌食物：**\n- 巧克力、洋葱、大蒜\n- 葡萄、牛奶（部分猫咪乳糖不耐受）\n- 生鱼生肉（有寄生虫风险）\n\n**特殊时期：**\n- 幼猫：选择幼猫专用粮\n- 老年猫：选择易消化的老年猫粮\n- 怀孕母猫：增加营养密度',
    category: '饲养技巧',
    tags: ['饮食', '营养', '猫粮', '健康'],
    viewCount: 178,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    question: '如何训练猫咪使用猫砂盆？',
    answer: '**猫砂盆训练步骤：**\n\n1. **选择合适的猫砂盆**\n   - 大小适中，猫咪能完全进入\n   - 边缘不要太高，方便进出\n   - 位置安静，远离食物和水\n\n2. **选择合适的猫砂**\n   - 无香型猫砂更受猫咪喜欢\n   - 颗粒大小适中\n   - 吸水性和除臭性要好\n\n3. **训练方法**\n   - 观察猫咪排便信号，及时引导到猫砂盆\n   - 在猫砂盆中放少量猫咪的排泄物\n   - 排便后及时清理，保持清洁\n\n4. **注意事项**\n   - 多猫家庭建议每只猫一个猫砂盆\n   - 定期更换猫砂，保持卫生\n   - 如果猫咪拒绝使用，检查是否有健康问题\n\n**常见问题解决：**\n- 乱拉乱尿：检查猫砂盆清洁度和位置\n- 不埋便便：可能是猫砂不合适或学习不足',
    category: '饲养技巧',
    tags: ['训练', '猫砂盆', '行为', '卫生'],
    viewCount: 145,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: '6',
    question: '猫咪生病的常见症状有哪些？',
    answer: '**需要立即就医的紧急症状：**\n\n1. **呼吸困难**：张口呼吸、呼吸急促\n2. **持续呕吐**：特别是伴随腹泻\n3. **无法排尿**：可能是尿路阻塞\n4. **严重外伤**：出血、骨折等\n5. **中毒症状**：流口水、抽搐、昏迷\n\n**常见疾病症状：**\n\n**消化系统：**\n- 食欲不振、呕吐、腹泻\n- 便秘、腹部胀大\n\n**呼吸系统：**\n- 咳嗽、打喷嚏、流鼻涕\n- 呼吸声异常\n\n**泌尿系统：**\n- 频繁进出猫砂盆\n- 尿液颜色异常、有血\n\n**皮肤问题：**\n- 过度舔毛、脱毛\n- 皮肤红肿、有皮屑\n\n**行为变化：**\n- 精神萎靡、躲藏\n- 攻击性增加或异常安静\n\n**预防措施：**\n- 定期体检和疫苗接种\n- 保持环境清洁\n- 提供均衡营养\n- 观察日常行为变化',
    category: '健康护理',
    tags: ['疾病', '症状', '健康', '预防'],
    viewCount: 267,
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalCustomers: 128,
  totalOrders: 89,
  totalRevenue: 567800,
  monthlyGrowth: 15.8,
  pendingPayments: 12,
  overduePayments: 3
};