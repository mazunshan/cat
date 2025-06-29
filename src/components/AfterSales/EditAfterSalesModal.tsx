import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, User, FileText, Tag, Plus, Star } from 'lucide-react';
import { AfterSalesRecord, Order, Customer, ServiceTemplate } from '../../types';

interface EditAfterSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recordId: string, recordData: Partial<AfterSalesRecord>) => void;
  record: AfterSalesRecord | null;
  orders: Order[];
  customers: Customer[];
  serviceTemplates: ServiceTemplate[];
}

const EditAfterSalesModal: React.FC<EditAfterSalesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  record,
  orders,
  customers,
  serviceTemplates
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
    assignedTo: '',
    scheduledDate: '',
    completedDate: '',
    customerSatisfaction: undefined as number | undefined,
    followUpRequired: false,
    followUpDate: '',
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({
        orderId: record.orderId,
        customerId: record.customerId,
        type: record.type,
        status: record.status,
        priority: record.priority,
        title: record.title,
        description: record.description,
        solution: record.solution || '',
        assignedTo: record.assignedTo,
        scheduledDate: record.scheduledDate || '',
        completedDate: record.completedDate || '',
        customerSatisfaction: record.customerSatisfaction,
        followUpRequired: record.followUpRequired,
        followUpDate: record.followUpDate || '',
        tags: [...(record.tags || [])]
      });
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!record) return;

    if (!formData.title || !formData.description) {
      alert('请填写所有必填字段');
      return;
    }

    // 如果状态改为已完成，自动设置完成时间
    const updateData: Partial<AfterSalesRecord> = {
      ...formData,
      completedDate: formData.status === 'completed' && !formData.completedDate 
        ? new Date().toISOString() 
        : formData.completedDate || undefined
    };

    onSave(record.id, updateData);
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

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">编辑售后服务记录</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                状态 *
              </label>
              <select
                required
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

            {/* 完成时间 */}
            {formData.status === 'completed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  完成时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.completedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, completedDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
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
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入解决方案"
            />
          </div>

          {/* 客户满意度评分 */}
          {formData.status === 'completed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客户满意度评分
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, customerSatisfaction: rating }))}
                    className={`p-1 rounded ${
                      formData.customerSatisfaction && formData.customerSatisfaction >= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.customerSatisfaction ? `${formData.customerSatisfaction} 星` : '未评分'}
                </span>
              </div>
            </div>
          )}

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

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAfterSalesModal;