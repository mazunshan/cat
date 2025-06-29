import { useState, useEffect } from 'react';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord, AfterSalesRecord, ServiceTemplate, CustomerFeedback, QuarantineVideo } from '../types';

// 模拟客户数据 - 确保在整个应用中保持一致
const mockCustomers: Customer[] = [
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
    files: [],
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
    address: '广州市天河区珠江新城789号',
    occupation: '市场经理',
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
    status: 'shipped',
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
    customerId: '3',
    orderNumber: 'ORD-2024-003',
    amount: 15000,
    paymentMethod: 'full',
    status: 'completed',
    orderDate: '2024-03-01',
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

// 全局状态管理 - 确保数据一致性
let globalCustomers = [...mockCustomers];
let globalProducts = [...mockProducts];
let globalOrders = [...mockOrders];
let globalKnowledgeBase: KnowledgeBase[] = [];
let globalAttendanceRecords: AttendanceRecord[] = [];
let globalAfterSalesRecords = [...mockAfterSalesRecords];
let globalServiceTemplates = [...mockServiceTemplates];

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
  const [orders, setOrders] = useState<Order[]>(globalOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrders([...globalOrders]);
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
    setOrders([...globalOrders]);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, addOrder, refetch: fetchOrders };
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

  const deleteProduct = async (productId: string) => {
    globalProducts = globalProducts.filter(product => product.id !== productId);
    setProducts([...globalProducts]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, addProduct, deleteProduct, refetch: fetchProducts };
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
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      ...attendanceData,
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
    const updatedRecord: AttendanceRecord = {
      ...attendanceData,
      id: recordId,
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