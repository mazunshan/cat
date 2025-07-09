import { useState, useEffect } from 'react';
import { 
  Customer, 
  Order, 
  Product, 
  KnowledgeBase, 
  AttendanceRecord, 
  User,
  AfterSalesRecord,
  ServiceTemplate,
  CustomerFile,
  Announcement,
  SalesPerformance,
  Team,
  InstallmentPayment,
  PaymentStatus
} from '../types';
import { useAuth } from '../context/AuthContext';

// 模拟数据库连接状态
const isDatabaseConnected = false;

// 销售人员列表
export const SALES_STAFF = [
  'Alice Chen',
  'Bob Wang', 
  'Carol Li',
  'David Zhang',
  'Emma Liu',
  'Frank Zhou',
  'Grace Wu'
];

// 生成分期还款记录的辅助函数
const generateInstallmentPayments = (count: number, amount: number, startDate: string): InstallmentPayment[] => {
  const payments: InstallmentPayment[] = [];
  const baseDate = new Date(startDate);
  
  for (let i = 1; i <= count; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    
    // 模拟一些已付款和逾期的情况
    let status: 'pending' | 'paid' | 'overdue' = 'pending';
    let paidDate: string | undefined;
    
    if (i <= Math.floor(count * 0.3)) {
      status = 'paid';
      paidDate = new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (dueDate < new Date()) {
      status = Math.random() > 0.7 ? 'overdue' : 'paid';
      if (status === 'paid') {
        paidDate = new Date(dueDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
    }
    
    payments.push({
      id: `payment-${i}`,
      installmentNumber: i,
      amount,
      dueDate: dueDate.toISOString().split('T')[0],
      status,
      paidDate,
      notes: status === 'overdue' ? '逾期未付' : status === 'paid' ? '已付款' : ''
    });
  }
  
  return payments;
};

// 模拟客户数据 - 包含零售和分期客户
const mockCustomers: Customer[] = [
  // 零售客户
  {
    id: '1',
    name: '张小美',
    gender: 'female',
    phone: '13800138001',
    wechat: 'zhang_xiaomei',
    address: '北京市朝阳区三里屯路123号',
    occupation: 'UI设计师',
    customerType: 'retail',
    tags: ['高意向', '英短爱好者', '预算充足'],
    notes: '很喜欢银渐层，已看过多只猫咪，计划本月内购买',
    createdAt: '2024-01-15',
    assignedSales: 'Alice Chen',
    files: [],
    orders: [],
    // 零售客户字段
    orderDate: '2024-01-15',
    salesPerson: 'Alice Chen',
    catName: '小银',
    catBirthday: '2023-10-01',
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
    profitRate: 40.91
  },
  {
    id: '2',
    name: '王女士',
    gender: 'female',
    phone: '13700137003',
    wechat: 'wang_lady',
    address: '广州市天河区珠江新城789号',
    occupation: '市场经理',
    customerType: 'retail',
    tags: ['高端客户', '波斯猫', '多只购买'],
    notes: '有养猫经验，希望购买2-3只高品质波斯猫',
    createdAt: '2024-02-15',
    assignedSales: 'Bob Wang',
    files: [],
    orders: [],
    // 零售客户字段
    orderDate: '2024-02-15',
    salesPerson: 'Bob Wang',
    catName: '小波',
    catBirthday: '2023-12-01',
    isMallMember: false,
    catBreed: '波斯猫',
    catGender: 'female',
    supplyChain: '广州猫舍',
    supplyChainDeposit: 3000,
    totalAmount: 15000,
    paymentMethod: 'shipping_balance',
    customerDeposit: 5000,
    depositDestination: '银行卡',
    shippingDate: '2024-02-25',
    balance: 10000,
    balancePaid: true,
    balanceConfirmMethod: '银行转账',
    sellingPrice: 15000,
    cost: 10000,
    shippingFee: 300,
    profit: 4700,
    profitRate: 31.33
  },
  {
    id: '3',
    name: '陈总',
    gender: 'male',
    phone: '13600136004',
    wechat: 'chen_boss',
    address: '深圳市南山区科技园888号',
    occupation: '企业家',
    customerType: 'retail',
    tags: ['VIP客户', '缅因猫', '预算无限'],
    notes: '公司老板，喜欢大型猫咪，预算充足，要求品质最高',
    createdAt: '2024-03-01',
    assignedSales: 'Carol Li',
    files: [],
    orders: [],
    // 零售客户字段
    orderDate: '2024-03-01',
    salesPerson: 'Carol Li',
    catName: '大王',
    catBirthday: '2023-09-15',
    isMallMember: true,
    catBreed: '缅因猫',
    catGender: 'male',
    supplyChain: '深圳猫舍',
    supplyChainDeposit: 5000,
    totalAmount: 25000,
    paymentMethod: 'full_payment',
    customerDeposit: 25000,
    depositDestination: '支付宝',
    shippingDate: '2024-03-10',
    balance: 0,
    balancePaid: true,
    balanceConfirmMethod: '支付宝',
    sellingPrice: 25000,
    cost: 15000,
    shippingFee: 500,
    profit: 9500,
    profitRate: 38.0
  },
  // 分期客户
  {
    id: '4',
    name: '李先生',
    gender: 'male',
    phone: '13900139002',
    wechat: 'li_mister',
    address: '上海市浦东新区世纪大道456号',
    occupation: '软件工程师',
    customerType: 'installment',
    tags: ['分期付款', '布偶猫', '首次购买'],
    notes: '选择分期付款，工作稳定，收入可观，对布偶猫很感兴趣',
    createdAt: '2024-02-01',
    assignedSales: 'Alice Chen',
    files: [],
    orders: [],
    // 分期客户字段
    orderDate: '2024-02-01',
    contractName: '李明',
    relationship: '本人',
    catName: '小布',
    catBirthday: '2023-11-15',
    catBreed: '布偶猫',
    catGender: 'male',
    isInGroup: true,
    supplyChain: '上海猫舍',
    repaymentDate: '2024-02-15',
    installmentPeriod: '2024年2月-2024年7月',
    catCost: 8000,
    collectionAmount: 12000,
    fundsDestination: '银行卡',
    installmentAmount: 2000,
    installmentCount: 6,
    shippingFee: 300,
    signingMethod: '线上签约',
    isFirstPaymentManual: false,
    hasESignContract: true,
    contractTotalPrice: 12000,
    mallGrossProfit: 1000,
    grossProfit: 3700,
    profitRate: 30.83,
    monthlyProfit: 616.67,
    breakEvenPeriod: 4,
    installmentPayments: generateInstallmentPayments(6, 2000, '2024-02-15')
  },
  {
    id: '5',
    name: '赵医生',
    gender: 'male',
    phone: '13400134006',
    wechat: 'dr_zhao',
    address: '成都市锦江区春熙路999号',
    occupation: '医生',
    customerType: 'installment',
    tags: ['专业人士', '英短', '品质要求高'],
    notes: '医生职业，对猫咪健康要求很高，希望购买健康的英短',
    createdAt: '2024-03-20',
    assignedSales: 'Emma Liu',
    files: [],
    orders: [],
    // 分期客户字段
    orderDate: '2024-03-20',
    contractName: '赵建国',
    relationship: '本人',
    catName: '小英',
    catBirthday: '2024-01-01',
    catBreed: '英国短毛猫',
    catGender: 'female',
    isInGroup: true,
    supplyChain: '成都猫舍',
    repaymentDate: '2024-04-01',
    installmentPeriod: '2024年4月-2025年3月',
    catCost: 6000,
    collectionAmount: 9600,
    fundsDestination: '支付宝',
    installmentAmount: 800,
    installmentCount: 12,
    shippingFee: 200,
    signingMethod: '线下签约',
    isFirstPaymentManual: true,
    hasESignContract: true,
    contractTotalPrice: 9600,
    mallGrossProfit: 800,
    grossProfit: 3400,
    profitRate: 35.42,
    monthlyProfit: 283.33,
    breakEvenPeriod: 6,
    installmentPayments: generateInstallmentPayments(12, 800, '2024-04-01')
  },
  {
    id: '6',
    name: '孙女士',
    gender: 'female',
    phone: '13300133007',
    wechat: 'sun_lady',
    address: '武汉市武昌区中南路777号',
    occupation: '教师',
    customerType: 'installment',
    tags: ['教育工作者', '布偶猫', '温和性格'],
    notes: '小学教师，喜欢温和的布偶猫，希望能陪伴孩子成长',
    createdAt: '2024-04-01',
    assignedSales: 'Frank Zhou',
    files: [],
    orders: [],
    // 分期客户字段
    orderDate: '2024-04-01',
    contractName: '孙丽华',
    relationship: '本人',
    catName: '小温',
    catBirthday: '2024-02-01',
    catBreed: '布偶猫',
    catGender: 'female',
    isInGroup: false,
    supplyChain: '武汉猫舍',
    repaymentDate: '2024-04-10',
    installmentPeriod: '2024年4月-2024年9月',
    catCost: 9000,
    collectionAmount: 13500,
    fundsDestination: '微信',
    installmentAmount: 2250,
    installmentCount: 6,
    shippingFee: 250,
    signingMethod: '线上签约',
    isFirstPaymentManual: false,
    hasESignContract: false,
    contractTotalPrice: 13500,
    mallGrossProfit: 1200,
    grossProfit: 4250,
    profitRate: 31.48,
    monthlyProfit: 708.33,
    breakEvenPeriod: 5,
    installmentPayments: generateInstallmentPayments(6, 2250, '2024-04-10')
  },
  {
    id: '7',
    name: '周先生',
    gender: 'male',
    phone: '13200132008',
    wechat: 'zhou_sir',
    address: '西安市雁塔区高新路555号',
    occupation: '工程师',
    customerType: 'installment',
    tags: ['技术人员', '俄蓝', '安静性格'],
    notes: '软件工程师，喜欢安静的俄罗斯蓝猫，适合居家办公',
    createdAt: '2024-04-10',
    assignedSales: 'Grace Wu',
    files: [],
    orders: [],
    // 分期客户字段
    orderDate: '2024-04-10',
    contractName: '周志强',
    relationship: '本人',
    catName: '小蓝',
    catBirthday: '2024-01-15',
    catBreed: '俄罗斯蓝猫',
    catGender: 'male',
    isInGroup: true,
    supplyChain: '西安猫舍',
    repaymentDate: '2024-04-20',
    installmentPeriod: '2024年4月-2025年1月',
    catCost: 7500,
    collectionAmount: 11250,
    fundsDestination: '银行卡',
    installmentAmount: 1125,
    installmentCount: 10,
    shippingFee: 300,
    signingMethod: '线上签约',
    isFirstPaymentManual: true,
    hasESignContract: true,
    contractTotalPrice: 11250,
    mallGrossProfit: 900,
    grossProfit: 3450,
    profitRate: 30.67,
    monthlyProfit: 345.0,
    breakEvenPeriod: 7,
    installmentPayments: generateInstallmentPayments(10, 1125, '2024-04-20')
  },
  {
    id: '8',
    name: '马女士',
    gender: 'female',
    phone: '13100131009',
    wechat: 'ma_lady',
    address: '天津市和平区南京路888号',
    occupation: '律师',
    customerType: 'installment',
    tags: ['高收入', '波斯猫', '品质追求'],
    notes: '律师职业，收入稳定，对猫咪品质要求很高',
    createdAt: '2024-04-15',
    assignedSales: 'Henry Zhang',
    files: [],
    orders: [],
    // 分期客户字段
    orderDate: '2024-04-15',
    contractName: '马丽娟',
    relationship: '本人',
    catName: '小贵',
    catBirthday: '2024-02-10',
    catBreed: '波斯猫',
    catGender: 'female',
    isInGroup: true,
    supplyChain: '天津猫舍',
    repaymentDate: '2024-05-01',
    installmentPeriod: '2024年5月-2025年4月',
    catCost: 12000,
    collectionAmount: 18000,
    fundsDestination: '支付宝',
    installmentAmount: 1500,
    installmentCount: 12,
    shippingFee: 400,
    signingMethod: '线下签约',
    isFirstPaymentManual: false,
    hasESignContract: true,
    contractTotalPrice: 18000,
    mallGrossProfit: 1500,
    grossProfit: 5600,
    profitRate: 31.11,
    monthlyProfit: 466.67,
    breakEvenPeriod: 8,
    installmentPayments: generateInstallmentPayments(12, 1500, '2024-05-01')
  },
  {
    id: '9',
    name: '黄先生',
    gender: 'male',
    phone: '13000130010',
    wechat: 'huang_sir',
    address: '重庆市渝中区解放碑999号',
    occupation: '金融分析师',
    customerType: 'retail',
    tags: ['金融行业', '缅因猫', '投资理念'],
    notes: '金融分析师，理性消费，看重猫咪的投资价值',
    createdAt: '2024-04-20',
    assignedSales: 'Ivy Wang',
    files: [],
    orders: [],
    // 零售客户字段
    orderDate: '2024-04-20',
    salesPerson: 'Ivy Wang',
    catName: '投资',
    catBirthday: '2024-01-20',
    isMallMember: true,
    catBreed: '缅因猫',
    catGender: 'male',
    supplyChain: '重庆猫舍',
    supplyChainDeposit: 4000,
    totalAmount: 20000,
    paymentMethod: 'cash_on_delivery',
    customerDeposit: 8000,
    depositDestination: '银行卡',
    shippingDate: '2024-04-30',
    balance: 12000,
    balancePaid: false,
    balanceConfirmMethod: '货到付款',
    sellingPrice: 20000,
    cost: 12000,
    shippingFee: 400,
    profit: 7600,
    profitRate: 38.0
  },
  {
    id: '10',
    name: '林女士',
    gender: 'female',
    phone: '12900129011',
    wechat: 'lin_lady',
    address: '南京市鼓楼区中山路777号',
    occupation: '设计师',
    customerType: 'retail',
    tags: ['创意工作者', '英短', '颜值控'],
    notes: '室内设计师，对美的要求很高，喜欢颜值高的猫咪',
    createdAt: '2024-04-25',
    assignedSales: 'Jack Liu',
    files: [],
    orders: [],
    // 零售客户字段
    orderDate: '2024-04-25',
    salesPerson: 'Jack Liu',
    catName: '美美',
    catBirthday: '2024-02-14',
    isMallMember: false,
    catBreed: '英国短毛猫',
    catGender: 'female',
    supplyChain: '南京猫舍',
    supplyChainDeposit: 2500,
    totalAmount: 10000,
    paymentMethod: 'shipping_balance',
    customerDeposit: 3000,
    depositDestination: '微信',
    shippingDate: '2024-05-05',
    balance: 7000,
    balancePaid: true,
    balanceConfirmMethod: '微信转账',
    sellingPrice: 10000,
    cost: 6000,
    shippingFee: 250,
    profit: 3750,
    profitRate: 37.5
  },
  {
    id: '11',
    name: '吴总',
    gender: 'male',
    phone: '12800128012',
    wechat: 'wu_boss',
    address: '苏州市工业园区星海街666号',
    occupation: '企业高管',
    customerType: 'retail',
    tags: ['企业高管', '布偶猫', '高端需求'],
    notes: '企业高管，时间宝贵，希望一站式服务',
    createdAt: '2024-05-01',
    assignedSales: 'Kelly Chen',
    files: [],
    orders: [],
    // 零售客户字段
    orderDate: '2024-05-01',
    salesPerson: 'Kelly Chen',
    catName: '总裁',
    catBirthday: '2024-02-20',
    isMallMember: true,
    catBreed: '布偶猫',
    catGender: 'male',
    supplyChain: '苏州猫舍',
    supplyChainDeposit: 3500,
    totalAmount: 16000,
    paymentMethod: 'full_payment',
    customerDeposit: 16000,
    depositDestination: '银行卡',
    shippingDate: '2024-05-10',
    balance: 0,
    balancePaid: true,
    balanceConfirmMethod: '银行转账',
    sellingPrice: 16000,
    cost: 10000,
    shippingFee: 350,
    profit: 5650,
    profitRate: 35.31
  },
  {
    id: '12',
    name: '刘小姐',
    gender: 'female',
    phone: '13500135005',
    wechat: 'liu_miss',
    address: '杭州市西湖区文三路666号',
    occupation: '程序员',
    customerType: 'installment',
    tags: ['技术宅', '美短', '理性消费'],
    notes: '程序员，工作忙碌，希望养一只安静的美短陪伴',
    createdAt: '2024-03-10',
    assignedSales: 'Alice Chen',
    files: [],
    orders: [],
    // 分期客户字段
    orderDate: '2024-03-10',
    contractName: '刘雨薇',
    relationship: '本人',
    catName: '代码',
    catBirthday: '2024-01-05',
    catBreed: '美国短毛猫',
    catGender: 'female',
    isInGroup: false,
    supplyChain: '杭州猫舍',
    repaymentDate: '2024-03-20',
    installmentPeriod: '2024年3月-2024年10月',
    catCost: 5500,
    collectionAmount: 8250,
    fundsDestination: '支付宝',
    installmentAmount: 1031.25,
    installmentCount: 8,
    shippingFee: 200,
    signingMethod: '线上签约',
    isFirstPaymentManual: true,
    hasESignContract: true,
    contractTotalPrice: 8250,
    mallGrossProfit: 650,
    grossProfit: 2550,
    profitRate: 30.91,
    monthlyProfit: 318.75,
    breakEvenPeriod: 6,
    installmentPayments: generateInstallmentPayments(8, 1031.25, '2024-03-20')
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
    customerId: '4',
    orderNumber: 'ORD-2024-002',
    amount: 12000,
    paymentMethod: 'installment',
    status: 'paid',
    orderDate: '2024-02-10',
    salesPerson: 'Alice Chen',
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
    customerId: '12',
    orderNumber: 'ORD-2024-003',
    amount: 8250,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-03-05',
    salesPerson: 'Alice Chen',
    products: [
      {
        id: '4',
        name: '橘色美短',
        breed: '美国短毛猫',
        price: 8250,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
      }
    ]
  },
  // Bob Wang 的订单
  {
    id: '4',
    customerId: '2',
    orderNumber: 'ORD-2024-004',
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
  // Carol Li 的订单
  {
    id: '5',
    customerId: '3',
    orderNumber: 'ORD-2024-005',
    amount: 25000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-03-10',
    salesPerson: 'Carol Li',
    products: [
      {
        id: '5',
        name: '银色缅因猫',
        breed: '缅因猫',
        price: 25000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg'
      }
    ]
  },
  // Emma Liu 的订单
  {
    id: '6',
    customerId: '5',
    orderNumber: 'ORD-2024-006',
    amount: 9600,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-03-25',
    salesPerson: 'Emma Liu',
    products: [
      {
        id: '1',
        name: '银渐层英短',
        breed: '英国短毛猫',
        price: 9600,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
      }
    ]
  },
  // Frank Zhou 的订单
  {
    id: '7',
    customerId: '6',
    orderNumber: 'ORD-2024-007',
    amount: 13500,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-04-05',
    salesPerson: 'Frank Zhou',
    products: [
      {
        id: '2',
        name: '蓝双色布偶猫',
        breed: '布偶猫',
        price: 13500,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'
      }
    ]
  },
  // Grace Wu 的订单
  {
    id: '8',
    customerId: '7',
    orderNumber: 'ORD-2024-008',
    amount: 11250,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-04-12',
    salesPerson: 'Grace Wu',
    products: [
      {
        id: '6',
        name: '蓝色俄罗斯蓝猫',
        breed: '俄罗斯蓝猫',
        price: 11250,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
      }
    ]
  },
  // Henry Zhang 的订单
  {
    id: '9',
    customerId: '8',
    orderNumber: 'ORD-2024-009',
    amount: 18000,
    paymentMethod: 'installment',
    status: 'completed',
    orderDate: '2024-04-18',
    salesPerson: 'Henry Zhang',
    products: [
      {
        id: '3',
        name: '金吉拉波斯猫',
        breed: '波斯猫',
        price: 18000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg'
      }
    ]
  },
  // Ivy Wang 的订单
  {
    id: '10',
    customerId: '9',
    orderNumber: 'ORD-2024-010',
    amount: 20000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-04-22',
    salesPerson: 'Ivy Wang',
    products: [
      {
        id: '5',
        name: '银色缅因猫',
        breed: '缅因猫',
        price: 20000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg'
      }
    ]
  },
  // Jack Liu 的订单
  {
    id: '11',
    customerId: '10',
    orderNumber: 'ORD-2024-011',
    amount: 10000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-04-28',
    salesPerson: 'Jack Liu',
    products: [
      {
        id: '1',
        name: '银渐层英短',
        breed: '英国短毛猫',
        price: 10000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
      }
    ]
  },
  // Kelly Chen 的订单
  {
    id: '12',
    customerId: '11',
    orderNumber: 'ORD-2024-012',
    amount: 16000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-05-02',
    salesPerson: 'Kelly Chen',
    products: [
      {
        id: '7',
        name: '海双色布偶猫',
        breed: '布偶猫',
        price: 16000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'
      }
    ]
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

// 模拟知识库数据
const mockKnowledgeBase: KnowledgeBase[] = [
  {
    id: '1',
    question: '如何选择适合的猫咪品种？',
    answer: '选择猫咪品种需要考虑以下几个因素：\n\n1. **生活空间大小**：大型猫咪如缅因猫需要更大的活动空间，小户型适合选择体型较小的品种。\n\n2. **家庭成员情况**：有小孩的家庭建议选择性格温和的品种如布偶猫、英短等。\n\n3. **护理时间**：长毛猫需要每天梳理，短毛猫相对容易打理。\n\n4. **预算考虑**：不同品种价格差异较大，需要根据预算选择。\n\n5. **性格偏好**：有些品种活泼好动，有些则安静温顺。',
    category: '选购指南',
    tags: ['品种选择', '新手指南', '家庭养猫'],
    images: [
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
    ],
    viewCount: 156,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '1'
  },
  {
    id: '2',
    question: '猫咪疫苗接种时间表是什么？',
    answer: '幼猫疫苗接种时间表如下：\n\n**首次免疫（8-10周龄）**\n- 猫三联疫苗（预防猫瘟、猫杯状病毒、猫鼻气管炎）\n\n**第二次免疫（12-14周龄）**\n- 猫三联疫苗加强\n- 狂犬病疫苗\n\n**第三次免疫（16-18周龄）**\n- 猫三联疫苗再次加强\n\n**成年后**\n- 每年接种一次猫三联疫苗\n- 每年接种一次狂犬病疫苗\n\n**注意事项：**\n- 疫苗接种前需确保猫咪健康\n- 接种后观察是否有不良反应\n- 按时接种，不要延误',
    category: '健康护理',
    tags: ['疫苗', '健康', '幼猫', '免疫'],
    images: [],
    viewCount: 89,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    createdBy: '1'
  },
  {
    id: '3',
    question: '新猫到家后的适应期注意事项',
    answer: '新猫到家后需要特别关注以下几个方面：\n\n**环境准备**\n- 准备安静的房间让猫咪适应\n- 放置猫砂盆、食盆、水盆\n- 提供躲藏空间（纸箱、猫窝等）\n\n**饮食管理**\n- 前几天保持原有饮食习惯\n- 逐渐更换猫粮，避免肠胃不适\n- 保证充足的饮水\n\n**健康观察**\n- 观察食欲、精神状态\n- 注意排便情况\n- 如有异常及时就医\n\n**互动方式**\n- 给猫咪足够的时间适应\n- 避免强迫互动\n- 用温和的声音和缓慢的动作',
    category: '饲养技巧',
    tags: ['新猫', '适应期', '环境', '饮食'],
    images: [
      'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
    ],
    viewCount: 234,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    createdBy: '2'
  },
  {
    id: '4',
    question: '布偶猫的特点和饲养要点',
    answer: '布偶猫是一种大型长毛猫，具有以下特点：\n\n**外观特征**\n- 体型大，成年公猫可达8-10公斤\n- 毛发长而柔软，需要定期梳理\n- 眼睛蓝色，表情温和\n- 毛色多样：双色、重点色、手套色等\n\n**性格特点**\n- 性格温顺，很少攻击性行为\n- 喜欢与人互动，适合家庭饲养\n- 对疼痛敏感度较低\n- 适应能力强\n\n**饲养要点**\n- 每天梳毛，防止毛发打结\n- 定期洗澡，保持毛发清洁\n- 提供足够的活动空间\n- 注意控制体重，避免过度肥胖',
    category: '品种介绍',
    tags: ['布偶猫', '长毛猫', '大型猫', '性格温顺'],
    images: [
      'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'
    ],
    viewCount: 178,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    createdBy: '1'
  },
  {
    id: '5',
    question: '猫咪常见疾病预防',
    answer: '预防猫咪常见疾病需要注意以下几个方面：\n\n**疫苗接种**\n- 按时接种猫三联疫苗\n- 每年接种狂犬病疫苗\n- 根据地区情况考虑其他疫苗\n\n**寄生虫防治**\n- 定期驱虫（体内外寄生虫）\n- 保持环境清洁\n- 避免接触流浪猫\n\n**口腔护理**\n- 定期刷牙或使用洁牙零食\n- 观察牙龈健康状况\n- 及时处理口腔问题\n\n**定期体检**\n- 每年至少体检一次\n- 老年猫增加体检频率\n- 及时发现和治疗疾病',
    category: '健康护理',
    tags: ['疾病预防', '疫苗', '驱虫', '体检'],
    images: [],
    viewCount: 145,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    createdBy: '3'
  }
];

// 模拟考勤数据
const generateAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const userIds = ['1', '2', '3', '4', '5', '6', '7'];
  
  // 生成过去30天的考勤记录
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    userIds.forEach((userId) => {
      const random = Math.random();
      let status: AttendanceRecord['status'];
      let checkInTime: string | undefined;
      let checkOutTime: string | undefined;
      let notes = '';
      
      if (random < 0.7) { // 70% 正常出勤
        status = 'present';
        checkInTime = new Date(date.getTime() + 8 * 60 * 60 * 1000 + Math.random() * 30 * 60 * 1000).toISOString();
        checkOutTime = new Date(date.getTime() + 17 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000).toISOString();
        notes = '正常出勤';
      } else if (random < 0.85) { // 15% 迟到
        status = 'late';
        checkInTime = new Date(date.getTime() + 9 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000).toISOString();
        checkOutTime = new Date(date.getTime() + 17 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000).toISOString();
        notes = '迟到';
      } else if (random < 0.95) { // 10% 早退
        status = 'early_leave';
        checkInTime = new Date(date.getTime() + 8 * 60 * 60 * 1000 + Math.random() * 30 * 60 * 1000).toISOString();
        checkOutTime = new Date(date.getTime() + 16 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000).toISOString();
        notes = '早退';
      } else { // 5% 缺勤
        status = 'absent';
        notes = '请假';
      }
      
      records.push({
        id: `${userId}-${dateString}`,
        userId,
        date: dateString,
        checkInTime,
        checkOutTime,
        status,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }
  
  return records;
};

const mockAttendanceRecords = generateAttendanceData();

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
    createdBy: '5',
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
    customerId: '4',
    type: 'health_consultation',
    status: 'completed',
    priority: 'high',
    title: '猫咪饮食咨询',
    description: '客户咨询布偶猫的饮食搭配和营养需求',
    solution: '已提供详细的饮食指南，推荐了适合的猫粮品牌和喂养频次。建议幼猫期每天3-4次，成年后改为2次。',
    assignedTo: 'David Zhang',
    createdBy: '5',
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
    createdBy: '5',
    scheduledDate: '2024-03-01',
    followUpRequired: false,
    attachments: [],
    tags: ['上门服务', '健康检查'],
    createdAt: '2024-02-25T14:00:00Z',
    updatedAt: '2024-02-25T14:00:00Z'
  },
  {
    id: '4',
    orderId: '4',
    customerId: '2',
    type: 'complaint',
    status: 'in_progress',
    priority: 'urgent',
    title: '猫咪健康问题投诉',
    description: '客户反映波斯猫出现轻微眼部分泌物增多的情况',
    assignedTo: 'David Zhang',
    createdBy: '5',
    scheduledDate: '2024-03-05',
    followUpRequired: true,
    attachments: ['眼部照片1.jpg', '眼部照片2.jpg'],
    tags: ['健康问题', '眼部护理', '紧急处理'],
    createdAt: '2024-03-04T11:30:00Z',
    updatedAt: '2024-03-04T18:20:00Z'
  },
  {
    id: '5',
    orderId: '6',
    customerId: '5',
    type: 'phone_visit',
    status: 'completed',
    priority: 'medium',
    title: '分期客户回访',
    description: '分期购买客户的定期回访，了解还款情况和猫咪状态',
    solution: '客户还款正常，猫咪健康状况良好，客户满意度很高。',
    assignedTo: 'David Zhang',
    createdBy: '5',
    scheduledDate: '2024-04-01',
    completedDate: '2024-04-01',
    customerSatisfaction: 5,
    followUpRequired: true,
    followUpDate: '2024-05-01',
    attachments: [],
    tags: ['分期客户', '定期回访', '还款正常'],
    createdAt: '2024-03-28T09:00:00Z',
    updatedAt: '2024-04-01T17:30:00Z'
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
  },
  {
    id: '4',
    name: '投诉处理流程',
    type: 'complaint',
    description: '处理客户投诉和问题反馈',
    defaultPriority: 'urgent',
    estimatedDuration: 45,
    checklist: [
      '详细记录投诉内容',
      '分析问题原因',
      '制定解决方案',
      '与客户沟通确认',
      '跟进处理结果'
    ],
    isActive: true
  },
  {
    id: '5',
    name: '分期客户跟进',
    type: 'phone_visit',
    description: '分期付款客户的定期跟进服务',
    defaultPriority: 'medium',
    estimatedDuration: 20,
    checklist: [
      '确认还款情况',
      '了解猫咪状态',
      '收集客户反馈',
      '提醒下次还款',
      '记录跟进结果'
    ],
    isActive: true
  }
];

// 模拟公告数据
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '系统更新通知',
    content: '系统将于本周六凌晨2点-4点进行例行维护，期间系统将暂停使用。请各位同事提前做好工作安排。',
    visible_to: 'all',
    priority: 'important',
    created_by: '1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: '销售人员培训通知',
    content: '下周三下午2点将在会议室举行新品种介绍培训，请所有销售人员准时参加。',
    visible_to: 'sales',
    priority: 'normal',
    created_by: '1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: '售后服务流程更新',
    content: '售后服务流程已更新，请所有售后专员查看最新的服务手册，并按照新流程执行工作。\n\n重点变更：\n1. 回访时间调整为购买后3天、7天、30天\n2. 新增满意度调查环节\n3. 健康咨询需在2小时内响应',
    visible_to: 'after_sales',
    priority: 'urgent',
    created_by: '1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    title: '春节放假通知',
    content: '根据国家法定节假日安排，春节放假时间为2月10日至2月17日，共8天。期间如有紧急情况，请联系值班人员。',
    visible_to: 'all',
    priority: 'important',
    created_by: '1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    title: '新品种猫咪到店通知',
    content: '本周将有一批新的布偶猫和英短到店，品质优良，血统纯正。请销售人员做好接待准备，详细了解每只猫咪的特点和卖点。',
    visible_to: 'sales',
    priority: 'normal',
    created_by: '1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// 模拟销售业绩数据
const generateSalesPerformanceData = (): SalesPerformance[] => {
  const data: SalesPerformance[] = [];
  const salesPeople = [
    { id: '2', name: 'Alice Chen', teamId: 'team-1', teamName: '销售一组' },
    { id: '3', name: 'Bob Wang', teamId: 'team-1', teamName: '销售一组' },
    { id: '4', name: 'Carol Li', teamId: 'team-2', teamName: '销售二组' },
    { id: '6', name: 'Emma Liu', teamId: 'team-1', teamName: '销售一组' },
    { id: '7', name: 'Frank Zhou', teamId: 'team-2', teamName: '销售二组' },
    { id: '8', name: 'Grace Wu', teamId: 'team-2', teamName: '销售二组' },
    { id: '9', name: 'Henry Zhang', teamId: 'team-1', teamName: '销售一组' },
    { id: '10', name: 'Ivy Wang', teamId: 'team-2', teamName: '销售二组' },
    { id: '11', name: 'Jack Liu', teamId: 'team-1', teamName: '销售一组' },
    { id: '12', name: 'Kelly Chen', teamId: 'team-2', teamName: '销售二组' }
  ];

  // 生成过去90天的数据
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    salesPeople.forEach(person => {
      // 根据销售员和日期生成一致的随机数据
      const seed = person.id.charCodeAt(0) + date.getDate() + date.getMonth();
      const randomFactor = Math.sin(seed) * 0.5 + 0.5;
      
      const traffic = Math.floor(10 + randomFactor * 40);
      const orders = Math.floor(randomFactor * traffic * 0.25);
      const avgOrderValue = 8000 + randomFactor * 12000;
      const revenue = orders * avgOrderValue;

      data.push({
        date: dateString,
        salesId: person.id,
        salesName: person.name,
        teamId: person.teamId,
        teamName: person.teamName,
        traffic,
        orders,
        revenue
      });
    });
  }

  return data;
};

const mockSalesPerformance = generateSalesPerformanceData();

// 通用的 Hook 模式
function useAsyncData<T>(
  mockData: T,
  asyncFn?: () => Promise<T>
) {
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isDatabaseConnected && asyncFn) {
          const result = await asyncFn();
          setData(result);
        } else {
          // 模拟加载延迟
          await new Promise(resolve => setTimeout(resolve, 500));
          setData(mockData);
        }
      } catch (err) {
        console.error('数据加载失败:', err);
        setError(err instanceof Error ? err.message : '数据加载失败');
        setData(mockData); // 失败时使用模拟数据
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error, setData };
}

// 客户数据 Hook
export const useCustomers = () => {
  const { data: customers, loading, error, setData: setCustomers } = useAsyncData(mockCustomers);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerData,
      createdAt: new Date().toISOString().split('T')[0],
      files: [],
      orders: []
    };
    
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = async (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId 
        ? { ...customer, ...customerData }
        : customer
    ));
  };

  const deleteCustomer = async (customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
  };

  return { 
    customers, 
    loading, 
    error, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer 
  };
};

