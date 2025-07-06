import React, { useState } from 'react';
import { X, Plus, Camera, Video, FileText, MessageCircle } from 'lucide-react';
import { Customer } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase';
import CustomerFileUpload from './CustomerFileUpload';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female' as 'male' | 'female',
    phone: '',
    wechat: '',
    address: '',
    occupation: '',
    tags: [] as string[],
    notes: '',
    assignedSales: SALES_STAFF[0] // 默认选择第一个销售员
  });

  // 文件上传相关状态
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileUploadType, setFileUploadType] = useState<'image' | 'video' | 'document' | 'communication'>('image');
  const [customerFiles, setCustomerFiles] = useState<Array<Omit<CustomerFile, 'id' | 'uploadedAt'>>>([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 将客户数据和文件一起保存
    onSave({
      ...formData,
      // 文件会在后续处理中添加到客户记录
    });
    
    // 重置表单
    setFormData({
      name: '',
      gender: 'female',
      phone: '',
      wechat: '',
      address: '',
      occupation: '',
      tags: [],
      notes: '',
      assignedSales: SALES_STAFF[0]
    });
    setCustomerFiles([]);
    setShowFileUpload(false);
    onClose();
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

  const handleFileUpload = (file: Omit<CustomerFile, 'id' | 'uploadedAt'>) => {
    setCustomerFiles(prev => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setCustomerFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">新增客户</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客户姓名 *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入客户姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="female">女</option>
                <option value="male">男</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话 *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入联系电话"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                微信号
              </label>
              <input
                type="text"
                value={formData.wechat}
                onChange={(e) => setFormData(prev => ({ ...prev, wechat: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入微信号"
              />
            </div>
          </div>

          {/* 客户文件上传 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                客户文件
              </label>
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                {showFileUpload ? '取消上传' : <><Plus className="w-4 h-4 mr-1" /> 添加文件</>}
              </button>
            </div>
            
            {/* 已添加的文件列表 */}
            {customerFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {customerFiles.map((file, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center">
                    {file.type === 'image' && <Camera className="w-4 h-4 text-blue-500 mr-2" />}
                    {file.type === 'video' && <Video className="w-4 h-4 text-green-500 mr-2" />}
                    {file.type === 'document' && <FileText className="w-4 h-4 text-orange-500 mr-2" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                      {file.description && (
                        <p className="text-xs text-gray-500 truncate">{file.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 文件上传区域 */}
            {showFileUpload && (
              <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setFileUploadType('image')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${
                      fileUploadType === 'image' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    图片
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileUploadType('video')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${
                      fileUploadType === 'video' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    视频
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileUploadType('document')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${
                      fileUploadType === 'document' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    文档
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileUploadType('communication')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${
                      fileUploadType === 'communication' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    沟通截图
                  </button>
                </div>
                
                <CustomerFileUpload 
                  onFileUpload={handleFileUpload}
                  fileType={fileUploadType}
                  title={
                    fileUploadType === 'image' ? '上传图片' : 
                    fileUploadType === 'video' ? '上传视频' : 
                    fileUploadType === 'document' ? '上传文档' : 
                    '上传沟通截图'
                  }
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              地址
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入详细地址"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              职业
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入职业"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分配销售
            </label>
            <select
              value={formData.assignedSales}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedSales: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SALES_STAFF.map(salesperson => (
                <option key={salesperson} value={salesperson}>
                  {salesperson}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              客户标签
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入客户备注信息"
            />
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
              保存客户
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;