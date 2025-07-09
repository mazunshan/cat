import React from 'react';
import { Phone, MessageCircle, MapPin, Briefcase, Tag, Edit, Trash2, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Customer, InstallmentPayment } from '../../types';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick, onEdit, onDelete }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(customer);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(customer);
  };

  // 计算分期客户的还款状态
  const getPaymentStatus = () => {
    if (customer.customerType !== 'installment' || !customer.installmentPayments) {
      return null;
    }

    const payments = customer.installmentPayments;
    const overduePayments = payments.filter(p => p.isOverdue && !p.isPaid);
    const dueSoonPayments = payments.filter(p => {
      if (p.isPaid) return false;
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    });

    if (overduePayments.length > 0) {
      const totalOverdueCount = overduePayments.reduce((sum, p) => sum + (p.overdueCount || 1), 0);
      return {
        type: 'overdue' as const,
        count: totalOverdueCount,
        label: `逾期 (${totalOverdueCount}次)`
      };
    }

    if (dueSoonPayments.length > 0) {
      return {
        type: 'due_soon' as const,
        count: dueSoonPayments.length,
        label: '待催款'
      };
    }

    return {
      type: 'normal' as const,
      count: 0,
      label: '还款正常'
    };
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-200 group"
      onClick={onClick}
    >
      {/* 分期客户还款状态标签 */}
      {paymentStatus && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            paymentStatus.type === 'overdue' 
              ? 'bg-red-100 text-red-600 border border-red-200' 
              : paymentStatus.type === 'due_soon'
              ? 'bg-yellow-100 text-yellow-600 border border-yellow-200'
              : 'bg-green-100 text-green-600 border border-green-200'
          }`}>
            {paymentStatus.type === 'overdue' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {paymentStatus.type === 'due_soon' && <Clock className="w-3 h-3 mr-1" />}
            {paymentStatus.type === 'normal' && <CheckCircle className="w-3 h-3 mr-1" />}
            {paymentStatus.label}
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
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">{customer.salesPerson || customer.assignedSales}</p>
              {customer.customerType && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  customer.customerType === 'retail' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {customer.customerType === 'retail' ? '零售' : '分期'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            customer.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {customer.gender === 'female' ? '女' : '男'}
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
        {customer.catName && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2">🐱</span>
            <span>{customer.catName} ({customer.catGender === 'male' ? '弟弟' : '妹妹'})</span>
          </div>
        )}
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
          {customer.customerType === 'installment' && customer.installmentPayments && (
            <span className="text-xs text-gray-500">
              还款: {customer.installmentPayments.filter(p => p.isPaid).length}/{customer.installmentPayments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;