// 客户文件 Hook
export const useCustomerFiles = () => {
  const addCustomerFile = async (customerId: string, fileData: Omit<CustomerFile, 'id' | 'uploadedAt'>) => {
    const newFile: CustomerFile = {
      id: Date.now().toString(),
      ...fileData,
      uploadedAt: new Date().toISOString()
    };
    
    // 这里应该更新客户的文件列表
    // 由于我们使用模拟数据，这里只是返回新文件
    return newFile;
  };

  return { addCustomerFile };
};

// 订单数据 Hook
export const useOrders = () => {
  const { data: orders, loading, error } = useAsyncData(mockOrders);
  return { orders, loading, error };
};

// 产品数据 Hook
export const useProducts = () => {
  const { data: products, loading, error } = useAsyncData(mockProducts);
  return { products, loading, error };
};

// 知识库数据 Hook
export const useKnowledgeBase = () => {
  const { data: knowledgeBase, loading, error, setData: setKnowledgeBase } = useAsyncData(mockKnowledgeBase);

  const addKnowledge = async (knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    const newKnowledge: KnowledgeBase = {
      id: Date.now().toString(),
      ...knowledgeData,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setKnowledgeBase(prev => [newKnowledge, ...prev]);
    return newKnowledge;
  };

  const updateKnowledge = async (knowledgeId: string, knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    setKnowledgeBase(prev => prev.map(kb => 
      kb.id === knowledgeId 
        ? { ...kb, ...knowledgeData, updatedAt: new Date().toISOString() }
        : kb
    ));
  };

  const deleteKnowledge = async (knowledgeId: string) => {
    setKnowledgeBase(prev => prev.filter(kb => kb.id !== knowledgeId));
  };

  return { 
    knowledgeBase, 
    loading, 
    error, 
    addKnowledge, 
    updateKnowledge, 
    deleteKnowledge 
  };
};

// 考勤数据 Hook
export const useAttendance = () => {
  const { data: attendanceRecords, loading, error, setData: setAttendanceRecords } = useAsyncData(mockAttendanceRecords);

  const addAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      ...attendanceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setAttendanceRecords(prev => [newRecord, ...prev.filter(
      record => !(record.userId === attendanceData.userId && record.date === attendanceData.date)
    )]);
    return newRecord;
  };

  const updateAttendance = async (recordId: string, attendanceData: AttendanceRecord) => {
    setAttendanceRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...attendanceData, updatedAt: new Date().toISOString() }
        : record
    ));
  };

  return { 
    attendanceRecords, 
    loading, 
    error, 
    addAttendance, 
    updateAttendance 
  };
};

