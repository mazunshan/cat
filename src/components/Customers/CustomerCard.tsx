import React from 'react';
import { Phone, MessageCircle, MapPin, Briefcase, Tag, Edit, Trash2, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Customer, PaymentStatus } from '../../types';

// 计算还款状态
const calculatePaymentStatus = (customer: Customer): PaymentStatus => {
  if (customer.customerType !== 'installment' || !customer.installmentPayments) {
    return { status: 'normal', message: '正常' };
  }

  const today = new Date();
  const overduePayments = customer.installmentPayments.filter(payment => {
    if (payment.status === 'paid') return false;
    const dueDate = new Date(payment.dueDate);
    return dueDate < today;
  });

  if (overduePayments.length > 0) {
    return {
      status: 'overdue',
      overdueCount: overduePayments.length,
      message: `逾期 ${overduePayments.length} 期`
    };
  }

  // 检查是否有3天内到期的还款
  const upcomingPayments = customer.installmentPayments.filter(payment => {
    if (payment.status === 'paid') return false;
    const dueDate = new Date(payment.dueDate);
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= threeDaysLater;
  });

  if (upcomingPayments.length > 0) {
    return {
      status: 'reminder',
      nextDueDate: upcomingPayments[0].dueDate,
      message: '待催款'
    };
  }

  return { status: 'normal', message: '还款正常' };
};

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick, onEdit, onDelete }) => {
  const paymentStatus = calculatePaymentStatus(customer);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(customer);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(customer);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-200 group"
      onClick={onClick}
    >
      {/* 还款状态标签 - 仅分期客户显示 */}
      {customer.customerType === 'installment' && (
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            paymentStatus.status === 'normal' 
              ? 'bg-green-100 text-green-600' 
              : paymentStatus.status === 'reminder'
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-red-100 text-red-600'
          }`}>
            {paymentStatus.status === 'normal' && <CheckCircle className="w-3 h-3 mr-1" />}
            {paymentStatus.status === 'reminder' && <Clock className="w-3 h-3 mr-1" />}
            {paymentStatus.status === 'overdue' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {paymentStatus.message}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {customer.name.charAt(0)}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">{customer.name}</h3>
            <p className="text-sm text-gray-600">{customer.assignedSales}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            customer.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {customer.gender === 'female' ? '女' : '男'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            customer.customerType === 'retail' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
          }`}>
            {customer.customerType === 'retail' ? '零售' : '分期'}
          </span>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="编辑客户"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除客户"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          <span>{customer.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MessageCircle className="w-4 h-4 mr-2" />
          <span>{customer.wechat}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate">{customer.address}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          <span>{customer.occupation}</span>
        </div>
      </div>

      {customer.tags.length > 0 && (
        <div className="flex items-center mb-4">
          <Tag className="w-4 h-4 mr-2 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {customer.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {customer.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{customer.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {customer.notes && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-2">
          {customer.notes}
        </p>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          创建于 {new Date(customer.createdAt).toLocaleDateString('zh-CN')}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">订单: {customer.orders.length}</span>
          <span className="text-xs text-gray-500">文件: {customer.files.length}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;