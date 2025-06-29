import { useState, useEffect } from 'react';
import { Customer, Order, Product, KnowledgeBase, AttendanceRecord } from '../types';

// Mock data hooks for browser compatibility
// These replace the database-dependent hooks

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    // Mock implementation - no database operations
    setLoading(false);
    setError(null);
    setCustomers([]);
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerData,
      createdAt: new Date().toISOString(),
      files: [],
      orders: []
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = async (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    const updatedCustomer: Customer = {
      id: customerId,
      ...customerData,
      createdAt: customers.find(c => c.id === customerId)?.createdAt || new Date().toISOString(),
      files: customers.find(c => c.id === customerId)?.files || [],
      orders: customers.find(c => c.id === customerId)?.orders || []
    };

    setCustomers(prev => prev.map(customer => 
      customer.id === customerId ? updatedCustomer : customer
    ));

    return updatedCustomer;
  };

  const deleteCustomer = async (customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, addCustomer, updateCustomer, deleteCustomer, refetch: fetchCustomers };
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(false);
    setError(null);
    setOrders([]);
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => {
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber,
      orderDate: new Date().toISOString().split('T')[0],
      ...orderData
    };

    setOrders(prev => [newOrder, ...prev]);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, addOrder, refetch: fetchOrders };
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(false);
    setError(null);
    setProducts([]);
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData
    };

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, addProduct, deleteProduct, refetch: fetchProducts };
};

export const useKnowledgeBase = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeBase = async () => {
    setLoading(false);
    setError(null);
    setKnowledgeBase([]);
  };

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
    const updatedKnowledge: KnowledgeBase = {
      id: knowledgeId,
      ...knowledgeData,
      viewCount: knowledgeBase.find(kb => kb.id === knowledgeId)?.viewCount || 0,
      createdAt: knowledgeBase.find(kb => kb.id === knowledgeId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setKnowledgeBase(prev => prev.map(kb => 
      kb.id === knowledgeId ? updatedKnowledge : kb
    ));

    return updatedKnowledge;
  };

  const deleteKnowledge = async (knowledgeId: string) => {
    setKnowledgeBase(prev => prev.filter(kb => kb.id !== knowledgeId));
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

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    setLoading(false);
    setError(null);
    setAttendanceRecords([]);
  };

  const addAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      ...attendanceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => !(r.userId === newRecord.userId && r.date === newRecord.date));
      return [newRecord, ...filtered];
    });

    return newRecord;
  };

  const updateAttendance = async (recordId: string, attendanceData: AttendanceRecord) => {
    const updatedRecord: AttendanceRecord = {
      ...attendanceData,
      id: recordId,
      updatedAt: new Date().toISOString()
    };

    setAttendanceRecords(prev => prev.map(record => 
      record.id === recordId ? updatedRecord : record
    ));

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