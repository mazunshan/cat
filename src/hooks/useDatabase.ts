import { useState, useEffect } from 'react';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord, AfterSalesRecord, ServiceTemplate, CustomerFeedback, QuarantineVideo, CustomerFile, SalesPerformance } from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateAttendanceStatus } from '../utils/attendanceUtils';

// 统一的销售员名单 - 确保在整个应用中保持一致
export const SALES_STAFF = [
  'Alice Chen',
  'Bob Wang', 
  'Carol Li',
  'Emma Liu',
  'Frank Zhou',
  'Grace Wu',
  'Henry Zhang',
  'Ivy Wang',
  'Jack Liu',
  'Kelly Chen'
];

// 模拟客户数据 - 确保在整个应用中保持一致
const generateMockCustomers = (): Customer[] => [
  {
    id: '1',
    name: '张小美',
    gender: 'female',
    phone: '13800138001',
    wechat: 'zhang_xiaomei',
    customerType: 'retail',
    address: '北京市朝阳区三里屯路123号',
    occupation: 'UI设计师',
    orderDate: '2024-01-10',
    salesPerson: 'Alice Chen',
    catName: '小银',
    catBirthday: '2023-10-15',
    isMallMember: true,
    catBreed: '英国短毛猫',
    catGender: 'female',
    supplyChain: '北京猫舍',
    supplyChainDeposit: 2000,
    totalAmount: 8800,
    paymentMethod: 'full_payment',
    customerDeposit: 1000,
    depositDestination: '支付宝',
    shippingDate: '2024-01-20',
    balance: 0,
    balancePaid: true,
    balanceConfirmMethod: '微信转账',
    sellingPrice: 8800,
    cost: 5000,
    shippingFee: 200,
    profit: 3600,
    profitRate: 40.9,
    tags: ['高意向', '英短爱好者', '预算充足'],
    notes: '很喜欢银渐层，已看过多只猫咪，计划本月内购买',
    createdAt: '2024-01-15',
    assignedSales: 'Alice Chen',
    files: [],
    orders: []
  },
  {
    id: '2',
    name: '李先生',
    gender: 'male',
    phone: '13900139002',
    wechat: 'li_mister',
    customerType: 'installment',
    address: '上海市浦东新区世纪大道456号',
    occupation: '软件工程师',
    orderDate: '2024-02-01',
    salesPerson: 'Alice Chen',
    catName: '布丁',
    contractName: '李明',
    relationship: '本人',
    catBreed: '布偶猫',
    catGender: 'male',
    isInGroup: true,
    catBirthday: '2023-11-20',
    supplyChain: '上海宠物基地',
    repaymentDate: '2024-02-15',
    installmentPeriod: '2024年2月-2024年7月',
    catCost: 8000,
    collectionAmount: 12000,
    fundsDestination: '银行卡',
    installmentAmount: 2000,
    installmentCount: 6,
    signingMethod: '线上签约',
    isFirstPaymentManual: false,
    hasESignContract: true,
    contractTotalPrice: 12000,
    mallGrossProfit: 2000,
    cost: 8000,
    grossProfit: 4000,
    profitRate: 33.3,
    monthlyProfit: 667,
    breakEvenPeriod: 12,
    installmentPayments: [
      {
        id: 'payment-1',
        installmentNumber: 1,
        amount: 2000,
        dueDate: '2024-02-15',
        paidDate: '2024-02-15',
        isPaid: true,
        isOverdue: false
      },
      {
        id: 'payment-2',
        installmentNumber: 2,
        amount: 2000,
        dueDate: '2024-03-15',
        paidDate: '2024-03-14',
        isPaid: true,
        isOverdue: false
      },
      {
        id: 'payment-3',
        installmentNumber: 3,
        amount: 2000,
        dueDate: '2024-04-15',
        isPaid: false,
        isOverdue: true,
        overdueCount: 15
      },
      {
        id: 'payment-4',
        installmentNumber: 4,
        amount: 2000,
        dueDate: '2024-05-15',
        isPaid: false,
        isOverdue: false
      },
      {
        id: 'payment-5',
        installmentNumber: 5,
        amount: 2000,
        dueDate: '2024-06-15',
        isPaid: false,
        isOverdue: false
      },
      {
        id: 'payment-6',
        installmentNumber: 6,
        amount: 2000,
        dueDate: '2024-07-15',
        isPaid: false,
        isOverdue: false
      }
    ],
    tags: ['分期付款', '布偶猫', '首次购买'],
    notes: '选择分期付款，工作稳定，收入可观，对布偶猫很感兴趣',
    createdAt: '2024-02-01',
    assignedSales: 'Alice Chen',
    files: [],
    orders: []
  },
  {
    id: '3',
    name: '王女士',
    gender: 'female',
    phone: '13700137003',
    wechat: 'wang_lady',
    customerType: 'retail',
    address: '广州市天河区珠江新城789号',
    occupation: '市场经理',
    orderDate: '2024-02-15',
    salesPerson: 'Bob Wang',
    catName: '波波',
    catBirthday: '2023-12-01',
    isMallMember: false,
    catBreed: '波斯猫',
    catGender: 'female',
    supplyChain: '广州名猫坊',
    supplyChainDeposit: 3000,
    totalAmount: 15000,
    paymentMethod: 'shipping_balance',
    customerDeposit: 5000,
    depositDestination: '微信支付',
    shippingDate: '2024-03-01',
    balance: 10000,
    balancePaid: true,
    balanceConfirmMethod: '银行转账',
    sellingPrice: 15000,
    cost: 10000,
    shippingFee: 300,
    profit: 4700,
    profitRate: 31.3,
    tags: ['高端客户', '波斯猫', '多只购买'],
    notes: '有养猫经验，希望购买2-3只高品质波斯猫',
    createdAt: '2024-02-15',
    assignedSales: 'Bob Wang',
    files: [],
    orders: []
  },
  {
    id: '4',
    name: '陈总',
    gender: 'male',
    phone: '13600136004',
    wechat: 'chen_boss',
    address: '深圳市南山区科技园888号',
    occupation: '企业家',
    tags: ['VIP客户', '缅因猫', '预算无限'],
    notes: '公司老板，喜欢大型猫咪，预算充足，要求品质最高',
    createdAt: '2024-03-01',
    assignedSales: 'Carol Li',
    files: [],
    orders: []
  },
  {
    id: '5',
    name: '刘小姐',
    gender: 'female',
    phone: '13500135005',
    wechat: 'liu_miss',
    address: '杭州市西湖区文三路666号',
    occupation: '程序员',
    tags: ['技术宅', '美短', '理性消费'],
    notes: '程序员，工作忙碌，希望养一只安静的美短陪伴',
    createdAt: '2024-03-10',
    assignedSales: 'Alice Chen',
    files: [],
    orders: []
  },
  {
    id: '6',
    name: '赵医生',
    gender: 'male',
    phone: '13400134006',
    wechat: 'dr_zhao',
    address: '成都市锦江区春熙路999号',
    occupation: '医生',
    tags: ['专业人士', '英短', '品质要求高'],
    notes: '医生职业，对猫咪健康要求很高，希望购买健康的英短',
    createdAt: '2024-03-20',
    assignedSales: 'Emma Liu',
    files: [],
    orders: []
  },
  {
    id: '7',
    name: '孙女士',
    gender: 'female',
    phone: '13300133007',
    wechat: 'sun_lady',
    address: '武汉市武昌区中南路777号',
    occupation: '教师',
    tags: ['教育工作者', '布偶猫', '温和性格'],
    notes: '小学教师，喜欢温和的布偶猫，希望能陪伴孩子成长',
    createdAt: '2024-04-01',
    assignedSales: 'Frank Zhou',
    files: [],
    orders: []
  },
  {
    id: '8',
    name: '周先生',
    gender: 'male',
    phone: '13200132008',
    wechat: 'zhou_sir',
    address: '西安市雁塔区高新路555号',
    occupation: '工程师',
    tags: ['技术人员', '俄蓝', '安静性格'],
    notes: '软件工程师，喜欢安静的俄罗斯蓝猫，适合居家办公',
    createdAt: '2024-04-10',
    assignedSales: 'Grace Wu',
    files: [],
    orders: []
  },
  {
    id: '9',
    name: '马女士',
    gender: 'female',
    phone: '13100131009',
    wechat: 'ma_lady',
    address: '天津市和平区南京路888号',
    occupation: '律师',
    tags: ['高收入', '波斯猫', '品质追求'],
    notes: '律师职业，收入稳定，对猫咪品质要求很高',
    createdAt: '2024-04-15',
    assignedSales: 'Henry Zhang',
    files: [],
    orders: []
  },
  {
    id: '10',
    name: '黄先生',
    gender: 'male',
    phone: '13000130010',
    wechat: 'huang_sir',
    address: '重庆市渝中区解放碑999号',
    occupation: '金融分析师',
    tags: ['金融行业', '缅因猫', '投资理念'],
    notes: '金融分析师，理性消费，看重猫咪的投资价值',
    createdAt: '2024-04-20',
    assignedSales: 'Ivy Wang',
    files: [],
    orders: []
  },
  {
    id: '11',
    name: '林女士',
    gender: 'female',
    phone: '12900129011',
    wechat: 'lin_lady',
    address: '南京市鼓楼区中山路777号',
    occupation: '设计师',
    tags: ['创意工作者', '英短', '颜值控'],
    notes: '室内设计师，对美的要求很高，喜欢颜值高的猫咪',
    createdAt: '2024-04-25',
    assignedSales: 'Jack Liu',
    files: [],
    orders: []
  },
  {
    id: '12',
    name: '吴总',
    gender: 'male',
    phone: '12800128012',
    wechat: 'wu_boss',
    address: '苏州市工业园区星海街666号',
    occupation: '企业高管',
    tags: ['企业高管', '布偶猫', '高端需求'],
    notes: '企业高管，时间宝贵，希望一站式服务',
    createdAt: '2024-05-01',
    assignedSales: 'Kelly Chen',
    files: [],
    orders: []
  }
];

// 模拟产品数据 - 增加检疫视频
const mockProducts: Product[] = [
  {
    id: '1',
    name: '银渐层英短',
    breed: '英国短毛猫',
    age: '3个月',
    gender: 'female',
    price: 8800,
    description: '纯种银渐层英短，毛色均匀，性格温顺，已完成疫苗接种。',
    images: [
      'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg',
      'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg'
    ],
    videos: [],
    quarantineVideos: [
      {
        id: 'qv1',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        title: '入场检疫视频',
        description: '猫咪入场时的健康检查视频，包含体温测量、基础体检等',
        recordedDate: '2024-01-10',
        duration: 180,
        fileSize: 1048576,
        veterinarian: '李兽医',
        quarantineStatus: 'healthy',
        uploadedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 'qv2',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        title: '7天观察期检查',
        description: '观察期第7天的健康状况检查，确认无异常症状',
        recordedDate: '2024-01-17',
        duration: 120,
        fileSize: 2097152,
        veterinarian: '李兽医',
        quarantineStatus: 'cleared',
        uploadedAt: '2024-01-17T14:30:00Z'
      }
    ],
    isAvailable: true,
    features: ['纯种血统', '疫苗齐全', '健康保证', '可上门看猫']
  },
  {
    id: '2',
    name: '蓝双色布偶猫',
    breed: '布偶猫',
    age: '4个月',
    gender: 'male',
    price: 12000,
    description: '蓝双色布偶猫，眼睛湛蓝，毛质柔顺，性格粘人。',
    images: [
      'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg',
      'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg'
    ],
    videos: [],
    quarantineVideos: [
      {
        id: 'qv3',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        title: '健康检疫报告',
        description: '布偶猫全面健康检查，包含血液检测、疫苗接种记录',
        recordedDate: '2024-02-05',
        duration: 240,
        fileSize: 1572864,
        veterinarian: '王兽医',
        quarantineStatus: 'healthy',
        uploadedAt: '2024-02-05T09:15:00Z'
      }
    ],
    isAvailable: true,
    features: ['CFA认证', '父母均有证书', '毛色标准', '性格亲人']
  },
  {
    id: '3',
    name: '金吉拉波斯猫',
    breed: '波斯猫',
    age: '5个月',
    gender: 'female',
    price: 15000,
    description: '金吉拉波斯猫，毛质如丝，五官精致，贵族气质。',
    images: [
      'https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg'
    ],
    videos: [],
    quarantineVideos: [
      {
        id: 'qv4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        title: '专业检疫认证',
        description: '波斯猫专业检疫认证视频，确认符合出售标准',
        recordedDate: '2024-02-20',
        duration: 300,
        fileSize: 2621440,
        veterinarian: '张兽医',
        quarantineStatus: 'cleared',
        uploadedAt: '2024-02-20T16:45:00Z'
      }
    ],
    isAvailable: true,
    features: ['顶级血统', '毛质极佳', '五官标准', '性格温和']
  },
  {
    id: '4',
    name: '橘色美短',
    breed: '美国短毛猫',
    age: '2个月',
    gender: 'male',
    price: 6800,
    description: '橘色美短，活泼可爱，适应性强，是家庭宠物的好选择。',
    images: [
      'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
    ],
    videos: [],
    quarantineVideos: [],
    isAvailable: true,
    features: ['健康活泼', '适应性强', '容易照料', '性格友好']
  },
  {
    id: '5',
    name: '银色缅因猫',
    breed: '缅因猫',
    age: '6个月',
    gender: 'female',
    price: 18000,
    description: '银色缅因猫，体型大，毛发浓密，性格温和，被称为"温柔的巨人"。',
    images: [
      'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg'
    ],
    videos: [],
    quarantineVideos: [],
    isAvailable: true,
    features: ['大型猫种', '毛发浓密', '性格温和', '智商很高']
  },
  {
    id: '6',
    name: '蓝色俄罗斯蓝猫',
    breed: '俄罗斯蓝猫',
    age: '4个月',
    gender: 'male',
    price: 9500,
    description: '纯种俄罗斯蓝猫，毛色呈银蓝色，性格安静优雅。',
    images: [
      'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
    ],
    videos: [],
    quarantineVideos: [],
    isAvailable: true,
    features: ['毛色独特', '性格安静', '适合公寓', '低过敏性']
  },
  {
    id: '7',
    name: '海双色布偶猫',
    breed: '布偶猫',
    age: '3个月',
    gender: 'female',
    price: 13500,
    description: '海双色布偶猫，毛色分布完美，性格温顺粘人。',
    images: [
      'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'
    ],
    videos: [],
    quarantineVideos: [],
    isAvailable: true,
    features: ['毛色完美', '血统纯正', '性格温顺', '适合家庭']
  },
  {
    id: '8',
    name: '蓝白英短',
    breed: '英国短毛猫',
    age: '4个月',
    gender: 'male',
    price: 7800,
    description: '蓝白英短，毛色分布均匀，性格稳重可爱。',
    images: [
      'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
    ],
    videos: [],
    quarantineVideos: [],
    isAvailable: true,
    features: ['毛色均匀', '性格稳重', '易于照料', '健康保证']
  }
];

