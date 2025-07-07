import React, { useState, useRef } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { Customer, CustomerFile } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase';

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
    customerType: undefined as 'retail' | 'installment' | undefined,
    // 零售客户字段
    orderDate: '',
    salesPerson: '',
    catName: '',
    catBirthday: '',
    isMallMember: false,
    catBreed: '',
    catGender: undefined as 'male' | 'female' | undefined,
    supplyChain: '',
    supplyChainDeposit: 0,
    totalAmount: 0,
    paymentMethod: undefined as 'full_payment' | 'shipping_balance' | 'cash_on_delivery' | undefined,
    customerDeposit: 0,
    depositDestination: '',
    shippingDate: '',
    shippingVideo: '',
    balance: 0,
    balancePaid: false,
    balanceConfirmMethod: '',
    sellingPrice: 0,
    cost: 0,
    shippingFee: 0,
    profit: 0,
    profitRate: 0,
    // 分期客户字段
    contractName: '',
    relationship: '',
    isInGroup: false,
    repaymentDate: '',
    installmentPeriod: '',
    catCost: 0,
    collectionAmount: 0,
    fundsDestination: '',
    installmentAmount: 0,
    installmentCount: 0,
    signingMethod: '',
    isFirstPaymentManual: false,
    hasESignContract: false,
    contractTotalPrice: 0,
    mallGrossProfit: 0,
    grossProfit: 0,
    monthlyProfit: 0,
    breakEvenPeriod: 0
  });

  const [newTag, setNewTag] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileUploadType, setFileUploadType] = useState<'image' | 'video' | 'document'>('image');
  const [fileDescription, setFileDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'female',
      phone: '',
      wechat: '',
      address: '',
      occupation: '',
      tags: [],
      notes: '',
      customerType: undefined,
      // 零售客户字段
      orderDate: '',
      salesPerson: '',
      catName: '',
      catBirthday: '',
      isMallMember: false,
      catBreed: '',
      catGender: undefined,
      supplyChain: '',
      supplyChainDeposit: 0,
      totalAmount: 0,
      paymentMethod: undefined,
      customerDeposit: 0,
      depositDestination: '',
      shippingDate: '',
      shippingVideo: '',
      balance: 0,
      balancePaid: false,
      balanceConfirmMethod: '',
      sellingPrice: 0,
      cost: 0,
      shippingFee: 0,
      profit: 0,
      profitRate: 0,
      // 分期客户字段
      contractName: '',
      relationship: '',
      isInGroup: false,
      repaymentDate: '',
      installmentPeriod: '',
      catCost: 0,
      collectionAmount: 0,
      fundsDestination: '',
      installmentAmount: 0,
      installmentCount: 0,
      signingMethod: '',
      isFirstPaymentManual: false,
      hasESignContract: false,
      contractTotalPrice: 0,
      mallGrossProfit: 0,
      grossProfit: 0,
      monthlyProfit: 0,
      breakEvenPeriod: 0
    });
    setNewTag('');
    setShowFileUpload(false);
    setFileDescription('');
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

  // 处理文件选择 - 在新增客户时，需要先保存客户才能上传文件
  const handleFileSelect = () => {
    alert('请先保存客户信息，然后在客户详情页面添加文件');
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
              客户类型
            </label>
            <select
              value={formData.customerType || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                customerType: e.target.value ? e.target.value as 'retail' | 'installment' : undefined 
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择客户类型</option>
              <option value="retail">零售客户</option>
              <option value="installment">分期客户</option>
            </select>
          </div>

          {/* 根据客户类型显示不同的字段 */}
          {formData.customerType === 'retail' && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-800">零售客户信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    销售员
                  </label>
                  <select
                    value={formData.salesPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, salesPerson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择销售员</option>
                    {SALES_STAFF.map(staff => (
                      <option key={staff} value={staff}>{staff}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    订单日期
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪姓名
                  </label>
                  <input
                    type="text"
                    value={formData.catName}
                    onChange={(e) => setFormData(prev => ({ ...prev, catName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入猫咪姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪生日
                  </label>
                  <input
                    type="date"
                    value={formData.catBirthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, catBirthday: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.customerType === 'installment' && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-800">分期客户信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    销售员
                  </label>
                  <select
                    value={formData.salesPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, salesPerson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择销售员</option>
                    {SALES_STAFF.map(staff => (
                      <option key={staff} value={staff}>{staff}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    签约姓名
                  </label>
                  <input
                    type="text"
                    value={formData.contractName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入签约姓名"
                  />
                </div>
              </div>
            </div>
          )}

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

          {/* 文件上传部分 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">添加文件</h3>
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                {showFileUpload ? '取消' : '添加文件'}
              </button>
            </div>
            
            {showFileUpload && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <select
                      value={fileUploadType}
                      onChange={(e) => setFileUploadType(e.target.value as 'image' | 'video' | 'document')}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="image">图片</option>
                      <option value="video">检疫视频</option>
                      <option value="document">聊天记录</option>
                    </select>
                    <input
                      type="text"
                      value={fileDescription}
                      onChange={(e) => setFileDescription(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="文件描述（可选）"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept={fileUploadType === 'image' ? 'image/*' : fileUploadType === 'video' ? 'video/*' : '*/*'}
                      id="add-customer-file-input"
                    />
                    <label 
                      htmlFor="add-customer-file-input"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      选择{fileUploadType === 'image' ? '图片' : fileUploadType === 'video' ? '视频' : '文件'}
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              请先保存客户信息，然后在客户详情中添加文件
            </div>
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