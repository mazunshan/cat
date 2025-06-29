import { useState, useEffect } from 'react';
import { query } from '../lib/database';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord } from '../types';

// 客户数据钩子
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await query(`
        SELECT c.*, 
               COALESCE(cf.files, '[]'::json) as files,
               COALESCE(o.orders, '[]'::json) as orders
        FROM customers c
        LEFT JOIN (
          SELECT customer_id, 
                 json_agg(json_build_object(
                   'id', id,
                   'name', name,
                   'type', type,
                   'url', url,
                   'description', description,
                   'uploadedAt', uploaded_at
                 )) as files
          FROM customer_files 
          GROUP BY customer_id
        ) cf ON c.id = cf.customer_id
        LEFT JOIN (
          SELECT customer_id,
                 json_agg(json_build_object(
                   'id', id,
                   'orderNumber', order_number,
                   'amount', amount,
                   'status', status,
                   'orderDate', order_date
                 )) as orders
          FROM orders
          GROUP BY customer_id
        ) o ON c.id = o.customer_id
        ORDER BY c.created_at DESC
      `);

      const formattedCustomers: Customer[] = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        gender: row.gender as 'male' | 'female',
        phone: row.phone,
        wechat: row.wechat || '',
        address: row.address || '',
        occupation: row.occupation || '',
        tags: row.tags || [],
        notes: row.notes || '',
        createdAt: row.created_at,
        assignedSales: row.assigned_sales,
        files: row.files || [],
        orders: row.orders || []
      }));

      setCustomers(formattedCustomers);
    } catch (err: any) {
      console.error('获取客户数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    try {
      const result = await query(
        `INSERT INTO customers (name, gender, phone, wechat, address, occupation, tags, notes, assigned_sales, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING *`,
        [
          customerData.name,
          customerData.gender,
          customerData.phone,
          customerData.wechat,
          customerData.address,
          customerData.occupation,
          JSON.stringify(customerData.tags),
          customerData.notes,
          customerData.assignedSales
        ]
      );

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
      const result = await query(
        `UPDATE customers 
         SET name = $1, gender = $2, phone = $3, wechat = $4, address = $5, 
             occupation = $6, tags = $7, notes = $8, assigned_sales = $9, updated_at = NOW()
         WHERE id = $10
         RETURNING *`,
        [
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
        ]
      );

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
      
      const result = await query(`
        SELECT o.*,
               COALESCE(op.products, '[]'::json) as products,
               ip.installment_plan
        FROM orders o
        LEFT JOIN (
          SELECT order_id,
                 json_agg(json_build_object(
                   'id', op.product_id,
                   'name', p.name,
                   'breed', p.breed,
                   'price', op.price,
                   'quantity', op.quantity,
                   'image', (p.images->0)::text
                 )) as products
          FROM order_products op
          JOIN products p ON op.product_id = p.id
          GROUP BY order_id
        ) op ON o.id = op.order_id
        LEFT JOIN (
          SELECT order_id,
                 json_build_object(
                   'totalInstallments', total_installments,
                   'installmentAmount', installment_amount,
                   'paidInstallments', paid_installments,
                   'nextPaymentDate', next_payment_date,
                   'payments', COALESCE(payments, '[]'::json)
                 ) as installment_plan
          FROM installment_plans ip
          LEFT JOIN (
            SELECT installment_plan_id,
                   json_agg(json_build_object(
                     'id', id,
                     'installmentNumber', installment_number,
                     'amount', amount,
                     'dueDate', due_date,
                     'paidDate', paid_date,
                     'status', status
                   )) as payments
            FROM payments
            GROUP BY installment_plan_id
          ) p ON ip.id = p.installment_plan_id
        ) ip ON o.id = ip.order_id
        ORDER BY o.created_at DESC
      `);

      const formattedOrders: Order[] = result.rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        orderNumber: row.order_number,
        amount: row.amount,
        paymentMethod: row.payment_method as 'full' | 'installment',
        status: row.status as Order['status'],
        orderDate: row.order_date,
        salesPerson: row.sales_person,
        products: row.products || [],
        installmentPlan: row.installment_plan
      }));

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('获取订单数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => {
    try {
      // 生成订单号
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
      
      // 创建订单
      const orderResult = await query(
        `INSERT INTO orders (customer_id, order_number, amount, payment_method, status, sales_person, order_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, NOW(), NOW())
         RETURNING *`,
        [
          orderData.customerId,
          orderNumber,
          orderData.amount,
          orderData.paymentMethod,
          orderData.status,
          orderData.salesPerson
        ]
      );

      const newOrderId = orderResult.rows[0].id;

      // 添加订单产品
      if (orderData.products && orderData.products.length > 0) {
        for (const product of orderData.products) {
          await query(
            'INSERT INTO order_products (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
            [newOrderId, product.id, product.quantity, product.price]
          );
        }
      }

      // 如果是分期付款，创建分期计划
      if (orderData.paymentMethod === 'installment' && orderData.installmentPlan) {
        const planResult = await query(
          `INSERT INTO installment_plans (order_id, total_installments, installment_amount, paid_installments, next_payment_date)
           VALUES ($1, $2, $3, 0, $4)
           RETURNING id`,
          [
            newOrderId,
            orderData.installmentPlan.totalInstallments,
            orderData.installmentPlan.installmentAmount,
            orderData.installmentPlan.nextPaymentDate
          ]
        );

        const planId = planResult.rows[0].id;

        // 创建付款记录
        if (orderData.installmentPlan.payments) {
          for (const payment of orderData.installmentPlan.payments) {
            await query(
              'INSERT INTO payments (installment_plan_id, installment_number, amount, due_date, status) VALUES ($1, $2, $3, $4, $5)',
              [planId, payment.installmentNumber, payment.amount, payment.dueDate, payment.status]
            );
          }
        }
      }

      await fetchOrders(); // 重新获取订单列表
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
      
      const result = await query('SELECT * FROM products ORDER BY created_at DESC');

      const formattedProducts: Product[] = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        breed: row.breed,
        age: row.age,
        gender: row.gender as 'male' | 'female',
        price: row.price,
        description: row.description || '',
        images: row.images || [],
        videos: row.videos || [],
        isAvailable: row.is_available,
        features: row.features || []
      }));

      setProducts(formattedProducts);
    } catch (err: any) {
      console.error('获取产品数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const result = await query(
        `INSERT INTO products (name, breed, age, gender, price, description, images, videos, is_available, features, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
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
        ]
      );

      const newProduct: Product = {
        ...result.rows[0],
        images: result.rows[0].images || [],
        videos: result.rows[0].videos || [],
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
      
      const result = await query('SELECT * FROM knowledge_base ORDER BY created_at DESC');

      const formattedKnowledge: KnowledgeBase[] = result.rows.map(row => ({
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

      setKnowledgeBase(formattedKnowledge);
    } catch (err: any) {
      console.error('获取知识库数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addKnowledge = async (knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await query(
        `INSERT INTO knowledge_base (question, answer, category, tags, images, view_count, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 0, $6, NOW(), NOW())
         RETURNING *`,
        [
          knowledgeData.question,
          knowledgeData.answer,
          knowledgeData.category,
          JSON.stringify(knowledgeData.tags),
          JSON.stringify(knowledgeData.images || []),
          knowledgeData.createdBy
        ]
      );

      const newKnowledge: KnowledgeBase = {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
        images: result.rows[0].images || []
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
      const result = await query(
        `UPDATE knowledge_base 
         SET question = $1, answer = $2, category = $3, tags = $4, images = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          knowledgeData.question,
          knowledgeData.answer,
          knowledgeData.category,
          JSON.stringify(knowledgeData.tags),
          JSON.stringify(knowledgeData.images || []),
          knowledgeId
        ]
      );

      const updatedKnowledge: KnowledgeBase = {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
        images: result.rows[0].images || []
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
      
      const result = await query('SELECT * FROM attendance_records ORDER BY date DESC, created_at DESC');

      const formattedAttendance: AttendanceRecord[] = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        checkInTime: row.check_in_time,
        checkOutTime: row.check_out_time,
        status: row.status as AttendanceRecord['status'],
        notes: row.notes || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      setAttendanceRecords(formattedAttendance);
    } catch (err: any) {
      console.error('获取考勤数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await query(
        `INSERT INTO attendance_records (user_id, date, check_in_time, check_out_time, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (user_id, date) 
         DO UPDATE SET 
           check_in_time = EXCLUDED.check_in_time,
           check_out_time = EXCLUDED.check_out_time,
           status = EXCLUDED.status,
           notes = EXCLUDED.notes,
           updated_at = NOW()
         RETURNING *`,
        [
          attendanceData.userId,
          attendanceData.date,
          attendanceData.checkInTime,
          attendanceData.checkOutTime,
          attendanceData.status,
          attendanceData.notes
        ]
      );

      const newRecord: AttendanceRecord = result.rows[0];

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
      const result = await query(
        `UPDATE attendance_records 
         SET check_in_time = $1, check_out_time = $2, status = $3, notes = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [
          attendanceData.checkInTime,
          attendanceData.checkOutTime,
          attendanceData.status,
          attendanceData.notes,
          recordId
        ]
      );

      const updatedRecord: AttendanceRecord = result.rows[0];

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