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
  quarantineVideos: QuarantineVideo[]; // 新增检疫视频字段
  isAvailable: boolean;
  features: string[];
}

// 新增检疫视频类型
export interface QuarantineVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  recordedDate: string;
  duration?: number; // 视频时长（秒）
  fileSize?: number; // 文件大小（字节）
  veterinarian?: string; // 检疫兽医
  quarantineStatus: 'healthy' | 'under_observation' | 'treated' | 'cleared';
  uploadedAt: string;
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
  createdBy?: string;
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

// 新增营业时间设置类型
export interface BusinessHours {
  workStartTime: string; // 上班时间，格式: "09:00"
  workEndTime: string;   // 下班时间，格式: "18:00"
  lateThreshold: number; // 迟到容忍时间（分钟）
  earlyLeaveThreshold: number; // 早退容忍时间（分钟）
  workDays: number[];    // 工作日，0=周日，1=周一...6=周六
}

// 新增售后服务相关类型
export interface AfterSalesRecord {
  id: string;
  orderId: string;
  customerId: string;
  type: 'phone_visit' | 'health_consultation' | 'home_service' | 'complaint' | 'feedback' | 'maintenance';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  solution?: string;
  assignedTo: string;
  createdBy: string;
  scheduledDate?: string;
  completedDate?: string;
  customerSatisfaction?: number; // 1-5 星评分
  followUpRequired: boolean;
  followUpDate?: string;
  attachments: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  type: AfterSalesRecord['type'];
  description: string;
  defaultPriority: AfterSalesRecord['priority'];
  estimatedDuration: number; // 预计处理时间（分钟）
  checklist: string[];
  isActive: boolean;
}

export interface CustomerFeedback {
  id: string;
  afterSalesRecordId: string;
  customerId: string;
  rating: number; // 1-5 星
  comment: string;
  improvements: string[];
  wouldRecommend: boolean;
  createdAt: string;
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