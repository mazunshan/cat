import { useState, useEffect } from 'react';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord } from '../types';
import { query, testConnection } from '../lib/database';

// 客户数据钩子
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 测试连接
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败');
      }

      const result = await query(`
        SELECT c.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', cf.id,
                     'name', cf.name,
                     'type', cf.type,
                     'url', cf.url,
                     'description', cf.description,
                     'uploadedAt', cf.uploaded_at
                   )
                 ) FILTER (WHERE cf.id IS NOT NULL), 
                 '[]'
               ) as files
        FROM customers c
        LEFT JOIN customer_files cf ON c.id = cf.customer_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);

      const customersData = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        gender: row.gender,
        phone: row.phone,
        wechat: row.wechat || '',
        address: row.address || '',
        occupation: row.occupation || '',
        tags: row.tags || [],
        notes: row.notes || '',
        createdAt: row.created_at,
        assignedSales: row.assigned_sales || '',
        files: row.files || [],
        orders: [] // 订单数据需要单独查询
      }));

      setCustomers(customersData);
    } catch (err) {
      console.error('获取客户数据失败:', err);
      setError(err instanceof Error ? err.message : '获取客户数据失败');
      setCustomers([]); // 设置为空数组而不是保持旧数据
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    try {
      const result = await query(`
        INSERT INTO customers (name, gender, phone, wechat, address, occupation, tags, notes, assigned_sales)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        customerData.name,
        customerData.gender,
        customerData.phone,
        customerData.wechat,
        customerData.address,
        customerData.occupation,
        JSON.stringify(customerData.tags),
        customerData.notes,
        customerData.assignedSales
      ]);

      const newCustomer: Customer = {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
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
      const result = await query(`
        UPDATE customers 
        SET name = $1, gender = $2, phone = $3, wechat = $4, address = $5, 
            occupation = $6, tags = $7, notes = $8, assigned_sales = $9, updated_at = NOW()
        WHERE id = $10
        RETURNING *
      `, [
        customerData.name,
        customerData.gender,
        customerData.phone,
        customerData.wechat,
        customerData.address,
        customerData.occupation,
        JSON.stringify(customerData.tags),
        customerData.notes,
        customerData.assignedSales,
        customerId
      ]);

      const updatedCustomer: Customer = {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
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
      await query('DELETE FROM customers WHERE id = $1', [customerId]);
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

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败');
      }

      const result = await query(`
        SELECT o.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', p.id,
                     'name', p.name,
                     'breed', p.breed,
                     'price', op.price,
                     'quantity', op.quantity,
                     'image', (p.images->0)::text
                   )
                 ) FILTER (WHERE p.id IS NOT NULL), 
                 '[]'
               ) as products
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.order_id
        LEFT JOIN products p ON op.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);

      const ordersData = result.rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        orderNumber: row.order_number,
        amount: parseFloat(row.amount),
        paymentMethod: row.payment_method,
        status: row.status,
        orderDate: row.order_date,
        salesPerson: row.sales_person,
        products: row.products || []
      }));

      setOrders(ordersData);
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
      // 生成订单号
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
      
      const result = await query(`
        INSERT INTO orders (customer_id, order_number, amount, payment_method, status, sales_person)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        orderData.customerId,
        orderNumber,
        orderData.amount,
        orderData.paymentMethod,
        orderData.status,
        orderData.salesPerson
      ]);

      const newOrder: Order = {
        ...result.rows[0],
        customerId: result.rows[0].customer_id,
        orderNumber: result.rows[0].order_number,
        amount: parseFloat(result.rows[0].amount),
        paymentMethod: result.rows[0].payment_method,
        salesPerson: result.rows[0].sales_person,
        orderDate: result.rows[0].order_date,
        products: orderData.products || []
      };

      // 添加订单产品关联
      if (orderData.products && orderData.products.length > 0) {
        for (const product of orderData.products) {
          await query(`
            INSERT INTO order_products (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4)
          `, [newOrder.id, product.id, product.quantity, product.price]);
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

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败');
      }

      const result = await query('SELECT * FROM products ORDER BY created_at DESC');
      
      const productsData = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        breed: row.breed,
        age: row.age,
        gender: row.gender,
        price: parseFloat(row.price),
        description: row.description || '',
        images: row.images || [],
        videos: row.videos || [],
        isAvailable: row.is_available,
        features: row.features || []
      }));

      setProducts(productsData);
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
      const result = await query(`
        INSERT INTO products (name, breed, age, gender, price, description, images, videos, is_available, features)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        productData.name,
        productData.breed,
        productData.age,
        productData.gender,
        productData.price,
        productData.description,
        JSON.stringify(productData.images),
        JSON.stringify(productData.videos),
        productData.isAvailable,
        JSON.stringify(productData.features)
      ]);

      const newProduct: Product = {
        ...result.rows[0],
        price: parseFloat(result.rows[0].price),
        images: result.rows[0].images || [],
        videos: result.rows[0].videos || [],
        isAvailable: result.rows[0].is_available,
        features: result.rows[0].features || []
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
      await query('DELETE FROM products WHERE id = $1', [productId]);
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

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败');
      }

      const result = await query('SELECT * FROM knowledge_base ORDER BY created_at DESC');
      
      const knowledgeData = result.rows.map(row => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        category: row.category,
        tags: row.tags || [],
        images: row.images || [],
        viewCount: row.view_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by
      }));

      setKnowledgeBase(knowledgeData);
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
      const result = await query(`
        INSERT INTO knowledge_base (question, answer, category, tags, images, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        knowledgeData.question,
        knowledgeData.answer,
        knowledgeData.category,
        JSON.stringify(knowledgeData.tags),
        JSON.stringify(knowledgeData.images),
        knowledgeData.createdBy
      ]);

      const newKnowledge: KnowledgeBase = {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
        images: result.rows[0].images || [],
        viewCount: result.rows[0].view_count || 0,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
        createdBy: result.rows[0].created_by
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
      const result = await query(`
        UPDATE knowledge_base 
        SET question = $1, answer = $2, category = $3, tags = $4, images = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [
        knowledgeData.question,
        knowledgeData.answer,
        knowledgeData.category,
        JSON.stringify(knowledgeData.tags),
        JSON.stringify(knowledgeData.images),
        knowledgeId
      ]);

      const updatedKnowledge: KnowledgeBase = {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
        images: result.rows[0].images || [],
        viewCount: result.rows[0].view_count || 0,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
        createdBy: result.rows[0].created_by
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
      await query('DELETE FROM knowledge_base WHERE id = $1', [knowledgeId]);
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

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败');
      }

      const result = await query('SELECT * FROM attendance_records ORDER BY date DESC, created_at DESC');
      
      const attendanceData = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        checkInTime: row.check_in_time,
        checkOutTime: row.check_out_time,
        status: row.status,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      setAttendanceRecords(attendanceData);
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
      const result = await query(`
        INSERT INTO attendance_records (user_id, date, check_in_time, check_out_time, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, date) 
        DO UPDATE SET 
          check_in_time = EXCLUDED.check_in_time,
          check_out_time = EXCLUDED.check_out_time,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          updated_at = NOW()
        RETURNING *
      `, [
        attendanceData.userId,
        attendanceData.date,
        attendanceData.checkInTime,
        attendanceData.checkOutTime,
        attendanceData.status,
        attendanceData.notes
      ]);

      const newRecord: AttendanceRecord = {
        id: result.rows[0].id,
        userId: result.rows[0].user_id,
        date: result.rows[0].date,
        checkInTime: result.rows[0].check_in_time,
        checkOutTime: result.rows[0].check_out_time,
        status: result.rows[0].status,
        notes: result.rows[0].notes,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
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
      const result = await query(`
        UPDATE attendance_records 
        SET check_in_time = $1, check_out_time = $2, status = $3, notes = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `, [
        attendanceData.checkInTime,
        attendanceData.checkOutTime,
        attendanceData.status,
        attendanceData.notes,
        recordId
      ]);

      const updatedRecord: AttendanceRecord = {
        id: result.rows[0].id,
        userId: result.rows[0].user_id,
        date: result.rows[0].date,
        checkInTime: result.rows[0].check_in_time,
        checkOutTime: result.rows[0].check_out_time,
        status: result.rows[0].status,
        notes: result.rows[0].notes,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
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