// 模拟订单数据 - 大幅增加订单数量，分配给不同销售员，创建更丰富的业绩数据
const mockOrders: Order[] = [
  // Alice Chen 的订单 (业绩最高)
  {
    id: '1',
    customerId: '1',
    orderNumber: 'ORD-2024-001',
    amount: 8800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-01-15',
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
    status: 'completed',
    orderDate: '2024-02-10',
    salesPerson: 'Alice Chen',
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
    customerId: '5',
    orderNumber: 'ORD-2024-003',
    amount: 6800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-03-05',
    salesPerson: 'Alice Chen',
    products: [
      {
        id: '4',
        name: '橘色美短',
        breed: '美国短毛猫',
        price: 6800,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
      }
    ]
  },
  {
    id: '4',
    customerId: '1',
    orderNumber: 'ORD-2024-004',
    amount: 13500,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-03-20',
    salesPerson: 'Alice Chen',
    products: [
      {
        id: '7',
        name: '海双色布偶猫',
        breed: '布偶猫',
        price: 13500,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'
      }
    ]
  },
  {
    id: '5',
    customerId: '2',
    orderNumber: 'ORD-2024-005',
    amount: 7800,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-04-10',
    salesPerson: 'Alice Chen',
    products: [
      {
        id: '8',
        name: '蓝白英短',
        breed: '英国短毛猫',
        price: 7800,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
      }
    ]
  },
  {
    id: '19',
    customerId: '1',
    orderNumber: 'ORD-2024-019',
    amount: 6800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-05-05',
    salesPerson: 'Alice Chen',
    products: [
      {
        id: '4',
        name: '橘色美短',
        breed: '美国短毛猫',
        price: 6800,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
      }
    ]
  },

  // Bob Wang 的订单 (业绩第二)
  {
    id: '6',
    customerId: '3',
    orderNumber: 'ORD-2024-006',
    amount: 15000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-02-20',
    salesPerson: 'Bob Wang',
    products: [
      {
        id: '3',
        name: '金吉拉波斯猫',
        breed: '波斯猫',
        price: 15000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg'
      }
    ]
  },
  {
    id: '7',
    customerId: '3',
    orderNumber: 'ORD-2024-007',
    amount: 12000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-03-15',
    salesPerson: 'Bob Wang',
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
    id: '8',
    customerId: '3',
    orderNumber: 'ORD-2024-008',
    amount: 8800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-04-05',
    salesPerson: 'Bob Wang',
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
    id: '20',
    customerId: '3',
    orderNumber: 'ORD-2024-020',
    amount: 9500,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-05-08',
    salesPerson: 'Bob Wang',
    products: [
      {
        id: '6',
        name: '蓝色俄罗斯蓝猫',
        breed: '俄罗斯蓝猫',
        price: 9500,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
      }
    ]
  },

  // Carol Li 的订单 (业绩第三)
  {
    id: '9',
    customerId: '4',
    orderNumber: 'ORD-2024-009',
    amount: 18000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-03-10',
    salesPerson: 'Carol Li',
    products: [
      {
        id: '5',
        name: '银色缅因猫',
        breed: '缅因猫',
        price: 18000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg'
      }
    ]
  },
  {
    id: '10',
    customerId: '4',
    orderNumber: 'ORD-2024-010',
    amount: 9500,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-04-01',
    salesPerson: 'Carol Li',
    products: [
      {
        id: '6',
        name: '蓝色俄罗斯蓝猫',
        breed: '俄罗斯蓝猫',
        price: 9500,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
      }
    ]
  },
  {
    id: '21',
    customerId: '4',
    orderNumber: 'ORD-2024-021',
    amount: 12000,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-05-10',
    salesPerson: 'Carol Li',
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

  // Emma Liu 的订单
  {
    id: '11',
    customerId: '6',
    orderNumber: 'ORD-2024-011',
    amount: 8800,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-03-25',
    salesPerson: 'Emma Liu',
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
    id: '12',
    customerId: '6',
    orderNumber: 'ORD-2024-012',
    amount: 7800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-04-15',
    salesPerson: 'Emma Liu',
    products: [
      {
        id: '8',
        name: '蓝白英短',
        breed: '英国短毛猫',
        price: 7800,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
      }
    ]
  },
  {
    id: '22',
    customerId: '6',
    orderNumber: 'ORD-2024-022',
    amount: 6800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-05-12',
    salesPerson: 'Emma Liu',
    products: [
      {
        id: '4',
        name: '橘色美短',
        breed: '美国短毛猫',
        price: 6800,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
      }
    ]
  },

  // Frank Zhou 的订单
  {
    id: '13',
    customerId: '7',
    orderNumber: 'ORD-2024-013',
    amount: 12000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-04-05',
    salesPerson: 'Frank Zhou',
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
    id: '23',
    customerId: '7',
    orderNumber: 'ORD-2024-023',
    amount: 7800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-05-15',
    salesPerson: 'Frank Zhou',
    products: [
      {
        id: '8',
        name: '蓝白英短',
        breed: '英国短毛猫',
        price: 7800,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
      }
    ]
  },

  // Grace Wu 的订单
  {
    id: '14',
    customerId: '8',
    orderNumber: 'ORD-2024-014',
    amount: 9500,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-04-12',
    salesPerson: 'Grace Wu',
    products: [
      {
        id: '6',
        name: '蓝色俄罗斯蓝猫',
        breed: '俄罗斯蓝猫',
        price: 9500,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
      }
    ]
  },

  // Henry Zhang 的订单
  {
    id: '15',
    customerId: '9',
    orderNumber: 'ORD-2024-015',
    amount: 15000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-04-18',
    salesPerson: 'Henry Zhang',
    products: [
      {
        id: '3',
        name: '金吉拉波斯猫',
        breed: '波斯猫',
        price: 15000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg'
      }
    ]
  },

  // Ivy Wang 的订单
  {
    id: '16',
    customerId: '10',
    orderNumber: 'ORD-2024-016',
    amount: 18000,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-04-22',
    salesPerson: 'Ivy Wang',
    products: [
      {
        id: '5',
        name: '银色缅因猫',
        breed: '缅因猫',
        price: 18000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg'
      }
    ]
  },

  // Jack Liu 的订单
  {
    id: '17',
    customerId: '11',
    orderNumber: 'ORD-2024-017',
    amount: 8800,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-04-28',
    salesPerson: 'Jack Liu',
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

  // Kelly Chen 的订单
  {
    id: '18',
    customerId: '12',
    orderNumber: 'ORD-2024-018',
    amount: 13500,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-05-02',
    salesPerson: 'Kelly Chen',
    products: [
      {
        id: '7',
        name: '海双色布偶猫',
        breed: '布偶猫',
        price: 13500,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'
      }
    ]
  }
];

// 模拟售后服务记录
const mockAfterSalesRecords: AfterSalesRecord[] = [
  {
    id: '1',
    orderId: '1',
    customerId: '1',
    type: 'phone_visit',
    status: 'completed',
    priority: 'medium',
    title: '7天回访电话',
    description: '购买后7天例行回访，了解猫咪适应情况',
    solution: '客户反馈猫咪适应良好，食欲正常，已经熟悉新环境。建议继续观察，有问题随时联系。',
    assignedTo: 'David Zhang',
    createdBy: 'David Zhang',
    scheduledDate: '2024-02-08',
    completedDate: '2024-02-08',
    customerSatisfaction: 5,
    followUpRequired: false,
    attachments: [],
    tags: ['例行回访', '适应良好'],
    createdAt: '2024-02-08T10:00:00Z',
    updatedAt: '2024-02-08T15:30:00Z'
  },
  {
    id: '2',
    orderId: '2',
    customerId: '2',
    type: 'health_consultation',
    status: 'completed',
    priority: 'high',
    title: '猫咪饮食咨询',
    description: '客户咨询布偶猫的饮食搭配和营养需求',
    solution: '已提供详细的饮食指南，推荐了适合的猫粮品牌和喂养频次。建议幼猫期每天3-4次，成年后改为2次。',
    assignedTo: 'David Zhang',
    createdBy: 'David Zhang',
    scheduledDate: '2024-02-15',
    completedDate: '2024-02-15',
    customerSatisfaction: 4,
    followUpRequired: true,
    followUpDate: '2024-03-15',
    attachments: ['饮食指南.pdf'],
    tags: ['饮食咨询', '营养指导'],
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-02-15T16:45:00Z'
  },
  {
    id: '3',
    orderId: '1',
    customerId: '1',
    type: 'home_service',
    status: 'pending',
    priority: 'medium',
    title: '30天上门检查',
    description: '购买后30天上门健康检查服务',
    assignedTo: 'David Zhang',
    createdBy: 'David Zhang',
    scheduledDate: '2024-03-01',
    followUpRequired: false,
    attachments: [],
    tags: ['上门服务', '健康检查'],
    createdAt: '2024-02-25T14:00:00Z',
    updatedAt: '2024-02-25T14:00:00Z'
  },
  {
    id: '4',
    orderId: '3',
    customerId: '3',
    type: 'complaint',
    status: 'in_progress',
    priority: 'urgent',
    title: '猫咪健康问题投诉',
    description: '客户反映波斯猫出现轻微眼部分泌物增多的情况',
    assignedTo: 'David Zhang',
    createdBy: 'David Zhang',
    scheduledDate: '2024-03-05',
    followUpRequired: true,
    attachments: ['眼部照片1.jpg', '眼部照片2.jpg'],
    tags: ['健康问题', '眼部护理', '紧急处理'],
    createdAt: '2024-03-04T11:30:00Z',
    updatedAt: '2024-03-04T18:20:00Z'
  }
];

// 模拟服务模板
const mockServiceTemplates: ServiceTemplate[] = [
  {
    id: '1',
    name: '7天回访电话',
    type: 'phone_visit',
    description: '购买后7天内进行电话回访，了解猫咪适应情况',
    defaultPriority: 'medium',
    estimatedDuration: 15,
    checklist: [
      '询问猫咪食欲情况',
      '了解猫咪精神状态',
      '确认疫苗接种情况',
      '提醒定期体检',
      '收集客户反馈'
    ],
    isActive: true
  },
  {
    id: '2',
    name: '健康咨询服务',
    type: 'health_consultation',
    description: '为客户提供专业的猫咪健康咨询服务',
    defaultPriority: 'high',
    estimatedDuration: 30,
    checklist: [
      '了解具体问题',
      '分析症状表现',
      '提供专业建议',
      '推荐就医方案',
      '安排后续跟进'
    ],
    isActive: true
  },
  {
    id: '3',
    name: '上门健康检查',
    type: 'home_service',
    description: '专业兽医上门为猫咪进行健康检查',
    defaultPriority: 'medium',
    estimatedDuration: 60,
    checklist: [
      '预约上门时间',
      '准备检查设备',
      '进行全面体检',
      '记录健康状况',
      '提供护理建议'
    ],
    isActive: true
  }
];

// 模拟销售业绩数据
const generateSalesPerformanceData = (users: User[]): SalesPerformance[] => {
  const performances: SalesPerformance[] = [];
  const salesStaff = users.filter(user => user.role === 'sales');
  
  // 生成过去90天的数据
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    salesStaff.forEach(staff => {
      // 根据销售员ID和日期生成一个伪随机数，确保相同的销售员在相同的日期有相同的数据
      const seed = staff.id.charCodeAt(0) + date.getDate() + date.getMonth();
      const randomFactor = Math.sin(seed) * 0.5 + 0.5; // 0-1之间的伪随机数
      
      // 生成业绩数据
      const traffic = Math.floor(10 + randomFactor * 40); // 10-50之间
      const orders = Math.floor(randomFactor * traffic * 0.3); // 转化率约30%
      const avgOrderValue = 5000 + randomFactor * 15000; // 5000-20000之间
      const revenue = orders * avgOrderValue;
      
      performances.push({
        date: dateString,
        salesId: staff.id,
        salesName: staff.name,
        teamId: staff.teamId,
        teamName: staff.teamId === 'team-1' ? '销售一组' : staff.teamId === 'team-2' ? '销售二组' : undefined,
        traffic,
        orders,
        revenue
      });
    });
  }
  
  return performances;
};

// 延迟初始化销售业绩数据
let globalSalesPerformance: SalesPerformance[] = [];

// 全局状态管理 - 确保数据一致性
let globalCustomers = generateMockCustomers();
let globalProducts = [...mockProducts];
let globalOrders = [...mockOrders];
let globalKnowledgeBase: KnowledgeBase[] = [];
let globalAttendanceRecords: AttendanceRecord[] = [];
let globalAfterSalesRecords = [...mockAfterSalesRecords];
let globalServiceTemplates = [...mockServiceTemplates];
let globalAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '系统更新通知',
    content: '系统将于本周六凌晨2点-4点进行例行维护，期间系统将暂停使用。请各位同事提前做好工作安排。',
    visible_to: 'all',
    priority: 'important',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: '销售人员培训通知',
    content: '下周三下午2点将在会议室举行新品种介绍培训，请所有销售人员准时参加。',
    visible_to: 'sales',
    priority: 'normal',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: '售后服务流程更新',
    content: '售后服务流程已更新，请所有售后专员查看最新的服务手册，并按照新流程执行工作。\n\n重点变更：\n1. 回访时间调整为购买后3天、7天、30天\n2. 新增满意度调查环节\n3. 健康咨询需在2小时内响应',
    visible_to: 'after_sales',
    priority: 'urgent',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// 客户文件管理钩子
export const useCustomerFiles = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCustomerFile = async (customerId: string, fileData: Omit<CustomerFile, 'id' | 'uploadedAt'>) => {
    setLoading(true);
    try {
      const newFile: CustomerFile = {
        id: Date.now().toString(),
        ...fileData,
        uploadedAt: new Date().toISOString()
      };

      // 更新全局客户数据中的文件
      globalCustomers = globalCustomers.map(customer => 
        customer.id === customerId 
          ? { ...customer, files: [...customer.files, newFile] }
          : customer
      );

      setError(null);
      return newFile;
    } catch (err) {
      setError('添加文件失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomerFile = async (customerId: string, fileId: string) => {
    setLoading(true);
    try {
      // 从全局客户数据中删除文件
      globalCustomers = globalCustomers.map(customer => 
        customer.id === customerId 
          ? { ...customer, files: customer.files.filter(file => file.id !== fileId) }
          : customer
      );

      setError(null);
    } catch (err) {
      setError('删除文件失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    error, 
    addCustomerFile, 
    deleteCustomerFile 
  };
};

// 客户数据钩子
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>(globalCustomers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setCustomers([...globalCustomers]);
      setError(null);
    } catch (err) {
      setError('获取客户数据失败');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerData,
      createdAt: new Date().toISOString().split('T')[0],
      files: [],
      orders: []
    };
    
    globalCustomers = [newCustomer, ...globalCustomers];
    setCustomers([...globalCustomers]);
    return newCustomer;
  };

  const updateCustomer = async (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    const existingCustomer = globalCustomers.find(c => c.id === customerId);
    if (!existingCustomer) throw new Error('客户不存在');

    const updatedCustomer: Customer = {
      ...existingCustomer,
      ...customerData
    };

    globalCustomers = globalCustomers.map(customer => 
      customer.id === customerId ? updatedCustomer : customer
    );
    setCustomers([...globalCustomers]);
    return updatedCustomer;
  };

  const deleteCustomer = async (customerId: string) => {
    globalCustomers = globalCustomers.filter(customer => customer.id !== customerId);
    setCustomers([...globalCustomers]);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, addCustomer, updateCustomer, deleteCustomer, refetch: fetchCustomers };
};

// 订单数据钩子
export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(globalOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 根据用户角色过滤订单
      let filteredOrders = [...globalOrders];
      
      // 如果不是管理员，只显示自己的订单
      if (user && user.role !== 'admin' && user.role === 'sales') {
        filteredOrders = filteredOrders.filter(order => order.salesPerson === user.name);
      }
      
      setOrders(filteredOrders);
      setError(null);
    } catch (err) {
      setError('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => {
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(globalOrders.length + 1).padStart(3, '0')}`;
    
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber,
      orderDate: new Date().toISOString().split('T')[0],
      ...orderData
    };

    globalOrders = [newOrder, ...globalOrders];
    
    // 根据用户角色过滤订单
    if (user && user.role !== 'admin' && user.role === 'sales') {
      setOrders(globalOrders.filter(order => order.salesPerson === user.name));
    } else {
      setOrders([...globalOrders]);
    }
    
    return newOrder;
  };

  const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
    // 检查权限
    if (user && user.role !== 'admin') {
      const orderToUpdate = globalOrders.find(o => o.id === orderId);
      if (!orderToUpdate || orderToUpdate.salesPerson !== user.name) {
        throw new Error('您没有权限修改此订单');
      }
    }
    
    const existingOrder = globalOrders.find(o => o.id === orderId);
    if (!existingOrder) throw new Error('订单不存在');

    const updatedOrder: Order = {
      ...existingOrder,
      ...orderData
    };

    globalOrders = globalOrders.map(order => 
      order.id === orderId ? updatedOrder : order
    );
    
    // 根据用户角色过滤订单
    if (user && user.role !== 'admin' && user.role === 'sales') {
      setOrders(globalOrders.filter(order => order.salesPerson === user.name));
    } else {
      setOrders([...globalOrders]);
    }
    
    return updatedOrder;
  };

  const deleteOrder = async (orderId: string) => {
    // 检查权限
    if (user && user.role !== 'admin') {
      const orderToDelete = globalOrders.find(o => o.id === orderId);
      if (!orderToDelete || orderToDelete.salesPerson !== user.name) {
        throw new Error('您没有权限删除此订单');
      }
    }
    
    globalOrders = globalOrders.filter(order => order.id !== orderId);
    
    // 根据用户角色过滤订单
    if (user && user.role !== 'admin' && user.role === 'sales') {
      setOrders(globalOrders.filter(order => order.salesPerson === user.name));
    } else {
      setOrders([...globalOrders]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return { orders, loading, error, addOrder, updateOrder, deleteOrder, refetch: fetchOrders };
};

// 产品数据钩子
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(globalProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts([...globalProducts]);
      setError(null);
    } catch (err) {
      setError('获取产品数据失败');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData
    };

    globalProducts = [newProduct, ...globalProducts];
    setProducts([...globalProducts]);
    return newProduct;
  };

  const updateProduct = async (productId: string, productData: Omit<Product, 'id'>) => {
    const existingProduct = globalProducts.find(p => p.id === productId);
    if (!existingProduct) throw new Error('产品不存在');

    const updatedProduct: Product = {
      ...existingProduct,
      ...productData,
      id: productId
    };

    globalProducts = globalProducts.map(product => 
      product.id === productId ? updatedProduct : product
    );
    setProducts([...globalProducts]);
    return updatedProduct;
  };

  const deleteProduct = async (productId: string) => {
    globalProducts = globalProducts.filter(product => product.id !== productId);
    setProducts([...globalProducts]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, addProduct, updateProduct, deleteProduct, refetch: fetchProducts };
};

// 知识库数据钩子
export const useKnowledgeBase = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>(globalKnowledgeBase);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeBase = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setKnowledgeBase([...globalKnowledgeBase]);
      setError(null);
    } catch (err) {
      setError('获取知识库数据失败');
    } finally {
      setLoading(false);
    }
  };

  const addKnowledge = async (knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    const newKnowledge: KnowledgeBase = {
      id: Date.now().toString(),
      ...knowledgeData,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    globalKnowledgeBase = [newKnowledge, ...globalKnowledgeBase];
    setKnowledgeBase([...globalKnowledgeBase]);
    return newKnowledge;
  };

  const updateKnowledge = async (knowledgeId: string, knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    const existingKnowledge = globalKnowledgeBase.find(kb => kb.id === knowledgeId);
    if (!existingKnowledge) throw new Error('知识库条目不存在');

    const updatedKnowledge: KnowledgeBase = {
      ...existingKnowledge,
      ...knowledgeData,
      updatedAt: new Date().toISOString()
    };

    globalKnowledgeBase = globalKnowledgeBase.map(kb => 
      kb.id === knowledgeId ? updatedKnowledge : kb
    );
    setKnowledgeBase([...globalKnowledgeBase]);
    return updatedKnowledge;
  };

  const deleteKnowledge = async (knowledgeId: string) => {
    globalKnowledgeBase = globalKnowledgeBase.filter(kb => kb.id !== knowledgeId);
    setKnowledgeBase([...globalKnowledgeBase]);
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  return { 
    knowledgeBase, 
    loading, 
    error, 
    addKnowledge, 
    updateKnowledge, 
    deleteKnowledge, 
    refetch: fetchKnowledgeBase 
  };
};

// 考勤数据钩子
export const useAttendance = () => {
  const { businessHours } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(globalAttendanceRecords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAttendanceRecords([...globalAttendanceRecords]);
      setError(null);
    } catch (err) {
      setError('获取考勤数据失败');
    } finally {
      setLoading(false);
    }
  };

  const addAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    // 根据营业时间设置计算考勤状态
    const status = calculateAttendanceStatus(
      attendanceData.checkInTime,
      attendanceData.checkOutTime,
      attendanceData.date,
      businessHours
    );

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      ...attendanceData,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 更新或添加记录
    const existingIndex = globalAttendanceRecords.findIndex(
      record => record.userId === attendanceData.userId && record.date === attendanceData.date
    );

    if (existingIndex !== -1) {
      globalAttendanceRecords[existingIndex] = newRecord;
    } else {
      globalAttendanceRecords = [newRecord, ...globalAttendanceRecords];
    }

    setAttendanceRecords([...globalAttendanceRecords]);
    return newRecord;
  };

  const updateAttendance = async (recordId: string, attendanceData: AttendanceRecord) => {
    // 根据营业时间设置重新计算考勤状态
    const status = calculateAttendanceStatus(
      attendanceData.checkInTime,
      attendanceData.checkOutTime,
      attendanceData.date,
      businessHours
    );

    const updatedRecord: AttendanceRecord = {
      ...attendanceData,
      id: recordId,
      status,
      updatedAt: new Date().toISOString()
    };

    globalAttendanceRecords = globalAttendanceRecords.map(record => 
      record.id === recordId ? updatedRecord : record
    );
    setAttendanceRecords([...globalAttendanceRecords]);
    return updatedRecord;
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // 当营业时间设置变更时，重新计算所有考勤状态
  useEffect(() => {
    if (globalAttendanceRecords.length > 0) {
      const updatedRecords = globalAttendanceRecords.map(record => {
        const newStatus = calculateAttendanceStatus(
          record.checkInTime,
          record.checkOutTime,
          record.date,
          businessHours
        );
        
        if (newStatus !== record.status) {
          return {
            ...record,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return record;
      });
      
      globalAttendanceRecords = updatedRecords;
      setAttendanceRecords([...globalAttendanceRecords]);
    }
  }, [businessHours]);

  return { 
    attendanceRecords, 
    loading, 
    error, 
    addAttendance, 
    updateAttendance, 
    refetch: fetchAttendance 
  };
};

// 售后服务记录钩子
export const useAfterSalesRecords = () => {
  const [afterSalesRecords, setAfterSalesRecords] = useState<AfterSalesRecord[]>(globalAfterSalesRecords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAfterSalesRecords = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAfterSalesRecords([...globalAfterSalesRecords]);
      setError(null);
    } catch (err) {
      setError('获取售后服务记录失败');
    } finally {
      setLoading(false);
    }
  };

  const addAfterSalesRecord = async (recordData: Omit<AfterSalesRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: AfterSalesRecord = {
      id: Date.now().toString(),
      ...recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    globalAfterSalesRecords = [newRecord, ...globalAfterSalesRecords];
    setAfterSalesRecords([...globalAfterSalesRecords]);
    return newRecord;
  };

  const updateAfterSalesRecord = async (recordId: string, recordData: Partial<AfterSalesRecord>) => {
    const existingRecord = globalAfterSalesRecords.find(r => r.id === recordId);
    if (!existingRecord) throw new Error('售后服务记录不存在');

    const updatedRecord: AfterSalesRecord = {
      ...existingRecord,
      ...recordData,
      updatedAt: new Date().toISOString()
    };

    globalAfterSalesRecords = globalAfterSalesRecords.map(record => 
      record.id === recordId ? updatedRecord : record
    );
    setAfterSalesRecords([...globalAfterSalesRecords]);
    return updatedRecord;
  };

  const deleteAfterSalesRecord = async (recordId: string) => {
    globalAfterSalesRecords = globalAfterSalesRecords.filter(record => record.id !== recordId);
    setAfterSalesRecords([...globalAfterSalesRecords]);
  };

  useEffect(() => {
    fetchAfterSalesRecords();
  }, []);

  return { 
    afterSalesRecords, 
    loading, 
    error, 
    addAfterSalesRecord, 
    updateAfterSalesRecord, 
    deleteAfterSalesRecord, 
    refetch: fetchAfterSalesRecords 
  };
};

// 服务模板钩子
export const useServiceTemplates = () => {
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>(globalServiceTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceTemplates = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setServiceTemplates([...globalServiceTemplates]);
      setError(null);
    } catch (err) {
      setError('获取服务模板失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceTemplates();
  }, []);

  return { 
    serviceTemplates, 
    loading, 
    error, 
    refetch: fetchServiceTemplates 
  };
};

// 公告数据钩子
export const useAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 根据用户角色过滤公告
      let filteredAnnouncements = [...globalAnnouncements];
      
      if (user) {
        if (user.role === 'sales') {
          filteredAnnouncements = filteredAnnouncements.filter(
            a => a.visible_to === 'sales' || a.visible_to === 'all'
          );
        } else if (user.role === 'after_sales') {
          filteredAnnouncements = filteredAnnouncements.filter(
            a => a.visible_to === 'after_sales' || a.visible_to === 'all'
          );
        }
        // 管理员可以看到所有公告
      }
      
      setAnnouncements(filteredAnnouncements);
      setError(null);
    } catch (err) {
      setError('获取公告数据失败');
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) throw new Error('用户未登录');
    
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      ...announcementData,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    globalAnnouncements = [newAnnouncement, ...globalAnnouncements];
    
    // 根据用户角色过滤公告
    let filteredAnnouncements = [...globalAnnouncements];
    if (user.role === 'sales') {
      filteredAnnouncements = filteredAnnouncements.filter(
        a => a.visible_to === 'sales' || a.visible_to === 'all'
      );
    } else if (user.role === 'after_sales') {
      filteredAnnouncements = filteredAnnouncements.filter(
        a => a.visible_to === 'after_sales' || a.visible_to === 'all'
      );
    }
    
    setAnnouncements(filteredAnnouncements);
    return newAnnouncement;
  };

  const updateAnnouncement = async (announcementId: string, announcementData: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    if (!user || user.role !== 'admin') throw new Error('只有管理员可以更新公告');
    
    const existingAnnouncement = globalAnnouncements.find(a => a.id === announcementId);
    if (!existingAnnouncement) throw new Error('公告不存在');

    const updatedAnnouncement: Announcement = {
      ...existingAnnouncement,
      ...announcementData,
      updated_at: new Date().toISOString()
    };

    globalAnnouncements = globalAnnouncements.map(announcement => 
      announcement.id === announcementId ? updatedAnnouncement : announcement
    );
    
    // 根据用户角色过滤公告
    let filteredAnnouncements = [...globalAnnouncements];
    if (user.role === 'sales') {
      filteredAnnouncements = filteredAnnouncements.filter(
        a => a.visible_to === 'sales' || a.visible_to === 'all'
      );
    } else if (user.role === 'after_sales') {
      filteredAnnouncements = filteredAnnouncements.filter(
        a => a.visible_to === 'after_sales' || a.visible_to === 'all'
      );
    }
    
    setAnnouncements(filteredAnnouncements);
    return updatedAnnouncement;
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!user || user.role !== 'admin') throw new Error('只有管理员可以删除公告');
    
    globalAnnouncements = globalAnnouncements.filter(announcement => announcement.id !== announcementId);
    
    // 根据用户角色过滤公告
    let filteredAnnouncements = [...globalAnnouncements];
    if (user.role === 'sales') {
      filteredAnnouncements = filteredAnnouncements.filter(
        a => a.visible_to === 'sales' || a.visible_to === 'all'
      );
    } else if (user.role === 'after_sales') {
      filteredAnnouncements = filteredAnnouncements.filter(
        a => a.visible_to === 'after_sales' || a.visible_to === 'all'
      );
    }
    
    setAnnouncements(filteredAnnouncements);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  return { 
    announcements, 
    loading, 
    error, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement, 
    refetch: fetchAnnouncements 
  };
};

// 销售业绩数据钩子
export const useSalesPerformance = () => {
  const { user, teams, users } = useAuth();
  const [salesPerformance, setSalesPerformance] = useState<SalesPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化销售业绩数据
  useEffect(() => {
    if (users.length > 0 && globalSalesPerformance.length === 0) {
      globalSalesPerformance = generateSalesPerformanceData(users);
    }
  }, [users]);

  const fetchSalesPerformance = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      // 确保销售业绩数据已初始化
      if (globalSalesPerformance.length === 0 && users.length > 0) {
        globalSalesPerformance = generateSalesPerformanceData(users);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 过滤日期范围
      let filteredPerformance = [...globalSalesPerformance];
      
      if (startDate) {
        filteredPerformance = filteredPerformance.filter(p => p.date >= startDate);
      }
      
      if (endDate) {
        filteredPerformance = filteredPerformance.filter(p => p.date <= endDate);
      }
      
      // 如果是销售员，只显示自己的业绩
      if (user && user.role === 'sales') {
        filteredPerformance = filteredPerformance.filter(p => p.salesId === user.id);
      }
      
      setSalesPerformance(filteredPerformance);
      setError(null);
    } catch (err) {
      setError('获取销售业绩数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取团队业绩数据
  const getTeamPerformance = (teamId: string, startDate?: string, endDate?: string) => {
    let teamData = salesPerformance.filter(p => p.teamId === teamId);
    
    if (startDate) {
      teamData = teamData.filter(p => p.date >= startDate);
    }
    
    if (endDate) {
      teamData = teamData.filter(p => p.date <= endDate);
    }
    
    return teamData;
  };

  // 获取个人业绩数据
  const getSalesPerformance = (salesId: string, startDate?: string, endDate?: string) => {
    let salesData = salesPerformance.filter(p => p.salesId === salesId);
    
    if (startDate) {
      salesData = salesData.filter(p => p.date >= startDate);
    }
    
    if (endDate) {
      salesData = salesData.filter(p => p.date <= endDate);
    }
    
    return salesData;
  };

  // 获取日期范围内的汇总数据
  const getSummaryData = (startDate?: string, endDate?: string, teamId?: string, salesId?: string) => {
    let filteredData = [...salesPerformance];
    
    if (startDate) {
      filteredData = filteredData.filter(p => p.date >= startDate);
    }
    
    if (endDate) {
      filteredData = filteredData.filter(p => p.date <= endDate);
    }
    
    if (teamId) {
      filteredData = filteredData.filter(p => p.teamId === teamId);
    }
    
    if (salesId) {
      filteredData = filteredData.filter(p => p.salesId === salesId);
    }
    
    // 按销售员分组
    const salesSummary = filteredData.reduce((acc, curr) => {
      if (!acc[curr.salesId]) {
        acc[curr.salesId] = {
          salesId: curr.salesId,
          salesName: curr.salesName,
          teamId: curr.teamId,
          teamName: curr.teamName,
          totalTraffic: 0,
          totalOrders: 0,
          totalRevenue: 0
        };
      }
      
      acc[curr.salesId].totalTraffic += curr.traffic;
      acc[curr.salesId].totalOrders += curr.orders;
      acc[curr.salesId].totalRevenue += curr.revenue;
      
      return acc;
    }, {} as Record<string, any>);
    
    // 按团队分组
    const teamSummary = filteredData.reduce((acc, curr) => {
      if (curr.teamId) {
        if (!acc[curr.teamId]) {
          acc[curr.teamId] = {
            teamId: curr.teamId,
            teamName: curr.teamName,
            totalTraffic: 0,
            totalOrders: 0,
            totalRevenue: 0
          };
        }
        
        acc[curr.teamId].totalTraffic += curr.traffic;
        acc[curr.teamId].totalOrders += curr.orders;
        acc[curr.teamId].totalRevenue += curr.revenue;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return {
      salesSummary: Object.values(salesSummary),
      teamSummary: Object.values(teamSummary)
    };
  };

  useEffect(() => {
    fetchSalesPerformance();
  }, [user, users]);

  return {
    salesPerformance,
    loading,
    error,
    fetchSalesPerformance,
    getTeamPerformance,
    getSalesPerformance,
    getSummaryData
  };
};