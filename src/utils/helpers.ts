import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending_payment: '待付款',
    paid: '已付款',
    pending_shipment: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-600',
    paid: 'bg-blue-100 text-blue-600',
    pending_shipment: 'bg-purple-100 text-purple-600',
    shipped: 'bg-indigo-100 text-indigo-600',
    completed: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-600';
};

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};