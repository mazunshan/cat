import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord } from '../types';
import { useAuth } from '../context/AuthContext';

// 检查是否是开发模式（Supabase 未配置）
const isDevelopmentMode = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return !supabaseUrl || 
         !supabaseAnonKey || 
         supabaseUrl.includes('your-project-ref') || 
         supabaseAnonKey.includes('your-anon-key-here') ||
         supabaseUrl === 'https://demo.supabase.co' ||
         supabaseAnonKey === 'demo-anon-key';
};

// 模拟数据
const mockCustomersData: Customer[] = [
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
    assignedSales: 'Bob Wang',
    files: [],
    orders: []
  }
];

const mockProductsData: Product[] = [
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

const mockOrdersData: Order[] = [
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

let mockKnowledgeData: KnowledgeBase[] = [
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
    updatedAt: '2024-01-01'
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
    updatedAt: '2024-01-05'
  }
];

// 模拟考勤数据
const generateMockAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const userIds = ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005'];
  
  // 生成过去30天的考勤记录
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    userIds.forEach((userId, index) => {
      // 随机生成考勤状态
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

let mockAttendanceData = generateMockAttendanceData();

// 客户数据钩子
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // 如果是开发模式，使用模拟数据
      if (isDevelopmentMode()) {
        console.log('Development mode - using mock customer data');
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载时间
        setCustomers(mockCustomersData);
        setLoading(false);
        return;
      }

      // 尝试连接 Supabase
      let data, error;
      try {
        const result = await supabase
          .from('customers')
          .select(`
            *,
            customer_files (*)
          `)
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        // 捕获网络错误或其他连接问题
        console.warn('Supabase connection failed, falling back to mock data:', fetchError);
        setError('无法连接到数据库，正在使用演示数据');
        setCustomers(mockCustomersData);
        setLoading(false);
        return;
      }

      if (error) {
        console.error('Error fetching customers:', error);
        
        // 检查是否是连接错误
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          setError('无法连接到数据库，正在使用演示数据');
        } else {
          setError(`加载客户数据失败: ${error.message}`);
        }
        
        // 使用模拟数据作为后备
        setCustomers(mockCustomersData);
        setLoading(false);
        return;
      }

      const formattedCustomers: Customer[] = (data || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        gender: customer.gender as 'male' | 'female',
        phone: customer.phone,
        wechat: customer.wechat || '',
        address: customer.address || '',
        occupation: customer.occupation || '',
        tags: customer.tags || [],
        notes: customer.notes || '',
        createdAt: customer.created_at ? customer.created_at.split('T')[0] : '',
        assignedSales: customer.assigned_sales,
        files: (customer.customer_files || []).map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          description: file.description || '',
          uploadedAt: file.uploaded_at ? file.uploaded_at.split('T')[0] : ''
        })),
        orders: [] // 订单数据将在需要时单独加载
      }));

      setCustomers(formattedCustomers);
    } catch (err: any) {
      console.error('Error in fetchCustomers:', err);
      setError('无法连接到数据库，正在使用演示数据');
      // 使用模拟数据作为后备
      setCustomers(mockCustomersData);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    try {
      // 如果是开发模式，模拟添加
      if (isDevelopmentMode()) {
        const newCustomer: Customer = {
          id: Date.now().toString(),
          ...customerData,
          createdAt: new Date().toISOString().split('T')[0],
          files: [],
          orders: []
        };
        setCustomers(prev => [newCustomer, ...prev]);
        return newCustomer;
      }

      let data, error;
      try {
        const result = await supabase
          .from('customers')
          .insert([{
            name: customerData.name,
            gender: customerData.gender,
            phone: customerData.phone,
            wechat: customerData.wechat,
            address: customerData.address,
            occupation: customerData.occupation,
            tags: customerData.tags,
            notes: customerData.notes,
            assigned_sales: customerData.assignedSales
          }])
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during add operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error adding customer:', error);
        throw new Error(`添加客户失败: ${error.message}`);
      }

      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        gender: data.gender as 'male' | 'female',
        phone: data.phone,
        wechat: data.wechat || '',
        address: data.address || '',
        occupation: data.occupation || '',
        tags: data.tags || [],
        notes: data.notes || '',
        createdAt: data.created_at ? data.created_at.split('T')[0] : '',
        assignedSales: data.assigned_sales,
        files: [],
        orders: []
      };

      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      console.error('Error in addCustomer:', err);
      throw err;
    }
  };

  const updateCustomer = async (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    try {
      // 如果是开发模式，模拟更新
      if (isDevelopmentMode()) {
        const updatedCustomer: Customer = {
          id: customerId,
          ...customerData,
          createdAt: customers.find(c => c.id === customerId)?.createdAt || '',
          files: customers.find(c => c.id === customerId)?.files || [],
          orders: customers.find(c => c.id === customerId)?.orders || []
        };

        setCustomers(prev => prev.map(customer => 
          customer.id === customerId ? updatedCustomer : customer
        ));

        return updatedCustomer;
      }

      let data, error;
      try {
        const result = await supabase
          .from('customers')
          .update({
            name: customerData.name,
            gender: customerData.gender,
            phone: customerData.phone,
            wechat: customerData.wechat,
            address: customerData.address,
            occupation: customerData.occupation,
            tags: customerData.tags,
            notes: customerData.notes,
            assigned_sales: customerData.assignedSales
          })
          .eq('id', customerId)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during update operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error updating customer:', error);
        throw new Error(`更新客户失败: ${error.message}`);
      }

      const updatedCustomer: Customer = {
        id: data.id,
        name: data.name,
        gender: data.gender as 'male' | 'female',
        phone: data.phone,
        wechat: data.wechat || '',
        address: data.address || '',
        occupation: data.occupation || '',
        tags: data.tags || [],
        notes: data.notes || '',
        createdAt: data.created_at ? data.created_at.split('T')[0] : '',
        assignedSales: data.assigned_sales,
        files: customers.find(c => c.id === customerId)?.files || [],
        orders: customers.find(c => c.id === customerId)?.orders || []
      };

      setCustomers(prev => prev.map(customer => 
        customer.id === customerId ? updatedCustomer : customer
      ));

      return updatedCustomer;
    } catch (err) {
      console.error('Error in updateCustomer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      // 如果是开发模式，模拟删除
      if (isDevelopmentMode()) {
        setCustomers(prev => prev.filter(customer => customer.id !== customerId));
        return;
      }

      let error;
      try {
        const result = await supabase
          .from('customers')
          .delete()
          .eq('id', customerId);
        
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during delete operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error deleting customer:', error);
        throw new Error(`删除客户失败: ${error.message}`);
      }

      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    } catch (err) {
      console.error('Error in deleteCustomer:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, addCustomer, updateCustomer, deleteCustomer, refetch: fetchCustomers };
};

// 订单数据钩子
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // 如果是开发模式，使用模拟数据
      if (isDevelopmentMode()) {
        console.log('Development mode - using mock order data');
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载时间
        setOrders(mockOrdersData);
        setLoading(false);
        return;
      }

      // 尝试连接 Supabase
      let data, error;
      try {
        const result = await supabase
          .from('orders')
          .select(`
            *,
            order_products (
              *,
              products (*)
            ),
            installment_plans (
              *,
              payments (*)
            )
          `)
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        // 捕获网络错误或其他连接问题
        console.warn('Supabase connection failed, falling back to mock data:', fetchError);
        setError('无法连接到数据库，正在使用演示数据');
        setOrders(mockOrdersData);
        setLoading(false);
        return;
      }

      if (error) {
        console.error('Error fetching orders:', error);
        
        // 检查是否是连接错误
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          setError('无法连接到数据库，正在使用演示数据');
        } else {
          setError(`加载订单数据失败: ${error.message}`);
        }
        
        // 使用模拟数据作为后备
        setOrders(mockOrdersData);
        setLoading(false);
        return;
      }

      const formattedOrders: Order[] = (data || []).map(order => {
        const orderProducts = (order.order_products || []).map((op: any) => ({
          id: op.product_id,
          name: op.products?.name || '',
          breed: op.products?.breed || '',
          price: op.price || 0,
          quantity: op.quantity || 1,
          image: (op.products?.images && op.products.images[0]) || ''
        }));

        let installmentPlan = undefined;
        if (order.installment_plans && order.installment_plans.length > 0) {
          const plan = order.installment_plans[0];
          installmentPlan = {
            totalInstallments: plan.total_installments || 0,
            installmentAmount: plan.installment_amount || 0,
            paidInstallments: plan.paid_installments || 0,
            nextPaymentDate: plan.next_payment_date || '',
            payments: (plan.payments || []).map((payment: any) => ({
              id: payment.id,
              installmentNumber: payment.installment_number || 0,
              amount: payment.amount || 0,
              dueDate: payment.due_date || '',
              paidDate: payment.paid_date,
              status: payment.status as 'pending' | 'paid' | 'overdue'
            }))
          };
        }

        return {
          id: order.id,
          customerId: order.customer_id || '',
          orderNumber: order.order_number || '',
          amount: order.amount || 0,
          paymentMethod: order.payment_method as 'full' | 'installment',
          status: order.status as Order['status'],
          orderDate: order.order_date || '',
          salesPerson: order.sales_person || '',
          products: orderProducts,
          installmentPlan
        };
      });

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Error in fetchOrders:', err);
      setError('无法连接到数据库，正在使用演示数据');
      // 使用模拟数据作为后备
      setOrders(mockOrdersData);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => {
    try {
      // 如果是开发模式，模拟添加
      if (isDevelopmentMode()) {
        const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
        const newOrder: Order = {
          id: Date.now().toString(),
          orderNumber,
          orderDate: new Date().toISOString().split('T')[0],
          ...orderData
        };
        setOrders(prev => [newOrder, ...prev]);
        return;
      }

      // 生成订单号
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
      
      let orderResult, orderError;
      try {
        const result = await supabase
          .from('orders')
          .insert([{
            customer_id: orderData.customerId,
            order_number: orderNumber,
            amount: orderData.amount,
            payment_method: orderData.paymentMethod,
            status: orderData.status,
            sales_person: orderData.salesPerson
          }])
          .select()
          .single();
        
        orderResult = result.data;
        orderError = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during add order operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (orderError) {
        console.error('Error adding order:', orderError);
        throw new Error(`创建订单失败: ${orderError.message}`);
      }

      // 添加订单产品
      if (orderData.products && orderData.products.length > 0) {
        const orderProducts = orderData.products.map(product => ({
          order_id: orderResult.id,
          product_id: product.id,
          quantity: product.quantity,
          price: product.price
        }));

        const { error: productsError } = await supabase
          .from('order_products')
          .insert(orderProducts);

        if (productsError) {
          console.error('Error adding order products:', productsError);
          throw new Error(`添加订单产品失败: ${productsError.message}`);
        }
      }

      // 如果是分期付款，创建分期计划
      if (orderData.paymentMethod === 'installment' && orderData.installmentPlan) {
        const { data: planResult, error: planError } = await supabase
          .from('installment_plans')
          .insert([{
            order_id: orderResult.id,
            total_installments: orderData.installmentPlan.totalInstallments,
            installment_amount: orderData.installmentPlan.installmentAmount,
            paid_installments: 0,
            next_payment_date: orderData.installmentPlan.nextPaymentDate
          }])
          .select()
          .single();

        if (planError) {
          console.error('Error adding installment plan:', planError);
          throw new Error(`创建分期计划失败: ${planError.message}`);
        }

        // 创建付款记录
        if (orderData.installmentPlan.payments && orderData.installmentPlan.payments.length > 0) {
          const payments = orderData.installmentPlan.payments.map(payment => ({
            installment_plan_id: planResult.id,
            installment_number: payment.installmentNumber,
            amount: payment.amount,
            due_date: payment.dueDate,
            status: payment.status
          }));

          const { error: paymentsError } = await supabase
            .from('payments')
            .insert(payments);

          if (paymentsError) {
            console.error('Error adding payments:', paymentsError);
            throw new Error(`创建付款记录失败: ${paymentsError.message}`);
          }
        }
      }

      await fetchOrders(); // 重新获取订单列表
    } catch (err) {
      console.error('Error in addOrder:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, addOrder, refetch: fetchOrders };
};

// 产品数据钩子
export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // 如果是开发模式，使用模拟数据
      if (isDevelopmentMode()) {
        console.log('Development mode - using mock product data');
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载时间
        setProducts(mockProductsData);
        setLoading(false);
        return;
      }

      // 尝试连接 Supabase
      let data, error;
      try {
        const result = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        // 捕获网络错误或其他连接问题
        console.warn('Supabase connection failed, falling back to mock data:', fetchError);
        setError('无法连接到数据库，正在使用演示数据');
        setProducts(mockProductsData);
        setLoading(false);
        return;
      }

      if (error) {
        console.error('Error fetching products:', error);
        
        // 检查是否是连接错误
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          setError('无法连接到数据库，正在使用演示数据');
        } else {
          setError(`加载产品数据失败: ${error.message}`);
        }
        
        // 使用模拟数据作为后备
        setProducts(mockProductsData);
        setLoading(false);
        return;
      }

      const formattedProducts: Product[] = (data || []).map(product => ({
        id: product.id,
        name: product.name || '',
        breed: product.breed || '',
        age: product.age || '',
        gender: product.gender as 'male' | 'female',
        price: product.price || 0,
        description: product.description || '',
        images: product.images || [],
        videos: product.videos || [],
        isAvailable: product.is_available !== false,
        features: product.features || []
      }));

      setProducts(formattedProducts);
    } catch (err: any) {
      console.error('Error in fetchProducts:', err);
      setError('无法连接到数据库，正在使用演示数据');
      // 使用模拟数据作为后备
      setProducts(mockProductsData);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      // 检查权限：只有管理员可以添加产品
      if (user?.role !== 'admin') {
        throw new Error('只有管理员可以添加产品');
      }

      // 如果是开发模式，模拟添加
      if (isDevelopmentMode()) {
        const newProduct: Product = {
          id: Date.now().toString(),
          ...productData
        };
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      }

      let data, error;
      try {
        const result = await supabase
          .from('products')
          .insert([{
            name: productData.name,
            breed: productData.breed,
            age: productData.age,
            gender: productData.gender,
            price: productData.price,
            description: productData.description,
            images: productData.images,
            videos: productData.videos,
            is_available: productData.isAvailable,
            features: productData.features
          }])
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during add product operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error adding product:', error);
        throw new Error(`添加产品失败: ${error.message}`);
      }

      const newProduct: Product = {
        id: data.id,
        name: data.name || '',
        breed: data.breed || '',
        age: data.age || '',
        gender: data.gender as 'male' | 'female',
        price: data.price || 0,
        description: data.description || '',
        images: data.images || [],
        videos: data.videos || [],
        isAvailable: data.is_available !== false,
        features: data.features || []
      };

      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.error('Error in addProduct:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      // 检查权限：只有管理员可以删除产品
      if (user?.role !== 'admin') {
        throw new Error('只有管理员可以删除产品');
      }

      // 如果是开发模式，模拟删除
      if (isDevelopmentMode()) {
        setProducts(prev => prev.filter(product => product.id !== productId));
        return;
      }

      let error;
      try {
        const result = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during delete product operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error deleting product:', error);
        throw new Error(`删除产品失败: ${error.message}`);
      }

      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err) {
      console.error('Error in deleteProduct:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, addProduct, deleteProduct, refetch: fetchProducts };
};

// 知识库数据钩子
export const useKnowledgeBase = () => {
  const { user } = useAuth();
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      setError(null);

      // 如果是开发模式，使用模拟数据
      if (isDevelopmentMode()) {
        console.log('Development mode - using mock knowledge data');
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载时间
        setKnowledgeBase([...mockKnowledgeData]);
        setLoading(false);
        return;
      }

      // 尝试连接 Supabase
      let data, error;
      try {
        const result = await supabase
          .from('knowledge_base')
          .select('*')
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        // 捕获网络错误或其他连接问题
        console.warn('Supabase connection failed, falling back to mock data:', fetchError);
        setError('无法连接到数据库，正在使用演示数据');
        setKnowledgeBase([...mockKnowledgeData]);
        setLoading(false);
        return;
      }

      if (error) {
        console.error('Error fetching knowledge base:', error);
        
        // 检查是否是连接错误
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          setError('无法连接到数据库，正在使用演示数据');
        } else {
          setError(`加载知识库数据失败: ${error.message}`);
        }
        
        // 使用模拟数据作为后备
        setKnowledgeBase([...mockKnowledgeData]);
        setLoading(false);
        return;
      }

      const formattedKnowledge: KnowledgeBase[] = (data || []).map(kb => ({
        id: kb.id,
        question: kb.question || '',
        answer: kb.answer || '',
        category: kb.category || '',
        tags: kb.tags || [],
        images: kb.images || [],
        viewCount: kb.view_count || 0,
        createdAt: kb.created_at ? kb.created_at.split('T')[0] : '',
        updatedAt: kb.updated_at ? kb.updated_at.split('T')[0] : '',
        createdBy: kb.created_by || user?.id // 添加创建者信息
      }));

      setKnowledgeBase(formattedKnowledge);
    } catch (err: any) {
      console.error('Error in fetchKnowledgeBase:', err);
      setError('无法连接到数据库，正在使用演示数据');
      // 使用模拟数据作为后备
      setKnowledgeBase([...mockKnowledgeData]);
    } finally {
      setLoading(false);
    }
  };

  const addKnowledge = async (knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      // 如果是开发模式，模拟添加
      if (isDevelopmentMode()) {
        const newKnowledge: KnowledgeBase = {
          id: Date.now().toString(),
          ...knowledgeData,
          viewCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          createdBy: user?.id
        };
        mockKnowledgeData.unshift(newKnowledge);
        setKnowledgeBase(prev => [newKnowledge, ...prev]);
        return newKnowledge;
      }

      let data, error;
      try {
        const result = await supabase
          .from('knowledge_base')
          .insert([{
            question: knowledgeData.question,
            answer: knowledgeData.answer,
            category: knowledgeData.category,
            tags: knowledgeData.tags,
            images: knowledgeData.images || [],
            created_by: user?.id
          }])
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during add knowledge operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error adding knowledge:', error);
        throw new Error(`添加知识库条目失败: ${error.message}`);
      }

      const newKnowledge: KnowledgeBase = {
        id: data.id,
        question: data.question || '',
        answer: data.answer || '',
        category: data.category || '',
        tags: data.tags || [],
        images: data.images || [],
        viewCount: data.view_count || 0,
        createdAt: data.created_at ? data.created_at.split('T')[0] : '',
        updatedAt: data.updated_at ? data.updated_at.split('T')[0] : '',
        createdBy: data.created_by
      };

      setKnowledgeBase(prev => [newKnowledge, ...prev]);
      return newKnowledge;
    } catch (err) {
      console.error('Error in addKnowledge:', err);
      throw err;
    }
  };

  const updateKnowledge = async (knowledgeId: string, knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      // 检查权限：管理员可以编辑所有内容，其他角色只能编辑自己创建的内容
      const existingKnowledge = knowledgeBase.find(kb => kb.id === knowledgeId);
      if (user?.role !== 'admin' && existingKnowledge?.createdBy !== user?.id) {
        throw new Error('您只能编辑自己创建的知识库条目');
      }

      // 如果是开发模式，模拟更新
      if (isDevelopmentMode()) {
        const existingKnowledge = mockKnowledgeData.find(kb => kb.id === knowledgeId);
        if (existingKnowledge) {
          const updatedKnowledge: KnowledgeBase = {
            ...existingKnowledge,
            ...knowledgeData,
            updatedAt: new Date().toISOString().split('T')[0]
          };
          
          // 更新模拟数据
          const index = mockKnowledgeData.findIndex(kb => kb.id === knowledgeId);
          if (index !== -1) {
            mockKnowledgeData[index] = updatedKnowledge;
          }
          
          setKnowledgeBase(prev => prev.map(kb => 
            kb.id === knowledgeId ? updatedKnowledge : kb
          ));
          
          return updatedKnowledge;
        }
        return null;
      }

      let data, error;
      try {
        const result = await supabase
          .from('knowledge_base')
          .update({
            question: knowledgeData.question,
            answer: knowledgeData.answer,
            category: knowledgeData.category,
            tags: knowledgeData.tags,
            images: knowledgeData.images || []
          })
          .eq('id', knowledgeId)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during update knowledge operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error updating knowledge:', error);
        throw new Error(`更新知识库条目失败: ${error.message}`);
      }

      const updatedKnowledge: KnowledgeBase = {
        id: data.id,
        question: data.question || '',
        answer: data.answer || '',
        category: data.category || '',
        tags: data.tags || [],
        images: data.images || [],
        viewCount: data.view_count || 0,
        createdAt: data.created_at ? data.created_at.split('T')[0] : '',
        updatedAt: data.updated_at ? data.updated_at.split('T')[0] : '',
        createdBy: data.created_by
      };

      setKnowledgeBase(prev => prev.map(kb => 
        kb.id === knowledgeId ? updatedKnowledge : kb
      ));

      return updatedKnowledge;
    } catch (err) {
      console.error('Error in updateKnowledge:', err);
      throw err;
    }
  };

  const deleteKnowledge = async (knowledgeId: string) => {
    try {
      // 检查权限：管理员可以删除所有内容，其他角色只能删除自己创建的内容
      const existingKnowledge = knowledgeBase.find(kb => kb.id === knowledgeId);
      if (user?.role !== 'admin' && existingKnowledge?.createdBy !== user?.id) {
        throw new Error('您只能删除自己创建的知识库条目');
      }

      // 如果是开发模式，模拟删除
      if (isDevelopmentMode()) {
        const index = mockKnowledgeData.findIndex(kb => kb.id === knowledgeId);
        if (index !== -1) {
          mockKnowledgeData.splice(index, 1);
        }
        setKnowledgeBase(prev => prev.filter(kb => kb.id !== knowledgeId));
        return;
      }

      let error;
      try {
        const result = await supabase
          .from('knowledge_base')
          .delete()
          .eq('id', knowledgeId);
        
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during delete knowledge operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error deleting knowledge:', error);
        throw new Error(`删除知识库条目失败: ${error.message}`);
      }

      setKnowledgeBase(prev => prev.filter(kb => kb.id !== knowledgeId));
    } catch (err) {
      console.error('Error in deleteKnowledge:', err);
      throw err;
    }
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
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      // 如果是开发模式，使用模拟数据
      if (isDevelopmentMode()) {
        console.log('Development mode - using mock attendance data');
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载时间
        setAttendanceRecords(mockAttendanceData);
        setLoading(false);
        return;
      }

      // 尝试连接 Supabase
      let data, error;
      try {
        const result = await supabase
          .from('attendance_records')
          .select('*')
          .order('date', { ascending: false });
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        // 捕获网络错误或其他连接问题
        console.warn('Supabase connection failed, falling back to mock data:', fetchError);
        setError('无法连接到数据库，正在使用演示数据');
        setAttendanceRecords(mockAttendanceData);
        setLoading(false);
        return;
      }

      if (error) {
        console.error('Error fetching attendance:', error);
        
        // 检查是否是连接错误
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          setError('无法连接到数据库，正在使用演示数据');
        } else {
          setError(`加载考勤数据失败: ${error.message}`);
        }
        
        // 使用模拟数据作为后备
        setAttendanceRecords(mockAttendanceData);
        setLoading(false);
        return;
      }

      const formattedAttendance: AttendanceRecord[] = (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        date: record.date,
        checkInTime: record.check_in_time,
        checkOutTime: record.check_out_time,
        status: record.status as AttendanceRecord['status'],
        notes: record.notes || '',
        createdAt: record.created_at,
        updatedAt: record.updated_at
      }));

      setAttendanceRecords(formattedAttendance);
    } catch (err: any) {
      console.error('Error in fetchAttendance:', err);
      setError('无法连接到数据库，正在使用演示数据');
      // 使用模拟数据作为后备
      setAttendanceRecords(mockAttendanceData);
    } finally {
      setLoading(false);
    }
  };

  const addAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // 如果是开发模式，模拟添加
      if (isDevelopmentMode()) {
        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          ...attendanceData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 更新模拟数据
        const existingIndex = mockAttendanceData.findIndex(
          record => record.userId === attendanceData.userId && record.date === attendanceData.date
        );
        
        if (existingIndex !== -1) {
          mockAttendanceData[existingIndex] = newRecord;
        } else {
          mockAttendanceData.unshift(newRecord);
        }
        
        setAttendanceRecords([...mockAttendanceData]);
        return newRecord;
      }

      let data, error;
      try {
        const result = await supabase
          .from('attendance_records')
          .insert([{
            user_id: attendanceData.userId,
            date: attendanceData.date,
            check_in_time: attendanceData.checkInTime,
            check_out_time: attendanceData.checkOutTime,
            status: attendanceData.status,
            notes: attendanceData.notes
          }])
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during add attendance operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error adding attendance:', error);
        throw new Error(`添加考勤记录失败: ${error.message}`);
      }

      const newRecord: AttendanceRecord = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        checkInTime: data.check_in_time,
        checkOutTime: data.check_out_time,
        status: data.status as AttendanceRecord['status'],
        notes: data.notes || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setAttendanceRecords(prev => [newRecord, ...prev.filter(r => !(r.userId === newRecord.userId && r.date === newRecord.date))]);
      return newRecord;
    } catch (err) {
      console.error('Error in addAttendance:', err);
      throw err;
    }
  };

  const updateAttendance = async (recordId: string, attendanceData: AttendanceRecord) => {
    try {
      // 如果是开发模式，模拟更新
      if (isDevelopmentMode()) {
        const updatedRecord: AttendanceRecord = {
          ...attendanceData,
          updatedAt: new Date().toISOString()
        };
        
        const index = mockAttendanceData.findIndex(record => record.id === recordId);
        if (index !== -1) {
          mockAttendanceData[index] = updatedRecord;
          setAttendanceRecords([...mockAttendanceData]);
        }
        
        return updatedRecord;
      }

      let data, error;
      try {
        const result = await supabase
          .from('attendance_records')
          .update({
            check_in_time: attendanceData.checkInTime,
            check_out_time: attendanceData.checkOutTime,
            status: attendanceData.status,
            notes: attendanceData.notes
          })
          .eq('id', recordId)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (fetchError: any) {
        console.warn('Supabase connection failed during update attendance operation:', fetchError);
        throw new Error('无法连接到数据库，请检查网络连接');
      }

      if (error) {
        console.error('Error updating attendance:', error);
        throw new Error(`更新考勤记录失败: ${error.message}`);
      }

      const updatedRecord: AttendanceRecord = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        checkInTime: data.check_in_time,
        checkOutTime: data.check_out_time,
        status: data.status as AttendanceRecord['status'],
        notes: data.notes || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setAttendanceRecords(prev => prev.map(record => 
        record.id === recordId ? updatedRecord : record
      ));

      return updatedRecord;
    } catch (err) {
      console.error('Error in updateAttendance:', err);
      throw err;
    }
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