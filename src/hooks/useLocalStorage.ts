import { useState, useEffect } from 'react';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord, User } from '../types';
import { storage } from '../lib/localStorage';

// 存储键名常量
const STORAGE_KEYS = {
  CUSTOMERS: 'cat_system_customers',
  ORDERS: 'cat_system_orders',
  PRODUCTS: 'cat_system_products',
  KNOWLEDGE: 'cat_system_knowledge',
  ATTENDANCE: 'cat_system_attendance',
  USERS: 'cat_system_users',
  SETTINGS: 'cat_system_settings'
};

// 初始化默认数据
const initializeDefaultData = () => {
  // 初始化用户数据
  if (!storage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: (User & { password: string })[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@catstore.com',
        role: 'admin',
        name: 'Administrator',
        isActive: true,
        createdAt: '2024-01-01',
        password: 'password123'
      },
      {
        id: '2',
        username: 'sales1',
        email: 'sales1@catstore.com',
        role: 'sales',
        name: 'Alice Chen',
        isActive: true,
        createdAt: '2024-01-15',
        password: 'password123'
      },
      {
        id: '3',
        username: 'aftersales1',
        email: 'aftersales1@catstore.com',
        role: 'after_sales',
        name: 'David Zhang',
        isActive: true,
        createdAt: '2024-03-01',
        password: 'password123'
      }
    ];
    storage.setItem(STORAGE_KEYS.USERS, defaultUsers);
  }

  // 初始化客户数据
  if (!storage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    const defaultCustomers: Customer[] = [
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
      }
    ];
    storage.setItem(STORAGE_KEYS.CUSTOMERS, defaultCustomers);
  }

  // 初始化产品数据
  if (!storage.getItem(STORAGE_KEYS.PRODUCTS)) {
    const defaultProducts: Product[] = [
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
      }
    ];
    storage.setItem(STORAGE_KEYS.PRODUCTS, defaultProducts);
  }

  // 初始化订单数据
  if (!storage.getItem(STORAGE_KEYS.ORDERS)) {
    const defaultOrders: Order[] = [
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
    storage.setItem(STORAGE_KEYS.ORDERS, defaultOrders);
  }

  // 初始化知识库数据
  if (!storage.getItem(STORAGE_KEYS.KNOWLEDGE)) {
    const defaultKnowledge: KnowledgeBase[] = [
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
    storage.setItem(STORAGE_KEYS.KNOWLEDGE, defaultKnowledge);
  }

  // 初始化考勤数据
  if (!storage.getItem(STORAGE_KEYS.ATTENDANCE)) {
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

    storage.setItem(STORAGE_KEYS.ATTENDANCE, generateAttendanceData());
  }
};

// 客户数据钩子
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDefaultData();
    const data = storage.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS) || [];
    setCustomers(data);
    setLoading(false);
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    const newCustomer: Customer = {
      id: storage.generateId(),
      ...customerData,
      createdAt: new Date().toISOString().split('T')[0],
      files: [],
      orders: []
    };
    
    const updatedCustomers = [newCustomer, ...customers];
    setCustomers(updatedCustomers);
    storage.setItem(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    return newCustomer;
  };

  const updateCustomer = async (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === customerId 
        ? { ...customer, ...customerData }
        : customer
    );
    setCustomers(updatedCustomers);
    storage.setItem(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
  };

  const deleteCustomer = async (customerId: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== customerId);
    setCustomers(updatedCustomers);
    storage.setItem(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
  };

  return { customers, loading, error, addCustomer, updateCustomer, deleteCustomer };
};

// 订单数据钩子
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDefaultData();
    const data = storage.getItem<Order[]>(STORAGE_KEYS.ORDERS) || [];
    setOrders(data);
    setLoading(false);
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => {
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: Order = {
      id: storage.generateId(),
      orderNumber,
      orderDate: new Date().toISOString().split('T')[0],
      ...orderData
    };
    
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    storage.setItem(STORAGE_KEYS.ORDERS, updatedOrders);
  };

  return { orders, loading, error, addOrder };
};

// 产品数据钩子
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDefaultData();
    const data = storage.getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
    setProducts(data);
    setLoading(false);
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: storage.generateId(),
      ...productData
    };
    
    const updatedProducts = [newProduct, ...products];
    setProducts(updatedProducts);
    storage.setItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
    return newProduct;
  };

  const deleteProduct = async (productId: string) => {
    const updatedProducts = products.filter(product => product.id !== productId);
    setProducts(updatedProducts);
    storage.setItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
  };

  return { products, loading, error, addProduct, deleteProduct };
};

// 知识库数据钩子
export const useKnowledgeBase = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDefaultData();
    const data = storage.getItem<KnowledgeBase[]>(STORAGE_KEYS.KNOWLEDGE) || [];
    setKnowledgeBase(data);
    setLoading(false);
  }, []);

  const addKnowledge = async (knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    const newKnowledge: KnowledgeBase = {
      id: storage.generateId(),
      ...knowledgeData,
      viewCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedKnowledge = [newKnowledge, ...knowledgeBase];
    setKnowledgeBase(updatedKnowledge);
    storage.setItem(STORAGE_KEYS.KNOWLEDGE, updatedKnowledge);
    return newKnowledge;
  };

  const updateKnowledge = async (knowledgeId: string, knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    const updatedKnowledge = knowledgeBase.map(kb => 
      kb.id === knowledgeId 
        ? { ...kb, ...knowledgeData, updatedAt: new Date().toISOString().split('T')[0] }
        : kb
    );
    setKnowledgeBase(updatedKnowledge);
    storage.setItem(STORAGE_KEYS.KNOWLEDGE, updatedKnowledge);
  };

  const deleteKnowledge = async (knowledgeId: string) => {
    const updatedKnowledge = knowledgeBase.filter(kb => kb.id !== knowledgeId);
    setKnowledgeBase(updatedKnowledge);
    storage.setItem(STORAGE_KEYS.KNOWLEDGE, updatedKnowledge);
  };

  return { knowledgeBase, loading, error, addKnowledge, updateKnowledge, deleteKnowledge };
};

// 考勤数据钩子
export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDefaultData();
    const data = storage.getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE) || [];
    setAttendanceRecords(data);
    setLoading(false);
  }, []);

  const addAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: AttendanceRecord = {
      id: storage.generateId(),
      ...attendanceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 更新或添加记录
    const existingIndex = attendanceRecords.findIndex(
      record => record.userId === attendanceData.userId && record.date === attendanceData.date
    );
    
    let updatedRecords;
    if (existingIndex !== -1) {
      updatedRecords = [...attendanceRecords];
      updatedRecords[existingIndex] = newRecord;
    } else {
      updatedRecords = [newRecord, ...attendanceRecords];
    }
    
    setAttendanceRecords(updatedRecords);
    storage.setItem(STORAGE_KEYS.ATTENDANCE, updatedRecords);
    return newRecord;
  };

  const updateAttendance = async (recordId: string, attendanceData: AttendanceRecord) => {
    const updatedRecords = attendanceRecords.map(record => 
      record.id === recordId 
        ? { ...attendanceData, updatedAt: new Date().toISOString() }
        : record
    );
    setAttendanceRecords(updatedRecords);
    storage.setItem(STORAGE_KEYS.ATTENDANCE, updatedRecords);
  };

  return { attendanceRecords, loading, error, addAttendance, updateAttendance };
};

// 用户数据钩子
export const useUsers = () => {
  const [users, setUsers] = useState<(User & { password: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDefaultData();
    const data = storage.getItem<(User & { password: string })[]>(STORAGE_KEYS.USERS) || [];
    setUsers(data);
    setLoading(false);
  }, []);

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => {
    const newUser = {
      id: storage.generateId(),
      ...userData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    storage.setItem(STORAGE_KEYS.USERS, updatedUsers);
    return newUser;
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, ...userData } : user
    );
    setUsers(updatedUsers);
    storage.setItem(STORAGE_KEYS.USERS, updatedUsers);
  };

  const deleteUser = async (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    storage.setItem(STORAGE_KEYS.USERS, updatedUsers);
  };

  return { users, loading, error, addUser, updateUser, deleteUser };
};