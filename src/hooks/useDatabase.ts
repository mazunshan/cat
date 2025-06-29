import { useState, useEffect } from 'react';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord } from '../types';

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

// 全局状态管理 - 确保数据一致性
let globalCustomers = [...mockCustomers];
let globalProducts = [...mockProducts];
let globalOrders = [...mockOrders];
let globalKnowledgeBase: KnowledgeBase[] = [];
let globalAttendanceRecords: AttendanceRecord[] = [];

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