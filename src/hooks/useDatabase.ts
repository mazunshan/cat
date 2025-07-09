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
  InstallmentPayment
} from '../types';

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

// 模拟客户数据
const mockCustomers: Customer[] = [
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
    id: '3',
    name: '王女士',
    gender: 'female',
    phone: '13700137003',
    wechat: 'wang_lady',
    address: '广州市天河区珠江新城789号',
    occupation: '市场经理',
    customerType: 'installment',
    tags: ['高端客户', '波斯猫', '多只购买'],
    notes: '有养猫经验，希望购买2-3只高品质波斯猫',
    createdAt: '2024-03-01',
    assignedSales: 'Bob Wang',
    files: [],
    orders: [],
    // 分期客户字段
    orderDate: '2024-03-01',
    contractName: '王丽',
    relationship: '本人',
    catName: '小波',
    catBirthday: '2023-12-01',
    catBreed: '波斯猫',
    catGender: 'female',
    isInGroup: true,
    supplyChain: '广州猫舍',
    repaymentDate: '2024-03-10',
    installmentPeriod: '2024年3月-2025年2月',
    catCost: 12000,
    collectionAmount: 18000,
    fundsDestination: '支付宝',
    installmentAmount: 1500,
    installmentCount: 12,
    shippingFee: 400,
    signingMethod: '线下签约',
    isFirstPaymentManual: true,
    hasESignContract: true,
    contractTotalPrice: 18000,
    mallGrossProfit: 1500,
    grossProfit: 5600,
    profitRate: 31.11,
    monthlyProfit: 466.67,
    breakEvenPeriod: 8,
    installmentPayments: generateInstallmentPayments(12, 1500, '2024-03-10')
  }
];

// 模拟订单数据
const mockOrders: Order[] = [
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
  }
];

// 模拟产品数据
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
    quarantineVideos: [],
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
    quarantineVideos: [],
    isAvailable: true,
    features: ['CFA认证', '父母均有证书', '毛色标准', '性格亲人']
  }
];

// 模拟知识库数据
const mockKnowledgeBase: KnowledgeBase[] = [
  {
    id: '1',
    question: '如何选择适合的猫咪品种？',
    answer: '选择猫咪品种需要考虑以下几个因素：\n\n1. **生活空间大小**：大型猫咪如缅因猫需要更大的活动空间，小户型适合选择体型较小的品种。\n\n2. **家庭成员情况**：有小孩的家庭建议选择性格温和的品种如布偶猫、英短等。',
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
    answer: '幼猫疫苗接种时间表如下：\n\n**首次免疫（8-10周龄）**\n- 猫三联疫苗（预防猫瘟、猫杯状病毒、猫鼻气管炎）\n\n**第二次免疫（12-14周龄）**\n- 猫三联疫苗加强\n- 狂犬病疫苗',
    category: '健康护理',
    tags: ['疫苗', '健康', '幼猫', '免疫'],
    images: [],
    viewCount: 89,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    createdBy: '1'
  }
];

// 模拟考勤数据
const generateAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const userIds = ['1', '2', '3'];
  
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
    title: '购买后回访',
    description: '客户购买银渐层英短后的例行回访，了解猫咪适应情况',
    solution: '猫咪适应良好，客户满意度很高，提供了一些日常护理建议',
    assignedTo: 'David Zhang',
    createdBy: '3',
    scheduledDate: '2024-02-05T10:00:00Z',
    completedDate: '2024-02-05T10:30:00Z',
    customerSatisfaction: 5,
    followUpRequired: false,
    attachments: [],
    tags: ['回访', '满意'],
    createdAt: '2024-02-03T08:00:00Z',
    updatedAt: '2024-02-05T10:30:00Z'
  }
];

// 模拟服务模板
const mockServiceTemplates: ServiceTemplate[] = [
  {
    id: '1',
    name: '购买后回访',
    type: 'phone_visit',
    description: '客户购买后的例行回访，了解猫咪适应情况',
    defaultPriority: 'medium',
    estimatedDuration: 15,
    checklist: [
      '询问猫咪健康状况',
      '了解饮食情况',
      '检查是否有不适应症状',
      '提供护理建议',
      '记录客户反馈'
    ],
    isActive: true
  },
  {
    id: '2',
    name: '健康咨询',
    type: 'health_consultation',
    description: '为客户提供猫咪健康相关的专业咨询',
    defaultPriority: 'high',
    estimatedDuration: 30,
    checklist: [
      '了解症状描述',
      '询问发病时间',
      '检查疫苗记录',
      '提供初步建议',
      '必要时推荐就医'
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
    { id: '8', name: 'Grace Wu', teamId: 'team-2', teamName: '销售二组' }
  ];

  // 生成过去30天的数据
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    salesPeople.forEach(person => {
      const traffic = Math.floor(Math.random() * 50) + 10;
      const orders = Math.floor(Math.random() * 8) + 1;
      const revenue = orders * (Math.floor(Math.random() * 5000) + 3000);

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
  const { data: announcements, loading, error, setData: setAnnouncements } = useAsyncData(mockAnnouncements);

  const addAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      ...announcementData,
      created_by: '1', // 假设当前用户ID为1
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
    announcements, 
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

// 销售业绩分析 Hook
export const useSalesAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get summary data for sales performance
  const getSummaryData = (startDate: string, endDate: string) => {
    // Mock data for sales summary - in a real app this would come from the database
    const salesSummary = [
      {
        salesId: '1',
        salesName: '张三',
        totalTraffic: 150,
        totalOrders: 25,
        totalRevenue: 125000,
        conversionRate: 16.7
      },
      {
        salesId: '2',
        salesName: '李四',
        totalTraffic: 120,
        totalOrders: 18,
        totalRevenue: 98000,
        conversionRate: 15.0
      },
      {
        salesId: '3',
        salesName: '王五',
        totalTraffic: 100,
        totalOrders: 15,
        totalRevenue: 75000,
        conversionRate: 15.0
      },
      {
        salesId: '4',
        salesName: '赵六',
        totalTraffic: 80,
        totalOrders: 12,
        totalRevenue: 60000,
        conversionRate: 15.0
      },
      {
        salesId: '5',
        salesName: '孙七',
        totalTraffic: 90,
        totalOrders: 10,
        totalRevenue: 45000,
        conversionRate: 11.1
      }
    ];

    const teamSummary = [
      {
        teamId: '1',
        teamName: '销售一组',
        totalTraffic: 300,
        totalOrders: 45,
        totalRevenue: 250000,
        conversionRate: 15.0
      },
      {
        teamId: '2',
        teamName: '销售二组',
        totalTraffic: 280,
        totalOrders: 38,
        totalRevenue: 220000,
        conversionRate: 13.6
      },
      {
        teamId: '3',
        teamName: '销售三组',
        totalTraffic: 200,
        totalOrders: 25,
        totalRevenue: 180000,
        conversionRate: 12.5
      }
    ];

    return {
      salesSummary,
      teamSummary
    };
  };

  const fetchSalesPerformance = async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 这里应该是实际的API调用
      // const response = await api.getSalesPerformance(startDate, endDate);
      
      // 返回模拟数据
      return mockSalesPerformance.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取销售业绩数据失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getSummaryData,
    fetchSalesPerformance
  };
};