// 售后服务记录 Hook
export const useAfterSalesRecords = () => {
  const { data: afterSalesRecords, loading, error, setData: setAfterSalesRecords } = useAsyncData(mockAfterSalesRecords);

  const addAfterSalesRecord = async (recordData: Omit<AfterSalesRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: AfterSalesRecord = {
      id: Date.now().toString(),
      ...recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setAfterSalesRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const updateAfterSalesRecord = async (recordId: string, recordData: Partial<AfterSalesRecord>) => {
    setAfterSalesRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, ...recordData, updatedAt: new Date().toISOString() }
        : record
    ));
  };

  const deleteAfterSalesRecord = async (recordId: string) => {
    setAfterSalesRecords(prev => prev.filter(record => record.id !== recordId));
  };

  return { 
    afterSalesRecords, 
    loading, 
    error, 
    addAfterSalesRecord, 
    updateAfterSalesRecord, 
    deleteAfterSalesRecord 
  };
};

// 服务模板 Hook
export const useServiceTemplates = () => {
  const { data: serviceTemplates, loading, error } = useAsyncData(mockServiceTemplates);
  return { serviceTemplates, loading, error };
};

// 公告数据 Hook
export const useAnnouncements = () => {
  const { user } = useAuth();
  const { data: announcements, loading, error, setData: setAnnouncements } = useAsyncData(mockAnnouncements);

  // 根据用户角色过滤公告
  const filteredAnnouncements = announcements.filter(announcement => {
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    if (announcement.visible_to === 'all') return true;
    
    return announcement.visible_to === user.role;
  });

  const addAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      ...announcementData,
      created_by: user?.id || '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    return newAnnouncement;
  };

  const updateAnnouncement = async (announcementId: string, announcementData: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === announcementId 
        ? { ...announcement, ...announcementData, updated_at: new Date().toISOString() }
        : announcement
    ));
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
  };

  return { 
    announcements: filteredAnnouncements, 
    loading, 
    error, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement 
  };
};

// 销售业绩数据 Hook
export const useSalesPerformance = () => {
  const { data: salesPerformance, loading, error } = useAsyncData(mockSalesPerformance);
  return { salesPerformance, loading, error };
};