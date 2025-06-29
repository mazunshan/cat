import { useState, useEffect } from 'react';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord } from '../types';
import { supabase, testConnection } from '../lib/database';

// 客户数据钩子
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is configured
      if (!supabase) {
        throw new Error('Supabase未配置: 请在.env文件中设置正确的VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY');
      }

      // Test connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败: 请检查Supabase配置和网络连接');
      }

      // Fetch customers with files
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          customer_files (
            id,
            name,
            type,
            url,
            description,
            uploaded_at
          )
        `)
        .order('created_at', { ascending: false });

      if (customersError) {
        throw customersError;
      }

      const formattedCustomers = customersData?.map(customer => ({
        id: customer.id,
        name: customer.name,
        gender: customer.gender,
        phone: customer.phone,
        wechat: customer.wechat || '',
        address: customer.address || '',
        occupation: customer.occupation || '',
        tags: customer.tags || [],
        notes: customer.notes || '',
        createdAt: customer.created_at,
        assignedSales: customer.assigned_sales || '',
        files: customer.customer_files?.map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          description: file.description,
          uploadedAt: file.uploaded_at
        })) || [],
        orders: [] // Orders need to be fetched separately
      })) || [];

      setCustomers(formattedCustomers);
    } catch (err) {
      console.error('获取客户数据失败:', err);
      setError(err instanceof Error ? err.message : '获取客户数据失败');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { data, error } = await supabase
        .from('customers')
        .insert({
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
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        gender: data.gender,
        phone: data.phone,
        wechat: data.wechat || '',
        address: data.address || '',
        occupation: data.occupation || '',
        tags: data.tags || [],
        notes: data.notes || '',
        createdAt: data.created_at,
        assignedSales: data.assigned_sales || '',
        files: [],
        orders: []
      };

      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (error) {
      console.error('添加客户失败:', error);
      throw error;
    }
  };

  const updateCustomer = async (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { data, error } = await supabase
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
          assigned_sales: customerData.assignedSales,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedCustomer: Customer = {
        id: data.id,
        name: data.name,
        gender: data.gender,
        phone: data.phone,
        wechat: data.wechat || '',
        address: data.address || '',
        occupation: data.occupation || '',
        tags: data.tags || [],
        notes: data.notes || '',
        createdAt: data.created_at,
        assignedSales: data.assigned_sales || '',
        files: customers.find(c => c.id === customerId)?.files || [],
        orders: customers.find(c => c.id === customerId)?.orders || []
      };

      setCustomers(prev => prev.map(customer => 
        customer.id === customerId ? updatedCustomer : customer
      ));

      return updatedCustomer;
    } catch (error) {
      console.error('更新客户失败:', error);
      throw error;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        throw error;
      }

      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    } catch (error) {
      console.error('删除客户失败:', error);
      throw error;
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

      if (!supabase) {
        throw new Error('Supabase未配置: 请在.env文件中设置正确的VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY');
      }

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败: 请检查Supabase配置和网络连接');
      }

      // Fetch orders with products
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_products (
            quantity,
            price,
            products (
              id,
              name,
              breed,
              images
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      const formattedOrders = ordersData?.map(order => ({
        id: order.id,
        customerId: order.customer_id,
        orderNumber: order.order_number,
        amount: parseFloat(order.amount),
        paymentMethod: order.payment_method,
        status: order.status,
        orderDate: order.order_date,
        salesPerson: order.sales_person,
        products: order.order_products?.map((op: any) => ({
          id: op.products.id,
          name: op.products.name,
          breed: op.products.breed,
          price: parseFloat(op.price),
          quantity: op.quantity,
          image: op.products.images?.[0] || ''
        })) || []
      })) || [];

      setOrders(formattedOrders);
    } catch (err) {
      console.error('获取订单数据失败:', err);
      setError(err instanceof Error ? err.message : '获取订单数据失败');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      // Generate order number
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: orderData.customerId,
          order_number: orderNumber,
          amount: orderData.amount,
          payment_method: orderData.paymentMethod,
          status: orderData.status,
          sales_person: orderData.salesPerson
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newOrder: Order = {
        id: data.id,
        customerId: data.customer_id,
        orderNumber: data.order_number,
        amount: parseFloat(data.amount),
        paymentMethod: data.payment_method,
        status: data.status,
        orderDate: data.order_date,
        salesPerson: data.sales_person,
        products: orderData.products || []
      };

      // Add order products
      if (orderData.products && orderData.products.length > 0) {
        const orderProducts = orderData.products.map(product => ({
          order_id: newOrder.id,
          product_id: product.id,
          quantity: product.quantity,
          price: product.price
        }));

        const { error: productsError } = await supabase
          .from('order_products')
          .insert(orderProducts);

        if (productsError) {
          throw productsError;
        }
      }

      setOrders(prev => [newOrder, ...prev]);
    } catch (error) {
      console.error('添加订单失败:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, addOrder, refetch: fetchOrders };
};

// 产品数据钩子
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase未配置: 请在.env文件中设置正确的VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY');
      }

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败: 请检查Supabase配置和网络连接');
      }

      const { data, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        throw productsError;
      }

      const formattedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        breed: product.breed,
        age: product.age,
        gender: product.gender,
        price: parseFloat(product.price),
        description: product.description || '',
        images: product.images || [],
        videos: product.videos || [],
        isAvailable: product.is_available,
        features: product.features || []
      })) || [];

      setProducts(formattedProducts);
    } catch (err) {
      console.error('获取产品数据失败:', err);
      setError(err instanceof Error ? err.message : '获取产品数据失败');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
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
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        breed: data.breed,
        age: data.age,
        gender: data.gender,
        price: parseFloat(data.price),
        description: data.description || '',
        images: data.images || [],
        videos: data.videos || [],
        isAvailable: data.is_available,
        features: data.features || []
      };

      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      console.error('添加产品失败:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (error) {
      console.error('删除产品失败:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, addProduct, deleteProduct, refetch: fetchProducts };
};

// 知识库数据钩子
export const useKnowledgeBase = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase未配置: 请在.env文件中设置正确的VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY');
      }

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败: 请检查Supabase配置和网络连接');
      }

      const { data, error: kbError } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (kbError) {
        throw kbError;
      }

      const formattedKnowledge = data?.map(kb => ({
        id: kb.id,
        question: kb.question,
        answer: kb.answer,
        category: kb.category,
        tags: kb.tags || [],
        images: kb.images || [],
        viewCount: kb.view_count || 0,
        createdAt: kb.created_at,
        updatedAt: kb.updated_at,
        createdBy: kb.created_by
      })) || [];

      setKnowledgeBase(formattedKnowledge);
    } catch (err) {
      console.error('获取知识库数据失败:', err);
      setError(err instanceof Error ? err.message : '获取知识库数据失败');
      setKnowledgeBase([]);
    } finally {
      setLoading(false);
    }
  };

  const addKnowledge = async (knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          question: knowledgeData.question,
          answer: knowledgeData.answer,
          category: knowledgeData.category,
          tags: knowledgeData.tags,
          images: knowledgeData.images,
          created_by: knowledgeData.createdBy
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newKnowledge: KnowledgeBase = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        tags: data.tags || [],
        images: data.images || [],
        viewCount: data.view_count || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by
      };

      setKnowledgeBase(prev => [newKnowledge, ...prev]);
      return newKnowledge;
    } catch (error) {
      console.error('添加知识库条目失败:', error);
      throw error;
    }
  };

  const updateKnowledge = async (knowledgeId: string, knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { data, error } = await supabase
        .from('knowledge_base')
        .update({
          question: knowledgeData.question,
          answer: knowledgeData.answer,
          category: knowledgeData.category,
          tags: knowledgeData.tags,
          images: knowledgeData.images,
          updated_at: new Date().toISOString()
        })
        .eq('id', knowledgeId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedKnowledge: KnowledgeBase = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        tags: data.tags || [],
        images: data.images || [],
        viewCount: data.view_count || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by
      };

      setKnowledgeBase(prev => prev.map(kb => 
        kb.id === knowledgeId ? updatedKnowledge : kb
      ));

      return updatedKnowledge;
    } catch (error) {
      console.error('更新知识库条目失败:', error);
      throw error;
    }
  };

  const deleteKnowledge = async (knowledgeId: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', knowledgeId);

      if (error) {
        throw error;
      }

      setKnowledgeBase(prev => prev.filter(kb => kb.id !== knowledgeId));
    } catch (error) {
      console.error('删除知识库条目失败:', error);
      throw error;
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
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase未配置: 请在.env文件中设置正确的VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY');
      }

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败: 请检查Supabase配置和网络连接');
      }

      const { data, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (attendanceError) {
        throw attendanceError;
      }

      const formattedAttendance = data?.map(record => ({
        id: record.id,
        userId: record.user_id,
        date: record.date,
        checkInTime: record.check_in_time,
        checkOutTime: record.check_out_time,
        status: record.status,
        notes: record.notes,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      })) || [];

      setAttendanceRecords(formattedAttendance);
    } catch (err) {
      console.error('获取考勤数据失败:', err);
      setError(err instanceof Error ? err.message : '获取考勤数据失败');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const addAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
          user_id: attendanceData.userId,
          date: attendanceData.date,
          check_in_time: attendanceData.checkInTime,
          check_out_time: attendanceData.checkOutTime,
          status: attendanceData.status,
          notes: attendanceData.notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newRecord: AttendanceRecord = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        checkInTime: data.check_in_time,
        checkOutTime: data.check_out_time,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => !(r.userId === newRecord.userId && r.date === newRecord.date));
        return [newRecord, ...filtered];
      });

      return newRecord;
    } catch (error) {
      console.error('添加考勤记录失败:', error);
      throw error;
    }
  };

  const updateAttendance = async (recordId: string, attendanceData: AttendanceRecord) => {
    try {
      if (!supabase) {
        throw new Error('Supabase未配置');
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          check_in_time: attendanceData.checkInTime,
          check_out_time: attendanceData.checkOutTime,
          status: attendanceData.status,
          notes: attendanceData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedRecord: AttendanceRecord = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        checkInTime: data.check_in_time,
        checkOutTime: data.check_out_time,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setAttendanceRecords(prev => prev.map(record => 
        record.id === recordId ? updatedRecord : record
      ));

      return updatedRecord;
    } catch (error) {
      console.error('更新考勤记录失败:', error);
      throw error;
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