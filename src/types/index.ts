export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'sales' | 'after_sales';
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  gender: 'male' | 'female';
  phone: string;
  wechat: string;
  address: string;
  occupation: string;
  tags: string[];
  notes: string;
  createdAt: string;
  assignedSales: string;
  files: CustomerFile[];
  orders: Order[];
}

export interface CustomerFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  description?: string;
  uploadedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: 'full' | 'installment';
  status: 'pending_payment' | 'paid' | 'pending_shipment' | 'shipped' | 'completed' | 'cancelled';
  orderDate: string;
  salesPerson: string;
  installmentPlan?: InstallmentPlan;
  products: OrderProduct[];
}

export interface OrderProduct {
  id: string;
  name: string;
  breed: string;
  price: number;
  quantity: number;
  image: string;
}

export interface InstallmentPlan {
  totalInstallments: number;
  installmentAmount: number;
  paidInstallments: number;
  nextPaymentDate: string;
  payments: Payment[];
}

export interface Payment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Product {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: 'male' | 'female';
  price: number;
  description: string;
  images: string[];
  videos: string[];
  isAvailable: boolean;
  features: string[];
}

export interface KnowledgeBase {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  images?: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // 添加创建者字段
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth: number;
  pendingPayments: number;
  overduePayments: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  verificationRequired: boolean;
}