import React from 'react';
import { X, Calendar, Clock, User, Phone, MessageSquare, Star, Tag, FileText, Edit, AlertTriangle } from 'lucide-react';
import { AfterSalesRecord, Customer, Order } from '../../types';

interface AfterSalesDetailProps {
  isOpen: boolean;
  onClose: () => void;
  record: AfterSalesRecord | null;
  customer: Customer | null;
  order: Order | null;
  onEdit: (record: AfterSalesRecord) => void;
}

const AfterSalesDetail: React.FC<AfterSalesDetailProps> = ({
  isOpen,
  onClose,
  record,
  customer,
  order,
  onEdit
}) => {
  if (!isOpen || !record) return null;

  // 获取状态标签样式
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'in_progress':
        return 'bg-blue-100 text-blue-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取优先级标签样式
  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-600';
      case 'high':
        return 'bg-orange-100 text-orange-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      case 'low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取服务类型图标
  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'phone_visit':
        return <Phone className="w-5 h-5" />;
      case 'health_consultation':
        return <MessageSquare className="w-5 h-5" />;
      case 'home_service':
        return <User className="w-5 h-5" />;
      case 'complaint':
        return <AlertTriangle className="w-5 h-5" />;
      case 'feedback':
        return <Star className="w-5 h-5" />;
      case 'maintenance':
        return <Clock className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  // 获取服务类型文本
  const getServiceTypeText = (type: string) => {
    const typeMap = {
      'phone_visit': '电话回访',
      'health_consultation': '健康咨询',
      'home_service': '上门服务',
      'complaint': '投诉处理',
      'feedback': '客户反馈',
      'maintenance': '维护服务'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap = {
      'pending': '待处理',
      'in_progress': '处理中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // 获取优先级文本
  const getPriorityText = (priority: string) => {
    const priorityMap = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'urgent': '紧急'
    };
    return priorityMap[priority as keyof typeof priorityMap] || priority;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getStatusBadgeStyle(record.status)}`}>
              {getServiceTypeIcon(record.type)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{record.title}</h2>
              <p className="text-gray-600">{getServiceTypeText(record.type)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(record)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="编辑记录"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">状态</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeStyle(record.status)}`}>
                  {getStatusText(record.status)}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">优先级</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityBadgeStyle(record.priority)}`}>
                  {getPriorityText(record.priority)}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">负责人</h3>
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{record.assignedTo}</span>
                </div>
              </div>
            </div>

            {/* 客户和订单信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customer && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">客户信息</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{customer.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{customer.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{customer.wechat}</span>
                    </div>
                  </div>
                </div>
              )}

              {order && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">关联订单</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">订单编号</span>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">订单金额</span>
                      <p className="font-medium text-gray-900">¥{order.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">订单日期</span>
                      <p className="font-medium text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 时间信息 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">时间信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">创建时间</span>
                  <p className="font-medium text-gray-900">
                    {new Date(record.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                
                {record.scheduledDate && (
                  <div>
                    <span className="text-sm text-gray-600">预约时间</span>
                    <p className="font-medium text-gray-900">
                      {new Date(record.scheduledDate).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}
                
                {record.completedDate && (
                  <div>
                    <span className="text-sm text-gray-600">完成时间</span>
                    <p className="font-medium text-gray-900">
                      {new Date(record.completedDate).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}
                
                {record.followUpRequired && record.followUpDate && (
                  <div>
                    <span className="text-sm text-gray-600">跟进日期</span>
                    <p className="font-medium text-gray-900">
                      {new Date(record.followUpDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 问题描述 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">问题描述</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {record.description}
              </p>
            </div>

            {/* 解决方案 */}
            {record.solution && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">解决方案</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {record.solution}
                </p>
              </div>
            )}

            {/* 客户满意度 */}
            {record.customerSatisfaction && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">客户满意度</h3>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`w-6 h-6 ${
                        rating <= record.customerSatisfaction!
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-3 text-lg font-medium text-gray-900">
                    {record.customerSatisfaction} / 5
                  </span>
                </div>
              </div>
            )}

            {/* 标签 */}
            {record.tags && record.tags.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {record.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 后续跟进 */}
            {record.followUpRequired && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">需要后续跟进</h3>
                {record.followUpDate && (
                  <p className="text-amber-700">
                    跟进日期: {new Date(record.followUpDate).toLocaleDateString('zh-CN')}
                  </p>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => onEdit(record)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑记录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfterSalesDetail;