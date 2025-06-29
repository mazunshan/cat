import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, User, FileText, Tag, Plus } from 'lucide-react';
import { AfterSalesRecord, Order, Customer, ServiceTemplate, User as UserType } from '../../types';

interface AddAfterSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<AfterSalesRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  orders: Order[];
  customers: Customer[];
  serviceTemplates: ServiceTemplate[];
  currentUser: UserType | null;
}

const AddAfterSalesModal: React.FC<AddAfterSalesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orders,
  customers,
  serviceTemplates,
  currentUser
}) => {
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    type: 'phone_visit' as AfterSalesRecord['type'],
    status: 'pending' as AfterSalesRecord['status'],
    priority: 'medium' as AfterSalesRecord['priority'],
    title: '',
    description: '',
    solution: '',
    assignedTo: currentUser?.name || '',
    scheduledDate: '',
    followUpRequired: false,
    followUpDate: '',
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderId || !formData.customerId || !formData.title || !formData.description) {
      alert('请填写所有必填字段');
      return;
    }

    const recordData: Omit<AfterSalesRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      createdBy: currentUser?.id || '',
      customerSatisfaction: undefined,
      completedDate: undefined,
      attachments: []
    };

    onSave(recordData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      customerId: '',
      type: 'phone_visit',
      status: 'pending',
      priority: 'medium',
      title: '',
      description: '',
      solution: '',
      assignedTo: currentUser?.name || '',
      scheduledDate: '',
      followUpRequired: false,
      followUpDate: '',
      tags: []
    });
    setNewTag('');
    setSelectedTemplate(null);
  };

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setFormData(prev => ({
        ...prev,
        orderId,
        customerId: order.customerId
      }));
    }
  };

  const handleTemplateSelect = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      type: template.type,
      priority: template.defaultPriority,
      title: template.name,
      description: template.description
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">新建售后服务记录</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 服务模板选择 */}
          {serviceTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择服务模板（可选）
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {serviceTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 border rounded-lg text-left hover:border-blue-300 transition-colors ${
                      selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{template.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      预计时长: {template.estimatedDuration}分钟
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 订单选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关联订单 *
              </label>
              <select
                required
                value={formData.orderId}
                onChange={(e) => handleOrderChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择订单</option>
                {orders.map(order => {
                  const customer = customers.find(c => c.id === order.customerId);
                  return (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} - {customer?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 服务类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                服务类型 *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AfterSalesRecord['type'] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="phone_visit">电话回访</option>
                <option value="health_consultation">健康咨询</option>
                <option value="home_service">上门服务</option>
                <option value="complaint">投诉处理</option>
                <option value="feedback">客户反馈</option>
                <option value="maintenance">维护服务</option>
              </select>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优先级 *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as AfterSalesRecord['priority'] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>

            {/* 状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as AfterSalesRecord['status'] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">待处理</option>
                <option value="in_progress">处理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            {/* 负责人 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                负责人 *
              </label>
              <input
                type="text"
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入负责人姓名"
              />
            </div>

            {/* 预约时间 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预约时间
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 服务标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              服务标题 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入服务标题"
            />
          </div>

          {/* 问题描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              问题描述 *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请详细描述问题或服务需求"
            />
          </div>

          {/* 解决方案 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              解决方案
            </label>
            <textarea
              value={formData.solution}
              onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入解决方案（可稍后填写）"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入标签"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 后续跟进 */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.followUpRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">需要后续跟进</span>
            </label>
            
            {formData.followUpRequired && (
              <div className="flex-1">
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* 显示选中的模板检查清单 */}
          {selectedTemplate && selectedTemplate.checklist.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3">服务检查清单</h4>
              <ul className="space-y-2">
                {selectedTemplate.checklist.map((item, index) => (
                  <li key={index} className="flex items-center text-sm text-blue-700">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              创建服务记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAfterSalesModal;